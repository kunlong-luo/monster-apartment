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
