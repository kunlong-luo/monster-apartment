import {describe,expect,it} from 'vitest';
import {
  newWorkshop,placeMachine,moveMachine,assignWorker,runShift,
  linked,validWorkshop,unassignWorker,
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
