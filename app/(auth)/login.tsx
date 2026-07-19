import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { EyeIcon, EyeOffIcon } from '@/components/icons';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Colors, F, R, S } from '@/constants/tokens';
import { useAuth } from '@/hooks/useAuth';
import { CreatePasswordSchema, EmailSchema, LoginSchema, RegisterSchema, SignInPasswordSchema, UsernameSchema } from '@/utils/validation';

type AuthMode = 'login' | 'register';
type LoginForm = {
  email: string;
  password: string;
};
type RegisterForm = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};
type LoginErrors = Partial<Record<keyof LoginForm, string>>;
type RegisterErrors = Partial<Record<keyof RegisterForm, string>>;

function mapIssues<T extends string>(
  issues: {
    path: (string | number)[];
    message: string;
  }[],
): Partial<Record<T, string>> {
  const next: Partial<Record<T, string>> = {};

  for (const issue of issues) {
    const key = issue.path[0];
    if (typeof key === 'string' && !next[key as T]) {
      next[key as T] = issue.message;
    }
  }

  return next;
}

export default function LoginScreen() {
  const { firebaseUser, profile, loading, signInWithPassword, registerWithPassword, completeProfile } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [loginForm, setLoginForm] = useState<LoginForm>({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState<RegisterForm>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loginErrors, setLoginErrors] = useState<LoginErrors>({});
  const [registerErrors, setRegisterErrors] = useState<RegisterErrors>({});
  const [fallbackUsername, setFallbackUsername] = useState('');
  const [fallbackError, setFallbackError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [savingUsername, setSavingUsername] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const loginPasswordRef = useRef<TextInput>(null);
  const registerEmailRef = useRef<TextInput>(null);
  const registerPasswordRef = useRef<TextInput>(null);
  const registerConfirmPasswordRef = useRef<TextInput>(null);

  const isRegister = mode === 'register';

  useEffect(() => {
    if (firebaseUser && !profile && fallbackUsername.length === 0) {
      const seed = registerForm.username || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || '';
      setFallbackUsername(seed.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase());
    }
  }, [fallbackUsername.length, firebaseUser, profile, registerForm.username]);

  const primaryLabel = isRegister ? 'Create account' : 'Log in';

  const updateLoginForm = <T extends keyof LoginForm>(field: T, value: LoginForm[T]) => {
    setLoginForm((current) => ({ ...current, [field]: value }));
    setLoginErrors((current) => (current[field] ? { ...current, [field]: undefined } : current));
  };

  const updateRegisterForm = <T extends keyof RegisterForm>(field: T, value: RegisterForm[T]) => {
    setRegisterForm((current) => ({ ...current, [field]: value }));
    setRegisterErrors((current) => (current[field] ? { ...current, [field]: undefined } : current));
  };

  const submit = async () => {
    if (submitting || loading) {
      return;
    }

    if (isRegister) {
      const parsed = RegisterSchema.safeParse(registerForm);
      if (!parsed.success) {
        setRegisterErrors(mapIssues<keyof RegisterForm>(parsed.error.issues));
        return;
      }
    } else {
      const parsed = LoginSchema.safeParse(loginForm);
      if (!parsed.success) {
        setLoginErrors(mapIssues<keyof LoginForm>(parsed.error.issues));
        return;
      }
    }

    setSubmitting(true);
    try {
      if (isRegister) {
        setFallbackUsername(registerForm.username.trim().toLowerCase());
        await registerWithPassword(registerForm.email, registerForm.password, registerForm.username);
      } else {
        await signInWithPassword(loginForm.email, loginForm.password);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const saveFallbackUsername = async () => {
    const parsed = UsernameSchema.safeParse(fallbackUsername.trim());
    if (!parsed.success) {
      setFallbackError(parsed.error.issues[0]?.message ?? 'Invalid username');
      return;
    }

    setSavingUsername(true);
    try {
      setFallbackError(null);
      await completeProfile(parsed.data);
    } finally {
      setSavingUsername(false);
    }
  };

  const changeMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setLoginErrors({});
    setRegisterErrors({});
    setFallbackError(null);

    if (nextMode === 'register' && !registerForm.email && loginForm.email) {
      setRegisterForm((current) => ({ ...current, email: loginForm.email }));
    }

    if (nextMode === 'login' && !loginForm.email && registerForm.email) {
      setLoginForm((current) => ({ ...current, email: registerForm.email }));
    }
  };

  const switchMode = () => {
    changeMode(isRegister ? 'login' : 'register');
  };

  const renderPasswordToggle = (visible: boolean, onPress: () => void, label: string) => {
    const Icon = visible ? EyeOffIcon : EyeIcon;

    return (
      <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={styles.passwordToggle}>
        <Icon size={20} color={Colors.textSecondary} />
      </Pressable>
    );
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.brand}>
          <Text style={styles.logo}>D R I F T</Text>
          <Text style={styles.tagline}>Decide less. Live more.</Text>
          <Text style={styles.brandCopy}>Public commitments, private credentials.</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.modeSwitch}>
            <Pressable onPress={() => changeMode('login')} style={[styles.modeButton, mode === 'login' ? styles.modeButtonActive : null]}>
              <Text style={[styles.modeLabel, mode === 'login' ? styles.modeLabelActive : null]}>Log In</Text>
            </Pressable>
            <Pressable onPress={() => changeMode('register')} style={[styles.modeButton, mode === 'register' ? styles.modeButtonActive : null]}>
              <Text style={[styles.modeLabel, mode === 'register' ? styles.modeLabelActive : null]}>Register</Text>
            </Pressable>
          </View>

          <View style={styles.formHeader}>
            <Text style={styles.formTitle}>{isRegister ? 'Create account' : 'Welcome back'}</Text>
            <Text style={styles.formCopy}>
              {isRegister
                ? 'Use a public username, your email, and a password you can actually remember.'
                : 'Sign in with the email and password attached to your DRIFT account.'}
            </Text>
          </View>

          {isRegister ? (
            <View style={styles.group}>
              <Input
                label="Public username"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="username"
                textContentType="username"
                value={registerForm.username}
                onBlur={() => {
                  const parsed = UsernameSchema.safeParse(registerForm.username.trim());
                  setRegisterErrors((current) => ({
                    ...current,
                    username: parsed.success ? undefined : parsed.error.issues[0]?.message,
                  }));
                }}
                onChangeText={(value) => updateRegisterForm('username', value)}
                placeholder="your_handle"
                returnKeyType="next"
                error={registerErrors.username}
                onSubmitEditing={() => registerEmailRef.current?.focus()}
              />
              <Text style={styles.helper}>Letters, numbers, and underscores only. This will be visible to everyone.</Text>
            </View>
          ) : null}

          <Input
            label="Email"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
            keyboardType="email-address"
            value={isRegister ? registerForm.email : loginForm.email}
            onBlur={() => {
              const target = isRegister ? registerForm : loginForm;
              const parsed = EmailSchema.safeParse(target.email);
              if (isRegister) {
                setRegisterErrors((current) => ({ ...current, email: parsed.success ? undefined : parsed.error.issues[0]?.message }));
              } else {
                setLoginErrors((current) => ({ ...current, email: parsed.success ? undefined : parsed.error.issues[0]?.message }));
              }
            }}
            onChangeText={(value) => (isRegister ? updateRegisterForm('email', value) : updateLoginForm('email', value))}
            placeholder="you@example.com"
            returnKeyType="next"
            ref={isRegister ? registerEmailRef : undefined}
            error={isRegister ? registerErrors.email : loginErrors.email}
            onSubmitEditing={() => (isRegister ? registerPasswordRef.current?.focus() : loginPasswordRef.current?.focus())}
          />

          <Input
            label="Password"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            textContentType={isRegister ? 'newPassword' : 'password'}
            secureTextEntry={!passwordVisible}
            value={isRegister ? registerForm.password : loginForm.password}
            onBlur={() => {
              const value = isRegister ? registerForm.password : loginForm.password;
              const parsed = isRegister ? CreatePasswordSchema.safeParse(value) : SignInPasswordSchema.safeParse(value);
              if (isRegister) {
                setRegisterErrors((current) => ({ ...current, password: parsed.success ? undefined : parsed.error.issues[0]?.message }));
              } else {
                setLoginErrors((current) => ({ ...current, password: parsed.success ? undefined : parsed.error.issues[0]?.message }));
              }
            }}
            onChangeText={(value) => (isRegister ? updateRegisterForm('password', value) : updateLoginForm('password', value))}
            placeholder={isRegister ? 'At least 6 characters' : 'Your password'}
            returnKeyType={isRegister ? 'next' : 'done'}
            ref={isRegister ? registerPasswordRef : loginPasswordRef}
            error={isRegister ? registerErrors.password : loginErrors.password}
            onSubmitEditing={() => (isRegister ? registerConfirmPasswordRef.current?.focus() : void submit())}
            right={renderPasswordToggle(
              passwordVisible,
              () => setPasswordVisible((value) => !value),
              passwordVisible ? 'Hide password' : 'Show password',
            )}
          />

          {isRegister ? (
            <View style={styles.group}>
              <Input
                ref={registerConfirmPasswordRef}
                label="Confirm password"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="new-password"
                textContentType="newPassword"
                secureTextEntry={!confirmPasswordVisible}
                value={registerForm.confirmPassword}
                onBlur={() => {
                  const parsed = RegisterSchema.safeParse(registerForm);
                  setRegisterErrors((current) => ({
                    ...current,
                    confirmPassword: parsed.success
                      ? undefined
                      : mapIssues<keyof RegisterForm>(parsed.error.issues).confirmPassword,
                  }));
                }}
                onChangeText={(value) => updateRegisterForm('confirmPassword', value)}
                placeholder="Repeat your password"
                returnKeyType="done"
                error={registerErrors.confirmPassword}
                onSubmitEditing={() => void submit()}
                right={renderPasswordToggle(
                  confirmPasswordVisible,
                  () => setConfirmPasswordVisible((value) => !value),
                  confirmPasswordVisible ? 'Hide confirmed password' : 'Show confirmed password',
                )}
              />
              <Text style={styles.helper}>Passwords must match before the account is created.</Text>
            </View>
          ) : null}

          <Button label={primaryLabel} onPress={() => void submit()} loading={submitting || loading} />

          <Pressable onPress={switchMode} style={styles.switchMode}>
            <Text style={styles.switchText}>
              {isRegister ? 'Already have an account? Switch to login' : 'Need an account? Switch to registration'}
            </Text>
          </Pressable>

          <Text style={styles.terms}>
            Your email stays private. Your username, votes, and commitment history are part of your public DRIFT identity.
          </Text>
        </View>
      </ScrollView>

      <BottomSheet visible={Boolean(firebaseUser && !profile)} onClose={() => undefined}>
        <Text style={styles.sheetTitle}>Finish your profile</Text>
        <Text style={styles.sheetBody}>Choose a public username so people can find your posts, follows, and reputation history.</Text>
        <Input
          label="Username"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="username"
          value={fallbackUsername}
          onChangeText={(value) => {
            setFallbackUsername(value);
            if (fallbackError) {
              setFallbackError(null);
            }
          }}
          placeholder="your_handle"
          error={fallbackError}
        />
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
    gap: S.xs,
    paddingTop: S.x5,
  },
  logo: {
    color: Colors.white,
    fontFamily: F.family.displayBlack,
    fontSize: 40,
    letterSpacing: 1,
  },
  tagline: {
    color: Colors.textSecondary,
    fontFamily: F.family.bodyRegular,
    fontSize: F.size.base,
  },
  brandCopy: {
    color: Colors.textMuted,
    fontFamily: F.family.bodyRegular,
    fontSize: F.size.sm,
  },
  form: {
    gap: S.lg,
    paddingBottom: S.x2,
  },
  modeSwitch: {
    flexDirection: 'row',
    gap: S.sm,
    borderRadius: R.pill,
    backgroundColor: Colors.surfaceRaised,
    padding: S.xs,
  },
  modeButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: R.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeButtonActive: {
    backgroundColor: Colors.white,
  },
  modeLabel: {
    color: Colors.textSecondary,
    fontFamily: F.family.bodySemi,
    fontSize: F.size.sm,
  },
  modeLabelActive: {
    color: Colors.black,
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
  group: {
    gap: S.sm,
  },
  helper: {
    color: Colors.textMuted,
    fontFamily: F.family.bodyRegular,
    fontSize: F.size.sm,
    lineHeight: F.size.sm * F.lineHeight.normal,
  },
  passwordToggle: {
    width: S.x5,
    height: S.x5,
    borderRadius: R.pill,
    alignItems: 'center',
    justifyContent: 'center',
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
