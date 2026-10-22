export type Quality = 'N' | 'R' | 'SR' | 'SSR' | 'UR';
export type Faction = 'tide' | 'forge' | 'veil' | 'grove';
export type Element = 'water' | 'fire' | 'stone' | 'wind' | 'light' | 'shadow';
export type SpiritRole = 'economy' | 'repair' | 'guard' | 'explore';

export type Spirit = {
  id: string;
  zh: string;
  en: string;
  quality: Quality;
  faction: Faction;
  element: Element;
  role: SpiritRole;
  icon: string;
  skillZh: string;
  skillEn: string;
  coins: number;
  mood: number;
};

export const SPIRITS = [
  { id: 'aurora-whale', zh: '极昼鲸', en: 'Dawnwhale', quality: 'UR', faction: 'tide', element: 'light', role: 'guard', icon: '◉', skillZh: '潮汐屏障：提高满意度', skillEn: 'Tide ward: improves mood', coins: 1, mood: 3 },
  { id: 'mirror-koi', zh: '镜鳞鲤', en: 'Mirrorkoi', quality: 'UR', faction: 'tide', element: 'water', role: 'repair', icon: '◇', skillZh: '镜潮修复：平衡收入与舒适', skillEn: 'Mirror tide: balanced repairs', coins: 2, mood: 2 },
  { id: 'cinder-stag', zh: '烬角鹿', en: 'Cinderstag', quality: 'UR', faction: 'forge', element: 'fire', role: 'economy', icon: '✷', skillZh: '恒炉：大量增加金币收入', skillEn: 'Eternal forge: improves revenue', coins: 5, mood: -1 },
  { id: 'prism-mole', zh: '晶脊鼹', en: 'Prismmole', quality: 'UR', faction: 'forge', element: 'stone', role: 'repair', icon: '◆', skillZh: '晶脊工坊：提升产能', skillEn: 'Crystal works: boosts production', coins: 4, mood: 0 },
  { id: 'eclipse-moth', zh: '蚀月蛾', en: 'Eclipsemoth', quality: 'UR', faction: 'veil', element: 'shadow', role: 'explore', icon: '☾', skillZh: '夜航：高收益高风险', skillEn: 'Nightflight: risk and reward', coins: 6, mood: -2 },
  { id: 'whisper-cat', zh: '谧语猫', en: 'Whispercat', quality: 'UR', faction: 'veil', element: 'wind', role: 'guard', icon: '✧', skillZh: '暗影抚慰：保护住户情绪', skillEn: 'Quiet veil: protects mood', coins: 0, mood: 4 },
  { id: 'root-crown', zh: '根冠兽', en: 'Rootcrown', quality: 'UR', faction: 'grove', element: 'stone', role: 'guard', icon: '♧', skillZh: '森境守望：大幅稳定满意度', skillEn: 'Forest watch: stabilizes mood', coins: 1, mood: 4 },
  { id: 'dew-phoenix', zh: '露焰鸾', en: 'Dewphoenix', quality: 'UR', faction: 'grove', element: 'fire', role: 'economy', icon: '❀', skillZh: '生机轮转：兼顾收入与成长', skillEn: 'Renewal: growth and income', coins: 3, mood: 2 },
  { id: 'wave-healer', zh: '澜幕医师', en: 'Wavehealer', quality: 'SSR', faction: 'tide', element: 'water', role: 'repair', icon: '≈', skillZh: '潮幕庇护：每位其他潮属性灵核额外 +2 满意度（最多 +4）', skillEn: 'Tidal shelter: +2 mood per other Water spirit (max +4)', coins: 0, mood: 4 },
  { id: 'day-smith', zh: '昼锻者', en: 'Daysmith', quality: 'SSR', faction: 'forge', element: 'fire', role: 'economy', icon: '✦', skillZh: '熔金契约：每位其他星匠伙伴额外 +3 金币（最多 +9）', skillEn: 'Gilded pact: +3 coins per other Starforge spirit (max +9)', coins: 5, mood: -1 },
  { id: 'dusk-bell', zh: '暮铃行者', en: 'Duskbell', quality: 'SSR', faction: 'veil', element: 'shadow', role: 'explore', icon: '♢', skillZh: '午夜交易：两名及以上影帷盟时额外 +5 金币、-2 满意度', skillEn: 'Midnight trade: with 2+ Veilbound, +5 coins and -2 mood', coins: 5, mood: -2 },
  { id: 'moss-keeper', zh: '苔光园主', en: 'Mosskeeper', quality: 'SSR', faction: 'grove', element: 'light', role: 'guard', icon: '❖', skillZh: '生命温室：每位其他阵营灵核额外 +1 满意度（最多 +3）', skillEn: 'Living greenhouse: +1 mood per other-faction spirit (max +3)', coins: 1, mood: 3 },
  { id: 'dewdrop', zh: '露珠灵', en: 'Dewdrop', quality: 'SR', faction: 'tide', element: 'water', role: 'repair', icon: '●', skillZh: '管路润泽：平衡收益', skillEn: 'Clear pipes: balanced support', coins: 2, mood: 1 },
  { id: 'lantern-beetle', zh: '灯甲虫', en: 'Lanternbeetle', quality: 'SR', faction: 'forge', element: 'light', role: 'economy', icon: '✺', skillZh: '余温制造：增加金币', skillEn: 'Emberwork: earns coins', coins: 3, mood: 0 },
  { id: 'moon-scout', zh: '月影雀', en: 'Moonscout', quality: 'SR', faction: 'veil', element: 'wind', role: 'explore', icon: '☽', skillZh: '夜探：冒险增收', skillEn: 'Night scouting: extra profits', coins: 3, mood: -1 },
  { id: 'fern-hare', zh: '蕨尾兔', en: 'Fernhare', quality: 'R', faction: 'grove', element: 'wind', role: 'guard', icon: '❧', skillZh: '安睡祝福：提高满意度', skillEn: 'Sleep blessing: improves mood', coins: 0, mood: 2 },
  { id: 'pebble-crab', zh: '卵石蟹', en: 'Pebblecrab', quality: 'R', faction: 'tide', element: 'stone', role: 'repair', icon: '◇', skillZh: '沙岸拾荒：少量金币', skillEn: 'Shore scavenging: a little income', coins: 1, mood: 1 },
  { id: 'seedling', zh: '芽核', en: 'Seedcore', quality: 'N', faction: 'grove', element: 'light', role: 'guard', icon: '✿', skillZh: '初芽：小幅稳定满意度', skillEn: 'First bloom: small mood boost', coins: 0, mood: 1 },
] as const satisfies readonly Spirit[];

