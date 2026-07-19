import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { onDocumentCreated, onDocumentDeleted } from 'firebase-functions/v2/firestore';
import { initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore, Timestamp } from 'firebase-admin/firestore';

initializeApp();
const db = getFirestore();
const PROOF_WINDOW_MS = 2 * 60 * 60 * 1000;

async function notify(uid: string, type: string, drift: FirebaseFirestore.DocumentData, driftId: string, data: Record<string, unknown> = {}) {
  const ref = db.collection('notifications').doc(uid).collection('items').doc();
  await ref.set({ id: ref.id, type, driftId, driftText: drift.text ?? null, fromUid: null, fromUsername: null, isRead: false, createdAt: FieldValue.serverTimestamp(), data });
}

function reputationTier(score: number) { return score <= 20 ? 'ghost' : score <= 40 ? 'low' : score <= 60 ? 'mid' : score <= 80 ? 'high' : 'legend'; }

async function awardAchievements(uid: string, user: FirebaseFirestore.DocumentData) {
  const achievements = [
    ['first_proof', user.driftsExecuted >= 1, 'First proof'],
    ['streak_7', user.streakBest >= 7, 'Seven-day streak'],
    ['streak_30', user.streakBest >= 30, 'Thirty-day streak'],
    ['reputation_75', user.reputationScore >= 75, 'Trusted reputation'],
  ] as const;
  const batch = db.batch();
  for (const [id, unlocked, label] of achievements) if (unlocked) batch.set(db.doc(`users/${uid}/achievements/${id}`), { id, label, unlockedAt: FieldValue.serverTimestamp() }, { merge: true });
  await batch.commit();
}

export const settleExpiredDrifts = onSchedule('every 5 minutes', async () => {
  const now = Timestamp.now();
  const expired = await db.collection('drifts').where('status', '==', 'active').where('expiresAt', '<=', now).limit(400).get();
  await Promise.all(expired.docs.map(async (snap) => {
    const drift = snap.data(); const result = (drift.votesYes ?? 0) >= (drift.votesNo ?? 0) ? 'yes' : 'no';
    await snap.ref.update({ status: 'proof_pending', result, decidedAt: now, proofDeadline: Timestamp.fromMillis(now.toMillis() + PROOF_WINDOW_MS) });
    await notify(drift.authorUid, 'proof_reminder', drift, snap.id, { proofDeadline: now.toMillis() + PROOF_WINDOW_MS });
  }));
});

export const sendDeadlineReminders = onSchedule('every 15 minutes', async () => {
  const now = Date.now(); const soon = Timestamp.fromMillis(now + 30 * 60 * 1000);
  const pending = await db.collection('drifts').where('status', '==', 'proof_pending').where('proofDeadline', '<=', soon).limit(400).get();
  await Promise.all(pending.docs.map(async (snap) => {
    const drift = snap.data();
    if ((drift.proofDeadline as Timestamp).toMillis() <= now) {
      await snap.ref.update({ status: 'failed' });
      const userRef = db.doc(`users/${drift.authorUid}`); const user = (await userRef.get()).data();
      if (user) { const score = Math.max(0, (user.reputationScore ?? 50) - 10); await userRef.update({ reputationScore: score, reputationTier: reputationTier(score), streakCurrent: 0, driftsFailed: FieldValue.increment(1) }); }
      await notify(drift.authorUid, 'author_failed', drift, snap.id);
    } else await notify(drift.authorUid, 'proof_deadline', drift, snap.id, { proofDeadline: drift.proofDeadline.toMillis() });
  }));
});

export const castVote = onCall(async (request) => {
  const uid = request.auth?.uid; const { driftId, direction } = request.data as { driftId?: string; direction?: 'yes' | 'no' };
  if (!uid || !driftId || !['yes', 'no'].includes(direction ?? '')) throw new HttpsError('invalid-argument', 'Invalid vote.');
  const limitRef = db.doc(`rateLimits/${uid}_vote`); const driftRef = db.doc(`drifts/${driftId}`);
  await db.runTransaction(async (tx) => {
    const [driftSnap, limitSnap] = await Promise.all([tx.get(driftRef), tx.get(limitRef)]);
    if (!driftSnap.exists) throw new HttpsError('not-found', 'Drift not found.'); const drift = driftSnap.data()!;
    if (drift.status !== 'active' || drift.authorUid === uid) throw new HttpsError('failed-precondition', 'Voting unavailable.');
    const last = limitSnap.data()?.at?.toMillis?.() ?? 0; if (Date.now() - last < 1000) throw new HttpsError('resource-exhausted', 'Slow down.');
    const previous = drift.voters?.[uid]; const updates: Record<string, unknown> = { [`voters.${uid}`]: direction };
    if (previous !== direction) { updates[direction === 'yes' ? 'votesYes' : 'votesNo'] = FieldValue.increment(1); if (previous) updates[previous === 'yes' ? 'votesYes' : 'votesNo'] = FieldValue.increment(-1); }
    tx.update(driftRef, updates); tx.set(limitRef, { at: FieldValue.serverTimestamp() });
  });
  return { ok: true };
});

