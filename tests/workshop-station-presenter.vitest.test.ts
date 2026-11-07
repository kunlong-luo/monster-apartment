import {describe,expect,it} from 'vitest';
import {newWorkshop} from '../v2/src/workshop-engine';
import {presentWorkshopStations} from '../v2/src/workshop-station-presenter';
describe('shared workshop station presenter',()=>{
  it('finds every machine with its plot identity and does not mutate saves',()=>{
    const world=newWorkshop();
    world.tiles[0]={craft:'well',worker:'brook',stored:6,level:3};
    world.tiles[1]={craft:'well',worker:null,stored:2,level:2};
    world.tiles[2]={craft:'garden',worker:null,stored:0,level:2};
    world.tiles[3]={craft:'garden',worker:'fern',stored:1};
    world.tiles[4]={craft:'kiln',worker:'cinder',stored:0,level:2};
    world.tiles[9]={craft:'kiln',worker:null,stored:3};
    const original=JSON.stringify(world);
    const view=presentWorkshopStations(world,null);
    expect(view.groups.well.instances.map(item=>item.plot)).toEqual([0,1,5]);
    expect(view.groups.garden.instances.map(item=>item.plot)).toEqual([2,3,7]);
    expect(view.groups.kiln.instances.map(item=>item.plot)).toEqual([4,9]);
    expect(view.groups.well.featured?.plot).toBe(0);
    expect(view.groups.garden.featured?.plot).toBe(2);
    expect(view.groups.kiln.featured?.plot).toBe(4);
    expect(view.byPlot[0]?.machine).toBe(world.tiles[0]);
    expect(view.byPlot[5]?.level).toBe(1);
    expect(view.byPlot[6]).toBeNull();
    expect(JSON.stringify(world)).toBe(original);
  });
  it('prioritizes the selected lower-level instance for panoramic art',()=>{
    const world=newWorkshop();
    world.tiles[0]={craft:'well',worker:null,stored:0,level:3};
    const focus=presentWorkshopStations(world,5);
    expect(focus.groups.well.selected?.plot).toBe(5);
    expect(focus.groups.well.featured?.plot).toBe(5);
    expect(focus.groups.well.instances.map(x=>x.level)).toEqual([3,1]);
    expect(presentWorkshopStations(world,7).groups.well.featured?.plot).toBe(0);
    expect(presentWorkshopStations(world,6).groups.well.selected).toBeNull();
  });
  it('reuses actual production signals for Pixi and the panorama',()=>{
    const world=newWorkshop();
    world.tiles[5]!.worker='brook';
    world.tiles[7]!.worker='fern';
    const view=presentWorkshopStations(world,5);
    expect(view.groups.well.instances[0].signal.state).toBe('working');
    expect(view.byPlot[7]?.signal.state).toBe('blocked');
    expect(view.byPlot.filter(Boolean)).toHaveLength(2);
  });
});
