import {readFileSync,existsSync} from 'node:fs';
import {resolve,dirname,join} from 'node:path';
const root=resolve(import.meta.dirname,'..');
const manifest=JSON.parse(readFileSync(join(root,'public/art/rooms/manifest.json'),'utf8'));
const ids=['yuesha','brook','fern','cinder'];
const poses=['idle','attentive','warm','guarded'];
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
for(const id of ids){
  const room=manifest.rooms?.[id];
  assert(room,'missing '+id);
  assert(['concept','production'].includes(room.status),'invalid status '+id);
  assert(['embedded-resident','architecture-crop','layered-concept','separated'].includes(room.composition),'composition '+id);
  assert(room.background==='public/art/rooms/'+id+'/background.webp','background path '+id);
  assert(JSON.stringify(room.poses)===JSON.stringify(poses.map(p=>'public/art/rooms/'+id+'/poses/'+p+'.webp')),'poses '+id);
  if(room.status==='concept'){
    assert(room.composition==='layered-concept','room must have independently composed concept layers '+id);
    assert(room.conceptPreview==='public/art/rooms/'+id+'/concept-scene.svg','preview path '+id);
    const preview=join(root,room.conceptPreview);
    assert(existsSync(preview),'missing independent scene '+id);
    const source=readFileSync(preview,'utf8');
    assert(source.includes('viewBox="0 0 1920 1080"'),'concept scene must be 1920x1080 '+id);
    assert(!/<image\b|<text\b|foreignObject|<script\b|https?:\/\//i.test(source.replace('http://www.w3.org/2000/svg','')),
      'scene must not embed characters, UI text or remote media '+id);
    continue;
  }
  assert(room.composition==='separated','production must use separate assets '+id);
  assert(room.layout==='reviewed','hotspots must be reviewed '+id);
  checkWebP(room.background,{alpha:false,minW:1920,minH:1080});
  for(const pose of room.poses)checkWebP(pose,{alpha:true,minW:1000,minH:1000});
  const provenance=join(dirname(join(root,room.background)),'provenance.json');
  assert(existsSync(provenance),'missing provenance '+id);
  const rights=JSON.parse(readFileSync(provenance,'utf8'));
  assert(rights.original===true&&rights.commercialUse===true&&
    rights.noBakedUI===true&&rights.noBakedCharacterInBackground===true&&
    typeof rights.reviewer==='string'&&rights.reviewer.trim().length>0,
    'rights/manual visual review not complete '+id);
}
assert(Object.keys(manifest.rooms).length===4,'unexpected room entry count');
const production=ids.filter(id=>manifest.rooms[id].status==='production').length;
console.log('Room art: '+production+'/4 production, '+(4-production)+'/4 concept; paths verified.');
