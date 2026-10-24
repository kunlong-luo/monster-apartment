import {describe,expect,it} from 'vitest';
import {cozyResidentPose,cozyGuestPose} from '../src/game/cozy-resident-performance';

describe('resident choreography follows the real simulation clock',()=>{
  it('keeps sleepers by their bed and workers by their station',()=>{
    const asleep=cozyResidentPose(0,'seedling','nest');
    expect(asleep.activity).toBe('sleep');
    expect(asleep.left).toBe(23);
    const working=cozyResidentPose(4,'seedling','nest');
    expect(working.activity).toBe('work');
    expect(working.left).toBeGreaterThanOrEqual(31);
    expect(working.left).toBeLessThanOrEqual(33);
    expect(cozyResidentPose(4,'dewdrop','bath').activity).not.toBe('sleep');
  });
  it('walks through space and turns rather than spinning in place',()=>{
    const steps=[7,8,9].map(t=>cozyResidentPose(t,'seedling','nest'));
    expect(steps.map(s=>s.activity)).toEqual(['wander','wander','wander']);
    expect(new Set(steps.map(s=>s.left)).size).toBeGreaterThan(1);
    expect(new Set(steps.map(s=>s.face)).size).toBeGreaterThan(1);
  });
  it('uses room-specific stations and stays inside the cutaway',()=>{
    for(const room of ['nest','bath','workshop','greenhouse'] as const){
      for(const tick of Array.from({length:96},(_,i)=>i)){
        const actor=cozyResidentPose(tick,'seedling',room);
        expect(actor.left).toBeGreaterThanOrEqual(15);
        expect(actor.left).toBeLessThanOrEqual(53);
        expect(actor.bottom).toBeGreaterThanOrEqual(1);
        expect(actor.bottom).toBeLessThanOrEqual(4);
        expect(actor.frame).toBeGreaterThanOrEqual(0);
        expect(actor.frame).toBeLessThanOrEqual(3);
      }
    }
    expect(cozyResidentPose(4,'seedling','bath').left)
      .not.toEqual(cozyResidentPose(4,'seedling','workshop').left);
  });
  it('positions actual visitors beside hosts and stays deterministic',()=>{
    expect(cozyGuestPose(7,'dewdrop','seedling'))
      .toEqual(cozyGuestPose(7,'dewdrop','seedling'));
    expect(cozyGuestPose(7,'dewdrop','seedling').face)
      .not.toBe(cozyGuestPose(7,'dewdrop','dewdrop').face);
  });
});
