import {describe,it,expect} from 'vitest';
import {newWorkshop,runShift,assignWorker,moveMachine,placeMachine,upgradeMachine} from '../v2/src/workshop-engine';
import {startWorkshopAuto,simulateWorkshopAutoUntil} from '../v2/src/workshop-auto-production';
import {workshopMachineCaption,workshopStageStockPatch,workshopStagePlotPatch} from '../v2/src/workshop-stage-diff';
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
  it('rebuilds only an upgraded machine, retaining every unrelated plot',()=>{
    const before={...newWorkshop(),coins:500,completed:3};
    const after=upgradeMachine(before,5);
    expect(after.tiles[5]?.level).toBe(2);
    expect(workshopStagePlotPatch(before,after)).toEqual({
      rebuildPlots:[5],stockPlots:[],
    });
    expect(workshopStageStockPatch(before,after)).toBeNull();
  });
  it('rebuilds isolated newly placed machines, but not neighboring pipe networks',()=>{
    const before=newWorkshop();
    const far=placeMachine(before,14,'kiln');
    expect(workshopStagePlotPatch(before,far)).toEqual({
      rebuildPlots:[14],stockPlots:[],
    });
    const connected=placeMachine(before,6,'kiln');
    expect(workshopStagePlotPatch(before,connected)).toBeNull();
  });
  it('uses a full redraw if an idle pipe connection changed without any real supply',()=>{
    const before=newWorkshop();
    const after=moveMachine(before,7,6);
    expect(workshopStagePlotPatch(before,after)).toBeNull();
  });
  it('can apply a stock update and a distant isolated machine refresh together',()=>{
    const before={...newWorkshop(),coins:200};
    const after=placeMachine(before,14,'kiln');
    const revised={...after,tiles:after.tiles.map((tile,index)=>
      index===5&&tile?{...tile,stored:4}:tile)};
    expect(workshopStagePlotPatch(before,revised)).toEqual({
      rebuildPlots:[14],stockPlots:[5],
    });
  });
});
