/**
 * Monster Apartment - Gothic Moonlit Summoning (契约召唤) Engine
 * Implements full 1:1 gacha simulation with exact probability table,
 * pity counter, currency exchange, history logging, and apartment resident sync.
 */

import type { CardKey } from '@/core/character-collection';
import { COLLECTION_KEY, decodeCollection } from '@/lib/game/character-collection-store';

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
  // SSR Mythic (1.00%)
  {
    id: 'yuesha-eclipse',
    name: '月纱',
    title: '月纱 · 神话·月蚀',
    epithet: '神话 · 月蚀',
    rarity: 'SSR-Mythic',
    rarityZh: 'SSR 神话',
    rate: 1.0,
    avatar: '/art/yuesha-avatar-v3.webp',
    quote: '沉入永夜吧—— 这一次，换我来拥抱你。',
    bio: '血月之夜苏醒的高阶魔女，掌控着古老契约与月影秘术。看似冷漠疏离，实则深切眷顾着公寓中的每位住客。',
    isUp: true,
    baseCardKey: 'yuesha-eclipse',
  },
  // SSR Legend (5.00%)
  {
    id: 'damian-nocturne',
    name: '达米安',
    title: '达米安 · 暗夜执事',
    epithet: '传说 · 执事',
    rarity: 'SSR-Legend',
    rarityZh: 'SSR 传说',
    rate: 2.0,
    avatar: '/art/yuesha-bust-v3.webp',
    quote: '只要您的一声令下，黑夜将为您扫除一切阻碍。',
    bio: '血族世家的纯血执事，以无可挑剔的礼仪与冷酷精准的剑术守护庄园。',
    isUp: true,
  },
  {
    id: 'victoria-rose',
    name: '维多利亚',
    title: '维多利亚 · 荆棘蔷薇',
    epithet: '传说 · 蔷薇',
    rarity: 'SSR-Legend',
    rarityZh: 'SSR 传说',
    rate: 1.5,
    avatar: '/art/lobby-hero-v3.webp',
    quote: '带刺的蔷薇，只在最危险的夜色里盛放。',
    bio: '暗夜商会的铁腕掌舵人，擅长在贵族与教会的博弈中谋取最丰厚的回报。',
    isUp: true,
  },
  {
    id: 'yuesha-vow',
    name: '月纱',
    title: '月纱 · 月下誓约',
    epithet: '传说 · 誓约',
    rarity: 'SSR-Legend',
    rarityZh: 'SSR 传说',
    rate: 1.5,
    avatar: '/art/yuesha-portrait-v3.webp',
    quote: '契约已成，星月为证。无论黎明何时到来，我都将守候在此。',
    bio: '与旅人初遇时的月纱，手中握着泛黄的羊皮卷，眼中藏着重塑街区的决心。',
    baseCardKey: 'yuesha-vow',
  },
  // SR Elite (17.00%)
  {
    id: 'elena-doll',
    name: '艾莲娜',
    title: '艾莲娜 · 绯红魔偶',
    epithet: '精英 · 魔偶',
    rarity: 'SR',
    rarityZh: 'SR 精英',
    rate: 6.0,
    avatar: '/art/yuesha-bust-v3.webp',
    quote: '齿轮咔嗒咔嗒转动，你听到提线人偶的心跳了吗？',
    bio: '沉迷于机械心智的天才发条人偶师，总把工坊的废料组装成会唱歌的八音盒。',
    isUp: true,
  },
  {
    id: 'seraphina-nun',
    name: '塞拉菲娜',
    title: '塞拉菲娜 · 圣银修女',
    epithet: '精英 · 圣银',
    rarity: 'SR',
    rarityZh: 'SR 精英',
    rate: 5.5,
    avatar: '/art/yuesha-portrait-v3.webp',
    quote: '我在此祷告，愿圣洁的银焰烧尽一切纠缠你的梦魇。',
    bio: '背弃狂热教会、潜入怪物街区的年轻修女，暗中为受伤的非人住民疗伤。',
    isUp: true,
  },
  {
    id: 'cinder-ember',
    name: '炽角',
    title: '炽角 · 炉火余烬',
    epithet: '精英 · 锻造',
    rarity: 'SR',
    rarityZh: 'SR 精英',
    rate: 5.5,
    avatar: '/art/lobby-hero-v3.webp',
    quote: '炉膛里的火还热着！有什么坏掉的铁家伙，统统拿来！',
    bio: '工坊的锻造大师，对每一块晶核的纯度与金属配比有着偏执的严苛要求。',
    baseCardKey: 'cinder-ember',
  },
  // R Rare (31.00%)
  {
    id: 'fern-spring',
    name: '青枝',
    title: '青枝 · 春芽誓约',
    epithet: '稀有 · 园艺',
    rarity: 'R',
    rarityZh: 'R 稀有',
    rate: 11.0,
    avatar: '/art/lobby-hero-v3.webp',
    quote: '植物是不会说谎的。只要给它们时间，枯木也能吐出新芽。',
    bio: '悉心照料温室月光植物的园艺师，能够听懂根系在土壤中的细微低语。',
    baseCardKey: 'fern-spring',
  },
  {
    id: 'moran-raven',
    name: '莫兰',
    title: '莫兰 · 幽影渡鸦',
    epithet: '稀有 · 信使',
    rarity: 'R',
    rarityZh: 'R 稀有',
    rate: 10.0,
    avatar: '/art/yuesha-avatar-v3.webp',
    quote: '夜空中的风会带走所有秘密，只要你付得起相应的代价。',
    bio: '穿梭于公寓高耸塔尖之间的渡鸦使者，传递着来自远方城邦的隐秘信件。',
  },
  {
    id: 'rena-alchemist',
    name: '蕾娜',
    title: '蕾娜 · 秘药学者',
    epithet: '稀有 · 炼金',
    rarity: 'R',
    rarityZh: 'R 稀有',
    rate: 10.0,
    avatar: '/art/yuesha-bust-v3.webp',
    quote: '小心那管泛着紫光的试剂，滴上一滴就能让整杯红茶沸腾。',
    bio: '热衷于尝试古怪药剂调配的青年炼金学者，工坊药水的主要供应商。',
  },
  // N Common (46.00%)
  {
    id: 'brook-tide',
    name: '泉泡',
    title: '泉泡 · 潮汐来信',
    epithet: '常规 · 水汽',
    rarity: 'N',
    rarityZh: 'N 常规',
    rate: 20.0,
    avatar: '/art/lobby-hero-v3.webp',
    quote: '咕噜咕噜！水汽管道今天一切正常，我把压力控制得刚刚好！',
    bio: '活泼好动的水灵工匠，负责公寓与工坊的供水及蒸汽平衡。',
    baseCardKey: 'brook-tide',
  },
  {
    id: 'wisp-lantern',
    name: '萤灯精怪',
    title: '萤灯精怪 · 幽微荧火',
    epithet: '常规 · 光灵',
    rarity: 'N',
    rarityZh: 'N 常规',
    rate: 13.0,
    avatar: '/art/yuesha-avatar-v3.webp',
    quote: '照亮脚下的石阶……不要走散咯。',
    bio: '寄宿在老旧路灯里的夜行精怪，在浓雾漫卷的夜里为归家者引路。',
  },
  {
    id: 'gear-guard',
    name: '发条工兵',
    title: '发条工兵 · 坚固守御',
    epithet: '常规 · 发条',
    rarity: 'N',
    rarityZh: 'N 常规',
    rate: 13.0,
    avatar: '/art/yuesha-bust-v3.webp',
    quote: '巡逻路线：一号走廊至钟楼。指令执行中……',
    bio: '忠实可靠的发条哨兵，二十四小时不知疲倦地维护着公寓的安全秩序。',
  },
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

