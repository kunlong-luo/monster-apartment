/**
 * Optional paid production intake for native-size character CG, NOT a promotion tool.
 * Runs only when manually invoked with BFL_API_KEY; never from CI or the game client.
 * Black Forest Labs FLUX.2 [pro] accepts custom 1536x2048 dimensions (3.15MP).
 */
import {createHash} from 'node:crypto';
import {existsSync,mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {
  CG_IDENTITY_REFERENCE_PATHS,
  CG_PATHS,
  inspectCharacterCg,
} from './audit-character-cg.mjs';

const ROOT=resolve(import.meta.dirname,'..');
const BRIEFS=join(ROOT,'docs/art-reviews/CG-DIFFERENTIATION-SHOT-LIST.json');
const ENDPOINT='https://api.bfl.ai/v1/flux-2-pro';
export const NATIVE_CG_DIMENSIONS=Object.freeze({width:1536,height:2048});
const sha256=buffer=>createHash('sha256').update(buffer).digest('hex');

export function buildCharacterCgPrompt(card,brief){
  if(!Object.hasOwn(CG_PATHS,card)||!brief?.name||!brief?.pose||!brief?.weapon)
    throw new Error('Unknown or incomplete character brief: '+card);
  return [
    'ONE SINGLE ADULT FEMALE ORIGINAL CHARACTER in ONE VERTICAL 3:4 illustration.',
    'NOT a lineup, contact sheet, collage, split panel, game screenshot, trading-card layout, or marketing poster.',
    'NO other people; NO text, labels, badges, logos, typography, frames, or baked UI.',
    'High-end 2D dark fantasy game key art with hand-painted materials, rich depth and believable anatomy.',
    'Full body from crown/hair to BOTH shoes, and ENTIRE weapon inside the 3:4 canvas.',
    'Allow at least 8 percent clear safe margin around crown, hair, weapon tips, hands, feet, and cloak.',
    'Use reference image 1 strictly for the established character identity: preserve actual facial bone structure, eye spacing, ears/horns, hairline, maturity, and recognizable face.',
    'Use reference image 2 only for action and theme inspiration; paint a NEW original scene, not a cropped or upscaled copy.',
    'Distinct authentic body posture, physically supported weight, expressive hands correctly grasping weapons; no redundant fingers or impossible joints.',
    'Character name/theme: '+brief.name+'.',
    'Facial identity: '+brief.face+'.',
    'Posture and weight: '+brief.pose+'.',
    'Weapon and hand mechanics: '+brief.weapon+'.',
    'Garment cut, armor and fabrics: '+brief.wardrobe+'.',
    'Motion and silhouette: '+brief.motion+'.',
    'Background setting: '+brief.scene+'.',
    'Camera framing: '+brief.camera+'.',
    'Identity-defining features: '+Object.values(brief.identityAnchors??{}).join(' ; ')+'.',
    'Do not repeat: '+(brief.prohibited??[]).join('; ')+'.',
    'Only ONE finished full-body character and her own independent scene, without text or panel borders.',
  ].join('\n');
}

export function buildNativeCgRequest({card,brief,faceBase64,poseBase64,seed}){
  if(typeof faceBase64!=='string'||!faceBase64||typeof poseBase64!=='string'||!poseBase64)
    throw new Error('Both identity and pose reference images are required.');
  const req={
    prompt:buildCharacterCgPrompt(card,brief),
    ...NATIVE_CG_DIMENSIONS,
    output_format:'webp',
    // Prevent automatic prompt expansion from introducing multi-character collages.
    disable_pup:true,
    input_image:faceBase64,
    input_image_2:poseBase64,
  };
  if(seed!==undefined){
    if(!Number.isSafeInteger(seed)||seed<0||seed>2147483647)
      throw new Error('Seed must be an integer in [0, 2147483647].');
    req.seed=seed;
  }
  return req;
}

function parse(args){
  const result={dryRun:false};
  for(let i=0;i<args.length;i++){
    const key=args[i];
    if(key==='--dry-run'){if(result.dryRun)throw new Error('Duplicate --dry-run');result.dryRun=true;continue;}
    if(!['--card','--seed'].includes(key)||!args[i+1])throw new Error('Unknown/incomplete flag '+key);
    const field=key.slice(2);
    if(Object.hasOwn(result,field))throw new Error('Duplicated '+key);
    result[field]=args[++i];
  }
  if(!Object.hasOwn(CG_PATHS,result.card))
    throw new Error('Usage: node scripts/generate-native-character-cg.mjs --card yuesha-eclipse [--seed 42] [--dry-run]');
  const seed=result.seed===undefined?undefined:Number(result.seed);
  if(result.seed!==undefined&&(!/^\d+$/.test(result.seed)||!Number.isSafeInteger(seed)||seed<0||seed>2147483647))
    throw new Error('Invalid --seed');
  return {card:result.card,seed,dryRun:result.dryRun};
}

async function request(url,options={}){
  const response=await fetch(url,{...options,signal:AbortSignal.timeout(45000)});
  if(!response.ok)throw new Error('FLUX request failed with HTTP '+response.status);
  return response;
}

async function generate(args){
  const {card,seed,dryRun}=parse(args);
  const directions=JSON.parse(readFileSync(BRIEFS,'utf8'));
  const brief=directions.cards[card];
  const identityPath=CG_IDENTITY_REFERENCE_PATHS[card];
  const posePath=directions.poseStudies?.[card]?.path;
  if(!identityPath||!posePath)throw new Error('Missing canonical identity or active pose-study reference.');
  const identityBytes=readFileSync(join(ROOT,identityPath));
  const poseBytes=readFileSync(join(ROOT,posePath));
  const payload=buildNativeCgRequest({card,brief,
    faceBase64:identityBytes.toString('base64'),
    poseBase64:poseBytes.toString('base64'),seed});
  const referenceProof={
    identity:{path:identityPath,sha256:sha256(identityBytes)},
    pose:{path:posePath,sha256:sha256(poseBytes)},
  };
  if(dryRun){
    console.log(JSON.stringify({card,model:'flux-2-pro',width:payload.width,
      height:payload.height,outputFormat:payload.output_format,
      disablePromptUpsampling:payload.disable_pup,seed:payload.seed??null,
      references:referenceProof,prompt:payload.prompt,charged:false},null,2));
    return;
  }
  const apiKey=process.env.BFL_API_KEY;
  if(!apiKey)throw new Error('Missing BFL_API_KEY: no paid generation request was made. Run --dry-run to validate the brief.');
  const submitted=await request(ENDPOINT,{method:'POST',headers:{'x-key':apiKey,
    accept:'application/json','content-type':'application/json'},body:JSON.stringify(payload)});
  const task=await submitted.json();
  if(typeof task.polling_url!=='string'||!task.polling_url.startsWith('https://'))
    throw new Error('FLUX submission returned no safe polling URL.');
  let imageUrl;
  for(let attempt=0;attempt<90;attempt++){
    const polled=await (await request(task.polling_url)).json();
    if(polled.status==='Ready'){
      imageUrl=polled.result?.sample;
      break;
    }
    if(['Error','Failed','Request Moderated','Content Moderated'].includes(polled.status))
      throw new Error('FLUX generation did not succeed: '+polled.status);
    await new Promise(done=>setTimeout(done,2000));
  }
  if(typeof imageUrl!=='string'||!imageUrl.startsWith('https://'))
    throw new Error('FLUX image result missing, invalid, or timed out.');
  const imageResponse=await request(imageUrl);
  const bytes=Buffer.from(await imageResponse.arrayBuffer());
  const actual=inspectCharacterCg(bytes);
  if(actual.width!==NATIVE_CG_DIMENSIONS.width||actual.height!==NATIVE_CG_DIMENSIONS.height)
    throw new Error('Native output not exactly 1536x2048; refusing to stage artwork.');
  const dir=join(ROOT,'.art-staging','native-cg',card+'-'+Date.now());
  if(existsSync(dir))throw new Error('Output directory already exists');
  mkdirSync(dir,{recursive:true});
  writeFileSync(join(dir,'native-source.webp'),bytes,{flag:'wx'});
  writeFileSync(join(dir,'generation.json'),JSON.stringify({
    card,createdAt:new Date().toISOString(),model:'flux-2-pro',
    requestedResolution:NATIVE_CG_DIMENSIONS,nativeImage:actual,
    seed:payload.seed??null,sourcePrompt:payload.prompt,
    generationId:typeof task.id==='string'?task.id:null,
    references:referenceProof,
    status:'needs-human-review',approved:false,production:false,
    reviewRequired:['face and silhouette','full weapon margins','hands and feet',
      'three real viewports','source and commercial-rights confirmation'],
  },null,2)+'\n',{flag:'wx'});
  console.log('Native CG staged at '+dir+'; run pnpm art:cg:review with native-source.webp. Human approval and promotion remain REQUIRED.');
}

if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  generate(process.argv.slice(2)).catch(error=>{
    console.error('Native CG generation: '+error.message);
    process.exitCode=1;
  });
}
