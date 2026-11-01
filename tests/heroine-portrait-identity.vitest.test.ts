import {describe,expect,it} from 'vitest';
import {readFileSync,statSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {HEROINE_FACE_ART,getCardFace,getApprovedCardCg,getCardPortraitFallback,getCardPortraitKind,getSelectedCardPreview,YUESHA_ECLIPSE_PREVIEW_PATH} from '../src/components/summon/heroine-portrait-assets';
import cgManifest from '../public/art/beauty-beasts/characters/cg-manifest.json';
import {GACHA_CHARACTERS,GACHA_POOLS} from '../src/lib/summon/gacha-engine';

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
  it('keeps the player-selected YueSha preview separate from official CG approval',()=>{
    expect(YUESHA_ECLIPSE_PREVIEW_PATH).toBe('public/art/beauty-beasts/characters/yuesha/cg-eclipse-candidate.webp');
    const preview=readFileSync(resolve(YUESHA_ECLIPSE_PREVIEW_PATH));
    expect(preview.toString('ascii',0,4)).toBe('RIFF');
    expect(preview.toString('ascii',8,12)).toBe('WEBP');
    expect(statSync(resolve(YUESHA_ECLIPSE_PREVIEW_PATH)).size).toBe(456622);
    expect(createHash('sha256').update(preview).digest('hex'))
      .toBe('7f2f34b205b156f08c02be683244175951c45da6cbab1113930bee0ae971b8ae');
    expect(getSelectedCardPreview('yuesha-eclipse'))
      .toMatch(/\/art\/beauty-beasts\/characters\/yuesha\/cg-eclipse-candidate\.webp$/);
    expect(getCardFace('yuesha-eclipse','feature'))
      .toBe(getSelectedCardPreview('yuesha-eclipse'));
    expect(getCardFace('yuesha-eclipse','thumbnail'))
      .not.toBe(getSelectedCardPreview('yuesha-eclipse'));
    expect(getSelectedCardPreview('brook-tide')).toBeNull();
    expect(getSelectedCardPreview('yuesha-vow')).toBeNull();
    // This commit only introduces an opt-in preview resolver. The binary
    // and manifest flag must be installed together; a partial upload
    // must never create a broken asset request in the published game.
    if(cgManifest.cards['yuesha-eclipse'].status==='portrait'
      &&!('previewPath' in cgManifest.cards['yuesha-eclipse'])){
      expect(getSelectedCardPreview('yuesha-eclipse')).toBeNull();
      expect(getCardFace('yuesha-eclipse','feature')).toEqual(getCardFace('yuesha-eclipse','thumbnail'));
    }
    if(cgManifest.cards['yuesha-eclipse'].status==='portrait')
      expect(getApprovedCardCg('yuesha-eclipse')).toBeNull();
  });
  it('keeps each themed pool avatar identical to its real resident identity',()=>{
    const expected={
      'eternal-struggle':'cinder',
      'bond-echo':'fern',
      'memory-remnant':'brook',
    } as const;
    for(const [poolId,resident] of Object.entries(expected)){
      const pool=GACHA_POOLS.find(p=>p.id===poolId);
      expect(pool?.avatar).toBe('/art/beauty-beasts/characters/'+resident+'/face.webp');
      expect(GACHA_CHARACTERS.find(card=>card.id.startsWith(resident+'-'))?.avatar)
        .toBe(pool?.avatar);
    }
    expect(GACHA_POOLS).toHaveLength(5);
  });
  it('uses the established horned, dark-haired YueSha identity across both summons and fallback',()=>{
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
    const portraits=ids.map(id=>getCardFace(id));
    expect(portraits.every(Boolean)).toBe(true);
    expect(new Set(portraits)).toHaveProperty('size',3);
    for(const id of ids){
      expect(getCardPortraitKind(id)).toBe('face-crop');
      const resident=id.split('-')[0] as 'brook'|'fern'|'cinder';
      expect(getCardPortraitFallback(id)).toEqual(HEROINE_FACE_ART[resident]);
      // The published catalog must not point to the lobby heroine if the
      // character portrait is reloaded or used by another component.
      const catalog=GACHA_CHARACTERS.find(c=>c.id===id);
      expect(catalog?.avatar).toBe('/art/beauty-beasts/characters/'+resident+'/face.webp');
    }
    expect(getCardFace('unlisted-character')).toBeNull();
  });
});
