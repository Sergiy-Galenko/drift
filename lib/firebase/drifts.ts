import {
  Timestamp,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
  type DocumentData,
  type DocumentSnapshot,
  type QueryConstraint,
  type QueryDocumentSnapshot,
  type Unsubscribe,
  type WithFieldValue,
} from 'firebase/firestore';
import { getDownloadURL, ref as storageRef, uploadBytesResumable } from 'firebase/storage';
import { getFunctions, httpsCallable } from 'firebase/functions';

import { app, db, storage } from './config';
import { nullableTimestampToDate, timestampToDate } from './timestamps';
import type { CategoryFilter } from '@/constants/categories';
import type { CreateDriftInput, Drift, DriftDoc, ReportDoc } from '@/types/drift';
import type { UserProfile } from '@/types/user';
import { isExpired } from '@/utils/countdown';

function driftsRef() {
  return collection(db, 'drifts');
}

function driftRef(driftId: string) {
  return doc(db, 'drifts', driftId);
}

function userRef(uid: string) {
  return doc(db, 'users', uid);
}

export function mapDrift(snapshot: QueryDocumentSnapshot<DocumentData> | DocumentSnapshot<DocumentData>): Drift | null {
  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data({ serverTimestamps: 'estimate' }) as DriftDoc;
  return {
    ...data,
    id: data.id || snapshot.id,
    createdAt: timestampToDate(data.createdAt),
    expiresAt: timestampToDate(data.expiresAt),
    decidedAt: nullableTimestampToDate(data.decidedAt),
    proofUploadedAt: nullableTimestampToDate(data.proofUploadedAt),
    proofDeadline: nullableTimestampToDate(data.proofDeadline),
    featuredAt: nullableTimestampToDate(data.featuredAt),
  };
}

export async function getDrift(driftId: string): Promise<Drift | null> {
  const snapshot = await getDoc(driftRef(driftId));
  return mapDrift(snapshot);
}

export function subscribeDrift(
  driftId: string,
  onData: (drift: Drift | null) => void,
  onError: (message: string) => void,
): Unsubscribe {
  return onSnapshot(driftRef(driftId), (snapshot) => onData(mapDrift(snapshot)), (error) => onError(error.code));
}

export function subscribeFeedDrifts(
  category: CategoryFilter,
  limitCount: number,
  onData: (drifts: Drift[]) => void,
  onError: (message: string) => void,
): Unsubscribe {
  const constraints: QueryConstraint[] = [where('status', 'in', ['active', 'decided', 'proof_pending'])];
  if (category !== 'all') {
    constraints.push(where('category', '==', category));
  }
  constraints.push(orderBy('createdAt', 'desc'), limit(limitCount));

  return onSnapshot(
    query(driftsRef(), ...constraints),
    (snapshot) => {
      onData(snapshot.docs.map((document) => mapDrift(document)).filter((drift): drift is Drift => drift !== null));
    },
    (error) => onError(error.code),
  );
}

export function subscribeFeaturedDrifts(
  onData: (drifts: Drift[]) => void,
  onError: (message: string) => void,
): Unsubscribe {
  return onSnapshot(
    query(driftsRef(), where('isFeatured', '==', true), orderBy('featuredAt', 'desc'), limit(8)),
    (snapshot) => {
      onData(snapshot.docs.map((document) => mapDrift(document)).filter((drift): drift is Drift => drift !== null));
    },
    (error) => onError(error.code),
  );
}

export function subscribeAuthorDrifts(
  uid: string,
  onData: (drifts: Drift[]) => void,
  onError: (message: string) => void,
): Unsubscribe {
  return onSnapshot(
    query(driftsRef(), where('authorUid', '==', uid), orderBy('createdAt', 'desc'), limit(30)),
    (snapshot) => onData(snapshot.docs.map((document) => mapDrift(document)).filter((drift): drift is Drift => drift !== null)),
    (error) => onError(error.code),
  );
}

export function subscribeVotedDrifts(
  uid: string,
  onData: (drifts: Drift[]) => void,
  onError: (message: string) => void,
): Unsubscribe {
  return onSnapshot(
    query(driftsRef(), where(`voters.${uid}`, 'in', ['yes', 'no']), orderBy('createdAt', 'desc'), limit(30)),
    (snapshot) => onData(snapshot.docs.map((document) => mapDrift(document)).filter((drift): drift is Drift => drift !== null)),
    (error) => onError(error.code),
  );
}

export async function createDrift(input: CreateDriftInput, author: UserProfile): Promise<string> {
  const nextRef = doc(driftsRef());
  const expiresAt = Timestamp.fromDate(new Date(Date.now() + 24 * 3600 * 1000));
  const drift: WithFieldValue<DriftDoc> = {
    id: nextRef.id,
    authorUid: author.uid,
    authorUsername: input.isAnonymous ? 'ghost' : author.username,
    authorReputationScore: author.reputationScore,
    text: input.text.trim(),
    stake: input.stake.trim(),
    context: input.context?.trim() || null,
    votesYes: 0,
    votesNo: 0,
    voters: {},
    status: 'active',
    result: null,
    createdAt: serverTimestamp(),
    expiresAt,
    decidedAt: null,
    proofUrl: null,
    proofType: null,
    proofUploadedAt: null,
    proofDeadline: null,
    category: input.category,
    tags: input.tags?.slice(0, 3) ?? [],
    isAnonymous: input.isAnonymous,
    viewCount: 0,
    shareCount: 0,
    bookmarkCount: 0,
    commentCount: 0,
    isFeatured: false,
    featuredAt: null,
    isNSFW: false,
    reportCount: 0,
  };

  const batch = writeBatch(db);
  batch.set(nextRef, drift);
  batch.update(userRef(author.uid), {
    driftsCreated: increment(1),
    lastActiveAt: serverTimestamp(),
  });
  await batch.commit();
  return nextRef.id;
}

