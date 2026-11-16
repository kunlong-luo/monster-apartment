import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {inspectSourcePack,effectiveCoverScale,reportMarkdown} from '../verify-r12-source-pack.mjs';

const areas=['apartment','orders','warehouse'];
const kinds=['desktop','mobile'];
const checksum=b=>createHash('sha256').update(b).digest('hex');
function pngHeader(width,height,salt){
  const bytes=Buffer.alloc(32);
  Buffer.from([137,80,78,71,13,10,26,10]).copy(bytes,0);
  bytes.write('IHDR',12,'ascii');
  bytes.writeUInt32BE(width,16);
  bytes.writeUInt32BE(height,20);
  bytes.writeUInt32BE(salt,24);
  return bytes;
}
function fixture(mode='low'){
  const pack={schemaVersion:1,status:'review',artApproval:false,scenes:{}};
  const manifest={scenes:{}};
  const images=new Map();
  let n=0;
  for(const area of areas){
    pack.scenes[area]={sources:{}};
    manifest.scenes[area]={status:'review',review:null};
    for(const kind of kinds){
      n++;
      const [w,h]=mode==='high'?
        (kind==='desktop'?[4096,2304]:[1080,1920]):
        (kind==='desktop'?[1672,941]:[941,1672]);
      const path='assets/'+area+'-'+kind+'.png';
      const bytes=pngHeader(w,h,n);
      const hash=checksum(bytes);
      images.set(path,bytes);
      pack.scenes[area].sources[kind]={
        path,pixels:[w,h],sha256:hash,reviewOnly:true,independentComposition:true,
      };
      manifest.scenes[area][kind==='desktop'?'candidate':'mobileCandidate']={
        sourceSHA256:hash,nativeWidth:w,nativeHeight:h,
      };
    }
  }
  const read=path=>{
    const basename=path.replace(/^.*\/assets\//,'assets/');
    const x=images.get(basename);
    if(!x)throw new Error('file not found '+basename);
    return x;
  };
  return {pack,manifest,images,read};
}
const inspect=fixture=>inspectSourcePack({...fixture,sourceDir:'/tmp/example'});

test('cover scale counts actual DPR and the cover crop, not CSS width alone',()=>{
  const scale=effectiveCoverScale(1672,941,{width:1648,height:928,dpr:2});
  assert.ok(scale>1.9 && scale<2.0);
  assert.ok(effectiveCoverScale(1080,1920,{width:390,height:844,dpr:2})<1);
  assert.throws(()=>effectiveCoverScale(0,100,{width:390,height:844,dpr:2}),
    /Invalid positive/);
});

test('real low-res pixel dimensions are reported, never approved',()=>{
  const x=inspect(fixture());
  assert.equal(x.sourceCount,6);
  assert.equal(x.nativePassing,0);
  assert.equal(x.retinaPassing,0);
  assert.equal(x.productionReady,false);
  assert.match(reportMarkdown(x),/需重新绘制原生细节/);
});

test('truly large source masters pass technical pixel checks only',()=>{
  const x=inspect(fixture('high'));
  assert.equal(x.nativePassing,6);
  assert.equal(x.retinaPassing,6);
  assert.equal(x.productionReady,false);
  assert.equal(x.approvedForProduction,false);
});

test('a tampered source is rejected against the real PNG bytes',()=>{
  const f=fixture();
  f.images.get('assets/orders-desktop.png')[31]=77;
  assert.throws(()=>inspect(f),/orders\/desktop: original PNG SHA mismatch/);
});

test('manifest and source package hashes must agree',()=>{
  const f=fixture();
  f.manifest.scenes.warehouse.mobileCandidate.sourceSHA256='0'.repeat(64);
  assert.throws(()=>inspect(f),/package original disagrees with Git manifest/);
});

test('wrong source dimensions are rejected even with a valid hash',()=>{
  const f=fixture();
  f.pack.scenes.orders.sources.mobile.pixels=[1080,1920];
  assert.throws(()=>inspect(f),/claimed native source dimensions do not match PNG IHDR/);
});

test('a source pack cannot self-declare production approval',()=>{
  const f=fixture();
  f.pack.artApproval=true;
  assert.throws(()=>inspect(f),/review-only approval/);
});

test('unexpected paths or duplicated scene artwork are rejected',()=>{
  const f=fixture();
  f.pack.scenes.orders.sources.desktop.path='../secrets.png';
  assert.throws(()=>inspect(f),/expected independently painted review PNG/);
  const repeated=fixture();
  const duplicate=repeated.images.get('assets/apartment-desktop.png');
  repeated.images.set('assets/orders-desktop.png',duplicate);
  repeated.pack.scenes.orders.sources.desktop.sha256=checksum(duplicate);
  repeated.manifest.scenes.orders.candidate.sourceSHA256=checksum(duplicate);
  repeated.pack.scenes.orders.sources.desktop.pixels=[1672,941];
  assert.throws(()=>inspect(repeated),/Reused original bytes across scenes/);
});
