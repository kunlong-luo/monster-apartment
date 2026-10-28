import { Texture } from 'pixi.js';
import type { Craft, WorkerId } from './workshop-engine';

/** Authored Canvas2D bitmap textures. 8 independently painted poses per
 * creature, cached as GPU textures. This is a transitional raster art pass
 * (not the eventual commissioned character sprite sheets). Crucially, the
 * gameplay stage never draws SVG silhouettes or recolors DOM circles.
 */
type Ctx=CanvasRenderingContext2D;
const PI=Math.PI;
const cvs=(w:number,h:number)=>{
  const canvas=document.createElement('canvas');
  canvas.width=w;canvas.height=h;
  const context=canvas.getContext('2d');
  if(!context)throw Error('Bitmap canvas unavailable');
  return {canvas,g:context};
};
function oval(g:Ctx,x:number,y:number,rx:number,ry:number,color:string){
  g.beginPath();g.ellipse(x,y,rx,ry,0,0,PI*2);g.fillStyle=color;g.fill();
}
function curve(g:Ctx,points:number[],color:string,width:number){
  g.beginPath();g.moveTo(points[0],points[1]);
  for(let i=2;i<points.length;i+=2)g.lineTo(points[i],points[i+1]);
  g.lineWidth=width;g.lineCap='round';g.lineJoin='round';g.strokeStyle=color;g.stroke();
}
function shade(g:Ctx,x:number,y:number,r:number,inner:string,outer:string){
  const d=g.createRadialGradient(x-r*.3,y-r*.42,1,x,y,r);
  d.addColorStop(0,inner);d.addColorStop(.5,inner);d.addColorStop(1,outer);
  return d;
}
function leaf(g:Ctx,x:number,y:number,ang:number,w:number,h:number,color:string,rib:string){
  g.save();g.translate(x,y);g.rotate(ang);
  g.beginPath();g.moveTo(0,0);g.bezierCurveTo(-w,-h*.4,-w,-h*.88,0,-h);
  g.bezierCurveTo(w,-h*.88,w,-h*.4,0,0);
  g.fillStyle=color;g.fill();g.lineWidth=2.5;g.strokeStyle=rib;g.stroke();
  curve(g,[0,-4,0,-h*.85],rib,1.8);g.restore();
}
function glint(g:Ctx,x:number,y:number,r:number,color:string){
  g.save();g.globalCompositeOperation='screen';
  const grad=g.createRadialGradient(x,y,0,x,y,r);
  grad.addColorStop(0,color);grad.addColorStop(.32,color);grad.addColorStop(1,'#00000000');
  g.fillStyle=grad;g.beginPath();g.arc(x,y,r,0,PI*2);g.fill();g.restore();
}
function face(g:Ctx,eyeY:number,spacing:number,blink:boolean,nose:string){
  g.fillStyle='#292e42';
  if(blink){
    curve(g,[77-spacing,eyeY+2,83-spacing,eyeY+3,88-spacing,eyeY+1],'#303148',3);
    curve(g,[78+spacing,eyeY+2,84+spacing,eyeY+3,89+spacing,eyeY+1],'#303148',3);
  }else{
    oval(g,83-spacing,eyeY,5.7,8.4,'#292d3f');
    oval(g,83+spacing,eyeY,5.7,8.4,'#292d3f');
    oval(g,81-spacing,eyeY-3,2.15,3,'#fff9e7');
    oval(g,81+spacing,eyeY-3,2.15,3,'#fff9e7');
  }
  oval(g,83,eyeY+10,3,2.6,nose);
  curve(g,[78,eyeY+15,83,eyeY+18,89,eyeY+15],'#815c67',2);
}
function fleckNoise(g:Ctx,seed:number,region:{x:number;y:number;w:number;h:number},count:number,alpha=.09){
  // deterministic raster speckles = canvas texture, not vector sprites.
  let x=seed>>>0;
  const rand=()=>{x=(Math.imul(x,1664525)+1013904223)>>>0;return x/4294967296;};
  g.save();g.globalAlpha=alpha;
  for(let i=0;i<count;i++){
    const px=region.x+rand()*region.w,py=region.y+rand()*region.h;
    oval(g,px,py,.45+rand()*1.25,.4+rand(),rand()>.5?'#fff8df':'#163349');
  }
  g.restore();
}
export function drawCreature(id:WorkerId,frame:number):HTMLCanvasElement {
  // Keep the fallback alpha-backed; render at 3x intrinsic resolution so
  // scaled Pixi worker figures stay antialiased on high-DPI displays.
  // Production-grade painted sprites (if available) replace these frames.
  const ratio=3;
  const {canvas,g}=cvs(166*ratio,166*ratio);
  g.scale(ratio,ratio);
  const p=frame%8,t=p/8*PI*2;
  const bob=Math.sin(t)*2.7;
  const work=Math.max(0,Math.sin(t));
  // No flat circles: colored bounce lights, shadows, silhouette branches.
  oval(g,83,144,42,9,'#0b162338');
  g.save();g.translate(0,bob);
  if(id==='brook'){
    // Water courier: pointed crest, translucent ear fins, jelly-like body.
    leaf(g,53,91,-.48,14,51,'#7dc4d2','#c3f6ec');
    leaf(g,115,93,.45,14,51,'#68b9d5','#b4ebf7');
    const wave=new Path2D();
    wave.moveTo(78,32);wave.bezierCurveTo(66,54,35,78,44,109);
    wave.bezierCurveTo(48,140,105,144,120,116);
    wave.bezierCurveTo(139,87,98,54,78,32);wave.closePath();
    g.fillStyle=shade(g,77,85,70,'#e3fbf4','#2f86b6');g.fill(wave);
    g.strokeStyle='#d1f4f4';g.lineWidth=4;g.stroke(wave);
    oval(g,75,101,44,29,'#b1e7ed88');
    glint(g,60,57,23,'#defeff');
    curve(g,[50,104,59,109,68,109,78,104],'#f3fcff99',4);
    // Crest wave moves as fluid, not an identical scaled frame.
    g.beginPath();g.moveTo(65,45);
    g.quadraticCurveTo(64+8*work,11,85,14);
    g.quadraticCurveTo(102,24,99,41);
    g.strokeStyle='#b3edfb';g.lineWidth=8;g.lineCap='round';g.stroke();
    oval(g,39,106,9,8,'#5abbd3');oval(g,124,107-4*work,10,7,'#6fcbd9');
    face(g,93,20,p===4,'#f6c7d0');
    fleckNoise(g,100,[].length?{x:0,y:0,w:0,h:0}:{x:49,y:56,w:70,h:61},95,.09);
  }else if(id==='fern'){
    // Floral artisan: leaf crown and heavy scarf apron, asymmetric silhouette.
    leaf(g,81,47,-.52,28,53,'#5ea96d','#a9e4a4');
    leaf(g,87,47,.66,27,44,'#b0d780','#e8f2a5');
    const body=new Path2D();
    body.moveTo(83,39);body.bezierCurveTo(51,41,31,68,38,101);
    body.bezierCurveTo(44,137,120,142,130,105);
    body.bezierCurveTo(141,70,121,42,83,39);body.closePath();
    g.fillStyle=shade(g,86,75,79,'#f4eebf','#699b65');g.fill(body);
    g.strokeStyle='#365c58';g.lineWidth=4;g.stroke(body);
    leaf(g,53,87,-.95,13,32,'#a8d58e','#d4f2b4');
    leaf(g,120,89,.83,13,33,'#78ba81','#c4ebbc');
    g.beginPath();g.moveTo(57,115);g.quadraticCurveTo(86,130,113,112);
    g.lineTo(108,135);g.quadraticCurveTo(84,143,62,134);g.closePath();
    g.fillStyle='#f0b59a';g.fill();g.strokeStyle='#b97877';g.lineWidth=2;g.stroke();
    oval(g,55,121,10,7,'#b9bd79');oval(g,115,119-3*work,9,7,'#d2d5a4');
    face(g,91,20,p===5,'#bb8b81');
    oval(g,53,104,7,4,'#e5b6a4aa');oval(g,112,104,7,4,'#e5b6a4aa');
    fleckNoise(g,215,{x:43,y:66,w:80,h:58},90,.07);
  }else{
    // Ember smith: angular charcoal-gold horned beetle, welding eyewear.
    leaf(g,60,66,-.58,24,43,'#3e4155','#eeaf65');
    leaf(g,108,67,.58,24,43,'#404353','#eca968');
    g.beginPath();g.moveTo(43,88);
    g.bezierCurveTo(40,57,56,45,81,43);
    g.bezierCurveTo(113,43,130,59,126,101);
    g.bezierCurveTo(121,142,43,142,43,88);g.closePath();
    g.fillStyle=shade(g,72,76,79,'#b77f68','#302d46');g.fill();
    g.lineWidth=4;g.strokeStyle='#e2a376';g.stroke();
    glint(g,83,92,40,'#f09a4c');
    // Hammer moves through actual pose frames.
    const hammerX=120+8*Math.cos(t);
    g.save();g.translate(hammerX,98-10*work);g.rotate(-.3+work*.38);
    g.fillStyle='#ad8266';g.fillRect(-3,-9,7,34);
    g.fillStyle='#b4b5ad';g.fillRect(-17,-16,33,13);
    g.fillStyle='#f6ddb0';g.fillRect(-15,-15,25,3);g.restore();
    g.fillStyle='#d1ab79';g.beginPath();g.roundRect(47,79,75,22,10);g.fill();
    g.fillStyle='#3c3e4d';g.beginPath();g.roundRect(49,82,30,16,6);g.fill();
    g.beginPath();g.roundRect(89,82,30,16,6);g.fill();
    oval(g,64,89,8,6,'#ffc986');oval(g,103,89,8,6,'#ffc986');
    oval(g,61,87,3,2,'#fff1c4');oval(g,100,87,3,2,'#fff1c4');
    curve(g,[79,90,89,90],'#7a584e',4);
    curve(g,[78,109,85,113,92,109],'#ffddb6',2.5);
    oval(g,57,118,11,7,'#b78260');oval(g,113,121-3*work,10,7,'#ba825d');
    fleckNoise(g,937,{x:48,y:101,w:70,h:26},55,.11);
  }
  g.restore();
  return canvas;
}
function pipe(g:Ctx,x:number,y:number,x2:number,y2:number,width=13){
  curve(g,[x,y,x2,y2],'#2b3444',width+7);
  curve(g,[x,y,x2,y2],'#ac967b',width);
  curve(g,[x-2,y-2,x2-2,y2-2],'#f1ce98',2);
}
export function drawMachine(kind:Craft):HTMLCanvasElement{
  const {canvas,g}=cvs(176,176);
  oval(g,87,147,63,15,'#09121f77');
  pipe(g,38,118,24,143,10);pipe(g,130,118,154,144,10);
  g.beginPath();g.roundRect(25,121,125,20,8);g.fillStyle='#6e594b';g.fill();
  g.strokeStyle='#e5b984';g.lineWidth=3;g.stroke();
  fleckNoise(g,380,{x:21,y:113,w:134,h:24},100,.13);
  if(kind==='well'){
    pipe(g,32,103,32,46,13);pipe(g,145,104,145,64,13);
    g.fillStyle='#4d6975';g.beginPath();g.roundRect(44,47,88,88,25);g.fill();
    g.strokeStyle='#d2b38d';g.lineWidth=6;g.stroke();
    g.fillStyle=shade(g,77,87,57,'#ace9f2','#24759c');
    g.beginPath();g.roundRect(51,54,74,72,19);g.fill();
    glint(g,82,85,43,'#83e5fa');
    oval(g,86,99,27,23,'#b3f3f7aa');
    oval(g,78,91,8,10,'#ffffffad');
    g.beginPath();g.ellipse(87,47,46,12,0,0,PI*2);g.fillStyle='#8c7b6f';g.fill();
    g.strokeStyle='#d6bc9d';g.lineWidth=3;g.stroke();
    pipe(g,87,38,87,17,10);
    glint(g,88,67,22,'#defbff');
  }else if(kind==='garden'){
    g.fillStyle='#576847';g.beginPath();g.roundRect(34,84,110,51,11);g.fill();
    g.strokeStyle='#d5b991';g.lineWidth=4;g.stroke();
    const glass=new Path2D();glass.moveTo(40,89);glass.lineTo(40,65);
    glass.bezierCurveTo(40,12,130,12,137,66);glass.lineTo(137,92);glass.closePath();
    g.fillStyle=shade(g,80,70,79,'#bde5ab','#559e79');g.fill(glass);
    g.strokeStyle='#e5daa7';g.lineWidth=5;g.stroke(glass);
    leaf(g,77,100,-.75,22,53,'#63996e','#e1f2ac');
    leaf(g,105,103,.8,22,62,'#86c876','#e2f9ab');
    leaf(g,62,108,-.6,18,34,'#c0da7a','#ecf2b6');
    leaf(g,117,104,.3,16,35,'#73bc91','#daf3b4');
    curve(g,[49,83,127,83],'#f8efd48c',3);
    curve(g,[86,38,86,115],'#fffbdb88',3);
    glint(g,66,58,28,'#e6ffd0');
  }else{
    pipe(g,88,54,88,15,19);
    g.fillStyle='#6f443d';g.beginPath();g.roundRect(37,58,101,77,12);g.fill();
    g.strokeStyle='#cba77e';g.lineWidth=5;g.stroke();
    g.fillStyle=shade(g,84,93,56,'#ffcc69','#c65036');
    g.beginPath();g.roundRect(49,69,77,53,11);g.fill();
    glint(g,86,98,56,'#ffb74c');
    g.fillStyle='#fff6ae';
    g.beginPath();g.moveTo(87,69);g.lineTo(103,94);g.lineTo(87,117);
    g.lineTo(69,94);g.closePath();g.fill();
    g.strokeStyle='#e8aa6a';g.lineWidth=4;g.stroke();
    g.fillStyle='#594451';g.beginPath();g.roundRect(32,50,110,14,5);g.fill();
    g.strokeStyle='#d6a979';g.stroke();
    oval(g,36,80,9,13,'#b69b77');oval(g,142,84,10,13,'#b59d7f');
    glint(g,88,100,43,'#ffdd7f');
  }
  return canvas;
}
export function drawFloor():HTMLCanvasElement{
  const {canvas,g}=cvs(160,160);
  g.fillStyle='#263542';g.fillRect(0,0,160,160);
  for(let y=0;y<4;y++)for(let x=0;x<4;x++){
    const a=x*40,b=y*40;
    g.fillStyle=(x+y)%2?'#384454':'#3d4a54';
    g.fillRect(a+1,b+1,38,38);
    curve(g,[a+2,b+3,a+36,b+3],'#7a6a58',1.5);
    curve(g,[a+4,b+34,a+35,b+34],'#1b2934',2);
    oval(g,a+9,b+12,1.8,1.8,'#c4a88588');
  }
  fleckNoise(g,201,{x:0,y:0,w:160,h:160},520,.1);
  return canvas;
}
export function drawBackdrop():HTMLCanvasElement{
  const {canvas,g}=cvs(1050,645);
  const sky=g.createLinearGradient(0,0,0,645);
  sky.addColorStop(0,'#102039');sky.addColorStop(.5,'#314357');sky.addColorStop(1,'#443642');
  g.fillStyle=sky;g.fillRect(0,0,1050,645);
  const moon=g.createRadialGradient(825,99,10,825,99,160);
  moon.addColorStop(0,'#f6d5a15c');moon.addColorStop(.5,'#eec19133');
  moon.addColorStop(1,'#1c2d4500');
  g.fillStyle=moon;g.fillRect(660,0,350,270);
  oval(g,825,99,39,39,'#e3d2b4');
  oval(g,817,88,9,7,'#dac4a0');
  fleckNoise(g,616,{x:0,y:0,w:1050,h:430},180,.36);
  // Layered workshop roofline.
  for(let i=0;i<14;i++){
    const x=i*83-30,h=83+(i*47)%160;
    g.fillStyle=i%3===0?'#27394b':'#1f3247';
    g.fillRect(x,414-h,81,h+214);
    g.beginPath();g.moveTo(x-7,414-h);g.lineTo(x+40,380-h);g.lineTo(x+89,414-h);
    g.closePath();g.fill();
    for(let floor=0;floor<3;floor++){
      const wy=449-h+floor*43;
      if(wy<365&&wy>85){
        g.fillStyle='#d9b68068';g.fillRect(x+24,wy,12,22);g.fillRect(x+48,wy,12,22);
      }
    }
  }
  g.fillStyle='#1c303c';g.fillRect(0,432,1050,213);
  for(let i=0;i<9;i++){
    const x=i*140-32;
    g.fillStyle=i%2?'#2c343d':'#343b42';g.fillRect(x,445,117,180);
    g.fillStyle='#a88b6944';g.fillRect(x+5,450,105,3);
  }
  return canvas;
}
let cached:undefined|{
  backdrop:Texture;floor:Texture;machines:Record<Craft,Texture>;
  workers:Record<WorkerId,Texture[]>;
};
export function makeRasterArt(){
  if(cached)return cached;
  const workers={} as Record<WorkerId,Texture[]>;
  const machines={} as Record<Craft,Texture>;
  for(const id of ['brook','fern','cinder'] as const){
    workers[id]=Array.from({length:8},(_,i)=>Texture.from(drawCreature(id,i)));
  }
  for(const kind of ['well','garden','kiln'] as const){
    machines[kind]=Texture.from(drawMachine(kind));
  }
  cached={backdrop:Texture.from(drawBackdrop()),floor:Texture.from(drawFloor()),
    workers,machines};
  return cached;
}
