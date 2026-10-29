export type SceneSpot={left:`${number}%`;top:`${number}%`};
const DEFAULT_SPOTS:readonly SceneSpot[]=[
  {left:'12%',top:'36%'},{left:'28%',top:'68%'},{left:'43%',top:'25%'},
] as const;
/** Anchors belong to identifiable objects, not their array order.
 * Production artwork still requires a separate visual alignment review. */
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
/** Backward-compatible ordered view for previews and existing callers. */
export function roomHotspotPositions(roomId:string):readonly SceneSpot[]{
  return Object.values(ROOM_SPOTS[roomId]??{}).length
    ?Object.values(ROOM_SPOTS[roomId])
    :DEFAULT_SPOTS;
}
