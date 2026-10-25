import {describe,it,expect} from 'vitest';
import {newWorkshop,moveMachine,placeMachine,assignWorker,runShift} from '../v2/src/workshop-engine';
import {SAVE_KEY,parseSavedWorld,commitWorldAction} from '../src/lib/moonwork/world-store';

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
  it('never converts an invalid or missing key into fake resources',()=>{
    expect(parseSavedWorld(null)).toBeNull();
    expect(parseSavedWorld('{invalid')).toBeNull();
    expect(parseSavedWorld(JSON.stringify({version:2,coins:9999}))).toBeNull();
    const {storage,map}=save();
    expect(commitWorldAction(storage,'accept')).toBe('missing');
    expect(map.size).toBe(0);
    storage.setItem(SAVE_KEY,'{invalid');
    expect(commitWorldAction(storage,'import')).toBe('missing');
    expect(storage.getItem(SAVE_KEY)).toBe('{invalid');
  });
  it('accepts a real guest order and pays for imports from the shared warehouse',()=>{
    const {storage}=save();
    const before=visitingWorld();
    storage.setItem(SAVE_KEY,JSON.stringify(before));
    expect(before.patron?.status).toBe('offered');
    expect(commitWorldAction(storage,'accept')).toBe('applied');
    let live=parseSavedWorld(storage.getItem(SAVE_KEY))!;
    expect(live.patron?.status).toBe('active');
    expect(commitWorldAction(storage,'accept')).toBe('unavailable');
    expect(commitWorldAction(storage,'import')).toBe('applied');
    live=parseSavedWorld(storage.getItem(SAVE_KEY))!;
    expect(live.warehouse.core).toBe(before.warehouse.core+1);
    expect(live.coins).toBe(before.coins-42);
    expect(before.warehouse.core).toBe(8); // original world was not mutated
  });
  it('never overwrites V1 or another storage key',()=>{
    const {storage}=save();
    storage.setItem('monster-apartment:cozy:v1','legacy');
    storage.setItem(SAVE_KEY,JSON.stringify(visitingWorld()));
    expect(commitWorldAction(storage,'accept')).toBe('applied');
    expect(storage.getItem('monster-apartment:cozy:v1')).toBe('legacy');
  });
});
