/** Four-frame lighting study anchored to the exact imported Lv.2 painted chassis.
 * This is an OFFLINE review aid, not a mechanical animation or a ready game
 * asset. All frames retain precisely the same transparent pixels/silhouette.
 * Production never loads these files, even if the review URL is omitted.
 */
import sharp from 'sharp';

const FRAME_ENERGY=[.045,.14,.26,.12];
const FRAME_SCAN=[.35,.46,.58,.70];
const PALETTES={
  well:[108,225,242],
  garden:[174,233,151],
  kiln:[255,168,108],
};
const SIZE=512;
const clamp=(n,min=0,max=1)=>Math.max(min,Math.min(max,n));

function pigmentWeight(craft,r,g,b){
  if(craft==='well')return clamp((b-r+24)/110)*clamp((b-55)/100);
  if(craft==='garden')return clamp((g-r+24)/108)*clamp((g-52)/106);
  if(craft==='kiln')return clamp((r-b+24)/110)*clamp((r-64)/100);
  throw Error('Unknown machine for painted light study: '+craft);
}

/** @returns {Promise<{changedPixels:number;bytes:number}>} */
export async function preparePaintedMachineLightStudy(source,destination,craft){
  if(!(craft in PALETTES))throw Error('Unknown craft '+craft);
  const {data,info}=await sharp(source).ensureAlpha().raw()
    .toBuffer({resolveWithObject:true});
  if(info.width!==SIZE||info.height!==SIZE||info.channels!==4)
    throw Error('Painted light study needs a 512x512 RGBA chassis: '+source);
  const entries=[];
  let changedPixels=0;
  for(let frame=0;frame<4;frame++){
    const pixels=Buffer.from(data);
    const [tr,tg,tb]=PALETTES[craft];
    for(let y=0;y<SIZE;y++)for(let x=0;x<SIZE;x++){
      const offset=(y*SIZE+x)*4;
      const a=data[offset+3];
      if(a<24)continue; // All original alpha values remain untouched.
      const r=data[offset],g=data[offset+1],b=data[offset+2];
      const pigment=pigmentWeight(craft,r,g,b);
      // Never re-light empty alpha, metal silhouette or white masking residue.
      if(pigment<.035)continue;
      const scan=clamp(1-Math.abs(x/SIZE-FRAME_SCAN[frame])/.32);
      const energy=FRAME_ENERGY[frame]*pigment*(.54+.46*scan)*clamp(a/128);
      if(energy<.003)continue;
      const next=[
        Math.round(r*(1-energy)+tr*energy),
        Math.round(g*(1-energy)+tg*energy),
        Math.round(b*(1-energy)+tb*energy)
      ];
      if(next[0]!==r||next[1]!==g||next[2]!==b)changedPixels++;
      pixels[offset]=next[0];pixels[offset+1]=next[1];pixels[offset+2]=next[2];
    }
    const png=await sharp(pixels,{raw:{width:SIZE,height:SIZE,channels:4}})
      .png().toBuffer();
    entries.push({input:png,left:frame*SIZE,top:0});
  }
  // A concept image without colored machinery isn't safe to animate.
  if(changedPixels<400)throw Error('Not enough matching painted pixels in '+source+
    ' ('+changedPixels+'); leave this machine pending for artist review');
  const result=await sharp({create:{width:2048,height:SIZE,channels:4,
    background:{r:0,g:0,b:0,alpha:0}}})
    .composite(entries).webp({quality:92,alphaQuality:100,effort:4})
    .toFile(destination);
  if(result.width!==2048||result.height!==SIZE)
    throw Error('Light-study frame sheet dimensions changed');
  console.log('[machine-light-study] '+craft+' 2048x512 / 4 frames / '+changedPixels+
    ' repainted colored pixels, machine silhouette preserved');
  return {changedPixels,bytes:result.size};
}
