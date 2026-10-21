import { create } from 'zustand';
import { advanceDay, hire, moveOrSwap, newGame } from '@/core/engine';
import type { GameOutcome, GameState, TenantId } from '@/core/engine';

type GameStore = {
  state: GameState;
  selected: number | null;
  moveSource: number | null;
  error: string;
  help: boolean;
  pickRoom: (index: number) => void;
  recruit: (tenant: TenantId) => void;
  beginMove: () => void;
  cancelMove: () => void;
  nextDay: () => void;
  reset: () => void;
  toggleHelp: () => void;
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
  pickRoom(index) {
    const { state, moveSource } = get();
    if (moveSource !== null) {
      set({ ...apply(moveOrSwap(state, moveSource, index)), moveSource: null, selected: index });
      return;
    }
    set({ selected: index, error: '' });
  },
  recruit(tenant) {
    const { state, selected } = get();
    if (selected === null) {
      set({ error: '请先选中一个房间。' });
      return;
    }
    set(apply(hire(state, selected, tenant)));
  },
  beginMove() {
    const { selected } = get();
    if (selected !== null) set({ moveSource: selected, error: '' });
  },
  cancelMove() {
    set({ moveSource: null });
  },
  nextDay() {
    set({ ...apply(advanceDay(get().state)), moveSource: null });
  },
  reset() {
    set({ state: newGame(), selected: 0, moveSource: null, error: '' });
  },
  toggleHelp() {
    set((store) => ({ help: !store.help }));
  },
}));
