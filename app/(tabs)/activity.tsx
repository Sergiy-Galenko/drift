import { useCallback, useEffect, useMemo, useState } from 'react';
import { InteractionManager, Pressable, StyleSheet, Text, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';

import { ActivitySkeleton } from '@/components/activity/ActivitySkeleton';
import { DriftCardCompact } from '@/components/drift/DriftCardCompact';
import { Header } from '@/components/navigation/Header';
import { ProfileShortcut } from '@/components/navigation/ProfileShortcut';
import { SearchShortcut } from '@/components/navigation/SearchShortcut';
import { EmptyState } from '@/components/ui/EmptyState';
import { Colors, F, R, S } from '@/constants/tokens';
import { useNotifications } from '@/hooks/useNotifications';
import { subscribeAuthorDrifts } from '@/lib/firebase/drifts';
import { useAuthStore } from '@/stores/authStore';
import type { NotificationItem } from '@/types/notification';
import type { Drift } from '@/types/drift';
import { formatRelativeTime, notificationTitle } from '@/utils/formatters';

type ActivityTab = 'mine' | 'updates';

function NotificationRow({
  item,
  onPress,
}: {
  item: NotificationItem;
  onPress: (item: NotificationItem) => void;
}) {
  return (
    <Pressable onPress={() => onPress(item)} style={[styles.item, !item.isRead ? styles.unread : null]}>
      <Text style={styles.title}>{notificationTitle(item.type)}</Text>
      <Text style={styles.body}>{item.driftText ?? item.fromUsername ?? 'DRIFT event'}</Text>
      <Text style={styles.time}>{formatRelativeTime(item.createdAt)}</Text>
    </Pressable>
  );
}

export default function ActivityScreen() {
  const router = useRouter();
  const profile = useAuthStore((state) => state.profile);
  const { items, unreadCount, loading, markRead } = useNotifications();
  const [tab, setTab] = useState<ActivityTab>('mine');
  const [myDrifts, setMyDrifts] = useState<Drift[]>([]);
  const [mineLoading, setMineLoading] = useState(true);

  useEffect(() => {
    if (!profile) {
      setMyDrifts([]);
      setMineLoading(false);
      return;
    }

    setMineLoading(true);
    let active = true;
    let unsubscribe: (() => void) | undefined;
    const task = InteractionManager.runAfterInteractions(() => {
      if (!active) {
        return;
      }

      unsubscribe = subscribeAuthorDrifts(
        profile.uid,
        (drifts) => {
          setMyDrifts(drifts);
          setMineLoading(false);
        },
        () => {
          setMineLoading(false);
        },
      );
    });

    return () => {
      active = false;
      task.cancel();
      unsubscribe?.();
    };
  }, [profile]);

  const tabs = useMemo(
    () => [
      { key: 'mine' as const, label: `My drifts${myDrifts.length > 0 ? ` (${myDrifts.length})` : ''}` },
      { key: 'updates' as const, label: `Updates${unreadCount > 0 ? ` (${unreadCount})` : ''}` },
    ],
    [myDrifts.length, unreadCount],
  );

  const openNotification = useCallback(
    (item: NotificationItem) => {
      if (!item.isRead) {
        void markRead(item.id);
      }

      if (item.driftId) {
        router.push({ pathname: '/(drift)/[id]', params: { id: item.driftId } });
      }
    },
    [markRead, router],
  );

  const currentLoading = tab === 'mine' ? mineLoading : loading;

  return (
    <View style={styles.root}>
      <Header
        title="Activity"
        right={
          <View style={styles.headerActions}>
            <SearchShortcut />
            <ProfileShortcut />
          </View>
        }
      />
      <View style={styles.tabs}>
        {tabs.map((item) => (
          <Pressable
            key={item.key}
            onPress={() => setTab(item.key)}
            style={[styles.tabButton, tab === item.key ? styles.tabButtonActive : null]}
          >
            <Text style={[styles.tabText, tab === item.key ? styles.tabTextActive : null]}>{item.label}</Text>
          </Pressable>
        ))}
      </View>
      {currentLoading && (tab === 'mine' ? myDrifts.length === 0 : items.length === 0) ? (
        <ActivitySkeleton />
      ) : tab === 'mine' ? (
        <FlashList
          data={myDrifts}
          drawDistance={600}
          overrideProps={{ initialDrawBatchSize: 5 }}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <DriftCardCompact drift={item} />}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState title="No drifts yet" message="Create your first public commitment from the center action button." />
          }
        />
      ) : (
        <FlashList
          data={items}
          drawDistance={480}
          overrideProps={{ initialDrawBatchSize: 5 }}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <NotificationRow item={item} onPress={openNotification} />}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState title="No activity yet" message="Votes, follows, comments, and proof updates will land here." />
          }
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
  tabs: {
    flexDirection: 'row',
    gap: S.sm,
    paddingHorizontal: S.md,
    paddingVertical: S.sm,
    borderBottomWidth: S.px,
    borderBottomColor: Colors.separator,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.xs,
  },
  tabButton: {
    flex: 1,
    height: 36,
    borderRadius: R.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceRaised,
  },
  tabButtonActive: {
    backgroundColor: Colors.white,
  },
  tabText: {
    color: Colors.textSecondary,
    fontFamily: F.family.bodySemi,
    fontSize: F.size.sm,
  },
  tabTextActive: {
    color: Colors.black,
  },
  content: {
    padding: S.lg,
    paddingBottom: S.x7,
  },
  item: {
    gap: S.sm,
    marginBottom: S.lg,
    borderRadius: R.md,
    borderWidth: S.px,
    borderColor: Colors.stroke,
    backgroundColor: Colors.bgSurface,
    padding: S.lg,
  },
  unread: {
    borderColor: Colors.accentVolt,
  },
  title: {
    color: Colors.textPrimary,
    fontFamily: F.family.bodySemi,
    fontSize: F.size.base,
  },
  body: {
    color: Colors.textSecondary,
    fontFamily: F.family.bodyRegular,
    fontSize: F.size.sm,
  },
  time: {
    color: Colors.textMuted,
    fontFamily: F.family.monoMedium,
    fontSize: F.size.xs,
  },
});
