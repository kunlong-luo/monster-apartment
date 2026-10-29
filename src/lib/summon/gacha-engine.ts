/**
 * Monster Apartment - Gothic Moonlit Summoning (契约召唤) Engine
 * Implements full 1:1 gacha simulation with exact probability table,
 * pity counter, currency exchange, history logging, and apartment resident sync.
 */

import type { CardKey } from '../../core/character-collection';
import { COLLECTION_KEY, decodeCollection } from '../game/character-collection-store';

export type GachaRarity = 'SSR-Mythic' | 'SSR-Legend' | 'SR' | 'R' | 'N';

export interface SummonableCharacter {
  id: string;
  name: string;
  title: string;
  epithet: string;
  rarity: GachaRarity;
  rarityZh: string;
  rate: number; // percentage (e.g. 1.00)
  avatar: string;
  quote: string;
  bio: string;
  isUp?: boolean;
  baseCardKey?: CardKey;
}

export const GACHA_CHARACTERS: readonly SummonableCharacter[] = [
  { id:'yuesha-eclipse',name:'月纱',title:'月纱 · 神话·月蚀',epithet:'神话 · 月蚀',
    rarity:'SSR-Mythic',rarityZh:'SSR 神话',rate:1,avatar:'/art/yuesha-avatar-v3.webp',
    quote:'沉入永夜吧—— 这一次，换我来拥抱你。',
    bio:'月夜魔女的珍藏契约，拥有红色神话品阶。',baseCardKey:'yuesha-eclipse' },
  { id:'yuesha-vow',name:'月纱',title:'月纱 · 月下誓约',epithet:'传说 · 誓约',
    rarity:'SSR-Legend',rarityZh:'SSR 传说',rate:5,avatar:'/art/yuesha-portrait-v3.webp',
    quote:'契约已成，星月为证。',bio:'月纱与旅人相遇时的誓约。',
    baseCardKey:'yuesha-vow' },
  { id:'cinder-ember',name:'炽角',title:'炽角 · 炉火余烬',epithet:'史诗 · 锻造',
    rarity:'SR',rarityZh:'SR 精英',rate:17,avatar:'/art/lobby-hero-v3.webp',
    quote:'炉膛里的火还热着！',bio:'工坊的晶核锻造大师。',baseCardKey:'cinder-ember' },
  { id:'fern-spring',name:'青枝',title:'青枝 · 春芽誓约',epithet:'稀有 · 园艺',
    rarity:'R',rarityZh:'R 稀有',rate:31,avatar:'/art/lobby-hero-v3.webp',
    quote:'植物是不会说谎的。',bio:'能听懂植物低语的园艺师。',baseCardKey:'fern-spring' },
  { id:'brook-tide',name:'泉泡',title:'泉泡 · 潮汐来信',epithet:'普通 · 水汽',
    rarity:'N',rarityZh:'N 常规',rate:46,avatar:'/art/lobby-hero-v3.webp',
    quote:'水汽管道今天一切正常！',bio:'活泼的水汽工匠。',baseCardKey:'brook-tide' },
];

export interface SummonRecord {
  id: string;
  timestamp: number;
  poolId: string;
  poolName: string;
  characterId: string;
  name: string;
  title: string;
  rarity: GachaRarity;
  rarityZh: string;
}

export interface GachaPool {
  id: string;
  name: string;
  badge: string;
  subname: string;
  remainingDays: number;
  bgQuote: string;
  bannerTitle: string;
  bannerSub: string;
  dateRange: string;
  avatar: string;
}

/** Five distinct visual themes share one disclosed probability table. Neither
 * dates nor rate-ups are simulated without an actual event backend. */
