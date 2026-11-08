import {describe,it,expect} from 'vitest';
import {newWorkshop,validWorkshop,BOARD_SIZE} from '../v2/src/workshop-engine';
import {workshopBenchmarkFixture,WORKSHOP_BENCHMARK_PROFILES} from '../v2/src/workshop-benchmark-fixtures';

describe('R09 repeatable workshop browser performance seeds',()=>{
  it('generates 0, 2, 15-machine V2 saves that pass real save validation',()=>{
    const expected=[0,2,15];
    WORKSHOP_BENCHMARK_PROFILES.forEach((profile,index)=>{
      const world=workshopBenchmarkFixture(profile);
      expect(validWorkshop(world)).toBe(true);
      expect(world.tiles).toHaveLength(BOARD_SIZE);
      expect(world.tiles.filter(Boolean)).toHaveLength(expected[index]);
      expect(world.auto).toBeUndefined();
      expect(world.patron).toBeNull();
      expect(world.order).toEqual(newWorkshop().order);
    });
  });
  it('has exactly the three unique workers in the dense fixture',()=>{
    const dense=workshopBenchmarkFixture('dense');
    expect(dense.tiles.flatMap(tile=>tile?.worker?[tile.worker]:[]).sort())
      .toEqual(['brook','cinder','fern']);
    expect(dense.tiles.map(tile=>tile?.craft)).toEqual(
      Array.from({length:BOARD_SIZE},(_,index)=>
        (['well','garden','kiln'] as const)[index%3])
    );
  });
  it('is deterministic and returns independent mutable objects',()=>{
    for(const profile of WORKSHOP_BENCHMARK_PROFILES){
      const before=workshopBenchmarkFixture(profile);
      const after=workshopBenchmarkFixture(profile);
      expect(before).toEqual(after);
      expect(before).not.toBe(after);
      before.coins=0;
      expect(after.coins).toBe(100);
    }
  });
});
