import {describe,expect,it} from 'vitest';
import {readFileSync,statSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {HEROINE_FACE_ART,getCardFace,getApprovedCardCg,getCardPortraitFallback,getCardPortraitKind,getCardArtTier,artworkPixelBudget,getSelectedCardPreview,getCollectibleCardArt,CARD_PREVIEW_PATHS,YUESHA_ECLIPSE_PREVIEW_PATH} from '../src/components/summon/heroine-portrait-assets';
import cgManifest from '../public/art/characters/cg-manifest.json';
import {GACHA_CHARACTERS,GACHA_POOLS} from '../src/lib/summon/gacha-engine';

describe('character portrait visual identity',()=>{
  it('keeps exactly five full-body CG slots gated until reviewed production art exists',()=>{
    const cardIds=['yuesha-eclipse','yuesha-vow','brook-tide','fern-spring','cinder-ember'];
    expect(Object.keys(cgManifest.cards).sort()).toEqual([...cardIds].sort());
    for(const id of cardIds){
      const entry=cgManifest.cards[id as keyof typeof cgManifest.cards];
      expect(['portrait','production']).toContain(entry.status);
      expect(entry.path).toMatch(/^public\/art\/characters\/[a-z-]+\/cg-[a-z-]+\.webp$/);
      if(entry.status==='portrait')expect(getApprovedCardCg(id)).toBeNull();
      else expect(getApprovedCardCg(id)).toMatch(/^\/art\/characters\//);
    }
  });
  it('verifies all five opt-in previews against real image bytes without granting production approval',()=>{
    expect(YUESHA_ECLIPSE_PREVIEW_PATH).toBe('public/art/characters/yuesha/cg-eclipse-candidate.webp');
    expect(Object.keys(CARD_PREVIEW_PATHS).sort()).toEqual(Object.keys(cgManifest.cards).sort());
    for(const id of Object.keys(CARD_PREVIEW_PATHS)){
      const entry=cgManifest.cards[id as keyof typeof cgManifest.cards];
      const expectedPath=CARD_PREVIEW_PATHS[id as keyof typeof CARD_PREVIEW_PATHS];
      expect(entry.status).toBe('portrait');
      expect(entry.previewPath).toBe(expectedPath);
      expect(entry.previewSha256).toMatch(/^[a-f0-9]{64}$/);
      const preview=readFileSync(resolve(expectedPath));
      expect(preview.toString('ascii',0,4)).toBe('RIFF');
      expect(preview.toString('ascii',8,12)).toBe('WEBP');
      expect(statSync(resolve(expectedPath)).size).toBe(preview.length);
      expect(preview.length).toBeGreaterThanOrEqual(100000);
      expect(preview.length).toBeLessThanOrEqual(12*1024*1024);
      expect(createHash('sha256').update(preview).digest('hex')).toBe(entry.previewSha256);
      const url=getSelectedCardPreview(id);
      expect(url).toContain('/art/');
      expect(url).toContain(expectedPath.slice('public/'.length));
      expect(getCardFace(id,'feature')).toBe(url);
      expect(getCardFace(id,'thumbnail')).not.toBe(url);
      expect(getCollectibleCardArt(id)).toBe(url);
      expect(getApprovedCardCg(id)).toBeNull();
      expect(getCardArtTier(id)).toBe('candidate');
      expect(getCardPortraitKind(id)).toBe('candidate-figure');
      expect(getCardPortraitKind(id,'thumbnail')).toBe(
        id.startsWith('yuesha')?'scene-portrait':'face-crop');
    }
    expect(getCollectibleCardArt('no-such-card')).toBeNull();
    expect(getCardArtTier('no-such-card')).toBe('portrait');
  });
  it('keeps each themed pool avatar identical to its real resident identity',()=>{
    const expected={
      'eternal-struggle':'cinder',
      'bond-echo':'fern',
      'memory-remnant':'brook',
    } as const;
    for(const [poolId,resident] of Object.entries(expected)){
      const pool=GACHA_POOLS.find(p=>p.id===poolId);
      expect(pool?.avatar).toBe('/art/characters/'+resident+'/face.webp');
      expect(GACHA_CHARACTERS.find(card=>card.id.startsWith(resident+'-'))?.avatar)
        .toBe(pool?.avatar);
    }
    expect(GACHA_POOLS).toHaveLength(5);
  });
  it('uses the real native-pixel budget at DPR2 or higher without making pixels',()=>{
    expect(artworkPixelBudget(960,1280,1)).toEqual({width:480,height:640});
    expect(artworkPixelBudget(960,1280,2)).toEqual({width:480,height:640});
    expect(artworkPixelBudget(960,1280,3)).toEqual({width:320,height:426});
    expect(artworkPixelBudget(512,512,2)).toEqual({width:256,height:256});
    expect(artworkPixelBudget(0,-1,2)).toEqual({width:1,height:1});
    expect(artworkPixelBudget(512,512,Number.NaN)).toEqual({width:256,height:256});
  });
  it('keeps YueSha fallback identity stable without approving the preview as production',()=>{
    const mythic=getCardFace('yuesha-eclipse');
    const vow=getCardFace('yuesha-vow');
    expect(mythic).toBeTruthy();
    expect(vow).toBeTruthy();
    expect(mythic).not.toEqual(vow);
    expect(getCardPortraitKind('yuesha-eclipse')).toBe('candidate-figure');
    expect(getCardPortraitKind('yuesha-vow')).toBe('candidate-figure');
    expect(getCardPortraitKind('yuesha-eclipse','thumbnail')).toBe('scene-portrait');
    expect(getCardPortraitKind('yuesha-vow','thumbnail')).toBe('scene-portrait');
    expect(getCardPortraitFallback('yuesha-eclipse')).toEqual(HEROINE_FACE_ART.yuesha);
    expect(getCardPortraitFallback('yuesha-vow')).toEqual(HEROINE_FACE_ART.yuesha);
  });
  it('keeps other heroines distinct with unapproved previews classified below production CG',()=>{
    const ids=['brook-tide','fern-spring','cinder-ember'];
    const portraits=ids.map(id=>getCardFace(id));
    expect(portraits.every(Boolean)).toBe(true);
    expect(new Set(portraits)).toHaveProperty('size',3);
    for(const id of ids){
      expect(getCardPortraitKind(id)).toBe('candidate-figure');
      expect(getCardPortraitKind(id,'thumbnail')).toBe('face-crop');
      const resident=id.split('-')[0] as 'brook'|'fern'|'cinder';
      expect(getCardPortraitFallback(id)).toEqual(HEROINE_FACE_ART[resident]);
      // The published catalog must not point to the lobby heroine if the
      // character portrait is reloaded or used by another component.
      const catalog=GACHA_CHARACTERS.find(c=>c.id===id);
      expect(catalog?.avatar).toBe('/art/characters/'+resident+'/face.webp');
    }
    expect(getCardFace('unlisted-character')).toBeNull();
  });
});
