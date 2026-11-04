import {describe,expect,it} from 'vitest';
import {assignWorker,moveMachine,newWorkshop,placeMachine} from '../v2/src/workshop-engine';
import {machineEffectProfile,projectedSupplyTrails} from '../v2/src/workshop-machine-presentation';

describe('Pixi workshop presentation follows production, not visual guesses',()=>{
  it('uses distinctive intensity but never emits active particles for blocked or idle machines',()=>{
    for(const phase of ['idle','blocked'] as const){
      const effect=machineEffectProfile(phase,true);
      expect(effect.particles).toBe(false);
      expect(effect.speed).toBe(0);
    }
    for(const phase of ['working','startup','output'] as const){
      const still=machineEffectProfile(phase,false);
      expect(still.particles).toBe(false);
      expect(still.speed).toBe(0);
      expect(still.bloomAlpha).toBeLessThan(.1);
    }
    const working=machineEffectProfile('working',true);
    const starting=machineEffectProfile('startup',true);
    const output=machineEffectProfile('output',true);
    expect(working.particles).toBe(true);
    expect(starting.ringAlpha).toBeGreaterThan(working.ringAlpha);
    expect(output.bloomAlpha).toBeGreaterThan(starting.bloomAlpha);
    expect(output.speed).toBeGreaterThan(working.speed);
  });

  it('animates only actual well-to-garden and garden-to-kiln consumption',()=>{
    let world=newWorkshop();
    expect(projectedSupplyTrails(world)).toEqual([]);
    world=assignWorker(world,'fern',7);
    expect(projectedSupplyTrails(world)).toEqual([]); // disconnected
    world=moveMachine(world,7,6);
    world=placeMachine(world,7,'kiln');
    world=assignWorker(world,'brook',5);
    world=assignWorker(world,'cinder',7);
    const saved=JSON.stringify(world);
    expect(projectedSupplyTrails(world)).toEqual([
      {from:5,to:6,kind:'water'},
      {from:6,to:7,kind:'fiber'},
    ]);
    expect(JSON.stringify(world)).toBe(saved); // visuals never mutate saves
  });

  it('keeps transport direction correct when its source tile index is larger',()=>{
    let world=newWorkshop();
    world=moveMachine(world,5,9);
    world=moveMachine(world,7,8);
    world=assignWorker(world,'brook',9);
    world=assignWorker(world,'fern',8);
    expect(projectedSupplyTrails(world)).toEqual([
      {from:9,to:8,kind:'water'},
    ]);
  });
});
