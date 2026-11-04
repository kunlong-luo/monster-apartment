import {describe,expect,it} from 'vitest';
import {assignWorker,moveMachine,newWorkshop,placeMachine} from '../v2/src/workshop-engine';
import {machineEffectProfile,materialLight,machineActuatorPose,projectedSupplyTrails} from '../v2/src/workshop-machine-presentation';

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

  it('keeps machine-mounted glass, leaves and crystal light tied to production',()=>{
    for(const phase of ['idle','blocked'] as const){
      expect(materialLight(phase,true)).toEqual({
        active:false,strength:0,movement:0,
      });
    }
    for(const phase of ['startup','working','output'] as const){
      const reduced=materialLight(phase,false);
      expect(reduced.active).toBe(true);
      expect(reduced.strength).toBeLessThan(.2);
      expect(reduced.movement).toBe(0);
    }
    const start=materialLight('startup',true);
    const run=materialLight('working',true);
    const output=materialLight('output',true);
    expect(start.strength).toBeGreaterThan(run.strength);
    expect(output.strength).toBeGreaterThan(start.strength);
    expect(output.movement).toBeGreaterThan(run.movement);
  });


  it('has independent mechanical motions but no false movement under pauses or supply starvation',()=>{
    for(const craft of ['well','garden','kiln'] as const){
      for(const phase of ['idle','blocked'] as const){
        const pose=machineActuatorPose(craft,phase,.7,5,true);
        expect(pose).toMatchObject({
          displacement:0,angle:0,glow:0,active:false,
        });
      }
      for(const phase of ['startup','working','output'] as const){
        const pose=machineActuatorPose(craft,phase,.7,5,false);
        expect(pose.displacement).toBe(0);
        expect(pose.angle).toBe(0);
        expect(pose.glow).toBeCloseTo(.08);
        expect(pose.active).toBe(true);
      }
    }
    const well=machineActuatorPose('well','working',.7,5,true);
    const garden=machineActuatorPose('garden','working',.7,5,true);
    const kiln=machineActuatorPose('kiln','working',.7,5,true);
    expect(new Set([well.displacement,garden.displacement,kiln.displacement]).size).toBe(3);
    expect(Math.abs(machineActuatorPose('well','output',.7,5,true).displacement))
      .toBeGreaterThan(Math.abs(well.displacement));
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
