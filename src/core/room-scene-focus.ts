import type {CharacterId,RoomObjectId} from './character-life';
import type {RoomPose} from './room-performance';
import {roomProjectedHotspotPosition} from './room-stage-layout';
import type {RoomStageSize} from './room-stage-layout';

/** Localized lighting follows a real scene prop instead of zooming the painting. */
const COLORS:Readonly<Record<RoomPose,{center:string;edge:string}>>={
  idle:{center:'rgba(243,202,160,.19)',edge:'rgba(231,175,116,.28)'},
  attentive:{center:'rgba(180,224,255,.24)',edge:'rgba(158,204,240,.46)'},
  warm:{center:'rgba(255,211,146,.25)',edge:'rgba(255,200,132,.50)'},
  guarded:{center:'rgba(211,148,244,.24)',edge:'rgba(220,157,240,.48)'},
};
export function roomSceneFocus(id:CharacterId,item:RoomObjectId,pose:RoomPose,stageSize:RoomStageSize|null=null,preview=false){
  const point=roomProjectedHotspotPosition(id,item,stageSize,0,preview);
  const color=COLORS[pose];
  return {
    left:point.left,
    top:point.top,
    tint:color.center,
    edge:color.edge,
    background:'radial-gradient(ellipse 24% 30% at '+point.left+' '+point.top+', '+
      color.center+' 0%, transparent 94%)',
  };
}
