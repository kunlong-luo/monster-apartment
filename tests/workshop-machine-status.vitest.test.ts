import {describe,it,expect} from 'vitest';
import {assignWorker,moveMachine,newWorkshop,placeMachine,runShift} from '../v2/src/workshop-engine';
import {inspectMachineSignals} from '../v2/src/workshop-machine-status';
import {parseSavedWorld,reduceWorldAction} from '../src/lib/moonwork/world-store';

describe('machine signals are real production signals',()=>{
  it('distinguishes unstaffed machines, resource starvation and productive shifts',()=>{
    let world=newWorkshop();
    expect(inspectMachineSignals(world)[5]?.state).toBe('idle');
    expect(inspectMachineSignals(world)[7]?.state).toBe('idle');
    world=assignWorker(world,'fern',7);
    expect(inspectMachineSignals(world)[7]).toEqual({state:'blocked',problem:'water'});
    world=assignWorker(world,'brook',5);
    expect(inspectMachineSignals(world)[5]?.state).toBe('working');
    expect(inspectMachineSignals(world)[7]?.state).toBe('blocked');
    world=moveMachine(world,7,6);
    expect(inspectMachineSignals(world)[6]?.state).toBe('working');
    world=placeMachine(world,7,'kiln');
    world=assignWorker(world,'cinder',7);
    expect(inspectMachineSignals(world)[7]?.state).toBe('working');
    const next=runShift(world);
    expect(next.last).toMatchObject({water:2,fiber:2,cores:2,blocked:[]});
  });
  it('does not mutate saves, reward stock, or overwrite corrupted content',()=>{
    const state=newWorkshop();
    const original=JSON.stringify(state);
    inspectMachineSignals(state);
    expect(JSON.stringify(state)).toBe(original);
    expect(parseSavedWorld('{invalid')).toBeNull();
    const purchased=reduceWorldAction(state,'marketCore');
    expect(purchased).not.toBe(state);
    expect(purchased.coins).toBe(state.coins-37);
    expect(state.coins).toBe(100);
  });
});
