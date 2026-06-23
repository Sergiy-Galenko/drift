import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Header } from '@/components/navigation/Header';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { Colors, F, R, S } from '@/constants/tokens';
import { useNotifications } from '@/hooks/useNotifications';
import { formatRelativeTime, notificationTitle } from '@/utils/formatters';

export default function ActivityScreen() {
  const { items, unreadCount, loading } = useNotifications();

  return (
    <View style={styles.root}>
      <Header title={`Activity${unreadCount > 0 ? ` (${unreadCount})` : ''}`} />
      {loading ? (
        <Spinner label="Loading activity" />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.sectionTitle}>FOLLOWING + NOTIFICATIONS</Text>
          {items.map((item) => (
            <View key={item.id} style={[styles.item, !item.isRead ? styles.unread : null]}>
              <Text style={styles.title}>{notificationTitle(item.type)}</Text>
              <Text style={styles.body}>{item.driftText ?? item.fromUsername ?? 'DRIFT event'}</Text>
              <Text style={styles.time}>{formatRelativeTime(item.createdAt)}</Text>
            </View>
          ))}
          {items.length === 0 ? <EmptyState title="No activity yet" message="Votes, follows, comments, and proof updates will land here." /> : null}
        </ScrollView>
      )}
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
    gap: S.lg,
  },
  sectionTitle: {
    color: Colors.textMuted,
    fontFamily: F.family.monoBold,
    fontSize: F.size.xs,
  },
  item: {
    borderRadius: R.md,
    borderWidth: S.px,
    borderColor: Colors.stroke,
    backgroundColor: Colors.bgSurface,
    padding: S.lg,
    gap: S.sm,
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
