import {readFileSync,writeFileSync,existsSync,copyFileSync,mkdirSync,unlinkSync,rmdirSync,statSync,constants} from 'node:fs';
import {resolve,join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {ROOM_POSES,inspectPoseAssets} from './prepare-room-poses.mjs';
import {checkPosePixels} from './check-portrait-pixels.mjs';
const root=resolve(import.meta.dirname,'..');
const ROOMS=['yuesha','brook','fern','cinder'];
export function verifyPortraitApproval({room,review,assets}){
  if(review?.approved!==true||review?.humanVisualReview!==true)
    throw new Error('Human portrait review has not been approved');
  if(review.room!==room||!ROOMS.includes(room))
    throw new Error('Approval belongs to another room');
  if(review.original!==true||review.commercialUse!==true||review.rightsConfirmed!==true||
    !['ai-generated','artist-original','licensed'].includes(review.sourceType)||
    typeof review.sourceReference!=='string'||review.sourceReference.trim().length<8)
    throw new Error('Original source or commercial-use rights not verified');
  if(typeof review.reviewer!=='string'||review.reviewer.trim().length<3||
    typeof review.reviewNotes!=='string'||review.reviewNotes.trim().length<24||
    typeof review.reviewedAt!=='string'||!Number.isFinite(Date.parse(review.reviewedAt)))
    throw new Error('Missing substantive dated human review');
  if(review.sameFootAnchor!==true||review.transparentEdgesReviewed!==true||
    review.noBakedBackgroundInResident!==true||review.identityConsistent!==true)
    throw new Error('Foot anchors, transparency or identity not reviewed');
  if(ROOM_POSES.some(p=>review.poseReview?.[p]!==true))
    throw new Error('Each of the four pose reviews must be approved');
  const frames=inspectPoseAssets(assets);
  for(const pose of ROOM_POSES){
    const expected=review.frames?.[pose],actual=frames[pose];
    if(!expected||expected.sha256!==actual.sha256||
      expected.width!==actual.width||expected.height!==actual.height||
      expected.bytes!==actual.bytes)
      throw new Error('Portrait frame differs from reviewed file: '+pose);
  }
  return {
    original:true,commercialUse:true,rightsConfirmed:true,
    sourceType:review.sourceType,sourceReference:review.sourceReference.trim(),
    reviewedAt:review.reviewedAt,reviewer:review.reviewer.trim(),reviewNotes:review.reviewNotes.trim(),
    sameFootAnchor:true,transparentEdgesReviewed:true,
    noBakedBackgroundInResident:true,identityConsistent:true,
    poseReview:Object.fromEntries(ROOM_POSES.map(p=>[p,true])),frames,
  };
}
function parseArgs(argv){
  const args={};
  for(let i=0;i<argv.length;i++){
    const flag=argv[i],pos=flag.indexOf('=');
    if(!flag.startsWith('--'))throw new Error('Unknown argument '+flag);
    const key=pos>0?flag.slice(2,pos):flag.slice(2),value=pos>0?flag.slice(pos+1):argv[++i];
    if(!value||key in args)throw new Error('Invalid argument '+key);
    args[key]=value;
  }
  if(Object.keys(args).some(k=>!['room','source','approval'].includes(k))||
    !ROOMS.includes(args.room)||!args.source||!args.approval)
    throw new Error('Use --room yuesha --source poses-dir --approval signed-review.json');
  return args;
}
async function main(argv){
  const {room,source,approval}=parseArgs(argv);
  const paths=Object.fromEntries(ROOM_POSES.map(p=>[p,join(resolve(source),p+'.webp')]));
  if(Object.values(paths).some(path=>!existsSync(path)||!statSync(path).isFile()))
    throw new Error('All four named WebP files must exist');
  if(!existsSync(resolve(approval)))throw new Error('Approval file missing');
  const assets=Object.fromEntries(ROOM_POSES.map(p=>[p,readFileSync(paths[p])]));
  const review=JSON.parse(readFileSync(resolve(approval),'utf8'));
  const approved=verifyPortraitApproval({room,review,assets});
  const pixelReport=await checkPosePixels(assets);
  for(const pose of ROOM_POSES){
    if(review.pixelReport?.[pose]?.passesPixelPreflight!==true)
      throw new Error('Reviewed pixel-preflight record missing for '+pose);
  }
  approved.pixelReport=pixelReport;
  const manifestPath=join(root,'public/art/rooms/manifest.json');
  const original=readFileSync(manifestPath);
  const manifest=JSON.parse(original.toString('utf8')),entry=manifest.rooms[room];
  if(!entry||entry.residentStatus!=='concept')
    throw new Error('Room resident already has production assets');
  const dir=join(root,'public/art/rooms',room,'poses');
  const proofPath=join(root,'public/art/rooms',room,'portrait-provenance.json');
  if(existsSync(proofPath)||ROOM_POSES.some(p=>existsSync(join(dir,p+'.webp'))))
    throw new Error('Refusing to overwrite existing portrait files or review');
  if(JSON.stringify(entry.poses)!==JSON.stringify(ROOM_POSES.map(p=>'public/art/rooms/'+room+'/poses/'+p+'.webp')))
    throw new Error('Manifest portrait paths have changed');
  const madeDir=!existsSync(dir),created=[];
  let wroteManifest=false;
  try{
    mkdirSync(dir,{recursive:true});
    for(const pose of ROOM_POSES){
      const dest=join(dir,pose+'.webp');
      // COPYFILE_EXCL may fail because a concurrent process added dest.
      // Never delete that other process's file on an unsuccessful copy.
      copyFileSync(paths[pose],dest,constants.COPYFILE_EXCL);
      created.push(dest);
    }
    writeFileSync(proofPath,JSON.stringify(approved,null,2)+'\n',{flag:'wx'});
    created.push(proofPath);
    entry.residentStatus='production';
    entry.composition=entry.backgroundStatus==='production'?'separated':'layered-concept';
    wroteManifest=true;
    writeFileSync(manifestPath,JSON.stringify(manifest,null,2)+'\n');
    const checked=spawnSync(process.execPath,[join(root,'scripts/audit-room-art.mjs')],
      {cwd:root,encoding:'utf8'});
    if(checked.status!==0)throw new Error('Room art audit failed:\n'+(checked.stderr||checked.stdout));
    console.log(checked.stdout.trim());
    console.log('Approved poses staged. Run build, typecheck, tests and manual visual regression before publishing.');
  }catch(error){
    if(wroteManifest)writeFileSync(manifestPath,original);
    for(const file of created.reverse())unlinkSync(file);
    if(madeDir)rmdirSync(dir);
    throw error;
  }
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  main(process.argv.slice(2)).catch(error=>{console.error('Portrait promotion: '+error.message);process.exitCode=1;});
}
