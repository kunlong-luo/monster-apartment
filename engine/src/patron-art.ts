import {Texture} from 'pixi.js';

/** Mature adult (28) fantasy witch patron, Moonveil/Yuesha. Bespoke
 * raster bust: no reused childlike worker puppet and no SVG elements.
 * Off-shoulder midnight bodice, short cape, open waist with golden belt,
 * long slit skirt, gloves, metal jewelry. Non-explicit stylization.
 */
const TWO=Math.PI*2;
function path(g:CanvasRenderingContext2D,points:number[],stroke:string,width=2){
  g.beginPath();g.moveTo(points[0],points[1]);
  for(let i=2;i<points.length;i+=2)g.lineTo(points[i],points[i+1]);
  g.strokeStyle=stroke;g.lineWidth=width;g.lineCap='round';g.stroke();
}
function oval(g:CanvasRenderingContext2D,x:number,y:number,rx:number,ry:number,color:string){
  g.beginPath();g.ellipse(x,y,rx,ry,0,0,TWO);g.fillStyle=color;g.fill();
}
function texturing(g:CanvasRenderingContext2D,seed:number){
  let s=seed;
  const rng=()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};
  for(let i=0;i<420;i++){
    g.globalAlpha=.045+rng()*.085;
    g.fillStyle=rng()>.5?'#ffe8c0':'#151428';
    const x=48+rng()*240,y=40+rng()*370;
    g.fillRect(x,y,1+rng()*1.6,1+rng()*2.5);
  }
  g.globalAlpha=1;
}
function frame(index:number):HTMLCanvasElement{
  const canvas=document.createElement('canvas');canvas.width=360;canvas.height=480;
  const g=canvas.getContext('2d');if(!g)throw Error('Patron canvas unavailable');
  const bob=Math.sin(index/8*TWO)*3.5;
  const sway=Math.sin(index/8*TWO)*4;
  // Warm moon-magic halo and etched rim — transparent sprite overall.
  const halo=g.createRadialGradient(185,225,30,185,230,165);
  halo.addColorStop(0,'#b7a1e54f');
  halo.addColorStop(.6,'#ac8ccd24');
  halo.addColorStop(1,'#00000000');
  g.fillStyle=halo;g.fillRect(5,40,355,410);
  g.save();g.translate(sway*.4,bob);
  // Back cape with two separately moving pointed tails.
  g.beginPath();g.moveTo(120,176);g.bezierCurveTo(70,219,58,318,37,437);
  g.quadraticCurveTo(106+sway,416,139,359);
  g.quadraticCurveTo(180,375,210,354);
  g.quadraticCurveTo(238,430,316,448);
  g.bezierCurveTo(297,336,283,228,240,168);g.closePath();
  const cape=g.createLinearGradient(50,176,300,448);
  cape.addColorStop(0,'#3e4268');cape.addColorStop(.45,'#292442');cape.addColorStop(1,'#543958');
  g.fillStyle=cape;g.fill();
  g.strokeStyle='#bf9779';g.lineWidth=4;g.stroke();
  // Flowing chestnut-violet hair, distinct adult angular character silhouette.
  g.beginPath();g.moveTo(105,180);g.bezierCurveTo(59,111,105,51,166,63);
  g.bezierCurveTo(229,29,279,110,252,193);
  g.bezierCurveTo(303,268,270,329,286,379);
  g.bezierCurveTo(237,348,242,289,216,246);
  g.bezierCurveTo(161,262,101,301,65,364);
  g.bezierCurveTo(91,282,79,229,105,180);g.closePath();
  const hair=g.createLinearGradient(85,70,278,375);
  hair.addColorStop(0,'#d8b2ac');hair.addColorStop(.3,'#766280');
  hair.addColorStop(.8,'#453452');hair.addColorStop(1,'#221e3e');
  g.fillStyle=hair;g.fill();
  g.strokeStyle='#e8b6a0';g.lineWidth=3;g.stroke();
  // Mature face proportions and neckline, elongated, sharply defined.
  g.beginPath();g.moveTo(158,178);g.lineTo(158,219);
  g.quadraticCurveTo(179,241,201,220);g.lineTo(205,183);g.closePath();
  g.fillStyle='#edb49e';g.fill();
  // Exposed shoulders, arms and soft collarbone.
  g.beginPath();g.moveTo(153,220);g.bezierCurveTo(126,228,111,226,98,239);
  g.quadraticCurveTo(73,279,87,340);g.lineTo(121,333);
  g.lineTo(129,291);g.quadraticCurveTo(154,296,179,304);
  g.quadraticCurveTo(214,296,239,292);g.lineTo(246,335);
  g.lineTo(280,333);g.quadraticCurveTo(293,268,259,239);
  g.quadraticCurveTo(244,230,205,221);g.closePath();
  const skin=g.createLinearGradient(103,209,262,345);
  skin.addColorStop(0,'#ffe1bf');skin.addColorStop(.55,'#eeb29a');skin.addColorStop(1,'#bf817e');
  g.fillStyle=skin;g.fill();g.lineWidth=2;g.strokeStyle='#915d75';g.stroke();
  path(g,[144,252,166,259,180,258,198,258,218,252],'#ae7c79',2);
  // Midnight-blue off-shoulder structured bodice and cropped waist.
  g.beginPath();g.moveTo(127,260);g.lineTo(148,268);
  g.quadraticCurveTo(176,304,181,298);
  g.quadraticCurveTo(202,301,224,270);
  g.lineTo(244,261);g.lineTo(249,318);
  g.quadraticCurveTo(225,346,204,344);
  g.lineTo(203,377);g.lineTo(153,377);g.lineTo(153,342);
  g.quadraticCurveTo(132,339,119,318);g.closePath();
  const bodice=g.createLinearGradient(115,251,248,377);
  bodice.addColorStop(0,'#4c5976');bodice.addColorStop(.58,'#222b4b');bodice.addColorStop(1,'#666078');
  g.fillStyle=bodice;g.fill();g.strokeStyle='#dec090';g.lineWidth=3.4;g.stroke();
  // Fine waist cutout, non-explicit and still clearly adult costume.
  g.beginPath();g.moveTo(155,346);g.quadraticCurveTo(178,357,203,346);
  g.lineTo(202,370);g.quadraticCurveTo(178,377,154,371);g.closePath();
  g.fillStyle='#e5a58f';g.fill();
  // Belt, long slit skirt, exposed leg on one side.
  g.beginPath();g.moveTo(153,370);g.lineTo(206,370);
  g.lineTo(250,465);g.lineTo(104,465);g.closePath();
  g.fillStyle='#2e2a4a';g.fill();g.strokeStyle='#ac8a87';g.lineWidth=3;g.stroke();
  g.beginPath();g.moveTo(205,397);g.lineTo(241,464);g.lineTo(193,465);g.closePath();
  g.fillStyle='#d99a8e';g.fill();
  path(g,[146,378,205,378],'#e7bf88',7);
  oval(g,182,379,9,8,'#eac990');oval(g,182,379,4,4,'#a7d8d2');
  // Slender gloves wrapping bare upper arms.
  path(g,[103,306,98,352,112,388],'#282941',18);
  path(g,[260,303,274,351,258,389],'#30314e',18);
  path(g,[100,320,106,333],'#d9b289',2);
  path(g,[271,320,268,333],'#d9b289',2);
  // Face, with pointed elf ears, pronounced high cheekbones.
  g.beginPath();g.moveTo(120,146);g.lineTo(100,145);g.lineTo(118,166);g.closePath();
  g.fillStyle='#eab09f';g.fill();
  g.beginPath();g.moveTo(235,147);g.lineTo(257,140);g.lineTo(237,164);g.closePath();
  g.fillStyle='#d59b93';g.fill();
  g.beginPath();g.moveTo(133,111);g.bezierCurveTo(147,89,205,87,223,118);
  g.lineTo(230,160);g.bezierCurveTo(222,193,202,211,179,214);
  g.bezierCurveTo(156,207,135,190,127,157);g.closePath();
  const face=g.createRadialGradient(161,124,5,181,145,90);
  face.addColorStop(0,'#ffe0bd');face.addColorStop(1,'#c68f92');
  g.fillStyle=face;g.fill();
  g.strokeStyle='#9e727c';g.lineWidth=2;g.stroke();
  // Lids animate, not overall static image transformation.
  if(index===3){
    path(g,[149,159,160,162,169,159],'#5a3f51',3);
    path(g,[191,159,202,162,214,158],'#5a3f51',3);
  }else{
    oval(g,160,156,5.8,7.8,'#4e6677');oval(g,202,156,5.8,7.8,'#506474');
    oval(g,158,153,1.8,2.8,'#fff8d9');oval(g,200,153,1.8,2.8,'#fff8d9');
    path(g,[147,151,160,146,173,152],'#513c53',2.6);
    path(g,[189,151,202,146,216,151],'#513c53',2.6);
  }
  path(g,[174,175,181,176,185,174],'#bb777d',1.8);
  path(g,[168,190,180,195,191,190],'#b46c78',3);
  // Wispy hair framing face: separate gently moving locks.
  g.beginPath();g.moveTo(125,143);g.quadraticCurveTo(123,111,142,104);
  g.quadraticCurveTo(155,90,164,95);
  g.quadraticCurveTo(154,129,131,149);g.closePath();
  g.fillStyle='#8b6d7d';g.fill();
  g.beginPath();g.moveTo(205,95);g.quadraticCurveTo(236,103,230,150);
  g.quadraticCurveTo(231,188,251+sway,230);
  g.quadraticCurveTo(224,216,218,172);g.closePath();
  g.fillStyle='#7d6073';g.fill();
  path(g,[125,141,140,112,163,98],'#dfb29e',2.5);
  path(g,[219,117,229,161,243+sway,205],'#b39396',2.2);
  // Silver crest and chain earrings.
  g.beginPath();g.moveTo(164,102);g.lineTo(179,77);g.lineTo(197,103);
  g.fillStyle='#d8b687';g.fill();
  oval(g,180,92,5,9,'#8dcdcf');oval(g,180,87,1.5,4,'#ecffff');
  oval(g,242,170,3,4,'#f3d8a7');path(g,[242,170,245,192],'#ffe2bb',2);
  // Subtle magical drifting sparkles.
  for(let n=0;n<14;n++){
    const x=55+(n*47)%235,y=35+(n*59)%380;
    if(Math.abs(x-180)<64&&Math.abs(y-166)<55)continue;
    const a=.2+.5*(1+Math.sin(index*.6+n))/2;
    g.globalAlpha=a;
    oval(g,x,y,1.4+n%3,2+n%2,'#f2dab1');
  }
  g.globalAlpha=1;
  texturing(g,index+223);
  g.restore();return canvas;
}
let cachedFrames:Texture[]|null=null;
export function patronFrames():Texture[]{
  if(!cachedFrames)cachedFrames=Array.from({length:8},(_,i)=>Texture.from(frame(i)));
  return cachedFrames;
}
