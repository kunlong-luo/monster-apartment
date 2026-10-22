import { describe, expect, it } from 'vitest';
import type { RoomSlot } from '../src/core/engine';
import { roomMotionEvents } from '../src/game/room-motion';
import {
  advanceDay, chooseNightDecision, choosePolicy, hire, newGame, TARGET_COINS,
  TARGET_SATISFACTION,
} from '../src/core/engine';

describe('Phaser visual motion contracts', () => {
  const before: RoomSlot[] = ['slime', 'ember', null, null, null, null];
  it('does not replay animations on initial hydration or unchanged redraws', () => {
    expect(roomMotionEvents(null, before)).toEqual(Array(6).fill('none'));
    expect(roomMotionEvents(before, [...before])).toEqual(Array(6).fill('none'));
  });
  it('distinguishes new tenants, transfers, swaps and vacating a room', () => {
    expect(roomMotionEvents(Array(6).fill(null), before))
      .toEqual(['arrival', 'arrival', 'none', 'none', 'none', 'none']);
    const after: RoomSlot[] = ['ember', 'slime', null, null, null, null];
    expect(roomMotionEvents(before, after).slice(0, 2)).toEqual(['rearranged', 'rearranged']);
    const repeated: RoomSlot[] = ['slime', 'ember', 'slime', null, null, null];
    expect(roomMotionEvents(before, repeated)[2]).toBe('arrival');
    const moved: RoomSlot[] = [null, 'ember', 'slime', null, null, null];
    expect(roomMotionEvents(before, moved).slice(0, 3)).toEqual(['vacated', 'none', 'rearranged']);
  });
});

describe('Five-night balance regressions', () => {
  const layout: [number, 'slime' | 'ember'][] =
    [[1, 'slime'], [2, 'slime'], [3, 'ember'], [4, 'ember'], [5, 'slime']];
  function run(decisions: 'none' | 'care' | 'profit') {
    let state = newGame();
    for (const [room, tenant] of layout) state = hire(state, room, tenant).state;
    for (let i = 0; i < 5; i++) {
      state = advanceDay(chooseNightDecision(state, decisions).state).state;
    }
    return state;
  }
  it('makes resident care a real recovery path for a profitable but unhappy layout', () => {
    const steady = run('none');
    const care = run('care');
    const profit = run('profit');
    expect(steady.coins).toBeGreaterThanOrEqual(TARGET_COINS);
    expect(steady.satisfaction).toBeLessThan(TARGET_SATISFACTION);
    expect(steady.outcome).toBe('lose');
    expect(care.satisfaction).toBeGreaterThanOrEqual(TARGET_SATISFACTION);
    expect(care.coins).toBeGreaterThanOrEqual(TARGET_COINS);
    expect(care.outcome).toBe('win');
    expect(profit.coins).toBeGreaterThan(care.coins);
    expect(profit.satisfaction).toBeLessThan(steady.satisfaction);
    expect(profit.outcome).toBe('lose');
  });
  it('keeps the simple matched four-tenant strategy winnable without any night choice', () => {
    let state = newGame();
    for (const [room, tenant] of [
      [0, 'slime'], [1, 'ember'], [2, 'ghost'], [3, 'golem'],
    ] as const) state = hire(state, room, tenant).state;
    for (let i = 0; i < 5; i++) state = advanceDay(choosePolicy(state, 'steady').state).state;
    expect(state.coins).toBeGreaterThanOrEqual(TARGET_COINS);
    expect(state.satisfaction).toBeGreaterThanOrEqual(TARGET_SATISFACTION);
    expect(state.outcome).toBe('win');
  });
});
