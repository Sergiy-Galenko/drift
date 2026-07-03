import type { UserProfile } from '@/types/user';

export type CardRarity = 'common' | 'rare' | 'ultra_rare';

export type CardDesignMotif =
  | 'spark'
  | 'slate'
  | 'bolt'
  | 'clock'
  | 'frame'
  | 'receipt'
  | 'vote'
  | 'save'
  | 'signal'
  | 'flame'
  | 'pulse'
  | 'chip'
  | 'route'
  | 'line'
  | 'peak'
  | 'crown';

export type CardDesign = {
  gradient: readonly [string, string, string];
  accent: string;
  motif: CardDesignMotif;
  glyph: string;
  stripeAngle: number;
  seed: number;
};

export interface Card {
  id: string;
  number: number;
  name: string;
  description: string;
  rarity: CardRarity;
  imageUrl: string;
  isCaseExclusive: boolean;
  marketValue: number;
  design: CardDesign;
  createdAt: string;
}

export type CaseUnlockType = 'achievement' | 'purchase';

export type CaseDesign = {
  gradient: readonly [string, string, string];
  accent: string;
  glyph: string;
  patternAngle: number;
};

export interface CardCase {
  id: string;
  title: string;
  description: string;
  unlockType: CaseUnlockType;
  achievementId?: string;
  price?: number;
  cardPool: string[];
  isUnlocked: boolean;
  isOpened: boolean;
  design: CaseDesign;
}

export type UserCardEntry = {
  cardId: string;
  count: number;
  firstCollectedAt: string;
  lastCollectedAt: string;
};

export type UserCaseState = {
  isUnlocked: boolean;
  isOpened: boolean;
  openedAt: string | null;
};

export type RouletteUserState = {
  uid: string;
  spinTokens: number;
  cards: Record<string, UserCardEntry>;
  cases: Record<string, UserCaseState>;
  showcaseCardIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type SpinTokenGrantSource = 'daily_activity' | 'weekly_activity' | 'achievement' | 'purchase_stub';

export type SpinResult = {
  card: Card;
  isDuplicate: boolean;
  duplicateCount: number;
  spinTokensRemaining: number;
};

export type OpenCaseResult = {
  caseId: string;
  card: Card;
  isDuplicate: boolean;
  duplicateCount: number;
  spinTokensRemaining: number;
};

export type MarketSaleResult = {
  card: Card;
  soldFor: number;
  remainingCount: number;
  spinTokensRemaining: number;
};

export type RouletteCaseView = CardCase & {
  unlockLabel: string;
  canOpen: boolean;
};

export type AchievementEvaluator = (profile: UserProfile | null) => boolean;
