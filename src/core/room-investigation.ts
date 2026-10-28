import type {CharacterLifeState,CharacterId,RoomObjectId} from './character-life';

/** Read-only cross-room discoveries. No inventory or story chapter advances here. */
export const ROOM_INVESTIGATIONS=[
  {id:'water',characterId:'brook',short:'水脉刻度',locked:'泉泡的休息间里似乎留下了什么',
    required:['toolbox','gauge'],revealed:'空挂钩和压力表上的刻痕指向同一条备用管路，水泵的旧检修记录值得再看。'},
  {id:'garden',characterId:'fern',short:'褪色的花期',locked:'青枝的植物手札尚未读完',
    required:['herbarium','moonflower'],revealed:'花期手札的日期与窗边花瓣褪色时间吻合，异常可能不是季节变化。'},
  {id:'forge',characterId:'cinder',short:'遗忘的炉纹',locked:'炽角保存的旧工具仍有秘密',
    required:['hammer','blueprint'],revealed:'旧锻锤的工匠记号与稳定器草图的符号对应，早年可能尝试过更安全的路线。'},
  {id:'contract',characterId:'yuesha',short:'旧合同的半月纹',locked:'月纱并不急着揭开旧账',
    required:['seal','ledger'],revealed:'蜡封与旧账簿拥有相同的半月印纹；暂时还不能判断签订人的真正意图。'},
] as const satisfies ReadonlyArray<{
  id:string;characterId:CharacterId;short:string;locked:string;
  required:readonly RoomObjectId[];revealed:string;
}>;

export type InvestigationId=(typeof ROOM_INVESTIGATIONS)[number]['id'];
export type InvestigationProgress={
  id:InvestigationId;characterId:CharacterId;label:string;
  count:number;total:number;complete:boolean;summary:string;
};
export function roomInvestigations(state:CharacterLifeState):InvestigationProgress[]{
  return ROOM_INVESTIGATIONS.map(item=>{
    const examined:readonly RoomObjectId[]=state.observations?.[item.characterId]??[];
    const count=item.required.filter(id=>examined.includes(id)).length;
    return {id:item.id,characterId:item.characterId,label:item.short,
      count,total:item.required.length,complete:count===item.required.length,
      summary:count===item.required.length?item.revealed:item.locked};
  });
}
/** A gentle payoff to exploring all four places; doesn't reveal later chapters. */
export function roomInvestigationConclusion(state:CharacterLifeState):string|null{
  const complete=roomInvestigations(state).every(item=>item.complete);
  if(!complete)return null;
  return state.decisions['yuesha-first-visit']==='transparent'
    ?'你把四份记录整理成一张公开的修复建议：旧水路、月光花和熔炉可能属于同一套停用的安全工程。月纱答应将来核查合同来源。'
    :state.decisions['yuesha-first-visit']==='careful'
      ?'四份私室线索指向同一个被遗忘的旧项目。你决定先让工坊可靠运转，再与月纱一起核对那些不敢公开的记录。'
      :'四个人的房间讲述了彼此相连的往事：水脉、花、熔炉和一枚半月纹。或许该去问问月纱对旧合同的看法。';
}
