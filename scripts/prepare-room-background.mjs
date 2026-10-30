import {readFileSync,copyFileSync,mkdirSync,writeFileSync,statSync,existsSync} from 'node:fs';
import {resolve,join,dirname,extname} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {coverProjection,validateRoomAnchors} from './room-anchor-review.mjs';
export {coverProjection} from './room-anchor-review.mjs';

const root=resolve(import.meta.dirname,'..');
const ids=['yuesha','brook','fern','cinder'];

/** Fast header inspection: not a visual-quality or rights certification. */
export function webpDimensions(bytes){
  if(bytes.length<30||bytes.toString('ascii',0,4)!=='RIFF'||bytes.toString('ascii',8,12)!=='WEBP')
    throw new Error('Expected a valid WebP RIFF header');
  const kind=bytes.toString('ascii',12,16);
  if(kind==='VP8X')return {
    width:1+bytes.readUIntLE(24,3),height:1+bytes.readUIntLE(27,3),
    alpha:(bytes[20]&16)!==0,
  };
  if(kind==='VP8 '){
    const pos=bytes.indexOf(Buffer.from([0x9d,0x01,0x2a]),20);
    if(pos<0||pos+7>bytes.length)throw new Error('Incomplete VP8 frame header');
    return {width:bytes.readUInt16LE(pos+3)&0x3fff,
      height:bytes.readUInt16LE(pos+5)&0x3fff,alpha:false};
  }
  if(kind==='VP8L'){
    if(bytes[20]!==0x2f)throw new Error('Invalid lossless WebP header');
    const a=bytes[21],b=bytes[22],c=bytes[23],d=bytes[24];
    return {width:1+(a|((b&0x3f)<<8)),
      height:1+(((b&0xc0)>>6)|(c<<2)|((d&0x0f)<<10)),alpha:(d&0x10)!==0};
  }
  throw new Error('Unsupported WebP image kind '+kind);
}
function parseArgs(argv){
  const parsed={};
  for(let i=0;i<argv.length;i++){
    const token=argv[i];
    if(!token.startsWith('--'))throw new Error('Unknown argument '+token);
    const eq=token.indexOf('=');
    const name=eq<0?token.slice(2):token.slice(2,eq);
    const value=eq<0?argv[++i]:token.slice(eq+1);
    if(!name||!value||name in parsed)throw new Error('Invalid or duplicate --'+name);
    parsed[name]=value;
  }
  if(Object.keys(parsed).some(k=>!['room','source','out','anchors'].includes(k)))
    throw new Error('Allowed flags: --room, --source, --out, --anchors');
  if(!ids.includes(parsed.room))throw new Error('Use --room yuesha|brook|fern|cinder');
  if(!parsed.source||!parsed.out)throw new Error('Require --source input.webp --out review-folder');
  return parsed;
}
export function buildReviewHtml({room,anchors,sourceWidth,sourceHeight}){
  const safeTitle={yuesha:'月纱',brook:'泉泡',fern:'青枝',cinder:'炽角'}[room];
  const specs=[{id:'wide',name:'Desktop / 1200×675',w:1200,h:675},
    {id:'mobile',name:'Mobile / 390×315',w:390,h:315},
    {id:'small',name:'Compact / 320×315',w:320,h:315}];
  const items=Object.entries(anchors);
  const panels=specs.map(s=>{
    const markers=items.map(([id,xy])=>{
      const p=coverProjection(xy,s.w,s.h);
      const warning=p.visible?'':' offscreen';
      return '<span class="marker'+warning+'" style="left:'+p.x.toFixed(1)+'px;top:'+p.y.toFixed(1)+
        'px" title="'+id+'">'+id+'</span>';
    }).join('');
    return '<section><h2>'+s.name+'</h2><div class="scene" style="width:'+s.w+
      'px;height:'+s.h+'px">'+markers+'</div></section>';
  }).join('');
  return '<!doctype html><html lang="zh-CN"><meta charset="utf-8">'+
    '<meta name="viewport" content="width=device-width,initial-scale=1">'+
    '<title>'+safeTitle+' · 美术候选审核</title><style>'+
    'body{margin:20px;background:#130e18;color:#ffddaa;font:14px system-ui}'+
    'main{display:flex;flex-wrap:wrap;gap:24px;align-items:start}section{max-width:100%;overflow-x:auto}'+
    '.scene{position:relative;flex-shrink:0;background-image:url("./background-candidate.webp");'+
    'background-size:cover;background-position:center;overflow:hidden;border:1px solid #b19a76;border-radius:10px}'+
    '.marker{position:absolute;display:grid;place-items:center;transform:translate(-50%,-50%);'+
    'min-width:44px;height:44px;border-radius:40px;background:#332038df;border:2px solid #ffd198;'+
    'color:white;font:11px system-ui;box-sizing:border-box;padding:3px;white-space:nowrap}'+
    '.offscreen{border-color:#ff6f7e;background:#6e1d30}code{color:#fff3d7}</style>'+
    '<h1>'+safeTitle+' · 高清室内绘景候选（未批准）</h1>'+
    '<p>源图 '+sourceWidth+'×'+sourceHeight+'。红边表示完整 44px 热点超出可视区；'+
    '游戏中将提供“画面外物件”入口，不会伪造物理位置。人工需确认物件是否真的画在该锚点、'+
    '人物是否遮挡、图片细节与版权；不通过审核不得将 manifest 改为 production。</p>'+
    '<main>'+panels+'</main></html>';
}
function run(argv){
  const {room,source,out,anchors:anchorFile}=parseArgs(argv);
  const src=resolve(source),output=resolve(out);
  if(!existsSync(src)||!statSync(src).isFile()||extname(src).toLowerCase()!=='.webp')
    throw new Error('Source must be an existing .webp file');
  if(src===join(output,'background-candidate.webp'))
    throw new Error('Source and destination cannot be the same file');
  const manifest=JSON.parse(readFileSync(join(root,'public/art/rooms/manifest.json'),'utf8'));
  // A candidate may supply a standalone anchor JSON: never pre-edit production manifest.
  // The exact reviewed coordinates must be supplied again during promotion.
  const anchors=validateRoomAnchors(room,anchorFile
    ?JSON.parse(readFileSync(resolve(anchorFile),'utf8'))
    :manifest.rooms?.[room]?.objectAnchors);
  const bytes=readFileSync(src);
  const dimensions=webpDimensions(bytes);
  if(dimensions.width<1920||dimensions.height<1080||
      Math.abs(dimensions.width/dimensions.height-16/9)>.01)
    throw new Error('Candidate background must be at least 1920×1080 and 16:9');
  if(existsSync(output)&&existsSync(join(output,'background-candidate.webp')))
    throw new Error('Review folder contains a candidate; choose a fresh --out path');
  mkdirSync(output,{recursive:true});
  copyFileSync(src,join(output,'background-candidate.webp'));
  writeFileSync(join(output,'review.html'),
    buildReviewHtml({room,anchors,sourceWidth:dimensions.width,sourceHeight:dimensions.height}));
  writeFileSync(join(output,'review-status.DRAFT.json'),JSON.stringify({
    room,asset:'background-candidate.webp',status:'needs-visual-review',
    image:{...dimensions,bytes:bytes.length},objectAnchors:anchors,
    assetSha256:createHash('sha256').update(bytes).digest('hex'),
    sourceType:'',sourceReference:'',generationResolution:null,
    original:false,commercialUse:false,humanVisualReview:false,
    reviewedAt:'',visualReview:{'desktop-1200x675':false,'mobile-390x315':false,'compact-320x315':false},
    reviewer:'',reviewNotes:'',noBakedUI:null,noBakedCharacterInBackground:null,
    rightsConfirmed:false,approved:false,
  },null,2)+'\n');
  console.log('Created '+room+' review at '+join(output,'review.html'));
  console.log('Asset remains a candidate. Manifest has not been modified.');
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  try{run(process.argv.slice(2));}catch(err){console.error('Art review: '+err.message);process.exitCode=1;}
}