export async function updateDrift(
  driftId: string,
  authorUid: string,
  input: CreateDriftInput,
): Promise<void> {
  await runTransaction(db, async (transaction) => {
    const ref = driftRef(driftId);
    const snapshot = await transaction.get(ref);
    const drift = snapshot.data() as DriftDoc | undefined;
    if (!drift || drift.authorUid !== authorUid) {
      throw new Error('permission-denied');
    }
    if (drift.status !== 'active') {
      throw new Error('failed-precondition');
    }

    transaction.update(ref, {
      text: input.text.trim(),
      stake: input.stake.trim(),
      context: input.context?.trim() || null,
      category: input.category,
      isAnonymous: input.isAnonymous,
      tags: input.tags?.slice(0, 3) ?? [],
    });
  });
}

export async function deleteDrift(driftId: string, authorUid: string): Promise<void> {
  await runTransaction(db, async (transaction) => {
    const ref = driftRef(driftId);
    const snapshot = await transaction.get(ref);
    const drift = snapshot.data() as DriftDoc | undefined;
    if (!drift || drift.authorUid !== authorUid) {
      throw new Error('permission-denied');
    }

    transaction.delete(ref);
    transaction.update(userRef(authorUid), { driftsCreated: increment(-1) });
  });
}

export async function incrementDriftView(driftId: string): Promise<void> {
  await httpsCallable<{ driftId: string }, { ok: boolean }>(getFunctions(app), 'recordView')({ driftId });
}

export async function incrementDriftShare(driftId: string): Promise<void> {
  await updateDoc(driftRef(driftId), { shareCount: increment(1) });
}

export async function settleExpiredDriftIfAuthor(drift: Drift, currentUid: string): Promise<void> {
  if (drift.authorUid !== currentUid || drift.status !== 'active' || !isExpired(drift.expiresAt)) {
    return;
  }

  const result = drift.votesYes >= drift.votesNo ? 'yes' : 'no';
  const decidedAt = Timestamp.now();
  await updateDoc(driftRef(drift.id), {
    status: 'proof_pending',
    result,
    decidedAt,
    proofDeadline: Timestamp.fromMillis(decidedAt.toMillis() + 2 * 3600 * 1000),
  });
}

export async function searchDrifts(term: string): Promise<Drift[]> {
  const normalized = term.trim();
  if (normalized.length === 0) {
    return [];
  }

  const snapshot = await getDocs(query(driftsRef(), orderBy('text'), where('text', '>=', normalized), where('text', '<=', `${normalized}\uf8ff`), limit(20)));
  return snapshot.docs.map((document) => mapDrift(document)).filter((drift): drift is Drift => drift !== null);
}

export type UploadProofInput = {
  driftId: string;
  authorUid: string;
  uri: string;
  contentType: string;
  onProgress?: (progress: number) => void;
};

export async function uploadDriftProof(input: UploadProofInput): Promise<string> {
  const response = await fetch(input.uri);
  const blob = await response.blob();
  const proofType = input.contentType.startsWith('video/') ? 'video' : 'image';
  const proofRef = storageRef(storage, `proofs/${input.driftId}`);
  const task = uploadBytesResumable(proofRef, blob, { contentType: input.contentType });

  await new Promise<void>((resolve, reject) => {
    task.on(
      'state_changed',
      (snapshot) => {
        const progress = snapshot.totalBytes > 0 ? snapshot.bytesTransferred / snapshot.totalBytes : 0;
        input.onProgress?.(progress);
      },
      reject,
      resolve,
    );
  });

  const proofUrl = await getDownloadURL(task.snapshot.ref);
  await runTransaction(db, async (transaction) => {
    const ref = driftRef(input.driftId);
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists()) {
      throw new Error('not-found');
    }
    const drift = snapshot.data() as DriftDoc;
    if (drift.authorUid !== input.authorUid) {
      throw new Error('permission-denied');
    }

    transaction.update(ref, {
      proofUrl,
      proofType,
      proofUploadedAt: serverTimestamp(),
      status: 'executed',
    });
  });

  return proofUrl;
}

export async function createReport(input: {
  driftId: string;
  reporterUid: string;
  reason: ReportDoc['reason'];
  details?: string | null;
}): Promise<void> {
  const nextRef = doc(collection(db, 'reports'));
  const report: WithFieldValue<ReportDoc> = {
    id: nextRef.id,
    driftId: input.driftId,
    reporterUid: input.reporterUid,
    reason: input.reason,
    details: input.details?.trim() || null,
    createdAt: serverTimestamp(),
    isResolved: false,
  };
  const batch = writeBatch(db);
  batch.set(nextRef, report);
  batch.update(driftRef(input.driftId), { reportCount: increment(1) });
  await batch.commit();
}
