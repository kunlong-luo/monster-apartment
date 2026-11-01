import {describe,it,expect} from 'vitest';
import {existsSync,readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {cardReviewHtml} from '../scripts/prepare-character-cg.mjs';
import {CG_PATHS} from '../scripts/audit-character-cg.mjs';

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
      const character=id.split('-')[0];
      expect(existsSync(resolve('public/art/beauty-beasts/characters',character,'face.webp'))).toBe(true);
    }
  });
  it('will not pretend an unreviewed source has already become full-body production artwork',()=>{
    const manifest=JSON.parse(readFileSync(resolve(
      'public/art/beauty-beasts/characters/cg-manifest.json'),'utf8'));
    expect(Object.keys(manifest.cards).sort()).toEqual(Object.keys(CG_PATHS).sort());
    for(const [id,card] of Object.entries(manifest.cards)){
      const data=card as {path:string;status:string};
      expect(data.path).toBe('public/art/beauty-beasts/characters/'+CG_PATHS[id as keyof typeof CG_PATHS]);
      expect(['portrait','production']).toContain(data.status);
      if(data.status==='portrait')expect(existsSync(resolve(data.path))).toBe(false);
    }
  });
});
