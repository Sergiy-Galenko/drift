import { useEffect, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ArrowRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { DriftCard } from '@/components/drift/DriftCard';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { colors } from '@/constants/colors';
import { fontFamily } from '@/constants/typography';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { useAuth } from '@/hooks/useAuth';
import type { Drift } from '@/types/drift';

function demoDrifts(): Drift[] {
  const now = Date.now();

  return [
    {
      id: 'demo-1',
      authorUid: 'demo',
      authorUsername: 'mara',
      text: 'Quit my job and move to Lisbon for 3 months?',
      stake: 'I book flights tonight. No take-backs.',
      votesYes: 24,
      votesNo: 11,
      voters: {},
      status: 'active',
      result: null,
      createdAt: new Date(now - 35 * 60 * 1000),
      expiresAt: new Date(now + 23 * 60 * 60 * 1000),
      proofUrl: null,
      proofUploadedAt: null,
      category: 'life',
      isAnonymous: false,
      viewCount: 204,
    },
    {
      id: 'demo-2',
      authorUid: 'demo',
      authorUsername: 'ghost',
      text: 'Tell my friend I caught feelings before Friday?',
      stake: 'I send the message before midnight.',
      votesYes: 18,
      votesNo: 21,
      voters: {},
      status: 'active',
      result: null,
      createdAt: new Date(now - 58 * 60 * 1000),
      expiresAt: new Date(now + 54 * 60 * 1000),
      proofUrl: null,
      proofUploadedAt: null,
      category: 'love',
      isAnonymous: true,
      viewCount: 98,
    },
  ];
}

export default function LandingScreen() {
  const router = useRouter();
  const auth = useAuth();
  const demos = useMemo(() => demoDrifts(), []);

  useEffect(() => {
    if (auth.profile) {
      router.replace('/feed');
    } else if (auth.needsUsername) {
      router.replace('/auth');
    }
  }, [auth.needsUsername, auth.profile, router]);

  if (!auth.initialized) {
    return <Spinner />;
  }

  return (
    <ScreenWrapper scroll>
      <Animated.View entering={FadeInDown.duration(180).withInitialValues({ opacity: 0, transform: [{ translateY: 8 }] })} style={styles.hero}>
        <Text style={styles.logo}>DRIFT</Text>
        <Text style={styles.headline}>
          Your life.{'\n'}Their vote.
        </Text>
        <Text style={styles.copy}>Post the decision. Let strangers vote. Commit to doing what wins.</Text>
      </Animated.View>

      <View style={styles.previewStack}>
        {demos.map((drift) => (
          <DriftCard key={drift.id} drift={drift} preview compact />
        ))}
      </View>

      <View style={styles.ctaStack}>
        <Button
          label="Start Drifting"
          variant="primary"
          fullWidth
          onPress={() => router.push('/auth')}
          leftIcon={<ArrowRight size={18} color={colors.base} />}
        />
        <Button label="Enter as Ghost" variant="ghost" fullWidth loading={auth.loading} onPress={auth.signInGuest} />
        {auth.error ? <Text style={styles.error}>{auth.error}</Text> : null}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingTop: 22,
    gap: 18,
  },
  logo: {
    color: colors.volt,
    fontFamily: fontFamily.displayBold,
    fontSize: 18,
    letterSpacing: 0,
  },
  headline: {
    color: colors.textPrimary,
    fontFamily: fontFamily.displayBold,
    fontSize: 54,
    lineHeight: 56,
    letterSpacing: 0,
  },
  copy: {
    color: colors.textMuted,
    fontFamily: fontFamily.bodyMedium,
    fontSize: 16,
    lineHeight: 23,
    maxWidth: 320,
  },
  previewStack: {
    gap: 14,
    marginTop: 28,
  },
  ctaStack: {
    gap: 12,
    marginTop: 24,
  },
  error: {
    color: colors.fire,
    fontFamily: fontFamily.bodyMedium,
    fontSize: 13,
  },
});
