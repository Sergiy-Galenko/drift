import {
  doc,
  onSnapshot,
  runTransaction,
  setDoc,
  type DocumentData,
  type DocumentSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';

import { db } from '@/lib/firebase/config';

import { ROULETTE_CASE_BY_ID, ROULETTE_CASES } from '../config/casesData';
import { MAIN_ROULETTE_CARD_IDS, ROULETTE_CARD_BY_ID } from '../config/cardsData';
import { ROULETTE_INITIAL_SPIN_TOKENS, ROULETTE_SPIN_COST } from '../config/rouletteConfig';
import type {
  Card,
  MarketSaleResult,
  OpenCaseResult,
  RouletteUserState,
  SpinResult,
  SpinTokenGrantSource,
  UserCardEntry,
  UserCaseState,
} from '../types/roulette.types';

const COLLECTION_NAME = 'rouletteCollections';

function rouletteStateRef(uid: string) {
  return doc(db, COLLECTION_NAME, uid);
}

function nowIso(): string {
  return new Date().toISOString();
}

function defaultCaseStates(): Record<string, UserCaseState> {
  return ROULETTE_CASES.reduce<Record<string, UserCaseState>>((map, cardCase) => {
    map[cardCase.id] = {
      isUnlocked: cardCase.unlockType === 'purchase',
      isOpened: false,
      openedAt: null,
    };
    return map;
  }, {});
}

function normalizeCards(cards: RouletteUserState['cards'] | undefined): RouletteUserState['cards'] {
  if (!cards) {
    return {};
  }

  return Object.entries(cards).reduce<RouletteUserState['cards']>((map, [cardId, entry]) => {
    const count = Number.isFinite(entry.count) ? Math.max(1, Math.floor(entry.count)) : 1;
    map[cardId] = {
      cardId,
      count,
      firstCollectedAt: entry.firstCollectedAt || nowIso(),
      lastCollectedAt: entry.lastCollectedAt || entry.firstCollectedAt || nowIso(),
    };
    return map;
  }, {});
}

function normalizeCases(cases: RouletteUserState['cases'] | undefined): RouletteUserState['cases'] {
  const defaults = defaultCaseStates();

  if (!cases) {
    return defaults;
  }

  return ROULETTE_CASES.reduce<RouletteUserState['cases']>((map, cardCase) => {
    const state = cases[cardCase.id];
    map[cardCase.id] = {
      isUnlocked: Boolean(state?.isUnlocked ?? defaults[cardCase.id].isUnlocked),
      isOpened: Boolean(state?.isOpened),
      openedAt: state?.openedAt ?? null,
    };
    return map;
  }, {});
}

export function makeDefaultRouletteState(uid: string, timestamp = nowIso()): RouletteUserState {
  return {
    uid,
    spinTokens: ROULETTE_INITIAL_SPIN_TOKENS,
    cards: {},
    cases: defaultCaseStates(),
    showcaseCardIds: [],
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function normalizeRouletteState(uid: string, data?: Partial<RouletteUserState>): RouletteUserState {
  const fallback = makeDefaultRouletteState(uid);

  if (!data) {
    return fallback;
  }

  return {
    uid,
    spinTokens: Number.isFinite(data.spinTokens) ? Math.max(0, Math.floor(data.spinTokens ?? 0)) : fallback.spinTokens,
    cards: normalizeCards(data.cards),
    cases: normalizeCases(data.cases),
    showcaseCardIds: Array.isArray(data.showcaseCardIds)
      ? data.showcaseCardIds.filter((cardId): cardId is string => typeof cardId === 'string' && Boolean(ROULETTE_CARD_BY_ID[cardId]))
      : fallback.showcaseCardIds,
    createdAt: data.createdAt || fallback.createdAt,
    updatedAt: data.updatedAt || fallback.updatedAt,
  };
}

function mapSnapshot(uid: string, snapshot: DocumentSnapshot<DocumentData>): RouletteUserState | null {
  if (!snapshot.exists()) {
    return null;
  }

  return normalizeRouletteState(uid, snapshot.data() as Partial<RouletteUserState>);
}

export function getCollectedCount(state: RouletteUserState): number {
  return Object.values(state.cards).filter((entry) => entry.count > 0).length;
}

export function collectCard(
  state: RouletteUserState,
  card: Card,
  timestamp = nowIso(),
): { nextState: RouletteUserState; isDuplicate: boolean; duplicateCount: number } {
  const existing = state.cards[card.id];
  const duplicateCount = (existing?.count ?? 0) + 1;
  const nextEntry: UserCardEntry = {
    cardId: card.id,
    count: duplicateCount,
    firstCollectedAt: existing?.firstCollectedAt ?? timestamp,
    lastCollectedAt: timestamp,
  };

  return {
    nextState: {
      ...state,
      cards: {
        ...state.cards,
        [card.id]: nextEntry,
      },
      updatedAt: timestamp,
    },
    isDuplicate: Boolean(existing),
    duplicateCount,
  };
}

export function subscribeRouletteState(
  uid: string,
  onData: (state: RouletteUserState) => void,
  onError: (message: string) => void,
): Unsubscribe {
  const ref = rouletteStateRef(uid);

  return onSnapshot(
    ref,
    (snapshot) => {
      const mapped = mapSnapshot(uid, snapshot);

      if (mapped) {
        onData(mapped);
        return;
      }

      const defaults = makeDefaultRouletteState(uid);
      onData(defaults);
      void setDoc(ref, defaults, { merge: true }).catch((error: unknown) => {
        onError(String(error));
      });
    },
    (error) => onError(error.code),
  );
}

export async function commitSpin(uid: string, cardId: string): Promise<SpinResult> {
  const card = ROULETTE_CARD_BY_ID[cardId];

  if (!card || !MAIN_ROULETTE_CARD_IDS.includes(cardId)) {
    throw new Error('roulette-invalid-card');
  }

  return runTransaction(db, async (transaction) => {
    const ref = rouletteStateRef(uid);
    const snapshot = await transaction.get(ref);
    const current = mapSnapshot(uid, snapshot) ?? makeDefaultRouletteState(uid);

    if (current.spinTokens < ROULETTE_SPIN_COST) {
      throw new Error('roulette-not-enough-tokens');
    }

    const collected = collectCard(
      {
        ...current,
        spinTokens: current.spinTokens - ROULETTE_SPIN_COST,
      },
      card,
    );

    transaction.set(ref, collected.nextState, { merge: true });

    return {
      card,
      isDuplicate: collected.isDuplicate,
      duplicateCount: collected.duplicateCount,
      spinTokensRemaining: collected.nextState.spinTokens,
    };
  });
}

export async function commitCaseOpen(
  uid: string,
  caseId: string,
  cardId: string,
  achievementUnlocked: boolean,
): Promise<OpenCaseResult> {
  const cardCase = ROULETTE_CASE_BY_ID[caseId];
  const card = ROULETTE_CARD_BY_ID[cardId];

  if (!cardCase || !card || !cardCase.cardPool.includes(cardId)) {
    throw new Error('roulette-invalid-case');
  }

  return runTransaction(db, async (transaction) => {
    const ref = rouletteStateRef(uid);
    const snapshot = await transaction.get(ref);
    const current = mapSnapshot(uid, snapshot) ?? makeDefaultRouletteState(uid);
    const currentCase = current.cases[caseId] ?? defaultCaseStates()[caseId];
    const isUnlocked = currentCase.isUnlocked || cardCase.unlockType === 'purchase' || achievementUnlocked;

    if (!isUnlocked) {
      throw new Error('roulette-case-locked');
    }

    if (currentCase.isOpened) {
      throw new Error('roulette-case-opened');
    }

    const price = cardCase.unlockType === 'purchase' ? cardCase.price ?? 0 : 0;

    if (current.spinTokens < price) {
      throw new Error('roulette-not-enough-tokens');
    }

    const timestamp = nowIso();
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
        updatedAt: timestamp,
      },
      card,
      timestamp,
    );

    transaction.set(ref, collected.nextState, { merge: true });

    return {
      caseId,
      card,
      isDuplicate: collected.isDuplicate,
      duplicateCount: collected.duplicateCount,
      spinTokensRemaining: collected.nextState.spinTokens,
    };
  });
}

export async function unlockCase(uid: string, caseId: string): Promise<void> {
  const ref = rouletteStateRef(uid);

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(ref);
    const current = mapSnapshot(uid, snapshot) ?? makeDefaultRouletteState(uid);
    const currentCase = current.cases[caseId] ?? defaultCaseStates()[caseId];
    const timestamp = nowIso();

    transaction.set(
      ref,
      {
        ...current,
        cases: {
          ...current.cases,
          [caseId]: {
            ...currentCase,
            isUnlocked: true,
          },
        },
        updatedAt: timestamp,
      },
      { merge: true },
    );
  });
}

