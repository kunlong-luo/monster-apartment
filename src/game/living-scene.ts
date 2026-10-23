import * as Phaser from 'phaser';
import type { LivingState } from '@/core/living-engine';
import { SPIRIT_BY_ID } from '@/core/spirit-collection';
import { SPIRIT_ART } from '@/core/spirit-art';
import { WORK_ROOMS } from '@/core/living-engine';
import type { WorkRoom } from '@/core/living-engine';
import type { SpiritId } from '@/core/spirit-collection';

export class LivingScene extends Phaser.Scene {
  static readonly KEY='living-building';
  onReady?:()=>void;
  private brush?:Phaser.GameObjects.Graphics;
  private latest?:LivingState;
  private lastPaint=0;
  private workers=new Map<SpiritId,Phaser.GameObjects.Container>();
  private workerPosts=new Map<SpiritId,WorkRoom>();
  private readonly stations:Record<WorkRoom,{x:number;y:number}>={
    reactor:{x:283,y:211},garden:{x:564,y:210},gate:{x:504,y:426},
  };
  constructor(){super({key:LivingScene.KEY});}
  create():void{
    this.cameras.main.setBackgroundColor('#151a30');
    this.brush=this.add.graphics();
    this.onReady?.();
  }
  sync(state:LivingState):void{
    this.latest=state;
    this.paint();
    if(this.sys.isActive())this.syncWorkers(state);
  }
  /** Original creature silhouettes live on the same Phaser floor as the crisis.
   * Reassigning a worker moves its actual scene object instead of teleporting
   * an icon or opening a separate staff-management panel. */
  private createWorker(id:SpiritId):Phaser.GameObjects.Container {
    const art=SPIRIT_ART[id];
    const primary=Number.parseInt(art.primary.slice(1),16);
    const light=Number.parseInt(art.highlight.slice(1),16);
    const shadow=Number.parseInt(art.shadow.slice(1),16);
    const silhouette=this.add.graphics();
    silhouette.fillStyle(0x090d1e,.35);
    silhouette.fillEllipse(0,32,62,12);
    silhouette.fillStyle(primary,.2);
    silhouette.fillCircle(0,-1,35);
    silhouette.fillStyle(shadow,.9);
    silhouette.fillTriangle(-19,-19,-15,-39,-2,-20);
    silhouette.fillTriangle(19,-19,15,-39,2,-20);
    silhouette.fillStyle(primary,1);
    silhouette.fillEllipse(0,0,46,47);
    silhouette.lineStyle(3,light,.88);
    silhouette.strokeEllipse(0,0,46,47);
    silhouette.fillStyle(light,.95);
    silhouette.fillEllipse(0,9,29,17);
    silhouette.fillStyle(0x1b2340,1);
    silhouette.fillCircle(-9,-6,4);
    silhouette.fillCircle(9,-6,4);
    silhouette.fillStyle(0xffffff,1);
    silhouette.fillCircle(-10,-8,1.5);
    silhouette.fillCircle(8,-8,1.5);
    const role=SPIRIT_BY_ID[id].role;
    const badge=this.add.text(21,-30,
      {guard:'◆',repair:'✚',economy:'⚡',explore:'✦'}[role],
      {fontSize:'17px',fontFamily:'sans-serif',color:art.highlight,
        stroke:'#14172b',strokeThickness:3}).setOrigin(.5);
    const character=this.add.container(0,0,[silhouette,badge]);
    const station=this.stations.reactor;
    const actor=this.add.container(station.x,station.y,[character]);
    actor.setDepth(5);
    if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
      this.tweens.add({targets:character,y:-4,yoyo:true,repeat:-1,
        duration:1000+id.length*19,ease:'Sine.easeInOut'});
    }
    return actor;
  }
  private syncWorkers(state:LivingState):void {
    const assigned=new Set<SpiritId>();
    for(const room of WORK_ROOMS){
      const id=state.rooms[room];
      if(!id)continue;
      assigned.add(id);
      const station=this.stations[room];
      let worker=this.workers.get(id);
      if(!worker){
        worker=this.createWorker(id);
        this.workers.set(id,worker);
        worker.setPosition(station.x,station.y);
      }else if(this.workerPosts.get(id)!==room){
        this.tweens.killTweensOf(worker);
        if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){
          worker.setPosition(station.x,station.y);
        }else{
          this.tweens.add({targets:worker,x:station.x,y:station.y,
            duration:750,ease:'Sine.easeInOut'});
        }
      }
      this.workerPosts.set(id,room);
    }
    for(const [id,worker] of this.workers){
      if(assigned.has(id))continue;
      worker.destroy();
      this.workers.delete(id);
      this.workerPosts.delete(id);
    }
  }
  update():void{
    // Room geometry changes on simulation ticks; cap decorative frame work for mobile GPUs.
    if(!this.latest||!this.brush||this.time.now-this.lastPaint<50)return;
    this.lastPaint=this.time.now;
    this.paint();
  }
  private paint():void{
    const g=this.brush;
    const state=this.latest;
    if(!g||!state)return;
    const t=this.time.now/1000, reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const pulse=reduced?0.5:(Math.sin(t*2)+1)/2;
    g.clear();
    g.fillGradientStyle(0x222b46,0x222b46,0x101928,0x131827,1);
    g.fillRect(0,0,960,570);
    // Quiet moonlit sky and skyline.
    g.fillStyle(0xf7dea9,.85);
    g.fillCircle(810,69,30);
    g.fillStyle(0x222b46,1);g.fillCircle(795,57,29);
    for(let i=0;i<23;i++){
      const x=25+(i*157)%915,y=15+(i*47)%92;
      g.fillStyle(0xbfd6f9,.24+((i%4)/12));
      g.fillCircle(x,y,i%3===0?2:1);
    }
    for(let x=0;x<960;x+=48){
      const tall=(x*7)%81+54;
      g.fillStyle(0x192438,.78);
      g.fillRect(x,160-tall,44,tall+410);
    }
    g.fillStyle(0x141b2a,1);g.fillRect(0,511,960,59);
    // Building silhouette, framing, chimney and connected plumbing.
    g.fillStyle(0x443951,1);g.fillRoundedRect(35,89,615,432,16);
    g.fillStyle(0x6d526b,1);g.fillTriangle(15,107,340,34,661,107);
    g.fillStyle(0x342f49,1);g.fillRoundedRect(48,103,589,404,8);
    g.fillStyle(0x9b7080,1);g.fillRect(330,110,12,391);
    g.fillRect(51,299,582,14);
    const reactorHot=state.heat>=7;
    const reactor=reactorHot?0x85514d:0x4b3e53;
    g.fillGradientStyle(reactor,reactor,0x353244,0x353244,1);
    g.fillRoundedRect(59,112,266,176,10);
    g.fillGradientStyle(0x34483f,0x34483f,0x233847,0x233847,1);
    g.fillRoundedRect(348,112,275,176,10);
    g.fillGradientStyle(0x3e455c,0x3e455c,0x293149,0x293149,1);
    g.fillRoundedRect(60,319,563,179,10);
    // Power room: glowing reactor engine and cables to other rooms.
    g.lineStyle(7,0xa58b71,.72);
    g.lineBetween(190,205,190,251);g.lineBetween(190,251,301,251);
    g.lineStyle(3,0xf5c57a,.7);
    g.strokeCircle(190,195,53);
    g.fillStyle(reactorHot?0xff816e:0xffce81,.35+pulse*.22);
    g.fillCircle(190,195,44);
    g.fillStyle(0xffdfa1,.9);
    g.fillCircle(190,195,22+pulse*3);
    g.fillStyle(0xfff5c7,.98);
    g.fillCircle(190,195,8);
    g.fillStyle(0x25293d,1);
    g.fillRoundedRect(80,226,58,34,5);
    g.fillStyle(state.power>3?0x9de1b4:0xd99890,.9);
    for(let j=0;j<3;j++)g.fillRoundedRect(89+j*15,237,8,12,2);
    // Visible power pipes: both rooms are physically connected to the same grid.
    // The line dies when power is depleted, showing why other systems stop.
    const energized=state.power>0;
    const conduit=energized?0xf6d894:0x777d8b;
    g.lineStyle(9,0x1b2435,.9);
    g.lineBetween(246,261,472,261);
    g.lineBetween(318,262,318,386);
    g.lineStyle(4,conduit,energized?.65+pulse*.23:.27);
    g.lineBetween(246,261,472,261);
    g.lineBetween(318,262,318,386);
    if(energized&&!reduced){
      const motion=(t*.8)%1;
      g.fillStyle(0xfff0b5,.85);
      g.fillCircle(246+226*motion,261,3.5);
      g.fillCircle(318,262+124*motion,3.5);
    }
    if(reactorHot){
      for(let i=0;i<4;i++){
        const drift=reduced?i*12:(t*13+i*23)%65;
        g.fillStyle(0xf7a69e,.13+(1-drift/68)*.21);
        g.fillCircle(161+i*19,162-drift,7+i%3*3);
      }
    }
    if(state.crisis==='blackout'){
      g.lineStyle(4,0xef727e,.8);
      g.lineBetween(313,286,324,273);
      g.lineBetween(324,273,315,267);
    }
    // Greenhouse: greenhouse windows, growing leaves, water trough.
    for(let j=0;j<4;j++){
      g.fillStyle(0x63837d,.25);g.fillRoundedRect(366+j*60,131,48,73,5);
      g.lineStyle(2,0x91bcb3,.45);g.strokeRoundedRect(366+j*60,131,48,73,5);
    }
    g.fillStyle(0x5a4948,1);g.fillRoundedRect(366,245,230,25,5);
    for(let j=0;j<6;j++){
      const x=384+j*37;
      g.lineStyle(3,0x91a17a,.98);g.lineBetween(x,251,x,222);
      const living=state.food>2&&energized;
      g.fillStyle(living?0x99cc87:0x827d62,living?.85:.52);
      g.fillEllipse(x-9,222,18,8);
      g.fillStyle(living?0xc1da8c:0xa19478,living?.9:.55);
      g.fillEllipse(x+9,217,18,8);
    }
    if(state.crisis==='spores'){
      for(let j=0;j<17;j++){
        const x=372+(j*53)%229,y=132+(j*37)%126;
        g.fillStyle(0xc7a3d8,.17+pulse*.16);g.fillCircle(x,y,4+j%5);
      }
    }
    // Gate: warning lamps, shield columns, doors, watch route and core.
    for(const x of [107,570]){
      g.fillStyle(0x7c738c,1);g.fillRoundedRect(x,346,28,127,5);
      g.fillStyle(0xf5cf8e,.6+pulse*.35);g.fillCircle(x+14,349,12);
    }
    g.fillStyle(0x242c40,1);g.fillRoundedRect(270,362,150,124,8);
    g.lineStyle(5,0xb8a2a0,1);g.strokeRoundedRect(270,362,150,124,8);
    g.lineStyle(4,0x957d91,.7);g.lineBetween(345,366,345,482);
    g.fillStyle(state.integrity<=5?0xeb8790:0x82cdb8,.18+pulse*.15);
    g.fillCircle(344,420,33);
    g.lineStyle(3,state.integrity<=5?0xed6d86:0x98ebd4,.9);g.strokeCircle(344,420,24);
    g.fillStyle(0xe4f7dc,1);g.fillCircle(344,420,9);
    // Invaders are in the same space as the apartment, walking toward the entrance.
    g.fillStyle(0x2b2c3a,1);g.fillRect(650,369,310,133);
    for(let i=0;i<5;i++){
      g.lineStyle(3,0x74677e,.25);g.lineBetween(663+i*60,435,689+i*60,435);
    }
    for(const enemy of state.invaders){
      const x=639+enemy.distance*2.8;
      const y=430+Math.sin(reduced?0: t*5+enemy.id)*4;
      const huge=enemy.kind==='siege', brute=enemy.kind==='brute';
      const rad=huge?35:brute?22:17;
      g.fillStyle(0x0d1024,.5);g.fillEllipse(x,y+rad,rad*2.4,13);
      g.fillStyle(huge?0xe893cb:brute?0xdc987b:0xc2afeb,1);
      if(huge){
        g.fillTriangle(x-rad,y-14,x-25,y-55,x-4,y-25);
        g.fillTriangle(x+rad,y-14,x+25,y-55,x+4,y-25);
      }
      g.fillEllipse(x,y,rad*2,rad*1.8);
      g.fillStyle(0x30273f,1);g.fillEllipse(x,y-3,rad*1.3,rad*.65);
      g.fillStyle(0xffeed7,1);g.fillCircle(x,y-4,huge?8:5);
      g.fillStyle(0x151829,.9);g.fillRect(x-rad,y-rad-13,rad*2,6);
      g.fillStyle(0xfaacb7,1);g.fillRect(x-rad+1,y-rad-12,(rad*2-2)*enemy.hp/enemy.maxHp,4);
    }
    // Beams from the real stationed defender toward the nearest attacker.
    // A stalled grid has no projectile even when enemies are in range.
    if(state.rooms.gate && state.power>0 && state.phase==='running'){
      const defender=state.rooms.gate;
      const role=SPIRIT_BY_ID[defender].role;
      const range=role==='explore'?95:78;
      const closest=state.invaders.filter(e=>e.distance<=range)
        .sort((a,b)=>a.distance-b.distance)[0];
      if(closest){
        const aimX=639+closest.distance*2.8;
        const beamColor=role==='guard'?0x99edbb:role==='repair'?0x92d9ee:
          role==='explore'?0xd7bbff:0xffd88a;
        g.lineStyle(2.5,beamColor,.28+.35*pulse);
        g.lineBetween(545,423,aimX-16,426);
        const flight=reduced?.65:(t*2.6)%1;
        g.fillStyle(beamColor,.9);
        g.fillCircle(545+(aimX-561)*flight,423+3*flight,5);
      }
    }
    // Building floor and underground linkage.
    g.fillStyle(0x6c5872,1);g.fillRect(40,504,595,11);
    g.lineStyle(4,0xe6bb83,.4);g.lineBetween(316,260,316,415);
    g.lineBetween(318,415,330,415);
    if(state.phase==='won'){
      g.fillStyle(0x8de5b2,.1+pulse*.13);g.fillRoundedRect(45,107,583,397,16);
    }
    if(state.phase==='lost'){
      g.fillStyle(0xdd6476,.20);g.fillRoundedRect(45,107,583,397,16);
    }
  }
}
