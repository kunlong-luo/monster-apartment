import {describe,expect,it} from 'vitest';
import {
  newWorkshop,placeMachine,moveMachine,assignWorker,runShift,forecastNextShift,
  linked,validWorkshop,unassignWorker,acceptPatronCommission, PATRON_ADULT_AGE,
  machineLevel,machineUpgradeQuote,upgradeMachine,workshopRank,
  machineSalvageRefund,salvageMachine,workshopNextStep,workshopHint,
  forecastPatronCommission, PATRON_EXTRA_CORES,
  importPatronCore, PATRON_IMPORT_PRICE,
  acceptPremiumOrder,forecastOrderChoice,PREMIUM_EXTRA_CORES,
  PREMIUM_EXTRA_REWARD,PREMIUM_ORDER_PENALTY,
  buyTownSupply,townMarketAvailable,TOWN_MARKET,
  deliverResidentRequest,residentForDay,residentRequestAvailable,
  residentRequestStock,TOWN_RESIDENTS,
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
  it('previews the next shift without consuming a day or changing the save',()=>{
    const empty=newWorkshop();
    expect(forecastNextShift(empty)).toMatchObject({
      dayAfter:2,water:0,fiber:0,cores:0,warehouseAfter:0,
      coinsAfter:100,willDeliver:false,willMiss:false,
    });
    expect(empty).toEqual(newWorkshop());
    const connected=connect();
    const original=JSON.stringify(connected);
    expect(forecastNextShift(connected)).toMatchObject({
      dayAfter:2,water:2,fiber:2,cores:2,warehouseAfter:2,
      coinsAfter:62,willDeliver:false,reward:0,
    });
    expect(JSON.stringify(connected)).toBe(original);
    let due=connected;
    for(let i=0;i<4;i++)due=runShift(due);
    const delivery=forecastNextShift(due);
    expect(delivery).toMatchObject({
      dayAfter:6,willDeliver:true,willMiss:false,reward:70,coinsAfter:132,
      warehouseAfter:8,
    });
    expect(due.day).toBe(5);
    expect(due.completed).toBe(0);
    let missed=newWorkshop();
    for(let i=0;i<4;i++)missed=runShift(missed);
    expect(forecastNextShift(missed)).toMatchObject({
      dayAfter:6,willDeliver:false,willMiss:true,warehouseAfter:0,coinsAfter:85,
    });
  });
  it('provides a contextual first-day goal without adding unrelated buttons',()=>{
    const initial=newWorkshop();
    expect(workshopNextStep(initial)).toContain('温室');
    expect(workshopHint(initial)).toMatchObject({action:'move',source:7,target:6});
    expect(workshopHint(salvageMachine(initial,7))).toMatchObject({action:'build',craft:'garden'});
    expect(workshopNextStep(salvageMachine(initial,7))).toContain('重新建造孢子温室');
    expect(workshopNextStep(salvageMachine(initial,5))).toContain('重新建造水汽泵');
    let world=moveMachine(initial,7,6);
    expect(workshopNextStep(world)).toContain('熔炉');
    expect(workshopHint(world)).toMatchObject({action:'build',craft:'kiln',target:1});
    world=placeMachine(world,7,'kiln');
    expect(workshopNextStep(world)).toContain('派工');
    expect(workshopHint(world)).toMatchObject({action:'staff',worker:'brook',target:5});
    world=assignWorker(world,'brook',5);
    world=assignWorker(world,'fern',6);
    world=assignWorker(world,'cinder',7);
    expect(workshopNextStep(world)).toContain('开始一天生产');
    expect(workshopHint(world)).toMatchObject({action:'shift',source:null,target:null});
    world=runShift(world);
    expect(workshopNextStep(world)).toContain('自动交付');
  });
  it('salvages wrong machine investments to recover from a soft lock',()=>{
    let world=moveMachine(newWorkshop(),7,6);
    world=placeMachine(world,0,'well');
    world=placeMachine(world,1,'garden');
    world=placeMachine(world,2,'garden');
    expect(world.coins).toBe(28);
    expect(workshopNextStep(world)).toContain('资金不足');
    expect(machineSalvageRefund(world.tiles[1])).toBe(15);
    expect(salvageMachine(world,-1)).toBe(world);
    expect(salvageMachine(world,8)).toBe(world);
    const rescued=salvageMachine(world,1);
    expect(rescued.coins).toBe(43);
    expect(rescued.tiles[1]).toBeNull();
    expect(world.tiles[1]?.craft).toBe('garden');
    expect(validWorkshop(rescued)).toBe(true);
    const built=placeMachine(rescued,7,'kiln');
    expect(built.tiles[7]?.craft).toBe('kiln');
    expect(built.coins).toBe(5);
    expect(machineSalvageRefund(null)).toBe(0);
    expect(salvageMachine({...world,coins:Number.MAX_SAFE_INTEGER},1).coins).toBe(Number.MAX_SAFE_INTEGER);
  });
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

  it('premium orders add real inventory exposure and cannot be accepted twice',()=>{
    let starter=connect();
    expect(acceptPremiumOrder(starter)).toBe(starter); // unlocked by first delivery
    for(let i=0;i<5;i++)starter=runShift(starter);
    expect(starter.day).toBe(6);
    expect(starter.order).toEqual({due:9,cores:3,reward:95});
    expect(PREMIUM_EXTRA_CORES).toBe(5);
    expect(PREMIUM_EXTRA_REWARD).toBe(120);
    const accepted=acceptPremiumOrder(starter);
    expect(accepted.order).toEqual({due:9,cores:8,reward:215,premium:true});
    expect(accepted.coins).toBe(starter.coins);
    expect(accepted.warehouse.core).toBe(starter.warehouse.core);
    expect(starter.order.premium).toBeUndefined(); // immutable
    expect(acceptPremiumOrder(accepted)).toBe(accepted);
    expect(validWorkshop(accepted)).toBe(true);
    expect(forecastOrderChoice(accepted)).toBeNull();
    const comparison=forecastOrderChoice(starter);
    expect(comparison?.standard).toBe('fulfilled');
    expect(comparison?.premium).toBe('fulfilled');
    let played=accepted;
    for(let i=0;i<4;i++)played=runShift(played);
    expect(played.last?.fulfilled).toBe(true);
    expect(played.last?.premium).toBe(true);
    expect(played.coins).toBe(starter.coins+215);
    expect(played.order.premium).toBeUndefined();
    expect(played.order.cores).toBe(4); // premium surcharge does NOT persist
    expect(played.order.reward).toBe(120);
  });
  it('normal delivery can succeed when premium goes into a real loss',()=>{
    let s=connect();
    for(let i=0;i<5;i++)s=runShift(s);
    s=unassignWorker(s,'cinder');
    s={...s,day:9,coins:130,warehouse:{core:3}};
    const comparison=forecastOrderChoice(s);
    expect(comparison).toMatchObject({standard:'fulfilled',premium:'missed'});
    const normal=runShift(s);
    expect(normal.completed).toBe(2);
    expect(normal.coins).toBe(225);
    const premium=acceptPremiumOrder(s);
    const missed=runShift(premium);
    expect(missed.last).toMatchObject({lost:true,premium:true});
    expect(missed.completed).toBe(1);
    expect(missed.failed).toBe(1);
    expect(missed.coins).toBe(130-PREMIUM_ORDER_PENALTY);
    expect(missed.warehouse.core).toBe(3); // no magical goods minted
    expect(missed.order.premium).toBeUndefined();
    expect(validWorkshop(missed)).toBe(true);
    expect(validWorkshop({...s,order:{...s.order,premium:false}})).toBe(false);
  });

  it('town market physically delivers one shipment per game day with real coins',()=>{
    const start=connect();
    expect(start.market).toBeUndefined(); // old saves load with no migration
    expect(townMarketAvailable(start,'fiber')).toBe(true);
    expect(TOWN_MARKET.fiber.amount).toBe(3);
    const shipped=buyTownSupply(start,'fiber');
    expect(shipped.coins).toBe(start.coins-24);
    expect(shipped.tiles[6]?.stored).toBe(3);
    expect(shipped.tiles[5]).toEqual(start.tiles[5]);
    expect(shipped.market).toEqual({day:1,kind:'fiber'});
    expect(start.tiles[6]?.stored).toBe(0); // pure, unmodified save
    expect(townMarketAvailable(shipped,'core')).toBe(false);
    expect(buyTownSupply(shipped,'core')).toBe(shipped);
    const after=runShift(shipped);
    expect(after.last?.cores).toBeGreaterThan(0);
    expect(after.day).toBe(2);
    expect(townMarketAvailable(after,'core')).toBe(true); // next day market resets
    const replenished={...after,coins:52};
    const bought=buyTownSupply(replenished,'core');
    expect(bought.coins).toBe(15);
    expect(bought.warehouse.core).toBe(after.warehouse.core+1);
    expect(bought.market).toEqual({day:2,kind:'core'});
    expect(validWorkshop(bought)).toBe(true);
  });
  it('town cannot manufacture resources without infrastructure or cash',()=>{
    const base=newWorkshop();
    const noPump={...base,tiles:base.tiles.map((x,i)=>i===5?null:x)};
    expect(buyTownSupply(noPump,'water')).toBe(noPump);
    const noGarden={...base,tiles:base.tiles.map((x,i)=>i===7?null:x)};
    expect(buyTownSupply(noGarden,'fiber')).toBe(noGarden);
    expect(buyTownSupply({...base,coins:11},'water')).toBeDefined();
    expect(buyTownSupply({...base,coins:11},'water').coins).toBe(11);
    expect(buyTownSupply(base,'something' as 'core')).toBe(base);
    const bought=buyTownSupply(base,'water');
    expect(validWorkshop(bought)).toBe(true);
    expect(validWorkshop({...bought,market:{day:9999,kind:'water'}})).toBe(false);
    expect(validWorkshop({...bought,market:{day:1,kind:'fake'}})).toBe(false);
  });

  it('visiting townspeople trade actual machine stock for coins, not a mood click',()=>{
    const s=newWorkshop();
    expect(residentForDay(1)).toBe('residentWater');
    expect(residentForDay(2)).toBe('residentFiber');
    expect(residentForDay(3)).toBe('residentCore');
    expect(residentRequestAvailable(s)).toBe(false);
    expect(deliverResidentRequest(s)).toBe(s);
    const loaded={...s,tiles:s.tiles.map((m,i)=>i===5?{...m!,stored:2}:m)};
    expect(residentRequestStock(loaded)).toBe(2);
    expect(TOWN_RESIDENTS.residentWater.reward).toBe(26);
    const traded=deliverResidentRequest(loaded);
    expect(traded.coins).toBe(126);
    expect(traded.tiles[5]?.stored).toBe(0);
    expect(traded.market).toEqual({day:1,kind:'residentWater'});
    expect(traded.residentsHelped).toBe(1);
    expect(loaded.tiles[5]?.stored).toBe(2); // immutable
    expect(deliverResidentRequest(traded)).toBe(traded);
    expect(buyTownSupply(traded,'core')).toBe(traded);
    expect(townMarketAvailable(traded,'water')).toBe(false);
    expect(validWorkshop(traded)).toBe(true);
  });
  it('fiber and shared-core visitors rotate by game day, removing actual goods',()=>{
    const s=newWorkshop();
    const fiber={...s,day:2,tiles:s.tiles.map((m,i)=>i===7?{...m!,stored:4}:m)};
    const fiberSale=deliverResidentRequest(fiber);
    expect(fiberSale.tiles[7]?.stored).toBe(2);
    expect(fiberSale.coins).toBe(139);
    expect(fiberSale.market).toEqual({day:2,kind:'residentFiber'});
    const core={...fiberSale,day:3,warehouse:{core:2}};
    const coreSale=deliverResidentRequest(core);
    expect(coreSale.warehouse.core).toBe(1);
    expect(coreSale.coins).toBe(190);
    expect(coreSale.residentsHelped).toBe(2);
    expect(coreSale.market).toEqual({day:3,kind:'residentCore'});
    expect(validWorkshop(coreSale)).toBe(true);
    expect(validWorkshop({...coreSale,residentsHelped:-1})).toBe(false);
    expect(validWorkshop({...coreSale,residentsHelped:4})).toBe(false);
    expect(validWorkshop({...coreSale,market:{day:3,kind:'residentWrong'}})).toBe(false);
  });
  it('resident opportunities are exclusive with purchasing, including across older saves',()=>{
    const s=newWorkshop();
    const purchased=buyTownSupply(s,'water');
    expect(deliverResidentRequest(purchased)).toBe(purchased);
    expect(s.market).toBeUndefined();
    expect(validWorkshop({...s,market:{day:1,kind:'residentWater'}})).toBe(true);
    const unavailable={...s,day:3,warehouse:{core:0}};
    expect(deliverResidentRequest(unavailable)).toBe(unavailable);
    expect(residentRequestAvailable(unavailable)).toBe(false);
    const noPump={...s,tiles:s.tiles.map(()=>null)};
    expect(deliverResidentRequest(noPump)).toBe(noPump);
  });
});
