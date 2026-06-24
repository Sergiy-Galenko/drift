import { useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { ChatInput } from '@/components/chat/ChatInput';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { Header } from '@/components/navigation/Header';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { Colors, S } from '@/constants/tokens';
import { useMessages } from '@/hooks/useMessages';

export default function ConversationScreen() {
  const params = useLocalSearchParams<{ conversationId?: string; uid?: string; username?: string }>();
  const conversationId = typeof params.conversationId === 'string' ? params.conversationId : undefined;
  const otherUid = typeof params.uid === 'string' ? params.uid : undefined;
  const username = typeof params.username === 'string' ? params.username : 'Conversation';
  const { items, loading, sending, postMessage, currentUid } = useMessages(conversationId, otherUid);
  const [draft, setDraft] = useState('');

  const send = async () => {
    const sent = await postMessage(draft);
    if (sent) {
      setDraft('');
    }
  };

  if (!conversationId) {
    return (
      <View style={styles.root}>
        <Header title="Conversation" showBack />
        <EmptyState title="Conversation missing" message="Open this screen from Messages or from a public profile." />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Header title={`@${username}`} showBack />
      {loading ? (
        <Spinner label="Loading conversation" />
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.content}
            renderItem={({ item }) => <MessageBubble message={item} isOwn={item.senderUid === currentUid} />}
            ListEmptyComponent={<EmptyState title="No messages yet" message="Say hello and start exchanging information." />}
          />
          <ChatInput value={draft} onChangeText={setDraft} onSend={() => void send()} disabled={sending} />
        </>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bgBase,
  },
  content: {
    padding: S.lg,
    gap: S.md,
  },
});
