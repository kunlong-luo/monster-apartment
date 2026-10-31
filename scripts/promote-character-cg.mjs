import {readFileSync,writeFileSync,copyFileSync,existsSync,unlinkSync} from 'node:fs';
import {constants} from 'node:fs';
import {resolve,join,dirname,basename,extname} from 'node:path';
import {pathToFileURL} from 'node:url';
import {CG_PATHS,assertCharacterCgReview,auditCharacterCg} from './audit-character-cg.mjs';

const root=resolve(import.meta.dirname,'..');
function parse(argv){
  const a={};
  for(let i=0;i<argv.length;i++){
    const x=argv[i],at=x.indexOf('=');
    if(!x.startsWith('--'))throw Error('Unknown argument '+x);
    const k=at<0?x.slice(2):x.slice(2,at);
    const v=at<0?argv[++i]:x.slice(at+1);
    if(!v||k in a)throw Error('Invalid flag '+k);
    a[k]=v;
  }
  if(Object.keys(a).some(k=>!['card','source','approval'].includes(k))||
     !Object.hasOwn(CG_PATHS,a.card)||!a.source||!a.approval)
    throw Error('Use --card yuesha-eclipse --source candidate.webp --approval review.json');
  return a;
}
function main(argv){
  const {card,source,approval}=parse(argv);
  const src=resolve(source),proof=resolve(approval);
  if(extname(src).toLowerCase()!=='.webp'||!existsSync(src)||!existsSync(proof))
    throw Error('Approved WebP source and review JSON must exist');
  const bytes=readFileSync(src),review=JSON.parse(readFileSync(proof,'utf8'));
  assertCharacterCgReview({card,review,bytes});
  const file=join(root,'public/art/beauty-beasts/characters/cg-manifest.json');
  const original=readFileSync(file),manifest=JSON.parse(original.toString('utf8'));
  const entry=manifest.cards?.[card];
  if(!entry||entry.status!=='portrait'||entry.path!=='public/art/beauty-beasts/characters/'+CG_PATHS[card])
    throw Error('Card already promoted or manifest altered');
  const dest=join(root,entry.path),provenance=join(dirname(dest),
    'cg-provenance-'+basename(dest,'.webp')+'.json');
  if(existsSync(dest)||existsSync(provenance))throw Error('Refusing to overwrite approved art');
  let copied=false,documented=false,changed=false;
  try{
    copyFileSync(src,dest,constants.COPYFILE_EXCL);copied=true;
    writeFileSync(provenance,JSON.stringify(review,null,2)+'\n',{flag:'wx'});documented=true;
    entry.status='production';
    writeFileSync(file,JSON.stringify(manifest,null,2)+'\n');changed=true;
    auditCharacterCg();
    console.log('Promoted '+card+' into game. Run CI, browser visual checks and deploy.');
  }catch(e){
    if(changed)writeFileSync(file,original);
    if(documented)unlinkSync(provenance);
    if(copied)unlinkSync(dest);
    throw e;
  }
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  try{main(process.argv.slice(2));}catch(e){console.error('CG promotion: '+e.message);process.exitCode=1;}
}
