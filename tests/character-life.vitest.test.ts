import {describe,it,expect} from 'vitest';
import {ABILITY_GROUPS,CHARACTER_PROFILES,decideYuesha,newCharacterLife,
  validCharacterLife,visitCharacter,yueshaAfterChoice} from '../src/core/character-life';
import {decodeCharacterLife} from '../src/lib/game/character-life-store';

describe('V3.4 character identities and durable room choices',()=>{
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
