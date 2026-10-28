/** V3.4 character identity is independent from workshop/apartment economics. */
export type CharacterId='yuesha'|'brook'|'fern'|'cinder';
export type AbilityGroup='身体'|'认知'|'精神'|'社交'|'生活';
export const ABILITY_GROUPS=[
  {name:'身体',keys:['physique','strength','speed','endurance','vitality']},
  {name:'认知',keys:['wisdom','perception','memory','creativity','focus']},
  {name:'精神',keys:['spirit','willpower','resilience','discipline']},
  {name:'社交',keys:['empathy','communication','affinity','leadership']},
  {name:'生活',keys:['dexterity','aesthetics']},
] as const;
export const ABILITY_LABELS={
  physique:'体魄',strength:'力量',speed:'速度',endurance:'耐力',vitality:'血气',
  wisdom:'智慧',perception:'感知',memory:'记忆',creativity:'创造',focus:'专注',
  spirit:'灵能',willpower:'意志',resilience:'抗压',discipline:'自律',
  empathy:'共情',communication:'表达',affinity:'亲和',leadership:'领导',
  dexterity:'手巧',aesthetics:'审美',
} as const;
export type AbilityKey=keyof typeof ABILITY_LABELS;
export type Abilities=Record<AbilityKey,number>;
type Profile={
  id:CharacterId;name:string;title:string;rarity:string;description:string;
  traits:readonly string[];likes:string;fear:string;goal:string;
  strengths:readonly AbilityKey[];abilities:Abilities;
};
/** Lore-only reference values: not yet applied to machine efficiency or equipment. */
export const CHARACTER_PROFILES:Readonly<Record<CharacterId,Profile>>={
  yuesha:{
    id:'yuesha',name:'月纱',title:'月夜魔女 · 契约商人',rarity:'剧情人物',
    description:'善于谈判的成年魔女，笑容从容，却仍在犹豫是否公开旧契约。',
    traits:['谨慎而机敏','幽默','守约','不轻易信任'],likes:'月纹印章、香料茶、整齐的契约',
    fear:'旧错误再次伤害无辜的居民',goal:'证明负责任的交易也能让月光街变好',
    strengths:['wisdom','memory','communication','focus'],
    abilities:{physique:44,strength:32,speed:67,endurance:45,vitality:49,
      wisdom:86,perception:77,memory:82,creativity:64,focus:78,
      spirit:73,willpower:71,resilience:58,discipline:79,
      empathy:63,communication:88,affinity:72,leadership:69,dexterity:66,aesthetics:83},
  },
  brook:{
    id:'brook',name:'泉泡',title:'水灵工匠 · 水汽调谐',rarity:'剧情人物',
    description:'热情又容易紧张的水灵，习惯照顾大家，却还不太会说“不”。',
    traits:['热心','容易紧张','乐于助人','偶尔粗心'],likes:'水泡、铜铃、小工具盒',
    fear:'同伴觉得自己不可靠',goal:'让工坊的水汽供应稳定，并学会安心休息',
    strengths:['spirit','vitality','perception','empathy'],
    abilities:{physique:54,strength:30,speed:61,endurance:57,vitality:79,
      wisdom:57,perception:82,memory:44,creativity:67,focus:63,
      spirit:85,willpower:58,resilience:53,discipline:49,
      empathy:82,communication:61,affinity:83,leadership:43,dexterity:66,aesthetics:62},
  },
  fern:{
    id:'fern',name:'青枝',title:'温室园艺师 · 月光植物',rarity:'剧情人物',
    description:'温柔、安静却有明确原则的园艺师，比任何人都在意水脉与植物。',
    traits:['耐心','敏锐','温柔而坚定','注重生态'],likes:'花期记录、植物压花、微光玻璃',
    fear:'新的工业计划再次伤害水脉',goal:'让月光花园恢复自然循环',
    strengths:['perception','focus','creativity','empathy'],
    abilities:{physique:56,strength:38,speed:52,endurance:65,vitality:64,
      wisdom:79,perception:89,memory:81,creativity:82,focus:86,
      spirit:77,willpower:80,resilience:68,discipline:81,
      empathy:87,communication:57,affinity:62,leadership:58,dexterity:75,aesthetics:88},
  },
  cinder:{
    id:'cinder',name:'炽角',title:'晶核锻造师 · 熔炉维护',rarity:'剧情人物',
    description:'干劲十足的锻造师，嘴硬心软，正在学习可靠性比最高产量更重要。',
    traits:['豪爽','骄傲','直率','行动派'],likes:'老炉铭牌、锻锤、失败零件',
    fear:'自己造出的机器让同伴受伤',goal:'造出长久、安全、值得自豪的工坊',
    strengths:['strength','physique','endurance','creativity'],
    abilities:{physique:89,strength:91,speed:62,endurance:84,vitality:73,
      wisdom:64,perception:64,memory:54,creativity:82,focus:72,
      spirit:51,willpower:87,resilience:74,discipline:65,
      empathy:56,communication:66,affinity:64,leadership:69,dexterity:75,aesthetics:59},
  },
};
export type YueshaChoice='transparent'|'careful';
export type CharacterLifeState={
  version:1;
  visited:CharacterId[];
  /** Unique once-only choice; not a repeatable affection meter. */
  decisions:Partial<Record<'yuesha-first-visit',YueshaChoice>>;
};
export const newCharacterLife=():CharacterLifeState=>({version:1,visited:[],decisions:{}});
export function validCharacterLife(value:unknown):value is CharacterLifeState{
  if(!value||typeof value!=='object')return false;
  const s=value as Partial<CharacterLifeState>;
  return s.version===1&&Array.isArray(s.visited)&&
    s.visited.every(id=>typeof id==='string'&&Object.hasOwn(CHARACTER_PROFILES,id))&&
    new Set(s.visited).size===s.visited.length&&s.visited.length<=4&&
    !!s.decisions&&typeof s.decisions==='object'&&!Array.isArray(s.decisions)&&
    Object.keys(s.decisions).every(key=>key==='yuesha-first-visit')&&
    (s.decisions['yuesha-first-visit']===undefined||
     s.decisions['yuesha-first-visit']==='transparent'||
     s.decisions['yuesha-first-visit']==='careful');
}
export function visitCharacter(state:CharacterLifeState,id:CharacterId):CharacterLifeState{
  return state.visited.includes(id)?state:{...state,visited:[...state.visited,id]};
}
export function decideYuesha(state:CharacterLifeState,choice:YueshaChoice):CharacterLifeState{
  if(state.decisions['yuesha-first-visit'])return state;
  return {...state,decisions:{...state.decisions,'yuesha-first-visit':choice}};
}
export function yueshaAfterChoice(choice:YueshaChoice|undefined):string{
  if(choice==='transparent')return '“你愿意先让东街知道合同的后果……我会记得这句话。也许我们该把账本摊开。”';
  if(choice==='careful')return '“你想先把生产稳住，再作承诺。我喜欢这种谨慎；但别忘了，那些等灯亮的人也在等待。”';
  return '“你看见那枚月纹印章了吗？它属于一段我还没准备好讲完的往事。”';
}
