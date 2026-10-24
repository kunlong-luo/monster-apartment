import { Application, Container, Graphics, Text } from 'pixi.js';
import { BOARD_SIZE, WIDTH, MACHINES, WORKERS, linked } from './workshop-engine';
import type { WorkshopState, WorkerId, Craft } from './workshop-engine';

export type LabSelect={plot:(index:number)=>void};
export type LabView={sync:(state:WorkshopState,selected:number|null)=>void; destroy:()=>void};

/** A deliberately temporary, playable *greybox*, not the game's art direction.
 * Everything interactive lives in PixiJS/WebGL, including the plot hit areas.
 * Real painted bitmap frames are handled by pixi-stage.ts after art approval. */
const W=1050, H=645, CELL=146, GAP=14, LEFT=131, TOP=104;
const COLORS:Record<Craft,number>={well:0x73d4eb,garden:0x95d5a0,kiln:0xffbe79};
const COLORS_DARK:Record<Craft,number>={well:0x225c75,garden:0x315f4b,kiln:0x7d493a};
const glabel=(s:string,size=13,color=0xe9dbc5,bold=false)=>
  new Text({text:s,style:{fontFamily:'Arial, sans-serif',fontSize:size,
    fill:color,fontWeight:bold?'700':'400'}});
const plotXY=(index:number)=>({x:LEFT+index%WIDTH*(CELL+GAP),
  y:TOP+Math.floor(index/WIDTH)*(CELL+GAP)});
