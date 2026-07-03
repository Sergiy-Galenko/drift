import type { ImageSourcePropType } from 'react-native';

export const CARD_IMAGE_ASSETS: Record<string, ImageSourcePropType> = {
  'common-morning-spark': require('../../../assets/roulette/cards/card-01-morning-spark.png') as ImageSourcePropType,
  'common-clean-slate': require('../../../assets/roulette/cards/card-02-clean-slate.png') as ImageSourcePropType,
  'common-two-minute-start': require('../../../assets/roulette/cards/card-03-two-minute-start.png') as ImageSourcePropType,
  'common-soft-deadline': require('../../../assets/roulette/cards/card-04-soft-deadline.png') as ImageSourcePropType,
  'common-focus-window': require('../../../assets/roulette/cards/card-05-focus-window.png') as ImageSourcePropType,
  'common-small-proof': require('../../../assets/roulette/cards/card-06-small-proof.png') as ImageSourcePropType,
  'common-vote-check': require('../../../assets/roulette/cards/card-07-vote-check.png') as ImageSourcePropType,
  'common-late-save': require('../../../assets/roulette/cards/card-08-late-save.png') as ImageSourcePropType,
  'common-quiet-yes': require('../../../assets/roulette/cards/card-09-quiet-signal.png') as ImageSourcePropType,
  'common-streak-kindling': require('../../../assets/roulette/cards/card-10-streak-flame.png') as ImageSourcePropType,
  'common-proof-pulse': require('../../../assets/roulette/cards/card-11-proof-pulse.png') as ImageSourcePropType,
  'common-commit-chip': require('../../../assets/roulette/cards/card-12-commit-chip.png') as ImageSourcePropType,
  'common-early-signal': require('../../../assets/roulette/cards/card-13-early-route.png') as ImageSourcePropType,
  'common-restart-line': require('../../../assets/roulette/cards/card-14-restart-line.png') as ImageSourcePropType,
  'common-checkpoint': require('../../../assets/roulette/cards/card-15-checkpoint.png') as ImageSourcePropType,
  'rare-seven-day-mark': require('../../../assets/roulette/cards/card-16-seven-day-calendar.png') as ImageSourcePropType,
  'rare-public-stake': require('../../../assets/roulette/cards/card-17-public-stake.png') as ImageSourcePropType,
  'rare-proof-runner': require('../../../assets/roulette/cards/card-18-proof-runner.png') as ImageSourcePropType,
  'rare-crowd-tilt': require('../../../assets/roulette/cards/card-19-crowd-tilt.png') as ImageSourcePropType,
  'rare-reputation-rise': require('../../../assets/roulette/cards/card-20-reputation-rise.png') as ImageSourcePropType,
  'rare-deadline-discipline': require('../../../assets/roulette/cards/card-21-deadline-discipline.png') as ImageSourcePropType,
  'rare-accountability-loop': require('../../../assets/roulette/cards/card-22-accountability-loop.png') as ImageSourcePropType,
  'ultra-legend-streak': require('../../../assets/roulette/cards/card-23-legend-streak.png') as ImageSourcePropType,
  'ultra-proof-master': require('../../../assets/roulette/cards/card-24-proof-master.png') as ImageSourcePropType,
  'ultra-volt-finish': require('../../../assets/roulette/cards/card-25-volt-finish.png') as ImageSourcePropType,
};

export function getCardImageAsset(cardId: string): ImageSourcePropType | undefined {
  return CARD_IMAGE_ASSETS[cardId];
}
