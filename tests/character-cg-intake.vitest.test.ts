import {describe,it,expect} from 'vitest';
import {existsSync,readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {cardReviewHtml} from '../scripts/prepare-character-cg.mjs';
import {CG_PATHS,CG_PREVIEW_PATHS,CG_IDENTITY_REFERENCE_PATHS,auditCharacterCg} from '../scripts/audit-character-cg.mjs';
import {createHash} from 'node:crypto';
import {webpDimensions} from '../scripts/prepare-room-background.mjs';

describe('A05 production CG intake and preview',()=>{
  it('previews exactly the five canonical card identities with a real face reference',()=>{
    expect(Object.keys(CG_PATHS)).toHaveLength(5);
    for(const id of Object.keys(CG_PATHS)){
      const html=cardReviewHtml(id);
      expect(html).toContain('reference-face.webp');
      expect(html).toContain('cg-candidate.webp');
      expect(html).toContain('未批准');
      for(const viewport of ['desktop-1440x900','desktop-1648x928','mobile-390x844'])
        expect(html).toContain('data-viewport="'+viewport+'"');
      expect(html).toContain('object-fit:contain');
      expect(html).toContain('object-fit:cover');
      expect(html).toContain('data-review-mode="full"');
      expect(html).toContain('data-review-mode="gallery-slim"');
      const reference=CG_IDENTITY_REFERENCE_PATHS[id as keyof typeof CG_IDENTITY_REFERENCE_PATHS];
      expect(existsSync(resolve(reference))).toBe(true);
      expect(html).toContain(reference);
    }
  });
  it('pins silver-haired YueSha to her current V3 painting, never retired black-haired face',()=>{
    expect(CG_IDENTITY_REFERENCE_PATHS['yuesha-eclipse']).toBe('public/art/yuesha-portrait-v3.webp');
    expect(CG_IDENTITY_REFERENCE_PATHS['yuesha-vow']).toBe('public/art/yuesha-bust-v3.webp');
    for(const [id,reference] of Object.entries(CG_IDENTITY_REFERENCE_PATHS)){
      expect(existsSync(resolve(reference))).toBe(true);
      if(id.startsWith('yuesha'))expect(reference).not.toMatch(/characters\/yuesha\/face.webp$/);
    }
  });
  it('will not pretend an unreviewed source has already become full-body production artwork',()=>{
    const manifest=JSON.parse(readFileSync(resolve(
      'public/art/beauty-beasts/characters/cg-manifest.json'),'utf8'));
    expect(Object.keys(manifest.cards).sort()).toEqual(Object.keys(CG_PATHS).sort());
    expect(Object.keys(CG_PREVIEW_PATHS).sort()).toEqual(Object.keys(CG_PATHS).sort());
    for(const [id,card] of Object.entries(manifest.cards)){
      const data=card as {path:string;status:string;previewPath?:string;previewSha256?:string};
      expect(data.path).toBe('public/art/beauty-beasts/characters/'+CG_PATHS[id as keyof typeof CG_PATHS]);
      expect(['portrait','production']).toContain(data.status);
      if(data.status==='portrait'){
        expect(existsSync(resolve(data.path))).toBe(false);
        if(data.previewPath){
          expect(data.previewPath).toBe('public/art/beauty-beasts/characters/'+
            CG_PREVIEW_PATHS[id as keyof typeof CG_PREVIEW_PATHS]);
          const buffer=readFileSync(resolve(data.previewPath));
          const dimensions=webpDimensions(buffer);
          expect(dimensions.width).toBeGreaterThanOrEqual(960);
          expect(dimensions.height).toBeGreaterThanOrEqual(1280);
          expect(createHash('sha256').update(buffer).digest('hex')).toBe(data.previewSha256);
        }
      }
    }
  });
  it('passes the canonical audit without promoting preview to production',()=>{
    expect(auditCharacterCg().production).toBe(0);
  });
});
