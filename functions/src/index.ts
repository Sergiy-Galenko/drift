import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { onDocumentCreated, onDocumentDeleted, onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore, Timestamp } from 'firebase-admin/firestore';

initializeApp();
const db = getFirestore();
const PROOF_WINDOW_MS = 2 * 60 * 60 * 1000;
const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
const EXPO_RECEIPTS_URL = 'https://exp.host/--/api/v2/push/getReceipts';
const PUSH_RECEIPT_DELAY_MS = 15 * 60 * 1000;
const PUSH_RECEIPT_TTL_MS = 24 * 60 * 60 * 1000;

type PushNotificationType = 'voting_started' | 'voting_last_hour' | 'proof_reminder' | 'proof_deadline';
type ExpoPushTicket = { status?: string; id?: string; message?: string; details?: { error?: string } };
type ExpoPushReceipt = { status?: string; message?: string; details?: { error?: string } };
type PendingPushReceipt = { uid: string; token: string; nextCheckAt?: Timestamp; expiresAt?: Timestamp };

export function pushContent(type: string, data: Record<string, unknown>) {
  switch (type as PushNotificationType) {
    case 'voting_started':
      return { title: 'Voting started', body: 'Your DRIFT is live. Collect votes before it closes.' };
    case 'voting_last_hour':
      return { title: 'One hour left to vote', body: 'Your DRIFT closes in one hour. Share it while votes are still open.' };
    case 'proof_reminder':
      return { title: 'Voting result is in', body: `The result is ${data.result === 'yes' ? 'YES' : 'NO'}. Upload proof within 2 hours.` };
    case 'proof_deadline':
      return { title: 'Proof deadline approaching', body: 'You have 30 minutes left to upload proof.' };
    default:
      return null;
  }
}

async function sendPushNotification(uid: string, type: string, driftId: string, data: Record<string, unknown>) {
  const content = pushContent(type, data);
  if (!content) return;

  try {
    const userRef = db.doc(`users/${uid}`);
    const user = (await userRef.get()).data();
    const token = user?.expoPushToken;
    if (user?.settings?.notificationsEnabled !== true || typeof token !== 'string' || !/^(Exponent|Expo)PushToken\[.+\]$/.test(token)) return;

    const response = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: token, sound: 'default', channelId: 'default', ...content, data: { driftId, type } }),
    });
    if (!response.ok) {
      console.error('Expo push failed', await response.text());
      return;
    }

    const ticket = ((await response.json()) as { data?: ExpoPushTicket[] }).data?.[0];
    if (ticket?.status === 'ok' && ticket.id) {
      const now = Timestamp.now();
      await db.collection('pushReceipts').doc(ticket.id).set({
        uid,
        token,
        nextCheckAt: Timestamp.fromMillis(now.toMillis() + PUSH_RECEIPT_DELAY_MS),
        expiresAt: Timestamp.fromMillis(now.toMillis() + PUSH_RECEIPT_TTL_MS),
      });
    } else if (ticket?.status === 'error') {
      console.error('Expo push ticket failed', ticket.message ?? ticket.details?.error);
      if (ticket.details?.error === 'DeviceNotRegistered') await userRef.update({ expoPushToken: null });
    }
  } catch (error) {
    console.error('Expo push failed', error);
  }
}

async function notify(uid: string, type: string, drift: FirebaseFirestore.DocumentData, driftId: string, data: Record<string, unknown> = {}) {
  const ref = db.collection('notifications').doc(uid).collection('items').doc();
  await ref.set({ id: ref.id, type, driftId, driftText: drift.text ?? null, fromUid: null, fromUsername: null, isRead: false, createdAt: FieldValue.serverTimestamp(), data });
  await sendPushNotification(uid, type, driftId, data);
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
    await db.runTransaction(async (tx) => {
      const current = await tx.get(snap.ref);
      const drift = current.data();
      const expiresAt = drift?.expiresAt as Timestamp | undefined;
      if (!drift || drift.status !== 'active' || !expiresAt || expiresAt.toMillis() > now.toMillis()) return;
      const result = (drift.votesYes ?? 0) >= (drift.votesNo ?? 0) ? 'yes' : 'no';
      tx.update(snap.ref, { status: 'proof_pending', result, decidedAt: now, proofDeadline: Timestamp.fromMillis(now.toMillis() + PROOF_WINDOW_MS) });
    });
  }));
});

export const notifyVotingStarted = onDocumentCreated('drifts/{driftId}', async (event) => {
  const drift = event.data?.data();
  if (drift) await notify(drift.authorUid, 'voting_started', drift, event.params.driftId);
});

