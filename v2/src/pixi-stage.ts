import { Application, Assets, AnimatedSprite, Container, Sprite, Texture } from 'pixi.js';
import type { WorkerId, WorkshopState, Craft } from './workshop-engine';
import { BOARD_SIZE, HEIGHT, WIDTH, WORKERS } from './workshop-engine';

/** V2 image-only scene. Explicitly rejects placeholder vector or SVG assets.
 * Character art must be a coherent, painted pixel/texture atlas, not a
 * procedurally recolored circle drawn at runtime.
 * A small DOM shell will handle buttons, tooltips and a11y. */
export type StageActions={
  selectPlot:(plot:number)=>void;
  selectWorker:(worker:WorkerId)=>void;
};
export type StageHandle={
  sync:(state:WorkshopState)=>void;
  destroy:()=>void;
};
const VIEW_W=1000, VIEW_H=660, GAP=12, TILE=142;
const ORIGIN_X=127, ORIGIN_Y=132;
const TILE_URL:Record<Craft,string>={
  well:'machines/mist-pump.png',
  garden:'machines/spore-greenhouse.png',
  kiln:'machines/crystal-kiln.png',
};
const workerIds=Object.keys(WORKERS) as WorkerId[];
type Sheets={
  floor:Texture; backdrop:Texture;
  machines:Record<Craft,Texture>;
  workers:Record<WorkerId,Texture[]>;
};
async function loadSheets(assetsBase:string):Promise<Sheets>{
  const url=(path:string)=>assetsBase.replace(/\/$/,'')+'/'+path;
  const [floor,backdrop]=await Promise.all([
    Assets.load<Texture>(url('world/floor.webp')),
    Assets.load<Texture>(url('world/backdrop.webp')),
  ]);
  const machines={} as Record<Craft,Texture>;
  for(const type of Object.keys(TILE_URL) as Craft[]){
    machines[type]=await Assets.load<Texture>(url(TILE_URL[type]));
  }
  const workers={} as Record<WorkerId,Texture[]>;
  for(const id of workerIds){
    // A real 8-frame hand-painted loop, not a single SVG scaled around.
    const frames=await Promise.all(Array.from({length:8},(_,index)=>
      Assets.load<Texture>(url('creatures/'+id+'/idle-'+index+'.png'))));
    workers[id]=frames;
  }
  return {floor,backdrop,machines,workers};
}
export async function mountWorkshopStage(
  host:HTMLElement,assetsBase:string,initial:WorkshopState,actions:StageActions
):Promise<StageHandle>{
  const app=new Application();
  await app.init({
    width:VIEW_W,height:VIEW_H,background:'#172b3c',
    antialias:true,resolution:Math.min(window.devicePixelRatio||1,2),
    preference:'webgl',
  });
  const sheets=await loadSheets(assetsBase);
  host.appendChild(app.canvas);
  app.canvas.style.width='100%';
  app.canvas.style.height='100%';
  app.canvas.style.objectFit='contain';
  const background=new Sprite(sheets.backdrop);
  background.width=VIEW_W;background.height=VIEW_H;app.stage.addChild(background);
  const plots=new Container();app.stage.addChild(plots);
  const animated:AnimatedSprite[]=[];
  const clear=()=>{for(const actor of animated)actor.stop();animated.length=0;
    plots.removeChildren().forEach(child=>child.destroy({children:true}));};
  const render=(state:WorkshopState)=>{
    clear();
    for(let plot=0;plot<BOARD_SIZE;plot++){
      const x=ORIGIN_X+(plot%WIDTH)*(TILE+GAP);
      const y=ORIGIN_Y+Math.floor(plot/WIDTH)*(TILE+GAP);
      const base=new Sprite(sheets.floor);
      base.position.set(x,y);base.width=TILE;base.height=TILE;
      base.eventMode='static';base.cursor='pointer';
      base.on('pointertap',()=>actions.selectPlot(plot));
      plots.addChild(base);
      const machine=state.tiles[plot];
      if(!machine)continue;
      const building=new Sprite(sheets.machines[machine.craft]);
      building.anchor.set(.5,1);
      building.position.set(x+TILE/2,y+TILE-8);
      building.width=TILE*.9;building.height=TILE*.86;
      building.eventMode='static';building.cursor='pointer';
      building.on('pointertap',()=>actions.selectPlot(plot));
      plots.addChild(building);
      if(machine.worker){
        const actor=new AnimatedSprite(sheets.workers[machine.worker]);
        actor.anchor.set(.5,1);
        actor.position.set(x+TILE*.72,y+TILE+5);
        actor.width=TILE*.48;actor.height=TILE*.6;
        actor.animationSpeed=.12;
        actor.loop=true;actor.play();
        actor.eventMode='static';actor.cursor='pointer';
        const worker=machine.worker;
        actor.on('pointertap',()=>actions.selectWorker(worker));
        plots.addChild(actor);animated.push(actor);
      }
    }
  };
  render(initial);
  return {sync:render,destroy:()=>{clear();app.destroy(true,{children:true});}};
}
