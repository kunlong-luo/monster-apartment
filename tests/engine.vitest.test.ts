import { describe, expect, it } from 'vitest';
import { advanceDay, hire, newGame } from '../src/core/engine.js';

describe('Monster Apartment deterministic game rules', () => {
  it('creates six rooms and begins on day 1', () => {
    const game = newGame();
    expect(game.rooms).toHaveLength(6);
    expect(game.day).toBe(1);
  });
  it('refuses to settle an empty building', () => {
    const game = newGame();
    const result = advanceDay(game);
    expect(result.error).toBeTruthy();
    expect(result.state).toBe(game);
  });
  it('can advance a day without mutating the original state', () => {
    const game = hire(newGame(), 0, 'slime').state;
    const result = advanceDay(game);
    expect(game.day).toBe(1);
    expect(result.error).toBeNull();
    expect(result.state.day).toBe(2);
  });
});
