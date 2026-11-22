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
    id:'brook',name:'泉泡',title:'水系术师 · 水汽调谐',rarity:'剧情人物',
    description:'成年水系术师，身穿深蓝铜饰工装，热情又容易紧张，习惯照顾大家，却还不太会说“不”。',
    traits:['热心','容易紧张','乐于助人','偶尔粗心'],likes:'水泡、铜铃、小工具盒',
    fear:'同伴觉得自己不可靠',goal:'让工坊的水汽供应稳定，并学会安心休息',
    strengths:['spirit','vitality','perception','empathy'],
    abilities:{physique:54,strength:30,speed:61,endurance:57,vitality:79,
      wisdom:57,perception:82,memory:44,creativity:67,focus:63,
      spirit:85,willpower:58,resilience:53,discipline:49,
      empathy:82,communication:61,affinity:83,leadership:43,dexterity:66,aesthetics:62},
  },
  fern:{
    id:'fern',name:'青枝',title:'精灵植物学家 · 月光温室',rarity:'剧情人物',
    description:'成年精灵植物学家，披着翠绿月纱与藤叶披肩，温柔、安静却有明确原则。',
    traits:['耐心','敏锐','温柔而坚定','注重生态'],likes:'花期记录、植物压花、微光玻璃',
    fear:'新的工业计划再次伤害水脉',goal:'让月光花园恢复自然循环',
    strengths:['perception','focus','creativity','empathy'],
    abilities:{physique:56,strength:38,speed:52,endurance:65,vitality:64,
      wisdom:79,perception:89,memory:81,creativity:82,focus:86,
      spirit:77,willpower:80,resilience:68,discipline:81,
      empathy:87,communication:57,affinity:62,leadership:58,dexterity:75,aesthetics:88},
  },
  cinder:{
    id:'cinder',name:'炽角',title:'赤金锻造师 · 熔炉维护',rarity:'剧情人物',
    description:'成年赤金锻造师，头饰是金属铸角而非怪物兽角；独立好胜，正在学习可靠性比最高产量更重要。',
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
export type WorkerCharacterId=Exclude<CharacterId,'yuesha'>;
export type WorkerChoice='care'|'practice';
export type RoomObjectId='seal'|'tea'|'ledger'|'toolbox'|'gauge'|'nightbell'
  |'herbarium'|'moonflower'|'watermap'|'hammer'|'blueprint'|'keepsake';
export const CHARACTER_ROOM_OBJECTS:Record<CharacterId,readonly RoomObjectId[]>={
  yuesha:['seal','tea','ledger'],
  brook:['toolbox','gauge','nightbell'],
  fern:['herbarium','moonflower','watermap'],
  cinder:['hammer','blueprint','keepsake'],
};
export const WORKER_DIALOGUES:Record<WorkerCharacterId,{
  roomName:string;roomSummary:string;greeting:string;
  choices:readonly [{id:'care';label:string},{id:'practice';label:string}];
  responses:Record<WorkerChoice,string>;
  objects:readonly {id:RoomObjectId;label:string;text:string}[];
  whisper:string;
}>={
  brook:{
    roomName:'铜管休息间',roomSummary:'潮湿的铜阀、蓝色月灯与修理工具，泉泡喜欢在这里慢慢整理思绪。',
    greeting:'“咕噜！你真的会来休息间找我？今天我把扳手放在了一个特别安全的地方……应该吧！”',
    choices:[{id:'care',label:'“工作累了，就先休息一会。”'},{id:'practice',label:'“一起核对水位表，找找原因吧。”'}],
    responses:{
      care:'“原来我不用每次都证明自己很有用。那、那我今天先坐一会儿！”',
      practice:'“一起查表真好！你看，压力回落的时候，铜铃会先响一声。”',
    },
    objects:[
      {id:'toolbox',label:'空掉的工具挂钩',text:'泉泡把扳手按大小排过序，最常用的那一格却空着。'},
      {id:'gauge',label:'水汽压力表',text:'蓝色刻度旁有一个细小手写记号，正好对应排水阀的夜间压力。'},
      {id:'nightbell',label:'小铜铃',text:'“如果水泵的声音太大，你听到铃响就叫我。”泉泡小声说。'},
    ],
    whisper:'你把空挂钩与水位表的刻痕连在一起：泉泡寻找的扳手也许就在检修阀旁。',
  },
  fern:{
    roomName:'叶影温室',roomSummary:'月光玻璃、植物手札和很久以前保存的花瓣。青枝的生活有自己的节律。',
    greeting:'“先小声一点好吗？这朵花刚睡下。欢迎你来，窗边还有一个位置。”',
    choices:[{id:'care',label:'“我愿意等植物慢慢长好。”'},{id:'practice',label:'“我们研究更节水的种植办法。”'}],
    responses:{
      care:'“你愿意给它们时间……这比任何肥料都难得。谢谢。”',
      practice:'“新的技术不一定伤害花。只要我们肯听水脉的回答。”',
    },
    objects:[
      {id:'herbarium',label:'花期手札',text:'青枝记录了每朵花开放的日期，也记着它们枯萎时的天气。'},
      {id:'moonflower',label:'窗边月光花',text:'花瓣靠近窗框的一侧泛着淡淡的月光，另一侧却失去了颜色。'},
      {id:'watermap',label:'旧水脉图',text:'图纸上的一道浅线在东街前突然中断，青枝尚未确认原因。'},
    ],
    whisper:'手札里退色的花期与水脉图上的断线对应，仿佛有人曾改变了地下流向。',
  },
  cinder:{
    roomName:'炉火修补间',roomSummary:'厚重的炉砖、暖铜工具墙和收起来的失败零件。这里有炽角自豪也懊恼的过去。',
    greeting:'“嘿！你来得正好。我刚把这个齿轮重新磨了一遍——这次保证不会弹出去！”',
    choices:[{id:'care',label:'“比起产量，我更在意设备安全。”'},{id:'practice',label:'“研究怎样让工坊稳定高效吧。”'}],
    responses:{
      care:'“我知道。以前总想着造得更快……现在要让大家平安回家才算本事。”',
      practice:'“说得好！真正的效率不是让炉子冒烟，是它能一直可靠地工作。”',
    },
    objects:[
      {id:'hammer',label:'旧锻锤',text:'锤柄包着磨损的皮带，是炽角第一件自己完成的工具。'},
      {id:'blueprint',label:'稳定器草图',text:'草图旁写着“不能只算最大产量”，一些关键参数还待实验。'},
      {id:'keepsake',label:'失败零件匣',text:'这些废件没有被丢掉。炽角说，它们能提醒自己别再犯同样的错。'},
    ],
    whisper:'锤柄刻痕与旧熔炉铭牌出现同一符号，这可能不只是工匠的私人习惯。',
  },
};

export const YUESHA_ROOM_SCENES = [
  { id: 'chamber', name: '契约会客室', sub: '当前场景' },
  { id: 'balcony', name: '月光阳台', sub: '夜色露台' },
  { id: 'bath', name: '私人浴室', sub: '温汤水汽' },
  { id: 'wardrobe', name: '衣帽间', sub: '华服更衣' },
] as const;

export const YUESHA_MEMORIES = [
  { id: 'first_night', title: '初遇之夜', quote: '月光下的第一份契约' },
  { id: 'secret', title: '月下的秘密', quote: '属于魔女的心事' },
  { id: 'warmth', title: '枕边的温度', quote: '深夜微光的陪伴' },
  { id: 'contract', title: '未完的契约', quote: '未尽的盟誓' },
] as const;

export const YUESHA_HOTSPOTS = [
  { id: 'wardrobe', label: '衣柜', icon: 'Shirt', top: '22%', left: '24%', text: '沉木衣柜里收纳着华美的礼服与蕾丝披肩。' },
  { id: 'vanity', label: '梳妆台', icon: 'Search', top: '38%', left: '20%', text: '黄铜镜前摆放着各种精致的香水瓶与月晶饰品。' },
  { id: 'rose', label: '玫瑰花', icon: 'Search', top: '56%', left: '18%', text: '盛开的暗红玫瑰，带有一丝幽香。' },
  { id: 'tea', label: '红茶', icon: 'Coffee', top: '64%', left: '30%', text: '热气腾腾的红茶散发出桂皮与蜂蜜的甜香。' },
  { id: 'contract', label: '旧契约', icon: 'Mail', top: '65%', left: '48%', text: '盖有月纹火漆的古老羊皮纸，书写着未公开的约定。' },
  { id: 'window', label: '月光窗', icon: 'Search', top: '26%', left: '58%', text: '哥特式的尖顶高窗，月光倾泻而下。' },
  { id: 'cat', label: '黑猫', icon: 'Cat', top: '41%', left: '72%', text: '一只神秘的纯黑猫咪，慵懒地躺在发光的软垫上。' },
  { id: 'bed', label: '床榻', icon: 'Bed', top: '60%', left: '74%', text: '深红金丝绒雕花大床，散发着沉木馨香。' },
] as const;

export const YUESHA_DIALOGUES = [
  { id: 'how_are_you', text: '最近过得怎么样？', icon: 'MessageSquare', response: '“有你常来拜访，这间寂静的会客室热闹了不少呢。”' },
  { id: 'moonlight', text: '今晚的月色真美。', icon: 'Moon', response: '“是啊……特别是在窗前的这束月光里，让人心思泛起。”' },
  { id: 'tea_together', text: '想和你一起喝杯茶。', icon: 'Coffee', response: '“刚好，红茶刚煮好。坐下来慢慢品尝吧。”' },
  { id: 'about_contract', text: '关于我们的契约……', icon: 'BookOpen', response: '“有些契约不会写在纸上，而是刻在月光里。别担心，我一直守约。”' },
  { id: 'research', text: '你在研究什么？', icon: 'Search', response: '“在整理一些旧魔法地图与水晶能量流动。你有兴趣一起看看吗？”' },
  { id: 'embrace', text: '可以抱你吗？', icon: 'Heart', response: '“……真是贪心呢。不过，如果是你的话，今夜准许了。”' },
] as const;

export const YUESHA_GIFTS = [
  { id: 'rose', name: '月光玫瑰', icon: '🌹', exp: 50 },
  { id: 'tea', name: '香料红茶', icon: '☕', exp: 30 },
  { id: 'pendant', name: '月纹吊坠', icon: '📿', exp: 100 },
  { id: 'pudding', name: '夜色布丁', icon: '🍮', exp: 40 },
] as const;
export type CharacterLifeState={
  version:1;
  visited:CharacterId[];
  /** Original V3.4 decision is retained verbatim for save compatibility. */
  decisions:Partial<Record<'yuesha-first-visit',YueshaChoice>>;
  /** Optional V3.4 additions; historical saves remain valid without these fields. */
  workerDecisions?:Partial<Record<WorkerCharacterId,WorkerChoice>>;
  observations?:Partial<Record<CharacterId,RoomObjectId[]>>;
  /** Optional V1 storyline progress; no change to workshop save or economy. */
  workerChapters?:Partial<Record<WorkerCharacterId,1|2>>;
};
export const newCharacterLife=():CharacterLifeState=>({version:1,visited:[],decisions:{}});
const WORKER_IDS:readonly WorkerCharacterId[]=['brook','fern','cinder'];
export function validCharacterLife(value:unknown):value is CharacterLifeState{
  if(!value||typeof value!=='object'||Array.isArray(value))return false;
  const s=value as Partial<CharacterLifeState>;
  if(s.version!==1||!Array.isArray(s.visited)||
    !s.visited.every(id=>typeof id==='string'&&Object.hasOwn(CHARACTER_PROFILES,id))||
    new Set(s.visited).size!==s.visited.length||s.visited.length>4||
    !s.decisions||typeof s.decisions!=='object'||Array.isArray(s.decisions)||
    !Object.keys(s.decisions).every(key=>key==='yuesha-first-visit')||
    ![undefined,'transparent','careful'].includes(s.decisions['yuesha-first-visit']))return false;
  if(s.workerDecisions!==undefined){
    if(!s.workerDecisions||typeof s.workerDecisions!=='object'||Array.isArray(s.workerDecisions))return false;
    for(const [key,choice] of Object.entries(s.workerDecisions)){
      if(!WORKER_IDS.includes(key as WorkerCharacterId)||!['care','practice'].includes(choice))return false;
    }
  }
  if(s.observations!==undefined){
    if(!s.observations||typeof s.observations!=='object'||Array.isArray(s.observations))return false;
    for(const [key,ids] of Object.entries(s.observations)){
      if(!Object.hasOwn(CHARACTER_ROOM_OBJECTS,key)||!Array.isArray(ids)||
        new Set(ids).size!==ids.length||ids.length>3||
        !ids.every(id=>CHARACTER_ROOM_OBJECTS[key as CharacterId].includes(id)))return false;
    }
  }
  if(s.workerChapters!==undefined){
    if(!s.workerChapters||typeof s.workerChapters!=='object'||Array.isArray(s.workerChapters))return false;
    for(const [id,chapter] of Object.entries(s.workerChapters)){
      if(!WORKER_IDS.includes(id as WorkerCharacterId)||(chapter!==1&&chapter!==2))return false;
    }
  }
  return true;
}
export function visitCharacter(state:CharacterLifeState,id:CharacterId):CharacterLifeState{
  return state.visited.includes(id)?state:{...state,visited:[...state.visited,id]};
}
export function inspectCharacterRoom(state:CharacterLifeState,id:CharacterId,item:RoomObjectId):CharacterLifeState{
  if(!CHARACTER_ROOM_OBJECTS[id].includes(item))return state;
  const old=state.observations?.[id]??[];
  if(old.includes(item))return state;
  return {...state,observations:{...state.observations,[id]:[...old,item]}};
}
export function decideWorker(state:CharacterLifeState,id:WorkerCharacterId,choice:WorkerChoice):CharacterLifeState{
  if(state.workerDecisions?.[id])return state;
  return {...state,workerDecisions:{...state.workerDecisions,[id]:choice}};
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

/** A real delivery milestone unlocks an optional worker's room letter.
 * Clues and the first conversation stay authoritative in the existing V1
 * character save. Only completed orders are read from the validated V2 save;
 * this system never grants items, simulates production or changes prices. */
export const WORKER_STORY_CHAPTERS:Record<WorkerCharacterId,readonly [
  {title:string;care:string;practice:string},
  {title:string;care:string;practice:string}
]>={
  brook:[
    {title:'第一幕 · 夜铃后的回声',
      care:'第一份晶核送出后，泉泡终于肯放下扳手。她带你听墙后的水声：“谢谢你让我知道，休息不是失职。”钟声停下的瞬间，旧管道里却传来一声不属于水泵的回响。',
      practice:'第一份晶核送出后，你和泉泡重新校准压力表。备用阀门旁的刻痕与夜铃节拍完全一致。她兴奋地说：“这不是故障，是有人留给后人的检修信号！”'},
    {title:'第二幕 · 东街的第二条水脉',
      care:'第三份委托送达，泉泡终于讲出旧钟楼的故事。夜铃曾在水脉改道那天整夜不停。她把旧检修记录交给你：“下次我们一起把真相告诉青枝，好吗？”',
      practice:'第三份委托送达，你们将压力记录与旧水道图叠在一起。数字指向东街一条被封闭的支线，末端画着半月印记。泉泡提议请青枝确认植物的花期。'},
  ],
  fern:[
    {title:'第一幕 · 未寄出的花期信',
      care:'第一份委托结清后，青枝终于允许自己休息一个傍晚。她翻开退色的手札：“有人曾答应月光花不会枯萎，却没告诉我代价。”她让你保留那页有日期的记录。',
      practice:'第一份委托结清后，你和青枝用真实的水汽记录比对花期。花朵失色的日期与旧水脉图的断线吻合。“要修复花园，”她说，“先得弄清是谁改变了水路。”'},
    {title:'第二幕 · 玻璃下的旧约',
      care:'第三单完成的夜里，青枝发现窗边月光花重新开出一小瓣。她想起旧契约中曾写着“以街灯守护花园”。她把线索夹进手札，决定找月纱问清旧约。',
      practice:'第三单完成后，青枝在水脉图上标出一处被故意抹去的支线。她提出一份不会损伤花园的修复方案，却发现旁边落款的半月纹与月纱的封印很像。'},
  ],
  cinder:[
    {title:'第一幕 · 熔炉的另一份答卷',
      care:'第一单交付后，炽角不再只为高产量庆祝。她把一枚断裂的护片放在桌上：“那次差点有人受伤，幸好现在我们有时间重新设计。”你们约定先检查每一道安全阀。',
      practice:'第一单交付后，炽角让你看稳定器草图。她将熔炉输出与检修频率记在同一页：“真正厉害的机器，是持续可靠，而不是一次冲到极限。”'},
    {title:'第二幕 · 半月纹里的工匠',
      care:'第三单交付之后，炽角终于打开旧零件匣的最底层。失效的护片背面刻着半月徽记。她低声承认：那是旧安全工程留下的，她想找月纱一起修复。',
      practice:'第三单交付之后，你们把旧锻锤铭文与稳定器设计合并，发现两件物品都指向一套被废弃的安全标准。炽角请求你把这份推演带去月纱的会客室。'},
  ],
};

export type WorkerStoryProgress={
  current:0|1|2;next:1|2|null;ready:boolean;hint:string;
};
export function workerStoryProgress(
  state:CharacterLifeState,id:WorkerCharacterId,completedOrders:number
):WorkerStoryProgress{
  const current:0|1|2=state.workerChapters?.[id]??0;
  if(current===2)return {current,next:null,ready:false,hint:'两幕故事已经收录。'};
  const next:1|2=current===0?1:2;
  const requiredOrders=next===1?1:3;
  const requiredObjects=CHARACTER_ROOM_OBJECTS[id].slice(0,next===1?2:3);
  const observed=state.observations?.[id]??[];
  if(!state.visited.includes(id))
    return {current,next,ready:false,hint:'先进入她的房间。'};
  if(!state.workerDecisions?.[id])
    return {current,next,ready:false,hint:'先和她交谈，留下第一次重要选择。'};
  const clues=requiredObjects.filter(item=>observed.includes(item)).length;
  if(clues<requiredObjects.length)
    return {current,next,ready:false,hint:'调查房间关键物件 '+clues+'/'+requiredObjects.length+'。'};
  if(!Number.isSafeInteger(completedOrders)||completedOrders<requiredOrders)
    return {current,next,ready:false,hint:'在工坊真实完成 '+requiredOrders+' 单委托后解锁。'};
  return {current,next,ready:true,hint:'新的工坊往事可以收录。'};
}
export function recordWorkerStoryChapter(
  state:CharacterLifeState,id:WorkerCharacterId,completedOrders:number
):CharacterLifeState{
  const next=workerStoryProgress(state,id,completedOrders);
  return next.ready&&next.next!==null
    ?{...state,workerChapters:{...state.workerChapters,[id]:next.next}}
    :state;
}
export function workerStoryChapterText(
  state:CharacterLifeState,id:WorkerCharacterId,chapter:1|2
):string{
  const script=WORKER_STORY_CHAPTERS[id][chapter-1];
  return state.workerDecisions?.[id]==='practice'?script.practice:script.care;
}
