'use client';

import { useMemo, useSyncExternalStore } from 'react';
import {
  GACHA_STATE_KEY,
  INITIAL_GACHA_STATE,
  type GachaState,
  saveGachaState,
  readGachaState,
  gachaSaveStatus,
  validGachaState,
  GACHA_POOLS,
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
      const parsed: unknown = JSON.parse(raw);
      // Only a validated save may drive the UI; an incomplete snapshot must
      // never crash rendering or be mistaken for spendable resources.
      if (validGachaState(parsed)) return parsed;
    } catch {
      /* ignore */
    }
    return INITIAL_GACHA_STATE;
  }, [raw]);

  // Never write a stale React snapshot over newer resources or a corrupt save.
  const updateCurrent = (update: (current: GachaState) => GachaState) => {
    if (typeof window === 'undefined' || gachaSaveStatus() !== 'ok') return;
    saveGachaState(update(readGachaState()));
  };
  const setActivePoolId = (id: string) => {
    if (!GACHA_POOLS.some(pool => pool.id === id)) return;
    updateCurrent(current => ({...current, activePoolId: id}));
  };

  const summon = (count: 1 | 10) => {
    return executeSummon(count, state.activePoolId);
  };

  const replenishTickets = (amount: number) => {
    if (!Number.isSafeInteger(amount) || amount <= 0) return;
    updateCurrent(current => ({...current, tickets: current.tickets + amount}));
  };

  const replenishCrystals = (amount: number) => {
    if (!Number.isSafeInteger(amount) || amount <= 0) return;
    updateCurrent(current => ({...current, crystals: current.crystals + amount}));
  };

  const replenishMoonstones = (amount: number) => {
    if (!Number.isSafeInteger(amount) || amount <= 0) return;
    updateCurrent(current => ({...current, moonstones: current.moonstones + amount}));
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
