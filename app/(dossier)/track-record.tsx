import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { LocalizedText as Text } from '@/components/ui/LocalizedText';
import { useRouter } from 'expo-router';
import { eachDayOfInterval, format, startOfDay, subDays } from 'date-fns';

import { CasePanel } from '@/components/dossier/CasePanel';
import { DossierSkeleton } from '@/components/dossier/DossierSkeleton';
import { Header } from '@/components/navigation/Header';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Colors, F, R, S } from '@/constants/tokens';
import { subscribeAuthorDrifts } from '@/lib/firebase/drifts';
import { useAuthStore } from '@/stores/authStore';
import type { Drift } from '@/types/drift';

function dayKey(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export default function TrackRecordScreen() {
  const router = useRouter();
  const uid = useAuthStore((state) => state.profile?.uid);
  const profile = useAuthStore((state) => state.profile);
  const [drifts, setDrifts] = useState<Drift[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    setFailed(false);
    return subscribeAuthorDrifts(uid, (items) => {
      setDrifts(items);
      setLoading(false);
    }, () => {
      setFailed(true);
      setLoading(false);
    });
  }, [attempt, uid]);

  const heatmap = useMemo(() => {
    const today = startOfDay(new Date());
    const days = eachDayOfInterval({ start: subDays(today, 34), end: today });
    const activity = new Set(drifts.map((drift) => dayKey(drift.createdAt)));
    return days.map((day) => ({ key: dayKey(day), active: activity.has(dayKey(day)) }));
  }, [drifts]);
  const resolved = profile ? profile.driftsExecuted + profile.driftsFailed : 0;
  const fulfillmentRate = resolved > 0 && profile ? Math.round((profile.driftsExecuted / resolved) * 100) : 0;

  return (
    <View style={styles.root}>
      <Header title="TRACK RECORD" showBack />
      {loading ? <DossierSkeleton rows={4} /> : failed ? <ErrorState title="Record unavailable" message="The ledger could not be opened." onRetry={() => setAttempt((value) => value + 1)} /> : !profile ? <EmptyState title="No record" message="Sign in to open your ledger." /> : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <CasePanel style={styles.identityPanel}>
            <Text style={styles.kicker}>SUBJECT / @{profile.username}</Text>
            <Text style={styles.title} translate>ACCOUNTABILITY LEDGER</Text>
            <Text style={styles.subline}>{profile.streakCurrent} day active streak · best {profile.streakBest}</Text>
          </CasePanel>
          <CasePanel>
            <Text style={styles.panelTitle} translate>35-DAY LOG</Text>
            <View style={styles.heatmap}>
              {heatmap.map((day) => <View key={day.key} style={[styles.day, day.active ? styles.dayActive : null]} />)}
            </View>
            <Text style={styles.caption} translate>A mark records a case opened that day.</Text>
          </CasePanel>
          <View style={styles.metrics}>
            <CasePanel style={styles.metric}><Text style={styles.metricValue}>{fulfillmentRate}%</Text><Text style={styles.metricLabel} translate>FULFILLED</Text></CasePanel>
            <CasePanel style={styles.metric}><Text style={styles.metricValue}>{profile.driftsVotedOn}</Text><Text style={styles.metricLabel} translate>JURY DUTY</Text></CasePanel>
            <CasePanel style={styles.metric}><Text style={styles.metricValue}>{profile.reputationScore}</Text><Text style={styles.metricLabel} translate>REPUTATION</Text></CasePanel>
          </View>
          <View style={styles.links}>
            <Pressable onPress={() => router.push('/(dossier)/registry')} style={styles.link}><Text style={styles.linkText} translate>OPEN THE REGISTRY</Text></Pressable>
            <Pressable onPress={() => router.push('/(dossier)/summary')} style={styles.link}><Text style={styles.linkText} translate>WEEKLY CASE SUMMARY</Text></Pressable>
            <Pressable onPress={() => router.push('/(dossier)/vault')} style={styles.link}><Text style={styles.linkText} translate>OPEN CASE VAULT</Text></Pressable>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.wall },
  content: { gap: S.md, padding: S.lg, paddingBottom: S.x7 },
  identityPanel: { borderColor: Colors.slate },
  kicker: { color: Colors.slate, fontFamily: F.family.monoBold, fontSize: F.size.xs, letterSpacing: 0.5 },
  title: { color: Colors.ink, fontFamily: F.family.displayBold, fontSize: F.size.xl, marginTop: S.sm },
  subline: { color: Colors.slate, fontFamily: F.family.bodyRegular, fontSize: F.size.sm, marginTop: S.xs },
  panelTitle: { color: Colors.ink, fontFamily: F.family.monoBold, fontSize: F.size.xs, letterSpacing: 0.7 },
  heatmap: { flexDirection: 'row', flexWrap: 'wrap', gap: S.xs, marginTop: S.md },
  day: { width: 18, height: 18, borderWidth: S.px, borderColor: Colors.paperLine, borderRadius: R.xs },
  dayActive: { borderColor: Colors.ledger, backgroundColor: Colors.ledger },
  caption: { color: Colors.slate, fontFamily: F.family.bodyRegular, fontSize: F.size.xs, marginTop: S.sm },
  metrics: { flexDirection: 'row', gap: S.sm },
  metric: { flex: 1, minHeight: 94, justifyContent: 'space-between', padding: S.md },
  metricValue: { color: Colors.ink, fontFamily: F.family.displayBold, fontSize: F.size.xl },
  metricLabel: { color: Colors.slate, fontFamily: F.family.monoBold, fontSize: F.size.micro },
  links: { gap: S.sm },
  link: { borderWidth: S.px, borderColor: Colors.slate, borderRadius: R.sm, padding: S.md, alignItems: 'center' },
  linkText: { color: Colors.dossier, fontFamily: F.family.monoBold, fontSize: F.size.xs, letterSpacing: 0.4 },
});
