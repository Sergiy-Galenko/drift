import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Colors, F, S } from '@/constants/tokens';
import { useAuth } from '@/hooks/useAuth';

type AuthMode = 'login' | 'register';

export default function LoginScreen() {
  const { firebaseUser, profile, loading, signInWithPassword, registerWithPassword, completeProfile } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fallbackUsername, setFallbackUsername] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [savingUsername, setSavingUsername] = useState(false);
  const underline = useSharedValue(0);

  const isRegister = mode === 'register';

  useEffect(() => {
    underline.value = withSpring(1, { damping: 14 });
  }, [underline]);

  const underlineStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: underline.value }],
  }));

  const submit = async () => {
    setSubmitting(true);
    try {
      if (isRegister) {
        await registerWithPassword(email, password, username);
      } else {
        await signInWithPassword(email, password);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const saveFallbackUsername = async () => {
    setSavingUsername(true);
    try {
      await completeProfile(fallbackUsername);
    } finally {
      setSavingUsername(false);
    }
  };

  const switchMode = () => {
    setMode(isRegister ? 'login' : 'register');
    setPassword('');
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar hidden />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.brand}>
          <Text style={styles.logo}>D R I F T</Text>
          <Text style={styles.tagline}>Decide less. Live more.</Text>
          <Animated.View style={[styles.underline, underlineStyle]} />
        </View>

        <View style={styles.form}>
          <View style={styles.formHeader}>
            <Text style={styles.formTitle}>{isRegister ? 'Create account' : 'Welcome back'}</Text>
            <Text style={styles.formCopy}>{isRegister ? 'Start with email, password, and your public handle.' : 'Log in with your email and password.'}</Text>
          </View>

          {isRegister ? (
            <Input
              label="Username"
              autoCapitalize="none"
              autoCorrect={false}
              value={username}
              onChangeText={setUsername}
              placeholder="your_handle"
              returnKeyType="next"
            />
          ) : null}

          <Input
            label="Email"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            returnKeyType="next"
          />

          <Input
            label="Password"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            placeholder={isRegister ? 'At least 6 characters' : 'Your password'}
            returnKeyType="done"
            onSubmitEditing={() => void submit()}
          />

          <Button label={isRegister ? 'Create account' : 'Log in'} onPress={() => void submit()} loading={submitting || loading} />

          <Pressable onPress={switchMode} style={styles.switchMode}>
            <Text style={styles.switchText}>{isRegister ? 'Already have an account? Log in' : 'New here? Create account'}</Text>
          </Pressable>

          <Text style={styles.terms}>Votes are public. Commitments are social. Proof matters.</Text>
        </View>
      </ScrollView>

      <BottomSheet visible={Boolean(firebaseUser && !profile)} onClose={() => undefined}>
        <Text style={styles.sheetTitle}>Claim your handle</Text>
        <Text style={styles.sheetBody}>Choose a public username so people can track your commitments and reputation.</Text>
        <Input label="Username" autoCapitalize="none" value={fallbackUsername} onChangeText={setFallbackUsername} placeholder="your_handle" />
        <Button label="Start drifting" onPress={() => void saveFallbackUsername()} loading={savingUsername} />
        <Text style={styles.locked}>You can edit display details later.</Text>
      </BottomSheet>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bgBase,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: S.lg,
    paddingVertical: S.x6,
    gap: S.x4,
  },
  brand: {
    alignItems: 'center',
    gap: S.sm,
    paddingTop: S.x6,
  },
  logo: {
    color: Colors.white,
    fontFamily: F.family.displayBlack,
    fontSize: 42,
    letterSpacing: 1,
  },
  tagline: {
    color: Colors.textSecondary,
    fontFamily: F.family.bodyRegular,
    fontSize: F.size.base,
  },
  underline: {
    marginTop: S.md,
    height: S.px * 2,
    width: S.x4,
    backgroundColor: Colors.white,
  },
  form: {
    gap: S.lg,
    paddingBottom: S.x2,
  },
  formHeader: {
    gap: S.sm,
  },
  formTitle: {
    color: Colors.textPrimary,
    fontFamily: F.family.displayBlack,
    fontSize: F.size.x2,
  },
  formCopy: {
    color: Colors.textSecondary,
    fontFamily: F.family.bodyRegular,
    fontSize: F.size.base,
    lineHeight: F.size.base * F.lineHeight.normal,
  },
  switchMode: {
    alignSelf: 'center',
    padding: S.sm,
  },
  switchText: {
    color: Colors.blue,
    fontFamily: F.family.bodySemi,
    fontSize: F.size.sm,
  },
  terms: {
    color: Colors.textTertiary,
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
