import {describe,expect,it} from 'vitest';
import {
  newWorkshop,moveMachine,placeMachine,assignWorker,
  workshopHint,workshopNextStep,projectMachineProduction
} from '../v2/src/workshop-engine';
import {
  startWorkshopAuto,pauseWorkshopAuto,simulateWorkshopAutoUntil,
  AUTO_STORAGE_CAPS
} from '../v2/src/workshop-auto-production';
import {workshopDialogue} from '../src/lib/moonwork/workshop-dialogue';

const connected=()=>{
  let state=newWorkshop();
  state=moveMachine(state,7,6);
  state=placeMachine(state,7,'kiln');
  state=assignWorker(state,'brook',5);
  state=assignWorker(state,'fern',6);
  state=assignWorker(state,'cinder',7);
  return state;
};

describe('R10.10 truthful auto-play guidance and dialogue',()=>{
  it('does not tell a running auto line to click a disabled manual-shift button',()=>{
    const running=startWorkshopAuto(connected(),1000);
    const snapshot=JSON.stringify(running);
    expect(workshopHint(running)).toEqual({action:'wait',source:null,target:null});
    expect(workshopNextStep(running)).toContain('自动产线运行中');
    expect(workshopNextStep(running)).toContain('委托日需暂停后手动轮班推进');
    expect(workshopNextStep(running)).not.toContain('点击「手动轮班」');
    const waiting=workshopDialogue(running);
    expect(waiting.find(line=>line.id==='auto-waiting')?.text)
      .toContain('没有到账记录');
    expect(waiting.find(line=>line.id==='auto-running')).toBeUndefined();
    expect(JSON.stringify(running)).toBe(snapshot);
  });

  it('reports genuinely settled auto totals with the correct CURRENT warehouse separately',()=>{
    const waiting=startWorkshopAuto(connected(),1000);
    const running=simulateWorkshopAutoUntil(waiting,61000);
    expect(running.auto?.produced).toEqual({water:4,fiber:2,cores:2});
    expect(running.warehouse.core).toBe(2);
    expect(running.last).toBeNull();
    expect(running.day).toBe(1);
    const saved=JSON.stringify(running);
    const message=workshopDialogue(running).find(line=>line.id==='auto-running')?.text;
    expect(message).toContain('自动累计水汽 4、孢子 2、晶核 2');
    expect(message).toContain('现有晶核 2');
    expect(message).toContain('自动节拍不推进委托日');
    expect(workshopNextStep(running)).toContain('晶核已备齐');
    expect(workshopHint(running).action).toBe('wait');
    expect(JSON.stringify(running)).toBe(saved);
    expect(workshopDialogue(running).find(line=>line.id==='auto-running')?.text)
      .toBe(message);
  });

  it('reacts correctly after pause without pretending cumulative output is inventory',()=>{
    const running=simulateWorkshopAutoUntil(startWorkshopAuto(connected(),1000),61000);
    const paused=pauseWorkshopAuto(running);
    expect(workshopHint(paused).action).toBe('shift');
    expect(workshopNextStep(paused)).toContain('点击「手动轮班」');
    expect(workshopNextStep(paused)).not.toContain('自动交付');
    const pausedLine=workshopDialogue(paused).find(line=>line.id==='auto-paused')?.text;
    expect(pausedLine).toContain('此前累计水汽 4、孢子 2、晶核 2');
    expect(pausedLine).toContain('不是当前库存');
    expect(workshopDialogue(paused).some(line=>line.id==='auto-running')).toBe(false);
  });

  it('still prioritizes actionable machinery construction while auto is enabled',()=>{
    const starter=startWorkshopAuto(newWorkshop(),1000);
    expect(starter.auto?.enabled).toBe(true);
    expect(workshopHint(starter).action).toBe('move');
    expect(workshopNextStep(starter)).toContain('温室移动到紧邻水汽泵');
  });

  it('keeps strict high-level auto storage caps using AFTER-cycle projected stock',()=>{
    let fullWell=connected();
    const well=fullWell.tiles[5]!;
    fullWell={...fullWell,tiles:fullWell.tiles.map((m,i)=>
      i===5?{...well,stored:AUTO_STORAGE_CAPS.water-1,level:3 as const}:m)};
    const running=startWorkshopAuto(fullWell,1000);
    // Expert Lv.3 produces 4 at once; 35+4 exceeds 36, so the
    // ALL-OR-NOTHING device cycle must produce nothing and advance clock.
    const after=simulateWorkshopAutoUntil(running,31000);
    expect(after.tiles[5]?.stored).toBe(AUTO_STORAGE_CAPS.water-1);
    expect(after.auto?.produced.water).toBe(0);
    expect(after.auto?.nextDue[5]).toBe(61000);
    // Isolate this actor just like the realtime engine: other workers do
    // not consume its projected water inside the same device cycle.
    const projected={...fullWell,tiles:fullWell.tiles.map((tile,i)=>
      tile&&i!==5?{...tile,worker:null}:tile)};
    expect(projectMachineProduction(projected).tiles[5]?.stored)
      .toBe(AUTO_STORAGE_CAPS.water+3);
    const repeat=simulateWorkshopAutoUntil(after,31000);
    expect(repeat).toBe(after);

    let fullGarden=connected();
    const garden=fullGarden.tiles[6]!;
    fullGarden={...fullGarden,tiles:fullGarden.tiles.map((m,i)=>
      i===6?{...garden,stored:AUTO_STORAGE_CAPS.fiber-1,level:3 as const}:m)};
    const gardenAfter=simulateWorkshopAutoUntil(startWorkshopAuto(fullGarden,1000),46000);
    expect(gardenAfter.tiles[6]?.stored).toBe(AUTO_STORAGE_CAPS.fiber-1);
    expect(gardenAfter.auto?.produced.fiber).toBe(0);
    expect(gardenAfter.tiles[5]?.stored).toBe(2);
    expect(gardenAfter.auto?.produced.water).toBe(2);
  });
});
