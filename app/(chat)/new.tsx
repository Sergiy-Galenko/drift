import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Avatar } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/ui/EmptyState';
import { Header } from '@/components/navigation/Header';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { Colors, F, S } from '@/constants/tokens';
import { getOrCreateConversation } from '@/lib/firebase/chat';
import { searchUsers } from '@/lib/firebase/users';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import type { UserProfile } from '@/types/user';
import { firebaseErrorMessage } from '@/utils/formatters';
import { logger } from '@/utils/logger';

export default function NewConversationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ uid?: string; username?: string }>();
  const currentUid = useAuthStore((state) => state.firebaseUser?.uid);
  const pushToast = useUIStore((state) => state.pushToast);
  const directUid = typeof params.uid === 'string' ? params.uid : undefined;
  const directUsername = typeof params.username === 'string' ? params.username : undefined;
  const [term, setTerm] = useState('');
  const [results, setResults] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(Boolean(directUid));

  useEffect(() => {
    if (!currentUid || !directUid) {
      setLoading(false);
      return;
    }

    getOrCreateConversation(currentUid, directUid)
      .then((conversationId) => {
        router.replace({
          pathname: '/(chat)/[conversationId]',
          params: {
            conversationId,
            uid: directUid,
            username: directUsername ?? 'user',
          },
        });
      })
      .catch((error: unknown) => {
        logger.error('Conversation bootstrap failed', { error: String(error) });
        pushToast({ title: 'Chat unavailable', message: firebaseErrorMessage(String(error)), tone: 'danger' });
        setLoading(false);
      });
  }, [currentUid, directUid, directUsername, pushToast, router]);

  useEffect(() => {
    const normalizedTerm = term.trim();

    if (!normalizedTerm) {
      setResults([]);
      return undefined;
    }

    let mounted = true;
    const timeout = setTimeout(() => {
      searchUsers(normalizedTerm)
        .then((users) => {
          if (mounted) {
            setResults(users.filter((user) => user.uid !== currentUid));
          }
        })
        .catch((error: unknown) => {
          logger.error('User search failed', { error: String(error) });
        });
    }, 250);

    return () => {
      mounted = false;
      clearTimeout(timeout);
    };
  }, [currentUid, term]);

  if (loading) {
    return (
      <View style={styles.root}>
        <Header title="New message" showBack />
        <Spinner label="Opening conversation" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <Header title="New message" showBack />
      <ScrollView contentContainerStyle={styles.content}>
        <Input
          label="Search users"
          value={term}
          onChangeText={setTerm}
          placeholder="Search by username"
          autoCapitalize="none"
        />
        {results.map((user) => (
          <Pressable
            key={user.uid}
            onPress={() =>
              router.push({
                pathname: '/(chat)/new',
                params: { uid: user.uid, username: user.username },
              })
            }
            style={styles.row}
          >
            <Avatar username={user.username} avatarUrl={user.avatarUrl} reputationScore={user.reputationScore} size={44} />
            <View style={styles.textWrap}>
              <Text style={styles.username}>@{user.username}</Text>
              <Text style={styles.meta}>{user.followersCount} followers</Text>
            </View>
          </Pressable>
        ))}
        {term.trim().length > 0 && results.length === 0 ? <EmptyState title="No users found" message="Try another username." /> : null}
      </ScrollView>
    </View>
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.md,
    paddingVertical: S.sm,
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
  username: {
    color: Colors.textPrimary,
    fontFamily: F.family.bodySemi,
    fontSize: F.size.base,
  },
  meta: {
    color: Colors.textSecondary,
    fontFamily: F.family.bodyRegular,
    fontSize: F.size.sm,
  },
});
