import { useEffect, useState } from 'react';

import { subscribeConversations } from '@/lib/firebase/chat';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import type { ConversationPreview } from '@/types/message';
import { firebaseErrorMessage } from '@/utils/formatters';
import { logger } from '@/utils/logger';

export function useChat() {
  const uid = useAuthStore((state) => state.firebaseUser?.uid);
  const pushToast = useUIStore((state) => state.pushToast);
  const [items, setItems] = useState<ConversationPreview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    return subscribeConversations(
      uid,
      (conversations) => {
        setItems(conversations);
        setLoading(false);
      },
      (message) => {
        logger.error('Conversation subscription failed', { message });
        pushToast({ title: 'Messages unavailable', message: firebaseErrorMessage(message), tone: 'danger' });
        setLoading(false);
      },
    );
  }, [pushToast, uid]);

  return { items, loading };
}
