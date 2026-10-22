import { describe, expect, it } from 'vitest';
import type { RoomSlot } from '../src/core/engine';
import { roomMotionEvents } from '../src/game/room-motion';
import { advanceDay, chooseNightDecision, newGame, placeSpirit, TARGET_COINS,
  TARGET_SATISFACTION, nightlyEvent } from '../src/core/engine';

describe('Phaser motion and original-creature occupancy', () => {
  const before: RoomSlot[] = ['seedling','pebble-crab',null,null,null,null];
  it('never animates first draw or unchanged arrays', () => {
    expect(roomMotionEvents(null,before)).toEqual(Array(6).fill('none'));
    expect(roomMotionEvents(before,[...before])).toEqual(Array(6).fill('none'));
  });
  it('distinguishes new arrivals, swaps and vacancies', () => {
    expect(roomMotionEvents(Array(6).fill(null),before).slice(0,2)).toEqual(['arrival','arrival']);
    const swapped: RoomSlot[] = ['pebble-crab','seedling',null,null,null,null];
    expect(roomMotionEvents(before,swapped).slice(0,2)).toEqual(['rearranged','rearranged']);
    const cleared: RoomSlot[] = [null,'pebble-crab',null,null,null,null];
    expect(roomMotionEvents(before,cleared)[0]).toBe('vacated');
  });
});
describe('Five-night balance', () => {
  it('can win using distinct spirit roles and a matched layout', () => {
    let state = newGame();
    for (const [room,id] of [[0,'pebble-crab'],[1,'lantern-beetle'],[3,'prism-mole'],
      [4,'fern-hare'],[5,'seedling']] as const) state=placeSpirit(state,room,id).state;
    for (let i=0;i<5;i++) state=advanceDay(state).state;
    expect(state.coins).toBeGreaterThanOrEqual(TARGET_COINS);
    expect(state.satisfaction).toBeGreaterThanOrEqual(TARGET_SATISFACTION);
    expect(state.outcome).toBe('win');
  });
  it('a single starting spirit does not automatically win', () => {
    let state=placeSpirit(newGame(),5,'seedling').state;
    for(let i=0;i<5;i++)state=advanceDay(state).state;
    expect(state.outcome).toBe('lose');
  });
  it('care on two early nights alters the third-night event', () => {
    let state=placeSpirit(newGame(),5,'seedling').state;
    for(let i=0;i<2;i++)state=advanceDay(chooseNightDecision(state,'care').state).state;
    expect(nightlyEvent(state.rooms,3,state.satisfaction,state.history).title).toBe('灵核互助');
    expect(nightlyEvent(state.rooms,3,state.satisfaction).title).toBe('星轨访客');
  });
});