export const recordView = onCall(async (request) => {
  const uid = request.auth?.uid; const { driftId } = request.data as { driftId?: string };
  if (!uid || !driftId) throw new HttpsError('invalid-argument', 'Invalid view.');
  const rateRef = db.doc(`rateLimits/${uid}_view_${driftId}`); const rate = await rateRef.get();
  if ((rate.data()?.at?.toMillis?.() ?? 0) + 60_000 > Date.now()) return { ok: true };
  await db.runTransaction(async (tx) => { tx.update(db.doc(`drifts/${driftId}`), { viewCount: FieldValue.increment(1) }); tx.set(rateRef, { at: FieldValue.serverTimestamp() }); }); return { ok: true };
});

export const countBookmark = onDocumentCreated('bookmarks/{uid}/items/{driftId}', async (event) => {
  await db.doc(`drifts/${event.params.driftId}`).update({ bookmarkCount: FieldValue.increment(1) });
});
export const uncountBookmark = onDocumentDeleted('bookmarks/{uid}/items/{driftId}', async (event) => {
  await db.doc(`drifts/${event.params.driftId}`).update({ bookmarkCount: FieldValue.increment(-1) });
});

export const countFollow = onDocumentCreated('follows/{followId}', async (event) => {
  const follow = event.data?.data(); if (!follow) return;
  await Promise.all([db.doc(`users/${follow.followerId}`).update({ followingCount: FieldValue.increment(1) }), db.doc(`users/${follow.followingId}`).update({ followersCount: FieldValue.increment(1) })]);
});
export const uncountFollow = onDocumentDeleted('follows/{followId}', async (event) => {
  const follow = event.data?.data(); if (!follow) return;
  await Promise.all([db.doc(`users/${follow.followerId}`).update({ followingCount: FieldValue.increment(-1) }), db.doc(`users/${follow.followingId}`).update({ followersCount: FieldValue.increment(-1) })]);
});

export const moderateProof = onDocumentCreated('proofModeration/{id}', async (event) => {
  const report = event.data?.data(); if (!report) return; const driftRef = db.doc(`drifts/${report.driftId}`); const driftSnap = await driftRef.get(); if (!driftSnap.exists) return;
  const drift = driftSnap.data()!; const approved = report.decision === 'approved'; await driftRef.update({ status: approved ? 'executed' : 'failed', moderationStatus: approved ? 'approved' : 'rejected', moderatedAt: FieldValue.serverTimestamp() });
  const userRef = db.doc(`users/${drift.authorUid}`); const user = (await userRef.get()).data(); if (user) { const score = Math.max(0, Math.min(100, (user.reputationScore ?? 50) + (approved ? 5 : -10))); const update = { reputationScore: score, reputationTier: reputationTier(score), driftsExecuted: FieldValue.increment(approved ? 1 : 0), driftsFailed: FieldValue.increment(approved ? 0 : 1), streakCurrent: approved ? FieldValue.increment(1) : 0, streakBest: approved ? Math.max(user.streakBest ?? 0, (user.streakCurrent ?? 0) + 1) : user.streakBest ?? 0 }; await userRef.update(update); await awardAchievements(drift.authorUid, { ...user, ...update, reputationScore: score }); }
  await notify(drift.authorUid, approved ? 'drift_executed' : 'author_failed', drift, report.driftId, { moderationId: event.params.id });
});

export const appealProofDecision = onCall(async (request) => {
  const uid = request.auth?.uid; const { driftId, message } = request.data as { driftId?: string; message?: string }; if (!uid || !driftId || !message?.trim()) throw new HttpsError('invalid-argument', 'Appeal details required.');
  const drift = await db.doc(`drifts/${driftId}`).get(); if (!drift.exists || drift.data()?.authorUid !== uid) throw new HttpsError('permission-denied', 'Appeal unavailable.');
  await db.collection('proofAppeals').add({ driftId, authorUid: uid, message: message.trim().slice(0, 1000), status: 'open', createdAt: FieldValue.serverTimestamp() }); return { ok: true };
});
