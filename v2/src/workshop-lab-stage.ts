import { Application, AnimatedSprite, Container, Graphics, Sprite, Text, Texture } from 'pixi.js';
import { makeRasterArt } from './raster-sprites';
import { patronFrames } from './patron-art';
import { BOARD_SIZE, WIDTH, MACHINES, linked, machineLevel } from './workshop-engine';
import type { WorkshopState, Craft } from './workshop-engine';

export type LabSelect={plot:(index:number)=>void; patronTap?:()=>void};
export type LabView={sync:(state:WorkshopState,selected:number|null)=>void; destroy:()=>void};

/** A deliberately temporary, playable *greybox*, not the game's art direction.
 * Everything interactive lives in PixiJS/WebGL, including the plot hit areas.
 * Real painted bitmap frames are handled by pixi-stage.ts after art approval. */
const MOBILE=typeof window!=='undefined'&&
  window.matchMedia('(max-width:610px)').matches;
const W=MOBILE?830:1050,H=MOBILE?820:645;
const CELL=146,GAP=14,LEFT=MOBILE?15:131,TOP=MOBILE?225:104;
const COLORS:Record<Craft,number>={well:0x73d4eb,garden:0x95d5a0,kiln:0xffbe79};
const glabel=(s:string,size=13,color=0xe9dbc5,bold=false)=>
  new Text({text:s,style:{fontFamily:'Moonwork CJK, Arial, sans-serif',fontSize:size,
    fill:color,fontWeight:bold?'700':'400'}});
const plotXY=(index:number)=>({x:LEFT+index%WIDTH*(CELL+GAP),
  y:TOP+Math.floor(index/WIDTH)*(CELL+GAP)});