function frame(x:number,y:number,w:number,h:number,fill:number,border:number){
  return new Graphics().roundRect(x,y,w,h,13).fill(fill)
    .stroke({width:2,color:border,alpha:.9});
}
function fixture(kind:Craft,x:number,y:number){
  const c=new Container();c.position.set(x,y);
  const base=new Graphics().ellipse(0,48,52,15).fill({color:0x0b1825,alpha:.72});
  c.addChild(base);
  const shape=new Graphics();
  if(kind==='well'){
    shape.roundRect(-37,-32,74,76,13).fill(0x1f5c73)
      .stroke({color:0x8ad5e5,width:3});
    shape.roundRect(-29,-24,58,58,10).fill(0x4ba9c8)
      .circle(0,-1,19).fill({color:0xb8eff9,alpha:.75})
      .circle(-8,-13,6).fill({color:0xffffff,alpha:.55});
    shape.rect(-5,-49,11,20).fill(0xc3a985);
    shape.ellipse(0,-49,19,5).fill(0x8aadb1).stroke({color:0xd2d5bc,width:2});
  }else if(kind==='garden'){
    shape.roundRect(-41,-16,82,60,9).fill(0x315c49)
      .stroke({color:0x9bc8a0,width:3});
    shape.roundRect(-34,-50,68,73,25).fill({color:0x73baaa,alpha:.35})
      .stroke({color:0xd4e4b6,width:3});
    shape.moveTo(0,16).lineTo(0,-34).stroke({color:0xa6d18d,width:4});
    shape.ellipse(-15,-16,18,10).fill(0x8ed590);
    shape.ellipse(16,-28,18,11).fill(0xa9e6a3);
    shape.ellipse(1,-45,15,10).fill(0x73c78f);
    shape.circle(3,-50,3).fill(0xe6efab);
  }else{
    shape.roundRect(-42,-25,84,68,12).fill(0x663d3b)
      .stroke({color:0xf0ba86,width:4});
    shape.roundRect(-28,-17,56,51,8).fill(0x281f32)
      .circle(0,7,18).fill(0xf8ad61)
      .circle(0,7,9).fill(0xffe1a3);
    shape.rect(-20,-58,24,34).fill(0x98776b).stroke({color:0xdcb385,width:2});
    shape.ellipse(-8,-58,20,5).fill(0x5d5053);
    shape.circle(-21,34,6).fill(0x9f8f83);
    shape.circle(21,34,6).fill(0x9f8f83);
  }
  c.addChild(shape);return c;
}
function workerIcon(id:WorkerId,x:number,y:number){
  const c=new Container();c.position.set(x,y);
  const color= id==='brook'?0x91dff2:id==='fern'?0xa0e4a3:0xffc085;
  const outline= id==='brook'?0x3d8298:id==='fern'?0x517c5a:0x8c4d46;
  const shell=new Graphics().ellipse(0,14,23,7).fill({color:0x07141e,alpha:.5})
    .circle(0,-8,22).fill(color).stroke({color:outline,width:3});
  if(id==='brook'){
    shell.moveTo(-10,-27).lineTo(0,-45).lineTo(10,-27).fill(color);
  }else if(id==='fern'){
    shell.ellipse(-12,-34,15,8).fill(0x75b987);
    shell.ellipse(10,-37,16,7).fill(0x9ed7a3);
  }else{
    shell.moveTo(-19,-27).lineTo(-25,-48).lineTo(-4,-27).fill(0xd58154);
    shell.moveTo(19,-27).lineTo(25,-48).lineTo(4,-27).fill(0xd58154);
  }
  shell.circle(-8,-10,3).fill(0x243649).circle(9,-10,3).fill(0x243649);
  c.addChild(shell);
  const label=glabel(WORKERS[id].zh,12,0xf3e9d5,true);
  label.anchor.set(.5,0);label.position.set(0,17);c.addChild(label);
  return c;
}
export async function mountWorkshopLab(
  element:HTMLElement,state:WorkshopState,callbacks:LabSelect
):Promise<LabView>{
  const app=new Application();
  await app.init({width:W,height:H,background:'#172233',preference:'webgl',
    antialias:true,resolution:Math.min(window.devicePixelRatio||1,2)});
  const canvas=app.canvas as HTMLCanvasElement;
  canvas.style.display='block';
  canvas.style.touchAction='manipulation';
  element.appendChild(canvas);
  const resize=()=>{
    const box=element.getBoundingClientRect();
    const factor=Math.min(box.width/W,box.height/H);
    canvas.style.width=Math.floor(W*factor)+'px';
    canvas.style.height=Math.floor(H*factor)+'px';
  };
  const observer=new ResizeObserver(resize);
  observer.observe(element);resize();
  app.stage.addChild(new Graphics().rect(0,0,W,H).fill(0x172233));
  const glow=new Graphics().ellipse(510,320,480,285)
    .fill({color:0x31495a,alpha:.23});app.stage.addChild(glow);
  const stage=new Container();app.stage.addChild(stage);
  const motes=new Container();app.stage.addChild(motes);
  const moving:Graphics[]=[];
  for(let i=0;i<20;i++){
    const mote=new Graphics().circle(0,0,1+i%3).fill({color:0xefcf9b,alpha:.24});
    mote.position.set(60+i*49%940,35+i*71%560);
    motes.addChild(mote);moving.push(mote);
  }
  app.ticker.add(ticker=>{
    const dt=ticker.deltaTime;
    moving.forEach((m,i)=>{
      m.y-=dt*(.11+i%4*.055);
      if(m.y<0)m.y=H;
    });
  });
  const render=(current:WorkshopState,selected:number|null)=>{
    stage.removeChildren().forEach(child=>child.destroy({children:true}));
    const text=glabel('月光工坊 · 生产区',19,0xebd3b0,true);
    text.position.set(LEFT,48);stage.addChild(text);
    for(let i=0;i<BOARD_SIZE;i++){
      const {x,y}=plotXY(i);
      const machine=current.tiles[i];
      const active=selected===i;
      const border=active?0xffdea2:machine?COLORS[machine.craft]:0x4c606e;
      const tile=frame(x,y,CELL,CELL,machine?0x213544:0x1d2b39,border);
      tile.eventMode='static';tile.cursor='pointer';
      tile.on('pointertap',()=>callbacks.plot(i));
      stage.addChild(tile);
      const num=glabel(String(i+1).padStart(2,'0'),12,0x8b9aa4);
      num.position.set(x+12,y+9);stage.addChild(num);
      if(!machine){
        const plus=glabel('＋',28,0x4a6976);plus.anchor.set(.5);
        plus.position.set(x+CELL/2,y+CELL/2);stage.addChild(plus);
        continue;
      }
      // Connections are physical routes between adjacent machines.
      if(machine.craft==='garden'){
        const connected=current.tiles.some((other,j)=>
          other?.craft==='well'&&linked(i,j));
        if(!connected){
          const marker=glabel('缺水源',12,0xffab9c,true);
          marker.position.set(x+58,y+9);stage.addChild(marker);
        }
      }
      if(machine.craft==='kiln'){
        const connected=current.tiles.some((other,j)=>
          other?.craft==='garden'&&linked(i,j));
        if(!connected){
          const marker=glabel('缺温室',12,0xffab9c,true);
          marker.position.set(x+54,y+9);stage.addChild(marker);
        }
      }
      const art=fixture(machine.craft,x+CELL/2,y+79);
      art.eventMode='static';art.cursor='pointer';
      art.on('pointertap',()=>callbacks.plot(i));
      stage.addChild(art);
      if(machine.worker){
        const actor=workerIcon(machine.worker,x+CELL-32,y+65);
        actor.eventMode='static';actor.cursor='pointer';
        actor.on('pointertap',()=>callbacks.plot(i));
        stage.addChild(actor);
      }
      const label=glabel(MACHINES[machine.craft].zh+' · '+machine.stored,
        12,COLORS[machine.craft],true);
      label.anchor.set(.5,0);
      label.position.set(x+CELL/2,y+CELL-29);stage.addChild(label);
    }
    // Lines on the floor tell the player that this is one connected factory.
    for(let i=0;i<BOARD_SIZE;i++){
      const first=current.tiles[i];
      if(!first)continue;
      for(let j=i+1;j<BOARD_SIZE;j++){
        const second=current.tiles[j];
        if(!second||!linked(i,j))continue;
        const water=(first.craft==='well'&&second.craft==='garden')||
          (second.craft==='well'&&first.craft==='garden');
        const fiber=(first.craft==='garden'&&second.craft==='kiln')||
          (second.craft==='garden'&&first.craft==='kiln');
        if(!water&&!fiber)continue;
        const a=plotXY(i),b=plotXY(j);
        const pipe=new Graphics().moveTo(a.x+CELL/2,a.y+CELL/2)
          .lineTo(b.x+CELL/2,b.y+CELL/2)
          .stroke({color:water?0x69d2ed:0xd5eaa1,width:7,alpha:.6});
        stage.addChildAt(pipe,0);
      }
    }
  };
  render(state,null);
  return {sync:render,destroy:()=>{
    observer.disconnect();
    app.destroy(true,{children:true});
    canvas.remove();
  }};
}
