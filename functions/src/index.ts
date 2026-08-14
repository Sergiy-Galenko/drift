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

type PushNotificationType = 'voting_started' | 'voting_last_hour' | 'proof_reminder' | 'proof_deadline' | 'weekly_recap';
type ExpoPushTicket = { status?: string; id?: string; message?: string; details?: { error?: string } };
type ExpoPushReceipt = { status?: string; message?: string; details?: { error?: string } };
type PendingPushReceipt = { uid: string; token: string; nextCheckAt?: Timestamp; expiresAt?: Timestamp };
type PollOption = { id: string; label: string };

export function pushContent(type: string, data: Record<string, unknown>) {
  switch (type as PushNotificationType) {
    case 'voting_started':
      return { title: 'Voting started', body: 'Your DRIFT is live. Collect votes before it closes.' };
    case 'voting_last_hour':
      return { title: 'One hour left to vote', body: 'Your DRIFT closes in one hour. Share it while votes are still open.' };
    case 'proof_reminder':
      {
        const result = typeof data.result === 'string' ? data.result : 'NO RESULT';
        return { title: 'Voting result is in', body: `The result is ${result === 'yes' || result === 'no' ? result.toUpperCase() : result}. Upload proof within 2 hours.` };
      }
    case 'proof_deadline':
      return { title: 'Proof deadline approaching', body: 'You have 30 minutes left to upload proof.' };
    case 'weekly_recap':
      return { title: 'Weekly case summary', body: `You closed ${Number(data.fulfilled ?? 0)} case${Number(data.fulfilled ?? 0) === 1 ? '' : 's'} this week.` };
    default:
      return null;
  }
}

function pollOptions(drift: FirebaseFirestore.DocumentData): PollOption[] {
  const options = Array.isArray(drift.pollOptions) ? drift.pollOptions : [];
  const valid = options.filter((option): option is PollOption => typeof option?.id === 'string' && /^option[1-4]$/.test(option.id) && typeof option.label === 'string');
  return valid.length >= 2 && valid.length <= 4 && new Set(valid.map((option) => option.id)).size === valid.length ? valid : [];
}

function resultLabel(drift: FirebaseFirestore.DocumentData, result: string | null): string {
  if (!result) return 'NO RESULT';
  return pollOptions(drift).find((option) => option.id === result)?.label ?? result.toUpperCase();
}

export function resolvePollResult(drift: FirebaseFirestore.DocumentData): string {
  if (drift.pollType === 'binary' || !drift.pollType) return (drift.votesYes ?? 0) >= (drift.votesNo ?? 0) ? 'yes' : 'no';
  const options = pollOptions(drift);
  if (options.length === 0) return 'no';
  const tallies = drift.optionTallies ?? {};
  return options.reduce((winner, option) => (tallies[option.id] ?? 0) > (tallies[winner.id] ?? 0) ? option : winner).id;
}

export function rankingPoints(options: PollOption[], ranking: string[]): Record<string, number> {
  return Object.fromEntries(ranking.map((optionId, index) => [optionId, options.length - index]));
}

async function sendPushNotification(uid: string, type: string, driftId: string | null, data: Record<string, unknown>) {
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

async function notify(uid: string, type: string, drift: FirebaseFirestore.DocumentData, driftId: string | null, data: Record<string, unknown> = {}) {
  const ref = db.collection('notifications').doc(uid).collection('items').doc();
  await ref.set({ id: ref.id, type, driftId, driftText: drift.text ?? null, fromUid: null, fromUsername: null, isRead: false, createdAt: FieldValue.serverTimestamp(), data });
  await sendPushNotification(uid, type, driftId, data);
}

function reputationTier(score: number) { return score <= 20 ? 'ghost' : score <= 40 ? 'low' : score <= 60 ? 'mid' : score <= 80 ? 'high' : 'legend'; }

function dayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

function weekKey(date = new Date()): string {
  const monday = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  monday.setUTCDate(monday.getUTCDate() - ((monday.getUTCDay() + 6) % 7));
  return monday.toISOString().slice(0, 10);
}

function previousDayKey(value: string): string {
  const previous = new Date(`${value}T00:00:00.000Z`);
  previous.setUTCDate(previous.getUTCDate() - 1);
  return dayKey(previous);
}

async function recordRetention(uid: string, key: 'created' | 'votes' | 'proofs'): Promise<void> {
  const ref = db.doc(`retention/${uid}`);
  const today = dayKey();
  const week = weekKey();
  await db.runTransaction(async (tx) => {
    const current = (await tx.get(ref)).data() ?? {};
    const daily = current.dayKey === today ? current.daily ?? {} : {};
    const weekly = current.weekKey === week ? current.weekly ?? {} : {};
    tx.set(ref, {
      uid,
      dayKey: today,
      weekKey: week,
      daily: { ...daily, [key]: Number(daily[key] ?? 0) + 1 },
      weekly: { ...weekly, [key]: Number(weekly[key] ?? 0) + 1 },
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });
  });
}

function nextStreak(user: FirebaseFirestore.DocumentData, today: string): { current: number; best: number } {
  const current = user.streakLastDate === today ? user.streakCurrent ?? 0 : user.streakLastDate === previousDayKey(today) ? (user.streakCurrent ?? 0) + 1 : 1;
  return { current, best: Math.max(user.streakBest ?? 0, current) };
}

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
      const result = resolvePollResult(drift);
      tx.update(snap.ref, { status: 'proof_pending', result, decidedAt: now, proofDeadline: Timestamp.fromMillis(now.toMillis() + PROOF_WINDOW_MS) });
    });
  }));
});

