import { useEffect, useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, useWindowDimensions, View, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { Button } from '@/components/ui/Button';
import { ChatVoteIcon, HourglassIcon, PhoneProofIcon, type AppIcon } from '@/components/icons';
import { Colors, F, S } from '@/constants/tokens';

type Slide = {
  title: string;
  body: string;
  Icon: AppIcon;
};

const slides: Slide[] = [
  {
    title: 'Your life.\nTheir vote.',
    body: 'Post a real decision.\nStrangers decide.',
    Icon: ChatVoteIcon,
  },
  {
    title: 'Commit\nor quit.',
    body: "The vote ends. You promised.\nEveryone's watching.",
    Icon: HourglassIcon,
  },
  {
    title: "Proof or it\ndidn't happen.",
    body: 'Upload your evidence.\nBuild your reputation.',
    Icon: PhoneProofIcon,
  },
];

function PaginatorDot({ active }: { active: boolean }) {
  const width = useSharedValue(active ? 28 : 8);

  useEffect(() => {
    width.value = withSpring(active ? 28 : 8, { damping: 14 });
  }, [active, width]);

  const style = useAnimatedStyle(() => ({
    width: width.value,
    backgroundColor: active ? Colors.accentVolt : Colors.stroke,
  }));

  return <Animated.View style={[styles.dot, style]} />;
}

export default function OnboardingScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList<Slide>>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const complete = async () => {
    await AsyncStorage.setItem('drift_onboarding_v1', 'done');
    router.replace('/(auth)/login');
  };

  const next = () => {
    if (activeIndex === slides.length - 1) {
      void complete();
      return;
    }
    listRef.current?.scrollToIndex({ index: activeIndex + 1 });
  };

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setActiveIndex(index);
  };

  return (
    <View style={styles.root}>
      <Pressable onPress={() => void complete()} style={styles.skip}>
        <Text style={styles.skipText}>Skip</Text>
      </Pressable>
      <FlatList
        ref={listRef}
        data={slides}
        horizontal
        pagingEnabled
        bounces={false}
        scrollEventThrottle={16}
        keyExtractor={(item) => item.title}
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <item.Icon size={80} color={Colors.accentVolt} strokeWidth={1.5} />
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.body}>{item.body}</Text>
          </View>
        )}
      />
      <View style={styles.footer}>
        <View style={styles.dots}>
          {slides.map((slide, index) => (
            <PaginatorDot key={slide.title} active={activeIndex === index} />
          ))}
        </View>
        <Button label={activeIndex === slides.length - 1 ? "Let's go ->" : 'Next'} onPress={next} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bgBase,
  },
  skip: {
    position: 'absolute',
    top: S.x6,
    right: S.lg,
    zIndex: 2,
    padding: S.sm,
  },
  skipText: {
    color: Colors.textMuted,
    fontFamily: F.family.bodyRegular,
    fontSize: F.size.sm,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: S.x3,
    gap: S.x2,
  },
  title: {
    color: Colors.textPrimary,
    fontFamily: F.family.displayBlack,
    fontSize: 44,
    lineHeight: 44 * F.lineHeight.tight,
    textAlign: 'center',
  },
  body: {
    color: Colors.textSecondary,
    fontFamily: F.family.bodyRegular,
    fontSize: 16,
    lineHeight: 16 * F.lineHeight.normal,
    textAlign: 'center',
  },
  footer: {
    padding: S.x2,
    gap: S.x2,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: S.sm,
  },
  dot: {
    height: S.sm,
    borderRadius: S.sm,
  },
});
