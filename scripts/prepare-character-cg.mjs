import {readFileSync,writeFileSync,copyFileSync,existsSync,mkdirSync,statSync} from 'node:fs';
import {resolve,join,extname} from 'node:path';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {CG_PATHS,CG_VIEWPORTS,inspectCharacterCg} from './audit-character-cg.mjs';

function parse(argv){
  const a={};
  for(let i=0;i<argv.length;i++){
    const token=argv[i],pos=token.indexOf('=');
    if(!token.startsWith('--'))throw Error('Unknown flag '+token);
    const k=pos<0?token.slice(2):token.slice(2,pos);
    const v=pos<0?argv[++i]:token.slice(pos+1);
    if(!v||k in a)throw Error('Missing or duplicated flag '+k);
    a[k]=v;
  }
  if(Object.keys(a).some(k=>!['card','source','out'].includes(k))||
     !Object.hasOwn(CG_PATHS,a.card)||!a.source||!a.out)
    throw Error('Use --card yuesha-eclipse --source artwork.webp --out review-folder');
  return a;
}
export function cardReviewHtml(card){
  const title={'yuesha-eclipse':'月纱 · 神话月蚀','yuesha-vow':'月纱 · 月下誓约',
    'brook-tide':'泉泡 · 潮汐','fern-spring':'青枝 · 春芽','cinder-ember':'炽角 · 余烬'}[card];
  const panels=[['desktop-1440x900',1440,900,430],['desktop-1648x928',1648,928,470],
    ['mobile-390x844',390,844,350]];
  return '<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+
    '<title>'+title+' · 独立 CG 审核</title><style>'+
    '*{box-sizing:border-box}body{margin:0;background:#0f0c12;color:#f1e5d6;font:14px system-ui;padding:24px}'+
    'h1{font:500 28px Georgia,serif}main{display:flex;flex-wrap:wrap;align-items:start;gap:30px}'+
    'section{max-width:100%;overflow:auto}section h2{font-size:14px;color:#d9c2a1}'+
    '.scene{height:450px;max-width:100%;display:grid;place-items:center;background:#1b161d;border:1px solid #a68d70;overflow:hidden}'+
    '.card{height:94%;aspect-ratio:3/4;max-width:90%;position:relative;overflow:hidden;'+
    'border:1px solid #a68d70;border-radius:12px;background:#24141d}'+
    'img{display:block;width:100%;height:100%;object-fit:contain}'+
    'footer{position:absolute;bottom:0;left:0;right:0;min-height:20%;padding:12px;'+
    'background:linear-gradient(transparent,#1b161de8 30%,#1b161d 100%);font:500 18px Georgia,serif}'+
    '.note{font-size:12px;color:#bdad9d;line-height:1.7;max-width:760px}</style>'+
    '<h1>'+title+' · 原画候选审核（尚未批准）</h1>'+
    '<p class="note">真实候选应为原生至少 1536×2048、3:4、无文字/图标/按钮、头足完整的人物 CG。'+
    '此处仅是构图预览，不会自动确认版权、全身、手脚或身份一致；需人工逐项签署 review-status.DRAFT.json。</p>'+
    '<main>'+panels.map(([id,w,h,cw])=>'<section><h2>'+id+'</h2><div class="scene" style="width:'+Math.min(w,850)+'px">'+
    '<div class="card" style="max-width:'+cw+'px"><img src="./cg-candidate.webp" alt="'+title+'">'+
    '<footer>'+title+'</footer></div></div></section>').join('')+'</main></html>';
}
function main(argv){
  const {card,source,out}=parse(argv),src=resolve(source),target=resolve(out);
  if(extname(src).toLowerCase()!=='.webp'||!existsSync(src)||!statSync(src).isFile())
    throw Error('Source must be a readable WebP');
  const bytes=readFileSync(src),image=inspectCharacterCg(bytes);
  if(existsSync(join(target,'review-status.DRAFT.json'))||existsSync(join(target,'cg-candidate.webp')))
    throw Error('Refusing to overwrite an existing review');
  mkdirSync(target,{recursive:true});
  copyFileSync(src,join(target,'cg-candidate.webp'));
  writeFileSync(join(target,'review.html'),cardReviewHtml(card));
  const review={
    card,status:'needs-human-review',approved:false,humanVisualReview:false,
    image,sourceType:'',sourceReference:'',original:false,commercialUse:false,rightsConfirmed:false,
    nativeResolution:{width:null,height:null},noBakedUI:false,noBakedText:false,
    fullBodyVisible:false,characterIdentityConsistent:false,handsAndFeetReviewed:false,
    visualReview:Object.fromEntries(CG_VIEWPORTS.map(v=>[v,false])),
    reviewer:'',reviewNotes:'',reviewedAt:'',
  };
  writeFileSync(join(target,'review-status.DRAFT.json'),JSON.stringify(review,null,2)+'\n');
  console.log('Staged '+card+' CG review at '+join(target,'review.html')+'; no production asset changed.');
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  try{main(process.argv.slice(2));}catch(e){console.error('CG review: '+e.message);process.exitCode=1;}
}
