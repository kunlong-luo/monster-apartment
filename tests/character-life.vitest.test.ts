import {describe,it,expect} from 'vitest';
import {ABILITY_GROUPS,CHARACTER_PROFILES,decideYuesha,newCharacterLife,
  validCharacterLife,visitCharacter,inspectCharacterRoom,decideWorker,
  WORKER_DIALOGUES,CHARACTER_ROOM_OBJECTS,yueshaAfterChoice} from '../src/core/character-life';
import {decodeCharacterLife} from '../src/lib/game/character-life-store';
import {roomHotspotPositions} from '../src/components/game/room-scene-hotspots';

describe('V3.4 character identities and durable room choices',()=>{
  it('places interactive objects differently by character without leaving the scene',()=>{
    const sets=['yuesha','brook','fern','cinder'].map(roomHotspotPositions);
    expect(sets.every(items=>items.length===3)).toBe(true);
    expect(new Set(sets.map(items=>JSON.stringify(items))).size).toBe(4);
    for(const spots of sets){
      for(const spot of spots){
        expect(Number.parseFloat(spot.left)).toBeGreaterThanOrEqual(5);
        expect(Number.parseFloat(spot.left)).toBeLessThan(55);
        expect(Number.parseFloat(spot.top)).toBeGreaterThanOrEqual(20);
        expect(Number.parseFloat(spot.top)).toBeLessThan(80);
      }
    }
  });
  it('defines twenty distinct abilities and differentiated main characters',()=>{
    const keys=ABILITY_GROUPS.flatMap(group=>group.keys);
    expect(keys).toHaveLength(20);
    expect(new Set(keys).size).toBe(20);
    expect(Object.keys(CHARACTER_PROFILES)).toEqual(['yuesha','brook','fern','cinder']);
    for(const profile of Object.values(CHARACTER_PROFILES)){
      expect(Object.keys(profile.abilities)).toHaveLength(20);
      expect(profile.traits.length).toBeGreaterThanOrEqual(3);
      for(const value of Object.values(profile.abilities)){
        expect(value).toBeGreaterThanOrEqual(1);
        expect(value).toBeLessThanOrEqual(100);
      }
    }
    expect(CHARACTER_PROFILES.yuesha.abilities.communication)
      .toBeGreaterThan(CHARACTER_PROFILES.cinder.abilities.communication);
    expect(CHARACTER_PROFILES.cinder.abilities.strength)
      .toBeGreaterThan(CHARACTER_PROFILES.yuesha.abilities.strength);
  });
  it('marks a visit only once and never fabricates economy state',()=>{
    const original=newCharacterLife();
    const visited=visitCharacter(original,'yuesha');
    expect(visited.visited).toEqual(['yuesha']);
    expect(visitCharacter(visited,'yuesha')).toBe(visited);
    expect(original.visited).toEqual([]);
    expect(Object.keys(visited)).toEqual(['version','visited','decisions']);
  });
  it('remembers one meaningful decision; replay cannot overwrite it',()=>{
    const first=decideYuesha(newCharacterLife(),'transparent');
    expect(validCharacterLife(first)).toBe(true);
    expect(decideYuesha(first,'careful')).toBe(first);
    expect(first.decisions['yuesha-first-visit']).toBe('transparent');
    expect(yueshaAfterChoice(first.decisions['yuesha-first-visit']))
      .toContain('东街');
    expect(yueshaAfterChoice('careful')).toContain('生产');
  });
  it('keeps pre-extension lore saves readable with optional new fields',()=>{
    const old=decideYuesha(visitCharacter(newCharacterLife(),'yuesha'),'careful');
    expect(old.observations).toBeUndefined();
    expect(old.workerDecisions).toBeUndefined();
    expect(validCharacterLife(old)).toBe(true);
    expect(decodeCharacterLife(JSON.stringify(old)).status).toBe('ok');
  });
  it('remembers each worker room discovery and dialogue once',()=>{
    let state=newCharacterLife();
    for(const id of ['brook','fern','cinder'] as const){
      const scene=WORKER_DIALOGUES[id];
      expect(scene.objects).toHaveLength(3);
      expect(new Set(scene.objects.map(o=>o.id)).size).toBe(3);
      expect(CHARACTER_ROOM_OBJECTS[id]).toEqual(scene.objects.map(x=>x.id));
      state=visitCharacter(state,id);
      state=inspectCharacterRoom(state,id,scene.objects[0].id);
      state=inspectCharacterRoom(state,id,scene.objects[1].id);
      const duplicate=inspectCharacterRoom(state,id,scene.objects[0].id);
      expect(duplicate).toBe(state);
      state=decideWorker(state,id,'care');
      expect(decideWorker(state,id,'practice')).toBe(state);
      expect(state.workerDecisions?.[id]).toBe('care');
    }
    expect(state.visited).toEqual(['brook','fern','cinder']);
    expect(validCharacterLife(state)).toBe(true);
    expect(decodeCharacterLife(JSON.stringify(state)).status).toBe('ok');
    expect(inspectCharacterRoom(state,'brook','seal')).toBe(state);
  });
  it('rejects malformed extension data and preserves the original format',()=>{
    const base=newCharacterLife();
    const invalid=[
      {...base,workerDecisions:{brook:'unlimited'}},
      {...base,workerDecisions:{stranger:'care'}},
      {...base,observations:{fern:['toolbox']}},
      {...base,observations:{brook:['gauge','gauge']}},
      {...base,observations:{stranger:['gauge']}},
    ];
    for(const item of invalid)expect(validCharacterLife(item)).toBe(false);
    expect(validCharacterLife(base)).toBe(true);
  });
  it('does not silently overwrite malformed or future saves',()=>{
    const v=newCharacterLife();
    expect(decodeCharacterLife(null)).toEqual({status:'ok',progress:v});
    expect(decodeCharacterLife(JSON.stringify(v)).status).toBe('ok');
    for(const malformed of ['{broken','null','{"version":2}','{"version":1,"visited":["stranger"],"decisions":{}}',
      '{"version":1,"visited":["yuesha","yuesha"],"decisions":{}}',
      '{"version":1,"visited":[],"decisions":{"yuesha-first-visit":"another"}}']){
      expect(decodeCharacterLife(malformed).status).toBe('corrupt');
    }
  });
});
