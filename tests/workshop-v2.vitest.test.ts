import {describe,expect,it} from 'vitest';
import {
  newWorkshop,placeMachine,moveMachine,assignWorker,runShift,
  linked,validWorkshop,unassignWorker,acceptPatronCommission, PATRON_ADULT_AGE,
  machineLevel,machineUpgradeQuote,upgradeMachine,workshopRank,
  forecastPatronCommission, PATRON_EXTRA_CORES,
  importPatronCore, PATRON_IMPORT_PRICE,
} from '../v2/src/workshop-engine';

const connect=()=>{
  let state=newWorkshop();
  state=moveMachine(state,7,6); // adjacency is an actual design decision
  state=placeMachine(state,7,'kiln');
  state=assignWorker(state,'brook',5);
  state=assignWorker(state,'fern',6);
  state=assignWorker(state,'cinder',7);
  return state;
};

describe('V2 workshop: positioning and staffing are the gameplay',()=>{
  it('begins with disconnected production, a contract and finite cash',()=>{
    const s=newWorkshop();
    expect(s.version).toBe(2);
    expect(s.tiles).toHaveLength(15);
    expect(s.coins).toBe(100);
    expect(s.order).toEqual({due:5,cores:2,reward:70});
    expect(linked(5,7)).toBe(false);
    expect(linked(5,6)).toBe(true);
    expect(linked(4,5)).toBe(false); // row wrapping is not a connection
    expect(validWorkshop(s)).toBe(true);
  });
  it('allows player layout changes and staffing without cloning workers',()=>{
    const initial=newWorkshop();
    expect(moveMachine(initial,7,6).tiles[6]?.craft).toBe('garden');
    expect(placeMachine(initial,7,'kiln')).toBe(initial); // occupied
    expect(placeMachine(initial,-1,'kiln')).toBe(initial);
    let s=connect();
    expect(s.coins).toBe(62);
    expect(s.tiles[5]?.worker).toBe('brook');
    s=assignWorker(s,'brook',7);
    expect(s.tiles[5]?.worker).toBeNull();
    expect(s.tiles[7]?.worker).toBe('brook');
    s=unassignWorker(s,'brook');
    expect(s.tiles[7]?.worker).toBeNull();
    expect(validWorkshop(s)).toBe(true);
  });
  it('requires an actual adjacent resource chain to manufacture cores',()=>{
    let s=newWorkshop();
    s=assignWorker(s,'brook',5);
    s=assignWorker(s,'fern',7);
    s=placeMachine(s,8,'kiln');
    s=assignWorker(s,'cinder',8);
    const blocked=runShift(s);
    expect(blocked.last?.blocked).toContain('garden:7:water');
    expect(blocked.warehouse.core).toBe(0);
    const connected=runShift(connect());
    expect(connected.last).toMatchObject({water:2,fiber:2,cores:2});
    expect(connected.warehouse.core).toBe(2);
    expect(connected.last?.blocked).toEqual([]);
  });
  it('specialties matter, not happiness, generic clicks or a fixed daily gift',()=>{
    const correct=runShift(connect());
    const wrong=assignWorker(connect(),'brook',7);
    const suboptimal=runShift(wrong);
    expect(suboptimal.last?.cores).toBe(0);
    expect(correct.last?.cores).toBe(2);
  });
  it('pays contracted output by deadline; an unproductive shop loses money',()=>{
    let win=connect();
    let lose=newWorkshop();
    for(let i=0;i<5;i++){
      win=runShift(win);
      lose=runShift(lose);
    }
    expect(win.completed).toBe(1);
    expect(win.failed).toBe(0);
    expect(win.coins).toBe(132);
    expect(win.last?.fulfilled).toBe(true);
    expect(win.order.cores).toBe(3);
    expect(lose.failed).toBe(1);
    expect(lose.coins).toBe(85);
    expect(lose.last?.lost).toBe(true);
    expect(validWorkshop(win)).toBe(true);
    expect(validWorkshop(lose)).toBe(true);
  });
  it('introduces the clearly adult witch after a real first delivery',()=>{
    let s=connect();
    for(let i=0;i<5;i++)s=runShift(s);
    expect(PATRON_ADULT_AGE).toBe(28);
    expect(s.completed).toBe(1);
    expect(s.day).toBe(6);
    expect(PATRON_EXTRA_CORES).toBe(7);
    expect(s.patron).toEqual({status:'offered',due:8,cores:15,reward:135});
    expect(s.warehouse.core).toBe(8);
    expect(validWorkshop(s)).toBe(true);
    const accepted=acceptPatronCommission(s);
    expect(accepted.patron?.status).toBe('active');
    expect(accepted.coins).toBe(s.coins);
    expect(acceptPatronCommission(accepted)).toBe(accepted);
    expect(acceptPatronCommission(newWorkshop())).toEqual(newWorkshop());
  });
  it('makes guest commission a consequential investment versus penalty choice',()=>{
    let s=connect();
    for(let i=0;i<5;i++)s=runShift(s);
    const save=JSON.stringify(s);
    expect(forecastPatronCommission(s)).toEqual({
      available:14,required:15,deficit:1,completes:false,
      nextNormalOrder:'fulfilled',
    });
    expect(JSON.stringify(s)).toBe(save); // forecasting never edits inventory
    let risky=acceptPatronCommission(s);
    for(let i=0;i<3;i++)risky=runShift(risky);
    expect(risky.patron?.status).toBe('missed');
    expect(risky.coins).toBe(112);
    expect(risky.warehouse.core).toBe(14);
    // Buying real capacity costs 60 now, but can earn 135 later.
    s=upgradeMachine(s,7);
    expect(s.coins).toBe(72);
    expect(forecastPatronCommission(s)).toEqual({
      available:17,required:15,deficit:0,completes:true,
      nextNormalOrder:'fulfilled',
    });
    s=acceptPatronCommission(s);
    for(let i=0;i<3;i++)s=runShift(s);
    expect(s.day).toBe(9);
    expect(s.patron?.status).toBe('completed');
    expect(s.coins).toBe(207);
    expect(s.warehouse.core).toBe(2);
    expect(forecastPatronCommission(s)).toBeNull();
    expect(validWorkshop(s)).toBe(true);
    s=runShift(s);
    expect(s.completed).toBe(2);
    expect(s.failed).toBe(0);
    expect(s.warehouse.core).toBe(2);
    expect(s.coins).toBe(302);
  });
  it('offers paid inventory imports as a short-run alternative to durable upgrades',()=>{
    let s=connect();
    for(let i=0;i<5;i++)s=runShift(s);
    expect(PATRON_IMPORT_PRICE).toBe(42);
    expect(importPatronCore(newWorkshop())).toEqual(newWorkshop());
    const once=importPatronCore(s);
    expect(once.coins).toBe(90);
    expect(once.warehouse.core).toBe(9);
    expect(s.coins).toBe(132); // immutable state
    expect(s.warehouse.core).toBe(8);
    expect(forecastPatronCommission(once)).toEqual({
      available:15,required:15,deficit:0,completes:true,
      nextNormalOrder:'missed',
    });
    const twice=importPatronCore(once);
    expect(twice.coins).toBe(48);
    expect(twice.warehouse.core).toBe(10);
    expect(forecastPatronCommission(twice)).toEqual({
      available:16,required:15,deficit:0,completes:true,
      nextNormalOrder:'fulfilled',
    });
    let played=acceptPatronCommission(twice);
    for(let i=0;i<4;i++)played=runShift(played);
    expect(played.patron?.status).toBe('completed');
    expect(played.completed).toBe(2);
    expect(played.failed).toBe(0);
    expect(played.coins).toBe(278);
    expect(importPatronCore(played)).toBe(played);
    expect(validWorkshop(played)).toBe(true);
    let insufficient=once;
    insufficient={...insufficient,coins:41};
    expect(importPatronCore(insufficient)).toBe(insufficient);
  });
  it('does not award the guest on failure, and ignoring an offer has no penalty',()=>{
    let state=connect();
    for(let i=0;i<5;i++)state=runShift(state);
    let accepted=acceptPatronCommission(state);
    accepted=unassignWorker(accepted,'cinder');
    const coinsBefore=accepted.coins;
    for(let i=0;i<3;i++)accepted=runShift(accepted);
    expect(accepted.patron?.status).toBe('missed');
    expect(accepted.coins).toBe(coinsBefore-20);
    expect(acceptPatronCommission(accepted)).toBe(accepted);
    let ignored=state;
    for(let i=0;i<3;i++)ignored=runShift(ignored);
    expect(ignored.patron?.status).toBe('expired');
    expect(ignored.coins).toBe(state.coins);
    expect(validWorkshop(ignored)).toBe(true);
  });
  it('accepts old V2 saves with no guest but rejects fabricated contracts',()=>{
    const initial=newWorkshop();
    const legacy={...initial};
    delete legacy.patron;
    expect(validWorkshop(legacy)).toBe(true);
    expect(validWorkshop({...initial,patron:{
      status:'awarded',due:8,cores:13,reward:135,
    }})).toBe(false);
    expect(validWorkshop({...initial,patron:{
      status:'active',due:-1,cores:13,reward:135,
    }})).toBe(false);
    expect(validWorkshop({...initial,patron:{
      status:'active',due:8,cores:0,reward:135,
    }})).toBe(false);
  });
  it('unlocks Lv2 only after real delivery and buys improvements from earned coins',()=>{
    let s=connect();
    const quote=machineUpgradeQuote(s,7);
    expect(quote).toMatchObject({next:2,cost:60,requiresCompleted:1,canUpgrade:false});
    expect(upgradeMachine(s,7)).toBe(s);
    for(let i=0;i<5;i++)s=runShift(s);
    expect(s.completed).toBe(1);
    expect(machineUpgradeQuote(s,7)?.canUpgrade).toBe(true);
    const purchased=upgradeMachine(s,7);
    expect(purchased.coins).toBe(s.coins-60);
    expect(machineLevel(purchased.tiles[7]!)).toBe(2);
    expect(purchased.tiles[7]?.worker).toBe('cinder');
    expect(purchased.tiles[7]?.stored).toBe(0);
    expect(upgradeMachine(purchased,7)).toBe(purchased); // LV3 locked
    const compared=runShift(s);
    const improved=runShift(purchased);
    expect(compared.last?.cores).toBe(2);
    expect(improved.last?.cores).toBe(3);
    expect(validWorkshop(improved)).toBe(true);
    expect(machineLevel(improved.tiles[7]!)).toBe(2);
  });
  it('physical machine upgrade follows equipment when players move it',()=>{
    let s=connect();
    for(let i=0;i<5;i++)s=runShift(s);
    s=upgradeMachine(s,7);
    s=moveMachine(s,7,8);
    expect(s.tiles[7]).toBeNull();
    expect(s.tiles[8]?.level).toBe(2);
    expect(s.tiles[8]?.worker).toBe('cinder');
    expect(machineUpgradeQuote(s,7)).toBeNull();
    expect(upgradeMachine(s,7)).toBe(s);
  });
  it('advances a finite five-order campaign and unlocks level three',()=>{
    let s=connect();
    for(let i=0;i<13;i++)s=runShift(s);
    expect(s.completed).toBe(3);
    expect(s.last?.milestone).toBe(3);
    expect(s.coins).toBe(417);
    expect(workshopRank(s.completed)).toEqual({level:2,zh:'星匠工坊',nextGoal:5});
    s=upgradeMachine(s,7);
    const quote=machineUpgradeQuote(s,7);
    expect(quote).toMatchObject({next:3,cost:124,requiresCompleted:3,canUpgrade:true});
    const levelThree=upgradeMachine(s,7);
    expect(levelThree.tiles[7]?.level).toBe(3);
    expect(machineUpgradeQuote(levelThree,7)).toBeNull();
    const result=runShift(levelThree);
    expect(result.last?.cores).toBe(4);
    expect(upgradeMachine(result,7)).toBe(result);
    // The five-order goal is finite; its reputation and reward do not
    // repeat during subsequent free-play deliveries.
    let campaign=connect();
    for(let i=0;i<21;i++)campaign=runShift(campaign);
    expect(campaign.completed).toBe(5);
    expect(campaign.last?.milestone).toBe(5);
    expect(campaign.coins).toBe(892);
    expect(workshopRank(campaign.completed)).toEqual({
      level:3,zh:'月光大师工坊',nextGoal:null,
    });
    for(let i=0;i<4;i++)campaign=runShift(campaign);
    expect(campaign.completed).toBe(6);
    expect(campaign.last?.milestone).toBeUndefined();
    expect(validWorkshop(campaign)).toBe(true);
  });
  it('supports old machines with no level, but rejects forged upgrade data',()=>{
    const initial=newWorkshop();
    expect(machineLevel(initial.tiles[5]!)).toBe(1);
    expect(validWorkshop(initial)).toBe(true);
    const upgraded={...initial,tiles:initial.tiles.map((x,i)=>
      i===5?{...x!,level:3}:x)};
    expect(validWorkshop(upgraded)).toBe(true);
    expect(validWorkshop({...initial,tiles:initial.tiles.map((x,i)=>
      i===5?{...x!,level:4}:x)})).toBe(false);
    expect(validWorkshop({...initial,tiles:initial.tiles.map((x,i)=>
      i===5?{...x!,level:1.2}:x)})).toBe(false);
  });
  it('rejects invalid V2 progress without conflating legacy V1 saves',()=>{
    const state=newWorkshop();
    expect(validWorkshop(state)).toBe(true);
    expect(validWorkshop({...state,version:1})).toBe(false);
    expect(validWorkshop({...state,tiles:[]})).toBe(false);
    expect(validWorkshop({...state,tiles:[...state.tiles,{craft:'bad',worker:null,stored:0}]})).toBe(false);
    expect(validWorkshop({...state,tiles:state.tiles.map((tile,i)=>
      i===5?{...tile!,stored:-1}:tile)})).toBe(false);
    expect(validWorkshop({...state,day:-1})).toBe(false);
    expect(validWorkshop({...state,warehouse:{core:-1}})).toBe(false);
  });
});
