import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {webpDimensions} from '../scripts/prepare-room-background.mjs';
import transition from '../public/art/r12-53-transition-manifest.json';

type Asset={assetId:string;path:string;sha256:string;sizeBytes:number;status:string;width:number;height:number;derivedFrom:string;sourceSha256:string};
const manifest=JSON.parse(readFileSync(
  resolve(process.cwd(),'docs/design/2026-10-30-beauty-beasts/asset-manifest.json'),'utf8'
)) as {productionAssets:Asset[];historicalProductionAssets:Asset[]};

describe('current beauty/beast transition image integrity',()=>{
  it('has real WebP bytes matching the committed manifest and source mapping for every integrated image',()=>{
    expect(manifest.productionAssets).toHaveLength(6);
    expect(manifest.historicalProductionAssets).toHaveLength(6);
    for(const asset of manifest.productionAssets){
      const bytes=readFileSync(resolve(process.cwd(),asset.path));
      expect(bytes.length,asset.path).toBe(asset.sizeBytes);
      expect(bytes.subarray(0,4).toString('ascii'),asset.path).toBe('RIFF');
      expect(bytes.subarray(8,12).toString('ascii'),asset.path).toBe('WEBP');
      const hash=createHash('sha256').update(bytes).digest('hex');
      expect(hash,asset.path).toBe(asset.sha256);
      expect(webpDimensions(bytes)).toMatchObject({width:asset.width,height:asset.height});
      const row=transition.outputs.find(e=>e.output===asset.path);
      expect(row).toMatchObject({source:asset.derivedFrom,sourceSha256:asset.sourceSha256,outputSha256:asset.sha256});
      expect(asset.status).toBe('transition-candidate');
    }
  });
  it('all four active heroine thumbnails have different real image binaries',()=>{
    const facePaths=['public/art/yuesha-avatar-v3.webp',...['brook','fern','cinder'].map(id=>'public/art/characters/'+id+'/face.webp')];
    const faces=manifest.productionAssets.filter(a=>facePaths.includes(a.path));
    expect(faces.map(a=>a.path).sort()).toEqual(facePaths.sort());
    expect(new Set(faces.map(face=>face.sha256)).size).toBe(4);
    expect(manifest.productionAssets.some(a=>a.path.endsWith('/yuesha/face.webp'))).toBe(false);
  });
});
