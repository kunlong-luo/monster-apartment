import {describe,expect,it} from 'vitest';
import {existsSync,readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {webpDimensions} from '../scripts/prepare-room-background.mjs';
import manifest from '../public/art/r12-53-transition-manifest.json';
import catalog from '../art-sources/source-catalog.json';
import cg from '../public/art/characters/cg-manifest.json';
import roomReview from '../public/art/rooms/r12-57-review-manifest.json';

const sha256=(data:Buffer)=>createHash('sha256').update(data).digest('hex');
const blobSha=(data:Buffer)=>createHash('sha1').update('blob '+data.length+'\0').update(data).digest('hex');
const p='public/art/';
const c=p+'characters/';
const a='art-sources/';
const cardSources={
  'yuesha-eclipse':a+'characters/yuesha/cg/eclipse.png',
  'yuesha-vow':a+'characters/yuesha/cg/vow.png',
  'brook-tide':a+'characters/brook/sprites/standing.png',
  'fern-spring':a+'characters/fern/cg/spring.png',
  'cinder-ember':a+'characters/cinder/sprites/standing.png',
} as const;

describe('R12.53 source-bound transition artwork',()=>{
  it('binds every R12.53 original to the measured PNG and catalog hash',()=>{
    expect(manifest.sourceCommit).toBe(catalog.sourceCommit);
    expect(manifest.sourceInventory).toHaveLength(33);
    expect(new Set(manifest.sourceInventory.map(row=>row.path)).size).toBe(33);
    const catalogPaths=new Set(catalog.assets.map(row=>row.path));
    for(const row of manifest.sourceInventory){
      expect(catalogPaths.has(row.path)).toBe(true);
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
  it('upgrades Brook Tide and Cinder Ember previews to clean 1086x1448 CG candidates while preserving room standing layers',()=>{
    for(const [id,variant,cleanSource] of [
      ['brook','tide',a+'characters/brook/cg/tide-clean-v2.png'],
      ['cinder','ember',a+'characters/cinder/cg/ember-clean-v2.png'],
    ] as const){
      const card=cg.cards[id+'-'+variant as keyof typeof cg.cards];
      const room=roomReview.outputs.find(e=>e.resident===id&&e.kind==='standing')!;
      const sourceEntry=catalog.assets.find(e=>e.path===cleanSource)!;
      const candidatePath=c+id+'/cg-'+variant+'-candidate.webp';
      expect(card.previewPath).toBe(candidatePath);
      expect(card.previewSourceKind).toBe('illustrated-cg-candidate');
      expect(card.status).toBe('portrait');
      expect(existsSync(candidatePath)).toBe(true);
      const candidateBytes=readFileSync(candidatePath);
      expect(sha256(candidateBytes)).toBe(card.previewSha256);
      expect(webpDimensions(candidateBytes)).toMatchObject({width:1086,height:1448,alpha:false});
      expect(sourceEntry.status).toBe('review');
      const sourceBytes=readFileSync(cleanSource);
      expect(sourceBytes.length).toBe(sourceEntry.bytes);
      expect(blobSha(sourceBytes)).toBe(sourceEntry.gitBlobSha);
      expect([sourceBytes.readUInt32BE(16),sourceBytes.readUInt32BE(20)]).toEqual([1086,1448]);
      expect(room.output).toBe('public/art/rooms/'+id+'/scenic/standing.webp');
      expect(existsSync(room.output)).toBe(true);
    }
  });
  it('registers the uploaded S02 desktop v2 as a below-floor research original, not production',()=>{
    const path=a+'scenes/apartment/desktop-candidate-v2.png';
    const entries=catalog.assets.filter(e=>e.path===path);
    expect(entries).toHaveLength(1);
    expect(entries[0].status).toBe('rework');
    const bytes=readFileSync(path);
    expect(bytes.length).toBe(entries[0].bytes);
    expect(blobSha(bytes)).toBe(entries[0].gitBlobSha);
    expect(sha256(bytes)).toBe('c59fcb3fcf96faa0eb23a3051015090592c104412b8a049cfd0303287c0d384e');
    expect(bytes.subarray(0,8).toString('hex')).toBe('89504e470d0a1a0a');
    expect([bytes.readUInt32BE(16),bytes.readUInt32BE(20)]).toEqual([1672,941]);
    expect(manifest.outputs.some(e=>e.source===path)).toBe(false);
  });
  it('checks all fifteen actual WebPs, independent screens, native geometry and exact source mapping',()=>{
    const expected:Record<string,string>={
      [p+'characters/yuesha/yuesha-avatar-v3.webp']:a+'characters/yuesha/identity/front.png',
      [p+'characters/yuesha/yuesha-bust-v3.webp']:a+'characters/yuesha/identity/front.png',
      [p+'characters/yuesha/yuesha-portrait-v3.webp']:a+'characters/yuesha/identity/front.png',
      ...Object.fromEntries(['brook','fern','cinder'].map(id=>[c+id+'/face.webp',a+'characters/'+id+'/identity/front.png'])),
      [p+'covers/world-cover.webp']:a+'covers/welcome-desktop.png',
      [p+'covers/world-cover-mobile.webp']:a+'covers/welcome-mobile.png',
      [p+'world-scenes/lobby/lobby-hero-v4.webp']:a+'scenes/lobby/desktop.png',
      [p+'world-scenes/lobby/lobby-hero-v4-mobile.webp']:a+'scenes/lobby/mobile.png',
      [c+'yuesha/cg-eclipse-candidate.webp']:cardSources['yuesha-eclipse'],
      [c+'yuesha/cg-vow-candidate.webp']:cardSources['yuesha-vow'],
      [c+'fern/cg-spring-candidate.webp']:cardSources['fern-spring'],
      [p+'rooms/brook/scenic/standing.webp']:cardSources['brook-tide'],
      [p+'rooms/cinder/scenic/standing.webp']:cardSources['cinder-ember'],
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
      expect(entry.status).toBe('portrait');
      expect(entry.previewSourceKind).toBe('illustrated-cg-candidate');
      const bytes=readFileSync(entry.previewPath!);
      expect(sha256(bytes)).toBe(entry.previewSha256);
      expect(webpDimensions(bytes)).toMatchObject({width:1086,height:1448,alpha:false});
      if(id!=='brook-tide'&&id!=='cinder-ember'){
        const row=manifest.outputs.find(e=>e.output===entry.previewPath)!;
        expect(row.alpha).toBe(false);
      }
    }
  });
});
