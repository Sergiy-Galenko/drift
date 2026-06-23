import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { GoogleMarkIcon } from '@/components/icons';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Colors, F, S } from '@/constants/tokens';
import { useAuth } from '@/hooks/useAuth';

export default function LoginScreen() {
  const { firebaseUser, profile, loading, signInGuest, signInGoogle, completeProfile } = useAuth();
  const [username, setUsername] = useState('');
  const [savingUsername, setSavingUsername] = useState(false);
  const underline = useSharedValue(0);

  useEffect(() => {
    underline.value = withSpring(1, { damping: 14 });
  }, [underline]);

  const underlineStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: underline.value }],
  }));

  const save = async () => {
    setSavingUsername(true);
    await completeProfile(username);
    setSavingUsername(false);
  };

  return (
    <View style={styles.root}>
      <StatusBar hidden />
      <View style={styles.brand}>
        <Text style={styles.logo}>D R I F T</Text>
        <Text style={styles.tagline}>Decide less. Live more.</Text>
        <Animated.View style={[styles.underline, underlineStyle]} />
      </View>
      <View style={styles.authArea}>
        <Button label="Continue with Google" onPress={signInGoogle} loading={loading} icon={<GoogleMarkIcon color={Colors.bgBase} size={18} />} />
        <Button label="Enter anonymous" variant="secondary" onPress={signInGuest} loading={loading} />
        <Text style={styles.terms}>Votes are public. Commitments are social. Proof matters.</Text>
      </View>
      <BottomSheet visible={Boolean(firebaseUser && !profile)} onClose={() => undefined}>
        <Text style={styles.sheetTitle}>Claim your handle</Text>
        <Text style={styles.sheetBody}>This is how people track your commitments and reputation.</Text>
        <Input label="Username" autoCapitalize="none" value={username} onChangeText={setUsername} placeholder="your_handle" />
        <Button label="Start drifting" onPress={() => void save()} loading={savingUsername} />
        <Pressable>
          <Text style={styles.locked}>You can edit display details later.</Text>
        </Pressable>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bgBase,
  },
  brand: {
    flex: 0.4,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: S.x6,
    gap: S.sm,
  },
  logo: {
    color: Colors.accentVolt,
    fontFamily: F.family.displayBlack,
    fontSize: 52,
    letterSpacing: 8,
  },
  tagline: {
    color: Colors.textMuted,
    fontFamily: F.family.bodyRegular,
    fontSize: F.size.base,
  },
  underline: {
    marginTop: S.md,
    height: S.px * 2,
    width: S.x4,
    backgroundColor: Colors.accentVolt,
  },
  authArea: {
    flex: 0.6,
    paddingHorizontal: S.x2,
    gap: S.lg,
  },
  terms: {
    color: Colors.textMuted,
    fontFamily: F.family.bodyRegular,
    fontSize: F.size.sm,
    textAlign: 'center',
    lineHeight: F.size.sm * F.lineHeight.normal,
  },
  sheetTitle: {
    color: Colors.textPrimary,
    fontFamily: F.family.displayBlack,
    fontSize: F.size.x2,
  },
  sheetBody: {
    color: Colors.textSecondary,
    fontFamily: F.family.bodyRegular,
    fontSize: F.size.base,
    lineHeight: F.size.base * F.lineHeight.normal,
  },
  locked: {
    color: Colors.textMuted,
    fontFamily: F.family.bodyRegular,
    fontSize: F.size.sm,
    textAlign: 'center',
  },
});
