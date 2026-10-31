import {describe,expect,it} from 'vitest';
import {HEROINE_FACE_ART,getCardFace,getApprovedCardCg,getCardPortraitFallback,getCardPortraitKind} from '../src/components/summon/heroine-portrait-assets';
import cgManifest from '../public/art/beauty-beasts/characters/cg-manifest.json';

describe('character portrait visual identity',()=>{
  it('keeps exactly five full-body CG slots gated until reviewed production art exists',()=>{
    const cardIds=['yuesha-eclipse','yuesha-vow','brook-tide','fern-spring','cinder-ember'];
    expect(Object.keys(cgManifest.cards).sort()).toEqual([...cardIds].sort());
    for(const id of cardIds){
      const entry=cgManifest.cards[id as keyof typeof cgManifest.cards];
      expect(['portrait','production']).toContain(entry.status);
      expect(entry.path).toMatch(/^public\/art\/beauty-beasts\/characters\/[a-z-]+\/cg-[a-z-]+\.webp$/);
      if(entry.status==='portrait')expect(getApprovedCardCg(id)).toBeNull();
      else expect(getApprovedCardCg(id)).toMatch(/^\/art\/beauty-beasts\/characters\//);
    }
  });
  it('uses consistent V3 silver-haired Yuesha across both summons and fallback',()=>{
    const mythic=getCardFace('yuesha-eclipse');
    const vow=getCardFace('yuesha-vow');
    expect(mythic).toBeTruthy();
    expect(vow).toBeTruthy();
    expect(mythic).not.toEqual(vow);
    expect(getCardPortraitKind('yuesha-eclipse')).toBe('scene-portrait');
    expect(getCardPortraitKind('yuesha-vow')).toBe('scene-portrait');
    expect(getCardPortraitFallback('yuesha-eclipse')).toEqual(HEROINE_FACE_ART.yuesha);
    expect(getCardPortraitFallback('yuesha-vow')).toEqual(HEROINE_FACE_ART.yuesha);
  });
  it('keeps the other three heroines distinct and honestly classed as face crops',()=>{
    const ids=['brook-tide','fern-spring','cinder-ember'];
    const portraits=ids.map(getCardFace);
    expect(portraits.every(Boolean)).toBe(true);
    expect(new Set(portraits)).toHaveProperty('size',3);
    for(const id of ids){
      expect(getCardPortraitKind(id)).toBe('face-crop');
      expect(getCardPortraitFallback(id)).toBeNull();
    }
    expect(getCardFace('unlisted-character')).toBeNull();
  });
});
