import type {CharacterLifeState,RoomObjectId} from './character-life';

/** Pure view of the EXISTING observation save; never writes separate cards. */
export type YueshaMemoryCardId='seal'|'tea'|'ledger'|'contract';
export type YueshaMemoryCard={
  id:YueshaMemoryCardId;
  title:string;
  subtitle:string;
  mark:string;
  required:readonly RoomObjectId[];
  unlocked:boolean;
};
const CARD_DEFINITIONS=[
  {id:'seal',title:'月纹印记',subtitle:'刻在蜡封上的旧符号',mark:'☾',required:['seal']},
  {id:'tea',title:'香料余温',subtitle:'一杯茶与缓慢的承诺',mark:'✧',required:['tea']},
  {id:'ledger',title:'未寄出的账页',subtitle:'未公开的过往记录',mark:'❧',required:['ledger']},
  {id:'contract',title:'半月旧契',subtitle:'两件物证的共鸣',mark:'✦',required:['seal','ledger']},
] as const satisfies ReadonlyArray<{
  id:YueshaMemoryCardId;title:string;subtitle:string;mark:string;
  required:readonly RoomObjectId[];
}>;
export function yueshaMemoryCards(state:CharacterLifeState):YueshaMemoryCard[]{
  const observed:readonly RoomObjectId[]=state.observations?.yuesha??[];
  return CARD_DEFINITIONS.map(card=>({...card,
    unlocked:card.required.every(item=>observed.includes(item)),
  }));
}
