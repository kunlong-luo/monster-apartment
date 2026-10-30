import {readFileSync,writeFileSync,copyFileSync,existsSync,unlinkSync} from 'node:fs';
import {constants} from 'node:fs';
import {resolve,join,dirname,extname} from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {webpDimensions} from './prepare-room-background.mjs';
import {validateRoomAnchors} from './room-anchor-review.mjs';

const root=resolve(import.meta.dirname,'..');
const roomIds=['yuesha','brook','fern','cinder'];
const reviewScreens=['desktop-1200x675','mobile-390x315','compact-320x315'];

export function sha256(bytes){return createHash('sha256').update(bytes).digest('hex');}
export function verifyRoomApproval({room,review,imageBytes,anchors}){
  if(review?.approved!==true||review?.humanVisualReview!==true)
    throw new Error('An actual human-approved visual review is required');
  if(review.room!==room||review.asset!=='background-candidate.webp')
    throw new Error('Review does not match the selected room asset');
  if(!/^[a-f0-9]{64}$/.test(review.assetSha256??'')||
    review.assetSha256!==sha256(imageBytes))
    throw new Error('Candidate SHA-256 differs from the file that was reviewed');
  if(!review.sourceType||!['ai-generated','artist-original','licensed'].includes(review.sourceType))
    throw new Error('The original asset source must be documented');
  if(typeof review.sourceReference!=='string'||review.sourceReference.trim().length<8)
    throw new Error('A meaningful original source reference is required');
  if(review.original!==true||review.commercialUse!==true||review.rightsConfirmed!==true)
    throw new Error('Originality and commercial use must be explicitly confirmed');
  if(review.noBakedUI!==true||review.noBakedCharacterInBackground!==true)
    throw new Error('Background must not bake a character or game UI into pixels');
  if(typeof review.reviewer!=='string'||review.reviewer.trim().length<3||
    typeof review.reviewNotes!=='string'||review.reviewNotes.trim().length<24)
    throw new Error('Name and substantive manual review notes are required');
  if(typeof review.reviewedAt!=='string'||!Number.isFinite(Date.parse(review.reviewedAt)))
    throw new Error('Valid reviewedAt ISO time required');
  if(!reviewScreens.every(screen=>review.visualReview?.[screen]===true))
    throw new Error('Desktop, 390px and 320px previews all need visual review');
  validateRoomAnchors(room,anchors);
  if(JSON.stringify(review.objectAnchors)!==JSON.stringify(anchors))
    throw new Error('Hotspot coordinates have changed since review');
  const dimensions=webpDimensions(imageBytes);
  if(dimensions.width<1920||dimensions.height<1080||
    Math.abs(dimensions.width/dimensions.height-16/9)>.01)
    throw new Error('Approved background must be at least 1920x1080 and 16:9');
  if(imageBytes.length<100000)throw new Error('Candidate file too small to qualify');
  return {
    original:true,commercialUse:true,
    reviewer:review.reviewer.trim(),reviewNotes:review.reviewNotes.trim(),
    reviewedAt:review.reviewedAt,
    sourceType:review.sourceType,sourceReference:review.sourceReference.trim(),
    noBakedUI:true,noBakedCharacterInBackground:true,
    backgroundSha256:review.assetSha256,reviewScreens,
    dimensions:{width:dimensions.width,height:dimensions.height},
    // This proves the image was reviewed, NOT that it was originally rendered at export size.
    generationResolution:review.generationResolution??null,
  };
}
function parseCli(argv){
  const args={};
  for(let i=0;i<argv.length;i++){
    const arg=argv[i];
    if(!arg.startsWith('--'))throw new Error('Unexpected token: '+arg);
    const split=arg.indexOf('=');
    const key=split<0?arg.slice(2):arg.slice(2,split);
    const value=split<0?argv[++i]:arg.slice(split+1);
    if(!value||key in args)throw new Error('Invalid or repeated --'+key);
    args[key]=value;
  }
  if(Object.keys(args).some(key=>!['room','source','approval','anchors'].includes(key))||
    !roomIds.includes(args.room)||!args.source||!args.approval)
    throw new Error('Use --room yuesha --source candidate.webp --approval approved.json');
  return args;
}
/** Fail closed, and roll back manifest/assets when the post-promotion audit fails. */
function main(argv){
  const {room,source,approval,anchors:anchorFile}=parseCli(argv);
  const candidate=resolve(source),reviewPath=resolve(approval);
  if(extname(candidate).toLowerCase()!=='.webp'||!existsSync(candidate))
    throw new Error('A readable WebP file is required');
  if(!existsSync(reviewPath))throw new Error('Approved review file is missing');
  const bytes=readFileSync(candidate);
  const review=JSON.parse(readFileSync(reviewPath,'utf8'));
  const manifestPath=join(root,'public/art/rooms/manifest.json');
  const before=readFileSync(manifestPath);
  const manifest=JSON.parse(before.toString('utf8'));
  const entry=manifest.rooms?.[room];
  if(!entry||entry.backgroundStatus!=='concept'||entry.layout!=='concept')
    throw new Error('Room background is not eligible for first-time promotion');
  // Background and its physical-object coordinates must be reviewed as one unit.
  // New rooms have no pre-approved coordinates; accept a separately supplied file
  // only when all three viewport and SHA/signature checks pass.
  const anchors=validateRoomAnchors(room,anchorFile
    ?JSON.parse(readFileSync(resolve(anchorFile),'utf8'))
    :entry.objectAnchors);
  const provenance=verifyRoomApproval({room,review,imageBytes:bytes,anchors});
  const dest=join(root,'public/art/rooms',room,'background.webp');
  const provenanceFile=join(dirname(dest),'provenance.json');
  if(existsSync(dest)||existsSync(provenanceFile))
    throw new Error('Destination exists; refusing overwrite of a previously reviewed asset');
  entry.objectAnchors=anchors;
  entry.backgroundStatus='production';
  entry.layout='reviewed';
  entry.composition=entry.residentStatus==='production'?'separated':'layered-concept';
  let createdBackground=false,createdProvenance=false,manifestWritten=false;
  try{
    copyFileSync(candidate,dest,constants.COPYFILE_EXCL);
    createdBackground=true;
    writeFileSync(provenanceFile,JSON.stringify(provenance,null,2)+'\n',{flag:'wx'});
    createdProvenance=true;
    writeFileSync(manifestPath,JSON.stringify(manifest,null,2)+'\n');
    manifestWritten=true;
    const audit=spawnSync(process.execPath,[join(root,'scripts/audit-room-art.mjs')],
      {cwd:root,encoding:'utf8'});
    if(audit.status!==0)throw new Error('Post-promotion audit failed:\n'+(audit.stderr||audit.stdout));
    console.log(audit.stdout.trim());
    console.log('Production background promoted locally: '+dest);
    console.log('Run pnpm typecheck, lint, test, build and browser E2E before publishing.');
  }catch(error){
    if(manifestWritten)writeFileSync(manifestPath,before);
    if(createdProvenance)unlinkSync(provenanceFile);
    if(createdBackground)unlinkSync(dest);
    throw error;
  }
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  try{main(process.argv.slice(2));}
  catch(error){console.error('Room art promotion: '+error.message);process.exitCode=1;}
}
