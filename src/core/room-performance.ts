import type {CharacterId,RoomObjectId} from './character-life';

export type RoomPose='idle'|'attentive'|'warm'|'guarded';

/** Performance-only state, never written into player saves. */
const OBJECT_POSES:Readonly<Record<CharacterId,Partial<Record<RoomObjectId,RoomPose>>>>={
  yuesha:{seal:'guarded',tea:'warm',ledger:'attentive'},
  brook:{toolbox:'attentive',gauge:'guarded',nightbell:'warm'},
  fern:{herbarium:'attentive',moonflower:'warm',watermap:'guarded'},
  cinder:{hammer:'warm',blueprint:'attentive',keepsake:'guarded'},
};
export function roomObjectPose(id:CharacterId,item:RoomObjectId):RoomPose{
  return OBJECT_POSES[id][item]??'idle';
}
export function roomTopicPose(id:CharacterId,topicId:string):RoomPose{
  const storyTopics:Readonly<Record<CharacterId,readonly string[]>>={
    yuesha:['contract'],brook:['water'],fern:['moonwater'],cinder:['safe'],
  };
  return storyTopics[id].includes(topicId)?'guarded':'warm';
}

/** Split narrative at sentence boundaries without losing any punctuation.
 * The actor can play each beat automatically; the original prose stays intact. */
export function dialogueBeats(text:string):string[]{
  const source=text.trim();
  if(!source)return [];
  const beats:string[]=[];
  let start=0;
  for(let i=0;i<source.length;i++){
    if(!'。！？!?'.includes(source[i]))continue;
    while(i+1<source.length&&'。！？!?”’'.includes(source[i+1]))i++;
    const beat=source.slice(start,i+1);
    if(beat)beats.push(beat);
    start=i+1;
  }
  const tail=source.slice(start);
  if(tail)beats.push(tail);
  return beats;
}
/** Reading time per beat; no timers, DOM, or economic state in this module. */
export function dialogueBeatDuration(text:string):number{
  return Math.max(1800,Math.min(5200,1900+text.length*95));
}

/** A cinematic line begins in a listening pose and resolves into the
 * topic's established emotional pose. Driven by dialogue progress only:
 * never writes to character-life or workshop saves. */
export function roomDialogueBeatPose(base:RoomPose,beat:number,total:number):RoomPose{
  if(total<=1||beat>=total-1)return base;
  return beat%2===0?'attentive':base;
}

// An ambient cue is deliberately presentational; it never changes save state.
// Story light is absent outside the cinematic, even if an investigation has
// left the resident in an attentive/warm/guarded pose.
export type RoomStoryLightTone='ambient'|'attentive'|'warm'|'guarded';
export function roomStoryLightTone(pose:RoomPose|null):RoomStoryLightTone{
  if(pose==='attentive'||pose==='warm'||pose==='guarded')return pose;
  return 'ambient';
}
