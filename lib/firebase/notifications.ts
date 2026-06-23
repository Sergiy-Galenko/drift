import {
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  type DocumentData,
  type QueryDocumentSnapshot,
  type Unsubscribe,
  type WithFieldValue,
} from 'firebase/firestore';

import { db } from './config';
import type { NotificationDoc, NotificationItem, NotificationType } from '@/types/notification';

function notificationsRef(uid: string) {
  return collection(db, 'notifications', uid, 'items');
}

function notificationRef(uid: string, itemId: string) {
  return doc(db, 'notifications', uid, 'items', itemId);
}

function mapNotification(snapshot: QueryDocumentSnapshot<DocumentData>): NotificationItem {
  const data = snapshot.data() as NotificationDoc;
  return {
    ...data,
    id: data.id || snapshot.id,
    createdAt: data.createdAt.toDate(),
  };
}

export function subscribeNotifications(
  uid: string,
  onData: (items: NotificationItem[]) => void,
  onError: (message: string) => void,
): Unsubscribe {
  return onSnapshot(
    query(notificationsRef(uid), orderBy('createdAt', 'desc'), limit(50)),
    (snapshot) => onData(snapshot.docs.map(mapNotification)),
    (error) => onError(error.code),
  );
}

export async function createNotification(
  uid: string,
  input: {
    type: NotificationType;
    driftId?: string | null;
    driftText?: string | null;
    fromUid?: string | null;
    fromUsername?: string | null;
    data?: Record<string, unknown>;
  },
): Promise<void> {
  const ref = doc(notificationsRef(uid));
  const notification: WithFieldValue<NotificationDoc> = {
    id: ref.id,
    type: input.type,
    driftId: input.driftId ?? null,
    driftText: input.driftText ?? null,
    fromUid: input.fromUid ?? null,
    fromUsername: input.fromUsername ?? null,
    isRead: false,
    createdAt: serverTimestamp(),
    data: input.data ?? {},
  };
  await setDoc(ref, notification);
}

export async function markNotificationRead(uid: string, itemId: string): Promise<void> {
  await updateDoc(notificationRef(uid, itemId), { isRead: true });
}
