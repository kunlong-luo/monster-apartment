import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {roomHotspotPosition} from '../src/core/room-stage-layout';
import {ROOM_ART_MANIFEST,roomPublicAssetPath} from '../src/core/room-art-manifest';
import {CHARACTER_ROOM_OBJECTS} from '../src/core/character-life';

describe('V3.7 independent art admission and stable hotspot IDs',()=>{
  it('keeps all temporary backdrops explicitly labelled and prevents repeated baked residents',()=>{
    for(const id of ['yuesha','brook','fern','cinder'] as const){
      expect(ROOM_ART_MANIFEST[id].composition).toBe('layered-concept');
      const svg=readFileSync(ROOM_ART_MANIFEST[id].conceptPreview,'utf8');
      expect(svg).toContain('viewBox="0 0 1920 1080"');
      expect(svg).not.toMatch(/<image\\b|<text\\b/);
    }
    const entry=JSON.parse(readFileSync('public/art/rooms/manifest.json','utf8'));
    expect(entry.version).toBe(1);
    for(const id of Object.keys(ROOM_ART_MANIFEST) as (keyof typeof ROOM_ART_MANIFEST)[]){
      const art=ROOM_ART_MANIFEST[id];
      expect(art.backgroundStatus).toBe('concept');
      expect(art.layout).toBe('concept');
      expect(entry.rooms[id].poses.length).toBe(4);
    }
  });
  it('identifies interactive objects regardless of rendering order',()=>{
    for(const id of ['yuesha','brook','fern','cinder'] as const){
      const seen=new Set<string>();
      for(const object of CHARACTER_ROOM_OBJECTS[id]){
        const spot=roomHotspotPosition(id,object,2);
        const key=spot.left+'-'+spot.top;
        expect(seen.has(key)).toBe(false);
        seen.add(key);
        expect(Number.parseInt(spot.left)).toBeGreaterThanOrEqual(8);
        expect(Number.parseInt(spot.left)).toBeLessThanOrEqual(80);
        expect(Number.parseInt(spot.top)).toBeGreaterThanOrEqual(20);
        expect(Number.parseInt(spot.top)).toBeLessThanOrEqual(85);
      }
    }
    expect(roomHotspotPosition('yuesha','seal',2))
      .toEqual(roomHotspotPosition('yuesha','seal',0));
  });
  it('resolves only safe production paths',()=>{
    expect(roomPublicAssetPath('public/art/rooms/yuesha/background.webp'))
      .toContain('/art/rooms/yuesha/background.webp');
    expect(()=>roomPublicAssetPath('public/../../private.png')).toThrow();
  });
});
