import * as Phaser from 'phaser';
import { TENANTS, synergyDetails } from '../core/engine.js';
import type { GameState } from '../core/engine.js';

export const gameEvents = new Phaser.Events.EventEmitter();

export default class ApartmentScene extends Phaser.Scene {
  constructor() { super('ApartmentScene'); }
  create() {
    this.cameras.main.setBackgroundColor('#101b2d');
    gameEvents.emit('scene-ready', this);
  }
  updateBoard(state: GameState, selected: number | null, moveSource: number | null) {
    this.children.removeAll(true);
    const { width, height } = this.scale;
    this.add.rectangle(width/2,height/2,width,height,0x101b2d);
    this.add.text(26, 18, 'MONSTER APARTMENT / FLOOR PLAN', { fontFamily: 'system-ui,sans-serif', color:'#91a6c0', fontSize:'14px', fontStyle:'bold' });
    this.add.text(width-26, 18, `DAY ${state.day} / 5`, { fontFamily: 'system-ui,sans-serif', color:'#ddc798', fontSize:'14px' }).setOrigin(1,0);
    const synergies = synergyDetails(state.rooms);
    this.add.text(26, 48, `房间布局  •  相邻组合 ${synergies.coins>=0?'+':''}${synergies.coins} 金币/天`, { fontFamily:'system-ui,sans-serif', color:'#d4dfed', fontSize:'18px' });
    const startY = 130, rowGap=162, leftX=38, roomW=268, roomH=139, roomGap=18;
    for (let i=0;i<state.rooms.length;i++) {
      const row=Math.floor(i/2), col=i%2;
      const x=leftX+col*(roomW+roomGap), y=startY+row*rowGap;
      const picked=selected===i, moving=moveSource===i, occupant=state.rooms[i], tenant=occupant?TENANTS[occupant]:null;
      const fill=picked?0x26485a:0x192d43;
      const rect=this.add.rectangle(x+roomW/2,y+roomH/2,roomW,roomH,fill).setOrigin(.5);
      rect.setStrokeStyle(moving?4:picked?3:1,moving?0xf0bf63:picked?0x66dbbc:0x35506b);
      rect.setInteractive({ useHandCursor:true });
      rect.on('pointerdown',()=>gameEvents.emit('room-picked', i));
      this.add.text(x+14,y+13,`${i+1} 号房  ·  ${3-row}F`,{fontFamily:'system-ui,sans-serif',fontSize:'14px',color:'#9eb4ca'});
      if (tenant) {
        this.add.text(x+18,y+42,tenant.icon,{fontFamily:'sans-serif',fontSize:'42px',color:'#'+tenant.color.toString(16).padStart(6,'0')});
        this.add.text(x+75,y+50,tenant.name,{fontFamily:'system-ui,sans-serif',fontSize:'21px',fontStyle:'bold',color:'#ffffff'});
        this.add.text(x+77,y+89,`基础租金 +${tenant.rent} / 天`,{fontFamily:'system-ui,sans-serif',fontSize:'14px',color:'#e4c786'});
      } else {
        this.add.text(x+roomW/2,y+65,'＋ 空房', {fontFamily:'system-ui,sans-serif',fontSize:'23px',color:'#7795ad'}).setOrigin(.5);
        this.add.text(x+roomW/2,y+101,'点击选择，安排租客',{fontFamily:'system-ui,sans-serif',fontSize:'13px',color:'#5e7b96'}).setOrigin(.5);
      }
    }
    this.add.rectangle(width/2,height-25,width-44,1,0x35506b);
    this.add.text(26,height-19,'点击选择房间 · 搬家后再选目标房间 · 布局影响收入与满意度', {fontFamily:'system-ui,sans-serif',fontSize:'12px',color:'#8da6bd'}).setOrigin(0,1);
  }
}
