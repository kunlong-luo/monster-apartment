import {describe,expect,it} from 'vitest';
import {
  assignWorker,moveMachine,newWorkshop,placeMachine,runShift
} from '../v2/src/workshop-engine';
import {workshopProductionLog} from '../src/lib/moonwork/workshop-production-log';
import {
  startWorkshopAuto,simulateWorkshopAutoUntil,pauseWorkshopAuto
} from '../v2/src/workshop-auto-production';

describe('settled workshop production ledger',()=>{
  it('never invents gains, activity or healthy machinery in a fresh save',()=>{
    const start=newWorkshop();
    const original=JSON.stringify(start);
    expect(workshopProductionLog(start)).toEqual([
      {id:'not-started',time:'手动轮班',type:'all',kind:'note',tone:'neutral',
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

describe('R10.9 actual automatic production receipts in the same read-only ledger',()=>{
  function staffedLine(){
    let s=newWorkshop();
    s=moveMachine(s,7,6);
    s=placeMachine(s,7,'kiln');
    s=assignWorker(s,'brook',5);
    s=assignWorker(s,'fern',6);
    s=assignWorker(s,'cinder',7);
    return s;
  }
  it('shows enabled auto without claiming any output before the first cycle',()=>{
    const started=startWorkshopAuto(staffedLine(),1000);
    const snapshot=JSON.stringify(started);
    const records=workshopProductionLog(started);
    expect(records.map(e=>e.id)).toEqual(['auto-waiting','not-started']);
    expect(records.some(e=>e.type==='output')).toBe(false);
    expect(records[0].text).toContain('尚无到账产出');
    expect(JSON.stringify(started)).toBe(snapshot);
  });
  it('records real persisted automatic totals without inventing a manual shift',()=>{
    const started=startWorkshopAuto(staffedLine(),1000);
    const produced=simulateWorkshopAutoUntil(started,61000);
    expect(produced.auto?.produced).toEqual({water:4,fiber:2,cores:2});
    expect(produced.last).toBeNull();
    expect(produced.day).toBe(1);
    const saved=JSON.stringify(produced);
    const ledger=workshopProductionLog(produced);
    expect(ledger.filter(e=>e.type==='output').map(e=>e.text)).toEqual([
      '自动实际累计 水汽 ×4（历史产出，非当前库存）',
      '自动实际累计 孢子纤维 ×2（历史产出，非当前库存）',
      '自动实际累计 晶核 ×2（历史产出，非当前库存）'
    ]);
    expect(ledger.filter(e=>e.type==='output').every(e=>e.time==='自动累计')).toBe(true);
    expect(ledger.some(e=>e.id==='not-started')).toBe(true);
    expect(ledger.some(e=>e.id==='output-cores')).toBe(false);
    expect(JSON.stringify(produced)).toBe(saved);
    expect(workshopProductionLog(produced)).toEqual(ledger);
  });
  it('keeps automatic totals after pause and separates them from a later manual shift',()=>{
    const started=startWorkshopAuto(staffedLine(),1000);
    const produced=simulateWorkshopAutoUntil(started,61000);
    const paused=pauseWorkshopAuto(produced);
    const receipt=workshopProductionLog(paused);
    expect(receipt.some(e=>e.id==='auto-cores')).toBe(true);
    expect(receipt.some(e=>e.id==='auto-waiting')).toBe(false);
    const manuallySettled=runShift(paused);
    const actual=workshopProductionLog(manuallySettled);
    expect(actual.find(e=>e.id==='auto-cores')?.time).toBe('自动累计');
    expect(actual.find(e=>e.id==='output-cores')?.time).toBe('第 1 日');
    expect(actual.some(e=>e.id==='not-started')).toBe(false);
    expect(manuallySettled.auto?.produced).toEqual({water:4,fiber:2,cores:2});
  });
  it('reports a genuine zero-output manual shift even if old automatic totals exist',()=>{
    const seeded={
      ...runShift(newWorkshop()),
      auto:{version:1 as const,enabled:false,lastSimulatedAt:1000,
        layout:'',nextDue:Array(15).fill(0) as number[],
        produced:{water:1,fiber:0,cores:0}}
    };
    const records=workshopProductionLog(seeded);
    expect(records.map(r=>r.id)).toEqual(['auto-water','no-output']);
    expect(records.filter(r=>r.time==='第 1 日').map(r=>r.id)).toEqual(['no-output']);
    expect(records[0].text).toContain('非当前库存');
  });
});
