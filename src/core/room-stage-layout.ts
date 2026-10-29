import roomArtwork from '../../public/art/rooms/manifest.json';

export type SceneSpot={left:`${number}%`;top:`${number}%`};
export type RoomStageSize={width:number;height:number};
type ArtworkAnchor=readonly [number,number];
type ArtEntry={backgroundStatus:string;objectAnchors?:Record<string,ArtworkAnchor>};

const DEFAULT_SPOTS:readonly SceneSpot[]=[
  {left:'12%',top:'36%'},{left:'28%',top:'68%'},{left:'43%',top:'25%'},
] as const;
/** Existing concept anchors remain stable until a reviewed HD artwork is admitted. */
const ROOM_SPOTS:Readonly<Record<string,Readonly<Record<string,SceneSpot>>>>={
  yuesha:{
    seal:{left:'39%',top:'75%'},
    tea:{left:'13%',top:'76%'},
    ledger:{left:'60%',top:'55%'},
  },
  brook:{
    toolbox:{left:'14%',top:'70%'},
    gauge:{left:'29%',top:'31%'},
    nightbell:{left:'43%',top:'55%'},
  },
  fern:{
    herbarium:{left:'14%',top:'67%'},
    moonflower:{left:'32%',top:'32%'},
    watermap:{left:'45%',top:'72%'},
  },
  cinder:{
    hammer:{left:'15%',top:'65%'},
    blueprint:{left:'33%',top:'30%'},
    keepsake:{left:'47%',top:'72%'},
  },
};
export function roomHotspotPosition(roomId:string,itemId:string,index=0):SceneSpot{
  return ROOM_SPOTS[roomId]?.[itemId]??DEFAULT_SPOTS[index%DEFAULT_SPOTS.length];
}
/** Maps normalized artwork coordinates through object-fit:cover and
 * object-position:center. Lighting and touch targets use identical math. */
export function projectCoverAnchor(anchor:ArtworkAnchor,size:RoomStageSize):SceneSpot{
  if(!(size.width>0&&size.height>0))throw new Error('Invalid room stage size');
  const scale=Math.max(size.width/16,size.height/9);
  const drawnWidth=16*scale,drawnHeight=9*scale;
  const screenX=(size.width-drawnWidth)/2+anchor[0]*drawnWidth;
  const screenY=(size.height-drawnHeight)/2+anchor[1]*drawnHeight;
  const percent=(screen:number,length:number):`${number}%`=>
    `${Math.round(screen/length*10000)/100}%`;
  return {left:percent(screenX,size.width),top:percent(screenY,size.height)};
}
/** True only when an entire 44px interactive marker is visible.
 * Offscreen props stay discoverable via a discreet keyboard/touch fallback,
 * never by lying about where a physical object is painted. */
export function roomSpotIsReachable(spot:SceneSpot,stage:RoomStageSize,markerSize=44):boolean{
  if(!(stage.width>0&&stage.height>0&&markerSize>0))return false;
  const x=Number.parseFloat(spot.left)/100*stage.width;
  const y=Number.parseFloat(spot.top)/100*stage.height;
  const half=markerSize/2;
  return Number.isFinite(x)&&Number.isFinite(y)&&
    x>=half&&x<=stage.width-half&&y>=half&&y<=stage.height-half;
}

/** Production art uses physical object anchors. Concept scenes never inherit
 * the new painting's coordinates and retain their existing hotspot behavior. */
export function roomProjectedHotspotPosition(roomId:string,itemId:string,size:RoomStageSize|null,index=0):SceneSpot{
  const entry=(roomArtwork.rooms as unknown as Record<string,ArtEntry>)[roomId];
  const anchor=entry?.backgroundStatus==='production'?entry.objectAnchors?.[itemId]:undefined;
  return anchor&&size?.width&&size.height
    ?projectCoverAnchor(anchor,size)
    :roomHotspotPosition(roomId,itemId,index);
}
export function roomHotspotPositions(roomId:string):readonly SceneSpot[]{
  return Object.values(ROOM_SPOTS[roomId]??{}).length
    ?Object.values(ROOM_SPOTS[roomId])
    :DEFAULT_SPOTS;
}
