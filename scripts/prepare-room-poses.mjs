import {readFileSync,copyFileSync,existsSync,mkdirSync,writeFileSync,statSync} from 'node:fs';
import {resolve,join,extname,basename} from 'node:path';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {webpDimensions} from './prepare-room-background.mjs';

const root=resolve(import.meta.dirname,'..');
export const ROOM_POSES=['idle','attentive','warm','guarded'];
const ROOMS=['yuesha','brook','fern','cinder'];
const hash=data=>createHash('sha256').update(data).digest('hex');
export function inspectPoseAssets(input){
  const keys=Object.keys(input).sort();
  if(JSON.stringify(keys)!==JSON.stringify([...ROOM_POSES].sort()))
    throw new Error('Exactly four named poses are required');
  const dimensions=[], hashes=new Set(), frames={};
  for(const pose of ROOM_POSES){
    const bytes=input[pose];
    if(!Buffer.isBuffer(bytes)||bytes.length<10000||bytes.length>8*1024*1024)
      throw new Error('Invalid size for pose '+pose);
    const info=webpDimensions(bytes);
    if(info.width<1000||info.height<1000||!info.alpha)
      throw new Error('Pose must be >=1000x1000 with real WebP alpha flag: '+pose);
    const digest=hash(bytes);
    if(hashes.has(digest))throw new Error('Duplicate pose pixels: '+pose);
    hashes.add(digest);
    dimensions.push(info.width+'x'+info.height);
    frames[pose]={width:info.width,height:info.height,sha256:digest,bytes:bytes.length};
  }
  if(new Set(dimensions).size!==1)
    throw new Error('All four poses must share the same pixel canvas');
  return frames;
}
function parseArgs(argv){
  const args={};
  for(let i=0;i<argv.length;i++){
    const token=argv[i];
    if(!token.startsWith('--'))throw new Error('Unexpected argument '+token);
    const split=token.indexOf('='),key=split<0?token.slice(2):token.slice(2,split);
    const value=split<0?argv[++i]:token.slice(split+1);
    if(!value||key in args)throw new Error('Invalid --'+key);
    args[key]=value;
  }
  if(Object.keys(args).some(key=>!['room','source','out'].includes(key))||
     !ROOMS.includes(args.room)||!args.source||!args.out)
    throw new Error('Usage: --room yuesha --source DIR_WITH_FOUR_WEBP --out REVIEW_DIR');
  return args;
}
export function portraitReviewHtml({room}){
  const labels={idle:'待机',attentive:'倾听',warm:'亲近',guarded:'警觉'};
  const buttons=ROOM_POSES.map(p=>'<button type="button" data-pose="'+p+'">'+labels[p]+'</button>').join('');
  return '<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+
    '<title>'+room+' · 透明角色候选审核</title><style>'+
    'body{margin:0;padding:20px;background:#160f22;color:#f6e3cf;font:14px system-ui}'+
    'main{display:flex;flex-wrap:wrap;gap:24px}section{max-width:100%}'+
    '.canvas{position:relative;width:390px;max-width:100%;height:350px;overflow:hidden;border:1px solid #a5876c;'+
    'background:center/cover url("./concept-scene.svg")}'+
    '.canvas img{position:absolute;left:2%;bottom:0;width:49%;height:94%;object-fit:contain;object-position:bottom}'+
    '.alpha{background-color:#eee;background-image:linear-gradient(45deg,#bbb 25%,transparent 25%),'+
    'linear-gradient(-45deg,#bbb 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#bbb 75%),'+
    'linear-gradient(-45deg,transparent 75%,#bbb 75%);background-size:24px 24px;background-position:0 0,0 12px,12px -12px,-12px 0}'+
    '.alpha img{position:static;display:block;max-width:100%;width:auto;height:350px;margin:auto;object-fit:contain}'+
    'button{margin:4px 6px 12px 0;min-height:44px;border:1px solid #e6bf85;background:#49304d;color:#ffe7c6;border-radius:7px;padding:8px}'+
    '</style><h1>'+room+' · 四姿态透明立绘（候选，尚未审核）</h1>'+
    '<p>检查四姿态人物一致性、边缘白边、手/脚点、透明背景，确认在房间里不遮挡剧情物件。浏览器会读取实际图片像素，遮挡式拼贴图不可当作透明人物。</p>'+
    '<nav>'+buttons+'</nav><main><section><h2>房间合成（390px）</h2><div class="canvas"><img id="portrait" src="./poses/idle.webp" alt="姿态候选"></div></section>'+
    '<section><h2>真实透明背景检查</h2><div class="canvas alpha"><img id="checker" src="./poses/idle.webp" alt="透明边缘检查"></div></section></main>'+
    '<p id="checks" role="status"></p><script>'+
    'const names='+JSON.stringify(ROOM_POSES)+';'+
    'async function inspect(pose){let url="./poses/"+pose+".webp";'+
    'document.querySelector("#portrait").src=url;document.querySelector("#checker").src=url;'+
    'const img=new Image();img.src=url;await img.decode();'+
    'const c=document.createElement("canvas");c.width=64;c.height=64;const x=c.getContext("2d",{willReadFrequently:true});'+
    'x.drawImage(img,0,0,64,64);const a=x.getImageData(0,0,64,64).data;let opaque=0,transparent=0;'+
    'for(let i=3;i<a.length;i+=4){if(a[i]>230)opaque++;if(a[i]<16)transparent++}'+
    'const corners=[3,255,16131,16383];'+
    'const cornerClear=corners.every(i=>a[i]<=32);'+
    'document.querySelector("#checks").textContent=pose+" · "+img.width+"×"+img.height+'+
    '" · 实测透明率 "+(transparent/4096*100).toFixed(1)+"% · 实测不透明率 "+(opaque/4096*100).toFixed(1)+"% · 四角透明 "+(cornerClear?"通过":"失败");}'+
    'for(const button of document.querySelectorAll("button[data-pose]"))button.onclick=()=>void inspect(button.dataset.pose);void inspect("idle");'+
    '</script></html>';
}
function main(argv){
  const {room,source,out}=parseArgs(argv);
  const dir=resolve(source),target=resolve(out);
  if(existsSync(join(target,'review-status.DRAFT.json')))
    throw new Error('Existing review draft found; refusing overwrite');
  const data={},sources={};
  for(const pose of ROOM_POSES){
    const file=join(dir,pose+'.webp');
    if(!existsSync(file)||extname(file)!=='.webp'||!statSync(file).isFile())
      throw new Error('Missing '+pose+'.webp');
    data[pose]=readFileSync(file);sources[pose]=file;
  }
  const frames=inspectPoseAssets(data);
  mkdirSync(join(target,'poses'),{recursive:true});
  for(const pose of ROOM_POSES)copyFileSync(sources[pose],join(target,'poses',pose+'.webp'));
  copyFileSync(join(root,'public/art/rooms',room,'concept-scene.svg'),join(target,'concept-scene.svg'));
  writeFileSync(join(target,'review.html'),portraitReviewHtml({room}));
  writeFileSync(join(target,'review-status.DRAFT.json'),JSON.stringify({
    room,status:'needs-human-visual-review',approved:false,humanVisualReview:false,
    sourceType:'',sourceReference:'',rightsConfirmed:false,commercialUse:false,original:false,
    reviewer:'',reviewNotes:'',reviewedAt:'',sameFootAnchor:false,transparentEdgesReviewed:false,
    noBakedBackgroundInResident:false,identityConsistent:false,
    poseReview:{idle:false,attentive:false,warm:false,guarded:false},frames,
  },null,2)+'\n');
  console.log('Portrait review prepared: '+join(target,'review.html'));
  console.log('No production manifest or player save changed.');
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  try{main(process.argv.slice(2));}catch(e){console.error(e.message);process.exitCode=1;}
}
