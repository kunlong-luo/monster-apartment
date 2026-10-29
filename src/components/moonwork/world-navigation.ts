/** The ONE global destination registry. Scenes may link to a concrete action,
 * but global navigation must always have the same order, labels and purpose. */
export const CANONICAL_GAME_NAV=[
  {id:'lobby',label:'大厅',full:'大厅',glyph:'⌂',href:'/',purpose:'查看当前目标，和月纱交谈'},
  {id:'apartment',label:'公寓',full:'暗夜公寓',glyph:'♜',href:'/apartment/',purpose:'安排住客，经营房间'},
  {id:'workshop',label:'工坊',full:'工坊',glyph:'⚒',href:'/workshop/',purpose:'建设设备，给工匠派工并生产晶核'},
  {id:'characters',label:'角色',full:'角色图鉴',glyph:'♟',href:'/characters/',purpose:'认识人物，拜访私人房间'},
  {id:'orders',label:'委托',full:'委托大厅',glyph:'❦',href:'/orders/',purpose:'核对交期，接取契约并领取收益'},
  {id:'town',label:'探索',full:'月光街',glyph:'⚜',href:'/town/',purpose:'逛街区，采购补给并帮助居民'},
  {id:'warehouse',label:'仓库',full:'魔法仓库',glyph:'♧',href:'/warehouse/',purpose:'核对真实库存及可用物资'},
] as const;
export const WORLD_NAV=CANONICAL_GAME_NAV;
export type GameDestinationId=(typeof CANONICAL_GAME_NAV)[number]['id'];
export function destinationByHref(href:string){
  return CANONICAL_GAME_NAV.find(route=>route.href===href);
}
