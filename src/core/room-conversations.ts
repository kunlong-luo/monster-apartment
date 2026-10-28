import type {CharacterId,RoomObjectId} from './character-life';

export type RoomConversationTopic={
  id:string;
  title:string;
  requires:readonly RoomObjectId[];
  lockedHint:string;
  response:string;
};
/** An optional, replayable conversation layer. Locked topics never leak their
 * dialogue; a permanent first-visit decision is never repeated or overwritten. */
export const ROOM_CONVERSATION_TOPICS:Readonly<Record<CharacterId,readonly RoomConversationTopic[]>>={
  yuesha:[
    {id:'moon',title:'今夜的月色',requires:[],lockedHint:'',
      response:'“窗外的月亮看着所有门，却从不替任何人作决定。今晚，你想让它照见什么？”'},
    {id:'tea',title:'闻一闻香料茶',requires:['tea'],lockedHint:'先调查场景中的香料茶杯',
      response:'“桂皮要等水温合适才会舒展。人也是，不能靠一份急着签下的契约就变得可靠。”'},
    {id:'contract',title:'追问半月旧约',requires:['seal','ledger'],lockedHint:'需要先观察月纹蜡封与旧账簿',
      response:'“你已经注意到那两枚相同的半月纹了。它们来自同一位见证人……名字，我还需要核实。”'},
  ],
  brook:[
    {id:'rest',title:'你休息好了吗？',requires:[],lockedHint:'',
      response:'“我发现坐下来听听水声，真的比盯着压力表更容易想清楚问题。”'},
    {id:'tool',title:'扳手去了哪里？',requires:['toolbox'],lockedHint:'先观察空掉的工具挂钩',
      response:'“我记得把它放在最安全的地方。要不是你提醒，我会一直以为是自己丢三落四。”'},
    {id:'water',title:'夜里的水声',requires:['toolbox','gauge'],lockedHint:'先找出工具挂钩和水汽压力表的联系',
      response:'“那条备用管路不该在午夜发出声音。等我值完班，我们再查一次检修表。”'},
  ],
  fern:[
    {id:'plant',title:'聊聊窗边的花',requires:[],lockedHint:'',
      response:'“植物不会说话，但它们留下的变化，是最诚实的日记。”'},
    {id:'pages',title:'聊聊花期记录',requires:['herbarium'],lockedHint:'先观察花期手札',
      response:'“这些日期原本很平常，直到我发现有几天的花瓣同时失去了颜色。”'},
    {id:'moonwater',title:'花与旧水脉',requires:['herbarium','moonflower'],lockedHint:'先观察手札和窗边月光花',
      response:'“有时不是花不肯开放，是它脚下的水已不再流向这里。我还在寻找原因。”'},
  ],
  cinder:[
    {id:'work',title:'修补间的火候',requires:[],lockedHint:'',
      response:'“炉子不能只有火力，稳定才是它真正的脾气。现在我比从前更懂这个道理。”'},
    {id:'hammer',title:'你的第一把锻锤',requires:['hammer'],lockedHint:'先观察旧锻锤',
      response:'“握柄都磨光了，我还是舍不得扔。那时我以为只要够用力，就什么都能造好。”'},
    {id:'safe',title:'那张稳定器草图',requires:['hammer','blueprint'],lockedHint:'先观察旧锻锤与稳定器草图',
      response:'“我留着那张图，就是要提醒自己：产得多不等于做得好。下一次我们一起试安全值。”'},
  ],
};

export type VisibleRoomTopic=RoomConversationTopic & {unlocked:boolean};
export function roomConversationTopics(
  id:CharacterId,observed:readonly RoomObjectId[],
):VisibleRoomTopic[]{
  return ROOM_CONVERSATION_TOPICS[id].map(topic=>({
    ...topic,unlocked:topic.requires.every(required=>observed.includes(required)),
  }));
}
