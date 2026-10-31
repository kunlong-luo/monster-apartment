/** Central artwork registry: the character seen in the lobby, welcome,
 * gallery and summon card must keep ONE visual identity.
 *
 * All current assets are reviewed PORTRAITS (environment-backed crops),
 * not full-body CG or transparent animated sprites. Never silently promote
 * a generated concept or a different face into the production registry. */
import yueshaAvatar from '../../../public/art/yuesha-avatar-v3.webp';
import yueshaPortrait from '../../../public/art/yuesha-portrait-v3.webp';
import yueshaBust from '../../../public/art/yuesha-bust-v3.webp';
import brook from '../../../public/art/beauty-beasts/characters/brook/face.webp';
import fern from '../../../public/art/beauty-beasts/characters/fern/face.webp';
import cinder from '../../../public/art/beauty-beasts/characters/cinder/face.webp';
import cgManifest from '../../../public/art/beauty-beasts/characters/cg-manifest.json';
import {siteAssetUrl} from '../../lib/game/site-asset-url';

export const HEROINE_FACE_ART={yuesha:yueshaAvatar,brook,fern,cinder} as const;
export const CARD_FACE_ART={
  'yuesha-eclipse':yueshaPortrait,
  'yuesha-vow':yueshaBust,
  'cinder-ember':cinder,
  'fern-spring':fern,
  'brook-tide':brook,
} as const;
export type CardPortraitKind='scene-portrait'|'face-crop'|'full-body-cg';

/** A production CG is selected ONLY after the matching WebP, human review,
 * provenance and SHA-256 have passed scripts/audit-character-cg.mjs. */
export function getApprovedCardCg(id:string):string|null{
  const entry=cgManifest.cards[id as keyof typeof cgManifest.cards];
  return entry?.status==='production'?siteAssetUrl('/'+entry.path.slice('public/'.length)):null;
}

export function getCardFace(id:string){
  return getApprovedCardCg(id)??CARD_FACE_ART[id as keyof typeof CARD_FACE_ART]??null;
}
/** Use the SAME silver-haired heroine if a scene portrait fails to load;
 * do not fall back to an unrelated old dark-haired concept face. */
export function getCardPortraitFallback(id:string){
  // If a newly approved high-resolution CG fails to load, fall back to the
  // original verified identity rather than a broken image or wrong heroine.
  if(getApprovedCardCg(id))return CARD_FACE_ART[id as keyof typeof CARD_FACE_ART]??null;
  return id==='yuesha-eclipse'||id==='yuesha-vow'?yueshaAvatar:null;
}
export function getCardPortraitKind(id:string):CardPortraitKind{
  if(getApprovedCardCg(id))return 'full-body-cg';
  return id==='yuesha-eclipse'||id==='yuesha-vow'?'scene-portrait':'face-crop';
}
