import * as Phaser from 'phaser';
import { LAST_DAY, ROOM_TRAITS, synergyDetails } from '@/core/engine';
import { SPIRIT_BY_ID } from '@/core/spirit-collection';
import type { SpiritId } from '@/core/spirit-collection';
import type { GameState, RoomSlot } from '@/core/engine';
import { roomMotionEvents } from './room-motion';
import { t } from '@/lib/i18n';
import { traitLabel } from '@/lib/strategy-labels';
import type { Locale } from '@/lib/i18n';
import { apartmentEvents } from './events';

const FONT = '"Noto Sans CJK SC","Microsoft YaHei","Trebuchet MS",system-ui,sans-serif';

const COLOR = {
  sky: 0x15162e, skyLight: 0x292543, wall: 0x42334c,
  outline: 0x261c36, mortar: 0x6a4b5b, wood: 0x634154,
  candle: 0xffd8a0, gold: 0xecc18c, cream: 0xfff0db,
  lavender: 0xc9b4e6, mint: 0x8be1c0, coral: 0xf4a39a,
} as const;

const FACTION_COLORS = {
  tide: { body: 0x65c9d4, light: 0xc4f8f4, shade: 0x28566b },
  forge: { body: 0xf0b35e, light: 0xffe9ae, shade: 0x7d4855 },
  veil: { body: 0xb49bea, light: 0xefdbff, shade: 0x4d3c77 },
  grove: { body: 0x83cf96, light: 0xdcf9bb, shade: 0x36604a },
} as const;

function spiritPortrait(g: Phaser.GameObjects.Graphics, id: SpiritId, cx: number, cy: number) {
  const creature = SPIRIT_BY_ID[id];
  const color = FACTION_COLORS[creature.faction];
  const variant = Array.from(id).reduce((sum, letter) => sum + letter.charCodeAt(0), 0) % 4;
  const shine = creature.quality === 'UR' ? 0.32 : creature.quality === 'SSR' ? 0.24 : 0.14;
  g.fillStyle(color.body, shine);
  g.fillCircle(cx, cy - 2, 43);
  g.fillStyle(color.shade, .85);
  g.fillEllipse(cx, cy + 20, 77, 49);
  g.fillStyle(color.body);
  if (variant === 0) {
    g.fillRoundedRect(cx - 33, cy - 18, 66, 59, 20);
  } else if (variant === 1) {
    g.fillEllipse(cx, cy + 5, 76, 73);
  } else if (variant === 2) {
    g.fillTriangle(cx - 36, cy + 30, cx + 36, cy + 30, cx, cy - 40);
    g.fillEllipse(cx, cy + 14, 60, 45);
  } else {
    g.fillEllipse(cx, cy + 4, 63, 76);
    g.fillTriangle(cx - 30, cy - 16, cx - 12, cy - 44, cx + 1, cy - 10);
    g.fillTriangle(cx + 30, cy - 16, cx + 12, cy - 44, cx - 1, cy - 10);
  }
  g.fillStyle(color.light, .6);
  g.fillEllipse(cx - 10, cy - 7, 31, 25);
  g.fillStyle(color.shade);
  g.fillEllipse(cx - 12, cy + 8, 6, 10);
  g.fillEllipse(cx + 13, cy + 8, 6, 10);
  g.lineStyle(2, color.light, .75);
  g.strokeCircle(cx, cy - 31, creature.quality === 'UR' ? 8 : 4);
  if (creature.element === 'wind' || creature.element === 'light') {
    g.fillStyle(color.light, .62);
    g.fillTriangle(cx - 25, cy + 8, cx - 51, cy - 16, cx - 40, cy + 26);
    g.fillTriangle(cx + 25, cy + 8, cx + 51, cy - 16, cx + 40, cy + 26);
  } else if (creature.element === 'water') {
    g.fillStyle(color.light, .55);
    g.fillEllipse(cx - 37, cy + 19, 21, 13);
    g.fillEllipse(cx + 37, cy + 19, 21, 13);
  } else if (creature.element === 'stone') {
    g.fillStyle(color.light, .5);
    g.fillRoundedRect(cx - 40, cy + 18, 14, 19, 3);
    g.fillRoundedRect(cx + 26, cy + 18, 14, 19, 3);
  } else {
    g.fillStyle(color.light, .72);
    g.fillCircle(cx - 35, cy - 20, 5);
    g.fillCircle(cx + 35, cy - 20, 5);
  }
}

