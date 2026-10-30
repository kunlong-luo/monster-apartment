import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';

type Asset={path:string;sha256:string;sizeBytes:number;status:string};
const manifest=JSON.parse(readFileSync(
  resolve(process.cwd(),'docs/design/2026-10-30-beauty-beasts/asset-manifest.json'),'utf8'
)) as {productionAssets:Asset[]};

describe('production beauty/beast image integrity',()=>{
  it('has real WebP bytes matching the committed manifest for every integrated image',()=>{
    expect(manifest.productionAssets).toHaveLength(6);
    for(const asset of manifest.productionAssets){
      const bytes=readFileSync(resolve(process.cwd(),asset.path));
      expect(bytes.length,asset.path).toBe(asset.sizeBytes);
      expect(bytes.subarray(0,4).toString('ascii'),asset.path).toBe('RIFF');
      expect(bytes.subarray(8,12).toString('ascii'),asset.path).toBe('WEBP');
      const hash=createHash('sha256').update(bytes).digest('hex');
      expect(hash,asset.path).toBe(asset.sha256);
    }
  });
  it('all four heroines have different real image binaries, with two Yuesha cards sharing her identity',()=>{
    const faces=manifest.productionAssets.filter(a=>/\/characters\/[^/]+\/face\.webp$/.test(a.path));
    expect(faces).toHaveLength(4);
    expect(new Set(faces.map(face=>face.sha256)).size).toBe(4);
    for(const id of ['yuesha','brook','fern','cinder'])
      expect(faces.some(x=>x.path.includes('/'+id+'/face.webp'))).toBe(true);
  });
});
