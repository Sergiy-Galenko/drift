import { useEffect } from 'react';
import { create } from 'zustand';

import { useUIStore } from '@/stores/uiStore';
import type { UserProfile } from '@/types/user';

import { ROULETTE_CASES } from '../config/casesData';
import { getCardsByIds, MAIN_ROULETTE_CARD_IDS, ROULETTE_CARD_BY_ID } from '../config/cardsData';
import { PROFILE_SHOWCASE_LIMIT, RARITY_ORDER, ROULETTE_SPIN_COST, SPIN_PACK_SIZE } from '../config/rouletteConfig';
import { isAchievementUnlocked, getAchievementLabel } from '../services/achievementService';
import {
  collectCard,
  commitCaseOpen,
  commitSpin,
  getCollectedCount,
  grantSpinTokens,
  makeDefaultRouletteState,
  sellDuplicateCard,
  setShowcaseCards,
  subscribeRouletteState,
  unlockCase,
} from '../services/rouletteService';
import { pickWeightedCard } from '../config/rouletteConfig';
import type {
  Card,
  OpenCaseResult,
  RouletteCaseView,
  RouletteUserState,
  SpinResult,
  SpinTokenGrantSource,
} from '../types/roulette.types';

type RouletteStore = {
  userState: RouletteUserState | null;
  loading: boolean;
  committing: boolean;
  error: string | null;
  startSync: (profile: UserProfile) => () => void;
  spin: () => SpinResult | null;
  openCase: (caseId: string, profile: UserProfile | null) => OpenCaseResult | null;
  grantTokens: (quantity: number, source: SpinTokenGrantSource) => void;
  sellCard: (cardId: string) => void;
  toggleShowcaseCard: (cardId: string) => void;
  clearError: () => void;
};

function toast(title: string, message: string, tone: 'success' | 'warning' | 'danger' | 'neutral' = 'neutral') {
  useUIStore.getState().pushToast({ title, message, tone });
}

function applyAchievementUnlocks(state: RouletteUserState, profile: UserProfile | null): RouletteUserState {
  const nextCases = { ...state.cases };
  let changed = false;

  for (const cardCase of ROULETTE_CASES) {
    if (cardCase.unlockType !== 'achievement' || !cardCase.achievementId) {
      continue;
    }

    if (!nextCases[cardCase.id]?.isUnlocked && isAchievementUnlocked(cardCase.achievementId, profile)) {
      nextCases[cardCase.id] = {
        ...(nextCases[cardCase.id] ?? { isOpened: false, openedAt: null }),
        isUnlocked: true,
      };
      changed = true;
    }
  }

  return changed ? { ...state, cases: nextCases } : state;
}

function persistAchievementUnlocks(uid: string, state: RouletteUserState, profile: UserProfile | null): void {
  for (const cardCase of ROULETTE_CASES) {
    if (cardCase.unlockType !== 'achievement' || !cardCase.achievementId) {
      continue;
    }

    if (!state.cases[cardCase.id]?.isUnlocked && isAchievementUnlocked(cardCase.achievementId, profile)) {
      void unlockCase(uid, cardCase.id).catch(() => undefined);
    }
  }
}

export function getRouletteProgress(state: RouletteUserState | null): { collected: number; total: number; progress: number } {
  const total = MAIN_ROULETTE_CARD_IDS.length;
  const collected = state ? getCollectedCount(state) : 0;
  return {
    collected,
    total,
    progress: total > 0 ? collected / total : 0,
  };
}

export function getProfileShowcaseCards(state: RouletteUserState | null): Card[] {
  if (!state) {
    return [];
  }

  const pinnedCards = state.showcaseCardIds
    .map((cardId) => ROULETTE_CARD_BY_ID[cardId])
    .filter((card): card is Card => Boolean(card && state.cards[card.id]))
    .slice(0, PROFILE_SHOWCASE_LIMIT);

  if (pinnedCards.length > 0) {
    return pinnedCards;
  }

  return Object.values(state.cards)
    .map((entry) => ROULETTE_CARD_BY_ID[entry.cardId])
    .filter((card): card is Card => Boolean(card))
    .sort((left, right) => {
      const rarityDelta = RARITY_ORDER[right.rarity] - RARITY_ORDER[left.rarity];
      if (rarityDelta !== 0) {
        return rarityDelta;
      }

      return right.marketValue - left.marketValue;
    })
    .slice(0, PROFILE_SHOWCASE_LIMIT);
}

