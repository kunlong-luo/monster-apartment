/** Four frame ORIGINAL equipment motion candidates, level 2 only.
 * Offline SVG describes tiny moving internal parts; Pixi only receives WebP.
 * These REVIEW atlases may not replace approved hand-painted CG. */
import './prepare-machine-art.mjs';
import sharp from 'sharp';
import {readFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const phase=[-1,0,1,0],strength=[.58,.76,1,.76];
const shape=(kind,attributes)=>'<'+kind+' '+Object.entries(attributes)
  .map(([key,value])=>key+'="'+value+'"').join(' ')+'/>';
const pen=(d,stroke,width,opacity=1)=>shape('path',{d,stroke,'stroke-width':width,
  'stroke-linejoin':'round','stroke-linecap':'round',fill:'none',opacity});
const clip={
  well:'M 181 235 L 333 235 L 331 353 Q 259 377 184 353 Z',
  garden:'M 177 345 L 181 198 Q 190 129 255 122 Q 323 130 339 204 L 346 345 Z',
  kiln:'M 204 351 L 203 256 Q 207 215 256 193 Q 315 214 315 262 L 309 351 Z',
};
function workLayer(craft,index){
  const motion=phase[index],light=strength[index];
  let scene='';
  if(craft==='well'){
    const y=296+motion*9,piston=233+motion*13;
    scene+=shape('ellipse',{cx:256,cy:y+6,rx:73,ry:16,fill:'#9feaff',
      opacity:.32+light*.21});
    scene+=pen('M 185 '+y+' Q 218 '+(y-17)+' 255 '+y+
      ' Q 287 '+(y+13)+' 332 '+(y-4),'#e5ffff',4,.8);
    scene+=pen('M 256 '+piston+' v55','#f7d29b',12);
    scene+=shape('rect',{x:238,y:piston+41,width:36,height:16,rx:5,
      fill:'#36465b',stroke:'#f5dba7','stroke-width':3});
    for(let i=0;i<14;i++)scene+=shape('circle',{
      cx:199+(i*39)%120,cy:247+(i*29+index*17)%103,
      r:2+i%4,fill:'#d7fbff',opacity:.36+(i%3)*.14});
  }else if(craft==='garden'){
    for(let i=0;i<10;i++){
      const x=191+(i*37)%134,y=298+(i*29)%48;
      const tip=x+motion*(9+i%3*2)+(i%2?12:-13);
      const d='M '+x+' '+(y+13)+' Q '+(x-8)+' '+(y-12)+' '+tip+' '+(y-30)
        +' Q '+(tip+17)+' '+(y-38)+' '+(tip+19)+' '+(y-16)
        +' Q '+(tip+8)+' '+(y-7)+' '+x+' '+(y+13);
      scene+=shape('path',{d,fill:i%2?'#c5e0a2':'#87c491',
        stroke:'#e1f6bb','stroke-width':1.4,opacity:.76});
    }
    for(let i=0;i<15;i++)scene+=shape('circle',{
      cx:187+(i*29+index*11)%136,cy:166+(i*41+index*13)%160,
      r:2+i%3,fill:'#edffd3',opacity:.28+light*.44});
  }else{
    scene+=shape('ellipse',{cx:258,cy:294,rx:58+light*10,ry:62+light*12,
      fill:'#ffb358',opacity:.12+light*.2});
    for(let i=0;i<7;i++){
      const x=211+i*15,y=359+(i%3)*3,h=46+((i*17+index*12)%31);
      const d='M '+(x-10)+' '+y+' Q '+(x-14)+' '+(y-h*.46)
        +' '+(x+motion*5)+' '+(y-h)+' Q '+(x+15)+' '+(y-h*.38)
        +' '+(x+10)+' '+y+' Z';
      scene+=shape('path',{d,fill:i%2?'#ff935d':'#ffda81',
        stroke:'#ffdc90','stroke-width':1.2,opacity:.45+light*.35});
    }
    scene+=shape('path',{d:'M 257 '+(246-2*motion)+' L '+(276+3*light)
      +' 288 L 256 '+(330+2*motion)+' L '+(237-3*light)+' 291 Z',
      fill:'#fff2ab',opacity:.18+light*.31});
  }
  return Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" '+
    'width="512" height="512" viewBox="0 0 512 512">'+
    '<defs><clipPath id="cut"><path d="'+clip[craft]+'"/></clipPath></defs>'+
    '<g clip-path="url(#cut)">'+scene+'</g></svg>');
}
for(const craft of ['well','garden','kiln']){
  const folder=resolve(root,'art/production/machines',craft);
  await mkdir(folder,{recursive:true});
  const chassis=await readFile(resolve(folder,'lv2.webp'));
  const frames=[];
  for(let index=0;index<4;index++){
    const overlay=await sharp(workLayer(craft,index)).png().toBuffer();
    const input=await sharp(chassis)
      .composite([{input:overlay,left:0,top:0}]).png().toBuffer();
    frames.push({input,left:index*512,top:0});
  }
  await sharp({create:{width:2048,height:512,channels:4,
    background:{r:0,g:0,b:0,alpha:0}}}).composite(frames)
    .webp({quality:92,effort:4,alphaQuality:100})
    .toFile(resolve(folder,'working.webp'));
  console.log('[machine-art] '+craft+' four aligned Lv.2 review frames');
}
