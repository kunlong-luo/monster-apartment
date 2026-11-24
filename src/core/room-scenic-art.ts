import type {CharacterId} from './character-life';
import {roomPublicAssetPath} from './room-art-manifest';

/** A verified, non-interactive viewing layer, not the approved story background
 * or four-pose production manifest. Reuse the exact eight reviewed bytes. */
export function roomScenicArt(id:CharacterId){
  const root='public/art/rooms/'+id+'/review/';
  return {background:roomPublicAssetPath(root+'background-candidate.webp'),
    standing:roomPublicAssetPath(root+'standing-candidate.webp')};
}
