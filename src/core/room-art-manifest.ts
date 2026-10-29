import type {CharacterId} from './character-life';
import input from '../../public/art/rooms/manifest.json';

export type RoomArtStatus='concept'|'production';
export type RoomComposition='embedded-resident'|'architecture-crop'|'layered-concept'|'separated';
export type RoomArtInfo={
  id:CharacterId;
  backgroundStatus:RoomArtStatus;
  residentStatus:RoomArtStatus;
  composition:RoomComposition;
  conceptPreview:string;
  layout:'concept'|'reviewed';
  backgroundLayer:'static-painted';
  residentLayer:'separate-actor';
  objectLayer:'interactive-hotspots';
  productionAssets:{background:string;residentFrames:readonly string[]};
};
function info(id:CharacterId):RoomArtInfo{
  const source=input.rooms[id];
  return {
    id,
    backgroundStatus:source.status as RoomArtStatus,
    residentStatus:source.status as RoomArtStatus,
    composition:source.composition as RoomComposition,
    conceptPreview:source.conceptPreview,
    layout:source.layout as 'concept'|'reviewed',
    backgroundLayer:'static-painted',
    residentLayer:'separate-actor',
    objectLayer:'interactive-hotspots',
    productionAssets:{
      background:source.background,
      residentFrames:source.poses,
    },
  };
}
export const ROOM_ART_MANIFEST={
  yuesha:info('yuesha'),
  brook:info('brook'),
  fern:info('fern'),
  cinder:info('cinder'),
} satisfies Readonly<Record<CharacterId,RoomArtInfo>>;

/** Paths are used only when art status=production AND the audit has passed.
 * Next config supplies the prefix on static GitHub Pages exports. */
export function roomPublicAssetPath(path:string):string{
  if(!path.startsWith('public/art/rooms/')||path.includes('..'))
    throw new Error('Unsafe room art path');
  return (process.env.NEXT_PUBLIC_GAME_BASE_PATH??'')+'/'+path.slice('public/'.length);
}
