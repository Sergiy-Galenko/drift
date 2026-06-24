import { FlatList, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { ConversationRow } from '@/components/chat/ConversationRow';
import { PaperPlaneIcon } from '@/components/icons';
import { Header } from '@/components/navigation/Header';
import { Divider } from '@/components/ui/Divider';
import { EmptyState } from '@/components/ui/EmptyState';
import { IconButton } from '@/components/ui/IconButton';
import { Spinner } from '@/components/ui/Spinner';
import { Colors } from '@/constants/tokens';
import { useChat } from '@/hooks/useChat';

export default function ChatInboxScreen() {
  const router = useRouter();
  const { items, loading } = useChat();

  return (
    <View style={styles.root}>
      <Header
        title="Messages"
        showBack
        right={<IconButton icon={PaperPlaneIcon} label="New message" onPress={() => router.push('/(chat)/new')} />}
      />
      {loading ? (
        <Spinner label="Loading messages" />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ConversationRow
              conversation={item}
              onPress={() =>
                router.push({
                  pathname: '/(chat)/[conversationId]',
                  params: {
                    conversationId: item.id,
                    uid: item.otherUser?.uid ?? '',
                    username: item.otherUser?.username ?? '',
                  },
                })
              }
            />
          )}
          ItemSeparatorComponent={Divider}
          ListEmptyComponent={<EmptyState title="No conversations yet" message="Follow people and start private conversations from their profile." />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bgBase,
  },
});
