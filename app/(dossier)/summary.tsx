import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { format, startOfWeek, subWeeks } from 'date-fns';

import { CasePanel } from '@/components/dossier/CasePanel';
import { DossierSkeleton } from '@/components/dossier/DossierSkeleton';
import { InkStamp } from '@/components/dossier/InkStamp';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Header } from '@/components/navigation/Header';
import { Colors, F, S } from '@/constants/tokens';
import { subscribeAuthorDrifts } from '@/lib/firebase/drifts';
import { useAuthStore } from '@/stores/authStore';
import type { Drift } from '@/types/drift';

export default function CaseSummaryScreen() {
  const uid = useAuthStore((state) => state.profile?.uid);
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
      setLoading(false);
      setFailed(true);
    });
  }, [attempt, uid]);

  const week = useMemo(() => {
    const start = startOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 });
    const end = startOfWeek(new Date(), { weekStartsOn: 1 });
    const cases = drifts.filter((drift) => drift.createdAt >= start && drift.createdAt < end);
    return {
      start,
      fulfilled: cases.filter((drift) => drift.status === 'executed'),
      broken: cases.filter((drift) => drift.status === 'failed'),
      open: cases.filter((drift) => drift.status === 'active' || drift.status === 'proof_pending'),
    };
  }, [drifts]);

  return (
    <View style={styles.root}>
      <Header title="CASE SUMMARY" showBack />
      {loading ? <DossierSkeleton rows={3} /> : failed ? <ErrorState title="Summary unavailable" message="The weekly file could not be assembled." onRetry={() => setAttempt((value) => value + 1)} /> : !uid ? <EmptyState title="No case history" message="Sign in to open a weekly summary." /> : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <CasePanel style={styles.cover}>
            <Text style={styles.kicker}>WEEK OF {format(week.start, 'MMM d').toUpperCase()}</Text>
            <Text style={styles.title}>THE RECORD, NOT THE SPIN.</Text>
            <Text style={styles.description}>A compact account of last week’s public commitments.</Text>
          </CasePanel>
          <View style={styles.results}>
            <CasePanel style={styles.result}><InkStamp label="FULFILLED" tone="ledger" /><Text style={styles.count}>{week.fulfilled.length}</Text><Text style={styles.resultLabel}>CASES CLOSED</Text></CasePanel>
            <CasePanel style={styles.result}><InkStamp label="BROKEN" tone="oxblood" /><Text style={styles.count}>{week.broken.length}</Text><Text style={styles.resultLabel}>CASES MISSED</Text></CasePanel>
          </View>
          <CasePanel>
            <Text style={styles.section}>OPEN CARRYOVER</Text>
            {week.open.length === 0 ? <Text style={styles.emptyLine}>No unresolved cases from the period.</Text> : week.open.map((drift) => <Text key={drift.id} numberOfLines={2} style={styles.caseLine}>{drift.text}</Text>)}
          </CasePanel>
          {week.fulfilled.length === 0 && week.broken.length === 0 && week.open.length === 0 ? <EmptyState title="No cases last week" message="The next completed week will be filed here." /> : null}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.wall },
  content: { gap: S.md, padding: S.lg, paddingBottom: S.x7 },
  cover: { borderColor: Colors.slate },
  kicker: { color: Colors.slate, fontFamily: F.family.monoBold, fontSize: F.size.xs, letterSpacing: 0.5 },
  title: { color: Colors.ink, fontFamily: F.family.displayBold, fontSize: F.size.xl, marginTop: S.sm },
  description: { color: Colors.slate, fontFamily: F.family.bodyRegular, fontSize: F.size.sm, marginTop: S.xs },
  results: { flexDirection: 'row', gap: S.sm },
  result: { flex: 1, minHeight: 138, justifyContent: 'space-between', padding: S.md },
  count: { color: Colors.ink, fontFamily: F.family.displayBold, fontSize: F.size.x3, marginTop: S.md },
  resultLabel: { color: Colors.slate, fontFamily: F.family.monoBold, fontSize: F.size.micro },
  section: { color: Colors.ink, fontFamily: F.family.monoBold, fontSize: F.size.xs, letterSpacing: 0.5 },
  emptyLine: { color: Colors.slate, fontFamily: F.family.bodyRegular, fontSize: F.size.sm, marginTop: S.sm },
  caseLine: { borderTopWidth: S.px, borderTopColor: Colors.paperLine, color: Colors.ink, fontFamily: F.family.bodyRegular, fontSize: F.size.sm, marginTop: S.sm, paddingTop: S.sm },
});
