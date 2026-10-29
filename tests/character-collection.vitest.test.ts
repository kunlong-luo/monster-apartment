import {describe,it,expect} from 'vitest';
import {CHARACTER_CARDS,FORGE_RECIPES,availableContracts,cardFromRoll,characterAbilities,
  earnedContracts,equipEquipment,forgeEquipment,newCharacterCollection,summonCharacter,
  validCharacterCollection} from '../src/core/character-collection';
import {decodeCollection} from '../src/lib/game/character-collection-store';
describe('character collection - contract summons, forging and safe saves',()=>{
  it('uses disclosed weights totaling exactly 100 and the red mythic eclipse at 1%',()=>{
    expect(CHARACTER_CARDS.reduce((n,c)=>n+c.weight,0)).toBe(100);
    expect(cardFromRoll(0).character).toBe('brook');
    expect(cardFromRoll(.991).key).toBe('yuesha-eclipse');
    expect(cardFromRoll(.95).rarity).toBe('传说');
    expect(()=>cardFromRoll(1)).toThrow();
  });
  it('earns tickets only from real visits, delivered workshop orders and three starters',()=>{
    const s=newCharacterCollection();
    const earned=earnedContracts(2,3);
    expect(earned).toBe(8);
    expect(availableContracts(s,earned)).toBe(8);
    let next=s;
    for(let i=0;i<8;i++)next=summonCharacter(next,earned,0.42);
    expect(next.draws).toHaveLength(8);
    expect(summonCharacter(next,earned,0.42)).toBe(next);
    expect(next.shards).toBeGreaterThan(8);
    expect(s.draws).toHaveLength(0);
  });
  it('forges jewelry and gear from earned shards; only a card owner can equip',()=>{
    let s=newCharacterCollection();
    s=summonCharacter(s,3,0);
    s=summonCharacter(s,3,0);
    expect(s.shards).toBe(3);
    const forged=forgeEquipment(s,'moon-pendant');
    expect(forged.shards).toBe(1);
    expect(forged.inventory).toEqual(['moon-pendant']);
    expect(forgeEquipment(forged,'moon-pendant')).toBe(forged);
    expect(equipEquipment(forged,'fern','moon-pendant')).toBe(forged);
    const equipped=equipEquipment(forged,'brook','moon-pendant');
    expect(equipped.equipped.brook?.jewelry).toBe('moon-pendant');
    expect(characterAbilities('brook',equipped).spirit).toBe(91);
    expect(characterAbilities('brook',equipped).wisdom).toBe(61);
    expect(characterAbilities('fern',equipped).spirit).toBe(77);
    expect(validCharacterCollection(equipped)).toBe(true);
  });
  it('blocks altered, corrupt or future collection saves without resetting lore',()=>{
    const s=newCharacterCollection();
    expect(decodeCollection(null).status).toBe('ok');
    expect(decodeCollection('{oops').status).toBe('corrupt');
    expect(decodeCollection(JSON.stringify({...s,version:2})).status).toBe('corrupt');
    expect(validCharacterCollection({...s,inventory:['bad']})).toBe(false);
    expect(validCharacterCollection({...s,equipped:{stranger:{equipment:'swift-boots'}}})).toBe(false);
    expect(FORGE_RECIPES.map(r=>r.slot)).toContain('jewelry');
    expect(FORGE_RECIPES.map(r=>r.slot)).toContain('equipment');
  });
});
