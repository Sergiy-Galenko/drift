import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { LockIcon } from '@/components/icons';
import { Colors, F, R, S } from '@/constants/tokens';

import { getCardImageAsset } from '../config/cardImageAssets';
import type { Card, CardDesignMotif } from '../types/roulette.types';

type CardArtworkProps = {
  card?: Card;
  locked?: boolean;
  compact?: boolean;
};

const fallbackGradient = [Colors.bgInteractive, Colors.surfaceRaised, Colors.bgSurface] as const;

function CardMotif({ motif, color, compact }: { motif: CardDesignMotif; color: string; compact: boolean }) {
  const size = compact ? 50 : 74;
  const strokeWidth = compact ? 2 : 2.4;

  switch (motif) {
    case 'spark':
      return (
        <Svg width={size} height={size} viewBox="0 0 80 80" fill="none">
          <Path d="M40 8 47 31l23 9-23 9-7 23-7-23-23-9 23-9 7-23Z" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
          <Path d="M58 10v12M52 16h12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
        </Svg>
      );
    case 'slate':
      return (
        <Svg width={size} height={size} viewBox="0 0 80 80" fill="none">
          <Rect x="20" y="14" width="40" height="52" rx="5" stroke={color} strokeWidth={strokeWidth} />
          <Path d="M29 28h22M29 40h18M29 52h12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
        </Svg>
      );
    case 'bolt':
      return (
        <Svg width={size} height={size} viewBox="0 0 80 80" fill="none">
          <Path d="M45 8 18 44h21l-4 28 27-38H42l3-26Z" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
        </Svg>
      );
    case 'clock':
      return (
        <Svg width={size} height={size} viewBox="0 0 80 80" fill="none">
          <Circle cx="40" cy="42" r="26" stroke={color} strokeWidth={strokeWidth} />
          <Path d="M40 24v20l14 8M30 10h20" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    case 'frame':
      return (
        <Svg width={size} height={size} viewBox="0 0 80 80" fill="none">
          <Rect x="16" y="20" width="48" height="40" rx="8" stroke={color} strokeWidth={strokeWidth} />
          <Path d="M28 32h24M28 48h14" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
        </Svg>
      );
    case 'receipt':
      return (
        <Svg width={size} height={size} viewBox="0 0 80 80" fill="none">
          <Path d="M22 12h36v56l-6-4-6 4-6-4-6 4-6-4-6 4V12Z" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
          <Path d="M32 28h16M32 40h16M32 52h10" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
        </Svg>
      );
    case 'vote':
      return (
        <Svg width={size} height={size} viewBox="0 0 80 80" fill="none">
          <Rect x="16" y="34" width="48" height="30" rx="5" stroke={color} strokeWidth={strokeWidth} />
          <Path d="m30 23 9 9 17-18M26 34h28" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    case 'save':
      return (
        <Svg width={size} height={size} viewBox="0 0 80 80" fill="none">
          <Path d="M24 12h32v56L40 58 24 68V12Z" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
          <Path d="M32 26h16" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
        </Svg>
      );
    case 'signal':
      return (
        <Svg width={size} height={size} viewBox="0 0 80 80" fill="none">
          <Circle cx="40" cy="42" r="5" stroke={color} strokeWidth={strokeWidth} />
          <Path d="M28 54a17 17 0 0 1 0-24M52 30a17 17 0 0 1 0 24M18 64a31 31 0 0 1 0-44M62 20a31 31 0 0 1 0 44" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
        </Svg>
      );
    case 'flame':
      return (
        <Svg width={size} height={size} viewBox="0 0 80 80" fill="none">
          <Path d="M41 8c10 12-1 18 10 27 6 5 9 11 9 18 0 14-10 23-20 23S20 67 20 53c0-12 8-18 15-27 4-5 5-11 6-18Z" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
          <Path d="M40 48c7 7 4 16 0 16s-8-4-8-10c0-5 4-8 8-14v8Z" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
        </Svg>
      );
    case 'pulse':
      return (
        <Svg width={size} height={size} viewBox="0 0 80 80" fill="none">
          <Path d="M10 43h14l8-22 14 38 8-16h16" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
          <Circle cx="63" cy="22" r="6" stroke={color} strokeWidth={strokeWidth} />
        </Svg>
      );
    case 'chip':
      return (
        <Svg width={size} height={size} viewBox="0 0 80 80" fill="none">
          <Circle cx="40" cy="40" r="25" stroke={color} strokeWidth={strokeWidth} />
          <Circle cx="40" cy="40" r="10" stroke={color} strokeWidth={strokeWidth} />
          <Path d="M40 15v12M40 53v12M15 40h12M53 40h12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
        </Svg>
      );
    case 'route':
      return (
        <Svg width={size} height={size} viewBox="0 0 80 80" fill="none">
          <Path d="M18 60c16-34 31 10 44-40" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
          <Circle cx="18" cy="60" r="5" stroke={color} strokeWidth={strokeWidth} />
          <Circle cx="62" cy="20" r="5" stroke={color} strokeWidth={strokeWidth} />
        </Svg>
      );
    case 'line':
      return (
        <Svg width={size} height={size} viewBox="0 0 80 80" fill="none">
          <Path d="M15 52h50M20 38h40M28 24h24" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
          <Path d="m54 16 10 8-10 8" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    case 'peak':
      return (
        <Svg width={size} height={size} viewBox="0 0 80 80" fill="none">
          <Path d="m12 62 18-24 12 12 16-30 10 42H12Z" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
          <Path d="m58 20 3 14-11-8" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    case 'crown':
      return (
        <Svg width={size} height={size} viewBox="0 0 80 80" fill="none">
          <Path d="m14 30 16 14 10-26 10 26 16-14-8 34H22L14 30Z" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
          <Path d="M25 64h30" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
        </Svg>
      );
  }
}

export function CardArtwork({ card, locked = false, compact = false }: CardArtworkProps) {
  const design = card?.design;
  const imageAsset = card ? getCardImageAsset(card.id) : undefined;
  const gradient = design?.gradient ?? fallbackGradient;
  const accent = design?.accent ?? Colors.textTertiary;
  const markerOffset = design ? S.md + (design.seed % 28) : S.x2;

  if (card && imageAsset && !locked) {
    return (
      <ImageBackground
        source={imageAsset}
        resizeMode="cover"
        style={[styles.art, styles.photoArt, compact ? styles.compact : null, locked ? styles.locked : null]}
        imageStyle={styles.photoImage}
      >
        <View style={[styles.numberPlate, compact ? styles.numberPlateCompact : null, { borderColor: accent }]}>
          <Text style={[styles.numberText, compact ? styles.numberTextCompact : null, { color: accent }]}>
            #{card.number.toString().padStart(2, '0')}
          </Text>
        </View>
      </ImageBackground>
    );
  }

  return (
    <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.art, compact ? styles.compact : null, locked ? styles.locked : null]}>
      <View style={[styles.gridLineA, { transform: [{ rotate: `${design?.stripeAngle ?? -28}deg` }] }]} />
      <View style={[styles.gridLineB, { left: markerOffset, backgroundColor: `${accent}33` }]} />
      <View style={[styles.signal, { backgroundColor: `${accent}66` }, card?.rarity === 'ultra_rare' ? styles.signalUltra : null]} />
      {card ? (
        <View style={[styles.numberPlate, compact ? styles.numberPlateCompact : null, { borderColor: accent }]}>
          <Text style={[styles.numberText, compact ? styles.numberTextCompact : null, { color: accent }]}>
            #{card.number.toString().padStart(2, '0')}
          </Text>
        </View>
      ) : null}
      <View style={[styles.cornerDot, { borderColor: accent, right: markerOffset }]} />
      <View style={[styles.mark, { borderColor: accent }, card?.rarity === 'ultra_rare' ? styles.markUltra : null]}>
        {locked || !card ? (
          <LockIcon size={compact ? 22 : 30} color={Colors.textTertiary} />
        ) : (
          <CardMotif motif={card.design.motif} color={accent} compact={compact} />
        )}
      </View>
      {!locked && card ? <Text style={[styles.glyph, compact ? styles.glyphCompact : null, { color: accent }]}>{card.design.glyph}</Text> : null}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  art: {
    aspectRatio: 1,
    borderRadius: R.md,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bgInteractive,
  },
  compact: {
    borderRadius: R.sm,
  },
  photoArt: {
    backgroundColor: Colors.black,
  },
  photoImage: {
    borderRadius: R.md,
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.58)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locked: {
    opacity: 0.82,
  },
  gridLineA: {
    position: 'absolute',
    width: '135%',
    height: S.px,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  gridLineB: {
    position: 'absolute',
    width: S.px,
    height: '125%',
    backgroundColor: 'rgba(255,255,255,0.08)',
    transform: [{ rotate: '18deg' }],
  },
  signal: {
    position: 'absolute',
    bottom: S.md,
    left: S.md,
    right: S.md,
    height: S.sm,
    borderRadius: R.pill,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  signalUltra: {
    backgroundColor: Colors.accentVolt,
  },
  cornerDot: {
    position: 'absolute',
    top: S.md,
    width: S.md,
    height: S.md,
    borderRadius: R.pill,
    borderWidth: S.px,
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  numberPlate: {
    position: 'absolute',
    top: S.md,
    left: S.md,
    minWidth: 46,
    minHeight: 26,
    borderRadius: R.pill,
    borderWidth: S.px,
    backgroundColor: 'rgba(0,0,0,0.42)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: S.sm,
  },
  numberPlateCompact: {
    minWidth: 38,
    minHeight: 22,
    paddingHorizontal: S.xs,
  },
  numberText: {
    fontFamily: F.family.monoBold,
    fontSize: F.size.xs,
    letterSpacing: 0,
  },
  numberTextCompact: {
    fontSize: F.size.micro,
  },
  mark: {
    width: 74,
    height: 74,
    borderRadius: R.pill,
    borderWidth: S.px,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.34)',
  },
  markUltra: {
    shadowColor: Colors.accentVolt,
    shadowOpacity: 0.65,
    shadowRadius: 18,
    elevation: 8,
  },
  glyph: {
    position: 'absolute',
    left: S.md,
    bottom: S.md,
    fontFamily: F.family.displayBold,
    fontSize: F.size.sm,
    letterSpacing: 0,
  },
  glyphCompact: {
    fontSize: F.size.xs,
  },
});
