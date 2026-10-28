export type SceneSpot={left:`${number}%`;top:`${number}%`};
const DEFAULT_SPOTS:readonly SceneSpot[]=[
  {left:'12%',top:'36%'},
  {left:'28%',top:'68%'},
  {left:'43%',top:'25%'},
];
const ROOM_SPOTS:Record<string,readonly SceneSpot[]>={
  yuesha:[
    {left:'16%',top:'53%'},{left:'39%',top:'74%'},{left:'47%',top:'34%'},
  ],
  brook:[
    {left:'14%',top:'70%'},{left:'29%',top:'31%'},{left:'43%',top:'55%'},
  ],
  fern:[
    {left:'14%',top:'67%'},{left:'32%',top:'32%'},{left:'45%',top:'72%'},
  ],
  cinder:[
    {left:'15%',top:'65%'},{left:'33%',top:'30%'},{left:'47%',top:'72%'},
  ],
};

export function roomHotspotPositions(roomId:string):readonly SceneSpot[]{
  return ROOM_SPOTS[roomId]??DEFAULT_SPOTS;
}

