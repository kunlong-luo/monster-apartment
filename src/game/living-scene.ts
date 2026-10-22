import * as Phaser from 'phaser';
import type { LivingState } from '@/core/living-engine';

export class LivingScene extends Phaser.Scene {
  static readonly KEY='living-building';
  onReady?:()=>void;
  private brush?:Phaser.GameObjects.Graphics;
  private latest?:LivingState;
  constructor(){super({key:LivingScene.KEY});}
  create():void{
    this.cameras.main.setBackgroundColor('#151a30');
    this.brush=this.add.graphics();
    this.onReady?.();
  }
  sync(state:LivingState):void{
    this.latest=state;
    this.paint();
  }
  update():void{
    if(this.latest&&this.brush)this.paint();
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
    // Greenhouse: greenhouse windows, growing leaves, water trough.
    for(let j=0;j<4;j++){
      g.fillStyle(0x63837d,.25);g.fillRoundedRect(366+j*60,131,48,73,5);
      g.lineStyle(2,0x91bcb3,.45);g.strokeRoundedRect(366+j*60,131,48,73,5);
    }
    g.fillStyle(0x5a4948,1);g.fillRoundedRect(366,245,230,25,5);
    for(let j=0;j<6;j++){
      const x=384+j*37;
      g.lineStyle(3,0x91a17a,.98);g.lineBetween(x,251,x,222);
      g.fillStyle(0x99cc87,.85);g.fillEllipse(x-9,222,18,8,Math.PI/6);
      g.fillStyle(0xc1da8c,.9);g.fillEllipse(x+9,217,18,8,-Math.PI/6);
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
