import { COZY_RESIDENTS, residentActivity } from '../core/cozy-engine';
import type { HomeType, ResidentActivity } from '../core/cozy-engine';
import type { SpiritId } from '../core/spirit-collection';

export type ResidentPose = {
  left:number; bottom:number; face:'left'|'right'; frame:0|1|2|3;
  activity:ResidentActivity;
};

/** Choreography is derived exclusively from the saved clock, identity and room.
 * It never advances simulation state, rolls randomness or writes to the save.
 * Horizontal bounds leave space for oversized character silhouettes and doors. */
export function cozyResidentPose(tick:number,id:SpiritId,room:HomeType):ResidentPose {
  const identity=Math.max(0,COZY_RESIDENTS.findIndex(resident=>resident.id===id));
  const cycle=Math.max(0,Math.floor(tick));
  const activity:ResidentActivity=residentActivity(cycle,id);
  const frame=((cycle+identity*2)%4) as 0|1|2|3;
  if(activity==='sleep'){
    const places:Record<HomeType,[number,number]>={
      nest:[23,1],bath:[34,2],workshop:[31,1],greenhouse:[31,3],
    };
    return {left:places[room][0],bottom:places[room][1],face:'right',frame,activity};
  }
  if(activity==='work'){
    const stations:Record<HomeType,[number,number]>={
      nest:[31,3],bath:[28,2],workshop:[32,3],greenhouse:[28,4],
    };
    return {left:stations[room][0]+(frame%2?2:0),
      bottom:stations[room][1],face:room==='greenhouse'?'left':'right',
      frame,activity};
  }
  if(activity==='wander'){
    const footsteps=[15,30,47,30] as const;
    return {left:footsteps[frame],bottom:2,face:frame===3?'left':'right',
      frame,activity};
  }
  return {left:53,bottom:2,face:'right',frame,activity};
}

/** A genuine incoming visit is staged beside the host, not as a fixed badge. */
export function cozyGuestPose(tick:number,visitor:SpiritId,host:SpiritId){
  const visitorIndex=Math.max(0,COZY_RESIDENTS.findIndex(r=>r.id===visitor));
  const hostIndex=Math.max(0,COZY_RESIDENTS.findIndex(r=>r.id===host));
  const left=hostIndex%2===0?60:52;
  return {
    left,
    bottom:3,
    face:hostIndex%2===0?'left' as const:'right' as const,
    frame:((Math.max(0,Math.floor(tick))+visitorIndex)%4) as 0|1|2|3,
  };
}
