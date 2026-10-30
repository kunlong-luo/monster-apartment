/** Approved-for-thumbnail production crops of the four DISTINCT heroine
 * portraits. These are NOT full-body sprite sheets or final lock-face CG. */
import yuesha from '../../../public/art/beauty-beasts/characters/yuesha/face.webp';
import brook from '../../../public/art/beauty-beasts/characters/brook/face.webp';
import fern from '../../../public/art/beauty-beasts/characters/fern/face.webp';
import cinder from '../../../public/art/beauty-beasts/characters/cinder/face.webp';

export const HEROINE_FACE_ART={yuesha,brook,fern,cinder} as const;
export const CARD_FACE_ART={
  'yuesha-eclipse':yuesha,
  'yuesha-vow':yuesha,
  'cinder-ember':cinder,
  'fern-spring':fern,
  'brook-tide':brook,
} as const;
export function getCardFace(id:string){
  return CARD_FACE_ART[id as keyof typeof CARD_FACE_ART]??null;
}