export default class ApartmentScene extends Phaser.Scene {
  static readonly KEY = 'ApartmentScene';
  private previousRooms: RoomSlot[] | null = null;
  constructor() { super(ApartmentScene.KEY); }

  create(): void {
    this.cameras.main.setBackgroundColor('#15162e');
    apartmentEvents.emit('scene-ready', this);
  }

  private text(value: string, x: number, y: number, size: number, color: string, bold = false) {
    return this.add.text(x, y, value, {
      fontFamily: FONT, fontSize: size + 'px', fontStyle: bold ? 'bold' : 'normal', color,
    });
  }

  updateBoard(state: GameState, selected: number | null, moveSource: number | null, locale: Locale): void {
    const effects = roomMotionEvents(this.previousRooms, state.rooms);
    this.previousRooms = [...state.rooms];
    // A room selection redraws the board. Kill old infinite idle tweens first.
    this.tweens.killAll();
    this.children.removeAll(true);
    const reducedMotion = typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const { width, height } = this.scale;
    const bg = this.add.graphics();

    // Midnight sky, scattered stars, distant towers and crescent moon.
    bg.fillStyle(COLOR.sky);
    bg.fillRect(0, 0, width, height);
    bg.fillStyle(COLOR.skyLight, .55);
    bg.fillCircle(488, 95, 178);
    bg.fillCircle(123, 290, 166);
    for (let i = 0; i < 28; i++) {
      const x = 14 + ((i * 79) % 600);
      const y = 18 + ((i * 43) % 114);
      bg.fillStyle(i % 3 === 0 ? 0xffe8c7 : 0xada4d6, .65);
      bg.fillCircle(x, y, i % 5 === 0 ? 2 : 1);
    }
    bg.fillStyle(0xf9db9a, .13);
    bg.fillCircle(508, 68, 37);
    bg.fillStyle(0xffe9b8);
    bg.fillCircle(508, 68, 22);
    bg.fillStyle(COLOR.skyLight);
    bg.fillCircle(518, 59, 21);
    bg.fillStyle(0x2a263f);
    for (let i = 0; i < 13; i++) {
      const x = i * 55;
      const hh = 46 + ((i * 37) % 55);
      bg.fillRect(x, 138 - hh, 36, hh + 26);
    }

    // Wooden roof and the apartment facade.
    bg.fillStyle(0x2b2035, .85);
    bg.fillRoundedRect(13, 124, 602, 500, 17);
    bg.fillStyle(0x70475f);
    bg.fillTriangle(12, 147, 314, 76, 616, 147);
    bg.lineStyle(5, 0xb47d78);
    bg.lineBetween(18, 145, 313, 80);
    bg.lineBetween(313, 80, 610, 145);
    bg.fillStyle(0x563d56);
    bg.fillRoundedRect(79, 87, 40, 44, 5);
    bg.fillStyle(0xc98b75);
    bg.fillRect(83, 77, 33, 9);
    bg.fillStyle(COLOR.wall);
    bg.fillRoundedRect(20, 140, 588, 467, 9);
    bg.lineStyle(5, COLOR.outline);
    bg.strokeRoundedRect(20, 140, 588, 467, 9);
    bg.fillStyle(0x4a3047);
    bg.fillRect(24, 599, 580, 12);
    for (let i = 0; i < 9; i++) {
      bg.lineStyle(1, COLOR.mortar, .45);
      const yy = 158 + i * 48;
      bg.lineBetween(23, yy, 605, yy);
    }

    this.text(locale === 'zh' ? '✦ 星域灵核公寓 ✦' : '✦ SPIRIT CORE RESIDENCE ✦', 28, 18, 17, '#ffe0ac', true);
    this.text('NIGHT ' + state.day + ' / ' + LAST_DAY, 588, 20, 13, '#f0c38f', true).setOrigin(1, 0);

    const synergy = synergyDetails(state.rooms);
    const hint = t(locale, 'synergy') + ' ' + (synergy.coins >= 0 ? '+' : '') + synergy.coins +
      (locale === 'zh' ? ' / 天' : ' / day');
    this.text(hint, 313, 110, 13, '#fff1d7', true).setOrigin(.5, .5);

    const left = 30;
    const top = 148;
    const gap = 12;
    const roomW = 278;
    const roomH = 143;
    const floorStep = 151;

    for (let i = 0; i < 6; i++) {
      const row = Math.floor(i / 2);
      const x = left + (i % 2) * (roomW + gap);
      const y = top + row * floorStep;
      const picked = selected === i;
      const moving = moveSource === i;
      const target = moveSource !== null && moveSource !== i;
      const id = state.rooms[i];
      const spirit = id ? SPIRIT_BY_ID[id] : null;
      const scene = this.add.graphics();

      // Warm lit rooms, walls, wood floor, little picture and tall window.
      scene.fillStyle(picked ? 0x6c4b5a : 0x544054);
      scene.fillRoundedRect(x, y, roomW, roomH, 6);
      scene.fillStyle(id ? 0x8d614e : 0x694e59, .6);
      scene.fillRect(x + 4, y + 4, roomW - 8, roomH - 27);
      scene.fillStyle(id ? 0xf5c481 : 0xb7a0ad, id ? .13 : .08);
      scene.fillCircle(x + 207, y + 57, 86);
      scene.fillStyle(0x593b4d);
      scene.fillRect(x + 3, y + roomH - 22, roomW - 6, 17);
      scene.fillStyle(0xb87b63);
      scene.fillRect(x + 3, y + roomH - 24, roomW - 6, 5);
      for (let plank = 1; plank <= 4; plank++) {
        scene.lineStyle(1, 0x432e40, .45);
        scene.lineBetween(x + plank * 55, y + roomH - 21, x + plank * 55 + 9, y + roomH - 5);
      }

      // A lit arched window and a tiny picture frame on every floor.
      scene.fillStyle(0x302c4f);
      scene.fillRoundedRect(x + 15, y + 34, 55, 70, 20);
      scene.fillStyle(id ? 0xf1bd80 : 0x6e7991, id ? .86 : .53);
      scene.fillRoundedRect(x + 20, y + 39, 45, 60, 16);
      scene.lineStyle(3, 0x594254);
      scene.lineBetween(x + 42, y + 38, x + 42, y + 100);
      scene.lineBetween(x + 19, y + 70, x + 67, y + 70);
      scene.fillStyle(0x644254);
      scene.fillRoundedRect(x + 78, y + 40, 42, 34, 4);
      scene.fillStyle(0xdfb989);
      scene.fillRoundedRect(x + 83, y + 45, 32, 24, 3);
      scene.fillStyle(0x82749b);
      scene.fillTriangle(x + 88, y + 66, x + 97, y + 52, x + 111, y + 66);

      // Rug, low cabinet and an individual glowing ceiling lamp.
      scene.fillStyle(0xb57870, .78);
      scene.fillEllipse(x + 176, y + 117, 120, 14);
      scene.fillStyle(0x4c354b);
      scene.fillRoundedRect(x + 88, y + 88, 33, 25, 4);
      scene.fillStyle(0xb18a74);
      scene.fillRect(x + 92, y + 92, 25, 4);
      scene.lineStyle(2, 0xcda483);
      scene.lineBetween(x + 216, y + 3, x + 216, y + 22);
      scene.fillStyle(id ? 0xf8ca8e : 0x9882aa, id ? .29 : .15);
      scene.fillCircle(x + 216, y + 29, 28);
      scene.fillStyle(0xf4cfa1);
      scene.fillEllipse(x + 216, y + 28, 24, 13);

      if (spirit && id) {
        // The stationary shadow anchors the character while the separate Graphics bobs.
        scene.fillStyle(0x191321, .27);
        scene.fillEllipse(x + 180, y + 116, 76, 15);
        const actor = this.add.graphics();
        spiritPortrait(actor, id, x + 180, y + 79);
        if (!reducedMotion) {
          const amplitude = spirit.faction === 'veil' ? 7 : spirit.faction === 'forge' ? 3 : 5;
          const period = spirit.faction === 'veil' ? 1600 : spirit.faction === 'forge' ? 1100 : 1400;
          this.tweens.add({
            targets: actor, y: -amplitude, duration: period, yoyo: true, repeat: -1,
            ease: 'Sine.easeInOut', delay: i * 95,
          });
          if (effects[i] === 'arrival' || effects[i] === 'rearranged') {
            actor.setAlpha(.25);
            this.tweens.add({ targets: actor, alpha: 1, duration: 320, ease: 'Sine.easeOut' });
          }
        }
      } else {
        scene.lineStyle(2, 0xdebca8, .48);
        scene.strokeRoundedRect(x + 153, y + 49, 65, 51, 18);
        scene.lineStyle(4, 0xe5c49c, .75);
        scene.lineBetween(x + 185, y + 59, x + 185, y + 90);
        scene.lineBetween(x + 171, y + 75, x + 200, y + 75);
      }

      // Borders indicate selected, moving source, or valid drop targets.
      const border = moving ? COLOR.gold : picked ? COLOR.mint : target ? 0xb68ac6 : 0x725266;
      scene.lineStyle(moving || picked ? 4 : target ? 2 : 1.5, border);
      scene.strokeRoundedRect(x + 1, y + 1, roomW - 2, roomH - 2, 6);
      if (picked) {
        scene.lineStyle(2, COLOR.mint, .32);
        scene.strokeRoundedRect(x - 3, y - 3, roomW + 6, roomH + 6, 8);
      }

      // UI plates stay readable over the illustration.
      scene.fillStyle(0x211c34, .9);
      scene.fillRoundedRect(x + 9, y + 8, 89, 23, 8);
      const name = locale === 'zh' ? String(i + 1) + ' 号房' : 'Room ' + (i + 1);
      this.text(name + ' · ' + (3 - row) + 'F', x + 17, y + 12, 12, '#fff0dd', true);
      // A permanent icon makes room characteristics visible before hiring.
      this.text(ROOM_TRAITS[i].icon + ' ' + traitLabel(locale, i), x + roomW - 13, y + 12,
        11, '#ffe2ac', true).setOrigin(1, 0);

      if (id && spirit) {
        scene.fillStyle(0x211c34, .92);
        scene.fillRoundedRect(x + 113, y + 106, 150, 29, 9);
        this.text(spirit[locale], x + 124, y + 109, 12, '#fff0dd', true);
        this.text(spirit.quality, x + 256, y + 112, 12, '#ffdb94', true).setOrigin(1, 0);
      } else {
        scene.fillStyle(0x211c34, .83);
        scene.fillRoundedRect(x + 133, y + 106, 133, 26, 8);
        this.text(locale === 'zh' ? '等待灵核入住' : 'EMPTY', x + 200, y + 111, 13, '#edd1ba', true).setOrigin(.5, 0);
      }

      // Feedback appears only when an occupant changed, never for simple selection.
      if (effects[i] !== 'none') {
        const text = effects[i] === 'arrival' ? '✦' : effects[i] === 'rearranged' ? '↔' : '·';
        const label = this.text(text, x + roomW / 2, y + 41, 24, '#ffe3a6', true).setOrigin(.5);
        if (!reducedMotion) {
          this.tweens.add({ targets: label, y: y + 12, alpha: 0,
            duration: 760, ease: 'Sine.easeOut', onComplete: () => label.destroy() });
        }
      }

      // Put input over the art but retain the keyboard-accessible room buttons in React.
      const hit = this.add.rectangle(x + roomW / 2, y + roomH / 2, roomW, roomH, 0xffffff, .001);
      if (!state.over) {
        hit.setInteractive({ useHandCursor: true });
        hit.on('pointerdown', () => apartmentEvents.emit('room-picked', i));
        hit.on('pointerover', () => hit.setFillStyle(0xffffff, .055));
        hit.on('pointerout', () => hit.setFillStyle(0xffffff, .001));
      }
    }

    const foreground = this.add.graphics();
    foreground.fillStyle(0x48324b);
    foreground.fillRoundedRect(18, 597, 590, 15, 6);
    foreground.fillStyle(0xe3ae84);
    foreground.fillRoundedRect(18, 597, 590, 4, 2);

    this.text(t(locale, 'stageFooter'), 314, height - 38, 12, '#bfaccd').setOrigin(.5, 0);
  }
}