export const notifyVotingStarted = onDocumentCreated('drifts/{driftId}', async (event) => {
  const drift = event.data?.data();
  if (drift) {
    await Promise.all([
      notify(drift.authorUid, 'voting_started', drift, event.params.driftId),
      recordRetention(drift.authorUid, 'created'),
    ]);
  }
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
    await notify(drift.authorUid, 'proof_reminder', drift, event.params.driftId, { result: resultLabel(drift, drift.result) });
  }
});

export const finalizeExecutedDrift = onDocumentUpdated('drifts/{driftId}', async (event) => {
  const before = event.data?.before.data();
  const drift = event.data?.after.data();
  if (before?.status === 'executed' || drift?.status !== 'executed') return;

  const userRef = db.doc(`users/${drift.authorUid}`);
  const user = (await userRef.get()).data();
  if (user) {
    const score = Math.min(100, (user.reputationScore ?? 50) + 5);
    const streak = nextStreak(user, dayKey());
    const update = {
      reputationScore: score,
      reputationTier: reputationTier(score),
      driftsExecuted: FieldValue.increment(1),
      streakCurrent: streak.current,
      streakBest: streak.best,
      streakLastDate: dayKey(),
    };
    await userRef.update(update);
    await awardAchievements(drift.authorUid, { ...user, ...update, reputationScore: score, streakBest: streak.best });
  }

  await Promise.all([
    recordRetention(drift.authorUid, 'proofs'),
    notify(drift.authorUid, 'drift_executed', drift, event.params.driftId),
  ]);
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
  const uid = request.auth?.uid; const { driftId, vote } = request.data as { driftId?: string; vote?: unknown };
  if (!uid || !driftId) throw new HttpsError('invalid-argument', 'Invalid vote.');
  const limitRef = db.doc(`rateLimits/${uid}_vote`); const driftRef = db.doc(`drifts/${driftId}`);
  await db.runTransaction(async (tx) => {
    const [driftSnap, limitSnap] = await Promise.all([tx.get(driftRef), tx.get(limitRef)]);
    if (!driftSnap.exists) throw new HttpsError('not-found', 'Drift not found.'); const drift = driftSnap.data()!;
    if (drift.status !== 'active' || drift.authorUid === uid) throw new HttpsError('failed-precondition', 'Voting unavailable.');
    const last = limitSnap.data()?.at?.toMillis?.() ?? 0; if (Date.now() - last < 1000) throw new HttpsError('resource-exhausted', 'Slow down.');
    const pollType = drift.pollType ?? 'binary';
    const previous = drift.voters?.[uid];
    const updates: Record<string, unknown> = { voterIds: FieldValue.arrayUnion(uid) };

    if (pollType === 'binary') {
      if (vote !== 'yes' && vote !== 'no') throw new HttpsError('invalid-argument', 'Invalid vote.');
      updates[`voters.${uid}`] = vote;
      if (previous !== vote) {
        updates[vote === 'yes' ? 'votesYes' : 'votesNo'] = FieldValue.increment(1);
        if (previous === 'yes' || previous === 'no') updates[previous === 'yes' ? 'votesYes' : 'votesNo'] = FieldValue.increment(-1);
      }
    } else {
      const options = pollOptions(drift);
      if (options.length === 0) throw new HttpsError('failed-precondition', 'Poll options are unavailable.');
      const optionIds = options.map((option) => option.id);

      if (pollType === 'choice' || pollType === 'plan') {
        if (typeof vote !== 'string' || !optionIds.includes(vote)) throw new HttpsError('invalid-argument', 'Invalid option.');
        updates[`voters.${uid}`] = vote;
        if (previous !== vote) {
          updates[`optionTallies.${vote}`] = FieldValue.increment(1);
          if (typeof previous === 'string' && optionIds.includes(previous)) updates[`optionTallies.${previous}`] = FieldValue.increment(-1);
        }
      } else if (pollType === 'ranking') {
        if (!Array.isArray(vote) || vote.length !== optionIds.length || vote.some((optionId) => typeof optionId !== 'string') || new Set(vote).size !== optionIds.length || vote.some((optionId) => !optionIds.includes(optionId))) throw new HttpsError('invalid-argument', 'Rank every option once.');
        const nextRanking = vote as string[];
        updates[`voters.${uid}`] = nextRanking;
        const previousRanking = Array.isArray(previous) ? previous.filter((optionId): optionId is string => typeof optionId === 'string' && optionIds.includes(optionId)) : [];
        const nextPoints = rankingPoints(options, nextRanking);
        const previousPoints = previousRanking.length === optionIds.length ? rankingPoints(options, previousRanking) : {};
        for (const optionId of optionIds) {
          const delta = (nextPoints[optionId] ?? 0) - (previousPoints[optionId] ?? 0);
          if (delta !== 0) updates[`optionTallies.${optionId}`] = FieldValue.increment(delta);
        }
      } else {
        throw new HttpsError('failed-precondition', 'Unsupported poll type.');
      }
    }
    tx.update(driftRef, updates); tx.set(limitRef, { at: FieldValue.serverTimestamp() });
  });
  await recordRetention(uid, 'votes');
  return { ok: true };
});

