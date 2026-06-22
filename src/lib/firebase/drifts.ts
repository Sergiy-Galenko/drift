import {
  Timestamp,
  collection,
  doc,
  getDoc,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  updateDoc,
  where,
  writeBatch,
  type DocumentData,
  type DocumentSnapshot,
  type QueryConstraint,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { getDownloadURL, ref as storageRef, uploadBytesResumable } from 'firebase/storage';

import type { CategoryFilter } from '@/constants/categories';
import { getDb, getFirebaseStorage, isMockBackend } from '@/lib/firebase/config';
import {
  mockCreateDrift,
  mockGetDrift,
  mockIncrementDriftView,
  mockSettleExpiredDriftIfAuthor,
  mockUploadDriftProof,
  subscribeMockActiveDrifts,
  subscribeMockCreatedDrifts,
  subscribeMockDrift,
  subscribeMockVotedDrifts,
} from '@/lib/mock/backend';
import type { AppUser, FirestoreUser } from '@/types/user';
import type { CreateDriftInput, Drift, FirestoreDrift } from '@/types/drift';
import { isExpired } from '@/utils/countdown';
import { calcReputationOnSuccess } from '@/utils/reputation';
import { proofFileName } from '@/utils/upload';

function driftsCollectionRef() {
  return collection(getDb(), 'drifts');
}

function driftDocumentRef(driftId: string) {
  return doc(getDb(), 'drifts', driftId);
}

function userDocumentRef(uid: string) {
  return doc(getDb(), 'users', uid);
}

function mapDriftData(snapshot: QueryDocumentSnapshot<DocumentData> | DocumentSnapshot<DocumentData>): Drift | null {
  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data() as FirestoreDrift;

  return {
    ...data,
    id: data.id || snapshot.id,
    createdAt: data.createdAt.toDate(),
    expiresAt: data.expiresAt.toDate(),
    proofUploadedAt: data.proofUploadedAt ? data.proofUploadedAt.toDate() : null,
  };
}

export async function getDrift(driftId: string): Promise<Drift | null> {
  if (isMockBackend) {
    return mockGetDrift(driftId);
  }

  const snapshot = await getDoc(driftDocumentRef(driftId));
  return mapDriftData(snapshot);
}

export function subscribeActiveDrifts(
  category: CategoryFilter,
  limitCount: number,
  onData: (drifts: Drift[]) => void,
  onError: (message: string) => void,
): () => void {
  if (isMockBackend) {
    return subscribeMockActiveDrifts(category, limitCount, onData);
  }

  const constraints: QueryConstraint[] = [where('status', '==', 'active')];

  if (category !== 'all') {
    constraints.push(where('category', '==', category));
  }

  constraints.push(orderBy('createdAt', 'desc'), limit(limitCount));

  return onSnapshot(
    query(driftsCollectionRef(), ...constraints),
    (snapshot) => {
      onData(snapshot.docs.map((document) => mapDriftData(document)).filter((drift): drift is Drift => drift !== null));
    },
    (error) => onError(error.message),
  );
}

export function subscribeDrift(
  driftId: string,
  onData: (drift: Drift | null) => void,
  onError: (message: string) => void,
): () => void {
  if (isMockBackend) {
    return subscribeMockDrift(driftId, onData);
  }

  return onSnapshot(
    driftDocumentRef(driftId),
    (snapshot) => onData(mapDriftData(snapshot)),
    (error) => onError(error.message),
  );
}

export async function createDrift(input: CreateDriftInput, author: AppUser): Promise<string> {
  if (isMockBackend) {
    return mockCreateDrift(input, author);
  }

  const driftRef = doc(driftsCollectionRef());
  const now = Timestamp.now();
  const expiresAt = Timestamp.fromMillis(now.toMillis() + 24 * 60 * 60 * 1000);

  const drift: FirestoreDrift = {
    id: driftRef.id,
    authorUid: author.uid,
    authorUsername: input.isAnonymous ? 'ghost' : author.username,
    text: input.text.trim(),
    stake: input.stake.trim(),
    votesYes: 0,
    votesNo: 0,
    voters: {},
    status: 'active',
    result: null,
    createdAt: now,
    expiresAt,
    proofUrl: null,
    proofUploadedAt: null,
    category: input.category,
    isAnonymous: input.isAnonymous,
    viewCount: 0,
  };

  const batch = writeBatch(getDb());
  batch.set(driftRef, drift);
  batch.update(userDocumentRef(author.uid), {
    driftsCreated: increment(1),
  });
  await batch.commit();

  return driftRef.id;
}

export async function incrementDriftView(driftId: string): Promise<void> {
  if (isMockBackend) {
    return mockIncrementDriftView(driftId);
  }

  await updateDoc(driftDocumentRef(driftId), {
    viewCount: increment(1),
  });
}

export async function settleExpiredDriftIfAuthor(drift: Drift, currentUid: string): Promise<void> {
  if (isMockBackend) {
    return mockSettleExpiredDriftIfAuthor(drift, currentUid);
  }

  if (drift.authorUid !== currentUid || drift.status !== 'active' || !isExpired(drift.expiresAt)) {
    return;
  }

  await updateDoc(driftDocumentRef(drift.id), {
    status: 'decided',
    result: drift.votesYes >= drift.votesNo ? 'yes' : 'no',
  });
}

export function subscribeCreatedDrifts(
  uid: string,
  onData: (drifts: Drift[]) => void,
  onError: (message: string) => void,
): () => void {
  if (isMockBackend) {
    return subscribeMockCreatedDrifts(uid, onData);
  }

  const createdQuery = query(driftsCollectionRef(), where('authorUid', '==', uid), orderBy('createdAt', 'desc'), limit(20));

  return onSnapshot(
    createdQuery,
    (snapshot) => {
      onData(snapshot.docs.map((document) => mapDriftData(document)).filter((drift): drift is Drift => drift !== null));
    },
    (error) => onError(error.message),
  );
}

export function subscribeVotedDrifts(
  uid: string,
  onData: (drifts: Drift[]) => void,
  onError: (message: string) => void,
): () => void {
  if (isMockBackend) {
    return subscribeMockVotedDrifts(uid, onData);
  }

  const votedQuery = query(
    driftsCollectionRef(),
    where(`voters.${uid}`, 'in', ['yes', 'no']),
    orderBy('createdAt', 'desc'),
    limit(20),
  );

  return onSnapshot(
    votedQuery,
    (snapshot) => {
      onData(snapshot.docs.map((document) => mapDriftData(document)).filter((drift): drift is Drift => drift !== null));
    },
    (error) => onError(error.message),
  );
}

export type UploadProofInput = {
  driftId: string;
  authorUid: string;
  uri: string;
  contentType: string;
  onProgress?: (progress: number) => void;
};

export async function uploadDriftProof(input: UploadProofInput): Promise<string> {
  if (isMockBackend) {
    return mockUploadDriftProof(input.driftId, input.authorUid, input.uri);
  }

  const response = await fetch(input.uri);
  const blob = await response.blob();
  const fileName = proofFileName(input.uri, input.contentType);
  const proofRef = storageRef(getFirebaseStorage(), `proofs/${input.authorUid}/${input.driftId}/${fileName}`);
  const task = uploadBytesResumable(proofRef, blob, {
    contentType: input.contentType,
  });

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

  await runTransaction(getDb(), async (transaction) => {
    const driftRef = driftDocumentRef(input.driftId);
    const userRef = userDocumentRef(input.authorUid);
    const driftSnapshot = await transaction.get(driftRef);
    const userSnapshot = await transaction.get(userRef);

    if (!driftSnapshot.exists()) {
      throw new Error('Drift no longer exists.');
    }

    const drift = driftSnapshot.data() as FirestoreDrift;

    if (drift.authorUid !== input.authorUid) {
      throw new Error('Only the author can upload proof.');
    }

    if (drift.status !== 'decided' || drift.proofUrl) {
      throw new Error('Proof is not available for this drift.');
    }

    const user = userSnapshot.exists() ? (userSnapshot.data() as FirestoreUser) : null;

    transaction.update(driftRef, {
      status: 'executed',
      proofUrl,
      proofUploadedAt: Timestamp.now(),
    });

    if (user) {
      transaction.update(userRef, {
        reputationScore: calcReputationOnSuccess(user.reputationScore),
        driftsExecuted: increment(1),
        streakCurrent: increment(1),
        streakBest: Math.max(user.streakBest, user.streakCurrent + 1),
      });
    }
  });

  return proofUrl;
}
