import {describe,it,expect} from 'vitest';
import {newWorkshop,runShift,assignWorker,moveMachine,placeMachine} from '../v2/src/workshop-engine';
import {startWorkshopAuto,simulateWorkshopAutoUntil} from '../v2/src/workshop-auto-production';
import {workshopMachineCaption,workshopStageStockPatch} from '../v2/src/workshop-stage-diff';
import {buyTownSupply} from '../v2/src/workshop-town';

describe('R07 Pixi incremental scene projection',()=>{
  it('reuses machine sprites for stock-only auto cycles',()=>{
    let state=newWorkshop();
    state=assignWorker(state,'brook',5);
    state=startWorkshopAuto(state,1000);
    const serialized=JSON.stringify(state);
    const later=simulateWorkshopAutoUntil(state,31000);
    expect(workshopStageStockPatch(state,later)).toEqual([5]);
    expect(workshopMachineCaption('well',later.tiles[5]!.stored,
      {state:'working',problem:null})).toContain(String(later.tiles[5]!.stored));
    expect(JSON.stringify(state)).toBe(serialized);
  });
  it('skips all scene nodes for an unrelated warehouse-only trade',()=>{
    const state=newWorkshop();
    const bought=buyTownSupply(state,'core');
    expect(bought).not.toBe(state);
    expect(workshopStageStockPatch(state,bought)).toEqual([]);
  });
  it('falls back to full renderer after assignment, machine movement or shift',()=>{
    const start=newWorkshop();
    const staffed=assignWorker(start,'brook',5);
    expect(workshopStageStockPatch(start,staffed)).toBeNull();
    expect(workshopStageStockPatch(staffed,runShift(staffed))).toBeNull();
    expect(workshopStageStockPatch(start,moveMachine(start,7,6))).toBeNull();
    expect(workshopStageStockPatch(start,placeMachine(start,6,'kiln'))).toBeNull();
  });
  it('rebuilds when a previously blocked physical flow becomes available',()=>{
    let state=moveMachine(newWorkshop(),7,6);
    state=assignWorker(state,'fern',6);
    const next={...state,tiles:state.tiles.map((tile,i)=>
      i===5&&tile?{...tile,stored:1}:tile)};
    expect(workshopStageStockPatch(state,next)).toBeNull();
  });
  it('same snapshot changes nothing',()=>{
    const state=newWorkshop();
    expect(workshopStageStockPatch(state,state)).toEqual([]);
  });
});
