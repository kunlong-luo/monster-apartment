import type {CharacterId} from './character-life';

/** Current shipped art only. "concept" is a deliberately honest status:
 * production background-only CG, expression frames and blink sprites are not
 * yet authored. Never fetch speculative image paths into GitHub Pages. */
export type RoomArtStatus='concept'|'production';
export type RoomArtInfo={
  id:CharacterId;
  backgroundStatus:RoomArtStatus;
  residentStatus:RoomArtStatus;
  backgroundLayer:'static-painted';
  residentLayer:'separate-actor';
  objectLayer:'interactive-hotspots';
  productionAssets:{
    background:string;
    residentFrames:readonly string[];
  };
};
const FRAME_SET=['idle.webp','attentive.webp','warm.webp','guarded.webp'] as const;
function roomArtInfo(id:CharacterId):RoomArtInfo{
  return {
    id,backgroundStatus:'concept',residentStatus:'concept',
    backgroundLayer:'static-painted',residentLayer:'separate-actor',objectLayer:'interactive-hotspots',
    productionAssets:{
      background:'public/art/rooms/'+id+'/background.webp',
      residentFrames:FRAME_SET.map(frame=>'public/art/rooms/'+id+'/poses/'+frame),
    },
  };
}
export const ROOM_ART_MANIFEST={
  yuesha:roomArtInfo('yuesha'),
  brook:roomArtInfo('brook'),
  fern:roomArtInfo('fern'),
  cinder:roomArtInfo('cinder'),
} satisfies Readonly<Record<CharacterId,RoomArtInfo>>;
