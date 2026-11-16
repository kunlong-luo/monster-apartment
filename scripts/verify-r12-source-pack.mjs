import {readFileSync,existsSync,mkdirSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {pngNativeDimensions} from './audit-r12-scene-art.mjs';

const ROOT=resolve(import.meta.dirname,'..');
const AREAS=['apartment','orders','warehouse'];
const KINDS=['desktop','mobile'];
const MINIMUM={desktop:[2560,1440],mobile:[1080,1920]};
const VIEWPORTS=[
  {id:'pc-1440-dpr1',width:1440,height:900,dpr:1,kind:'desktop'},
  {id:'pc-1648-dpr2',width:1648,height:928,dpr:2,kind:'desktop'},
  {id:'phone-390x844-dpr2',width:390,height:844,dpr:2,kind:'mobile'},
  {id:'phone-390x550-dpr2',width:390,height:550,dpr:2,kind:'mobile'},
];
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');

/** CSS background-size: cover (or object-fit: cover), in actual device pixels. */
export function effectiveCoverScale(w,h,viewport){
  if(!(w>0&&h>0&&viewport.width>0&&viewport.height>0&&viewport.dpr>0))
    throw new Error('Invalid positive image or viewport dimensions');
  return Math.max(viewport.width*viewport.dpr/w,viewport.height*viewport.dpr/h);
}

export function inspectSourcePack({sourceDir,pack,manifest,read=readFileSync}){
  if(pack?.schemaVersion!==1||pack.status!=='review'||pack.artApproval!==false)
    throw new Error('Source package must have schemaVersion=1 and review-only approval');
  const areas=Object.keys(pack.scenes??{}).sort();
  if(areas.join(',')!==[...AREAS].sort().join(','))
    throw new Error('Source package must contain exactly three scene areas');
  const hashes=new Set();
  const sources=[];
  for(const area of AREAS){
    const scene=manifest.scenes?.[area];
    if(!scene||scene.status!=='review'||scene.review!==null)
      throw new Error(area+' is not awaiting art review');
    for(const kind of KINDS){
      const record=pack.scenes[area]?.sources?.[kind];
      const expectedPath='assets/'+area+'-'+kind+'.png';
      if(record?.path!==expectedPath||record.reviewOnly!==true||
        record.independentComposition!==true)
        throw new Error(area+'/'+kind+': expected independently painted review PNG at '+expectedPath);
      const bytes=read(join(sourceDir,expectedPath));
      const realHash=sha(bytes);
      if(realHash!==record.sha256)throw new Error(area+'/'+kind+': original PNG SHA mismatch');
      const declared=kind==='desktop'?scene.candidate:scene.mobileCandidate;
      if(realHash!==declared?.sourceSHA256)
        throw new Error(area+'/'+kind+': package original disagrees with Git manifest');
      if(hashes.has(realHash))throw new Error('Reused original bytes across scenes: '+area+'/'+kind);
      hashes.add(realHash);
      const {width,height}=pngNativeDimensions(bytes);
      if(record.pixels?.[0]!==width||record.pixels?.[1]!==height||
        declared.nativeWidth!==width||declared.nativeHeight!==height)
        throw new Error(area+'/'+kind+': claimed native source dimensions do not match PNG IHDR');
      const [minW,minH]=MINIMUM[kind];
      const nativePass=width>=minW&&height>=minH;
      const samples=VIEWPORTS.filter(v=>v.kind===kind).map(v=>{
        const scale=effectiveCoverScale(width,height,v);
        return {profile:v.id,effectiveCoverScale:Number(scale.toFixed(3)),
          upsample:scale>1.001};
      });
      const retinaPass=samples.every(x=>!x.upsample);
      sources.push({scene:area,kind,path:expectedPath,sha256:realHash,
        width,height,bytes:bytes.length,minimum:{width:minW,height:minH},
        nativePass,retinaPass,samples});
    }
  }
  return {
    version:1,
    status:'review',approvedForProduction:false,
    note:'Pixel and hash evidence only; this report does not grant visual, copyright or gameplay approval.',
    sourceCount:sources.length,
    nativePassing:sources.filter(x=>x.nativePass).length,
    retinaPassing:sources.filter(x=>x.retinaPass).length,
    productionReady:false,
    sources,
  };
}

export function reportMarkdown(report){
  const body=[
    '# R12 独立场景原图像素核查',
    '',
    '**审核状态：仅 review；严禁直接发布生产图片。**',
    '',
    '原图数：'+report.sourceCount+'；达到原生最低尺寸：'+report.nativePassing+
      '；当前四档位均无放大：'+report.retinaPassing+'。',
    '',
    '| 场景 | 画幅 | 原生尺寸 | 最低尺寸 | 高密屏有效放大 | 状态 |',
    '| --- | --- | --- | --- | ---: | --- |',
  ];
  for(const x of report.sources){
    const key=x.kind==='desktop'?'pc-1648-dpr2':'phone-390x844-dpr2';
    const scale=x.samples.find(y=>y.profile===key).effectiveCoverScale;
    body.push('| '+x.scene+' | '+x.kind+' | '+x.width+'×'+x.height+
      ' | '+x.minimum.width+'×'+x.minimum.height+' | '+scale+'× | '+
      (x.nativePass&&x.retinaPass?'像素候选合格':'需重新绘制原生细节')+' |');
  }
  body.push('', '> 有效放大系数是技术风险指标，不代表人眼画质评分。'+
    '禁止用插值放大现有图片来满足尺寸，仍须人工审核图源、文本伪影、手机构图与互动热点。',
    '');
  return body.join('\n');
}

function parseFlags(argv){
  const options={};
  for(let i=0;i<argv.length;i++){
    const a=argv[i];
    if(!a.startsWith('--'))throw new Error('Unknown argument '+a);
    const eq=a.indexOf('=');
    const key=eq<0?a.slice(2):a.slice(2,eq);
    const val=eq<0?argv[++i]:a.slice(eq+1);
    if(!['source-dir','out','strict'].includes(key)||!val||key in options)
      throw new Error('Invalid flag --'+key);
    options[key]=val;
  }
  if(!options['source-dir']||!options.out)
    throw new Error('Usage: node scripts/verify-r12-source-pack.mjs --source-dir <unzipped-pack> --out <report-dir> [--strict true]');
  if(options.strict&&options.strict!=='true')throw new Error('--strict accepts true only');
  return options;
}

function main(){
  const args=parseFlags(process.argv.slice(2));
  const src=resolve(args['source-dir']);
  const out=resolve(args.out);
  if(!existsSync(join(src,'review-manifest.json')))
    throw new Error('Missing review-manifest.json; unpack review ZIP first');
  const pack=JSON.parse(readFileSync(join(src,'review-manifest.json'),'utf8'));
  const manifest=JSON.parse(readFileSync(
    join(ROOT,'public/art/world-scenes/r12-scene-manifest.json'),'utf8'));
  const report=inspectSourcePack({sourceDir:src,pack,manifest});
  mkdirSync(out,{recursive:true});
  writeFileSync(join(out,'r12-source-pixel-report.json'),JSON.stringify(report,null,2)+'\n');
  writeFileSync(join(out,'r12-source-pixel-report.md'),reportMarkdown(report));
  console.log('[r12] validated '+report.sourceCount+' real PNG originals; '+
    report.nativePassing+' native and '+report.retinaPassing+' retina pass');
  console.log('[r12] reports in '+out+'; no asset is promoted or copied to production');
  if(args.strict==='true'&&report.sources.some(x=>!x.nativePass||!x.retinaPass)){
    console.error('[r12] strict source pixel budget FAILED; create new original art, do not upscale');
    process.exitCode=1;
  }
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  try{main();}catch(e){console.error(e.message);process.exitCode=1;}
}
