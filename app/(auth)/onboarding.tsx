import { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type ImageSourcePropType,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { Button } from '@/components/ui/Button';
import { Colors, F, S } from '@/constants/tokens';

type Slide = {
  title: string;
  body: string;
  image: ImageSourcePropType;
};

const slides: Slide[] = [
  {
    title: 'Your life.\nTheir vote.',
    body: 'Post a real decision and let the room choose the path.',
    image: require('../../assets/onboarding/decision-vote.png') as ImageSourcePropType,
  },
  {
    title: 'Commit\nor quit.',
    body: 'When the vote ends, the decision becomes a promise.',
    image: require('../../assets/onboarding/commit-time.png') as ImageSourcePropType,
  },
  {
    title: "Proof or it\ndidn't happen.",
    body: 'Upload evidence, close the loop, and build reputation.',
    image: require('../../assets/onboarding/proof-reputation.png') as ImageSourcePropType,
  },
];

function PaginatorDot({ active }: { active: boolean }) {
  const width = useSharedValue(active ? 28 : 8);

  useEffect(() => {
    width.value = withSpring(active ? 28 : 8, { damping: 14 });
  }, [active, width]);

  const style = useAnimatedStyle(() => ({
    width: width.value,
    backgroundColor: active ? Colors.accentVolt : Colors.strokeStrong,
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
          <ImageBackground source={item.image} resizeMode="cover" style={[styles.slide, { width }]}>
            <LinearGradient colors={['rgba(10,10,10,0.18)', 'rgba(10,10,10,0.45)', Colors.bgBase]} style={styles.overlay} />
            <View style={styles.copy}>
              <Text style={styles.logo}>D R I F T</Text>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.body}>{item.body}</Text>
            </View>
          </ImageBackground>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.dots}>
          {slides.map((slide, index) => (
            <PaginatorDot key={slide.title} active={activeIndex === index} />
          ))}
        </View>
        <Button label={activeIndex === slides.length - 1 ? 'Start' : 'Next'} onPress={next} />
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
    zIndex: 3,
    padding: S.sm,
  },
  skipText: {
    color: Colors.textPrimary,
    fontFamily: F.family.bodySemi,
    fontSize: F.size.sm,
  },
  slide: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  copy: {
    paddingHorizontal: S.x3,
    paddingBottom: S.x8 + S.x7,
    gap: S.lg,
  },
  logo: {
    color: Colors.accentVolt,
    fontFamily: F.family.monoBold,
    fontSize: F.size.xs,
    letterSpacing: 0,
  },
  title: {
    color: Colors.textPrimary,
    fontFamily: F.family.displayBlack,
    fontSize: 46,
    lineHeight: 46 * F.lineHeight.tight,
  },
  body: {
    color: Colors.textSecondary,
    fontFamily: F.family.bodyMedium,
    fontSize: F.size.md,
    lineHeight: F.size.md * F.lineHeight.normal,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
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
