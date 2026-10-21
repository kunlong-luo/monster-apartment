import * as Phaser from 'phaser';
import { LAST_DAY, TENANTS, synergyDetails } from '@/core/engine';
import type { GameState, RoomSlot } from '@/core/engine';
import { t, tenantNames } from '@/lib/i18n';
import type { Locale } from '@/lib/i18n';
import { apartmentEvents } from './events';

const PALETTE = {
  background: 0x101b2d, roomIdle: 0x192d43, roomPicked: 0x26485a,
  strokeIdle: 0x35506b, strokePicked: 0x66dbbc, strokeMoving: 0xf0bf63,
  divider: 0x35506b,
} as const;

const FONT = 'system-ui,sans-serif';

export default class ApartmentScene extends Phaser.Scene {
  static readonly KEY = 'ApartmentScene';

  constructor() {
    super(ApartmentScene.KEY);
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#101b2d');
    apartmentEvents.emit('scene-ready', this);
  }

  private colorOf(slot: RoomSlot): string {
    if (!slot) return '#7795ad';
    return '#' + TENANTS[slot].color.toString(16).padStart(6, '0');
  }

  updateBoard(state: GameState, selected: number | null, moveSource: number | null, locale: Locale): void {
    this.children.removeAll(true);
    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, PALETTE.background);

    this.add.text(26, 18, t(locale, 'stageTitle'), {
      fontFamily: FONT, color: '#91a6c0', fontSize: '14px', fontStyle: 'bold',
    });
    this.add.text(width - 26, 18, 'DAY ' + state.day + ' / ' + LAST_DAY, {
      fontFamily: FONT, color: '#ddc798', fontSize: '14px',
    }).setOrigin(1, 0);

    const synergy = synergyDetails(state.rooms);
    this.add.text(26, 48,
      t(locale, 'stageFloor') + '  •  ' + t(locale, 'synergy') + ' ' +
      (synergy.coins >= 0 ? '+' : '') + synergy.coins +
      (locale === 'zh' ? ' 金币/天' : ' coins/day'), {
        fontFamily: FONT, color: '#d4dfed', fontSize: '18px',
      });

    const startY = 130;
    const rowGap = 162;
    const leftX = 38;
    const roomW = 268;
    const roomH = 139;
    const roomGap = 18;

    for (let i = 0; i < state.rooms.length; i++) {
      const row = Math.floor(i / 2);
      const col = i % 2;
      const x = leftX + col * (roomW + roomGap);
      const y = startY + row * rowGap;
      const picked = selected === i;
      const moving = moveSource === i;
      const occupant = state.rooms[i];
      const tenant = occupant ? TENANTS[occupant] : null;

      const rect = this.add
        .rectangle(x + roomW / 2, y + roomH / 2, roomW, roomH, picked ? PALETTE.roomPicked : PALETTE.roomIdle)
        .setOrigin(0.5, 0.5);
      rect.setStrokeStyle(moving ? 4 : picked ? 3 : 1,
        moving ? PALETTE.strokeMoving : picked ? PALETTE.strokePicked : PALETTE.strokeIdle);
      rect.setInteractive({ useHandCursor: true });
      rect.on('pointerdown', () => apartmentEvents.emit('room-picked', i));

      const roomName = locale === 'zh' ? String(i + 1) + ' 号房' : 'Room ' + (i + 1);
      this.add.text(x + 14, y + 13, roomName + ' · ' + (3 - row) + 'F', {
        fontFamily: FONT, fontSize: '14px', color: '#9eb4ca',
      });

      if (tenant && occupant) {
        this.add.text(x + 18, y + 42, tenant.icon, {
          fontFamily: 'sans-serif', fontSize: '42px', color: this.colorOf(occupant),
        });
        this.add.text(x + 75, y + 50, tenantNames[locale][occupant], {
          fontFamily: FONT, fontSize: '21px', fontStyle: 'bold', color: '#ffffff',
        });
        this.add.text(x + 77, y + 89,
          t(locale, 'stageRent') + ' +' + tenant.rent + (locale === 'zh' ? ' / 天' : ' / day'), {
            fontFamily: FONT, fontSize: '14px', color: '#e4c786',
          });
      } else {
        this.add.text(x + roomW / 2, y + 65, t(locale, 'stageEmpty'), {
          fontFamily: FONT, fontSize: '23px', color: '#7795ad',
        }).setOrigin(0.5, 0.5);
        this.add.text(x + roomW / 2, y + 101, t(locale, 'stagePick'), {
          fontFamily: FONT, fontSize: '13px', color: '#5e7b96',
        }).setOrigin(0.5, 0.5);
      }
    }

    this.add.rectangle(width / 2, height - 25, width - 44, 1, PALETTE.divider);
    this.add.text(26, height - 19, t(locale, 'stageFooter'), {
      fontFamily: FONT, fontSize: '12px', color: '#8da6bd',
    }).setOrigin(0, 1);
  }
}
