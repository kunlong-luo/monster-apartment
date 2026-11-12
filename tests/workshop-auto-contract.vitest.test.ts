import {describe,expect,it} from 'vitest';
import {
  newWorkshop,moveMachine,placeMachine,assignWorker,runShift,
  validWorkshop,advanceSafeAutoContractDay
} from '../v2/src/workshop-engine';
import {
  AUTO_CONTRACT_DAY_MS,MAX_AUTO_CATCHUP_DAYS,MAX_AUTO_CATCHUP_MS,
  startWorkshopAuto,toggleWorkshopAutoDelivery,pauseWorkshopAuto,
  simulateWorkshopAutoUntil
} from '../v2/src/workshop-auto-production';
import {
  WORKSHOP_SAVE_KEY,parseWorkshopSnapshot,transactWorkshopSave
} from '../v2/src/workshop-save-transaction';

function line(){
  let s=newWorkshop();
  s=moveMachine(s,7,6);
  s=placeMachine(s,7,'kiln');
  s=assignWorker(s,'brook',5);
  s=assignWorker(s,'fern',6);
  s=assignWorker(s,'cinder',7);
  return s;
}

describe('R11 safe opt-in automatic contract calendar',()=>{
  it('legacy auto production never advances contract days or silently opts in',()=>{
    const old=startWorkshopAuto(line(),1000);
    const serialized=JSON.parse(JSON.stringify(old));
    delete serialized.auto.autoDeliver;
    delete serialized.auto.nextContractAt;
    expect(validWorkshop(serialized)).toBe(true);
    expect(validWorkshop({...serialized,auto:{...serialized.auto,
      autoDeliver:'yes'}})).toBe(false);
    expect(validWorkshop({...serialized,auto:{...serialized.auto,
      nextContractAt:-1}})).toBe(false);
    const oneHour=simulateWorkshopAutoUntil(serialized,1000+60*60*1000);
    expect(oneHour.day).toBe(1);
    expect(oneHour.completed).toBe(0);
    expect(oneHour.coins).toBe(serialized.coins);
    expect(oneHour.order).toEqual(serialized.order);
  });

  it('explicit enabling schedules a future tick, never changes resources at click',()=>{
    const start=startWorkshopAuto(line(),1000);
    const snap=JSON.stringify(start);
    const on=toggleWorkshopAutoDelivery(start,1000);
    expect(on.auto?.autoDeliver).toBe(true);
    expect(on.auto?.nextContractAt).toBe(1000+AUTO_CONTRACT_DAY_MS);
    expect(on.day).toBe(1);
    expect(on.coins).toBe(start.coins);
    expect(on.warehouse).toEqual(start.warehouse);
    expect(JSON.stringify(start)).toBe(snap);
    const off=toggleWorkshopAutoDelivery(on,1000);
    expect(off.auto?.autoDeliver).toBe(false);
    expect(off.auto?.nextContractAt).toBe(0);
    expect(toggleWorkshopAutoDelivery(newWorkshop(),1000)).toEqual(newWorkshop());
  });

  it('advances days, settles due stock once, retains real factory receipts',()=>{
    let s=toggleWorkshopAutoDelivery(startWorkshopAuto(line(),1000),1000);
    for(let i=1;i<=5;i++){
      s=simulateWorkshopAutoUntil(s,1000+i*AUTO_CONTRACT_DAY_MS);
      expect(s.day).toBe(1+i);
      expect(s.failed).toBe(0);
      expect(validWorkshop(s)).toBe(true);
      if(i<5)expect(s.completed).toBe(0);
    }
    expect(s.completed).toBe(1);
    expect(s.order.due).toBe(9);
    expect(s.coins).toBe(100-38+70);
    expect(s.warehouse.core).toBeGreaterThan(0);
    expect(s.auto?.produced.cores).toBeGreaterThan(0);
    // No double factory cycle was projected for the calendar, and no manual
    // shift was falsely recorded by the automatic contract path.
    expect(s.last).toBeNull();
    expect(simulateWorkshopAutoUntil(s,1000+5*AUTO_CONTRACT_DAY_MS)).toBe(s);
    expect(s.patron?.status).toBe('offered');
  });

  it('waits at due date if insufficient rather than charging an offline loss',()=>{
    let shortage={...line(),day:5,warehouse:{core:0},
      order:{due:5,cores:80,reward:70}};
    let s=toggleWorkshopAutoDelivery(startWorkshopAuto(shortage,1000),1000);
    s=simulateWorkshopAutoUntil(s,1000+AUTO_CONTRACT_DAY_MS);
    expect(s.day).toBe(5);
    expect(s.failed).toBe(0);
    expect(s.coins).toBe(shortage.coins);
    expect(s.order).toEqual(shortage.order);
    expect(s.auto?.nextContractAt).toBe(1000+2*AUTO_CONTRACT_DAY_MS);
    const filled={...s,warehouse:{core:80}};
    const delivered=simulateWorkshopAutoUntil(filled,1000+2*AUTO_CONTRACT_DAY_MS);
    expect(delivered.day).toBe(6);
    expect(delivered.completed).toBe(1);
    expect(delivered.failed).toBe(0);
    expect(delivered.order.due).toBe(9);
    expect(delivered.coins).toBe(shortage.coins+70);
  });

  it('never charges a patron loss or double-counts shared stock at same deadline',()=>{
    const world={...line(),day:5,
      warehouse:{core:6},
      patron:{status:'active' as const,due:5,cores:5,reward:135}};
    const before=JSON.stringify(world);
    expect(advanceSafeAutoContractDay(world)).toBe(world);
    expect(JSON.stringify(world)).toBe(before);
    const ready={...world,warehouse:{core:7}};
    const auto=advanceSafeAutoContractDay(ready);
    expect(auto.day).toBe(6);
    expect(auto.warehouse.core).toBe(0);
    expect(auto.completed).toBe(1);
    expect(auto.failed).toBe(0);
    expect(auto.coins).toBe(world.coins+70+135);
    expect(auto.patron?.status).toBe('completed');
    expect(auto.last).toBeNull();
    expect(auto.tiles).toBe(ready.tiles);
    // Existing manual settlement with physical production remains unchanged.
    const manually=runShift(world);
    expect(manually.day).toBe(6);
  });

  it('limits a long reconnect to four calendar days and rebases after pause',()=>{
    const t0=1000;
    const on=toggleWorkshopAutoDelivery(startWorkshopAuto(line(),t0),t0);
    const end=t0+MAX_AUTO_CATCHUP_MS+1000000;
    const later=simulateWorkshopAutoUntil(on,end);
    expect(later.day).toBeLessThanOrEqual(1+MAX_AUTO_CATCHUP_DAYS);
    expect(later.auto?.nextContractAt).toBe(end+AUTO_CONTRACT_DAY_MS);
    expect(validWorkshop(later)).toBe(true);
    expect(simulateWorkshopAutoUntil(later,end)).toBe(later);
    const paused=pauseWorkshopAuto(later);
    expect(paused.auto?.autoDeliver).toBe(true);
    expect(paused.auto?.enabled).toBe(false);
    expect(simulateWorkshopAutoUntil(paused,end+100000000)).toBe(paused);
    const resumed=startWorkshopAuto(paused,end+100000000);
    expect(resumed.auto?.nextContractAt).toBe(end+100000000+AUTO_CONTRACT_DAY_MS);
  });

  it('serializes competing auto contract ticks under the existing Web Lock',async()=>{
    let s=toggleWorkshopAutoDelivery(startWorkshopAuto({
      ...line(),day:5,warehouse:{core:6}},1000),1000);
    // Prevent independent physical cycles: all machine clocks are in future;
    // only the calendar event is due at this instant.
    s={...s,auto:{...s.auto!,nextDue:s.auto!.nextDue.map(d=>d?900000:0)}};
    const values=new Map([[WORKSHOP_SAVE_KEY,JSON.stringify(s)]]);
    const store={
      getItem:(key:string)=>values.get(key)??null,
      setItem:(key:string,value:string)=>{values.set(key,value)}
    };
    let sequence=Promise.resolve<unknown>(undefined);
    const lock={request:(_name:string,_options:unknown,cb:(lock:object)=>unknown)=>{
      const next=sequence.then(()=>cb({}));
      sequence=next.then(()=>undefined,()=>undefined);
      return next;
    }} as unknown as LockManager;
    const tick=(world:typeof s)=>simulateWorkshopAutoUntil(world,241000);
    const results=await Promise.all([
      transactWorkshopSave(store,lock,tick),
      transactWorkshopSave(store,lock,tick)
    ]);
    expect(results).toEqual(['applied','unchanged']);
    const actual=parseWorkshopSnapshot(store.getItem(WORKSHOP_SAVE_KEY))!;
    expect(actual.day).toBe(6);
    expect(actual.completed).toBe(1);
    expect(actual.coins).toBe(s.coins+70);
    expect(actual.warehouse.core).toBe(4);
  });
});