export const recordView = onCall(async (request) => {
  const uid = request.auth?.uid; const { driftId } = request.data as { driftId?: string };
  if (!uid || !driftId) throw new HttpsError('invalid-argument', 'Invalid view.');
  const rateRef = db.doc(`rateLimits/${uid}_view_${driftId}`); const rate = await rateRef.get();
  if ((rate.data()?.at?.toMillis?.() ?? 0) + 60_000 > Date.now()) return { ok: true };
  await db.runTransaction(async (tx) => { tx.update(db.doc(`drifts/${driftId}`), { viewCount: FieldValue.increment(1) }); tx.set(rateRef, { at: FieldValue.serverTimestamp() }); }); return { ok: true };
});

export const recordShare = onCall(async (request) => {
  const uid = request.auth?.uid; const { driftId } = request.data as { driftId?: string };
  if (!uid || !driftId) throw new HttpsError('invalid-argument', 'Invalid share.');
  const rateRef = db.doc(`rateLimits/${uid}_share_${driftId}`); const rate = await rateRef.get();
  if ((rate.data()?.at?.toMillis?.() ?? 0) + 60_000 > Date.now()) return { ok: true };
  await db.runTransaction(async (tx) => { tx.update(db.doc(`drifts/${driftId}`), { shareCount: FieldValue.increment(1) }); tx.set(rateRef, { at: FieldValue.serverTimestamp() }); }); return { ok: true };
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
  if (!approved) {
    const userRef = db.doc(`users/${drift.authorUid}`); const user = (await userRef.get()).data();
    if (user) { const score = Math.max(0, (user.reputationScore ?? 50) - 10); await userRef.update({ reputationScore: score, reputationTier: reputationTier(score), driftsFailed: FieldValue.increment(1), streakCurrent: 0 }); }
    await notify(drift.authorUid, 'author_failed', drift, report.driftId, { moderationId: event.params.id });
  }
});

export const sendWeeklyRecaps = onSchedule('every monday 00:15', async () => {
  const previousWeek = weekKey(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
  const summaries = await db.collection('retention').where('weekKey', '==', previousWeek).limit(400).get();
  await Promise.all(summaries.docs.map(async (snapshot) => {
    const data = snapshot.data();
    const created = Number(data.weekly?.created ?? 0);
    const votes = Number(data.weekly?.votes ?? 0);
    const fulfilled = Number(data.weekly?.proofs ?? 0);
    if (created + votes + fulfilled === 0) return;
    await notify(snapshot.id, 'weekly_recap', { text: null }, null, { created, votes, fulfilled });
  }));
});

const ANALYTICS_EVENTS = new Set([
  'account_registered',
  'app_opened',
  'app_returned',
  'drift_created',
  'vote_cast',
  'case_opened',
  'roulette_spun',
  'proof_uploaded',
]);

export const trackAnalytics = onCall(async (request) => {
  const uid = request.auth?.uid;
  const { event, data } = request.data as { event?: unknown; data?: unknown };
  if (!uid || typeof event !== 'string' || !ANALYTICS_EVENTS.has(event)) {
    throw new HttpsError('invalid-argument', 'Invalid analytics event.');
  }

  const source = data && typeof data === 'object' ? data as Record<string, unknown> : {};
  const safeData = Object.fromEntries(Object.entries(source).slice(0, 8).flatMap(([key, value]) =>
    /^[a-z][a-z0-9_]{0,31}$/i.test(key) && (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean')
      ? [[key, typeof value === 'string' ? value.slice(0, 80) : value]]
      : [],
  ));
  await db.collection('analyticsEvents').add({ uid, event, data: safeData, createdAt: FieldValue.serverTimestamp() });
  return { ok: true };
});

export const appealProofDecision = onCall(async (request) => {
  const uid = request.auth?.uid; const { driftId, message } = request.data as { driftId?: string; message?: string }; if (!uid || !driftId || !message?.trim()) throw new HttpsError('invalid-argument', 'Appeal details required.');
  const drift = await db.doc(`drifts/${driftId}`).get(); if (!drift.exists || drift.data()?.authorUid !== uid) throw new HttpsError('permission-denied', 'Appeal unavailable.');
  await db.collection('proofAppeals').add({ driftId, authorUid: uid, message: message.trim().slice(0, 1000), status: 'open', createdAt: FieldValue.serverTimestamp() }); return { ok: true };
});
