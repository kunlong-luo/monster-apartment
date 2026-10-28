import type {CharacterId,RoomObjectId,YueshaChoice} from './character-life';

/** Short in-scene acting cues, intentionally separate from the full clue text.
 * They are presentation-only; they never grant items or change world economy. */
const REACTIONS:Record<CharacterId,Partial<Record<RoomObjectId,string>>>={
  yuesha:{
    seal:'月纱的指尖在半月印纹上停了一瞬。',
    tea:'“茶还温着。慢慢说，不必急。”',
    ledger:'她轻合账本，目光却没有躲开你。',
  },
  brook:{
    toolbox:'泉泡抓了抓头发，似乎又想起那把扳手。',
    gauge:'“听，压力下降前，铜铃会先响。”',
    nightbell:'铜铃轻晃，屋里响起清脆的一声。',
  },
  fern:{
    herbarium:'青枝小心压住被风掀起的书页。',
    moonflower:'“别碰花瓣，它今天有点怕光。”',
    watermap:'她用指尖沿着地图上的断线移动。',
  },
  cinder:{
    hammer:'炽角握紧锻锤，又把它放回原处。',
    blueprint:'“这一次，我想先算清楚安全余量。”',
    keepsake:'他望着废件匣，难得沉默了片刻。',
  },
};
export function roomSceneReaction(character:CharacterId,item:RoomObjectId):string{
  return REACTIONS[character][item]??'房间里留下一段未解的记忆。';
}

/** Only after all three observations: optional, non-spoiler easter egg.
 * Existing V1 saves can derive it without migration or an extra flag. */
export function yueshaRoomEasterEgg(
  observed:readonly RoomObjectId[],choice:YueshaChoice|undefined,
):string|null{
  if(!(['seal','tea','ledger'] as const).every(item=>observed.includes(item)))return null;
  if(choice==='transparent')
    return '月纱把茶杯挪开，露出一张未寄出的收据：“你说过真相应当被看见。等我核实最后一笔，就让它见光。”';
  if(choice==='careful')
    return '月纱将收据折好：“你说要先稳住大家的生活。我会保留证据，但不会再让它消失。”';
  return '你发现杯垫背后压着一枚倒置的半月印。月纱轻声说：“别急着读懂它，我们还有时间。”';
}