export type SpiritId = (typeof SPIRITS)[number]['id'];
export const QUALITY_ORDER: readonly Quality[] = ['N', 'R', 'SR', 'SSR', 'UR'];
export const QUALITY_RATES: Readonly<Record<Quality, number>> = { N: 45, R: 30, SR: 17, SSR: 7, UR: 1 };
export const QUALITY_LABELS: Record<Quality, { zh: string; en: string }> = {
  N: { zh: '普通', en: 'Common' }, R: { zh: '稀有', en: 'Rare' },
  SR: { zh: '史诗', en: 'Epic' }, SSR: { zh: '传说', en: 'Legendary' },
  UR: { zh: '神话', en: 'Mythic' },
};
export const FACTION_LABELS: Record<Faction, { zh: string; en: string }> = {
  tide: { zh: '潮息族', en: 'Tideborn' }, forge: { zh: '星匠会', en: 'Starforge' },
  veil: { zh: '影帷盟', en: 'Veilbound' }, grove: { zh: '森灯庭', en: 'Groveward' },
};
export const SPIRIT_BY_ID = Object.fromEntries(SPIRITS.map((s) => [s.id, s])) as Record<SpiritId, Spirit>;
export const isSpiritId = (value: unknown): value is SpiritId => typeof value === 'string' && Object.hasOwn(SPIRIT_BY_ID, value);

export type EvolutionPath = 'prosperity' | 'harmony';
export const MAX_STARS = 5;
export const starCost = (currentStars: number): number => (currentStars + 1) * 20;
export type SpiritProgress = {
  level: number; xp: number; shards: number; evolution: number;
  /** Optional so existing V0.5 browser saves remain valid. */
  stars?: number;
  path?: EvolutionPath;
};
export type CollectionState = {
  tickets: number;
  essence: number;
  pity: { sr: number; ssr: number; ur: number };
  owned: Partial<Record<SpiritId, SpiritProgress>>;
  equipped: (SpiritId | null)[];
  recent: SpiritId[];
  totalPulls: number;
};
export function newCollection(): CollectionState {
  return {
    tickets: 10, essence: 0, pity: { sr: 0, ssr: 0, ur: 0 },
    owned: { seedling: { level: 1, xp: 0, shards: 0, evolution: 0 } },
    equipped: [null, null, null, null, null, null], recent: [], totalPulls: 0,
  };
}

export type CollectionOutcome = { collection: CollectionState; error: string | null };
const rank = (quality: Quality): number => QUALITY_ORDER.indexOf(quality);
const poolFor = (quality: Quality) => SPIRITS.filter((s) => s.quality === quality);
const sample = (random: () => number) => Math.min(0.999999999, Math.max(0, random()));

