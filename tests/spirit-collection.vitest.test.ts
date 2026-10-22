import { describe, expect, it } from 'vitest';
import { advanceDay, placeSpirit, newGame, dailyEstimate } from '../src/core/engine';
import { decodeSave, encodeSave } from '../src/lib/save-game';
import { SPIRITS, QUALITY_RATES, newCollection, summon, equipSpirit, companionEffects,
  nightCollectionReward, levelSpirit, evolveSpirit, validCollection } from '../src/core/spirit-collection';

describe('Original spirit collection with direct room residency', () => {
  it('has 18 species, eight mythic, four legendary and disclosed odds', () => {
    expect(SPIRITS).toHaveLength(18);
    expect(new Set(SPIRITS.map(s => s.id)).size).toBe(18);
    expect(SPIRITS.filter(s => s.quality === 'UR')).toHaveLength(8);
    expect(SPIRITS.filter(s => s.quality === 'SSR')).toHaveLength(4);
    expect(Object.values(QUALITY_RATES).reduce((s,r) => s + r, 0)).toBe(100);
  });
  it('summons ten atomically and converts duplicates to shards', () => {
    const initial=newCollection();
    const result=summon(initial,10,()=>0);
    expect(result.error).toBeNull();
    expect(result.collection.tickets).toBe(0);
    expect(result.collection.recent).toHaveLength(10);
    expect(result.collection.owned.seedling?.shards).toBe(180);
    expect(summon(result.collection,1,()=>0).collection).toBe(result.collection);
  });
  it('has guaranteed SR 10, SSR 50, UR 100 across summons', () => {
    const base={...newCollection(),tickets:100};
    const sr=summon({ ...base,pity:{sr:9,ssr:0,ur:0}},1,()=>0);
    const ssr=summon({ ...base,pity:{sr:9,ssr:49,ur:0}},1,()=>0);
    const ur=summon({ ...base,pity:{sr:9,ssr:49,ur:99}},1,()=>0);
    for (const [result,quality] of [[sr,'SR'],[ssr,'SSR'],[ur,'UR']] as const) {
      expect(SPIRITS.find(s=>s.id===result.collection.recent[0])?.quality).toBe(quality);
    }
  });
  it('directly occupied rooms receive growth and real revenue bonuses', () => {
    const room=placeSpirit(newGame(),5,'seedling').state;
    const initial=newCollection();
    const equipped=equipSpirit(initial,5,'seedling').collection;
    expect(equipped.equipped[5]).toBe('seedling');
    expect(companionEffects(room.rooms,equipped).satisfaction).toBe(1);
    expect(dailyEstimate(room,equipped).net).toBe(dailyEstimate(room).net);
    const settled=advanceDay(room,equipped).state;
    expect(settled.history[0].spiritSatisfaction).toBe(1);
    expect(settled.satisfaction).toBe(advanceDay(room).state.satisfaction+1);
    expect(nightCollectionReward(equipped).owned.seedling?.xp).toBe(6);
    expect(nightCollectionReward(equipped).tickets).toBe(equipped.tickets+2);
  });
  it('does not allow unavailable or duplicate spirits to occupy multiple rooms', () => {
    const initial=newCollection();
    expect(equipSpirit(initial,0,'aurora-whale').error).toBeTruthy();
    const first=equipSpirit(initial,0,'seedling').collection;
    expect(equipSpirit(first,1,'seedling').error).toBeTruthy();
  });
  it('levels and evolves after meeting requirements', () => {
    const initial=newCollection();
    expect(levelSpirit(initial,'seedling').error).toBeTruthy();
    const ready={...initial, essence:100,owned:{
      ...initial.owned,seedling:{level:10,xp:24,shards:0,evolution:0},
    }};
    expect(levelSpirit(ready,'seedling').collection.owned.seedling?.level).toBe(11);
    expect(evolveSpirit(ready,'seedling').collection.owned.seedling?.evolution).toBe(1);
  });
  it('migrates legacy v1 rooms and assigns a matching permanent collection', () => {
    const old={...newGame(),rooms:['slime','ember',null,null,null,null]};
    const raw=JSON.stringify({version:1,state:old,locale:'zh',tutorialActive:false,tutorialStep:0});
    const decoded=decodeSave(raw);
    expect(decoded?.state.rooms.filter(Boolean)).toHaveLength(2);
    const resident=decoded!.state.rooms[0]!;
    expect(decoded?.collection?.owned[resident]).toBeTruthy();
    expect(decoded?.collection?.equipped[0]).toBe(resident);
    const saved=decodeSave(encodeSave(decoded!));
    expect(saved?.state.rooms).toEqual(decoded?.state.rooms);
    expect(validCollection(decoded?.collection)).toBe(true);
  });
  it('rejects forged inventory payloads', () => {
    const initial={version:1,state:newGame(),locale:'en',tutorialActive:false,tutorialStep:0};
    expect(decodeSave(JSON.stringify({...initial,collection:{...newCollection(),tickets:-1}}))).toBeNull();
    expect(decodeSave(JSON.stringify({...initial,collection:{...newCollection(),equipped:['invalid',null,null,null,null,null]}}))).toBeNull();
  });
});