export const GACHA_POOLS: readonly GachaPool[] = [
  {
    id: 'mythic-eclipse',
    name: '「神话·月蚀」',
    badge: '概率提升',
    subname: '月纱 · 概率提升',
    remainingDays: 20,
    bgQuote: '「……你也想，成为我的所有物吗？」',
    bannerTitle: '神话 · 月蚀',
    bannerSub: '当月光被吞噬，唯有你仍在我眼中。',
    dateRange: '2024/10/24 05:00 - 2024/11/13 04:59',
    avatar: '/art/yuesha-avatar-v3.webp',
  },
  {
    id: 'red-moon-invitation',
    name: '「红月之邀」',
    badge: '限定复刻',
    subname: '限定角色复刻',
    remainingDays: 14,
    bgQuote: '「猩红的晚宴已准备就绪，我的伯爵阁下。」',
    bannerTitle: '红月 · 晚宴之邀',
    bannerSub: '摇曳的烛光下，谁在轻嗅玫瑰的芬芳。',
    dateRange: '2024/10/24 05:00 - 2024/11/07 04:59',
    avatar: '/art/yuesha-bust-v3.webp',
  },
  {
    id: 'eternal-struggle',
    name: '「永夜挣扎」',
    badge: '常驻',
    subname: '常驻召唤',
    remainingDays: 99,
    bgQuote: '「在无尽长夜中摸索前行，每一抹微光都是恩赐。」',
    bannerTitle: '永夜 · 宿命回响',
    bannerSub: '经典契约角色全天候常驻，随时回应你的呼唤。',
    dateRange: '长期开放',
    avatar: '/art/yuesha-portrait-v3.webp',
  },
  {
    id: 'bond-echo',
    name: '「羁绊回响」',
    badge: '自选UP',
    subname: '自选UP',
    remainingDays: 28,
    bgQuote: '「你心底最思念的身影，终将在月下凝现。」',
    bannerTitle: '羁绊 · 命定共鸣',
    bannerSub: '指定心愿角色，享受翻倍概率共鸣。',
    dateRange: '2024/10/24 05:00 - 2024/11/21 04:59',
    avatar: '/art/lobby-hero-v3.webp',
  },
  {
    id: 'memory-remnant',
    name: '「记忆残章」',
    badge: '剧情',
    subname: '剧情卡池',
    remainingDays: 35,
    bgQuote: '「翻开泛黄的古卷，尘封的历史再次苏醒。」',
    bannerTitle: '残章 · 溯洄旧梦',
    bannerSub: '重温那些决定公寓命运的古老契约篇章。',
    dateRange: '2024/10/24 05:00 - 2024/11/28 04:59',
    avatar: '/art/yuesha-bust-v3.webp',
  },
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

export const INITIAL_GACHA_STATE: GachaState = {
  version: 2,
  tickets: 12,
  crystals: 8450,
  moonstones: 320,
  pityCountdown: 48,
  totalSummons: 42,
  history: [
    {
      id: 'init-1',
      timestamp: Date.now() - 3600 * 1000 * 5,
      poolId: 'mythic-eclipse',
      poolName: '「神话·月蚀」',
      characterId: 'cinder-ember',
      name: '炽角',
      title: '炽角 · 炉火余烬',
      rarity: 'SR',
      rarityZh: 'SR 精英',
    },
    {
      id: 'init-2',
      timestamp: Date.now() - 3600 * 1000 * 3,
      poolId: 'mythic-eclipse',
      poolName: '「神话·月蚀」',
      characterId: 'fern-spring',
      name: '青枝',
      title: '青枝 · 春芽誓约',
      rarity: 'R',
      rarityZh: 'R 稀有',
    },
    {
      id: 'init-3',
      timestamp: Date.now() - 3600 * 1000 * 1,
      poolId: 'mythic-eclipse',
      poolName: '「神话·月蚀」',
      characterId: 'brook-tide',
      name: '泉泡',
      title: '泉泡 · 潮汐来信',
      rarity: 'N',
      rarityZh: 'N 常规',
    },
  ],
  ownedIds: ['brook-tide', 'fern-spring', 'cinder-ember', 'moran-raven', 'gear-guard'],
  claimedProgressRewards: [],
  activePoolId: 'mythic-eclipse',
};

export function readGachaState(): GachaState {
  if (typeof window === 'undefined') return INITIAL_GACHA_STATE;
  try {
    const raw = window.localStorage.getItem(GACHA_STATE_KEY);
    if (!raw) return INITIAL_GACHA_STATE;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.version === 2 && typeof parsed.tickets === 'number') {
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

  saveGachaState(nextState);

  // Sync to character collection storage so legacy e2e tests & resident collections stay in lockstep
  syncToCollectionStorage(results);

  return { success: true, characters: results, newState: nextState };
}

/**
 * Sync cards into monster-apartment:character-collection:v1
 */
function syncToCollectionStorage(pulled: SummonableCharacter[]): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = window.localStorage.getItem(COLLECTION_KEY);
    const decoded = decodeCollection(raw);
    if (decoded.status === 'ok') {
      const col = decoded.collection;
      const newDraws = [...col.draws];
      let addShards = 0;

      for (const char of pulled) {
        if (char.baseCardKey) {
          const isDupe = newDraws.includes(char.baseCardKey);
          newDraws.push(char.baseCardKey);
          addShards += 1 + (isDupe ? 2 : 0);
        } else {
          addShards += char.rarity.startsWith('SSR') ? 5 : char.rarity === 'SR' ? 3 : 1;
        }
      }

      const updatedCol = {
        ...col,
        draws: newDraws,
        shards: col.shards + addShards,
      };
      window.localStorage.setItem(COLLECTION_KEY, JSON.stringify(updatedCol));
      window.dispatchEvent(new Event('monster-apartment:collection-updated'));
    }
  } catch {
    /* safely ignore storage sync errors */
  }
}