export function summon(collection: CollectionState, count: 1 | 10, random: () => number): CollectionOutcome {
  if (collection.tickets < count) return { collection, error: '召唤券不足。' };
  const pity = { ...collection.pity };
  const owned = { ...collection.owned };
  const recent: SpiritId[] = [];
  for (let i = 0; i < count; i++) {
    const roll = sample(random) * 100;
    let quality: Quality = roll < 45 ? 'N' : roll < 75 ? 'R' : roll < 92 ? 'SR' : roll < 99 ? 'SSR' : 'UR';
    if (pity.ur >= 99) quality = 'UR';
    else if (pity.ssr >= 49 && rank(quality) < rank('SSR')) quality = 'SSR';
    else if (pity.sr >= 9 && rank(quality) < rank('SR')) quality = 'SR';
    const pool = poolFor(quality);
    const spirit = pool[Math.floor(sample(random) * pool.length)];
    recent.push(spirit.id);
    const previous = owned[spirit.id];
    owned[spirit.id] = previous
      ? { ...previous, shards: previous.shards + 20 }
      : { level: 1, xp: 0, shards: 0, evolution: 0 };
    pity.sr = rank(quality) >= rank('SR') ? 0 : pity.sr + 1;
    pity.ssr = rank(quality) >= rank('SSR') ? 0 : pity.ssr + 1;
    pity.ur = quality === 'UR' ? 0 : pity.ur + 1;
  }
  return {
    collection: { ...collection, tickets: collection.tickets - count,
      totalPulls: collection.totalPulls + count, pity, owned, recent },
    error: null,
  };
}

export function equipSpirit(collection: CollectionState, room: number, id: SpiritId | null): CollectionOutcome {
  if (!Number.isInteger(room) || room < 0 || room >= 6) return { collection, error: '房间无效。' };
  if (id !== null && !collection.owned[id]) return { collection, error: '尚未获得这只灵核。' };
  if (id !== null && collection.equipped.some((current, index) => current === id && index !== room)) {
    return { collection, error: '同一只灵核不能同时驻守两个房间。' };
  }
  const equipped = [...collection.equipped];
  equipped[room] = id;
  return { collection: { ...collection, equipped }, error: null };
}

export function swapEquipped(collection: CollectionState, a: number, b: number): CollectionState {
  const equipped = [...collection.equipped];
  [equipped[a], equipped[b]] = [equipped[b], equipped[a]];
  return { ...collection, equipped };
}

export function nightCollectionReward(collection: CollectionState): CollectionState {
  const equippedIds = collection.equipped.filter((id): id is SpiritId => id !== null);
  const owned = { ...collection.owned };
  for (const id of equippedIds) {
    const progress = owned[id];
    if (progress) owned[id] = { ...progress, xp: progress.xp + 6 };
  }
  return { ...collection, owned, tickets: collection.tickets + 2, essence: collection.essence + 5 };
}

export function levelSpirit(collection: CollectionState, id: SpiritId): CollectionOutcome {
  const progress = collection.owned[id];
  if (!progress) return { collection, error: '尚未获得该灵核。' };
  if (progress.level >= 30) return { collection, error: '已经达到等级上限。' };
  const cost = 4 + progress.level * 2;
  if (progress.xp < cost) return { collection, error: '经验不足。安排灵核驻守并完成夜晚可获得经验。' };
  return { collection: { ...collection, owned: { ...collection.owned,
    [id]: { ...progress, level: progress.level + 1, xp: progress.xp - cost } } }, error: null };
}

/** Duplicate fragments are permanent collection resources, not summon currency. */
export function awakenSpirit(collection: CollectionState, id: SpiritId): CollectionOutcome {
  const progress = collection.owned[id];
  if (!progress) return { collection, error: '尚未获得该灵核。' };
  const stars = progress.stars ?? 0;
  if (stars >= MAX_STARS) return { collection, error: '已达到五星上限。' };
  const cost = starCost(stars);
  if (progress.shards < cost) return { collection, error: '碎片不足，重复召唤同一灵核可以获得碎片。' };
  return {
    collection: { ...collection, owned: {
      ...collection.owned,
      [id]: { ...progress, stars: stars + 1, shards: progress.shards - cost },
    } }, error: null,
  };
}

