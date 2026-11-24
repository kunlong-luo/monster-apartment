import {describe,expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {webpDimensions} from '../scripts/prepare-room-background.mjs';
import manifest from '../public/art/r12-53-transition-manifest.json';
import catalog from '../art-sources/source-catalog.json';
import cg from '../public/art/beauty-beasts/characters/cg-manifest.json';

const sha256=(data:Buffer)=>createHash('sha256').update(data).digest('hex');
const blobSha=(data:Buffer)=>createHash('sha1').update('blob '+data.length+'\0').update(data).digest('hex');
const p='public/art/';
const c=p+'beauty-beasts/characters/';
const a='art-sources/';
const cardSources={
  'yuesha-eclipse':a+'characters/yuesha/cg/eclipse.png',
  'yuesha-vow':a+'characters/yuesha/cg/vow.png',
  'brook-tide':a+'characters/brook/sprites/standing.png',
  'fern-spring':a+'characters/fern/cg/spring.png',
  'cinder-ember':a+'characters/cinder/sprites/standing.png',
} as const;

describe('R12.53 source-bound transition artwork',()=>{
  it('binds every uploaded original to the measured PNG and catalog hash',()=>{
    expect(manifest.sourceCommit).toBe(catalog.sourceCommit);
    expect(manifest.sourceInventory).toHaveLength(33);
    expect(new Set(manifest.sourceInventory.map(row=>row.path)).size).toBe(33);
    expect(manifest.sourceInventory.map(row=>row.path).sort()).toEqual(catalog.assets.map(row=>row.path).sort());
    for(const row of manifest.sourceInventory){
      const entry=catalog.assets.find(e=>e.path===row.path)!;
      expect(row.gitBlobSha).toBe(entry.gitBlobSha);
      expect(row.status).toBe(entry.status);
      const bytes=readFileSync(row.path);
      expect(bytes.length).toBe(entry.bytes);
      expect(blobSha(bytes)).toBe(row.gitBlobSha);
      expect(sha256(bytes)).toBe(row.sourceSha256);
      expect(bytes.subarray(0,8).toString('hex')).toBe('89504e470d0a1a0a');
      expect([bytes.readUInt32BE(16),bytes.readUInt32BE(20)]).toEqual(row.size);
    }
  });
  it('checks all fifteen actual WebPs, independent screens, native geometry and exact source mapping',()=>{
    const expected:Record<string,string>={
      [p+'yuesha-avatar-v3.webp']:a+'characters/yuesha/identity/front.png',
      [p+'yuesha-bust-v3.webp']:a+'characters/yuesha/identity/front.png',
      [p+'yuesha-portrait-v3.webp']:a+'characters/yuesha/identity/front.png',
      ...Object.fromEntries(['brook','fern','cinder'].map(id=>[c+id+'/face.webp',a+'characters/'+id+'/identity/front.png'])),
      [p+'beauty-beasts/cover/world-cover.webp']:a+'covers/welcome-desktop.png',
      [p+'beauty-beasts/cover/world-cover-mobile.webp']:a+'covers/welcome-mobile.png',
      [p+'lobby-hero-v4.webp']:a+'scenes/lobby/desktop.png',
      [p+'lobby-hero-v4-mobile.webp']:a+'scenes/lobby/mobile.png',
      ...Object.fromEntries(Object.entries(cardSources).map(([id,path])=>[cg.cards[id as keyof typeof cg.cards].previewPath,path])),
    };
    expect(manifest.status).toBe('transition-candidate-not-production-cg');
    expect(manifest.humanVisualReview).toBe(false);
    expect(manifest.outputs).toHaveLength(15);
    expect(manifest.outputs.map(row=>row.output).sort()).toEqual(Object.keys(expected).sort());
    expect(new Set(manifest.outputs.map(row=>row.outputSha256)).size).toBe(15);
    for(const row of manifest.outputs){
      expect(row.source).toBe(expected[row.output]);
      const source=manifest.sourceInventory.find(e=>e.path===row.source)!;
      expect(source.status).toBe('review');
      expect(row.sourceSha256).toBe(source.sourceSha256);
      expect(row.sourceGitBlobSha).toBe(source.gitBlobSha);
      expect(row.sourceSize).toEqual(source.size);
      const bytes=readFileSync(row.output);
      expect(bytes.length).toBe(row.bytes);
      expect(sha256(bytes)).toBe(row.outputSha256);
      const dims=webpDimensions(bytes);
      expect([dims.width,dims.height]).toEqual(row.size);
      if(row.crop){
        const [x,y,r,b]=row.crop;
        expect(x).toBeGreaterThanOrEqual(0);
        expect(y).toBeGreaterThanOrEqual(0);
        expect(r).toBeLessThanOrEqual(source.size[0]);
        expect(b).toBeLessThanOrEqual(source.size[1]);
        expect(row.size).toEqual([r-x,b-y]);
      }else expect(row.size).toEqual(source.size);
    }
    for(const [id,entry] of Object.entries(cg.cards)){
      const row=manifest.outputs.find(e=>e.output===entry.previewPath)!;
      expect(entry.status).toBe('portrait');
      expect(entry.previewSha256).toBe(row.outputSha256);
      expect(entry.previewSourceKind).toBe(row.kind);
      expect(row.alpha).toBe(id==='brook-tide'||id==='cinder-ember');
    }
  });
});