export const remindVotingLastHour = onSchedule('every 5 minutes', async () => {
  const now = Timestamp.now();
  const oneHourFromNow = Timestamp.fromMillis(now.toMillis() + 60 * 60 * 1000);
  const closingSoon = await db.collection('drifts')
    .where('status', '==', 'active')
    .where('expiresAt', '>=', now)
    .where('expiresAt', '<=', oneHourFromNow)
    .limit(400)
    .get();

  await Promise.all(closingSoon.docs.map(async (snap) => {
    const driftToNotify = await db.runTransaction<FirebaseFirestore.DocumentData | null>(async (tx) => {
      const current = await tx.get(snap.ref);
      const drift = current.data();
      const expiresAt = drift?.expiresAt as Timestamp | undefined;
      if (!drift || drift.status !== 'active' || drift.votingDurationHours === 1 || drift.votingLastHourNotifiedAt || !expiresAt || expiresAt.toMillis() < now.toMillis() || expiresAt.toMillis() > oneHourFromNow.toMillis()) return null;
      tx.update(snap.ref, { votingLastHourNotifiedAt: now });
      return drift;
    });
    if (driftToNotify) await notify(driftToNotify.authorUid, 'voting_last_hour', driftToNotify, snap.id);
  }));
});

export const notifyVotingResult = onDocumentUpdated('drifts/{driftId}', async (event) => {
  const before = event.data?.before.data();
  const drift = event.data?.after.data();
  if (before?.status === 'active' && drift?.status === 'proof_pending') {
    await notify(drift.authorUid, 'proof_reminder', drift, event.params.driftId, { result: drift.result });
  }
});

export const checkPushReceipts = onSchedule('every 15 minutes', async () => {
  const now = Timestamp.now();
  const pending = await db.collection('pushReceipts').where('nextCheckAt', '<=', now).orderBy('nextCheckAt').limit(400).get();
  if (pending.empty) return;

  let receipts: Record<string, ExpoPushReceipt>;
  try {
    const response = await fetch(EXPO_RECEIPTS_URL, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: pending.docs.map((snap) => snap.id) }),
    });
    if (!response.ok) {
      console.error('Expo receipt check failed', await response.text());
      return;
    }
    receipts = ((await response.json()) as { data?: Record<string, ExpoPushReceipt> }).data ?? {};
  } catch (error) {
    console.error('Expo receipt check failed', error);
    return;
  }

  const receiptBatch = db.batch();
  const invalidTokens = new Map<string, string>();
  for (const snap of pending.docs) {
    const ticket = snap.data() as PendingPushReceipt;
    const receipt = receipts[snap.id];
    const expired = !ticket.expiresAt || ticket.expiresAt.toMillis() <= now.toMillis();
    if (receipt) {
      receiptBatch.delete(snap.ref);
      if (receipt.details?.error === 'DeviceNotRegistered') invalidTokens.set(ticket.uid, ticket.token);
    } else if (expired) {
      receiptBatch.delete(snap.ref);
    } else {
      receiptBatch.update(snap.ref, { nextCheckAt: Timestamp.fromMillis(now.toMillis() + PUSH_RECEIPT_DELAY_MS) });
    }
  }
  await receiptBatch.commit();

  if (invalidTokens.size === 0) return;
  const userRefs = Array.from(invalidTokens.keys(), (uid) => db.doc(`users/${uid}`));
  const users = await db.getAll(...userRefs);
  const userBatch = db.batch();
  users.forEach((user) => {
    const token = invalidTokens.get(user.id);
    if (token && user.data()?.expoPushToken === token) userBatch.update(user.ref, { expoPushToken: null });
  });
  await userBatch.commit();
});

export const sendDeadlineReminders = onSchedule('every 15 minutes', async () => {
  const now = Date.now(); const soon = Timestamp.fromMillis(now + 30 * 60 * 1000);
  const pending = await db.collection('drifts').where('status', '==', 'proof_pending').where('proofDeadline', '<=', soon).limit(400).get();
  await Promise.all(pending.docs.map(async (snap) => {
    const action = await db.runTransaction<{ type: 'failed' | 'reminder'; drift: FirebaseFirestore.DocumentData } | null>(async (tx) => {
      const current = await tx.get(snap.ref);
      const drift = current.data();
      const proofDeadline = drift?.proofDeadline as Timestamp | undefined;
      if (!drift || drift.status !== 'proof_pending' || !proofDeadline) return null;
      if (proofDeadline.toMillis() <= now) {
        tx.update(snap.ref, { status: 'failed' });
        return { type: 'failed', drift };
      }
      if (drift.proofDeadlineReminderSentAt) return null;
      tx.update(snap.ref, { proofDeadlineReminderSentAt: Timestamp.now() });
      return { type: 'reminder', drift };
    });
    if (!action) return;

    if (action.type === 'failed') {
      const userRef = db.doc(`users/${action.drift.authorUid}`); const user = (await userRef.get()).data();
      if (user) { const score = Math.max(0, (user.reputationScore ?? 50) - 10); await userRef.update({ reputationScore: score, reputationTier: reputationTier(score), streakCurrent: 0, driftsFailed: FieldValue.increment(1) }); }
      await notify(action.drift.authorUid, 'author_failed', action.drift, snap.id);
    } else {
      await notify(action.drift.authorUid, 'proof_deadline', action.drift, snap.id, { proofDeadline: action.drift.proofDeadline.toMillis() });
    }
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