export function getRouletteCaseViews(state: RouletteUserState | null, profile: UserProfile | null): RouletteCaseView[] {
  return ROULETTE_CASES.map((cardCase) => {
    const caseState = state?.cases[cardCase.id];
    const achievementUnlocked =
      cardCase.unlockType === 'achievement' && cardCase.achievementId
        ? isAchievementUnlocked(cardCase.achievementId, profile)
        : false;
    const isUnlocked = Boolean(caseState?.isUnlocked || cardCase.isUnlocked || achievementUnlocked);
    const isOpened = Boolean(caseState?.isOpened || cardCase.isOpened);
    const price = cardCase.price ?? 0;
    const hasEnoughTokens = state ? state.spinTokens >= price : false;

    return {
      ...cardCase,
      isUnlocked,
      isOpened,
      canOpen: isUnlocked && !isOpened && (cardCase.unlockType !== 'purchase' || hasEnoughTokens),
      unlockLabel:
        cardCase.unlockType === 'achievement'
          ? `Unlocks after: ${getAchievementLabel(cardCase.achievementId ?? '')}`
          : `Open for ${price} spin tokens`,
    };
  });
}

export const useRouletteStore = create<RouletteStore>((set, get) => ({
  userState: null,
  loading: false,
  committing: false,
  error: null,
  startSync: (profile) => {
    set((state) => ({
      userState:
        state.userState?.uid === profile.uid
          ? applyAchievementUnlocks(state.userState, profile)
          : applyAchievementUnlocks(makeDefaultRouletteState(profile.uid), profile),
      loading: true,
      error: null,
    }));

    return subscribeRouletteState(
      profile.uid,
      (nextState) => {
        persistAchievementUnlocks(profile.uid, nextState, profile);
        set({
          userState: applyAchievementUnlocks(nextState, profile),
          loading: false,
          error: null,
        });
      },
      (message) => {
        set({ loading: false, error: message });
        toast('Roulette sync failed', 'Your collection will retry when Firestore is reachable.', 'warning');
      },
    );
  },
  spin: () => {
    const current = get().userState;

    if (!current) {
      toast('Roulette unavailable', 'Sign in before spinning.', 'warning');
      return null;
    }

    if (get().committing) {
      return null;
    }

    if (current.spinTokens < ROULETTE_SPIN_COST) {
      toast('No spin tokens', 'Claim an activity token or use the purchase stub.', 'warning');
      return null;
    }

    const card = pickWeightedCard(getCardsByIds(MAIN_ROULETTE_CARD_IDS));
    const previous = current;
    const collected = collectCard({ ...current, spinTokens: current.spinTokens - ROULETTE_SPIN_COST }, card);
    const result: SpinResult = {
      card,
      isDuplicate: collected.isDuplicate,
      duplicateCount: collected.duplicateCount,
      spinTokensRemaining: collected.nextState.spinTokens,
    };

    set({ userState: collected.nextState, committing: true, error: null });

    void commitSpin(current.uid, card.id)
      .then(() => {
        set({ committing: false });
      })
      .catch((error: unknown) => {
        set({ userState: previous, committing: false, error: String(error) });
        toast('Spin rolled back', 'Firestore rejected the spin transaction.', 'danger');
      });

    return result;
  },
  openCase: (caseId, profile) => {
    const current = get().userState;
    const cardCase = ROULETTE_CASES.find((item) => item.id === caseId);

    if (!current || !cardCase) {
      return null;
    }

    if (get().committing) {
      return null;
    }

    const achievementUnlocked =
      cardCase.unlockType === 'achievement' && cardCase.achievementId
        ? isAchievementUnlocked(cardCase.achievementId, profile)
        : false;
    const caseState = current.cases[caseId];
    const isUnlocked = Boolean(caseState?.isUnlocked || cardCase.isUnlocked || achievementUnlocked);
    const isOpened = Boolean(caseState?.isOpened);
    const price = cardCase.unlockType === 'purchase' ? cardCase.price ?? 0 : 0;

    if (!isUnlocked) {
      toast('Case locked', getRouletteCaseViews(current, profile).find((item) => item.id === caseId)?.unlockLabel ?? 'Unlock it first.', 'warning');
      return null;
    }

    if (isOpened) {
      toast('Case already opened', 'Each case currently opens once per account.', 'neutral');
      return null;
    }

    if (current.spinTokens < price) {
      toast('Not enough tokens', `This case needs ${price} spin tokens.`, 'warning');
      return null;
    }

    const card = pickWeightedCard(getCardsByIds(cardCase.cardPool));
    const previous = current;
    const timestamp = new Date().toISOString();
    const collected = collectCard(
      {
        ...current,
        spinTokens: current.spinTokens - price,
        cases: {
          ...current.cases,
          [caseId]: {
            isUnlocked: true,
            isOpened: true,
            openedAt: timestamp,
          },
        },
      },
      card,
      timestamp,
    );
    const result: OpenCaseResult = {
      caseId,
      card,
      isDuplicate: collected.isDuplicate,
      duplicateCount: collected.duplicateCount,
      spinTokensRemaining: collected.nextState.spinTokens,
    };

    set({ userState: collected.nextState, committing: true, error: null });

    void commitCaseOpen(current.uid, caseId, card.id, achievementUnlocked)
      .then(() => {
        set({ committing: false });
      })
      .catch((error: unknown) => {
        set({ userState: previous, committing: false, error: String(error) });
        toast('Case rolled back', 'Firestore rejected the case transaction.', 'danger');
      });

    return result;
  },
  grantTokens: (quantity, source) => {
    const current = get().userState;

    if (!current || quantity <= 0) {
      return;
    }

    const previous = current;
    const nextState = {
      ...current,
      spinTokens: current.spinTokens + Math.floor(quantity),
      updatedAt: new Date().toISOString(),
    };

    set({ userState: nextState, committing: true, error: null });

    void grantSpinTokens(current.uid, quantity, source)
      .then(() => {
        set({ committing: false });
        toast(source === 'purchase_stub' ? 'Spin pack added' : 'Token claimed', `${Math.floor(quantity)} spin token${quantity === 1 ? '' : 's'} added.`, 'success');
      })
      .catch((error: unknown) => {
        set({ userState: previous, committing: false, error: String(error) });
        toast('Token grant rolled back', 'Firestore rejected the token update.', 'danger');
      });
  },
  sellCard: (cardId) => {
    const current = get().userState;
    const card = ROULETTE_CARD_BY_ID[cardId];
    const entry = current?.cards[cardId];

    if (!current || !card || !entry) {
      return;
    }

    if (entry.count < 2) {
      toast('Duplicate needed', 'Marketplace sales keep one copy in your collection.', 'warning');
      return;
    }

    if (get().committing) {
      return;
    }

    const previous = current;
    const nextState: RouletteUserState = {
      ...current,
      spinTokens: current.spinTokens + card.marketValue,
      cards: {
        ...current.cards,
        [cardId]: {
          ...entry,
          count: entry.count - 1,
          lastCollectedAt: new Date().toISOString(),
        },
      },
      updatedAt: new Date().toISOString(),
    };

    set({ userState: nextState, committing: true, error: null });

    void sellDuplicateCard(current.uid, cardId)
      .then((result) => {
        set({ committing: false });
        toast('Card sold', `${result.card.name} sold for ${result.soldFor} spin tokens.`, 'success');
      })
      .catch((error: unknown) => {
        set({ userState: previous, committing: false, error: String(error) });
        toast('Sale rolled back', 'Firestore rejected the marketplace sale.', 'danger');
      });
  },
  toggleShowcaseCard: (cardId) => {
    const current = get().userState;

    if (!current || !current.cards[cardId]) {
      return;
    }

    const previous = current;
    const isPinned = current.showcaseCardIds.includes(cardId);
    const nextShowcase = isPinned
      ? current.showcaseCardIds.filter((item) => item !== cardId)
      : [...current.showcaseCardIds, cardId].slice(-PROFILE_SHOWCASE_LIMIT);
    const nextState = {
      ...current,
      showcaseCardIds: nextShowcase,
      updatedAt: new Date().toISOString(),
    };

    set({ userState: nextState, committing: true, error: null });

    void setShowcaseCards(current.uid, nextShowcase)
      .then(() => {
        set({ committing: false });
        toast(isPinned ? 'Removed from profile' : 'Added to profile', 'Your profile card showcase was updated.', 'success');
      })
      .catch((error: unknown) => {
        set({ userState: previous, committing: false, error: String(error) });
        toast('Showcase rolled back', 'Firestore rejected the profile showcase update.', 'danger');
      });
  },
  clearError: () => set({ error: null }),
}));

export function useRouletteSync(profile: UserProfile | null): void {
  const startSync = useRouletteStore((state) => state.startSync);

  useEffect(() => {
    if (!profile) {
      return undefined;
    }

    return startSync(profile);
  }, [profile, startSync]);
}

export { SPIN_PACK_SIZE };
