import type {WorkshopState} from '../../../v2/src/workshop-engine';

/** Read-only view of the most recently COMMITTED shift, not a prediction.
 * Production and order settlement are authoritative in runShift(). The
 * console never awards resources, reads storage or infers output from a
 * device's appearance. IDs stay stable when the UI filter changes.
 */
export type WorkshopLogKind='water'|'fiber'|'core'|'warning'|'contract'|'note';
export type WorkshopLogType='all'|'output'|'alert';
export type WorkshopProductionLogEntry=Readonly<{
  id:string;
  time:string;
  type:WorkshopLogType;
  kind:WorkshopLogKind;
  tone:'good'|'bad'|'neutral';
  text:string;
}>;

export function workshopProductionLog(world:WorkshopState):
readonly WorkshopProductionLogEntry[]{
  const report=world.last;
  if(!report){
    return [{
      id:'not-started',time:'尚未结算',type:'all',kind:'note',
      tone:'neutral',text:'尚未完成生产班次。点击轮班后，这里会记录实际产量与告警。'
    }];
  }
  const day=Math.max(1,world.day-1);
  const time='第 '+day+' 日';
  const logs:WorkshopProductionLogEntry[]=[];
  const output=(
    id:'water'|'fiber'|'cores',kind:'water'|'fiber'|'core',
    name:string,quantity:number
  )=>{
    if(quantity>0)logs.push({
      id:'output-'+id,time,type:'output',kind,tone:'good',
      text:'实际产出 '+name+' ×'+quantity
    });
  };
  output('water','water','水汽',report.water);
  output('fiber','fiber','孢子纤维',report.fiber);
  output('cores','core','晶核',report.cores);

  for(const [i,reason] of (report.blocked??[]).entries()){
    const match=/^(garden|kiln):(\d+):(water|fiber)$/.exec(reason);
    const index=match?Number(match[2]):NaN;
    const valid=match&&Number.isInteger(index)&&index>=0&&index<world.tiles.length&&
      ((match[1]==='garden'&&match[3]==='water')||
        (match[1]==='kiln'&&match[3]==='fiber'));
    const text=valid
      ?'上一班 '+String(index+1).padStart(2,'0')+' 号工位'+
        (match[1]==='garden'?'温室缺少相邻水汽泵的水汽':
          '熔炉缺少相邻温室的两份孢子纤维')
      :'上一班记录了一项供料异常，详情无法识别';
    logs.push({id:'blocked-'+i,time,type:'alert',kind:'warning',
      tone:'bad',text});
  }

  if(report.fulfilled)
    logs.push({id:'order-delivered',time,type:'all',kind:'contract',
      tone:'good',text:'上一班委托实际交付成功，下一份订单已开始计时'});
  else if(report.lost)
    logs.push({id:'order-missed',time,type:'alert',kind:'contract',
      tone:'bad',text:'上一班委托未能按期交付，损失已在结算时扣除'});

  if(report.milestone===3||report.milestone===5)
    logs.push({id:'milestone-'+report.milestone,time,type:'all',
      kind:'contract',tone:'good',
      text:'已完成第 '+report.milestone+' 单工坊委托，里程碑奖励已在结算时发放'});

  if(logs.length===0)
    logs.push({id:'no-output',time,type:'all',kind:'note',
      tone:'neutral',text:'上一班没有产出或交付。检查工匠派驻与设备邻接。'});
  return logs;
}