describe('R11.2 independent contract calendar during workshop rearrangement',()=>{
  it('preserves the already-earned deadline across repeated layout changes',()=>{
    const initialTime=1000;
    const original=toggleWorkshopAutoDelivery(
      startWorkshopAuto(line(),initialTime),initialTime);
    const deadline=initialTime+AUTO_CONTRACT_DAY_MS;
    expect(original.auto?.nextContractAt).toBe(deadline);

    const moved=moveMachine(original,7,8);
    const midTime=initialTime+2*60*1000;
    const mid=simulateWorkshopAutoUntil(moved,midTime);
    expect(mid.auto?.layout).not.toBe(original.auto?.layout);
    expect(mid.auto?.nextDue[8]).toBe(midTime+60*1000);
    expect(mid.auto?.nextContractAt).toBe(deadline);
    expect(mid.auto?.produced).toEqual({water:0,fiber:0,cores:0});
    expect(mid.day).toBe(1);

    const restored=moveMachine(mid,8,7);
    const second=simulateWorkshopAutoUntil(restored,deadline-30000);
    expect(second.auto?.nextContractAt).toBe(deadline);
    expect(second.day).toBe(1);
    expect(second.completed).toBe(0);
    expect(second.coins).toBe(original.coins);

    const settled=simulateWorkshopAutoUntil(second,deadline);
    expect(settled.day).toBe(2);
    expect(settled.auto?.nextContractAt).toBe(deadline+AUTO_CONTRACT_DAY_MS);
    expect(settled.completed).toBe(0);
    expect(settled.last).toBeNull();
    expect(validWorkshop(settled)).toBe(true);
    expect(simulateWorkshopAutoUntil(settled,deadline)).toBe(settled);
  });

  it('settles a due calendar tick even when equipment is rearranged at that exact instant',()=>{
    const t0=1000;
    const auto=toggleWorkshopAutoDelivery(startWorkshopAuto(line(),t0),t0);
    const deadline=t0+AUTO_CONTRACT_DAY_MS;
    const moved=moveMachine(auto,7,8);
    const result=simulateWorkshopAutoUntil(moved,deadline);
    expect(result.day).toBe(2);
    expect(result.auto?.nextContractAt).toBe(deadline+AUTO_CONTRACT_DAY_MS);
    // Moving an already-running machine is not a way to mint the cycles it
    // would have completed during the layout transition.
    expect(result.auto?.produced).toEqual({water:0,fiber:0,cores:0});
    expect(result.warehouse.core).toBe(0);
    expect(result.coins).toBe(auto.coins);
    expect(result.auto?.nextDue[8]).toBe(deadline+60000);
    expect(simulateWorkshopAutoUntil(result,deadline)).toBe(result);
  });

  it('still caps long offline calendar catch-up after a layout change',()=>{
    const t0=1000;
    const auto=toggleWorkshopAutoDelivery(startWorkshopAuto(line(),t0),t0);
    const changed=moveMachine(auto,7,8);
    const now=t0+MAX_AUTO_CATCHUP_MS+1000000;
    const restored=simulateWorkshopAutoUntil(changed,now);
    expect(restored.day).toBe(1+MAX_AUTO_CATCHUP_DAYS);
    expect(restored.auto?.nextContractAt).toBe(now+AUTO_CONTRACT_DAY_MS);
    expect(restored.auto?.produced).toEqual({water:0,fiber:0,cores:0});
    expect(restored.auto?.nextDue[8]).toBe(now+60000);
    expect(validWorkshop(restored)).toBe(true);
  });

  it('never opts a legacy automatic-production save into contract calendar',()=>{
    const old=startWorkshopAuto(line(),1000);
    expect(old.auto?.autoDeliver).toBe(false);
    const moved=moveMachine(old,7,8);
    const now=1000+AUTO_CONTRACT_DAY_MS+3000;
    const replay=simulateWorkshopAutoUntil(moved,now);
    expect(replay.day).toBe(1);
    expect(replay.completed).toBe(0);
    expect(replay.auto?.nextContractAt).toBe(0);
    expect(validWorkshop(replay)).toBe(true);
  });
});
