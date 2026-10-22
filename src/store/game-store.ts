import { create } from 'zustand';
import { advanceDay, choosePolicy, chooseNightDecision, hire, moveOrSwap, newGame } from '@/core/engine';
import type { GameOutcome, GameState, TenantId, PolicyId, NightDecisionId } from '@/core/engine';
import type { Locale } from '@/lib/i18n';
import type { SaveData } from '@/lib/save-game';

type GameStore = {
  state: GameState;
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
      set({ ...apply(moveOrSwap(state, moveSource, index)), moveSource: null, selected: index });
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
    const { state, tutorialActive, tutorialStep } = get();
    const result = advanceDay(state);
    set({
      ...apply(result),
      moveSource: null,
      tutorialActive: result.error || !tutorialActive || tutorialStep !== 3 ? tutorialActive : false,
    });
  },
  reset() {
    set({ state: newGame(), selected: 0, moveSource: null, error: '' });
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
