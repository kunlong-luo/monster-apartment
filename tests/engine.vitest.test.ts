import { describe, expect, it } from 'vitest';
import { advanceDay, placeSpirit, newGame, removeSpirit } from '../src/core/engine';
describe('Spirit apartment pure gameplay rules', () => {
  it('begins with six empty rooms', () => {
    expect(newGame().rooms).toEqual(Array(6).fill(null));
    expect(newGame().day).toBe(1);
  });
  it('does not advance an empty building', () => {
    const state = newGame();
    expect(advanceDay(state).state).toBe(state);
  });
  it('places and withdraws original spirits immutably', () => {
    const state = newGame();
    const deployed = placeSpirit(state, 0, 'seedling').state;
    const advanced = advanceDay(deployed).state;
    expect(advanced.day).toBe(2);
    expect(deployed.day).toBe(1);
    expect(removeSpirit(deployed, 0).state.rooms[0]).toBeNull();
    expect(state.rooms[0]).toBeNull();
  });
});
