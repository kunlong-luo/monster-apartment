import {describe,it,expect} from 'vitest';
import {newWorkshop,runShift,placeMachine,moveMachine,assignWorker,validWorkshop,
  linked,workshopHint,workshopNextStep,buyTownSupply,residentForDay,
  TOWN_MARKET,WORKERS,MACHINES} from '../v2/src/workshop-engine';
import * as model from '../v2/src/workshop-model';
import * as guide from '../v2/src/workshop-guidance';
import * as town from '../v2/src/workshop-town';

describe('workshop domain module compatibility',()=>{
  it('preserves the public facade and source-of-truth configuration',()=>{
    expect(MACHINES).toBe(model.MACHINES);
    expect(WORKERS).toBe(model.WORKERS);
    expect(TOWN_MARKET).toBe(model.TOWN_MARKET);
    expect(residentForDay).toBe(model.residentForDay);
    expect(linked).toBe(model.linked);
    expect(workshopHint).toBe(guide.workshopHint);
    expect(workshopNextStep).toBe(guide.workshopNextStep);
    expect(buyTownSupply).toBe(town.buyTownSupply);
  });
  it('keeps old V2 saves and physical production unchanged after the split',()=>{
    const initial=newWorkshop();
    expect(validWorkshop(JSON.parse(JSON.stringify(initial)))).toBe(true);
    expect(workshopHint(initial)).toEqual({action:'move',source:7,target:6});
    let world=moveMachine(initial,7,6);
    world=placeMachine(world,7,'kiln');
    world=assignWorker(world,'brook',5);
    world=assignWorker(world,'fern',6);
    world=assignWorker(world,'cinder',7);
    expect(runShift(world).last).toMatchObject({water:2,fiber:2,cores:2});
    const marketWorld=town.buyTownSupply(world,'water');
    expect(marketWorld.coins).toBe(world.coins-12);
    expect(marketWorld.market).toEqual({day:1,kind:'water'});
    expect(validWorkshop(marketWorld)).toBe(true);
    expect(validWorkshop(JSON.parse(JSON.stringify(marketWorld)))).toBe(true);
  });
});
