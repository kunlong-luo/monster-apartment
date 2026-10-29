import {readFileSync,existsSync} from 'node:fs';
import {resolve,dirname,join} from 'node:path';
import {createHash} from 'node:crypto';

const root=resolve(import.meta.dirname,'..');
const manifest=JSON.parse(readFileSync(join(root,'public/art/rooms/manifest.json'),'utf8'));
const ids=['yuesha','brook','fern','cinder'];
const poses=['idle','attentive','warm','guarded'];
const statuses=['concept','production'];
function assert(ok,message){if(!ok)throw new Error('Room art audit: '+message);}
function checkWebP(relative,{alpha,minW,minH}){
  assert(!relative.includes('..')&&relative.startsWith('public/art/rooms/'),'unsafe art path '+relative);
  const path=join(root,relative);
  assert(existsSync(path),'missing '+relative);
  const bytes=readFileSync(path);
  assert(bytes.byteLength>=100000,'image too small '+relative);
  assert(bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP','not WebP '+relative);
  const kind=bytes.toString('ascii',12,16);
  let width=0,height=0,transparent=false;
  if(kind==='VP8X'){
    width=1+bytes.readUIntLE(24,3);height=1+bytes.readUIntLE(27,3);
    transparent=(bytes[20]&16)!==0;
  }else if(kind==='VP8 '){
    const pos=bytes.indexOf(Buffer.from([0x9d,0x01,0x2a]),20);
    assert(pos>=0,'invalid VP8 header '+relative);
    width=bytes.readUInt16LE(pos+3)&0x3fff;height=bytes.readUInt16LE(pos+5)&0x3fff;
  }else if(kind==='VP8L'){
    assert(bytes[20]===0x2f,'invalid VP8L signature '+relative);
    const b1=bytes[21],b2=bytes[22],b3=bytes[23],b4=bytes[24];
    width=1+(((b2&0x3f)<<8)|b1);
    height=1+(((b4&0xf)<<10)|(b3<<2)|((b2&0xc0)>>6));
    transparent=(b4&0x10)!==0;
  }else throw new Error('Room art audit: unsupported WebP chunk '+kind+' in '+relative);
  assert(width>=minW&&height>=minH,'resolution below '+minW+'x'+minH+' in '+relative);
  if(alpha)assert(transparent,'pose requires alpha '+relative);
}
assert(manifest.version===2,'expected staged room art manifest v2');
assert(Object.keys(manifest.rooms??{}).length===4,'unexpected room entry count');
let backgrounds=0,residents=0;
for(const id of ids){
  const room=manifest.rooms[id];
  assert(room,'missing '+id);
  assert(statuses.includes(room.backgroundStatus),'invalid background status '+id);
  assert(statuses.includes(room.residentStatus),'invalid resident status '+id);
  assert(!Object.hasOwn(room,'status'),'obsolete combined status '+id);
  assert(['concept','reviewed'].includes(room.layout),'invalid layout '+id);
  const bgProduction=room.backgroundStatus==='production';
  const actorProduction=room.residentStatus==='production';
  assert(room.composition===(bgProduction&&actorProduction?'separated':'layered-concept'),
    'composition must reflect layer readiness '+id);
  assert(room.background==='public/art/rooms/'+id+'/background.webp','background path '+id);
  assert(JSON.stringify(room.poses)===JSON.stringify(poses.map(p=>'public/art/rooms/'+id+'/poses/'+p+'.webp')),'poses '+id);
  assert(room.conceptPreview==='public/art/rooms/'+id+'/concept-scene.svg','preview path '+id);
  const preview=join(root,room.conceptPreview);
  assert(existsSync(preview),'missing independent scene '+id);
  const source=readFileSync(preview,'utf8');
  assert(source.includes('viewBox="0 0 1920 1080"'),'concept scene must be 1920x1080 '+id);
  assert(!/<image\b|<text\b|foreignObject|<script\b|https?:\/\//i.test(source.replace('http://www.w3.org/2000/svg','')),
    'scene must not embed characters, UI text or remote media '+id);
  if(bgProduction){
    assert(room.layout==='reviewed','production background requires reviewed hotspot alignment '+id);
    const expectedObjects={
      yuesha:['seal','tea','ledger'],
      brook:['toolbox','gauge','nightbell'],
      fern:['herbarium','moonflower','watermap'],
      cinder:['hammer','blueprint','keepsake'],
    }[id];
    const anchors=room.objectAnchors;
    assert(anchors&&JSON.stringify(Object.keys(anchors).sort())===JSON.stringify([...expectedObjects].sort()),
      'production artwork must locate each physical prop '+id);
    const stage={width:390,height:315};
    const scale=Math.max(stage.width/16,stage.height/9);
    const drawnWidth=16*scale,drawnHeight=9*scale;
    const points=[];
    for(const objectId of expectedObjects){
      const point=anchors[objectId];
      assert(Array.isArray(point)&&point.length===2&&point.every(n=>Number.isFinite(n)&&n>0&&n<1),
        'invalid normalized prop anchor '+id+'/'+objectId);
      const px=(stage.width-drawnWidth)/2+point[0]*drawnWidth;
      const py=(stage.height-drawnHeight)/2+point[1]*drawnHeight;
      assert(px>=22&&px<=stage.width-22&&py>=22&&py<=stage.height-22,
        'mobile 44px marker clipped '+id+'/'+objectId);
      for(const other of points)assert(Math.hypot(px-other[0],py-other[1])>=44,
        'mobile 44px markers overlap '+id+'/'+objectId);
      points.push([px,py]);
    }
    checkWebP(room.background,{alpha:false,minW:1920,minH:1080});
    const candidateBytes=readFileSync(join(root,room.background));
    const candidateSha=createHash('sha256').update(candidateBytes).digest('hex');
    const provenancePath=join(dirname(join(root,room.background)),'provenance.json');
    assert(existsSync(provenancePath),'missing background review '+id);
    const approved=JSON.parse(readFileSync(provenancePath,'utf8'));
    assert(approved.backgroundSha256===candidateSha,'approved SHA-256 differs from actual image '+id);
    assert(approved.dimensions?.width/approved.dimensions?.height>1.77&&
      approved.dimensions?.width/approved.dimensions?.height<1.78,
      'background must use reviewed 16:9 composition '+id);
    assert(approved.sourceReference&&approved.sourceType&&approved.reviewedAt&&
      approved.reviewScreens?.includes('mobile-390x315')&&
      approved.reviewScreens?.includes('desktop-1200x675'),
      'missing source reference or responsive manual review '+id);
    backgrounds++;
  }
  if(actorProduction){
    for(const pose of room.poses)checkWebP(pose,{alpha:true,minW:1000,minH:1000});
    residents++;
  }
  if(bgProduction||actorProduction){
    const provenance=join(dirname(join(root,room.background)),'provenance.json');
    assert(existsSync(provenance),'missing provenance '+id);
    const rights=JSON.parse(readFileSync(provenance,'utf8'));
    assert(rights.original===true&&rights.commercialUse===true&&
      typeof rights.reviewer==='string'&&rights.reviewer.trim().length>0&&
      typeof rights.reviewNotes==='string'&&rights.reviewNotes.trim().length>0,
      'rights and manual visual review incomplete '+id);
    if(bgProduction)assert(rights.noBakedUI===true&&rights.noBakedCharacterInBackground===true,
      'background visual review incomplete '+id);
    if(actorProduction)assert(rights.noBakedBackgroundInResident===true&&
      rights.sameFootAnchor===true&&rights.transparentEdgesReviewed===true,
      'resident visual review incomplete '+id);
  }
}
console.log('Room art: '+backgrounds+'/4 production backgrounds, '+residents+
  '/4 production resident sets; all staged asset paths verified.');
