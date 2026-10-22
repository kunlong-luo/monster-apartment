import * as Phaser from 'phaser';
import type { CollectionState, SpiritId } from '@/core/spirit-collection';
import { SPIRIT_BY_ID } from '@/core/spirit-collection';
import { SPIRIT_ART } from '@/core/spirit-art';
import type { RaidState, Raider, Lane } from '@/core/night-raid';

/** Phaser is only a visual renderer. React and pure rules own the fight. */
export class RaidScene extends Phaser.Scene {
  static readonly KEY = 'starfall-battle';
  private terrain?: Phaser.GameObjects.Graphics;
  private attackers = new Map<number, Phaser.GameObjects.Container>();
  private defenders: Phaser.GameObjects.Container[] = [];
  private warningGfx?: Phaser.GameObjects.Graphics;
  private renderedTick = -1;
  private renderedSkill = 0;
  private renderedBlast = -1;
  private renderedBreach = -1;

  constructor() { super({ key: RaidScene.KEY }); }

  create(): void {
    this.cameras.main.setBackgroundColor('#16182c');
    this.terrain = this.add.graphics();
    const g = this.terrain;
    g.fillGradientStyle(0x28354d, 0x2e304d, 0x1e3146, 0x272b42, 1);
    g.fillRoundedRect(0, 0, 960, 342, 22);
    for (let lane = 0; lane < 3; lane++) {
      const y = 13 + lane * 110;
      g.fillStyle(lane % 2 ? 0x292b48 : 0x26354a, 1);
      g.fillRoundedRect(12, y, 936, 99, 14);
      g.lineStyle(1, 0xa2adcf, .22);
      g.strokeRoundedRect(12, y, 936, 99, 14);
      for (let x = 174; x < 925; x += 84) {
        g.lineStyle(2, 0x9aacc2, .12);
        g.lineBetween(x, y + 50, x + 24, y + 50);
      }
      g.fillStyle(0x6fd0b1, .19);
      g.fillRoundedRect(34, y + 10, 80, 78, 12);
      g.lineStyle(2, 0xa2f9d7, .8);
      g.strokeCircle(74, y + 49, 22);
      g.fillStyle(0xffb3a7, .6);
      g.fillTriangle(923, y + 38, 939, y + 49, 923, y + 60);
    }
    this.warningGfx = this.add.graphics();
    this.events.emit('raid-ready');
  }

  private enemyX(enemy: Raider): number {
    return Math.min(915, 92 + enemy.distance * 77);
  }

  private laneY(lane: Lane): number { return 62 + lane * 110; }

  private drawDefender(id: SpiritId, lane: Lane, evolution: number): Phaser.GameObjects.Container {
    const art = SPIRIT_ART[id];
    const x = 75, y = this.laneY(lane);
    const objects: Phaser.GameObjects.GameObject[] = [];
    const glyph = this.add.graphics();
    const primary = Number.parseInt(art.primary.slice(1), 16);
    const highlight = Number.parseInt(art.highlight.slice(1), 16);
    glyph.fillStyle(primary, .16);
    glyph.fillCircle(0, 0, 43);
    glyph.lineStyle(3, highlight, .7);
    glyph.strokeCircle(0, 0, 37);
    glyph.fillStyle(primary, 1);
    glyph.fillEllipse(0, 8, 53, 49);
    glyph.fillStyle(highlight, 1);
    glyph.fillTriangle(-19, -16, -12, -31, -4, -14);
    glyph.fillTriangle(19, -16, 12, -31, 4, -14);
    if (evolution > 0) {
      glyph.fillStyle(0xffd8a5, .95);
      glyph.fillTriangle(-17, -24, -9, -40, 0, -24);
      glyph.fillTriangle(0, -24, 9, -40, 17, -24);
      if (evolution > 1) glyph.fillCircle(0, -35, 5);
    }
    glyph.fillStyle(0x20233d);
    glyph.fillCircle(-9, 6, 3.5);
    glyph.fillCircle(9, 6, 3.5);
    objects.push(glyph);
    objects.push(this.add.text(0, 39, SPIRIT_BY_ID[id].icon, {
      fontSize: '16px', color: art.highlight, fontFamily: 'sans-serif',
    }).setOrigin(.5));
    const container = this.add.container(x, y, objects);
    this.tweens.add({ targets: container, y: y - 4, yoyo: true, repeat: -1,
      duration: 900 + lane * 160, ease: 'Sine.easeInOut' });
    return container;
  }

  private drawRaider(enemy: Raider): Phaser.GameObjects.Container {
    const boss = enemy.kind === 'boss';
    const brute = enemy.kind === 'brute';
    const color = boss ? 0xd97dc3 : brute ? 0xd88b79 : 0xaeb6d8;
    const parts: Phaser.GameObjects.GameObject[] = [];
    const g = this.add.graphics();
    g.fillStyle(0x050616, .4);
    g.fillEllipse(0, 27, boss ? 70 : 44, 12);
    g.fillStyle(color, 1);
    if (boss) {
      g.fillTriangle(-29, -13, -22, -45, -4, -26);
      g.fillTriangle(29, -13, 22, -45, 4, -26);
      g.fillEllipse(0, 0, 60, 52);
    } else if (brute) {
      g.fillRoundedRect(-22, -21, 44, 44, 12);
      g.fillRoundedRect(-30, 0, 16, 25, 4);
      g.fillRoundedRect(14, 0, 16, 25, 4);
    } else {
      g.fillTriangle(-24, 12, 0, -30, 24, 12);
      g.fillEllipse(0, 9, 36, 27);
    }
    g.fillStyle(0x1c1838);
    g.fillEllipse(0, -4, boss ? 29 : 18, 16);
    g.fillStyle(boss ? 0xffd1f4 : 0xfff1c2);
    g.fillCircle(0, -5, boss ? 7 : 5);
    parts.push(g);
    const bar = this.add.graphics();
    bar.setName('hpbar');
    parts.push(bar);
    const c = this.add.container(this.enemyX(enemy), this.laneY(enemy.lane), parts);
    this.updateHealth(c, enemy);
    return c;
  }

