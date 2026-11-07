import {describe,it,expect} from 'vitest';
import {newWorkshop,moveMachine,placeMachine,assignWorker,runShift} from '../v2/src/workshop-engine';
import {SAVE_KEY,parseSavedWorld,commitWorldAction} from '../src/lib/moonwork/world-store';
const locks={
  request:async(_name:string,_options:unknown,callback:(lock:object)=>unknown)=>callback({})
} as unknown as LockManager;

const save=()=>{
  const map=new Map<string,string>();
  const storage={
    getItem:(key:string)=>map.get(key)??null,
    setItem:(key:string,value:string)=>{map.set(key,value);},
  };
  return {storage,map};
};
function visitingWorld(){
  let world=newWorkshop();
  world=moveMachine(world,7,6);
  world=placeMachine(world,7,'kiln');
  world=assignWorker(world,'brook',5);
  world=assignWorker(world,'fern',6);
  world=assignWorker(world,'cinder',7);
  for(let i=0;i<5;i++)world=runShift(world);
  return world;
}
describe('Next world routes share the V2 deterministic save contract',()=>{
  it('never converts an invalid or missing key into fake resources',async()=>{
    expect(parseSavedWorld(null)).toBeNull();
    expect(parseSavedWorld('{invalid')).toBeNull();
    expect(parseSavedWorld(JSON.stringify({version:2,coins:9999}))).toBeNull();
    const {storage,map}=save();
    expect(await commitWorldAction(storage,'accept',locks)).toBe('missing');
    expect(map.size).toBe(0);
    storage.setItem(SAVE_KEY,'{invalid');
    expect(await commitWorldAction(storage,'import',locks)).toBe('missing');
    expect(storage.getItem(SAVE_KEY)).toBe('{invalid');
  });
  it('accepts a real guest order and pays for imports from the shared warehouse',async()=>{
    const {storage}=save();
    const before=visitingWorld();
    storage.setItem(SAVE_KEY,JSON.stringify(before));
    expect(before.patron?.status).toBe('offered');
    expect(await commitWorldAction(storage,'accept',locks)).toBe('applied');
    let live=parseSavedWorld(storage.getItem(SAVE_KEY))!;
    expect(live.patron?.status).toBe('active');
    expect(await commitWorldAction(storage,'accept',locks)).toBe('unavailable');
    expect(await commitWorldAction(storage,'import',locks)).toBe('applied');
    live=parseSavedWorld(storage.getItem(SAVE_KEY))!;
    expect(live.warehouse.core).toBe(before.warehouse.core+1);
    expect(live.coins).toBe(before.coins-42);
    expect(before.warehouse.core).toBe(8); // original world was not mutated
  });
  it('never overwrites V1 or another storage key',async()=>{
    const {storage}=save();
    storage.setItem('monster-apartment:cozy:v1','legacy');
    storage.setItem(SAVE_KEY,JSON.stringify(visitingWorld()));
    expect(await commitWorldAction(storage,'accept',locks)).toBe('applied');
    expect(storage.getItem('monster-apartment:cozy:v1')).toBe('legacy');
  });
  it('writes one-way premium order into the real shared V2 save',async()=>{
    const {storage}=save();
    const initial=visitingWorld();
    storage.setItem(SAVE_KEY,JSON.stringify(initial));
    expect(await commitWorldAction(storage,'premium',locks)).toBe('applied');
    const upgraded=parseSavedWorld(storage.getItem(SAVE_KEY))!;
    expect(upgraded.order).toMatchObject({premium:true,cores:8,reward:215,due:9});
    expect(initial.order.premium).toBeUndefined();
    expect(await commitWorldAction(storage,'premium',locks)).toBe('unavailable');
    expect(upgraded.coins).toBe(initial.coins);
    expect(await commitWorldAction(storage,'import',locks)).toBe('applied');
    expect(parseSavedWorld(storage.getItem(SAVE_KEY))!.order.premium).toBe(true);
  });

  it('town purchases are shared with the PixiJS factory and do not repeat on refresh',async()=>{
    const {storage}=save();
    const original=visitingWorld();
    storage.setItem(SAVE_KEY,JSON.stringify(original));
    expect(await commitWorldAction(storage,'marketFiber',locks)).toBe('applied');
    const purchased=parseSavedWorld(storage.getItem(SAVE_KEY))!;
    expect(purchased.tiles[6]?.stored).toBe(original.tiles[6]!.stored+3);
    expect(purchased.coins).toBe(original.coins-24);
    expect(purchased.market).toEqual({day:6,kind:'fiber'});
    expect(await commitWorldAction(storage,'marketCore',locks)).toBe('unavailable');
    expect(storage.getItem(SAVE_KEY)).toBe(JSON.stringify(purchased));
    const after=runShift(purchased);
    storage.setItem(SAVE_KEY,JSON.stringify(after));
    expect(await commitWorldAction(storage,'marketWater',locks)).toBe('applied');
    const nextDay=parseSavedWorld(storage.getItem(SAVE_KEY))!;
    expect(nextDay.market).toEqual({day:7,kind:'water'});
    expect(nextDay.tiles[5]!.stored).toBe(after.tiles[5]!.stored+3);
  });

  it('citizen order uses the same daily market opportunity and original save',async()=>{
    const {storage}=save();
    let state=visitingWorld();
    state={...state,day:3,warehouse:{core:5},market:undefined};
    storage.setItem(SAVE_KEY,JSON.stringify(state));
    expect(await commitWorldAction(storage,'resident',locks)).toBe('applied');
    const traded=parseSavedWorld(storage.getItem(SAVE_KEY))!;
    expect(traded.warehouse.core).toBe(4);
    expect(traded.coins).toBe(state.coins+51);
    expect(traded.residentsHelped).toBe(1);
    expect(traded.market).toEqual({day:3,kind:'residentCore'});
    expect(await commitWorldAction(storage,'resident',locks)).toBe('unavailable');
    expect(await commitWorldAction(storage,'marketFiber',locks)).toBe('unavailable');
    expect(parseSavedWorld(storage.getItem(SAVE_KEY))!.residentsHelped).toBe(1);
  });
});
