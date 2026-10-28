import { Texture } from 'pixi.js';
import type { Craft, WorkerId } from './workshop-engine';

/** Authored Canvas2D bitmap textures. 8 independently painted poses per
 * creature, cached as GPU textures. This is a transitional raster art pass
 * (not the eventual commissioned character sprite sheets). Crucially, the
 * gameplay stage never draws SVG silhouettes or recolors DOM circles.
 */
type Ctx=CanvasRenderingContext2D;
const PI=Math.PI;
import {drawCreature,cvs,oval,curve,shade,leaf,glint,fleckNoise} from './worker-canvas';
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
