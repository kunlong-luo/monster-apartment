import {describe,expect,it} from 'vitest';
import {newWorkshop,runShift} from '../v2/src/workshop-engine';
import {startWorkshopAuto,simulateWorkshopAutoUntil} from '../v2/src/workshop-auto-production';
import {WORKSHOP_SAVE_KEY,WORKSHOP_SAVE_LOCK,parseWorkshopSnapshot,transactWorkshopSave,
  writeWorkshopSnapshot,withWorkshopSaveLock} from '../v2/src/workshop-save-transaction';
import {reduceWorldAction} from '../src/lib/moonwork/world-store';

function storage(initial:string|null=null){
  const map=new Map<string,string>();
  if(initial!==null)map.set(WORKSHOP_SAVE_KEY,initial);
  return {
    getItem:(key:string)=>map.get(key)??null,
    setItem:(key:string,value:string)=>{map.set(key,value);},
  };
}
function queuedLocks(){
  let tail:Promise<unknown>=Promise.resolve();
  const names:string[]=[];
  const locks={
    request:(name:string,_opts:unknown,callback:(lock:object)=>unknown)=>{
      names.push(name);
      const next=tail.then(()=>callback({name}));
      tail=next.then(()=>undefined,()=>undefined);
      return next;
    },
  } as unknown as LockManager;
  return {locks,names};
}
describe('R05 exclusive V2 world save transactions',()=>{
  it('serializes same-day purchases and never charges twice',async()=>{
    const s=storage(JSON.stringify(newWorkshop()));
    const {locks,names}=queuedLocks();
    const [a,b]=await Promise.all([
      transactWorkshopSave(s,locks,w=>reduceWorldAction(w,'marketCore')),
      transactWorkshopSave(s,locks,w=>reduceWorldAction(w,'marketCore')),
    ]);
    expect([a,b]).toEqual(['applied','unchanged']);
    expect(parseWorkshopSnapshot(s.getItem(WORKSHOP_SAVE_KEY))!.market?.kind).toBe('core');
    expect(names).toEqual([WORKSHOP_SAVE_LOCK,WORKSHOP_SAVE_LOCK]);
  });
  it('does not lose a manual shift concurrent with a town purchase',async()=>{
    const s=storage(JSON.stringify(newWorkshop()));
    const {locks}=queuedLocks();
    expect(await Promise.all([
      transactWorkshopSave(s,locks,runShift),
      transactWorkshopSave(s,locks,w=>reduceWorldAction(w,'marketCore')),
    ])).toEqual(['applied','applied']);
    expect(parseWorkshopSnapshot(s.getItem(WORKSHOP_SAVE_KEY)))
      .toEqual(reduceWorldAction(runShift(newWorkshop()),'marketCore'));
  });
  it('retains auto production while a town purchase is pending',async()=>{
    let world=newWorkshop();
    world.tiles[5]!.worker='brook';
    world=startWorkshopAuto(world,1000);
    const s=storage(JSON.stringify(world));
    const {locks}=queuedLocks();
    expect(await Promise.all([
      transactWorkshopSave(s,locks,w=>simulateWorkshopAutoUntil(w,31000)),
      transactWorkshopSave(s,locks,w=>reduceWorldAction(w,'marketCore')),
    ])).toEqual(['applied','applied']);
    const actual=parseWorkshopSnapshot(s.getItem(WORKSHOP_SAVE_KEY))!;
    expect(actual).toEqual(
      reduceWorldAction(simulateWorkshopAutoUntil(world,31000),'marketCore'));
    expect(actual.auto?.produced.water).toBeGreaterThanOrEqual(2);
  });
  it('protects invalid saves, missing locks and stale snapshots',async()=>{
    const {locks}=queuedLocks();
    const corrupted=storage('{not-json');
    expect(await transactWorkshopSave(corrupted,locks,runShift)).toBe('missing');
    expect(corrupted.getItem(WORKSHOP_SAVE_KEY)).toBe('{not-json');
    const s=storage(JSON.stringify(newWorkshop()));
    const old=s.getItem(WORKSHOP_SAVE_KEY);
    expect(await transactWorkshopSave(s,undefined,runShift)).toBe('unavailable');
    expect(s.getItem(WORKSHOP_SAVE_KEY)).toBe(old);
    s.setItem(WORKSHOP_SAVE_KEY,JSON.stringify(runShift(newWorkshop())));
    expect(writeWorkshopSnapshot(s,old,newWorkshop())).toBe('conflict');
    expect((await withWorkshopSaveLock(locks,()=>42)).status).toBe('ok');
    const broken={getItem:s.getItem,setItem:()=>{throw Error('quota');}};
    expect(await transactWorkshopSave(broken,locks,runShift)).toBe('error');
  });
});
