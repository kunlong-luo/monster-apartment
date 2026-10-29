import type {WorkerId} from './workshop-model';
/** Source of truth for three individually rendered alpha-backed worker poses.
 * Shared by React gallery and Pixi; no WebGL/runtime dependency here. */
type Ctx=CanvasRenderingContext2D;
const PI=Math.PI;
export const cvs=(w:number,h:number)=>{
  const canvas=document.createElement('canvas');
  canvas.width=w;canvas.height=h;
  const context=canvas.getContext('2d');
  if(!context)throw Error('Bitmap canvas unavailable');
  return {canvas,g:context};
};
export function oval(g:Ctx,x:number,y:number,rx:number,ry:number,color:string){
  g.beginPath();g.ellipse(x,y,rx,ry,0,0,PI*2);g.fillStyle=color;g.fill();
}
export function curve(g:Ctx,points:number[],color:string,width:number){
  g.beginPath();g.moveTo(points[0],points[1]);
  for(let i=2;i<points.length;i+=2)g.lineTo(points[i],points[i+1]);
  g.lineWidth=width;g.lineCap='round';g.lineJoin='round';g.strokeStyle=color;g.stroke();
}
export function shade(g:Ctx,x:number,y:number,r:number,inner:string,outer:string){
  const d=g.createRadialGradient(x-r*.3,y-r*.42,1,x,y,r);
  d.addColorStop(0,inner);d.addColorStop(.5,inner);d.addColorStop(1,outer);
  return d;
}
export function leaf(g:Ctx,x:number,y:number,ang:number,w:number,h:number,color:string,rib:string){
  g.save();g.translate(x,y);g.rotate(ang);
  g.beginPath();g.moveTo(0,0);g.bezierCurveTo(-w,-h*.4,-w,-h*.88,0,-h);
  g.bezierCurveTo(w,-h*.88,w,-h*.4,0,0);
  g.fillStyle=color;g.fill();g.lineWidth=2.5;g.strokeStyle=rib;g.stroke();
  curve(g,[0,-4,0,-h*.85],rib,1.8);g.restore();
}
export function glint(g:Ctx,x:number,y:number,r:number,color:string){
  g.save();g.globalCompositeOperation='screen';
  const grad=g.createRadialGradient(x,y,0,x,y,r);
  grad.addColorStop(0,color);grad.addColorStop(.32,color);grad.addColorStop(1,'#00000000');
  g.fillStyle=grad;g.beginPath();g.arc(x,y,r,0,PI*2);g.fill();g.restore();
}
function face(g:Ctx,blink:boolean){
  // Adult facial proportions: narrow eyes, defined brow, nose bridge and lips.
  curve(g,[72,47,78,45],'#4b3444',1.3);
  curve(g,[89,45,95,47],'#4b3444',1.3);
  if(blink){
    curve(g,[73,50,79,51],'#493044',1.25);
    curve(g,[88,51,94,50],'#493044',1.25);
  }else{
    oval(g,77,51,2.4,1.7,'#364354');
    oval(g,90,51,2.4,1.7,'#364354');
    oval(g,76.4,50.6,.75,.65,'#fff8eb');
    oval(g,89.4,50.6,.75,.65,'#fff8eb');
  }
  curve(g,[83,52,82.2,58,84,59],'#bd8b80',1.1);
  curve(g,[79,64,83.5,65,88,63.8],'#ae6875',1.35);
}
export function fleckNoise(g:Ctx,seed:number,region:{x:number;y:number;w:number;h:number},count:number,alpha=.09){
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
/** Human-form, alpha-backed transitional poses for the three adult guild
 * members. Keep the stable WorkerId/save model and eight Pixi frames, but
 * never render the former jelly, plant-ball or beetle pet silhouettes.
 * Final high-detail portrait sheets are a separate art deliverable. */
export function drawHumanoid(id:WorkerId,frame:number):HTMLCanvasElement {
  const ratio=3;
  const {canvas,g}=cvs(166*ratio,166*ratio);
  g.scale(ratio,ratio);
  const t=(frame%8)/8*PI*2;
  const sway=Math.sin(t)*1.2;
  const gesture=Math.max(0,Math.sin(t));
  const palette=id==='brook'
    ?{hair:'#25435c',shine:'#75d4e5',skin:'#eecbb6',cloak:'#133b52',
      body:'#317e99',hem:'#a9ebee',gold:'#ebc895',boot:'#17344c'}
    :id==='fern'
    ?{hair:'#393b36',shine:'#c1a07b',skin:'#ead2b2',cloak:'#244138',
      body:'#527961',hem:'#b4dca5',gold:'#dfbf89',boot:'#24392e'}
    :{hair:'#381d2d',shine:'#b55b57',skin:'#e4b598',cloak:'#351827',
      body:'#873d47',hem:'#ea9b78',gold:'#e9b16d',boot:'#29212b'};
  const shape=(points:number[],fill:string|CanvasGradient,stroke:string,width=1.4)=>{
    g.beginPath();g.moveTo(points[0],points[1]);
    for(let i=2;i<points.length;i+=2)g.lineTo(points[i],points[i+1]);
    g.closePath();g.fillStyle=fill;g.fill();g.strokeStyle=stroke;g.lineWidth=width;g.stroke();
  };
  const ellipse=(x:number,y:number,rx:number,ry:number,fill:string)=>oval(g,x,y,rx,ry,fill);
  // Feet and grounded shadow: unmistakable two-legged, upright human anatomy.
  ellipse(82,156,29,4,'#080d1b57');
  g.save();g.translate(0,sway);
  // Flowing coat and hair behind the silhouette.
  shape([60,70,48,80,42,127,57,144,83,132,109,144,125,126,115,78,103,69],
    palette.cloak,'#b798704d',1);
  shape([64,35,54,45,51,78,58,111,71,104,69,58,102,56,111,110,117,78,110,46,99,35],
    palette.hair,palette.shine,1.25);
  // Two separate legs, boots and knees, instead of a spherical creature body.
  g.fillStyle=palette.skin;g.beginPath();g.roundRect(66,117,11,30,4);g.fill();
  g.beginPath();g.roundRect(91,117,11,30,4);g.fill();
  g.fillStyle=palette.boot;g.beginPath();g.roundRect(63,139,15,15,3);g.fill();
  g.beginPath();g.roundRect(90,139,15,15,3);g.fill();
  shape([64,150,78,150,82,155,60,155],palette.boot,palette.gold,1);
  shape([90,150,105,150,111,155,89,155],palette.boot,palette.gold,1);
  curve(g,[67,142,76,142],palette.gold,1.3);
  curve(g,[93,142,103,142],palette.gold,1.3);
  // Ankle-to-knee garment with separate upper body and narrower human waist.
  const coat=g.createLinearGradient(55,73,116,133);
  coat.addColorStop(0,palette.hem);coat.addColorStop(.25,palette.body);
  coat.addColorStop(1,palette.cloak);
  shape([56,79,72,70,96,70,113,80,107,102,112,133,83,138,54,133,62,101],
    coat,palette.gold,1.6);
  shape([65,107,101,107,111,132,82,138,55,132],
    palette.cloak,palette.hem,1.1);
  // Side arms have elbows, forearms and separate hands.
  curve(g,[56,79,46,92,43,113],palette.body,11);
  curve(g,[110,79,121,92,122+4*gesture,112-5*gesture],palette.body,11);
  curve(g,[56,79,47,91,45,106],palette.gold,1.8);
  curve(g,[110,79,120,91,121+4*gesture,106-5*gesture],palette.gold,1.8);
  ellipse(43,116,6,7,palette.skin);
  ellipse(122+4*gesture,115-5*gesture,6,7,palette.skin);
  // Human bust, tailored shoulders, waist belt and embroidered uniform.
  shape([55,80,69,69,98,69,112,80,104,110,63,110],
    palette.body,palette.gold,1.5);
  shape([75,70,83,86,91,70],palette.skin,palette.gold,1);
  curve(g,[62,101,103,101],palette.gold,3.5);
  ellipse(84,102,4.8,3,palette.gold);
  curve(g,[84,86,84,98],palette.hem,1.6);
  curve(g,[75,80,84,86,93,80],palette.gold,1.5);
  // Neck and an adult human face framed by side locks.
  g.fillStyle=palette.skin;g.beginPath();g.roundRect(78,62,12,14,4);g.fill();
  ellipse(83,48,15.5,20,palette.skin);
  ellipse(66,51,2.1,4.3,palette.skin);
  ellipse(100,51,2.1,4.3,palette.skin);
  face(g,frame%8===4);
  // Forehead fringe and asymmetric loose strands.
  shape([66,41,66,29,76,23,94,23,104,32,102,43,92,39,88,32,75,38],
    palette.hair,palette.shine,1.1);
  shape([66,37,60,54,62,88,68,90,71,65,71,46],
    palette.hair,palette.shine,1);
  shape([98,36,104,53,105,88,99,88,94,59,95,41],
    palette.hair,palette.shine,1);
  curve(g,[74,28,85,25,96,30],palette.shine,1.7);
  // Job silhouette and props: water tuning, horticulture, metalwork.
  if(id==='brook'){
    // Flowing ponytail, brass gauge and aqua gemstone on a human uniform.
    shape([99,34,117,45,125,76,115,91,108,77,111,54],
      palette.hair,palette.shine,1.3);
    curve(g,[60,92,69,113,65,131],palette.hem,2);
    ellipse(124+4*gesture,111-5*gesture,10,11,'#255e74');
    ellipse(124+4*gesture,111-5*gesture,7,8,'#a6e7e4');
    ellipse(124+4*gesture,111-5*gesture,3,3,'#256b88');
    curve(g,[123,112,127,107],palette.gold,1.2);
    glint(g,125,109,14,'#d5fbf6');
  }else if(id==='fern'){
    // Elven herbalist: delicate crown, cloak trim and leaf tome.
    leaf(g,72,31,-.8,7,15,'#91bb73','#dde4a8');
    leaf(g,94,30,.7,7,15,'#b2d08a','#e6e9a7');
    curve(g,[53,85,62,119,57,135],palette.hem,2);
    curve(g,[108,86,102,117,110,133],palette.hem,2);
    shape([114+4*gesture,108-5*gesture,137,104,137,126,114,129],
      '#386454',palette.gold,1.2);
    curve(g,[118,112,134,109],palette.hem,1.3);
    leaf(g,125,110,.45,7,20,'#99c98d','#e2e9ae');
  }else{
    // Smith: metal horn-shaped head jewelry (not animal horns),
    // leather apron, oversized protective gauntlet and working hammer.
    shape([63,31,57,14,72,24,75,32],palette.gold,'#774b43',1);
    shape([94,31,109,14,104,37,98,35],palette.gold,'#774b43',1);
    shape([69,99,98,99,106,137,65,137],
      '#553342',palette.gold,2);
    curve(g,[73,108,94,108],palette.hem,1);
    ellipse(53,82,12,7,'#ac7359');ellipse(114,82,12,7,'#ac7359');
    curve(g,[122,114,125,87],palette.gold,4);
    g.save();g.translate(126,84-4*gesture);g.rotate(-.14+gesture*.2);
    g.fillStyle='#76737d';g.beginPath();g.roundRect(-12,-8,26,14,3);g.fill();
    g.strokeStyle=palette.gold;g.lineWidth=1.5;g.stroke();
    curve(g,[-9,-5,9,-5],'#f9d9b8',1.2);g.restore();
    glint(g,102,100,15,'#f5a16d');
  }
  fleckNoise(g,id==='brook'?107:id==='fern'?319:881,{x:53,y:78,w:60,h:56},70,.055);
  g.restore();
  return canvas;
}
