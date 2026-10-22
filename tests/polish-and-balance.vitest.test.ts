import { describe, expect, it } from 'vitest';
import type { RoomSlot } from '../src/core/engine';
import { roomMotionEvents } from '../src/game/room-motion';
import {
  advanceDay, chooseNightDecision, choosePolicy, hire, newGame, TARGET_COINS,
  TARGET_SATISFACTION, nightlyEvent,
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

describe('Decisions carry consequences across the five-night arc', () => {
  const rooms: RoomSlot[] = ['slime', null, null, null, null, null];
  const past = (choice: 'care' | 'profit') => [
    { day: 1, rent: 8, upkeep: 3, synergy: 0, event: 0, eventTitle: '', eventDetail: '', net: 5, nightDecision: choice },
    { day: 2, rent: 8, upkeep: 3, synergy: 0, event: 0, eventTitle: '', eventDetail: '', net: 5, nightDecision: choice },
  ];
  it('rewards consecutive resident care with a third-night recovery', () => {
    expect(nightlyEvent(rooms, 3, 50).satisfaction).toBe(-7);
    expect(nightlyEvent(rooms, 3, 50, past('care')).satisfaction).toBe(5);
  });
  it('makes repeated profit-taking risk an inspection on night four', () => {
    expect(nightlyEvent(rooms, 4, 50).title).toBe('供暖故障');
    const penalty = nightlyEvent(rooms, 4, 50, past('profit'));
    expect(penalty.title).toBe('经营稽查');
    expect(penalty.coins).toBe(-8);
    expect(penalty.satisfaction).toBe(-5);
  });
  it('reads legacy history without choices as neutral', () => {
    const legacy = past('care').map((entry) => ({ ...entry, nightDecision: undefined }));
    expect(nightlyEvent(rooms, 3, 50, legacy)).toEqual(nightlyEvent(rooms, 3, 50));
  });
});