export const GACHA_POOLS: readonly GachaPool[] = [
  {id:'mythic-eclipse',name:'神话 · 月蚀',badge:'常驻',subname:'月纱 · 红色神话',
    remainingDays:0,bgQuote:'月影之下，古老的誓约苏醒。',
    bannerTitle:'神话 · 月蚀',bannerSub:'当月光被吞噬，唯有你仍在我眼中。',
    dateRange:'长期开放 · 基础神话概率 1%',avatar:'/art/yuesha-avatar-v3.webp'},
  {id:'red-moon-invitation',name:'红月之邀',badge:'主题',subname:'红月契约展示',
    remainingDays:0,bgQuote:'沉入永夜吧——换我来拥抱你。',
    bannerTitle:'红月 · 晚宴之邀',bannerSub:'玫瑰为夜色而盛放。',
    dateRange:'长期开放 · 概率同主池',avatar:'/art/yuesha-bust-v3.webp'},
  {id:'eternal-struggle',name:'永夜挣扎',badge:'常驻',subname:'住客契约',
    remainingDays:0,bgQuote:'每一抹微光都是恩赐。',
    bannerTitle:'永夜 · 宿命回响',bannerSub:'相遇的故事仍在继续。',
    dateRange:'长期开放 · 概率同主池',avatar:'/art/yuesha-portrait-v3.webp'},
  {id:'bond-echo',name:'羁绊回响',badge:'主题',subname:'羁绊故事',
    remainingDays:0,bgQuote:'月光仍记得你的声音。',
    bannerTitle:'羁绊 · 命定共鸣',bannerSub:'重温每一份相遇。',
    dateRange:'长期开放 · 无自选概率提升',avatar:'/art/lobby-hero-v3.webp'},
  {id:'memory-remnant',name:'记忆残章',badge:'剧情',subname:'记忆与故事',
    remainingDays:0,bgQuote:'尘封的记忆再次苏醒。',
    bannerTitle:'残章 · 溯洄旧梦',bannerSub:'故事中的角色，仍会回应呼唤。',
    dateRange:'长期开放 · 概率同主池',avatar:'/art/yuesha-bust-v3.webp'},
];

export interface GachaState {
  version: 2;
  tickets: number; // 契约信物 (默认 12)
  crystals: number; // 血晶 (默认 8450)
  moonstones: number; // 月光石 (默认 320)
  pityCountdown: number; // 距离必得 SSR 剩余次数 (默认 48)
  totalSummons: number; // 累计召唤次数
  history: SummonRecord[]; // 召唤记录
  ownedIds: string[]; // 已获得的角色 ID
  claimedProgressRewards: number[]; // 已领取的收集进度奖励节点
  activePoolId: string;
}

export const GACHA_STATE_KEY = 'monster-apartment:gacha-v2';
const GACHA_EVENT = 'monster-apartment:gacha-updated';

/** New accounts begin at the actual first-time grant, not screenshot mock data. */
export const INITIAL_GACHA_STATE: GachaState = {
  version:2,tickets:3,crystals:0,moonstones:0,
  pityCountdown:90,totalSummons:0,history:[],ownedIds:[],
  claimedProgressRewards:[],activePoolId:'mythic-eclipse',
};
export function validGachaState(value:unknown):value is GachaState{
  if(!value||typeof value!=='object')return false;
  const s=value as Partial<GachaState>;
  return s.version===2 &&
    [s.tickets,s.crystals,s.moonstones,s.pityCountdown,s.totalSummons]
      .every(n=>Number.isSafeInteger(n)&&Number(n)>=0) &&
    Number(s.pityCountdown)>=1 && Number(s.pityCountdown)<=90 &&
    Array.isArray(s.history) && s.history.length<=100 &&
    Array.isArray(s.ownedIds) && s.ownedIds.every(id=>typeof id==='string') &&
    Array.isArray(s.claimedProgressRewards) &&
    GACHA_POOLS.some(p=>p.id===s.activePoolId);
}
export function gachaSaveStatus(): 'ok'|'corrupt'|'unavailable'{
  if(typeof window==='undefined')return 'unavailable';
  try {
    const raw=window.localStorage.getItem(GACHA_STATE_KEY);
    if(raw===null)return 'ok';
    return validGachaState(JSON.parse(raw))?'ok':'corrupt';
  } catch {return 'unavailable';}
}
/** Earn additional summon tickets from real workshop completions and first-time
 * character visits; safe to call on every React render, no double awards. */
export function claimProgressTickets(completed:number,visited:number):number{
  if(typeof window==='undefined'||gachaSaveStatus()!=='ok')return 0;
  if(!Number.isSafeInteger(completed)||completed<0||!Number.isSafeInteger(visited)||visited<0)return 0;
  const eligible=Math.min(1000,completed+Math.min(4,visited));
  const current=readGachaState();
  const credited=Math.max(0,...current.claimedProgressRewards.filter(n=>Number.isSafeInteger(n)));
  if(eligible<=credited)return 0;
  const grant=eligible-credited;
  saveGachaState({...current,tickets:current.tickets+grant,claimedProgressRewards:[eligible]});
  return grant;
}

