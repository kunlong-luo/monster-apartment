/** Pure actionable workshop hints and first-order objective copy.
 * Depends only on the saved state model, never React or PixiJS. */
import {MACHINES,WORKERS,WIDTH,linked} from './workshop-model';
import type {Craft,WorkerId,WorkshopState} from './workshop-model';
import {autoContractShortage} from './workshop-production';

/** Contextual objective: surface only one useful next decision in the
 * existing selection bar, instead of filling the full-screen art with UI. */
/** One spatial hint derived from the same authoritative save as the engine.
 * Never auto-move machines, mint currency or bypass player decisions. */
export type WorkshopHint={
  action:'move'|'build'|'staff'|'shift'|'recover'|'wait';
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
  // Auto cycles are the active action here. The explicit manual shift
  // button is disabled while auto production is running; never suggest
  // a click that cannot succeed or pretend that auto time advances orders.
  if(s.auto?.enabled)return {action:'wait',source:null,target:null};
  return {action:'shift',source:null,target:null};
}
/** Shared read-only calendar state; a manual forecast is not an automatic loss. */
export function workshopCalendarStatus(s:WorkshopState):{mode:'manual'|'production-only'|'automatic';shortage:number;text:string}{
  if(!s.auto?.enabled)return {mode:'manual',shortage:0,text:'手动轮班推进委托日；到期缺货按规则扣罚'};
  if(!s.auto.autoDeliver)return {mode:'production-only',shortage:0,text:'自动生产中 · 委托日不推进，需单独开启自动履约或暂停后手动轮班'};
  const shortage=autoContractShortage(s);
  return {mode:'automatic',shortage,text:shortage>0
    ?'自动履约等待晶核补足 · 到期委托合计还缺 '+shortage+' 枚，缺货不扣罚'
    :'自动履约已开启 · 每4分钟安全推进1天，缺货不扣罚'};
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
  if(s.auto?.enabled){
    if(s.auto.autoDeliver)return workshopCalendarStatus(s).text;
    return s.warehouse.core>=s.order.cores
      ?'晶核已备齐 · 可开启自动履约，或暂停后手动轮班结算'
      :'自动产线运行中 · 可开启自动履约；否则暂停后手动轮班推进委托日';
  }
  if(s.warehouse.core>=s.order.cores)
    return '晶核已达标 · 点击「手动轮班」推进至第'+s.order.due+'日结算';
  return '第5步 · 开启自动生产持续制造晶核；或点击「手动轮班」推进委托日。自动履约需要单独开启';
}

/** The hostess acknowledges real delivery progress, then points to one existing
 * action. This is narrative guidance, not a new quest or reward ledger. */
export function moonveilFirstChapter(s:WorkshopState):{text:string;href:string;label:string}{
  const patron=s.patron;
  if(patron?.status==='offered')return {
    text:'你已经完成了普通委托。谢谢你，我有一份特别委托想交给你，先看看期限和所需晶核吧。',
    href:'/orders/',label:'查看委托与契约 ›',
  };
  if(patron?.status==='active')return {
    text:`我们的特别委托约定在第 ${patron.due} 天交付 ${patron.cores} 枚晶核。库存还有 ${s.warehouse.core} 枚，也要留意普通委托的需求。`,
    href:'/orders/',label:'查看委托与契约 ›',
  };
  if(patron?.status==='completed')return {
    text:'特别委托已经完成。谢谢你兑现了我们的约定。来我的房间坐一会儿吧。',
    href:'/apartment/?visit=yuesha',label:'拜访月纱 · 继续故事 ›',
  };
  if(s.completed>0)return {
    text:patron?.status==='missed'||patron?.status==='expired'
      ?'特别委托没能如约完成，不过我们已经有了经营公寓的经验。来我的房间聊聊吧。'
      :'第一批委托已经完成。辛苦了，来我的房间聊聊吧。',
    href:'/apartment/?visit=yuesha',label:'拜访月纱 · 继续故事 ›',
  };
  if(s.warehouse.core>=s.order.cores)return {
    text:'第一批晶核已经备齐。去委托所确认交期与奖励；完成交付后再来找我。',
    href:'/orders/',label:'查看委托与契约 ›',
  };
  return {
    text:'欢迎来到夜色公寓。我是月纱。先去工坊开启自动生产，并按需开启自动履约；完成第一批委托后再来找我。',
    href:'/workshop/',label:'进入晶核工坊 ›',
  };
}
