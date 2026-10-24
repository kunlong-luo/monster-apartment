import { Application, AnimatedSprite, Container, Graphics, Sprite, Text } from 'pixi.js';
import { makeRasterArt } from './raster-sprites';
import { BOARD_SIZE, WIDTH, MACHINES, WORKERS, linked } from './workshop-engine';
import type { WorkshopState, WorkerId, Craft } from './workshop-engine';

export type LabSelect={plot:(index:number)=>void};
export type LabView={sync:(state:WorkshopState,selected:number|null)=>void; destroy:()=>void};

/** A deliberately temporary, playable *greybox*, not the game's art direction.
 * Everything interactive lives in PixiJS/WebGL, including the plot hit areas.
 * Real painted bitmap frames are handled by pixi-stage.ts after art approval. */
const W=1050, H=645, CELL=146, GAP=14, LEFT=131, TOP=104;
const COLORS:Record<Craft,number>={well:0x73d4eb,garden:0x95d5a0,kiln:0xffbe79};
const glabel=(s:string,size=13,color=0xe9dbc5,bold=false)=>
  new Text({text:s,style:{fontFamily:'Arial, sans-serif',fontSize:size,
    fill:color,fontWeight:bold?'700':'400'}});
const plotXY=(index:number)=>({x:LEFT+index%WIDTH*(CELL+GAP),
  y:TOP+Math.floor(index/WIDTH)*(CELL+GAP)});
function frame(x:number,y:number,w:number,h:number,fill:number,border:number){
  return new Graphics().roundRect(x,y,w,h,13).fill(fill)
    .stroke({width:2,color:border,alpha:.9});
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
  const art=makeRasterArt();
  const backdrop=new Sprite(art.backdrop);
  backdrop.width=W;backdrop.height=H;app.stage.addChild(backdrop);
  // 8 different bitmap pose frames per creature, assembled once and reused.
  element.dataset.renderer='pixi-webgl-bitmap';
  element.dataset.workerFrames='8';
  const stage=new Container();app.stage.addChild(stage);
  const motes=new Container();app.stage.addChild(motes);
  const moving:Graphics[]=[];
  const actors:AnimatedSprite[]=[];
  const machineArt:Sprite[]=[];
  let flowPaths:{from:{x:number;y:number};to:{x:number;y:number};tint:number}[]=[];
  const flowLayer=new Graphics();
  app.stage.addChild(flowLayer);
  let elapsed=0;
  for(let i=0;i<20;i++){
    const mote=new Graphics().circle(0,0,1+i%3).fill({color:0xefcf9b,alpha:.24});
    mote.position.set(60+i*49%940,35+i*71%560);
    motes.addChild(mote);moving.push(mote);
  }
  app.ticker.add(ticker=>{
    const dt=ticker.deltaTime;
    elapsed+=dt/60;
    moving.forEach((m,i)=>{
      m.y-=dt*(.11+i%4*.055);
      if(m.y<0)m.y=H;
    });
    for(const [index,machine] of machineArt.entries()){
      // Small working rhythm; not a CSS wobble applied to the entire scene.
      machine.y+=(Math.sin(elapsed*3+index*.8)-Math.sin((elapsed-dt/60)*3+index*.8))*.5;
    }
    flowLayer.clear();
    for(const [i,flow] of flowPaths.entries()){
      const progress=(elapsed*.36+i*.31)%1;
      const x=flow.from.x+(flow.to.x-flow.from.x)*progress;
      const y=flow.from.y+(flow.to.y-flow.from.y)*progress;
      flowLayer.circle(x,y,5).fill({color:flow.tint,alpha:.9});
      flowLayer.circle(x,y,12).fill({color:flow.tint,alpha:.13});
    }
  });
  const render=(current:WorkshopState,selected:number|null)=>{
    for(const actor of actors)actor.stop();
    actors.length=0;machineArt.length=0;flowPaths=[];
    stage.removeChildren().forEach(child=>child.destroy({children:true}));
    const text=glabel('月光工坊 · 生产区',19,0xebd3b0,true);
    text.position.set(LEFT,48);stage.addChild(text);
    for(let i=0;i<BOARD_SIZE;i++){
      const {x,y}=plotXY(i);
      const machine=current.tiles[i];
      const active=selected===i;
      const border=active?0xffdea2:machine?COLORS[machine.craft]:0x4c606e;
      const tile=new Sprite(art.floor);
      tile.position.set(x,y);tile.width=CELL;tile.height=CELL;
      tile.tint=machine?0xffffff:0xb8c7d0;
      tile.eventMode='static';tile.cursor='pointer';
      tile.on('pointertap',()=>callbacks.plot(i));
      stage.addChild(tile);
      // Hit border is a thin interaction guide, not the machine artwork.
      const guide=frame(x,y,CELL,CELL,0x1b324b,border);
      guide.alpha=active?.8:.18;
      guide.eventMode='none';
      stage.addChild(guide);
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
      const fixture=new Sprite(art.machines[machine.craft]);
      fixture.anchor.set(.5,1);
      fixture.position.set(x+CELL*.49,y+CELL*.92);
      fixture.width=CELL*.89;fixture.height=CELL*.88;
      fixture.eventMode='static';fixture.cursor='pointer';
      fixture.on('pointertap',()=>callbacks.plot(i));
      stage.addChild(fixture);machineArt.push(fixture);
      if(machine.worker){
        const actor=new AnimatedSprite(art.workers[machine.worker]);
        actor.anchor.set(.5,1);
        actor.position.set(x+CELL*.77,y+CELL*.94);
        actor.width=CELL*.60;actor.height=CELL*.60;
        actor.animationSpeed=.13+(.01*(i%3));
        actor.loop=true;actor.gotoAndPlay(i%8);
        actor.eventMode='static';actor.cursor='pointer';
        actor.on('pointertap',()=>callbacks.plot(i));
        stage.addChild(actor);actors.push(actor);
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
        if(first.worker&&second.worker){
          flowPaths.push({from:{x:a.x+CELL/2,y:a.y+CELL/2},
            to:{x:b.x+CELL/2,y:b.y+CELL/2},tint:water?0x73d6ef:0xc7f1a9});
        }
      }
    }
  };
  render(state,null);
  return {sync:render,destroy:()=>{
    observer.disconnect();
    actors.forEach(actor=>actor.stop());
    app.destroy(true,{children:true});
    canvas.remove();
  }};
}
