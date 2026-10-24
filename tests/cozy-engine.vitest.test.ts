import { describe, expect, it } from 'vitest';
import {
  newCozyGame, buildCozyRoom, moveInCozy, decorateCozy, advanceCozy,
  residentHappiness, buildingHappiness, dailyRent, availableResidents,
  residentActivity, adjacent, cozyGoal, cozyDay, validCozySave, MAX_TICKS, TICKS_PER_DAY,
  relocateCozyResident, previewCozyRelocation, cozyVisits, cozyNeighborhood, cozyDailyIncome,
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
  it('relocates or swaps existing residents without cloning them or moving furniture',()=>{
    const built=moveInCozy(buildCozyRoom(newCozyGame(),2,'bath'),2,'dewdrop');
    const originalRent=dailyRent(built);
    const forecast=previewCozyRelocation(built,4,2);
    expect(forecast).not.toBeNull();
    expect(forecast!.moving).toBe('seedling');
    expect(forecast!.displaced).toBe('dewdrop');
    expect(forecast!.rent).toBeLessThan(0);
    const exchanged=relocateCozyResident(built,4,2);
    expect(exchanged.rooms[2]).toEqual({type:'bath',resident:'seedling',decor:null});
    expect(exchanged.rooms[4]).toEqual({type:'nest',resident:'dewdrop',decor:'plant'});
    expect(exchanged.coins).toBe(built.coins);
    expect(dailyRent(exchanged)).toBe(originalRent+forecast!.rent);
    expect(exchanged.journal.at(-1)?.zh).toContain('交换');
    expect(built.rooms[4]?.resident).toBe('seedling');
    expect(relocateCozyResident(exchanged,2,4).rooms).toEqual(built.rooms);
    expect(validCozySave(exchanged)).toBe(true);
  });
  it('can move a resident into an empty built room while furniture stays behind',()=>{
    const base=buildCozyRoom(newCozyGame(),5,'nest');
    const moved=relocateCozyResident(base,4,5);
    expect(moved.rooms[4]).toMatchObject({type:'nest',decor:'plant',resident:null});
    expect(moved.rooms[5]).toMatchObject({type:'nest',decor:null,resident:'seedling'});
    expect(moved.known).toEqual(base.known);
    expect(relocateCozyResident(base,4,4)).toBe(base);
    expect(relocateCozyResident(base,4,1)).toBe(base);
    expect(relocateCozyResident(base,0,5)).toBe(base);
    expect(previewCozyRelocation(base,4,1)).toBeNull();
  });
  it('real visitors appear in neighboring rooms on their own schedules',()=>{
    const neighbors=moveInCozy(buildCozyRoom(newCozyGame(),2,'bath'),2,'dewdrop');
    expect(cozyVisits(neighbors,7)).toContainEqual({from:2,to:4,visitor:'dewdrop',host:'seedling'});
    expect(cozyVisits(neighbors,5)).toEqual([]);
    const relocated=relocateCozyResident(buildCozyRoom(neighbors,0,'bath'),2,0);
    expect(cozyVisits(relocated,7)).not.toContainEqual({
      from:2,to:4,visitor:'dewdrop',host:'seedling',
    });
    expect(cozyVisits(relocated,7)).toEqual([]);
    const bonded=day(neighbors,2);
    expect(bonded.journal.some(entry=>entry.key==='friends-dewdrop:seedling')).toBe(true);
    const distant=day(relocated,2);
    expect(distant.journal.some(entry=>entry.key==='friends-dewdrop:seedling')).toBe(false);
  });

  it('inhabited workspaces earn modest craft income on the same morning as rent',()=>{
    const alone=newCozyGame();
    expect(cozyDailyIncome(alone)).toEqual({rent:dailyRent(alone),craft:0,gifts:0,total:dailyRent(alone)});
    let studio=buildCozyRoom(alone,2,'workshop');
    expect(cozyDailyIncome(studio).craft).toBe(0); // vacant rooms never produce
    studio=moveInCozy(studio,2,'lantern-beetle');
    expect(cozyDailyIncome(studio).craft).toBe(3);
    const furnished=decorateCozy(studio,2,'lamp');
    expect(cozyDailyIncome(furnished).craft).toBe(5);
    const rent=dailyRent(furnished);
    const forecast=cozyDailyIncome(furnished);
    expect(forecast.total).toBe(rent+5);
    const payday=day(furnished);
    expect(payday.coins).toBe(furnished.coins+forecast.total);
    expect(payday.lastIncome).toBe(forecast.total);
    expect(payday.journal.findLast(item=>item.kind==='rent')?.zh).toContain('制作 5');
    expect(validCozySave(payday)).toBe(true);
  });
  it('a planted neighbor helps nearby tenants, and moving away removes the effect',()=>{
    let home=day(newCozyGame()); // day two makes fern-hare available
    home=buildCozyRoom(home,5,'greenhouse');
    home=moveInCozy(home,5,'fern-hare');
    const before=cozyNeighborhood(home,'seedling');
    expect(before.care).toBe(1);
    expect(cozyDailyIncome(home).craft).toBe(1);
    const planted=decorateCozy(home,5,'plant');
    expect(cozyNeighborhood(planted,'seedling').care).toBe(4);
    expect(residentHappiness(planted,'seedling')).toBeGreaterThan(residentHappiness(home,'seedling'));
    expect(cozyDailyIncome(planted).craft).toBe(3);
    const separate=buildCozyRoom(planted,0,'nest');
    const moved=relocateCozyResident(separate,5,0);
    expect(cozyNeighborhood(moved,'seedling').care).toBe(0);
    expect(cozyDailyIncome(moved).craft).toBe(0);
  });
  it('real visits earn friendship comfort and later gifts, not passive adjacency alone',()=>{
    const base=moveInCozy(buildCozyRoom(newCozyGame(),2,'bath'),2,'dewdrop');
    expect(cozyNeighborhood(base,'seedling').friendship).toBe(0);
    expect(cozyDailyIncome(base).gifts).toBe(0);
    const first=day(base);
    expect(first.bonds['dewdrop:seedling']).toBe(1);
    expect(cozyNeighborhood(first,'seedling').friendship).toBe(2);
    expect(cozyDailyIncome(first).gifts).toBe(0);
    const second=day(first);
    expect(second.bonds['dewdrop:seedling']).toBe(2);
    expect(cozyNeighborhood(second,'seedling').friendship).toBe(4);
    expect(cozyDailyIncome(second).gifts).toBe(2);
    const third=day(second);
    expect(cozyNeighborhood(third,'seedling').friendship).toBe(6);
    expect(cozyDailyIncome(third).gifts).toBe(2);
    const fourth=day(third);
    expect(cozyNeighborhood(fourth,'seedling').friendship).toBe(6);
    const moved=relocateCozyResident(buildCozyRoom(fourth,0,'nest'),2,0);
    expect(cozyNeighborhood(moved,'seedling').friendship).toBe(0);
    expect(cozyDailyIncome(moved).gifts).toBe(0);
    // The stored relationship survives: restore proximity and the bond matters again.
    const reunited=relocateCozyResident(moved,0,2);
    expect(cozyNeighborhood(reunited,'seedling').friendship).toBe(6);
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
