import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { Header } from '@/components/navigation/Header';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { Colors, F, R, S } from '@/constants/tokens';
import { useDrift } from '@/hooks/useDrift';

export default function VotersScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const driftId = typeof params.id === 'string' ? params.id : undefined;
  const { drift, loading } = useDrift(driftId);
  const voters = drift ? Object.entries(drift.voters) : [];

  return (
    <View style={styles.root}>
      <Header title="Voters" showBack />
      {loading ? (
        <Spinner label="Loading voters" />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {voters.map(([uid, vote]) => (
            <View key={uid} style={styles.row}>
              <Text style={styles.uid}>{uid.slice(0, 8)}</Text>
              <Text style={vote === 'yes' ? styles.yes : styles.no}>{vote.toUpperCase()}</Text>
            </View>
          ))}
          {voters.length === 0 ? <EmptyState title="No votes yet" message="The room is still quiet." /> : null}
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
    gap: S.md,
  },
  row: {
    borderRadius: R.md,
    borderWidth: S.px,
    borderColor: Colors.stroke,
    backgroundColor: Colors.bgSurface,
    padding: S.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  uid: {
    color: Colors.textSecondary,
    fontFamily: F.family.monoMedium,
    fontSize: F.size.sm,
  },
  yes: {
    color: Colors.voteYes,
    fontFamily: F.family.monoBold,
    fontSize: F.size.sm,
  },
  no: {
    color: Colors.voteNo,
    fontFamily: F.family.monoBold,
    fontSize: F.size.sm,
  },
});
