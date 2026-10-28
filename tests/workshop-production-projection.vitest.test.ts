import {describe,it,expect} from 'vitest';
import {assignWorker,moveMachine,newWorkshop,placeMachine,runShift}
  from '../v2/src/workshop-engine';
import {projectMachineProduction} from '../v2/src/workshop-production';
import {inspectMachineSignals} from '../v2/src/workshop-machine-status';
import {devicePhase} from '../v2/src/workshop-machine-phases';

describe('physical production and stateful visual semantics',()=>{
  it('projects each staffed station exactly once, including physical input routes',()=>{
    let world=newWorkshop();
    world=assignWorker(world,'brook',5);
    world=assignWorker(world,'fern',7);
    expect(projectMachineProduction(world).cycles.find(c=>c.index===7)).toMatchObject({
      amount:0,sourceIndex:null,blocked:'water',
    });
    expect(inspectMachineSignals(world)[7]?.state).toBe('blocked');
    world=moveMachine(world,7,6);
    world=placeMachine(world,7,'kiln');
    world=assignWorker(world,'cinder',7);
    const before=JSON.stringify(world);
    const projection=projectMachineProduction(world);
    expect(projection.cycles).toEqual([
      {index:5,craft:'well',worker:'brook',amount:2,
        sourceIndex:null,sourceCost:0,blocked:null},
      {index:6,craft:'garden',worker:'fern',amount:2,
        sourceIndex:5,sourceCost:1,blocked:null},
      {index:7,craft:'kiln',worker:'cinder',amount:2,
        sourceIndex:6,sourceCost:2,blocked:null},
    ]);
    expect(projection.tiles[5]?.stored).toBe(1);
    expect(projection.tiles[6]?.stored).toBe(0);
    expect(projection.report).toMatchObject({water:2,fiber:2,cores:2,blocked:[]});
    const settled=runShift(world);
    expect(settled.tiles).toEqual(projection.tiles);
    expect(settled.last).toMatchObject(projection.report);
    expect(JSON.stringify(world)).toBe(before);
  });

  it('honors the startup, steady running, output and blocked phase ordering',()=>{
    expect(devicePhase('idle',10,9,9)).toBe('idle');
    expect(devicePhase('blocked',10,9,9)).toBe('blocked');
    expect(devicePhase('working',10,10,null)).toBe('startup');
    expect(devicePhase('working',10.74,10,null)).toBe('working');
    expect(devicePhase('working',12,10,12)).toBe('output');
    expect(devicePhase('working',13.1,10,12)).toBe('working');
    expect(devicePhase('working',10,null,null)).toBe('working');
  });
});
