import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomTabs } from '@/components/layout/BottomTabs';
import { colors } from '@/constants/colors';

type ScreenWrapperProps = {
  children: ReactNode;
  showTabs?: boolean;
  scroll?: boolean;
  keyboard?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
};

export function ScreenWrapper({ children, showTabs, scroll, keyboard, contentStyle }: ScreenWrapperProps) {
  const content = scroll ? (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[styles.scrollContent, showTabs ? styles.tabPadding : null, contentStyle]}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.content, showTabs ? styles.tabPadding : null, contentStyle]}>{children}</View>
  );

  return (
    <SafeAreaView className="flex-1" style={styles.safe}>
      <KeyboardAvoidingView
        enabled={keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboard}
      >
        {content}
      </KeyboardAvoidingView>
      {showTabs ? <BottomTabs /> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.base,
  },
  keyboard: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 28,
  },
  tabPadding: {
    paddingBottom: 18,
  },
});
