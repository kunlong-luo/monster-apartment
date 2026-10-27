import { Application, AnimatedSprite, Container, Graphics, Sprite, Text } from 'pixi.js';
import { makeRasterArt } from './raster-sprites';
import { patronFrames } from './patron-art';
import { loadWorkshopPaintedArt } from './workshop-painted-art';
import { createFloatingFeedback } from './workshop-floating-feedback';
import { paintShiftFeedback } from './workshop-shift-effects';
import { BOARD_SIZE, WIDTH, MACHINES, linked, machineLevel, workshopHint } from './workshop-engine';
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
  const {painted,backdropSource,paintedFloor,kilnArtReview,paintedDetail,patronPortrait}=
    await loadWorkshopPaintedArt(assetBase);
  element.dataset.backdropSource=backdropSource;
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
    .fill({color:0x101e2c,alpha:painted?.25:0}));
  // 8 different bitmap pose frames per creature, assembled once and reused.
  element.dataset.renderer='pixi-webgl-bitmap';
  element.dataset.workerFrames='8';
  // Immutable foundation: ground, numbered plaques and borders are built
  // exactly once. Only machine-dependent floor tint/opacity changes on sync.
  const foundation=new Container();app.stage.addChild(foundation);
  const floorTiles:Sprite[]=[];
  const stage=new Container();app.stage.addChild(stage);
  for(let i=0;i<BOARD_SIZE;i++){
    const {x,y}=plotXY(i);
    const tile=new Sprite(paintedFloor??art.floor);
    tile.width=CELL;tile.height=CELL;
    if(paintedFloor){
      tile.anchor.set(.5);
      tile.position.set(x+CELL/2,y+CELL/2);
      tile.rotation=((i%4)*Math.PI)/2;
    }else tile.position.set(x,y);
    tile.eventMode='none';
    foundation.addChild(tile);floorTiles.push(tile);
    const border=frame(x,y,CELL,CELL,0x1b324b,0x91a5b0);
    border.alpha=.18;border.eventMode='none';
    foundation.addChild(border);
    const number=glabel(String(i+1).padStart(2,'0'),12,0x8b9aa4);
    number.position.set(x+12,y+9);number.eventMode='none';
    foundation.addChild(number);
  }
  element.dataset.foundationTiles=String(floorTiles.length);
  const motes=new Container();app.stage.addChild(motes);
  const moving:Graphics[]=[];
  const actors:AnimatedSprite[]=[];
  const machineArt:Sprite[]=[];
  let flowPaths:{from:{x:number;y:number};to:{x:number;y:number};tint:number}[]=[];
  const flowLayer=new Graphics();
  app.stage.addChild(flowLayer);
  // A single contextual, non-interactive teaching cue above the painted map.
  // It disappears after the first delivery and never intercepts plot clicks.
  const tutorialLayer=new Container();
  tutorialLayer.eventMode='none';
  app.stage.addChild(tutorialLayer);
  // Feedback overlays are independent of the rebuildable board scene.
  // A completed shift cannot silently change inventory without visual cues.
  const feedbackLayer=new Container();
  app.stage.addChild(feedbackLayer);
  // One stable full-tile hit target per plot: painted sprites, floating labels,
  // sprite animations and production overlays must not steal input.
  // Kept outside the re-rendered `stage` so every refresh retains its handlers.
  const plotHits=new Container();
  app.stage.addChild(plotHits);
  // Selection feedback never recreates actors or machine sprites.
  const focusLayer=new Graphics();
  focusLayer.eventMode='none';
  app.stage.addChild(focusLayer);
  for(let index=0;index<BOARD_SIZE;index++){
    const {x,y}=plotXY(index);
    const target=new Graphics().roundRect(x,y,CELL,CELL,13)
      .fill({color:0xffffff,alpha:0.001});
    target.eventMode='static';
    target.cursor='pointer';
    target.on('pointertap',()=>callbacks.plot(index));
    plotHits.addChild(target);
  }
  const feedback=createFloatingFeedback(feedbackLayer,glabel);
  const {showFeedback}=feedback;
  let lastShiftDay=state.day;
  let elapsed=0;
  for(let i=0;i<20;i++){
    const mote=new Graphics().circle(0,0,1+i%3).fill({color:0xefcf9b,alpha:.24});
    mote.position.set(60+i*49%940,35+i*71%560);
    motes.addChild(mote);moving.push(mote);
  }
  const reducedMotionQuery=window.matchMedia('(prefers-reduced-motion: reduce)');
  const motionKey='monster-apartment:gothic-motion-reduced';
  const motionEvent='monster-apartment:motion-changed';
  let animationEnabled=false;
  const allowMotion=()=>{
    let savedStill=false;
    try{savedStill=window.localStorage.getItem(motionKey)==='1';}
    catch{/* Private storage: still honor system preference. */}
    return !document.hidden&&!reducedMotionQuery.matches&&!savedStill;
  };
  const updateMotion=()=>{
    const allowed=allowMotion();
    animationEnabled=allowed;
    element.dataset.motionState=allowed?'running':'paused';
    motes.visible=allowed;flowLayer.visible=allowed;
    tutorialLayer.alpha=allowed?.85:1;
    for(const actor of actors){if(allowed)actor.play();else actor.stop();}
    // Invisible tabs must not keep scheduling WebGL work.
    if(document.hidden)app.ticker.stop();
    else app.ticker.start();
  };
  const onMotionStorage=(event:StorageEvent)=>{
    if(!event.key||event.key===motionKey)updateMotion();
  };
  reducedMotionQuery.addEventListener('change',updateMotion);
  document.addEventListener('visibilitychange',updateMotion);
  window.addEventListener(motionEvent,updateMotion);
  window.addEventListener('storage',onMotionStorage);
  app.ticker.add(ticker=>{
    const dt=ticker.deltaTime;
    // Feedback must still complete when a player disables decorative motion.
    feedback.tick(dt);
    if(!animationEnabled)return;
    elapsed+=dt/60;
    moving.forEach((m,i)=>{
      m.y-=dt*(.11+i%4*.055);
      if(m.y<0)m.y=H;
    });
    for(const [index,machine] of machineArt.entries()){
      machine.y+=(Math.sin(elapsed*3+index*.8)-
        Math.sin((elapsed-dt/60)*3+index*.8))*.5;
    }
    tutorialLayer.alpha=.81+.19*Math.sin(elapsed*2.5);
    flowLayer.clear();
    for(const [i,flow] of flowPaths.entries()){
      const progress=(elapsed*.36+i*.31)%1;
      const x=flow.from.x+(flow.to.x-flow.from.x)*progress;
      const y=flow.from.y+(flow.to.y-flow.from.y)*progress;
      flowLayer.circle(x,y,5).fill({color:flow.tint,alpha:.9});
      flowLayer.circle(x,y,12).fill({color:flow.tint,alpha:.13});
    }
  });
  updateMotion();
  // Pure DOM-control changes must never dispose and restart animated sprites.
  // The engine returns immutable world snapshots for all material changes.
  let lastSnapshot:WorkshopState|null=null;
  let lastSelection:number|null=null;
  let sceneRefreshes=0;
  const paintFocus=(selected:number|null)=>{
    focusLayer.clear();
    if(selected===null||selected<0||selected>=BOARD_SIZE)return;
    const {x,y}=plotXY(selected);
    focusLayer.roundRect(x-3,y-3,CELL+6,CELL+6,15)
      .stroke({color:0xffdea2,alpha:1,width:4});
  };
  const render=(current:WorkshopState,selected:number|null)=>{
    if(lastSnapshot===current){
      if(lastSelection!==selected){
        lastSelection=selected;
        paintFocus(selected);
      }
      return;
    }
    const previousPatronStatus=lastSnapshot?.patron?.status;
    const previousOrderReward=lastSnapshot?.order.reward??0;
    const completedShift=current.day>lastShiftDay&&!!current.last;
    lastShiftDay=current.day;
    lastSnapshot=current;lastSelection=selected;
    paintFocus(selected);
    element.dataset.sceneRefreshes=String(++sceneRefreshes);
    for(const actor of actors)actor.stop();
    actors.length=0;machineArt.length=0;flowPaths=[];
    stage.removeChildren().forEach(child=>child.destroy({children:true}));
    tutorialLayer.removeChildren().forEach(child=>child.destroy({children:true}));
    const hint=workshopHint(current);
    element.dataset.guideAction=hint.action;
    element.dataset.guideSource=hint.source===null?'':String(hint.source);
    element.dataset.guideTarget=hint.target===null?'':String(hint.target);
    element.dataset.guideWorker=hint.worker??'';
    const firstDeliveryPending=current.completed===0;
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
      // Foundation sprites survive every world snapshot and every shift.
      const tile=floorTiles[i];
      tile.tint=machine?0xffffff:0xc9d6e0;
      tile.alpha=painted?(machine?.87:.76):1;
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
    // Hint source and destination are distinct: no fullscreen tutorial modal,
    // no auto-play and no labels hiding the painted machine actors.
    if(firstDeliveryPending){
      for(const [index,label,color] of [
        [hint.source,'① 选这里',0xf5bd82],
        [hint.target,
          hint.action==='move'?'② 搬到这里':
          hint.action==='build'?'② 在这里建造':
          hint.action==='staff'?'② 点这里派工':'',
          0xaff1d4],
      ] as const){
        if(index===null||index<0||!label)continue;
        const {x,y}=plotXY(index);
        const outline=new Graphics().roundRect(x-3,y-3,CELL+6,CELL+6,15)
          .stroke({width:4,color,alpha:.95});
        outline.eventMode='none';
        tutorialLayer.addChild(outline);
        const ribbon=new Graphics().roundRect(x+5,y+CELL-27,CELL-10,23,7)
          .fill({color:0x17111e,alpha:.96})
          .stroke({color,alpha:.75,width:1});
        ribbon.eventMode='none';tutorialLayer.addChild(ribbon);
        const caption=glabel(label,14,color,true);
        caption.anchor.set(.5,0);
        caption.position.set(x+CELL/2,y+CELL-24);
        caption.eventMode='none';tutorialLayer.addChild(caption);
      }
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
    if(completedShift&&current.last)
      paintShiftFeedback(current,element,showFeedback,{
        W,H,CELL,MOBILE,plotXY,previousOrderReward,previousPatronStatus,
      });
    element.dataset.patronVisible=current.patron?'true':'false';
    element.dataset.patronArt=current.patron
      ?patronPortrait?'painted-medallion':'animated-raster-fallback'
      :'hidden';
    element.dataset.patronFrames=current.patron&&!patronPortrait?'8':'0';
    if(current.patron){
      const isMobile=MOBILE;
      const x=isMobile?100:975,y=isMobile?118:490;
      if(patronPortrait){
        // A sharply cropped, circular painted cameo is more faithful than
        // stretching a flat portrait into fake animated limbs.
        const radius=isMobile?57:73;
        const halo=new Graphics().circle(x,y,radius+8)
          .fill({color:0x160f21,alpha:.92})
          .stroke({color:0xf6d29d,alpha:.8,width:3});
        halo.eventMode='none';stage.addChild(halo);
        const mask=new Graphics().circle(x,y,radius-3).fill(0xffffff);
        mask.eventMode='none';stage.addChild(mask);
        const portrait=new Sprite(patronPortrait);
        portrait.anchor.set(.5);portrait.position.set(x,y);
        portrait.width=radius*2;portrait.height=radius*2;
        portrait.mask=mask;
        portrait.eventMode=current.patron.status==='offered'?'static':'none';
        portrait.cursor=current.patron.status==='offered'?'pointer':'default';
        portrait.on('pointertap',()=>callbacks.patronTap?.());
        stage.addChild(portrait);
        const ring=new Graphics().circle(x,y,radius+3)
          .stroke({color:0xffdaa2,alpha:.83,width:2});
        ring.eventMode='none';stage.addChild(ring);
      }else{
        const visitor=new AnimatedSprite(patronFrames());
        visitor.anchor.set(.5,1);visitor.position.set(x,isMobile?198:610);
        visitor.width=isMobile?126:165;visitor.height=isMobile?161:235;
        visitor.animationSpeed=.11;visitor.loop=true;
        visitor.gotoAndPlay(current.day%8);
        visitor.eventMode=current.patron.status==='offered'?'static':'none';
        visitor.cursor=current.patron.status==='offered'?'pointer':'default';
        visitor.on('pointertap',()=>callbacks.patronTap?.());
        stage.addChild(visitor);actors.push(visitor);
      }
      const tag=glabel('月纱 · 成年魔女',isMobile?14:13,0xf6d2bc,true);
      tag.anchor.set(.5,0);
      tag.position.set(x,isMobile?192:603);
      stage.addChild(tag);
    }
    // Fresh AnimatedSprite instances honor the latest OS/player motion setting.
    updateMotion();
  };
  render(state,null);
  return {sync:render,destroy:()=>{
    observer.disconnect();
    reducedMotionQuery.removeEventListener('change',updateMotion);
    document.removeEventListener('visibilitychange',updateMotion);
    window.removeEventListener(motionEvent,updateMotion);
    window.removeEventListener('storage',onMotionStorage);
    actors.forEach(actor=>actor.stop());
    app.destroy(true,{children:true});
    canvas.remove();
  }};
}
