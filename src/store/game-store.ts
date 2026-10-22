import { create } from 'zustand';
import { advanceDay, choosePolicy, chooseNightDecision, hire, moveOrSwap, newGame } from '@/core/engine';
import type { GameOutcome, GameState, TenantId, PolicyId, NightDecisionId } from '@/core/engine';
import type { Locale } from '@/lib/i18n';
import type { SaveData } from '@/lib/save-game';
import { newCollection, summon, equipSpirit, swapEquipped, nightCollectionReward, levelSpirit, evolveSpirit } from '@/core/spirit-collection';
import type { CollectionState, SpiritId } from '@/core/spirit-collection';

type GameStore = {
  state: GameState;
  collection: CollectionState;
  collectionError: string;
  selected: number | null;
  moveSource: number | null;
  error: string;
  help: boolean;
  locale: Locale;
  tutorialActive: boolean;
  tutorialStep: number;
  saveAvailable: boolean;
  hydrated: boolean;
  pickRoom: (index: number) => void;
  recruit: (tenant: TenantId) => void;
  beginMove: () => void;
  cancelMove: () => void;
  nextDay: () => void;
  summonSpirits: (count: 1 | 10) => void;
  assignSpirit: (id: SpiritId | null) => void;
  trainSpirit: (id: SpiritId) => void;
  evolveCompanion: (id: SpiritId) => void;
  setPolicy: (policy: PolicyId) => void;
  setNightDecision: (decision: NightDecisionId) => void;
  reset: () => void;
  toggleHelp: () => void;
  setLocale: (locale: Locale) => void;
  nextTutorial: () => void;
  skipTutorial: () => void;
  replayTutorial: () => void;
  restoreSave: (saved: SaveData) => void;
  setSaveAvailable: (available: boolean) => void;
  setHydrated: () => void;
};

const apply = (result: GameOutcome): Pick<GameStore, 'state' | 'error'> => ({
  state: result.state,
  error: result.error ?? '',
});

export const useGameStore = create<GameStore>((set, get) => ({
  state: newGame(),
  collection: newCollection(),
  collectionError: '',
  selected: 0,
  moveSource: null,
  error: '',
  help: false,
  locale: 'zh',
  tutorialActive: true,
  tutorialStep: 0,
  saveAvailable: false,
  hydrated: false,
  pickRoom(index) {
    const { state, moveSource, tutorialActive, tutorialStep } = get();
    if (moveSource !== null) {
      const result = moveOrSwap(state, moveSource, index);
      set({ ...apply(result),
        collection: result.error ? get().collection : swapEquipped(get().collection, moveSource, index),
        moveSource: result.error ? moveSource : null, selected: index });
      return;
    }
    set({
      selected: index,
      error: '',
      tutorialStep: tutorialActive && tutorialStep === 0 ? 1 : tutorialStep,
    });
  },
  recruit(tenant) {
    const { state, selected, tutorialActive, tutorialStep } = get();
    if (selected === null) {
      set({ error: '请先选中一个房间。' });
      return;
    }
    const result = hire(state, selected, tenant);
    set({
      ...apply(result),
      tutorialStep: !result.error && tutorialActive && tutorialStep === 1 ? 2 : tutorialStep,
    });
  },
  beginMove() {
    const { selected, state, tutorialActive, tutorialStep } = get();
    if (selected !== null && state.rooms[selected] && !state.over) {
      set({
        moveSource: selected,
        error: '',
        tutorialStep: tutorialActive && tutorialStep === 2 ? 3 : tutorialStep,
      });
    }
  },
  cancelMove() {
    set({ moveSource: null });
  },
  setPolicy(policy) {
    set(apply(choosePolicy(get().state, policy)));
  },
  setNightDecision(decision) {
    set(apply(chooseNightDecision(get().state, decision)));
  },
  nextDay() {
    const { state, collection, tutorialActive, tutorialStep } = get();
    const result = advanceDay(state, collection);
    set({
      ...apply(result),
      collection: result.error ? collection : nightCollectionReward(collection),
      moveSource: null,
      tutorialActive: result.error || !tutorialActive || tutorialStep !== 3 ? tutorialActive : false,
    });
  },
  summonSpirits(count) {
    const random = () => {
      const values = new Uint32Array(1);
      crypto.getRandomValues(values);
      return values[0] / 4294967296;
    };
    const result = summon(get().collection, count, random);
    set({ collection: result.collection, collectionError: result.error ?? '' });
  },
  assignSpirit(id) {
    const { selected, state, collection } = get();
    const result = equipSpirit(collection, selected ?? -1, id, state.rooms);
    set({ collection: result.collection, collectionError: result.error ?? '' });
  },
  trainSpirit(id) {
    const result = levelSpirit(get().collection, id);
    set({ collection: result.collection, collectionError: result.error ?? '' });
  },
  evolveCompanion(id) {
    const result = evolveSpirit(get().collection, id);
    set({ collection: result.collection, collectionError: result.error ?? '' });
  },
  reset() {
    set((current) => ({ state: newGame(), selected: 0, moveSource: null, error: '',
      collectionError: '', collection: { ...current.collection,
        equipped: [null, null, null, null, null, null] } }));
  },
  toggleHelp() {
    set((store) => ({ help: !store.help }));
  },
  setLocale(locale) {
    set({ locale });
  },
  nextTutorial() {
    const { tutorialStep } = get();
    set(tutorialStep >= 3
      ? { tutorialActive: false }
      : { tutorialActive: true, tutorialStep: tutorialStep + 1 });
  },
  skipTutorial() {
    set({ tutorialActive: false });
  },
  replayTutorial() {
    set({ tutorialActive: true, tutorialStep: 0 });
  },
  restoreSave(saved) {
    set({
      state: saved.state, locale: saved.locale,
      collection: saved.collection ?? newCollection(), collectionError: '',
      tutorialActive: saved.tutorialActive,
      tutorialStep: saved.tutorialStep,
      selected: 0, moveSource: null, error: '',
    });
  },
  setSaveAvailable(available) {
    if (get().saveAvailable !== available) set({ saveAvailable: available });
  },
  setHydrated() {
    if (!get().hydrated) set({ hydrated: true });
  },
}));
