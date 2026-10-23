import { describe, expect, it } from 'vitest';
import {
  newCozyGame, buildCozyRoom, moveInCozy, decorateCozy, advanceCozy,
  residentHappiness, buildingHappiness, dailyRent, availableResidents,
  residentActivity, adjacent, cozyGoal, cozyDay, validCozySave, MAX_TICKS, TICKS_PER_DAY,
} from '../src/core/cozy-engine';
import type { CozyState } from '../src/core/cozy-engine';

const day = (initial: CozyState, days=1):CozyState => {
  let state=initial;
  for(let i=0;i<days*TICKS_PER_DAY;i++)state=advanceCozy(state);
  return state;
};
describe('A single cozy apartment building loop',()=>{
  it('starts with a real resident, one furnished room and two eager applicants',()=>{
    const game=newCozyGame();
    expect(game.coins).toBe(105);
    expect(game.rooms[4]).toEqual({type:'nest',resident:'seedling',decor:'plant'});
    expect(availableResidents(game)).toEqual(['dewdrop','lantern-beetle']);
    expect(buildingHappiness(game)).toBe(88);
    expect(cozyGoal(game).success).toBe(false);
    expect(validCozySave(game)).toBe(true);
  });
  it('construction costs coins, creates different room types and cannot be paid twice',()=>{
    const original=newCozyGame();
    const built=buildCozyRoom(original,2,'bath');
    expect(built.coins).toBe(71);
    expect(built.rooms[2]).toMatchObject({type:'bath',resident:null});
    expect(buildCozyRoom(built,2,'bath')).toBe(built);
    expect(buildCozyRoom(original,4,'nest')).toBe(original);
    expect(buildCozyRoom(original,-1,'bath')).toBe(original);
    expect(original.rooms[2]).toBeNull();
    expect(buildCozyRoom({...original,coins:1},0,'bath')).toBeDefined();
    expect(buildCozyRoom({...original,coins:1},0,'bath').rooms[0]).toBeNull();
  });
  it('moving in connects the housing choices to happiness and rent',()=>{
    const baseline=newCozyGame();
    const wrong=moveInCozy(buildCozyRoom(baseline,2,'nest'),2,'dewdrop');
    const suited=moveInCozy(buildCozyRoom(baseline,2,'bath'),2,'dewdrop');
    expect(residentHappiness(suited,'dewdrop')).toBeGreaterThan(residentHappiness(wrong,'dewdrop'));
    expect(dailyRent(suited)).toBeGreaterThan(dailyRent(wrong));
    expect(moveInCozy(suited,0,'dewdrop')).toBe(suited);
    expect(moveInCozy(suited,2,'lantern-beetle')).toBe(suited);
    expect(availableResidents(suited)).toEqual(['lantern-beetle']);
  });
  it('a favorite decoration increases joy and affects actual earnings',()=>{
    let game=moveInCozy(buildCozyRoom(newCozyGame(),2,'bath'),2,'dewdrop');
    const unhappy=residentHappiness(game,'dewdrop');
    const before=dailyRent(game);
    game=decorateCozy(game,2,'books');
    expect(game.coins).toBe(59);
    expect(residentHappiness(game,'dewdrop')).toBeGreaterThan(unhappy);
    expect(dailyRent(game)).toBeGreaterThan(before);
    expect(decorateCozy(game,2,'books')).toBe(game);
  });
  it('neighbor placement forms bonds and unlocks an actual story',()=>{
    const base=newCozyGame();
    expect(adjacent(4,5)).toBe(true);
    expect(adjacent(4,2)).toBe(true);
    expect(adjacent(4,1)).toBe(false);
    let game=moveInCozy(buildCozyRoom(base,2,'bath'),2,'dewdrop');
    game=moveInCozy(buildCozyRoom(game,5,'greenhouse'),5,'fern-hare');
    // Fernhare becomes available after the first morning.
    expect(game.rooms[5]?.resident).toBeNull();
    game=day(game);
    game=moveInCozy(game,5,'fern-hare');
    expect(game.rooms[5]?.resident).toBe('fern-hare');
    game=day(game,2);
    expect(game.journal.some(e=>e.key.includes('friends')&&e.zh.includes('芽核'))).toBe(true);
    expect(Object.values(game.bonds).some(n=>n>=2)).toBe(true);
  });
  it('morning rent and new visitors arrive with daily activities and no clicks',()=>{
    let game=newCozyGame();
    const income=dailyRent(game);
    game=day(game);
    expect(game.coins).toBe(105+income);
    expect(game.lastIncome).toBe(income);
    expect(game.journal.some(e=>e.kind==='rent')).toBe(true);
    expect(availableResidents(game)).toContain('fern-hare');
    expect(cozyDay(game.tick)).toBe(2);
    expect(residentActivity(0,'seedling')).toBe('sleep');
    expect(residentActivity(5,'seedling')).toBe('work');
    game=day(game,2);
    expect(availableResidents(game)).toContain('moon-scout');
  });
  it('runs a first week, then freezes with a clear resident-based result',()=>{
    let game=newCozyGame();
    for(let n=0;n<MAX_TICKS;n++)game=advanceCozy(game);
    expect(game.phase).toBe('complete');
    expect(game.tick).toBe(MAX_TICKS);
    expect(advanceCozy(game)).toBe(game);
    expect(buildCozyRoom(game,0,'bath')).toBe(game);
    expect(game.journal.at(-1)?.key).toBe('finish');
    expect(validCozySave(game)).toBe(true);
  });
  it('rejects tampered saves and keeps old prototype saves separate',()=>{
    const game=newCozyGame();
    expect(validCozySave({...game,coins:-1})).toBe(false);
    expect(validCozySave({...game,tick:500})).toBe(false);
    expect(validCozySave({...game,rooms:[]})).toBe(false);
    const duplicate={...game,rooms:game.rooms.map(room=>room?{...room}:null)};
    duplicate.rooms[0]={type:'nest',resident:'seedling',decor:null};
    expect(validCozySave(duplicate)).toBe(false);
    expect(validCozySave({...game,known:['seedling','evil']})).toBe(false);
    expect(validCozySave(game)).toBe(true);
  });
});
