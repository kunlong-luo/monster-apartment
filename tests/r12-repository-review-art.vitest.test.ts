import {describe,expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
import {webpDimensions} from '../scripts/prepare-room-background.mjs';
import {R12_REPOSITORY_REVIEW_ART}
  from '../src/lib/game/r12-scene-review-art';
import manifest from '../public/art/world-scenes/r12-scene-manifest.json';

describe('R12.32 opt-in Web scene review catalog',()=>{
  it('has six real independent repo WebPs, with verified native review dimensions',()=>{
    const fingerprints=new Set<string>();
    for(const area of ['apartment','orders','warehouse'] as const){
      const pair=R12_REPOSITORY_REVIEW_ART[area];
      for(const [kind,expected] of [
        ['desktop',{width:1672,height:941}],
        ['mobile',{width:941,height:1672}],
      ] as const){
        const item=pair[kind];
        expect(item.path).toMatch(/^\/art\/world-scenes\/review\/2026-11-2[23]\/[-a-z0-9]+\.webp$/);
        const bytes=readFileSync('public'+item.path);
        expect(bytes.byteLength).toBeGreaterThan(100000);
        expect(webpDimensions(bytes)).toEqual(expected);
        expect({width:item.width,height:item.height}).toEqual(expected);
        fingerprints.add(item.path);
      }
      // A one-click layout review never changes the signed promotion gate.
      expect(manifest.scenes[area].status).not.toBe('production');
      expect(manifest.scenes[area].review).toBeNull();
    }
    expect(fingerprints.size).toBe(6);
  });
});
