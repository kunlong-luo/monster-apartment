import {describe,expect,it} from 'vitest';
import {
  assignWorker,moveMachine,newWorkshop,placeMachine,runShift
} from '../v2/src/workshop-engine';
import {workshopProductionLog} from '../src/lib/moonwork/workshop-production-log';

describe('settled workshop production ledger',()=>{
  it('never invents gains, activity or healthy machinery in a fresh save',()=>{
    const start=newWorkshop();
    const original=JSON.stringify(start);
    expect(workshopProductionLog(start)).toEqual([
      {id:'not-started',time:'尚未结算',type:'all',kind:'note',tone:'neutral',
        text:'尚未完成生产班次。点击轮班后，这里会记录实际产量与告警。'}
    ]);
    expect(JSON.stringify(start)).toBe(original);
    const idle=runShift(start);
    expect(workshopProductionLog(idle).map(x=>x.id)).toEqual(['no-output']);
    expect(workshopProductionLog(idle)[0].text)
      .toContain('上一班没有产出');
    expect(workshopProductionLog(idle).filter(x=>x.type==='output'))
      .toHaveLength(0);
  });

  it('lists each actual produced resource once, never recomputing the shift',()=>{
    let state=newWorkshop();
    state=moveMachine(state,7,6);
    state=placeMachine(state,7,'kiln');
    state=assignWorker(state,'brook',5);
    state=assignWorker(state,'fern',6);
    state=assignWorker(state,'cinder',7);
    const actual=runShift(state);
    const source=JSON.stringify(actual);
    expect(actual.last).toMatchObject({water:2,fiber:2,cores:2});
    const rows=workshopProductionLog(actual);
    expect(rows.filter(x=>x.type==='output').map(x=>x.text)).toEqual([
      '实际产出 水汽 ×2','实际产出 孢子纤维 ×2','实际产出 晶核 ×2'
    ]);
    expect(rows.every(x=>x.time==='第 1 日')).toBe(true);
    expect(rows.some(x=>x.type==='alert')).toBe(false);
    expect(JSON.stringify(actual)).toBe(source);
  });

  it('uses recorded upstream shortage and workstation index, not current tiles',()=>{
    let world=assignWorker(newWorkshop(),'fern',7);
    world=runShift(world);
    expect(world.last?.blocked).toEqual(['garden:7:water']);
    const moved=moveMachine(world,7,8);
    const rows=workshopProductionLog(moved);
    const warning=rows.find(x=>x.id==='blocked-0');
    expect(warning?.type).toBe('alert');
    expect(warning?.text).toContain('08 号工位温室缺少相邻水汽泵');
    expect(rows.filter(x=>x.type==='output')).toHaveLength(0);
    const corrupt={...moved,last:{...moved.last!,blocked:['unknown']}};
    expect(workshopProductionLog(corrupt).find(x=>x.id==='blocked-0')?.text)
      .toContain('详情无法识别');
  });

  it('describes actual order settlement, failures and earned milestones',()=>{
    const ready={...newWorkshop(),day:5,warehouse:{core:3},completed:2};
    const fulfilled=runShift(ready);
    const entries=workshopProductionLog(fulfilled);
    expect(entries.map(x=>x.id)).toContain('order-delivered');
    expect(entries.map(x=>x.id)).toContain('milestone-3');
    expect(entries.find(x=>x.id==='order-delivered')?.type).toBe('all');
    expect(entries.some(x=>x.text.includes('下一份订单已开始'))).toBe(true);
    const failed=runShift({...newWorkshop(),day:5});
    expect(workshopProductionLog(failed).find(x=>x.id==='order-missed')?.type)
      .toBe('alert');
    expect(workshopProductionLog(failed).some(x=>x.id==='order-delivered'))
      .toBe(false);
  });

  it('does not turn a second view render into a new production event',()=>{
    const world=runShift(newWorkshop());
    const first=workshopProductionLog(world);
    expect(workshopProductionLog(world)).toEqual(first);
    expect(world.day).toBe(2);
    expect(world.last?.cores).toBe(0);
  });
});
