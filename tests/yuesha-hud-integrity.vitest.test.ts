import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {ROOM_ART_MANIFEST} from '../src/core/room-art-manifest';

describe('Moonsha HUD keeps real state rather than hard-coded visual prototype values',()=>{
  it('uses persisted observations for memory shelf and preserves room interactions',()=>{
    const page=readFileSync('src/components/game/yuesha-private-room.tsx','utf8');
    expect(page).toContain('<YueshaMemoryShelf progress={progress} onRevisit={revisit}/>');
    expect(page).toContain("commitCharacterLife({type:'inspect',id:'yuesha',item})");
    expect(page).toContain('RoomDialogueTheater');
    expect(page).not.toContain('128,650');
    expect(page).not.toContain('320 / 500');
    expect(page).not.toContain('setAffectionXp');
  });
  it('does not misrepresent concept art as production artwork',()=>{
    expect(ROOM_ART_MANIFEST.yuesha.backgroundStatus).toBe('concept');
    expect(ROOM_ART_MANIFEST.yuesha.composition).toBe('embedded-resident');
  });
});
