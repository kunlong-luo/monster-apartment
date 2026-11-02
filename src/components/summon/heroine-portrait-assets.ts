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

/** One immutable asset slot for each contract; adding a new image must be
 * opt-in through the manifest AND match the correct resident folder.
 * Unapproved candidates can never bypass the production provenance gate. */
export const CARD_PREVIEW_PATHS={
  'yuesha-eclipse':'public/art/beauty-beasts/characters/yuesha/cg-eclipse-candidate.webp',
  'yuesha-vow':'public/art/beauty-beasts/characters/yuesha/cg-vow-candidate.webp',
  'brook-tide':'public/art/beauty-beasts/characters/brook/cg-tide-candidate.webp',
  'fern-spring':'public/art/beauty-beasts/characters/fern/cg-spring-candidate.webp',
  'cinder-ember':'public/art/beauty-beasts/characters/cinder/cg-ember-candidate.webp',
} as const;
export type ContractCardId=keyof typeof CARD_PREVIEW_PATHS;
export const YUESHA_ECLIPSE_PREVIEW_PATH=CARD_PREVIEW_PATHS['yuesha-eclipse'];

export function getSelectedCardPreview(id:string):string|null{
  if(!Object.hasOwn(CARD_PREVIEW_PATHS,id))return null;
  const entry=(cgManifest.cards as Record<string,{
    status:string;path:string;previewPath?:string
  }>)[id];
  const expected=CARD_PREVIEW_PATHS[id as ContractCardId];
  return entry?.status==='portrait'&&entry.previewPath===expected
    ?siteAssetUrl('/'+expected.slice('public/'.length)):null;
}

/** Collectors can admire either an explicitly approved preview or the
 * fully audited production CG. Promotion must not hide the artwork button. */
export function getCollectibleCardArt(id:string):string|null{
  return getApprovedCardCg(id)??getSelectedCardPreview(id);
}

/** A production CG is selected ONLY after the matching WebP, human review,
 * provenance and SHA-256 have passed scripts/audit-character-cg.mjs. */
export function getApprovedCardCg(id:string):string|null{
  const entry=cgManifest.cards[id as keyof typeof cgManifest.cards];
  return entry?.status==='production'?siteAssetUrl('/'+entry.path.slice('public/'.length)):null;
}

export function getCardFace(id:string,view:'feature'|'thumbnail'='feature'){
  // Small ten-pull thumbnails prioritize the same resident's detailed face.
  // Feature cards receive the widest approved or user-selected illustration.
  return (view==='feature'?getCollectibleCardArt(id):null)
    ??CARD_FACE_ART[id as keyof typeof CARD_FACE_ART]??null;
}
/** Failed preview images fall back to the established matching resident.
 * The player-selected dark-haired, horned YueSha is not a different character. */
export function getCardPortraitFallback(id:string){
  // If a newly approved high-resolution CG fails to load, fall back to the
  // original verified identity rather than a broken image or wrong heroine.
  if(getApprovedCardCg(id))return CARD_FACE_ART[id as keyof typeof CARD_FACE_ART]??null;
  if(id==='yuesha-eclipse'||id==='yuesha-vow')return yueshaAvatar;
  // Never replace a failed resident portrait with the unrelated lobby heroine.
  // If the resident image is temporarily unavailable, retain the same identity
  // through the retry/fallback path and the card's accessible name.
  if(id==='brook-tide')return brook;
  if(id==='fern-spring')return fern;
  if(id==='cinder-ember')return cinder;
  return null;
}
export function getCardPortraitKind(id:string):CardPortraitKind{
  if(getApprovedCardCg(id))return 'full-body-cg';
  return id==='yuesha-eclipse'||id==='yuesha-vow'?'scene-portrait':'face-crop';
}
