import {BOARD_SIZE,newWorkshop,validWorkshop} from './workshop-engine';
import type {WorkshopState,Machine} from './workshop-engine';

/** Read-only browser benchmark seeds; never added to game save migrations.
 * Three deterministic geometry densities, no paid progression/auto clock. */
export const WORKSHOP_BENCHMARK_PROFILES=['empty','starter','dense'] as const;
export type WorkshopBenchmarkProfile=typeof WORKSHOP_BENCHMARK_PROFILES[number];

export function workshopBenchmarkFixture(profile:WorkshopBenchmarkProfile):WorkshopState{
  const world=newWorkshop();
  if(profile==='starter')return world;
  const tiles:(Machine|null)[]=Array.from({length:BOARD_SIZE},(_,index)=>{
    if(profile==='empty')return null;
    const craft=(['well','garden','kiln'] as const)[index%3];
    const worker=index===6?'brook':index===7?'fern':
      index===8?'cinder':null;
    return {craft,worker,stored:0};
  });
  const result:WorkshopState={...world,tiles};
  if(!validWorkshop(result))throw Error('Invalid workshop benchmark fixture: '+profile);
  return result;
}
