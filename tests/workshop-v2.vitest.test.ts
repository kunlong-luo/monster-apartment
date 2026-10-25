import {describe,expect,it} from 'vitest';
import {
  newWorkshop,placeMachine,moveMachine,assignWorker,runShift,
  linked,validWorkshop,unassignWorker,acceptPatronCommission, PATRON_ADULT_AGE,
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
    expect(s.patron).toEqual({status:'offered',due:8,cores:13,reward:135});
    expect(s.warehouse.core).toBe(8);
    expect(validWorkshop(s)).toBe(true);
    const accepted=acceptPatronCommission(s);
    expect(accepted.patron?.status).toBe('active');
    expect(accepted.coins).toBe(s.coins);
    expect(acceptPatronCommission(accepted)).toBe(accepted);
    expect(acceptPatronCommission(newWorkshop())).toEqual(newWorkshop());
  });
  it('pays the optional guest contract only using actually produced shared cores',()=>{
    let state=connect();
    for(let i=0;i<5;i++)state=runShift(state);
    state=acceptPatronCommission(state);
    for(let i=0;i<3;i++)state=runShift(state);
    expect(state.day).toBe(9);
    expect(state.patron?.status).toBe('completed');
    expect(state.coins).toBe(267);
    expect(state.warehouse.core).toBe(1);
    expect(validWorkshop(state)).toBe(true);
    // Spending 13 shared cores leaves exactly enough for the next regular
    // order ONLY if the line stays productive on day nine.
    state=runShift(state);
    expect(state.completed).toBe(2);
    expect(state.failed).toBe(0);
    expect(state.warehouse.core).toBe(0);
    expect(state.coins).toBe(362);
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
