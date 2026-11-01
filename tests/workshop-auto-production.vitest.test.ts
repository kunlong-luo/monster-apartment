import {describe,it,expect} from 'vitest';
import {newWorkshop,moveMachine,placeMachine,assignWorker,validWorkshop,runShift} from '../v2/src/workshop-engine';
import {startWorkshopAuto,pauseWorkshopAuto,simulateWorkshopAutoUntil,MAX_AUTO_CATCHUP_MS,AUTO_STORAGE_CAPS} from '../v2/src/workshop-auto-production';
const setup=()=>{
 let s=newWorkshop();
 s=moveMachine(s,7,6);
 s=placeMachine(s,7,'kiln');
 s=assignWorker(s,'brook',5);
 s=assignWorker(s,'fern',6);
 s=assignWorker(s,'cinder',7);
 return s;
};
describe('A07 opt-in realtime production, independent of day/contract engine',()=>{
 it('starts once with genuine assigned workers, preserving the V2 JSON save',()=>{
  const s=setup(),a=startWorkshopAuto(s,1000);
  expect(a.auto).toMatchObject({version:1,enabled:true,lastSimulatedAt:1000,
    nextDue:[0,0,0,0,0,31000,46000,61000]});
  expect(validWorkshop(a)).toBe(true);
  expect(startWorkshopAuto(a,8000)).toBe(a);
  const starter=startWorkshopAuto(newWorkshop(),1000);
  expect(starter.tiles[5]?.worker).toBe('brook');
  expect(starter.tiles[7]?.worker).toBe('fern');
  expect(starter.auto?.enabled).toBe(true);
  const empty={...newWorkshop(),tiles:Array(15).fill(null)};
  expect(startWorkshopAuto(empty,1000)).toBe(empty);
 });
 it('applies each craft interval and linked inputs in due-time order, never advancing day or orders',()=>{
  const start=startWorkshopAuto(setup(),1000);
  expect(simulateWorkshopAutoUntil(start,30999)).toBe(start);
  const w=simulateWorkshopAutoUntil(start,31000);
  expect(w.tiles[5]?.stored).toBe(2);
  expect(w.tiles[6]?.stored).toBe(0);
  const g=simulateWorkshopAutoUntil(w,46000);
  expect(g.tiles[5]?.stored).toBe(1);
  expect(g.tiles[6]?.stored).toBe(2);
  const k=simulateWorkshopAutoUntil(g,61000);
  expect(k.warehouse.core).toBe(2);
  expect(k.tiles[6]?.stored).toBe(0);
  expect(k.auto?.produced).toEqual({water:4,fiber:2,cores:2});
  expect(k.day).toBe(start.day);
  expect(k.coins).toBe(start.coins);
  expect(k.order).toEqual(start.order);
  expect(k.completed).toBe(0);
  expect(k.failed).toBe(0);
  expect(k.last).toBeNull();
  expect(validWorkshop(k)).toBe(true);
  expect(simulateWorkshopAutoUntil(k,61000)).toBe(k);
  expect(simulateWorkshopAutoUntil(JSON.parse(JSON.stringify(k)),61000)).toEqual(k);
 });
 it('resetting a moved machine resets clock rather than granting backdated production',()=>{
  const start=startWorkshopAuto(setup(),1000);
  const moved=moveMachine(start,7,8);
  const shifted=simulateWorkshopAutoUntil(moved,600000);
  expect(shifted.warehouse.core).toBe(0);
  expect(shifted.auto?.nextDue[8]).toBe(660000);
 });
 it('pauses cleanly and resumes without awarding previously paused time',()=>{
  const start=startWorkshopAuto(setup(),1000),off=pauseWorkshopAuto(start);
  expect(simulateWorkshopAutoUntil(off,999999)).toBe(off);
  const on=startWorkshopAuto(off,999999);
  expect(on.auto?.nextDue[5]).toBe(1029999);
  expect(on.auto?.produced.cores).toBe(0);
  expect(validWorkshop(on)).toBe(true);
 });
 it('never overflows safe storage limits or charges deadline penalties over 8h offline',()=>{
  const start=startWorkshopAuto(setup(),1000);
  const future=simulateWorkshopAutoUntil(start,1000+MAX_AUTO_CATCHUP_MS+1000000);
  expect(future.warehouse.core).toBeLessThanOrEqual(AUTO_STORAGE_CAPS.cores);
  expect(future.tiles[5]?.stored).toBeLessThanOrEqual(AUTO_STORAGE_CAPS.water);
  expect(future.tiles[6]?.stored).toBeLessThanOrEqual(AUTO_STORAGE_CAPS.fiber);
  expect(future.day).toBe(start.day);
  expect(future.failed).toBe(0);
  expect(future.coins).toBe(start.coins);
  expect(simulateWorkshopAutoUntil(future,1000+MAX_AUTO_CATCHUP_MS+1000000)).toBe(future);
  expect(validWorkshop(future)).toBe(true);
 });
 it('legacy manual day advancement remains an explicit separate operation',()=>{
  const start=startWorkshopAuto(setup(),1000);
  const after=runShift(pauseWorkshopAuto(start));
  expect(after.day).toBe(2);
  expect(after.auto?.enabled).toBe(false);
 });
});
