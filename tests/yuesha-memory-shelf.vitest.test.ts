import {describe,expect,it} from 'vitest';
import {newCharacterLife,inspectCharacterRoom,decideYuesha} from '../src/core/character-life';
import {yueshaMemoryCards} from '../src/core/yuesha-memory-shelf';

describe('Moonsha memory shelf derives from existing durable saves',()=>{
  it('keeps new and historical V1 saves locked until actual discoveries',()=>{
    const original=newCharacterLife();
    const cards=yueshaMemoryCards(original);
    expect(cards).toHaveLength(4);
    expect(cards.every(c=>!c.unlocked)).toBe(true);
    expect(original.observations).toBeUndefined();
  });
  it('unlocks the fourth memory only after both seal and ledger, regardless of order',()=>{
    let state=inspectCharacterRoom(newCharacterLife(),'yuesha','ledger');
    expect(yueshaMemoryCards(state).map(c=>c.unlocked)).toEqual([false,false,true,false]);
    state=inspectCharacterRoom(state,'yuesha','seal');
    expect(yueshaMemoryCards(state).map(c=>c.unlocked)).toEqual([true,false,true,true]);
    state=inspectCharacterRoom(state,'yuesha','tea');
    expect(yueshaMemoryCards(state).every(c=>c.unlocked)).toBe(true);
  });
  it('does not change choice, economy or other characters to collect a card',()=>{
    const state=decideYuesha(newCharacterLife(),'careful');
    const snapshot=JSON.stringify(state);
    yueshaMemoryCards(state);
    expect(JSON.stringify(state)).toEqual(snapshot);
    expect(state.decisions['yuesha-first-visit']).toBe('careful');
  });
});