export async function sellDuplicateCard(uid: string, cardId: string): Promise<MarketSaleResult> {
  const card = ROULETTE_CARD_BY_ID[cardId];

  if (!card) {
    throw new Error('roulette-invalid-card');
  }

  return runTransaction(db, async (transaction) => {
    const ref = rouletteStateRef(uid);
    const snapshot = await transaction.get(ref);
    const current = mapSnapshot(uid, snapshot) ?? makeDefaultRouletteState(uid);
    const entry = current.cards[cardId];

    if (!entry || entry.count < 2) {
      throw new Error('roulette-market-needs-duplicate');
    }

    const timestamp = nowIso();
    const remainingCount = entry.count - 1;
    const nextCards = {
      ...current.cards,
      [cardId]: {
        ...entry,
        count: remainingCount,
        lastCollectedAt: timestamp,
      },
    };
    const nextState: RouletteUserState = {
      ...current,
      spinTokens: current.spinTokens + card.marketValue,
      cards: nextCards,
      updatedAt: timestamp,
    };

    transaction.set(ref, nextState, { merge: true });

    return {
      card,
      soldFor: card.marketValue,
      remainingCount,
      spinTokensRemaining: nextState.spinTokens,
    };
  });
}

export async function setShowcaseCards(uid: string, cardIds: string[]): Promise<string[]> {
  return runTransaction(db, async (transaction) => {
    const ref = rouletteStateRef(uid);
    const snapshot = await transaction.get(ref);
    const current = mapSnapshot(uid, snapshot) ?? makeDefaultRouletteState(uid);
    const uniqueCardIds = Array.from(new Set(cardIds)).filter((cardId) => Boolean(current.cards[cardId]));
    const timestamp = nowIso();

    transaction.set(
      ref,
      {
        ...current,
        showcaseCardIds: uniqueCardIds,
        updatedAt: timestamp,
      },
      { merge: true },
    );

    return uniqueCardIds;
  });
}

export async function grantSpinTokens(uid: string, quantity: number, source: SpinTokenGrantSource): Promise<void> {
  if (quantity <= 0) {
    return;
  }

  if (source === 'purchase_stub') {
    // TODO: integrate with real backend payment flow.
    // Expected contract: purchase endpoint verifies the store receipt server-side
    // and grants tokens from a trusted environment before this client state updates.
  }

  if (source === 'daily_activity' || source === 'weekly_activity' || source === 'achievement') {
    // TODO: integrate with real backend activity reward flow.
    // Expected contract: reward endpoint checks the daily/weekly/achievement claim
    // idempotently and returns the updated SpinToken balance.
  }

  const ref = rouletteStateRef(uid);

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(ref);
    const current = mapSnapshot(uid, snapshot) ?? makeDefaultRouletteState(uid);
    const timestamp = nowIso();

    transaction.set(
      ref,
      {
        ...current,
        spinTokens: current.spinTokens + Math.floor(quantity),
        updatedAt: timestamp,
      },
      { merge: true },
    );
  });
}
