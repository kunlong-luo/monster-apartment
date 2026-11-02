import {readFileSync,writeFileSync,copyFileSync,existsSync,mkdirSync,statSync} from 'node:fs';
import {resolve,join,extname} from 'node:path';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {CG_PATHS,CG_VIEWPORTS,CG_IDENTITY_REFERENCE_PATHS,inspectCharacterCg} from './audit-character-cg.mjs';

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
  const panels=[['desktop-1440x900',1440,900,690],['desktop-1648x928',1648,928,730],
    ['mobile-390x844',390,844,390]];
  const viewport=panels.map(([id,w,h,target])=>{
    const scale=target/w,small=w<600;
    // Review BOTH original 3:4 composition and the much narrower actual A05
    // in-game card. A 3:4-only reviewer can miss a cropped face or cut feet.
    const fullWidth=Math.round(w*(small?.42:.33));
    const fullHeight=Math.round(fullWidth*4/3);
    const slimWidth=Math.round(w*(small?.43:.114));
    const slimHeight=Math.round(h*(small?.30:.62));
    return '<section class="panel" data-viewport="'+id+'"><h2>'+id+' · '+w+'×'+h+'</h2>'+
      '<div class="preview" style="width:'+target+'px;height:'+Math.round(h*scale)+'px">'+
      '<div class="scene" style="width:'+w+'px;height:'+h+'px;transform:scale('+scale+')">'+
      '<div class="review-pair">'+
      '<div class="card" data-review-mode="full" style="width:'+fullWidth+'px;height:'+fullHeight+'px">'+
      '<img src="./cg-candidate.webp" alt="'+title+' 的完整 CG 候选">'+
      '<div class="card-footer">'+title+'</div></div>'+
      '<div class="slim" data-review-mode="gallery-slim" style="width:'+slimWidth+'px;height:'+slimHeight+'px">'+
      '<img src="./cg-candidate.webp" alt="'+title+' 在 A05 窄竖卡上的实际裁切">'+
      '<div class="card-footer">'+title+'</div></div>'+
      '</div></div></div></section>';
  }).join('');
  return '<!doctype html><html lang="zh-CN"><head><meta charset="utf-8">'+
    '<meta name="viewport" content="width=device-width,initial-scale=1">'+
    '<title>'+title+' · CG 构图与人物身份审查</title><style>'+
    '*{box-sizing:border-box}body{margin:0;background:#0f0c12;color:#f1e5d6;'+
    'font:14px system-ui;padding:clamp(12px,2vw,30px)}'+
    'h1{font:500 28px Georgia,serif;margin:0 0 14px}'+
    'h2{font-size:14px;font-weight:500;color:#d9c2a1}'+
    'p{line-height:1.8;max-width:86ch;color:#bdad9d}'+
    'main{display:flex;flex-wrap:wrap;gap:20px;align-items:start}'+
    '.panel{max-width:100%;overflow-x:auto}'+
    '.preview{position:relative;max-width:none;overflow:hidden;border:1px solid #a68d70}'+
    '.scene{position:absolute;left:0;top:0;display:grid;place-items:center;'+
    'transform-origin:top left;background:radial-gradient(ellipse at 50% 38%,#51283288,#0f0c12 75%)}'+
    '.review-pair{display:flex;gap:clamp(8px,2vw,25px);align-items:center;justify-content:center}'+
    '.card,.slim{position:relative;overflow:hidden;border:2px solid #a68d70;'+
    'border-radius:14px;background:#1b161d}'+
    '.card img,.slim img{display:block;width:100%;height:100%}'+
    '.card img{object-fit:contain}'+
    '.slim img{object-fit:cover;object-position:50% 34%}'+
    '.card-footer{position:absolute;bottom:0;left:0;right:0;height:18%;padding:14px;'+
    'background:linear-gradient(transparent,#1b161de8 40%,#1b161d);'+
    'display:flex;align-items:end;font:500 24px Georgia,serif}'+
    '.identity{display:flex;flex-wrap:wrap;gap:16px;align-items:center;margin:18px 0 25px}'+
    '.identity img{display:block;width:140px;max-width:100%;aspect-ratio:1;object-fit:contain;'+
    'border:1px solid #a68d70;border-radius:7px}'+
    '.identity p{max-width:62ch;margin:0}'+
    '.checks{max-width:850px;line-height:2;color:#bdad9d}'+
    '</style></head><body><h1>'+title+' · 独立 CG 审核候选（未批准）</h1>'+
    '<p>须为原生至少 1536×2048、3:4、头发到鞋尖完整、无烘焙文字和 UI 的独立绘画。'+
    '本页仅用于构图和身份人工核对，不会自动批准版权、手脚与人物一致性。</p>'+
    '<div class="identity"><img src="./reference-face.webp" alt="仓库既有角色身份基准">'+
    '<p><strong>当前角色身份基准：'+CG_IDENTITY_REFERENCE_PATHS[card]+'</strong>：请核对脸型、眼型、发色、发际线与年龄感。'+
    '严禁把其他角色、男性形象或整张游戏 UI 截图冒充人物全身 CG。</p></div>'+
    '<main>'+viewport+'</main>'+
    '<h2>人工签署前必须完成</h2><ol class="checks">'+
    '<li>真实原始分辨率与 SHA-256 一致，不能是低清图放大</li>'+
    '<li>头发、双手、双足和全身完整，关键部位不被底部铭牌遮挡</li>'+
    '<li>身份一致，服装及装备有独特设计；无文字、按钮或虚构概率</li>'+
    '<li>上述三种屏幕的完整视图与 A05 细长卡片裁切都必须审查，注意面部与足部可见性</li>'+
    '<li>原始来源、版权与商用许可由审核人确认并记录</li></ol>'+
    '</body></html>';
}

function main(argv){
  const {card,source,out}=parse(argv),src=resolve(source),target=resolve(out);
  if(extname(src).toLowerCase()!=='.webp'||!existsSync(src)||!statSync(src).isFile())
    throw Error('Source must be a readable WebP');
  const bytes=readFileSync(src),image=inspectCharacterCg(bytes);
  if(existsSync(join(target,'review-status.DRAFT.json'))||existsSync(join(target,'cg-candidate.webp')))
    throw Error('Refusing to overwrite an existing review');
  const referencePath=CG_IDENTITY_REFERENCE_PATHS[card];
  const face=join(resolve(import.meta.dirname,'..'),referencePath);
  if(!existsSync(face))throw Error('Canonical identity reference missing for '+card);
  const referenceSha256=createHash('sha256').update(readFileSync(face)).digest('hex');
  mkdirSync(target,{recursive:true});
  copyFileSync(src,join(target,'cg-candidate.webp'));
  // A real identity comparison travels with the offline review bundle.
  copyFileSync(face,join(target,'reference-face.webp'));
  writeFileSync(join(target,'review.html'),cardReviewHtml(card));
  const review={
    card,status:'needs-human-review',approved:false,humanVisualReview:false,
    image,identityReference:{path:referencePath,sha256:referenceSha256},sourceType:'',sourceReference:'',original:false,commercialUse:false,rightsConfirmed:false,
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
