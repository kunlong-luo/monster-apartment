/** Deterministic, non-destructive halo cleanup for unapproved machine CG.
 * The source 512x512 curated WebP (with provenance SHA-256) is never edited.
 * Only an opt-in preview output is processed. Production-ready paintings bypass
 * this procedure entirely. Original RGB colors and upper chimney smoke remain.
 */
import sharp from 'sharp';

const CANVAS=512;
/** @param {string} source  @param {string} output */
export async function prepareMachineReviewSprite(source,output){
  const {data,info}=await sharp(source).ensureAlpha().raw()
    .toBuffer({resolveWithObject:true});
  if(info.width!==CANVAS||info.height!==CANVAS||info.channels!==4)
    throw Error('Curated preview needs 512x512 RGBA WebP: '+source);
  let corrected=0,nonEmpty=0;
  const bottomStart=Math.round(info.height*.77);
  for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++){
    const i=(y*info.width+x)*4;
    const alpha=data[i+3];
    if(alpha>6)nonEmpty++;
    // The source concept sheet has near-neutral white masking residue under
    // the metal feet. A tightly constrained, BOTTOM-only luminance key removes
    // its light edge without damaging gold trim, colored glass, fire or steam.
    if(y<bottomStart||alpha<1)continue;
    const r=data[i],g=data[i+1],b=data[i+2];
    const lo=Math.min(r,g,b),hi=Math.max(r,g,b);
    const mean=(r+g+b)/3;
    if(lo<=165||hi-lo>=45||mean<=170)continue;
    const keep=Math.max(0,Math.min(1,(210-mean)/50));
    const cleaned=Math.round(alpha*keep);
    if(cleaned<alpha){data[i+3]=cleaned;corrected++;}
  }
  if(nonEmpty<16000||corrected<20)
    throw Error('Unexpectedly empty or unprocessed machine review image: '+source);
  const result=await sharp(data,{raw:{width:CANVAS,height:CANVAS,channels:4}})
    .webp({quality:94,alphaQuality:100,effort:4}).toFile(output);
  if(result.width!==CANVAS||result.height!==CANVAS)
    throw Error('Preview changed painting dimensions: '+source);
  console.log('[machine-review] cleaned '+corrected+
    ' neutral underside fringe pixels: '+source);
  return {corrected,bytes:result.size};
}
