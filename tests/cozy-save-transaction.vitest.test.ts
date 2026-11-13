import {describe,expect,it} from 'vitest';
import {buildCozyRoom,cozyDay,newCozyGame,moveInCozy} from '../src/core/cozy-engine';
import {COZY_SAVE_KEY,COZY_SAVE_LOCK,parseCozySnapshot,
  transactCozySave,tickCozySave,resetCorruptCozySave} from '../src/lib/game/cozy-save-transaction';

function storage(initial:string|null=null){
  const data=new Map<string,string>();
  if(initial!==null)data.set(COZY_SAVE_KEY,initial);
  let writes=0;
  return {
    getItem:(key:string)=>data.get(key)??null,
    setItem:(key:string,value:string)=>{writes++;data.set(key,value);},
    get writes(){return writes;},
  };
}
function queuedLocks(){
  let tail:Promise<unknown>=Promise.resolve();
  const calls:string[]=[];
  const locks={
    request:(name:string,_options:unknown,callback:(lock:object)=>unknown)=>{
      calls.push(name);
      const result=tail.then(()=>callback({name}));
      tail=result.then(()=>undefined,()=>undefined);
      return result;
    },
  } as unknown as LockManager;
  return {locks,calls};
}
describe('R11 apartment V1 locked save transactions',()=>{
  it('initializes exactly once, even with two tabs mounting together',async()=>{
    const store=storage();
    const {locks,calls}=queuedLocks();
    const [first,second]=await Promise.all([
      transactCozySave(store,locks,state=>state),
      transactCozySave(store,locks,state=>state),
    ]);
    expect(first.status).toBe('applied');
    expect(second.status).toBe('unchanged');
    expect(store.writes).toBe(1);
    expect(parseCozySnapshot(store.getItem(COZY_SAVE_KEY))).toEqual(newCozyGame());
    expect(calls).toEqual([COZY_SAVE_LOCK,COZY_SAVE_LOCK]);
  });

  it('retains simultaneous different room actions instead of overwriting a stale snapshot',async()=>{
    const store=storage(JSON.stringify(newCozyGame()));
    const {locks}=queuedLocks();
    const [one,two]=await Promise.all([
      transactCozySave(store,locks,world=>buildCozyRoom(world,0,'nest')),
      transactCozySave(store,locks,world=>buildCozyRoom(world,2,'bath')),
    ]);
    expect([one.status,two.status]).toEqual(['applied','applied']);
    const state=parseCozySnapshot(store.getItem(COZY_SAVE_KEY))!;
    expect(state.coins).toBe(41);
    expect(state.rooms[0]?.type).toBe('nest');
    expect(state.rooms[2]?.type).toBe('bath');
    expect(store.writes).toBe(2);
  });

  it('honors simultaneous same-room actions without double charging',async()=>{
    const store=storage(JSON.stringify(newCozyGame()));
    const {locks}=queuedLocks();
    const results=await Promise.all([
      transactCozySave(store,locks,world=>buildCozyRoom(world,2,'bath')),
      transactCozySave(store,locks,world=>buildCozyRoom(world,2,'bath')),
      transactCozySave(store,locks,world=>moveInCozy(world,2,'dewdrop')),
    ]);
    expect(results.map(r=>r.status)).toEqual(['applied','unchanged','applied']);
    const state=parseCozySnapshot(store.getItem(COZY_SAVE_KEY))!;
    expect(state.coins).toBe(71);
    expect(state.rooms[2]?.resident).toBe('dewdrop');
    expect(store.writes).toBe(2);
  });

  it('advances each shared active 2-second slot only once across tabs',async()=>{
    const store=storage(JSON.stringify(newCozyGame()));
    const {locks}=queuedLocks();
    const first=await Promise.all([
      tickCozySave(store,locks,10_000),
      tickCozySave(store,locks,10_000),
      tickCozySave(store,locks,11_999),
    ]);
    expect(first.map(r=>r.status)).toEqual(['applied','unchanged','unchanged']);
    for(let n=1;n<12;n++){
      await Promise.all([
        tickCozySave(store,locks,10_000+n*2000),
        tickCozySave(store,locks,10_000+n*2000),
      ]);
    }
    const state=parseCozySnapshot(store.getItem(COZY_SAVE_KEY))!;
    expect(state.tick).toBe(12);
    expect(cozyDay(state.tick)).toBe(2);
    expect(state.journal.filter(entry=>entry.key==='rent-12')).toHaveLength(1);
  });

  it('fails closed on invalid payloads, unavailable locks and storage errors',async()=>{
    const {locks}=queuedLocks();
    const invalid=storage('{broken');
    const a=await transactCozySave(invalid,locks,state=>buildCozyRoom(state,2,'bath'));
    expect(a).toEqual({status:'corrupt',raw:'{broken'});
    expect(invalid.getItem(COZY_SAVE_KEY)).toBe('{broken');
    expect((await transactCozySave(invalid,undefined,state=>state)).status).toBe('unavailable');
    const store=storage(JSON.stringify(newCozyGame()));
    const before=store.getItem(COZY_SAVE_KEY);
    expect((await transactCozySave(store,undefined,state=>buildCozyRoom(state,2,'bath'))).status).toBe('unavailable');
    expect(store.getItem(COZY_SAVE_KEY)).toBe(before);
    const broken={getItem:store.getItem,setItem:()=>{throw Error('quota exceeded');}};
    expect((await transactCozySave(broken,locks,world=>buildCozyRoom(world,2,'bath'))).status).toBe('error');
  });

  it('only resets the confirmed damaged payload under the same save lock',async()=>{
    const store=storage('{old-corrupt');
    const {locks}=queuedLocks();
    store.setItem(COZY_SAVE_KEY,JSON.stringify(newCozyGame()));
    expect((await resetCorruptCozySave(store,locks,'{old-corrupt')).status).toBe('stale');
    expect(parseCozySnapshot(store.getItem(COZY_SAVE_KEY))?.coins).toBe(105);
    store.setItem(COZY_SAVE_KEY,'{new-damaged');
    expect((await resetCorruptCozySave(store,locks,'{old-corrupt')).status).toBe('stale');
    expect(store.getItem(COZY_SAVE_KEY)).toBe('{new-damaged');
    expect((await resetCorruptCozySave(store,locks,'{new-damaged')).status).toBe('applied');
    expect(parseCozySnapshot(store.getItem(COZY_SAVE_KEY))?.coins).toBe(105);
  });

  it('preserves old complete-save progress while resuming it',async()=>{
    const old={...newCozyGame(),phase:'complete' as const,coins:47};
    const store=storage(JSON.stringify(old));
    const {locks}=queuedLocks();
    const result=await transactCozySave(store,locks,state=>state);
    expect(result.status).toBe('applied');
    const state=parseCozySnapshot(store.getItem(COZY_SAVE_KEY))!;
    expect(state.phase).toBe('playing');
    expect(state.coins).toBe(47);
  });
});
