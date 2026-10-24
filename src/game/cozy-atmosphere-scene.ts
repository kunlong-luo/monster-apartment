import * as Phaser from 'phaser';
import type { ApartmentRoom, CozyState } from '@/core/cozy-engine';
import { cozyVisits, residentActivity } from '@/core/cozy-engine';
import { SPIRIT_ART } from '@/core/spirit-art';

type WorldSnapshot = Pick<CozyState,'rooms'|'tick'|'phase'>;
const TONES: Record<NonNullable<ApartmentRoom>['type'],number>={
  nest:0xffcd99,
  bath:0xb7f0e5,
  workshop:0xffc77d,
  greenhouse:0xd7eca2,
};

/** A low-cost persistent Phaser scene spanning the playable floors.
 * React owns every decision; this scene only expresses room state as light.
 * It never owns rooms, coins, save data, or an interaction hit area. */
export class CozyAtmosphereScene extends Phaser.Scene {
  static readonly KEY='cozy-world-atmosphere';
  onReady?:()=>void;
  private paintLayer?:Phaser.GameObjects.Graphics;
  private snapshot?:WorldSnapshot;
  private paused=false;
  private reduced=false;
  private lastPaint=-100;
  private frozenAt=0;

  constructor(){super({key:CozyAtmosphereScene.KEY});}

  create():void{
    this.paintLayer=this.add.graphics();
    this.cameras.main.setBackgroundColor('rgba(0,0,0,0)');
    this.reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.onReady?.();
  }

  sync(state:WorldSnapshot,paused:boolean):void{
    this.snapshot=state;
    if(paused&&!this.paused)this.frozenAt=this.time.now;
    this.paused=paused;
    if(this.paintLayer)this.draw(paused?this.frozenAt:this.time.now);
  }

  update(time:number):void{
    if(!this.snapshot||this.paused||this.reduced||time-this.lastPaint<55)return;
    this.lastPaint=time;
    this.draw(time);
  }

  private draw(time:number):void{
    const g=this.paintLayer;
    const state=this.snapshot;
    if(!g||!state)return;
    g.clear();
    // Phaser RESIZE tracks the real room-grid rectangle, including portrait phones.
    g.setScale(this.scale.width/1200,this.scale.height/680);
    const t=this.reduced?0:time*.001;
    for(let i=0;i<state.rooms.length;i++){
      const room=state.rooms[i];
      if(!room)continue;
      const col=i%2,row=Math.floor(i/2);
      // The central stairwell takes ~100 of the 1200 scene units.
      const ox=col*650,oy=row*(680/3);
      const tint=TONES[room.type];
      const resident=room.resident;
      const activity=resident?residentActivity(state.tick,resident):null;
      const live=Boolean(resident);
      // The window light brightens when the resident is awake and dims at rest.
      const power=live?(activity==='sleep'?.08:.14):.026;
      const breath=this.reduced?0:Math.sin(t*1.15+i*.9)*.014;
      g.fillStyle(tint,Math.max(.018,power+breath));
      g.fillEllipse(ox+453,oy+100,142,135);
      g.fillStyle(tint,live?.1:.024);
      g.fillEllipse(ox+390,oy+184,246,48);
      if(!live)continue;
      // The room's small light motes are distributed spatially, not randomized
      // each frame; animation is smooth and deterministic across re-renders.
      const count=room.type==='greenhouse'?10:room.type==='workshop'?7:4;
      for(let j=0;j<count;j++){
        const seed=i*41+j*17+13;
        const x=ox+58+(seed*59%480)+
          (this.reduced?0:Math.sin(t*.42+j*1.4+i)*9);
        const y=oy+28+(seed*43%155)+
          (this.reduced?0:Math.cos(t*.74+j*.9)*13);
        const alpha=.075+(this.reduced?.1:(Math.sin(t*1.8+j*.9)+1)*.065);
        g.fillStyle(tint,alpha);
        g.fillCircle(x,y,j%3===0?3.2:1.8);
      }
      if(room.decor==='lamp'||room.type==='workshop'){
        const lx=ox+496,ly=oy+100;
        const flicker=this.reduced?1:.87+Math.sin(t*3.7+i)*.13;
        g.fillStyle(0xffdc91,.1*flicker);
        g.fillCircle(lx,ly,31);
        g.fillStyle(0xffe4af,.24*flicker);
        g.fillCircle(lx,ly,4);
      }
      if(activity==='visit'){
        g.lineStyle(1.8,0xffd7ae,this.reduced?.15:.14+.08*Math.sin(t*2+i));
        g.strokeCircle(ox+302,oy+140,24);
      }
    }
    // A real simulation visit lights a route through the shared stairwell.
    // A traveler glow moves along it; no unrelated random particles are added.
    for(const visit of cozyVisits(state)){
      const from=(Math.floor(visit.from/2)+.5)*(680/3);
      const to=(Math.floor(visit.to/2)+.5)*(680/3);
      const duration=2.1;
      const progress=this.reduced?1:(Math.sin(t*Math.PI/duration)+1)/2;
      const travelerY=from+(to-from)*progress;
      const shade=Number.parseInt(SPIRIT_ART[visit.visitor].primary.slice(1),16);
      g.lineStyle(5,0xf2cd9b,.22);
      g.lineBetween(600,from,600,to);
      g.fillStyle(shade,.18);
      g.fillCircle(600,travelerY,21);
      g.fillStyle(0xffedc0,.33);
      g.fillCircle(600,travelerY,5);
    }
  }
}