function frame(x:number,y:number,w:number,h:number,fill:number,border:number){
  return new Graphics().roundRect(x,y,w,h,13).fill(fill)
    .stroke({width:2,color:border,alpha:.9});
}
export async function mountWorkshopLab(
  element:HTMLElement,state:WorkshopState,callbacks:LabSelect,
  assetBase:string=document.baseURI
):Promise<LabView>{
  const app=new Application();
  await app.init({width:W,height:H,background:'#172233',preference:'webgl',
    antialias:true,resolution:Math.min(window.devicePixelRatio||1,2)});
  await document.fonts.load('16px "Moonwork CJK"',
    '月光工坊水汽泵孢子温室晶核熔炉青枝炽角月纱成年魔女');
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
  // The painterly architecture is independent from machines, workers and hit areas.
  // AVIF is an enhancement: unsupported codecs fall back to the legacy scene.
  let painted:Texture|null=null;
  let paintedFloor:Texture|null=null;
  let kilnArtReview:Texture|null=null;
  const paintedDetail:Partial<Record<'well'|'garden',Texture>>={};
  try{
    const image=new Image();
    image.src=new URL('./assets/moon-workshop.avif',assetBase).href;
    await image.decode();
    painted=Texture.from(image);
    const floorImage=new Image();
    floorImage.src=new URL('./assets/moonstone-floor.avif',assetBase).href;
    await floorImage.decode();
    paintedFloor=Texture.from(floorImage);
  }catch{/* keep gameplay available even if an asset cannot decode */}
  // One actual painted, alpha-backed machine crop for visual review only.
  // Never replace all machine art from a flattened screenshot.
  try {
    const kilnImage=new Image();
    kilnImage.src=new URL('./assets/kiln-art-review.avif',assetBase).href;
    await kilnImage.decode();
    kilnArtReview=Texture.from(kilnImage);
  } catch {/* retain interactive fallback sprite when codec or file is absent */}
  // Painterly detail overlays keep the procedural lower machines as a
  // temporary physical base; characters from the concept art are masked out.
  for(const kind of ['well','garden'] as const){
    try{
      const image=new Image();
      image.src=new URL('./assets/'+kind+'-art-review.avif',assetBase).href;
      await image.decode();
      paintedDetail[kind]=Texture.from(image);
    }catch{/* independent codec/image failure does not block production */}
  }
  element.dataset.machineArt=kilnArtReview&&paintedDetail.well&&paintedDetail.garden
    ?'all-painted-machine-reviews':'mixed-machine-art';
  element.dataset.visualTheme=painted?'painted-moonwork':'procedural-fallback';
  element.dataset.floorArt=paintedFloor?'painted-moonstone':'procedural-floor';
  const backdrop=new Sprite(painted??art.backdrop);
  if(painted){
    const cover=Math.max(W/painted.width,H/painted.height);
    backdrop.width=painted.width*cover;backdrop.height=painted.height*cover;
    backdrop.position.set((W-backdrop.width)/2,(H-backdrop.height)/2);
  }else{
    backdrop.width=W;backdrop.height=H;
  }
  app.stage.addChild(backdrop);
  app.stage.addChild(new Graphics().rect(0,0,W,H)
    .fill({color:0x101e2c,alpha:painted?.17:0}));
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
  // Feedback overlays are independent of the rebuildable board scene.
  // A completed shift cannot silently change inventory without visual cues.
  const feedbackLayer=new Container();
  app.stage.addChild(feedbackLayer);
  const feedback:{sprite:Text;age:number;originY:number}[]=[];
  const showFeedback=(message:string,x:number,y:number,color:number)=>{
    if(feedback.length>=6){
      const stale=feedback.shift()!;
      feedbackLayer.removeChild(stale.sprite);
      stale.sprite.destroy();
    }
    const sprite=glabel(message,18,color,true);
    sprite.anchor.set(.5);
    sprite.position.set(x,y);
    sprite.eventMode='none';
    feedbackLayer.addChild(sprite);
    feedback.push({sprite,age:0,originY:y});
  };
  let lastShiftDay=state.day;
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
    for(let i=feedback.length-1;i>=0;i--){
      const effect=feedback[i];
      effect.age+=dt/60;
      effect.sprite.y=effect.originY-Math.min(42,effect.age*34);
      effect.sprite.alpha=Math.max(0,1-effect.age/1.5);
      if(effect.age>=1.5){
        feedbackLayer.removeChild(effect.sprite);
        effect.sprite.destroy();
        feedback.splice(i,1);
      }
    }
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
  // Pure DOM-control changes must never dispose and restart animated sprites.
  // The engine returns immutable world snapshots for all material changes.
  let lastSnapshot:WorkshopState|null=null;
  let lastSelection:number|null=null;
  let sceneRefreshes=0;
  const render=(current:WorkshopState,selected:number|null)=>{
    if(lastSnapshot===current&&lastSelection===selected)return;
    const previousPatronStatus=lastSnapshot?.patron?.status;
    const completedShift=current.day>lastShiftDay&&!!current.last;
    lastShiftDay=current.day;
    lastSnapshot=current;lastSelection=selected;
    element.dataset.sceneRefreshes=String(++sceneRefreshes);
    for(const actor of actors)actor.stop();
    actors.length=0;machineArt.length=0;flowPaths=[];
    stage.removeChildren().forEach(child=>child.destroy({children:true}));
    const text=glabel('月光工坊 · 生产区',19,0xebd3b0,true);
    text.position.set(LEFT,MOBILE?22:48);stage.addChild(text);
    if(MOBILE){
      const portraitPanel=new Graphics().roundRect(15,54,800,135,15)
        .fill({color:0x17293b,alpha:.84})
        .stroke({color:0xc7ac85,alpha:.37,width:2});
      stage.addChild(portraitPanel);
      const caption=glabel('今天的三位工匠 · 派他们到擅长的机器上',17,0xe9d3ae,true);
      caption.position.set(32,65);stage.addChild(caption);
      for(const [n,id] of (['brook','fern','cinder'] as const).entries()){
        const x=220+n*220;
        const sprite=new AnimatedSprite(art.workers[id]);
        sprite.anchor.set(.5,1);sprite.position.set(x,169);
        sprite.width=94;sprite.height=94;
        sprite.animationSpeed=.11+n*.015;
        sprite.loop=true;sprite.gotoAndPlay(n*2);
        stage.addChild(sprite);actors.push(sprite);
        const isWorking=current.tiles.some(tile=>tile?.worker===id);
        const name=glabel((id==='brook'?'泉泡':id==='fern'?'青枝':'炽角')+
          (isWorking?' · 工作中':' · 等派工'),14,
          isWorking?0xc6f3ca:0xc5b8a3,true);
        name.position.set(x+47,125);stage.addChild(name);
      }
    }
    for(let i=0;i<BOARD_SIZE;i++){
      const {x,y}=plotXY(i);
      const machine=current.tiles[i];
      const active=selected===i;
      const border=active?0xffdea2:machine?COLORS[machine.craft]:0x4c606e;
      const tile=new Sprite(paintedFloor??art.floor);
      tile.width=CELL;tile.height=CELL;
      if(paintedFloor){
        tile.anchor.set(.5);
        tile.position.set(x+CELL/2,y+CELL/2);
        tile.rotation=((i%4)*Math.PI)/2; // rotate only the visual texture
      }else tile.position.set(x,y);
      tile.tint=machine?0xffffff:0xc9d6e0;
      if(painted)tile.alpha=machine?.87:.76; // keep the architectural layers visible
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
      const level=machineLevel(machine);
      if(level>1){
        const glow=new Graphics().ellipse(x+CELL*.49,y+CELL*.79,
          CELL*.34+(level-2)*12,CELL*.21+(level-2)*5)
          .fill({color:level===3?0xffd7a5:COLORS[machine.craft],alpha:.22})
          .stroke({width:2,color:0xffdea5,alpha:level===3?.82:.43});
        glow.eventMode='none';stage.addChild(glow);
      }
      const fixture=new Sprite(machine.craft==='kiln'&&kilnArtReview
        ?kilnArtReview:art.machines[machine.craft]);
      fixture.anchor.set(.5,1);
      fixture.position.set(x+CELL*.49,y+CELL*.92);
      fixture.width=CELL*(.89+(level-1)*.03);
      fixture.height=CELL*(.88+(level-1)*.035);
      fixture.eventMode='static';fixture.cursor='pointer';
      fixture.on('pointertap',()=>callbacks.plot(i));
      stage.addChild(fixture);machineArt.push(fixture);
      const detail=machine.craft==='well'?paintedDetail.well:
        machine.craft==='garden'?paintedDetail.garden:null;
      if(detail){
        const overlay=new Sprite(detail);
        overlay.anchor.set(.5,1);
        overlay.position.copyFrom(fixture.position);
        overlay.width=fixture.width;
        overlay.height=fixture.height;
        overlay.eventMode='none'; // never intercept plot/fixture interaction
        stage.addChild(overlay);
      }
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
      if(level>1){
        const star=glabel(level===3?'✦ Lv.3':'✦ Lv.2',12,0xffdaa1,true);
        star.position.set(x+CELL-62,y+11);
        stage.addChild(star);
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
    // A mature, distinct guest silhouette. This portrait uses bitmap frames
    // with independently animated hair, eye blink, and sleeve movement.
    // Keep her away from machine hit areas in both stage compositions.
    // Only real advanced shifts generate floating result feedback.
    // Do not replay effects on save reload or toolbar-only interactions.
    if(completedShift&&current.last){
      if(current.last.cores>0){
        const firstKiln=current.tiles.findIndex(tile=>tile?.craft==='kiln'
          &&tile.worker);
        const pos=firstKiln<0?{x:W/2,y:H/2}:plotXY(firstKiln);
        showFeedback('✦ +'+current.last.cores+' 晶核',
          firstKiln<0?pos.x:pos.x+CELL/2,
          firstKiln<0?pos.y:pos.y+CELL/2,0xffdfaa);
        element.dataset.lastShiftEffect='cores:'+current.last.cores;
      }else{
        element.dataset.lastShiftEffect='cores:0';
      }
      if(current.last.fulfilled)showFeedback('订单交付成功',W/2,
        MOBILE?215:82,0xc6f2b2);
      else if(current.last.lost)showFeedback('订单逾期',W/2,
        MOBILE?215:82,0xffb7ac);
      if(current.patron?.status==='completed'
        &&previousPatronStatus!=='completed'){
        showFeedback('月纱契约 +'+current.patron.reward,
          MOBILE?165:860,MOBILE?197:190,0xf6dfb4);
      }
    }
    element.dataset.patronVisible=current.patron?'true':'false';
    element.dataset.patronFrames=current.patron?'8':'0';
    if(current.patron){
      const isMobile=MOBILE;
      const x=isMobile?94:988,y=isMobile?198:610;
      const halo=new Graphics().ellipse(x,y-16,isMobile?57:79,isMobile?17:21)
        .fill({color:0xf6d29d,alpha:.24});
      stage.addChild(halo);
      const visitor=new AnimatedSprite(patronFrames());
      visitor.anchor.set(.5,1);visitor.position.set(x,y);
      visitor.width=isMobile?126:165;visitor.height=isMobile?161:235;
      visitor.animationSpeed=.11;visitor.loop=true;
      visitor.gotoAndPlay(current.day%8);
      visitor.eventMode=current.patron.status==='offered'?'static':'none';
      visitor.cursor=current.patron.status==='offered'?'pointer':'default';
      visitor.on('pointertap',()=>callbacks.patronTap?.());
      stage.addChild(visitor);actors.push(visitor);
      const tag=glabel('月纱 · 成年魔女',isMobile?14:13,0xf6d2bc,true);
      tag.anchor.set(.5,0);
      tag.position.set(x,isMobile?191:608);
      stage.addChild(tag);
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
