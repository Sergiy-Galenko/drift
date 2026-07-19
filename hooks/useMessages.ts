import { useCallback, useEffect, useState } from 'react';

import { markConversationRead, sendMessage, subscribeMessages } from '@/lib/firebase/chat';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import type { ChatMessage } from '@/types/message';
import { firebaseErrorMessage } from '@/utils/formatters';
import { logger } from '@/utils/logger';

export function useMessages(conversationId: string | undefined, otherUid: string | undefined) {
  const uid = useAuthStore((state) => state.firebaseUser?.uid);
  const pushToast = useUIStore((state) => state.pushToast);
  const [items, setItems] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!conversationId || !uid) {
      setItems([]);
      setLoading(false);
      return;
    }

    setItems([]);
    setLoading(true);
    const unsubscribe = subscribeMessages(
      conversationId,
      (messages) => {
        setItems(messages);
        setLoading(false);
      },
      (message) => {
        logger.error('Message subscription failed', { message });
        pushToast({ title: 'Messages unavailable', message: firebaseErrorMessage(message), tone: 'danger' });
        setLoading(false);
      },
    );

    void markConversationRead(conversationId, uid).catch((error: unknown) => {
      logger.warn('Mark conversation read failed', { error: String(error) });
    });

    return unsubscribe;
  }, [conversationId, pushToast, uid]);

  const postMessage = useCallback(
    async (text: string) => {
      if (!uid || !otherUid) {
        pushToast({ title: 'Message failed', message: 'Recipient unavailable.', tone: 'warning' });
        return false;
      }

      setSending(true);
      try {
        await sendMessage({ senderUid: uid, recipientUid: otherUid, text });
        return true;
      } catch (error) {
        logger.error('Send message failed', { error: String(error) });
        pushToast({ title: 'Message failed', message: firebaseErrorMessage(String(error)), tone: 'danger' });
        return false;
      } finally {
        setSending(false);
      }
    },
    [otherUid, pushToast, uid],
  );

  return {
    items,
    loading,
    sending,
    postMessage,
    currentUid: uid,
  };
}