/** Grant the skill showcase prize at most once per saved collection. */
export function claimTrialTicket():boolean{
  if(typeof window==='undefined'||gachaSaveStatus()!=='ok')return false;
  const state=readGachaState();
  if(state.claimedProgressRewards.includes(-1))return false;
  saveGachaState({...state,tickets:state.tickets+1,
    claimedProgressRewards:[...state.claimedProgressRewards,-1]});
  return true;
}
export function readGachaState(): GachaState {
  if (typeof window === 'undefined') return INITIAL_GACHA_STATE;
  try {
    const raw = window.localStorage.getItem(GACHA_STATE_KEY);
    if (!raw) return INITIAL_GACHA_STATE;
    const parsed = JSON.parse(raw);
    if (validGachaState(parsed)) {
      return parsed as GachaState;
    }
  } catch {
    /* fallback to initial */
  }
  return INITIAL_GACHA_STATE;
}

export function saveGachaState(state: GachaState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(GACHA_STATE_KEY, JSON.stringify(state));
    window.dispatchEvent(new Event(GACHA_EVENT));
  } catch {
    /* non-blocking */
  }
}

/**
 * Execute a single gacha pull based on the official probability table
 * and pity system.
 */
export function rollSingleGacha(
  state: GachaState,
  _poolId: string,
  forceAtLeastSR: boolean = false
): { character: SummonableCharacter; nextPity: number } {
  let pity = state.pityCountdown;
  let chosen: SummonableCharacter;

  // Hard pity trigger (pity reached 1)
  if (pity <= 1) {
    // Guaranteed SSR! 50% rate-up Yuesha, 50% other SSR
    const ssrPool = GACHA_CHARACTERS.filter((c) => c.rarity.startsWith('SSR'));
    const isUp = Math.random() < 0.5;
    if (isUp) {
      chosen = GACHA_CHARACTERS.find((c) => c.id === 'yuesha-eclipse')!;
    } else {
      const otherSSR = ssrPool.filter((c) => c.id !== 'yuesha-eclipse');
      chosen = otherSSR[Math.floor(Math.random() * otherSSR.length)];
    }
    pity = 90;
    return { character: chosen, nextPity: pity };
  }

  // Standard roll
  const rand = Math.random() * 100;

  if (rand < 1.0) {
    // SSR Mythic (1.00%)
    chosen = GACHA_CHARACTERS.find((c) => c.id === 'yuesha-eclipse')!;
    pity = 90;
  } else if (rand < 6.0) {
    // SSR Legend (5.00%)
    const ssrLegends = GACHA_CHARACTERS.filter((c) => c.rarity === 'SSR-Legend');
    chosen = ssrLegends[Math.floor(Math.random() * ssrLegends.length)];
    pity = 90;
  } else if (rand < 23.0 || forceAtLeastSR) {
    // SR Elite (17.00%)
    const srList = GACHA_CHARACTERS.filter((c) => c.rarity === 'SR');
    chosen = srList[Math.floor(Math.random() * srList.length)];
    pity = Math.max(1, pity - 1);
  } else if (rand < 54.0) {
    // R Rare (31.00%)
    const rList = GACHA_CHARACTERS.filter((c) => c.rarity === 'R');
    chosen = rList[Math.floor(Math.random() * rList.length)];
    pity = Math.max(1, pity - 1);
  } else {
    // N Common (46.00%)
    const nList = GACHA_CHARACTERS.filter((c) => c.rarity === 'N');
    chosen = nList[Math.floor(Math.random() * nList.length)];
    pity = Math.max(1, pity - 1);
  }

  return { character: chosen, nextPity: pity };
}

/**
 * Perform a 1-pull or 10-pull and return the updated state & generated records.
 */
