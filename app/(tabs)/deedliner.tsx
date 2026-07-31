import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Header } from '@/components/navigation/Header';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { CATEGORIES } from '@/constants/categories';
import { Colors, F, R, S } from '@/constants/tokens';
import { subscribeAuthorDrifts } from '@/lib/firebase/drifts';
import { useAuthStore } from '@/stores/authStore';
import type { Drift } from '@/types/drift';
import { formatCountdown } from '@/utils/countdown';

type DeadlineItem = Readonly<{
  drift: Drift;
  dueAt: Date;
  kind: 'vote' | 'proof';
}>;

function deadlineLabel(item: DeadlineItem, now: number): string {
  const countdown = formatCountdown(item.dueAt, now);
  return item.kind === 'proof' ? `PROOF DUE · ${countdown}` : `VOTING ENDS · ${countdown}`;
}

export default function DeedlinerScreen() {
  const router = useRouter();
  const uid = useAuthStore((state) => state.profile?.uid);
  const [drifts, setDrifts] = useState<Drift[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!uid) {
      setDrifts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    return subscribeAuthorDrifts(uid, (nextDrifts) => {
      setDrifts(nextDrifts);
      setLoading(false);
    }, () => setLoading(false));
  }, [uid]);

  const deadlines = useMemo<DeadlineItem[]>(() => {
    return drifts
      .flatMap<DeadlineItem>((drift): DeadlineItem[] => {
        if (drift.status === 'active') return [{ drift, dueAt: drift.expiresAt, kind: 'vote' as const }];
        if (drift.status === 'proof_pending' && drift.proofDeadline) {
          return [{ drift, dueAt: drift.proofDeadline, kind: 'proof' as const }];
        }
        return [];
      })
      .sort((a, b) => a.dueAt.getTime() - b.dueAt.getTime());
  }, [drifts]);

  return (
    <View style={styles.root}>
      <Header title="Deedliner" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.intro}>
          <Text style={styles.eyebrow}>YOUR COMMITMENTS</Text>
          <Text style={styles.title}>Keep your word on time.</Text>
          <Text style={styles.subtitle}>Voting and proof deadlines for the drifts you created.</Text>
        </View>

        {loading ? (
          <Spinner label="Loading deadlines" size="large" />
        ) : deadlines.length === 0 ? (
          <EmptyState title="Nothing due" message="Create a Drift and its voting or proof deadline will appear here." />
        ) : (
          <View style={styles.list}>
            {deadlines.map((item) => {
              const category = CATEGORIES[item.drift.category];
              const expired = item.dueAt.getTime() <= now;
              const proofPending = item.kind === 'proof';

              return (
                <Pressable
                  key={item.drift.id}
                  onPress={() => router.push({ pathname: '/(drift)/[id]', params: { id: item.drift.id } })}
                  style={({ pressed }) => [styles.card, pressed ? styles.cardPressed : null]}
                >
                  <View style={styles.cardTop}>
                    <Text style={[styles.deadline, expired ? styles.deadlineExpired : proofPending ? styles.deadlineProof : null]}>
                      {deadlineLabel(item, now)}
                    </Text>
                    <Text style={[styles.category, { color: category.color }]}>{category.label.toUpperCase()}</Text>
                  </View>
                  <Text numberOfLines={2} style={styles.driftText}>{item.drift.text}</Text>
                  <Text numberOfLines={1} style={styles.stake}>Stake: {item.drift.stake}</Text>
                  {proofPending ? (
                    <Pressable
                      onPress={(event) => {
                        event.stopPropagation();
                        router.push({ pathname: '/(drift)/proof/[id]', params: { id: item.drift.id } });
                      }}
                      style={styles.proofButton}
                    >
                      <Text style={styles.proofButtonText}>UPLOAD PROOF</Text>
                    </Pressable>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bgBase },
  content: { padding: S.lg, paddingBottom: S.x7, gap: S.xl },
  intro: { gap: S.sm },
  eyebrow: { color: Colors.accentVolt, fontFamily: F.family.monoBold, fontSize: F.size.xs, letterSpacing: 0.8 },
  title: { color: Colors.textPrimary, fontFamily: F.family.displayBold, fontSize: F.size.xl },
  subtitle: { color: Colors.textSecondary, fontFamily: F.family.bodyRegular, fontSize: F.size.base, lineHeight: F.size.base * F.lineHeight.normal },
  list: { gap: S.md },
  card: { gap: S.md, borderWidth: S.px, borderColor: Colors.strokeStrong, borderRadius: R.lg, backgroundColor: Colors.bgSurface, padding: S.lg },
  cardPressed: { backgroundColor: Colors.bgElevated },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: S.sm },
  deadline: { color: Colors.accentVolt, fontFamily: F.family.monoBold, fontSize: F.size.xs },
  deadlineProof: { color: Colors.accentAmber },
  deadlineExpired: { color: Colors.accentFire },
  category: { fontFamily: F.family.monoBold, fontSize: F.size.xs },
  driftText: { color: Colors.textPrimary, fontFamily: F.family.bodySemi, fontSize: F.size.md, lineHeight: F.size.md * F.lineHeight.normal },
  stake: { color: Colors.textSecondary, fontFamily: F.family.bodyRegular, fontSize: F.size.sm },
  proofButton: { alignSelf: 'flex-start', borderRadius: R.sm, backgroundColor: Colors.accentVolt, paddingHorizontal: S.md, paddingVertical: S.sm },
  proofButtonText: { color: Colors.black, fontFamily: F.family.monoBold, fontSize: F.size.xs },
});
