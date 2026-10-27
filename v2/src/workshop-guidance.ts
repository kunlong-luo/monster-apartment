/** Pure actionable workshop hints and first-order objective copy.
 * Depends only on the saved state model, never React or PixiJS. */
import {MACHINES,WORKERS,WIDTH,linked} from './workshop-model';
import type {Craft,WorkerId,WorkshopState} from './workshop-model';

/** Contextual objective: surface only one useful next decision in the
 * existing selection bar, instead of filling the full-screen art with UI. */
/** One spatial hint derived from the same authoritative save as the engine.
 * Never auto-move machines, mint currency or bypass player decisions. */
export type WorkshopHint={
  action:'move'|'build'|'staff'|'shift'|'recover';
  source:number|null;target:number|null;
  craft?:Craft;worker?:WorkerId;
};
export function workshopHint(s:WorkshopState):WorkshopHint {
  const indices=(craft:Craft)=>s.tiles.flatMap((tile,i)=>tile?.craft===craft?[i]:[]);
  const vacancy=()=>s.tiles.findIndex(tile=>tile===null);
  const distance=(a:number,b:number)=>
    Math.abs(Math.floor(a/WIDTH)-Math.floor(b/WIDTH))+
    Math.abs(a%WIDTH-b%WIDTH);
  const adjacentEmpty=(index:number,near?:number)=>{
    const candidates=s.tiles.flatMap((tile,i)=>
      tile===null&&linked(index,i)?[i]:[]);
    if(near!==undefined)candidates.sort((a,b)=>distance(a,near)-distance(b,near)||a-b);
    return candidates[0]??-1;
  };
  const hasPair=(a:Craft,b:Craft)=>indices(a).some(i=>indices(b).some(j=>linked(i,j)));
  const recover=():WorkshopHint=>({
    action:'recover',
    source:s.tiles.findIndex(tile=>tile!==null&&indices(tile.craft).length>1),
    target:null,
  });
  for(const craft of ['well','garden'] as const){
    if(indices(craft).length===0)return s.coins<MACHINES[craft].cost?recover():{
      action:'build',source:null,target:vacancy(),craft,
    };
  }
  if(!hasPair('well','garden')){
    for(const source of indices('garden')){
      for(const well of indices('well')){
        const target=adjacentEmpty(well,source);
        if(target>=0)return {action:'move',source,target};
      }
    }
    for(const source of indices('well')){
      for(const garden of indices('garden')){
        const target=adjacentEmpty(garden,source);
        if(target>=0)return {action:'move',source,target};
      }
    }
    return {action:'move',source:indices('garden')[0],target:null};
  }
  if(indices('kiln').length===0){
    if(s.coins<MACHINES.kiln.cost)return recover();
    const target=indices('garden').map(index=>adjacentEmpty(index)).find(i=>i>=0)??vacancy();
    return {action:'build',source:null,target,craft:'kiln'};
  }
  if(!hasPair('garden','kiln')){
    const target=indices('garden').map(index=>adjacentEmpty(index)).find(i=>i>=0);
    return {action:'move',source:indices('kiln')[0],target:target??null};
  }
  for(const [craft,worker] of [['well','brook'],['garden','fern'],['kiln','cinder']] as const){
    if(!s.tiles.some(tile=>tile?.craft===craft&&tile.worker)){
      const target=indices(craft).find(i=>s.tiles[i]?.worker===null)??indices(craft)[0];
      return {action:'staff',source:null,target,worker};
    }
  }
  return {action:'shift',source:null,target:null};
}
export function workshopNextStep(s:WorkshopState):string {
  const hasConnection=(from:Craft,to:Craft)=>
    s.tiles.some((a,i)=>a?.craft===from&&s.tiles.some((b,j)=>
      b?.craft===to&&linked(i,j)));
  for(const craft of ['well','garden'] as const){
    if(!s.tiles.some(machine=>machine?.craft===craft))
      return s.coins<MACHINES[craft].cost
        ?'资金不足 · 回收其他设备或重置工坊，重新建造'+MACHINES[craft].zh
        :'第1步 · 重新建造'+MACHINES[craft].zh+'并接入生产链';
  }
  if(!hasConnection('well','garden'))
    return '第1步 · 把温室移动到紧邻水汽泵的空格';
  if(!s.tiles.some(m=>m?.craft==='kiln'))
    return s.coins<MACHINES.kiln.cost
      ?'资金不足 · 选中多余设备回收星币，再建晶核熔炉'
      :'第2步 · 建造晶核熔炉，并紧邻温室';
  if(!hasConnection('garden','kiln'))
    return '第3步 · 把晶核熔炉搬到温室旁边';
  for(const [craft,worker] of [['well','brook'],['garden','fern'],['kiln','cinder']] as const){
    if(!s.tiles.some(m=>m?.craft===craft&&m.worker))
      return '第4步 · 选择工匠'+WORKERS[worker].zh+'，点击对应设备派工';
  }
  if(s.warehouse.core>=s.order.cores)
    return '晶核已达标 · 继续生产至第'+s.order.due+'天自动交付';
  return '第5步 · 点击「开始一天生产」，积攒晶核完成订单';
}
