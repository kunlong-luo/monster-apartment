import {describe,it,expect} from 'vitest';
import {newWorkshop,autoAssignWorkers,assignWorker,placeMachine} from '../v2/src/workshop-engine';
describe('one-tap matching workshop shifts',()=>{
  it('assigns only available skilled workers and preserves the original save',()=>{
    const initial=newWorkshop();
    const next=autoAssignWorkers(initial);
    expect(initial.tiles[5]?.worker).toBeNull();
    expect(initial.tiles[7]?.worker).toBeNull();
    expect(next.tiles[5]?.worker).toBe('brook');
    expect(next.tiles[7]?.worker).toBe('fern');
    expect(next.coins).toBe(initial.coins);
    expect(next.day).toBe(initial.day);
    expect(next.tiles[6]).toBeNull();
    expect(next.tiles.filter(t=>t?.worker==='cinder')).toHaveLength(0);
    expect(autoAssignWorkers(next)).toBe(next);
  });
  it('does not evict manually assigned workers, even from an unusual machine',()=>{
    let initial=newWorkshop();
    initial=assignWorker(initial,'cinder',5);
    const next=autoAssignWorkers(initial);
    expect(next.tiles[5]?.worker).toBe('cinder');
    expect(next.tiles[7]?.worker).toBe('fern');
    expect(next.tiles.filter(t=>t?.worker==='brook')).toHaveLength(0);
  });
  it('fills a newly created matching machine without new spending or moving',()=>{
    let initial=newWorkshop();
    initial=placeMachine(initial,6,'kiln');
    initial=autoAssignWorkers(initial);
    expect(initial.tiles[6]?.worker).toBe('cinder');
    expect(initial.tiles[5]?.worker).toBe('brook');
    expect(initial.tiles[7]?.worker).toBe('fern');
    expect(autoAssignWorkers(initial)).toBe(initial);
  });
});
