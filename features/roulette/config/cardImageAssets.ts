import type { ImageSourcePropType } from 'react-native';

export const CARD_IMAGE_ASSETS: Record<string, ImageSourcePropType> = {
  'common-morning-spark': require('../../../assets/roulette/cards/webp/card-01-morning-spark.webp') as ImageSourcePropType,
  'common-clean-slate': require('../../../assets/roulette/cards/webp/card-02-clean-slate.webp') as ImageSourcePropType,
  'common-two-minute-start': require('../../../assets/roulette/cards/webp/card-03-two-minute-start.webp') as ImageSourcePropType,
  'common-soft-deadline': require('../../../assets/roulette/cards/webp/card-04-soft-deadline.webp') as ImageSourcePropType,
  'common-focus-window': require('../../../assets/roulette/cards/webp/card-05-focus-window.webp') as ImageSourcePropType,
  'common-small-proof': require('../../../assets/roulette/cards/webp/card-06-small-proof.webp') as ImageSourcePropType,
  'common-vote-check': require('../../../assets/roulette/cards/webp/card-07-vote-check.webp') as ImageSourcePropType,
  'common-late-save': require('../../../assets/roulette/cards/webp/card-08-late-save.webp') as ImageSourcePropType,
  'common-quiet-yes': require('../../../assets/roulette/cards/webp/card-09-quiet-signal.webp') as ImageSourcePropType,
  'common-streak-kindling': require('../../../assets/roulette/cards/webp/card-10-streak-flame.webp') as ImageSourcePropType,
  'common-proof-pulse': require('../../../assets/roulette/cards/webp/card-11-proof-pulse.webp') as ImageSourcePropType,
  'common-commit-chip': require('../../../assets/roulette/cards/webp/card-12-commit-chip.webp') as ImageSourcePropType,
  'common-early-signal': require('../../../assets/roulette/cards/webp/card-13-early-route.webp') as ImageSourcePropType,
  'common-restart-line': require('../../../assets/roulette/cards/webp/card-14-restart-line.webp') as ImageSourcePropType,
  'common-checkpoint': require('../../../assets/roulette/cards/webp/card-15-checkpoint.webp') as ImageSourcePropType,
  'rare-seven-day-mark': require('../../../assets/roulette/cards/webp/card-16-seven-day-calendar.webp') as ImageSourcePropType,
  'rare-public-stake': require('../../../assets/roulette/cards/webp/card-17-public-stake.webp') as ImageSourcePropType,
  'rare-proof-runner': require('../../../assets/roulette/cards/webp/card-18-proof-runner.webp') as ImageSourcePropType,
  'rare-crowd-tilt': require('../../../assets/roulette/cards/webp/card-19-crowd-tilt.webp') as ImageSourcePropType,
  'rare-reputation-rise': require('../../../assets/roulette/cards/webp/card-20-reputation-rise.webp') as ImageSourcePropType,
  'rare-deadline-discipline': require('../../../assets/roulette/cards/webp/card-21-deadline-discipline.webp') as ImageSourcePropType,
  'rare-accountability-loop': require('../../../assets/roulette/cards/webp/card-22-accountability-loop.webp') as ImageSourcePropType,
  'ultra-legend-streak': require('../../../assets/roulette/cards/webp/card-23-legend-streak.webp') as ImageSourcePropType,
  'ultra-proof-master': require('../../../assets/roulette/cards/webp/card-24-proof-master.webp') as ImageSourcePropType,
  'ultra-volt-finish': require('../../../assets/roulette/cards/webp/card-25-volt-finish.webp') as ImageSourcePropType,
};

export function getCardImageAsset(cardId: string): ImageSourcePropType | undefined {
  return CARD_IMAGE_ASSETS[cardId];
}
