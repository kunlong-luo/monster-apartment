import { describe, expect, it } from 'vitest';
import {
  newCozyGame, COZY_RESIDENTS, buildCozyRoom, moveInCozy, decorateCozy, advanceCozy,
  residentHappiness, buildingHappiness, dailyRent, availableResidents,
  residentActivity, adjacent, cozyGoal, cozyDay, validCozySave, MAX_TICKS, TICKS_PER_DAY,
  relocateCozyResident, previewCozyRelocation, cozyVisits, cozyNeighborhood, cozyDailyIncome,
  cozyResidentWish, resumeCozySave, cozyCommission, cozyReputation,
  careForCozyResident, cozyCareUsedToday, cozyCareBoost,
  COZY_INCIDENTS, cozyRescuePreview, cozyRescueBoost, resolveCozyIncident,
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
    expect(cozyDailyIncome(alone)).toEqual({rent:dailyRent(alone),craft:0,gifts:0,patrons:0,loss:0,total:dailyRent(alone)});
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
    expect(payday.journal.filter(item=>item.kind==='rent').at(-1)?.zh).toContain('制作 5');
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
  it('treats the first eight-day chapter as a milestone rather than an ending',()=>{
    let game=newCozyGame();
    for(let n=0;n<MAX_TICKS-1;n++)game=advanceCozy(game);
    expect(cozyResidentWish(game,'seedling')).toBeNull();
    const coinsBefore=game.coins;
    game=advanceCozy(game);
    expect(game.tick).toBe(MAX_TICKS);
    expect(cozyDay(game.tick)).toBe(9);
    expect(game.phase).toBe('playing');
    expect(game.coins).toBeGreaterThan(coinsBefore);
    expect(game.journal.at(-1)?.key).toBe('chapter-1');
    expect(game.journal.at(-1)?.zh).toContain('奖励 +6');
    expect(cozyResidentWish(game,'seedling')).toBeNull(); // first-week score unchanged
    game=advanceCozy(game);
    expect(game.tick).toBe(MAX_TICKS+1);
    expect(cozyResidentWish(game,'seedling')?.kind).toBe('rest');
    expect(buildCozyRoom(game,0,'bath').rooms[0]?.type).toBe('bath');
    expect(validCozySave(game)).toBe(true);
  });
  it('resumes an old completed V1 save with its homes, income and history intact',()=>{
    const original={...newCozyGame(),tick:MAX_TICKS,phase:'complete' as const,coins:147};
    expect(validCozySave(original)).toBe(true);
    const resumed=resumeCozySave(original);
    expect(resumed.phase).toBe('playing');
    expect(resumed.coins).toBe(147);
    expect(resumed.rooms).toEqual(original.rooms);
    expect(advanceCozy(resumed).tick).toBe(MAX_TICKS+1);
    expect(resumeCozySave(resumed)).toBe(resumed);
  });
  it('rotates meaningful room, decor and friend needs every three days',()=>{
    let game=moveInCozy(buildCozyRoom(newCozyGame(),2,'bath'),2,'dewdrop');
    game={...game,tick:MAX_TICKS+1};
    expect(cozyResidentWish(game,'seedling')).toMatchObject({kind:'rest',met:true,effect:12});
    expect(cozyResidentWish(game,'dewdrop')).toMatchObject({kind:'inspiration',met:false,effect:-4});
    const baseJoy=residentHappiness(game,'dewdrop');
    const helped=decorateCozy(game,2,'lamp');
    expect(cozyResidentWish(helped,'dewdrop')).toMatchObject({met:true,effect:12});
    expect(residentHappiness(helped,'dewdrop')).toBeGreaterThan(baseJoy);
    game={...game,tick:MAX_TICKS+3*TICKS_PER_DAY+1};
    expect(cozyResidentWish(game,'seedling')).toMatchObject({kind:'inspiration',met:false,effect:-4});
    const newHome=decorateCozy(game,4,'lamp');
    expect(cozyResidentWish(newHome,'seedling')).toMatchObject({met:true,effect:12});
    expect(residentHappiness(newHome,'seedling')).toBeGreaterThan(residentHappiness(game,'seedling'));
    game={...game,tick:MAX_TICKS+6*TICKS_PER_DAY+1};
    expect(cozyResidentWish(game,'seedling')).toMatchObject({kind:'company',met:false});
    const bonded={...game,bonds:{'dewdrop:seedling':1}};
    expect(cozyResidentWish(bonded,'seedling')).toMatchObject({kind:'company',met:true,effect:12});
    expect(cozyResidentWish(relocateCozyResident(buildCozyRoom(bonded,0,'bath'),2,0),'seedling'))
      .toMatchObject({kind:'company',met:false,effect:-4});
  });
  it('can remain playable and save safely beyond the old terminal day',()=>{
    let game=newCozyGame();
    for(let n=0;n<MAX_TICKS*13;n++)game=advanceCozy(game);
    expect(game.phase).toBe('playing');
    expect(cozyDay(game.tick)).toBe(105);
    expect(game.journal.some(e=>e.key==='chapter-13')).toBe(true);
    expect(game.seen.length).toBeLessThanOrEqual(100);
    expect(game.journal.length).toBeLessThanOrEqual(18);
    expect(validCozySave(game)).toBe(true);
    expect(cozyResidentWish(game,'seedling')).not.toBeNull();
    expect(cozyResidentWish(advanceCozy(game),'seedling')).not.toBeNull();
  });

  it('puts a named resident commission in each chapter after the opening week',()=>{
    const opening=newCozyGame();
    expect(cozyCommission(opening)).toBeNull();
    const week={...opening,tick:MAX_TICKS};
    const first=cozyCommission(week);
    expect(first).toMatchObject({chapter:2,id:'teatime',resident:'dewdrop',completed:0,ready:false,award:24});
    expect(first?.steps.map(step=>step.id)).toEqual(['home','decor','friend']);
    expect(cozyCommission(week,3)?.id).toBe('lanterns');
    expect(cozyCommission(week,4)?.id).toBe('garden');
    expect(cozyCommission(week,5)?.id).toBe('stories');
    expect(cozyCommission(week,6)?.id).toBe('teatime');
    expect(cozyReputation(week)).toBe(0);
  });
  it('completes story hour only through a real room, books and earned neighboring visits',()=>{
    let game=day(newCozyGame(),8);
    game=moveInCozy(buildCozyRoom(game,2,'bath'),2,'dewdrop');
    expect(cozyCommission(game)?.completed).toBe(1);
    game=decorateCozy(game,2,'books');
    expect(cozyCommission(game)?.completed).toBe(2);
    expect(cozyCommission(game)?.steps[2].done).toBe(false);
    game=day(game);
    expect(game.bonds['dewdrop:seedling']).toBeGreaterThanOrEqual(1);
    expect(cozyCommission(game)?.ready).toBe(true);
    const before=cozyDailyIncome(game);
    expect(before.patrons).toBe(0);
    while(game.tick<MAX_TICKS*2-1)game=advanceCozy(game);
    const previous=game.coins;
    game=advanceCozy(game);
    expect(game.tick).toBe(MAX_TICKS*2);
    expect(game.journal.at(-1)?.key).toBe('commission-close-2');
    expect(game.journal.at(-1)?.zh).toContain('露珠灵的睡前读书会圆满完成');
    expect(game.coins).toBeGreaterThan(previous+24);
    expect(cozyReputation(game)).toBe(1);
    expect(cozyDailyIncome(game).patrons).toBe(1);
    expect(cozyCommission(game,2)?.award).toBe(10);
    expect(validCozySave(game)).toBe(true);
    const later=day(game);
    expect(later.lastIncome).toBeGreaterThan(0);
    expect(later.coins).toBeGreaterThan(game.coins);
  });
  it('does not award reputation for an unfulfilled commission or passive adjacency',()=>{
    let game=day(newCozyGame(),8);
    game=moveInCozy(buildCozyRoom(game,2,'bath'),2,'dewdrop');
    game=decorateCozy(game,2,'books');
    expect(cozyCommission(game)?.completed).toBe(2);
    // Move Dewdrop away before a visit; room and decor stay valid but the
    // relationship condition never matures.
    game=relocateCozyResident(buildCozyRoom(game,0,'bath'),2,0);
    while(game.tick<MAX_TICKS*2)game=advanceCozy(game);
    expect(game.journal.at(-1)?.key).toBe('commission-close-2');
    expect(game.journal.at(-1)?.zh).toContain('没能完成');
    expect(cozyReputation(game)).toBe(0);
    expect(cozyDailyIncome(game).patrons).toBe(0);
  });
  it('supports all four commission stories and caps permanent patronage',()=>{
    const state:CozyState={...newCozyGame(),tick:MAX_TICKS,known:COZY_RESIDENTS.map(r=>r.id),
      rooms:[
        {type:'workshop' as const,resident:'lantern-beetle' as const,decor:'lamp' as const},
        {type:'workshop' as const,resident:'moon-scout' as const,decor:'books' as const},
        {type:'bath' as const,resident:'dewdrop' as const,decor:'books' as const},
        null,
        {type:'nest' as const,resident:'seedling' as const,decor:'plant' as const},
        {type:'greenhouse' as const,resident:'fern-hare' as const,decor:'plant' as const},
      ],
      bonds:{'dewdrop:seedling':1,'dewdrop:lantern-beetle':1,
        'fern-hare:seedling':1,'lantern-beetle:moon-scout':1}};
    for(const chapter of [2,3,4,5]){
      const mission=cozyCommission(state,chapter)!;
      expect(mission.ready).toBe(true);
      expect(mission.completed).toBe(3);
      expect(mission.steps.every(step=>step.done)).toBe(true);
    }
    const prestigious={...state,seen:[
      'commission-award-teatime','commission-award-lanterns',
      'commission-award-garden','commission-award-stories']};
    expect(cozyReputation(prestigious)).toBe(4);
    expect(cozyDailyIncome(prestigious).patrons).toBe(4);
    expect(cozyCommission(prestigious,6)?.award).toBe(10);
    expect(validCozySave(prestigious)).toBe(true);
  });
  it('keeps past commission achievements when routine stories cycle beyond 100 entries',()=>{
    let state={...newCozyGame(),tick:MAX_TICKS*2,
      seen:['commission-award-teatime',...Array.from({length:99},(_,i)=>'old-'+i)]};
    for(let i=0;i<120;i++)state=advanceCozy(state);
    expect(state.seen).toContain('commission-award-teatime');
    expect(state.seen.length).toBeLessThanOrEqual(100);
    expect(cozyReputation(state)).toBe(1);
    expect(validCozySave(state)).toBe(true);
  });

  it('direct care is a real once-a-day choice with instant character comfort',()=>{
    const original=newCozyGame();
    expect(cozyCareUsedToday(original)).toBe(false);
    expect(cozyCareBoost(original,'seedling')).toBe(0);
    const happy=residentHappiness(original,'seedling');
    const helped=careForCozyResident(original,'seedling');
    expect(helped).not.toBe(original);
    expect(helped.coins).toBe(original.coins+3);
    expect(helped.rooms).toEqual(original.rooms);
    expect(cozyCareBoost(helped,'seedling')).toBe(11);
    expect(residentHappiness(helped,'seedling')).toBe(Math.min(100,happy+11));
    expect(cozyCareUsedToday(helped)).toBe(true);
    expect(helped.journal.at(-1)?.zh).toContain('帮芽核扶正长歪的枝叶');
    expect(careForCozyResident(helped,'seedling')).toBe(helped);
    expect(careForCozyResident(helped,'dewdrop')).toBe(helped);
    const tomorrow=day(helped);
    expect(cozyCareBoost(tomorrow,'seedling')).toBe(0);
    expect(cozyCareUsedToday(tomorrow)).toBe(false);
    expect(careForCozyResident(tomorrow,'seedling')).not.toBe(tomorrow);
    expect(validCozySave(tomorrow)).toBe(true);
  });
  it('daily character interaction rewards personality-fit rooms rather than idle tapping',()=>{
    let game=moveInCozy(buildCozyRoom(newCozyGame(),2,'bath'),2,'dewdrop');
    const helped=careForCozyResident(game,'dewdrop');
    expect(helped.coins).toBe(game.coins+3);
    expect(helped.journal.at(-1)?.zh).toContain('水温');
    game=relocateCozyResident(game,2,4);
    const mismatched=careForCozyResident(game,'dewdrop');
    expect(mismatched.coins).toBe(game.coins+1);
    expect(cozyCareBoost(mismatched,'dewdrop')).toBe(11);
    expect(validCozySave(mismatched)).toBe(true);
    expect(careForCozyResident(newCozyGame(),'moon-scout')).toEqual(newCozyGame());
  });

  it('a physical mishap appears in the cutaway when neighbors settle together',()=>{
    let game=moveInCozy(buildCozyRoom(newCozyGame(),2,'bath'),2,'dewdrop');
    expect(game.incident).toBeNull();
    game=day(game,2);
    expect(game.tick).toBe(24);
    expect(game.incident).toEqual({kind:'drips',room:4,since:24});
    expect(COZY_INCIDENTS[game.incident!.kind].need).toBe('bath');
    expect(game.journal.at(-1)?.key).toBe('mishap-start-24');
    const income=cozyDailyIncome(game);
    expect(income.loss).toBe(4);
    expect(income.total).toBe(income.rent+income.craft+income.gifts+income.patrons-4);
    expect(validCozySave(game)).toBe(true);
    const nextDay=day(game);
    expect(nextDay.incident).toEqual(game.incident);
    expect(nextDay.coins-game.coins).toBe(cozyDailyIncome(game).total);
  });
  it('matching specialist converts a genuine room incident into a bonus',()=>{
    let state=day(moveInCozy(buildCozyRoom(newCozyGame(),2,'bath'),2,'dewdrop'),2);
    const correct=cozyRescuePreview(state,'dewdrop')!;
    expect(correct).toEqual({expert:true,coins:12,joy:9});
    const before=residentHappiness(state,'dewdrop');
    const helped=resolveCozyIncident(state,'dewdrop');
    expect(helped.incident).toBeNull();
    expect(helped.coins).toBe(state.coins+12);
    expect(helped.rooms).toEqual(state.rooms);
    expect(cozyRescueBoost(helped,'dewdrop')).toBe(9);
    expect(residentHappiness(helped,'dewdrop')).toBe(Math.min(100,before+9));
    expect(helped.journal.at(-1)?.zh).toContain('一眼看出了门道');
    expect(cozyDailyIncome(helped).loss).toBe(0);
    expect(resolveCozyIncident(helped,'dewdrop')).toBe(helped);
    expect(validCozySave(helped)).toBe(true);
    expect(cozyRescueBoost(day(helped),'dewdrop')).toBe(0);
  });
  it('a nonspecialist can still help, at a visible price, but an outsider cannot',()=>{
    const base=day(moveInCozy(buildCozyRoom(newCozyGame(),2,'bath'),2,'dewdrop'),2);
    expect(cozyRescuePreview(base,'moon-scout')).toBeNull();
    expect(resolveCozyIncident(base,'moon-scout')).toBe(base);
    expect(cozyRescuePreview(base,'seedling')).toMatchObject({expert:false,coins:-6,joy:3});
    const helped=resolveCozyIncident(base,'seedling');
    expect(helped.coins).toBe(base.coins-6);
    expect(cozyRescueBoost(helped,'seedling')).toBe(3);
    expect(helped.journal.at(-1)?.zh).toContain('花了一点修缮费');
    expect(helped.incident).toBeNull();
    expect(resolveCozyIncident(base,'seedling').incident).toBeNull();
  });
  it('unanswered troubles settle naturally; no forced game-over or infinite incidents',()=>{
    let state=day(moveInCozy(buildCozyRoom(newCozyGame(),2,'bath'),2,'dewdrop'),2);
    state=day(state,2);
    expect(state.incident).toBeNull();
    expect(state.journal.some(item=>item.key==='mishap-settled-24')).toBe(true);
    expect(state.tick).toBe(48);
    state=day(state);
    expect(state.incident?.kind).toBe('shadows'); // new story, not the old rain cloud
    const v1=newCozyGame() as CozyState;
    const oldSave={...v1};
    delete oldSave.incident;
    expect(validCozySave(oldSave)).toBe(true);
    expect(validCozySave({...v1,incident:{kind:'bogus',room:2,since:24}})).toBe(false);
    expect(validCozySave({...v1,incident:{kind:'drips',room:99,since:0}})).toBe(false);
    expect(validCozySave({...v1,incident:{kind:'drips',room:4,since:12}})).toBe(false);
  });
  it('rejects tampered saves and keeps old prototype saves separate',()=>{
    const game=newCozyGame();
    expect(validCozySave({...game,coins:-1})).toBe(false);
    expect(validCozySave({...game,tick:500})).toBe(true);
    expect(validCozySave({...game,tick:500.5})).toBe(false);
    expect(validCozySave({...game,tick:-1})).toBe(false);
    expect(validCozySave({...game,rooms:[]})).toBe(false);
    const duplicate={...game,rooms:game.rooms.map(room=>room?{...room}:null)};
    duplicate.rooms[0]={type:'nest',resident:'seedling',decor:null};
    expect(validCozySave(duplicate)).toBe(false);
    expect(validCozySave({...game,known:['seedling','evil']})).toBe(false);
    expect(validCozySave(game)).toBe(true);
  });
});
