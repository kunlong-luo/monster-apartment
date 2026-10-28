import {describe,expect,it} from 'vitest';
import {dialogueBeatDuration,dialogueBeats,roomObjectPose,roomTopicPose} from '../src/core/room-performance';
import {ROOM_ART_MANIFEST} from '../src/core/room-art-manifest';

describe('room performance and clean art slots',()=>{
  it('maps investigations to independent poses without touching save state',()=>{
    expect(roomObjectPose('yuesha','seal')).toBe('guarded');
    expect(roomObjectPose('yuesha','tea')).toBe('warm');
    expect(roomObjectPose('brook','gauge')).toBe('guarded');
    expect(roomTopicPose('fern','moonwater')).toBe('guarded');
    expect(roomTopicPose('fern','plant')).toBe('warm');
  });
  it('preserves original Chinese punctuation when dividing automatically played lines',()=>{
    const original='“等一等。你已经知道了？那就听我讲完……”';
    const beats=dialogueBeats(original);
    expect(beats.length).toBeGreaterThan(1);
    expect(beats.join('')).toBe(original);
    expect(dialogueBeats('')).toEqual([]);
    expect(dialogueBeats('一句话')).toEqual(['一句话']);
    expect(dialogueBeatDuration('短')).toBeGreaterThanOrEqual(1800);
    expect(dialogueBeatDuration('长'.repeat(200))).toBeLessThanOrEqual(5200);
  });
  it('declares only valid future asset paths without pretending CG already ships',()=>{
    expect(Object.keys(ROOM_ART_MANIFEST)).toEqual(['yuesha','brook','fern','cinder']);
    for(const [id,art] of Object.entries(ROOM_ART_MANIFEST)){
      expect(art.id).toBe(id);
      expect(art.backgroundStatus).toBe('concept');
      expect(art.residentStatus).toBe('concept');
      expect(art.productionAssets.background).toContain('/'+id+'/background.webp');
      expect(art.productionAssets.residentFrames).toHaveLength(4);
      expect(art.objectLayer).toBe('interactive-hotspots');
    }
  });
});
