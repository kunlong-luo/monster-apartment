import {afterEach,beforeEach,describe,expect,it,vi} from 'vitest';
import {GACHA_STATE_KEY,INITIAL_GACHA_STATE,claimProgressTickets,executeSummon,
  readGachaState,rollSingleGacha} from '../src/lib/summon/gacha-engine';
import {COLLECTION_KEY} from '../src/lib/game/character-collection-store';

const saved=new Map<string,string>();
beforeEach(()=>{
  saved.clear();
  vi.stubGlobal('window',{localStorage:{
    getItem:(key:string)=>saved.get(key)??null,
    setItem:(key:string,val:string)=>{saved.set(key,val);},
    removeItem:(key:string)=>{saved.delete(key);},
  },dispatchEvent:()=>true});
  vi.spyOn(Math,'random').mockReturnValue(.9);
});
afterEach(()=>{vi.restoreAllMocks();vi.unstubAllGlobals();});
describe('a faithful functional summoning screen',()=>{
  it('starts with real three tickets, zero crystals, zero history',()=>{
    expect(INITIAL_GACHA_STATE.tickets).toBe(3);
    expect(INITIAL_GACHA_STATE.crystals).toBe(0);
    expect(INITIAL_GACHA_STATE.moonstones).toBe(0);
    expect(INITIAL_GACHA_STATE.history).toHaveLength(0);
    expect(INITIAL_GACHA_STATE.totalSummons).toBe(0);
  });
  it('one result costs one ticket and awards the EXACT same card to collection',()=>{
    const result=executeSummon(1);
    expect(result.success).toBe(true);
    expect(result.characters).toHaveLength(1);
    const state=readGachaState();
    const collection=JSON.parse(saved.get(COLLECTION_KEY)!);
    expect(state.tickets).toBe(2);
    expect(state.totalSummons).toBe(1);
    expect(state.history).toHaveLength(1);
    expect(collection.draws).toEqual([result.characters[0].baseCardKey]);
    expect(collection.shards).toBe(1);
    expect(state.history[0].characterId).toBe(result.characters[0].id);
  });
  it('a failed ten-pull never grants cards, currency or pity changes',()=>{
    const failed=executeSummon(10);
    expect(failed.success).toBe(false);
    expect(saved.has(GACHA_STATE_KEY)).toBe(false);
    expect(saved.has(COLLECTION_KEY)).toBe(false);
  });
  it('corrupted collections block pulls without destroying either save',()=>{
    saved.set(COLLECTION_KEY,'{original:broken');
    const result=executeSummon(1);
    expect(result.success).toBe(false);
    expect(saved.get(COLLECTION_KEY)).toBe('{original:broken');
    expect(saved.has(GACHA_STATE_KEY)).toBe(false);
  });
  it('never awards first-time visit and workshop rewards twice',()=>{
    expect(claimProgressTickets(2,3)).toBe(5);
    expect(readGachaState().tickets).toBe(8);
    expect(claimProgressTickets(2,3)).toBe(0);
    expect(readGachaState().tickets).toBe(8);
    expect(claimProgressTickets(3,4)).toBe(2);
    expect(readGachaState().tickets).toBe(10);
  });
  it('keeps the stated base rarity thresholds, with an explicit 90-pull pity',()=>{
    expect(rollSingleGacha(INITIAL_GACHA_STATE).character.rarity).toBe('N');
    vi.spyOn(Math,'random').mockReturnValue(0);
    expect(rollSingleGacha(INITIAL_GACHA_STATE).character.rarity).toBe('SSR-Mythic');
    const pity={...INITIAL_GACHA_STATE,pityCountdown:1};
    expect(rollSingleGacha(pity).character.rarity.startsWith('SSR')).toBe(true);
    expect(rollSingleGacha(pity).nextPity).toBe(90);
  });
});