  private updateHealth(c: Phaser.GameObjects.Container, enemy: Raider): void {
    const bar = c.getByName('hpbar') as Phaser.GameObjects.Graphics | null;
    if (!bar) return;
    bar.clear();
    bar.fillStyle(0x121426, .95);
    bar.fillRoundedRect(-25, 31, 50, 7, 3);
    bar.fillStyle(enemy.kind === 'boss' ? 0xffa4e4 : 0xf0b08d, 1);
    bar.fillRoundedRect(-24, 32, Math.max(0, 48 * enemy.hp / enemy.maxHp), 5, 2);
  }

  private shot(from: {x:number;y:number}, to: {x:number;y:number}, color: number, skill = false): void {
    const ray = this.add.circle(from.x, from.y, skill ? 10 : 5, color, 1);
    ray.setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({ targets: ray, x: to.x, y: to.y, duration: skill ? 260 : 350,
      ease: 'Sine.easeIn', onComplete: () => {
        ray.destroy();
        const ring = this.add.circle(to.x, to.y, skill ? 27 : 12, color, .75);
        ring.setBlendMode(Phaser.BlendModes.ADD);
        this.tweens.add({targets:ring, scale: skill ? 1.8 : 1.5, alpha:0,
          duration:300, onComplete:()=>ring.destroy()});
      }});
  }

  private pulse(lane: Lane, color: number): void {
    const y = this.laneY(lane);
    const wave = this.add.rectangle(481, y, 830, 91, color, .32);
    wave.setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({targets:wave, alpha:0, duration:650, onComplete:()=>wave.destroy()});
    this.cameras.main.shake(180, .004);
  }

  sync(raid: RaidState, collection: CollectionState): void {
    if (!this.sys.isActive() || !this.terrain) return;
    const nextDefenders = raid.lineup.map(id => id ? id + ':' + (collection.owned[id]?.evolution ?? 0) : '').join('|');
    if (this.registry.get('lineup') !== nextDefenders) {
      this.defenders.forEach(c => c.destroy());
      this.defenders = [];
      raid.lineup.forEach((id, lane) => {
        if (id) this.defenders.push(this.drawDefender(id, lane as Lane, collection.owned[id]?.evolution ?? 0));
      });
      this.registry.set('lineup', nextDefenders);
    }
    const live = new Set(raid.enemies.map(e => e.id));
    for (const [id, sprite] of this.attackers) {
      if (live.has(id)) continue;
      this.attackers.delete(id);
      this.tweens.killTweensOf(sprite);
      this.tweens.add({targets:sprite, alpha:0, scale:1.4, duration:180,
        onComplete:()=>sprite.destroy()});
    }
    for (const enemy of raid.enemies) {
      let sprite = this.attackers.get(enemy.id);
      if (!sprite) {
        sprite = this.drawRaider(enemy);
        this.attackers.set(enemy.id, sprite);
        sprite.setScale(.65).setAlpha(.2);
        this.tweens.add({targets:sprite, alpha:1, scale:1, duration:280});
      }
      this.updateHealth(sprite, enemy);
      this.tweens.killTweensOf(sprite);
      this.tweens.add({targets:sprite, x:this.enemyX(enemy), duration:Math.max(60, raid.tick > 0 ? 470 : 10), ease:'Linear'});
    }
    const warning = this.warningGfx;
    if (warning) {
      warning.clear();
      if (raid.bossWarning) {
        const top = 13 + raid.bossWarning.lane * 110;
        warning.fillStyle(0xff697f, .16);
        warning.fillRoundedRect(12, top, 936, 99, 14);
        warning.lineStyle(5, 0xffa0b6, .84);
        warning.strokeRoundedRect(15, top + 3, 930, 93, 12);
      }
    }
    if (raid.phase === 'fighting' && this.renderedTick !== raid.tick) {
      if (this.renderedTick >= 0 && raid.tick > this.renderedTick) {
        for (let lane = 0; lane < 3; lane++) {
          const id = raid.lineup[lane];
          const target = raid.enemies.filter(e => e.lane === lane)
            .sort((a,b)=>a.distance - b.distance)[0];
          if (id && target) this.shot({x:107,y:this.laneY(lane as Lane)},
            {x:this.enemyX(target),y:this.laneY(lane as Lane)},
            Number.parseInt(SPIRIT_ART[id].highlight.slice(1),16));
        }
      }
      this.renderedTick = raid.tick;
    }
    if (raid.lastSkill && raid.lastSkill.serial !== this.renderedSkill) {
      this.renderedSkill = raid.lastSkill.serial;
      this.shot({x:72,y:this.laneY(raid.lastSkill.lane)},
        {x:450,y:this.laneY(raid.lastSkill.lane)}, 0xffdd98, true);
      this.pulse(raid.lastSkill.lane, raid.lastSkill.role === 'explore' ? 0xb6d7fc : 0xffd496);
    }
    if (raid.lastBossBlast && raid.lastBossBlast.serial !== this.renderedBlast) {
      this.renderedBlast = raid.lastBossBlast.serial;
      this.pulse(raid.lastBossBlast.lane, 0xed6485);
    }
    if (raid.lastBreach && raid.lastBreach.serial !== this.renderedBreach) {
      this.renderedBreach = raid.lastBreach.serial;
      this.cameras.main.flash(180, 155, 50, 75, false);
    }
  }
}
