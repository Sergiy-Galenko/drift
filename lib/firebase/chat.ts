import {
  collection,
  doc,
  getDoc,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
  type Unsubscribe,
  type WithFieldValue,
} from 'firebase/firestore';

import { db } from './config';
import { nullableTimestampToDate, timestampToDate } from './timestamps';
import { getUserProfile } from './users';
import type { ChatMessage, ConversationDoc, ConversationPreview, MessageDoc } from '@/types/message';

function normalizeConversationParticipants(uidA: string, uidB: string): [string, string] {
  return [uidA, uidB].sort((left, right) => left.localeCompare(right)) as [string, string];
}

export function conversationIdFor(uidA: string, uidB: string): string {
  return normalizeConversationParticipants(uidA, uidB).join('__');
}

function conversationRef(conversationId: string) {
  return doc(db, 'conversations', conversationId);
}

function conversationsRef() {
  return collection(db, 'conversations');
}

function messagesRef(conversationId: string) {
  return collection(db, 'conversations', conversationId, 'messages');
}

function mapMessage(snapshot: QueryDocumentSnapshot<DocumentData>): ChatMessage {
  const data = snapshot.data({ serverTimestamps: 'estimate' }) as MessageDoc;
  return {
    ...data,
    id: data.id || snapshot.id,
    createdAt: timestampToDate(data.createdAt),
    readAt: nullableTimestampToDate(data.readAt),
  };
}

export async function getOrCreateConversation(uidA: string, uidB: string): Promise<string> {
  const conversationId = conversationIdFor(uidA, uidB);
  const ref = conversationRef(conversationId);
  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) {
    const [leftUid, rightUid] = normalizeConversationParticipants(uidA, uidB);
    const conversation: WithFieldValue<ConversationDoc> = {
      id: conversationId,
      participants: [leftUid, rightUid],
      lastMessage: null,
      lastMessageAt: null,
      lastMessageSenderUid: null,
      unreadCount: {
        [leftUid]: 0,
        [rightUid]: 0,
      },
      createdAt: serverTimestamp(),
    };
    await setDoc(ref, conversation);
  }

  return conversationId;
}

export function subscribeConversations(
  uid: string,
  onData: (items: ConversationPreview[]) => void,
  onError: (message: string) => void,
): Unsubscribe {
  return onSnapshot(
    query(conversationsRef(), where('participants', 'array-contains', uid), limit(50)),
    (snapshot) => {
      Promise.all(
        snapshot.docs.map(async (document) => {
          const data = document.data({ serverTimestamps: 'estimate' }) as ConversationDoc;
          const otherUid = data.participants.find((participant) => participant !== uid) ?? null;
          const otherUser = otherUid ? await getUserProfile(otherUid) : null;

          return {
            ...data,
            id: data.id || document.id,
            createdAt: timestampToDate(data.createdAt),
            lastMessageAt: nullableTimestampToDate(data.lastMessageAt),
            otherUser: otherUser
              ? {
                  uid: otherUser.uid,
                  username: otherUser.username,
                  avatarUrl: otherUser.avatarUrl,
                  reputationScore: otherUser.reputationScore,
                }
              : null,
            unread: data.unreadCount[uid] ?? 0,
          } satisfies ConversationPreview;
        }),
      )
        .then((items) =>
          onData(
            items.sort((left, right) => {
              const leftTime = left.lastMessageAt?.getTime() ?? left.createdAt.getTime();
              const rightTime = right.lastMessageAt?.getTime() ?? right.createdAt.getTime();
              return rightTime - leftTime;
            }),
          ),
        )
        .catch((error: unknown) => onError(String(error)));
    },
    (error) => onError(error.code),
  );
}

export function subscribeMessages(
  conversationId: string,
  onData: (items: ChatMessage[]) => void,
  onError: (message: string) => void,
): Unsubscribe {
  return onSnapshot(
    query(messagesRef(conversationId), orderBy('createdAt', 'asc'), limit(200)),
    (snapshot) => onData(snapshot.docs.map(mapMessage)),
    (error) => onError(error.code),
  );
}

export async function markConversationRead(conversationId: string, uid: string): Promise<void> {
  await updateDoc(conversationRef(conversationId), {
    [`unreadCount.${uid}`]: 0,
  });
}

type SendMessageInput = {
  senderUid: string;
  recipientUid: string;
  text: string;
};

export async function sendMessage({ senderUid, recipientUid, text }: SendMessageInput): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error('invalid-argument');
  }

  const conversationId = await getOrCreateConversation(senderUid, recipientUid);
  const nextRef = doc(messagesRef(conversationId));
  const message: WithFieldValue<MessageDoc> = {
    id: nextRef.id,
    senderUid,
    text: trimmed,
    mediaUrl: null,
    mediaType: null,
    sharedDriftId: null,
    isRead: false,
    readAt: null,
    createdAt: serverTimestamp(),
    isDeleted: false,
  };

  await setDoc(nextRef, message);
  await updateDoc(conversationRef(conversationId), {
    lastMessage: trimmed.slice(0, 140),
    lastMessageAt: serverTimestamp(),
    lastMessageSenderUid: senderUid,
    [`unreadCount.${senderUid}`]: 0,
    [`unreadCount.${recipientUid}`]: increment(1),
  });

  return conversationId;
}
