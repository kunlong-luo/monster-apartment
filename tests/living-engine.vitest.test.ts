import { describe, expect, it } from 'vitest';
import { newCollection } from '../src/core/spirit-collection';
import { createLivingGame, moveLivingWorker, advanceLiving, startLiving, livingTip, livingGrade, LIVING_DURATION, forecastLivingMove } from '../src/core/living-engine';

const initial = () => createLivingGame(newCollection());
const at = (tick: number) => ({...startLiving(initial()),tick});

describe('The apartment is one interconnected playable system', () => {
  it('places starter crew in three working rooms, not disconnected popups', () => {
    const game=initial();
    expect(game.phase).toBe('ready');
    expect(game.rooms).toEqual({reactor:'lantern-beetle',garden:'seedling',gate:'dewdrop'});
    expect(game.power).toBe(7);
    expect(game.food).toBe(8);
    expect(startLiving(game).phase).toBe('running');
    expect(advanceLiving(game)).toBe(game);
  });
  it('moving a spirit actually trades off responsibilities, without cloning units', () => {
    const col=newCollection();
    const base=startLiving(initial());
    const changed=moveLivingWorker(base,'dewdrop','reactor',col);
    expect(changed.rooms).toEqual({reactor:'dewdrop',garden:'seedling',gate:'lantern-beetle'});
    expect(changed.moves).toBe(1);
    expect(changed.cooldown).toBe(2);
    expect(base.rooms.reactor).toBe('lantern-beetle');
    expect(moveLivingWorker(changed,'seedling','reactor',col)).toBe(changed);
    expect(moveLivingWorker(changed,'aurora-whale','gate',col)).toBe(changed);
    expect(new Set(Object.values(changed.rooms)).size).toBe(3);
  });
  it('the greenhouse actually requires electric power to grow food', () => {
    const starting={...at(3),power:0,rooms:{...initial().rooms,reactor:null}};
    const starving=advanceLiving(starting);
    expect(starving.food).toBe(8);
    expect(starving.power).toBe(0);
    const powered=advanceLiving({...starting,rooms:initial().rooms});
    expect(powered.food).toBeGreaterThan(starving.food);
    expect(powered.power).toBeGreaterThanOrEqual(0);
  });
  it('sending a repair spirit to the furnace cools heat at the cost of defense', () => {
    const hot={...at(7),heat:8};
    const unattended=advanceLiving(hot);
    const repaired=advanceLiving({...hot,rooms:{reactor:'dewdrop',garden:'seedling',gate:'lantern-beetle'}});
    expect(unattended.heat).toBeGreaterThan(repaired.heat);
    expect(unattended.integrity).toBeLessThan(repaired.integrity);
    expect(livingTip(hot)).toContain('过热');
  });
  it('spore infestation and blackout visibly change production by worker role', () => {
    const spores={...at(39),crisis:'spores' as const,power:9,food:3,
      incidents:{spores:56,blackout:0},stress:{spores:0,grid:0}};
    const noRepair=advanceLiving(spores);
    const repair=advanceLiving({...spores,rooms:{reactor:'lantern-beetle',garden:'dewdrop',gate:'seedling'}});
    expect(repair.food).toBeGreaterThan(noRepair.food);
    const blackout={...at(71),power:1,food:5,
      incidents:{spores:0,blackout:85},stress:{spores:0,grid:0}};
    const stalled=advanceLiving(blackout);
    const fixed=advanceLiving({...blackout,rooms:{reactor:'dewdrop',garden:'seedling',gate:'lantern-beetle'}});
    expect(fixed.power).toBeGreaterThan(stalled.power);
    expect(fixed.crisis).toBe('blackout');
  });
  it('a defender can stop an imminent intruder, while an empty watch costs core', () => {
    const intruder={id:99,kind:'wisp' as const,hp:4,maxHp:4,distance:5};
    const guard={...at(11),invaders:[intruder],nextId:100};
    const blocked=advanceLiving({...guard,rooms:{...guard.rooms,gate:'seedling'}});
    const breached=advanceLiving({...guard,rooms:{...guard.rooms,gate:null}});
    expect(blocked.integrity).toBeGreaterThan(breached.integrity);
    expect(breached.breaches).toBe(1);
  });
  it('the same three workers survive when reassigned, while idle staffing fails', () => {
    const col=newCollection();
    let idle=startLiving(initial());
    let managed=startLiving(initial());
    managed=moveLivingWorker(managed,'dewdrop','reactor',col);
    managed=advanceLiving(advanceLiving(managed));
    managed=moveLivingWorker(managed,'seedling','gate',col);
    for(let n=0;n<LIVING_DURATION;n++){
      idle=advanceLiving(idle);
      managed=advanceLiving(managed);
    }
    expect(idle.phase).toBe('lost');
    expect(managed.phase).toBe('won');
    expect(managed.integrity).toBeGreaterThan(idle.integrity);
    expect(managed.moves).toBe(2);
  });
  it('grower decisions accumulate real spore risk, while purification prevents it at the same tick', () => {
    const ready={...at(11),food:11,power:10,heat:0,
      stress:{spores:4,grid:0},incidents:{spores:0,blackout:0},
      rooms:{reactor:'lantern-beetle',garden:'lantern-beetle',gate:'seedling'}};
    const overworked=advanceLiving(ready);
    expect(overworked.crisis).toBe('spores');
    expect(overworked.incidents?.spores).toBe(28);
    expect(overworked.eventTick).toBe(12);
    const purified=advanceLiving({...ready,rooms:{...ready.rooms,garden:'dewdrop'}});
    expect(purified.crisis).toBeNull();
    expect(purified.stress?.spores).toBe(1);
    expect(purified.incidents?.spores).toBe(0);
  });
  it('overheated and depleted grids trigger blackouts, but an engineer can avert one', () => {
    const atRisk={...at(11),power:2,heat:8,
      stress:{spores:0,grid:4},incidents:{spores:0,blackout:0}};
    const strained=advanceLiving(atRisk);
    expect(strained.crisis).toBe('blackout');
    expect(strained.incidents?.blackout).toBe(24);
    const stabilized=advanceLiving({...atRisk,
      rooms:{...atRisk.rooms,reactor:'dewdrop'}});
    expect(stabilized.crisis).toBeNull();
    expect(stabilized.stress?.grid).toBe(1);
    const recovered=advanceLiving({...strained,tick:24,heat:0,power:10,
      stress:{spores:0,grid:0}});
    expect(recovered.crisis).toBeNull();
  });
  it('an overheating reactor draws extra visible invaders, while cooling averts them', () => {
    const base={...at(8),heat:8,power:12,
      incidents:{spores:0,blackout:0},stress:{spores:0,grid:0},
      invaders:[]};
    const overheated=advanceLiving(base);
    const cool=advanceLiving({...base,heat:2});
    expect(overheated.invaders).toHaveLength(1);
    expect(overheated.history.at(-1)).toContain('过热引来污染体');
    expect(cool.invaders).toHaveLength(0);
  });
  it('spore clouds draw an extra invader only while the reactive event is active', () => {
    const base={...at(11),food:7,heat:0,power:8,
      incidents:{spores:25,blackout:0},stress:{spores:0,grid:0},invaders:[]};
    const active=advanceLiving(base);
    const clean=advanceLiving({...base,incidents:{spores:0,blackout:0}});
    expect(active.invaders).toHaveLength(1);
    expect(active.history.at(-1)).toContain('孢子引来污染体');
    expect(clean.invaders).toHaveLength(0);
  });
  it('past saves without new incident fields keep running with safe defaults', () => {
    const previous={...at(7),stress:undefined,incidents:undefined};
    const advanced=advanceLiving(previous);
    expect(advanced.tick).toBe(8);
    expect(advanced.stress).toBeDefined();
    expect(advanced.incidents).toBeDefined();
  });
  it('previews measurable room tradeoffs without advancing the real clock or spending resources', () => {
    const collection=newCollection();
    const current={...at(3), heat:8};
    const before=structuredClone(current);
    const reactor=forecastLivingMove(current,'dewdrop','reactor',collection);
    expect(reactor).not.toBeNull();
    expect(reactor!.heat).toBeLessThan(0);
    expect(reactor!.integrity).toBeGreaterThan(0);
    expect(reactor!.reasonZh).toContain('炉温');
    expect(current).toEqual(before);
    expect(forecastLivingMove(current,'lantern-beetle','reactor',collection)).toBeNull();
    expect(forecastLivingMove({...current,cooldown:1},'dewdrop','reactor',collection)).toBeNull();
    expect(forecastLivingMove(current,'aurora-whale','gate',collection)).toBeNull();
  });
  it('repairs spores by reassigning the same worker, at the cost of leaving the gate', () => {
    const collection=newCollection();
    const current={...at(39),food:2,power:10,crisis:'spores' as const,heat:0};
    const change=forecastLivingMove(current,'dewdrop','garden',collection);
    expect(change).not.toBeNull();
    expect(change!.food).toBeGreaterThan(0);
    expect(change!.reasonEn).toContain('spores');
  });
  it('scouts can engage distant enemies, while a repairer on watch heals shields', () => {
    const collection={...newCollection(),owned:{
      ...newCollection().owned,
      'moon-scout':{level:1,xp:0,shards:0,evolution:0},
    }};
    const enemy={id:81,kind:'wisp' as const,hp:7,maxHp:7,distance:88};
    const game={...at(13),power:12,invaders:[enemy]};
    const guard=advanceLiving({...game,rooms:{...game.rooms,gate:'seedling'}});
    const scout=advanceLiving({...game,rooms:{...game.rooms,gate:'moon-scout'}});
    expect(guard.invaders[0].hp).toBe(7);
    expect(scout.invaders[0].hp).toBeLessThan(7);
    const broken={...at(11),power:12,integrity:8,invaders:[]};
    const repair=advanceLiving({...broken,rooms:{...broken.rooms,gate:'dewdrop'}});
    const empty=advanceLiving({...broken,rooms:{...broken.rooms,gate:'seedling'}});
    expect(repair.integrity).toBeGreaterThan(empty.integrity);
    expect(repair.power).toBeLessThan(empty.power);
    expect(collection.owned['moon-scout']).toBeDefined();
  });
  it('the entire night ends without an end-day button and freezes on result', () => {
    let game=startLiving(initial());
    for(let i=0;i<LIVING_DURATION&&game.phase==='running';i++)game=advanceLiving(game);
    expect(['won','lost']).toContain(game.phase);
    expect(advanceLiving(game)).toBe(game);
    const victory=advanceLiving({...at(119),power:12,food:12,integrity:16,heat:0,invaders:[]});
    expect(victory.phase).toBe('won');
    expect(livingGrade(victory)).toBeGreaterThan(80);
  });
});
