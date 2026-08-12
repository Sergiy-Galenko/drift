import { useRef, useState } from 'react';
import { Platform, Share, StyleSheet, View } from 'react-native';
import { LocalizedText as Text } from '@/components/ui/LocalizedText';
import { useLocalSearchParams } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';

import { Header } from '@/components/navigation/Header';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { CATEGORIES } from '@/constants/categories';
import { Colors, F, R, S } from '@/constants/tokens';
import { useDrift } from '@/hooks/useDrift';
import { incrementDriftShare } from '@/lib/firebase/drifts';
import { useUIStore } from '@/stores/uiStore';
import { firebaseErrorMessage, formatVoteCount } from '@/utils/formatters';
import { logger } from '@/utils/logger';
import { pollResultLabel, voteCount } from '@/utils/poll';

const CARD_SIZE = { width: 1080, height: 1920 };

function resultStatus(status: string): string {
  if (status === 'executed') return 'COMMITMENT KEPT';
  if (status === 'failed') return 'COMMITMENT MISSED';
  return 'VOTE COMPLETE';
}

export default function ShareResultScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const driftId = typeof params.id === 'string' ? params.id : undefined;
  const { drift, loading } = useDrift(driftId);
  const pushToast = useUIStore((state) => state.pushToast);
  const cardRef = useRef<View>(null);
  const [sharing, setSharing] = useState(false);

  const share = async () => {
    if (!drift?.result) return;

    const message = `${resultStatus(drift.status)} on DRIFT: ${drift.text}\nResult: ${pollResultLabel(drift)}`;
    setSharing(true);
    try {
      if (Platform.OS === 'web') {
        await Share.share({ message });
      } else {
        if (!cardRef.current || !(await Sharing.isAvailableAsync())) {
          throw new Error('Sharing is unavailable.');
        }
        const imageUri = await captureRef(cardRef, {
          format: 'png',
          quality: 1,
          result: 'tmpfile',
          ...CARD_SIZE,
        });
        await Sharing.shareAsync(imageUri, {
          mimeType: 'image/png',
          UTI: 'public.png',
          dialogTitle: 'Share DRIFT result',
        });
      }
      void incrementDriftShare(drift.id).catch((error: unknown) => {
        logger.warn('Share count failed', { error: String(error) });
      });
    } catch (error) {
      pushToast({ title: 'Could not share result', message: firebaseErrorMessage(String(error)), tone: 'danger' });
    } finally {
      setSharing(false);
    }
  };

  if (loading) {
    return <View style={styles.root}><Header title="Share result" showBack /><Spinner label="Preparing result" /></View>;
  }

  if (!drift?.result) {
    return <View style={styles.root}><Header title="Share result" showBack /><EmptyState title="Result not ready" message="The result card becomes available when voting closes." /></View>;
  }

  const category = CATEGORIES[drift.category];
  const kept = drift.status === 'executed';
  const missed = drift.status === 'failed';
  const accent = missed ? Colors.accentFire : kept ? Colors.accentVolt : Colors.accentIce;

  return (
    <View style={styles.root}>
      <Header title="Share result" showBack />
      <View style={styles.content}>
        <View ref={cardRef} collapsable={false} style={styles.cardFrame}>
          <View style={[styles.card, missed ? styles.cardMissed : kept ? styles.cardKept : null]}>
            <View style={styles.topLine}>
              <Text style={styles.brand} translate>DRIFT</Text>
              <Text style={[styles.category, { color: category.color }]}>{category.label.toUpperCase()}</Text>
            </View>

            <View style={styles.resultBlock}>
              <Text style={[styles.kicker, { color: accent }]}>{resultStatus(drift.status)}</Text>
              <Text numberOfLines={2} style={styles.result}>{pollResultLabel(drift)}</Text>
              <View style={[styles.resultRule, { backgroundColor: accent }]} />
            </View>

            <View style={styles.commitment}>
              <Text style={styles.label} translate>THE COMMITMENT</Text>
              <Text numberOfLines={5} style={styles.commitmentText}>{drift.text}</Text>
              <Text numberOfLines={2} style={styles.stake}>Stake: {drift.stake}</Text>
            </View>

            <View style={styles.stats}>
              <View style={styles.stat}>
                <Text style={[styles.statValue, { color: accent }]}>{formatVoteCount(voteCount(drift))}</Text>
                <Text style={styles.statLabel} translate>VOTES</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={[styles.statValue, { color: accent }]}>{kept ? 'KEPT' : missed ? 'MISSED' : 'PENDING'}</Text>
                <Text style={styles.statLabel}>{kept ? 'PROOF ACCEPTED' : missed ? 'DEADLINE MISSED' : 'PROOF PENDING'}</Text>
              </View>
            </View>

            <View style={styles.footer}>
              <Text style={styles.author}>@{drift.authorUsername}</Text>
              <Text style={styles.tagline} translate>People decide. You commit.</Text>
            </View>
          </View>
        </View>
        <Text style={styles.hint} translate>The image is ready to post in your favourite social app.</Text>
        <Button label="Share image" onPress={() => void share()} loading={sharing} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bgBase },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: S.lg, gap: S.lg },
  cardFrame: { width: '100%', maxWidth: 360, aspectRatio: 9 / 16, overflow: 'hidden', borderRadius: R.xl },
  card: { flex: 1, padding: S.x2, justifyContent: 'space-between', backgroundColor: Colors.dossier, borderWidth: S.px, borderColor: Colors.paperLine },
  cardKept: { borderColor: Colors.ledger },
  cardMissed: { borderColor: Colors.oxblood },
  topLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brand: { color: Colors.ink, fontFamily: F.family.displayBlack, fontSize: F.size.xl, letterSpacing: 2 },
  category: { fontFamily: F.family.monoBold, fontSize: F.size.xs, letterSpacing: 0.8 },
  resultBlock: { gap: S.md },
  kicker: { fontFamily: F.family.monoBold, fontSize: F.size.xs, letterSpacing: 1.2 },
  result: { color: Colors.ink, fontFamily: F.family.displayBlack, fontSize: F.size.hero, lineHeight: F.size.hero * F.lineHeight.tight },
  resultRule: { width: S.x6, height: S.xs, borderRadius: R.pill },
  commitment: { gap: S.md },
  label: { color: Colors.slate, fontFamily: F.family.monoBold, fontSize: F.size.xs, letterSpacing: 0.9 },
  commitmentText: { color: Colors.ink, fontFamily: F.family.displayBold, fontSize: F.size.x2, lineHeight: F.size.x2 * F.lineHeight.tight },
  stake: { color: Colors.slate, fontFamily: F.family.bodyRegular, fontSize: F.size.base, lineHeight: F.size.base * F.lineHeight.normal },
  stats: { flexDirection: 'row', borderTopWidth: S.px, borderBottomWidth: S.px, borderColor: Colors.paperLine, paddingVertical: S.lg },
  stat: { flex: 1, alignItems: 'center', gap: S.xs },
  statDivider: { width: S.px, backgroundColor: Colors.paperLine },
  statValue: { fontFamily: F.family.displayBlack, fontSize: F.size.x3 },
  statLabel: { color: Colors.slate, fontFamily: F.family.monoBold, fontSize: F.size.micro, textAlign: 'center' },
  footer: { gap: S.xs },
  author: { color: Colors.ink, fontFamily: F.family.bodySemi, fontSize: F.size.sm },
  tagline: { color: Colors.slate, fontFamily: F.family.bodyRegular, fontSize: F.size.xs },
  hint: { color: Colors.textSecondary, fontFamily: F.family.bodyRegular, fontSize: F.size.sm, textAlign: 'center' },
});