export function evolveSpirit(collection: CollectionState, id: SpiritId, path?: EvolutionPath): CollectionOutcome {
  const progress = collection.owned[id];
  if (!progress) return { collection, error: '尚未获得该灵核。' };
  if (progress.evolution >= 2) return { collection, error: '已达到最高进化形态。' };
  const next = progress.evolution + 1;
  if (progress.level < next * 10) return { collection, error: '需要达到对应等级才能进化。' };
  const cost = next * 20;
  if (collection.essence < cost) return { collection, error: '进化精华不足。' };
  const isMythicBranch = next === 2 && SPIRIT_BY_ID[id].quality === 'UR';
  if (isMythicBranch && path !== 'prosperity' && path !== 'harmony') {
    return { collection, error: '神话终极进化需选择繁荣或守护方向。' };
  }
  if (!isMythicBranch && path !== undefined) return { collection, error: '该形态无需选择分支。' };
  return { collection: { ...collection, essence: collection.essence - cost,
    owned: { ...collection.owned, [id]: {
      ...progress, evolution: next, ...(isMythicBranch ? { path } : {}),
    } } }, error: null };
}

export function companionEffects(rooms: readonly (SpiritId | null)[], collection?: CollectionState): { coins: number; satisfaction: number } {
  if (!collection) return { coins: 0, satisfaction: 0 };
  let coins = 0;
  let satisfaction = 0;
  const factions: Partial<Record<Faction, number>> = {};
  collection.equipped.forEach((id, index) => {
    if (!id || rooms[index] !== id) return;
    const spirit = SPIRIT_BY_ID[id];
    const progress = collection.owned[id];
    if (!spirit || !progress) return;
    const stars = progress.stars ?? 0;
    coins += spirit.coins + Math.floor((progress.level - 1) / 5) + progress.evolution;
    satisfaction += spirit.mood + progress.evolution;
    if (spirit.role === 'economy' || spirit.role === 'explore') coins += stars * 2;
    else satisfaction += stars;
    if (progress.evolution >= 2 && spirit.quality === 'UR') {
      if (progress.path === 'prosperity') coins += 6;
      if (progress.path === 'harmony') satisfaction += 5;
    }
    factions[spirit.faction] = (factions[spirit.faction] ?? 0) + 1;
  });
  // Each legendary has a distinct support niche beyond its base stats.
  const active = collection.equipped.filter((id, index): id is SpiritId =>
    id !== null && rooms[index] === id && !!collection.owned[id]);
  if (active.includes('wave-healer')) {
    satisfaction += Math.min(4, active.filter(id => id !== 'wave-healer' &&
      SPIRIT_BY_ID[id].element === 'water').length * 2);
  }
  if (active.includes('day-smith')) {
    coins += Math.min(9, active.filter(id => id !== 'day-smith' &&
      SPIRIT_BY_ID[id].faction === 'forge').length * 3);
  }
  if (active.includes('dusk-bell') && (factions.veil ?? 0) >= 2) {
    coins += 5;
    satisfaction -= 2;
  }
  if (active.includes('moss-keeper')) {
    satisfaction += Math.min(3, active.filter(id =>
      SPIRIT_BY_ID[id].faction !== 'grove').length);
  }
  for (const count of Object.values(factions)) {
    if (count >= 6) { coins += 8; satisfaction += 4; }
    else if (count >= 4) { coins += 4; satisfaction += 2; }
    else if (count >= 2) { coins += 2; satisfaction += 1; }
  }
  return { coins, satisfaction };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
function inRange(value: unknown, max: number): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= max;
}
export function validCollection(value: unknown): value is CollectionState {
  if (!isRecord(value) || !isRecord(value.pity) || !isRecord(value.owned)) return false;
  if (!inRange(value.tickets, 100000) || !inRange(value.essence, 1000000) ||
    !inRange(value.totalPulls, 1000000)) return false;
  const pity = value.pity;
  if (!inRange(pity.sr, 9) || !inRange(pity.ssr, 49) || !inRange(pity.ur, 99)) return false;
  if (!Array.isArray(value.equipped) || value.equipped.length !== 6 ||
    !value.equipped.every((id: unknown) => id === null || isSpiritId(id))) return false;
  if (!Array.isArray(value.recent) || value.recent.length > 10 || !value.recent.every(isSpiritId)) return false;
  for (const [id, progress] of Object.entries(value.owned)) {
    if (!isSpiritId(id) || !isRecord(progress) || !inRange(progress.level, 30) ||
      progress.level < 1 || !inRange(progress.xp, 1000000) ||
      !inRange(progress.shards, 1000000) || !inRange(progress.evolution, 2) ||
      (progress.stars !== undefined && !inRange(progress.stars, MAX_STARS)) ||
      (progress.path !== undefined && progress.path !== 'prosperity' && progress.path !== 'harmony') ||
      (progress.path !== undefined && (progress.evolution !== 2 || SPIRIT_BY_ID[id].quality !== 'UR')) ||
      (progress.evolution > 0 && progress.level < progress.evolution * 10)) return false;
  }
  const equipped = value.equipped.filter((id): id is SpiritId => id !== null);
  return new Set(equipped).size === equipped.length &&
    equipped.every((id) => Object.hasOwn(value.owned as object, id));
}