export function executeSummon(
  count: 1 | 10,
  poolId: string = 'mythic-eclipse'
): { success: boolean; characters: SummonableCharacter[]; error?: string; newState?: GachaState } {
  if(gachaSaveStatus()!=='ok')return {success:false,characters:[],error:'召唤存档不可读取；为保护已有进度，操作已停止。'};
  let currentCollection:ReturnType<typeof decodeCollection>;
  try{currentCollection=decodeCollection(window.localStorage.getItem(COLLECTION_KEY));}
  catch{return {success:false,characters:[],error:'收藏存档不可读取，无法安全召唤。'};}
  if(currentCollection.status!=='ok')return {success:false,characters:[],error:'角色收藏存档已损坏或不可用；不会消耗资源。'};
  const current = readGachaState();
  const pool = GACHA_POOLS.find((p) => p.id === poolId) || GACHA_POOLS[0];

  // Currency deduction: Prefer tickets first, then blood crystals
  const ticketsToUse = Math.min(current.tickets, count);
  let crystalsToUse = 0;

  if (current.tickets < count) {
    const needed = count - ticketsToUse;
    const crystalCost = needed * 160;
    if (current.crystals < crystalCost) {
      return {
        success: false,
        characters: [],
        error: `契约信物与血晶不足！还需要 ${needed} 张信物或 ${crystalCost} 颗血晶。`,
      };
    }
    crystalsToUse = crystalCost;
  }

  const results: SummonableCharacter[] = [];
  let currentPity = current.pityCountdown;
  let hasSRorAbove = false;

  for (let i = 0; i < count; i++) {
    const isLastDraw = i === count - 1;
    // Guaranteed SR rule on 10th draw if no SR/SSR was pulled yet
    const forceSR = count === 10 && isLastDraw && !hasSRorAbove;
    const { character, nextPity } = rollSingleGacha(
      { ...current, pityCountdown: currentPity },
      poolId,
      forceSR
    );
    results.push(character);
    currentPity = nextPity;
    if (character.rarity === 'SSR-Mythic' || character.rarity === 'SSR-Legend' || character.rarity === 'SR') {
      hasSRorAbove = true;
    }
  }

  // Create new history records
  const now = Date.now();
  const newRecords: SummonRecord[] = results.map((c, idx) => ({
    id: `rec-${now}-${idx}`,
    timestamp: now,
    poolId: pool.id,
    poolName: pool.name,
    characterId: c.id,
    name: c.name,
    title: c.title,
    rarity: c.rarity,
    rarityZh: c.rarityZh,
  }));

  const updatedOwned = Array.from(new Set([...current.ownedIds, ...results.map((c) => c.id)]));

  const nextState: GachaState = {
    ...current,
    tickets: current.tickets - ticketsToUse,
    crystals: current.crystals - crystalsToUse,
    pityCountdown: currentPity,
    totalSummons: current.totalSummons + count,
    history: [...newRecords, ...current.history].slice(0, 100),
    ownedIds: updatedOwned,
  };

  // A single RNG result owns the visual reveal AND the collected card. Never
  // pre-pull an unrelated item, and never consume tickets on an error.
  const collection=currentCollection.collection;
  const draws=collection.draws.slice();
  let shards=collection.shards;
  for(const character of results){
    if(!character.baseCardKey)continue;
    const card=character.baseCardKey;
    const duplicate=draws.includes(card);
    draws.push(card);
    const tier=card==='yuesha-eclipse'?5:card==='yuesha-vow'?4:
      card==='cinder-ember'?3:card==='fern-spring'?2:1;
    shards+=1+(duplicate?tier:0);
  }
  try {
    const previous=window.localStorage.getItem(GACHA_STATE_KEY);
    window.localStorage.setItem(COLLECTION_KEY,JSON.stringify({...collection,draws,shards}));
    try {window.localStorage.setItem(GACHA_STATE_KEY,JSON.stringify(nextState));}
    catch(error){
      window.localStorage.setItem(COLLECTION_KEY,JSON.stringify(collection));
      if(previous===null)window.localStorage.removeItem(GACHA_STATE_KEY);
      throw error;
    }
    window.dispatchEvent(new Event('monster-apartment:collection-updated'));
    window.dispatchEvent(new Event(GACHA_EVENT));
  } catch {
    return {success:false,characters:[],error:'本地存储写入失败；未确认召唤，请检查浏览器存储空间。'};
  }
  return { success: true, characters: results, newState: nextState };
}

