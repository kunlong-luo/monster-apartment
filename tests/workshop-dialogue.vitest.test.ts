import {describe,expect,it} from 'vitest';
import {
  assignWorker,moveMachine,newWorkshop,placeMachine,runShift
} from '../v2/src/workshop-engine';
import {workshopDialogue} from '../src/lib/moonwork/workshop-dialogue';

describe('Moonveil comments truthfully on the actual workshop',()=>{
  it('never claims production or a kiln on the empty starter layout',()=>{
    const start=newWorkshop();
    const before=JSON.stringify(start);
    const lines=workshopDialogue(start);
    expect(lines.map(line=>line.id)).toEqual([
      'welcome','missing-kiln','worker-invitation','contract-countdown'
    ]);
    expect(lines.find(line=>line.id==='missing-kiln')?.text)
      .toContain('还没有熔炉');
    expect(lines.find(line=>line.id==='contract-countdown')?.text)
      .toContain('仓库现有 0 枚');
    expect(JSON.stringify(start)).toBe(before);
  });

  it('uses one true 2/2/2 production projection for connected skilled workers',()=>{
    let current=newWorkshop();
    current=moveMachine(current,7,6);
    current=placeMachine(current,7,'kiln');
    current=assignWorker(current,'brook',5);
    current=assignWorker(current,'fern',6);
    current=assignWorker(current,'cinder',7);
    const snapshot=JSON.stringify(current);
    const lines=workshopDialogue(current);
    expect(lines.find(line=>line.id==='connected-production')?.text)
      .toContain('本班预计入仓晶核 2 枚');
    expect(lines.find(line=>line.id==='worker-observation')?.text)
      .toContain('泉泡');
    expect(lines.some(line=>line.id==='supply-blocked')).toBe(false);
    expect(JSON.stringify(current)).toBe(snapshot);
    // Story must never settle twice or write a save.
    expect(JSON.stringify(workshopDialogue(current))).toBe(JSON.stringify(lines));
  });

  it('reports the exact missing upstream material and worker specialty',()=>{
    let current=assignWorker(newWorkshop(),'fern',7);
    let lines=workshopDialogue(current);
    expect(lines.find(line=>line.id==='supply-blocked')?.text)
      .toContain('缺少相邻设备提供的水汽');
    expect(lines.find(line=>line.id==='worker-observation')?.text)
      .toContain('青枝');

    current=assignWorker(newWorkshop(),'brook',7);
    lines=workshopDialogue(current);
    expect(lines.find(line=>line.id==='worker-specialty')?.text)
      .toContain('不是她最擅长的设备');
  });

  it('comments on the actual order deadline, success and optional patron',()=>{
    const start={...newWorkshop(),day:5};
    const due=workshopDialogue(start);
    expect(due.find(line=>line.id==='contract-due')?.text)
      .toContain('就在本班结算');
    expect(due.find(line=>line.id==='contract-due')?.text)
      .toContain('仓库现有 0 枚');

    const completed=runShift({...newWorkshop(),day:5,
      warehouse:{core:4}});
    const delivered=workshopDialogue(completed);
    expect(delivered[0].id).toBe('delivered');
    expect(delivered.some(line=>line.id==='patron-offer')).toBe(true);
    expect(delivered.find(line=>line.id==='contract-countdown')?.text)
      .toContain('仓库现有 2 枚');

    const milestone={...completed,completed:3};
    expect(workshopDialogue(milestone)[0].id).toBe('milestone-third');
    expect(workshopDialogue({...completed,completed:5})[0].id)
      .toBe('milestone-master');
  });
});
