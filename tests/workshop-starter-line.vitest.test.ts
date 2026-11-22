import {describe,expect,it} from 'vitest';
import {
  newWorkshop,canPrepareStarterLine,prepareStarterLine,moveMachine,
  placeMachine,assignWorker,runShift,forecastNextShift,validWorkshop,MACHINES,
} from '../v2/src/workshop-engine';
import {startWorkshopAuto} from '../v2/src/workshop-auto-production';

describe('first order: safe, one-tap starter production line',()=>{
  it('builds a working chain and staffs real workers with exactly one kiln charge',()=>{
    const original=newWorkshop();
    const raw=JSON.stringify(original);
    expect(canPrepareStarterLine(original)).toBe(true);
    const next=prepareStarterLine(original);
    expect(JSON.stringify(original)).toBe(raw);
    expect(next).not.toBe(original);
    expect(next.coins).toBe(100-MACHINES.kiln.cost); // one kiln, no convenience fee
    expect(next.tiles[5]).toMatchObject({craft:'well',worker:'brook',stored:0});
    expect(next.tiles[6]).toMatchObject({craft:'garden',worker:'fern',stored:0});
    expect(next.tiles[7]).toMatchObject({craft:'kiln',worker:'cinder',stored:0});
    expect(next.tiles.filter(Boolean)).toHaveLength(3);
    expect(next.day).toBe(1);
    expect(next.last).toBeNull();
    expect(next.auto).toBeUndefined();
    expect(next.order).toEqual(original.order);
    expect(next.warehouse).toEqual(original.warehouse);
    expect(validWorkshop(next)).toBe(true);
    expect(forecastNextShift(next).cores).toBe(2);
    expect(runShift(next).warehouse.core).toBe(2);
  });

  it('rejects repeat clicks without spending twice or starting timers',()=>{
    const completed=prepareStarterLine(newWorkshop());
    expect(canPrepareStarterLine(completed)).toBe(false);
    expect(prepareStarterLine(completed)).toBe(completed);
    expect(completed.coins).toBe(100-MACHINES.kiln.cost);
  });

  it('refuses changed layouts, staffed equipment, low funds, progressed days and saved auto clocks',()=>{
    const initial=newWorkshop();
    const alternatives=[
      moveMachine(initial,7,6),
      placeMachine(initial,3,'well'),
      assignWorker(initial,'brook',5),
      {...initial,coins:59},
      {...initial,day:2},
      {...initial,last:{water:0,fiber:0,cores:0,blocked:[],fulfilled:false,lost:false}},
      {...initial,warehouse:{core:1}},
      {...initial,order:{...initial.order,due:6}},
      startWorkshopAuto(initial,1000),
    ];
    for(const modified of alternatives){
      expect(canPrepareStarterLine(modified)).toBe(false);
      expect(prepareStarterLine(modified)).toBe(modified);
    }
  });

  it('does not change economics, order deadline, or the manual first-order path',()=>{
    let manual=newWorkshop();
    manual=moveMachine(manual,7,6);
    manual=placeMachine(manual,7,'kiln');
    manual=assignWorker(manual,'brook',5);
    manual=assignWorker(manual,'fern',6);
    manual=assignWorker(manual,'cinder',7);
    expect(prepareStarterLine(newWorkshop())).toEqual(manual);
  });
});
