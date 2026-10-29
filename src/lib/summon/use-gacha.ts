'use client';

import { useMemo, useSyncExternalStore } from 'react';
import {
  GACHA_STATE_KEY,
  INITIAL_GACHA_STATE,
  type GachaState,
  saveGachaState,
  executeSummon,
  type SummonableCharacter,
} from './gacha-engine';

const EVENT = 'monster-apartment:gacha-updated';

function subscribe(callback: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === GACHA_STATE_KEY || e.key === null) {
      callback();
    }
  };
  window.addEventListener('storage', onStorage);
  window.addEventListener(EVENT, callback);
  return () => {
    window.removeEventListener('storage', onStorage);
    window.removeEventListener(EVENT, callback);
  };
}

function getSnapshot(): string {
  if (typeof window === 'undefined') return JSON.stringify(INITIAL_GACHA_STATE);
  try {
    return window.localStorage.getItem(GACHA_STATE_KEY) || JSON.stringify(INITIAL_GACHA_STATE);
  } catch {
    return JSON.stringify(INITIAL_GACHA_STATE);
  }
}

export function useGacha(): {
  state: GachaState;
  activePoolId: string;
  setActivePoolId: (id: string) => void;
  summon: (count: 1 | 10) => { success: boolean; characters: SummonableCharacter[]; error?: string };
  replenishTickets: (amount: number) => void;
  replenishCrystals: (amount: number) => void;
  replenishMoonstones: (amount: number) => void;
} {
  const raw = useSyncExternalStore(subscribe, getSnapshot, () => JSON.stringify(INITIAL_GACHA_STATE));

  const state = useMemo<GachaState>(() => {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.tickets === 'number') {
        return parsed as GachaState;
      }
    } catch {
      /* ignore */
    }
    return INITIAL_GACHA_STATE;
  }, [raw]);

  const setActivePoolId = (id: string) => {
    const next = { ...state, activePoolId: id };
    saveGachaState(next);
  };

  const summon = (count: 1 | 10) => {
    return executeSummon(count, state.activePoolId);
  };

  const replenishTickets = (amount: number) => {
    const next = { ...state, tickets: state.tickets + amount };
    saveGachaState(next);
  };

  const replenishCrystals = (amount: number) => {
    const next = { ...state, crystals: state.crystals + amount };
    saveGachaState(next);
  };

  const replenishMoonstones = (amount: number) => {
    const next = { ...state, moonstones: state.moonstones + amount };
    saveGachaState(next);
  };

  return {
    state,
    activePoolId: state.activePoolId,
    setActivePoolId,
    summon,
    replenishTickets,
    replenishCrystals,
    replenishMoonstones,
  };
}
