import {describe,expect,it} from 'vitest';
import {decideYuesha,inspectCharacterRoom,newCharacterLife} from '../src/core/character-life';
import {ROOM_INVESTIGATIONS,roomInvestigations,roomInvestigationConclusion} from '../src/core/room-investigation';
import type {RoomObjectId} from '../src/core/character-life';

describe('four-room narrative discoveries',()=>{
  it('starts with no revealed spoilers, 0/4 complete',()=>{
    const steps=roomInvestigations(newCharacterLife());
    expect(steps).toHaveLength(4);
    expect(steps.every(item=>!item.complete&&item.count===0&&item.total===2)).toBe(true);
    expect(roomInvestigationConclusion(newCharacterLife())).toBeNull();
  });
  it('requires meaningful paired observations and never changes economy state',()=>{
    let progress=newCharacterLife();
    for(const entry of ROOM_INVESTIGATIONS){
      progress=inspectCharacterRoom(progress,entry.characterId,entry.required[0] as RoomObjectId);
      expect(roomInvestigations(progress).find(item=>item.id===entry.id)?.complete).toBe(false);
      progress=inspectCharacterRoom(progress,entry.characterId,entry.required[1] as RoomObjectId);
    }
    expect(roomInvestigations(progress).every(item=>item.complete)).toBe(true);
    expect(roomInvestigationConclusion(progress)).toContain('四个人的房间');
    expect(Object.keys(progress)).toEqual(['version','visited','decisions','observations']);
    expect(roomInvestigations(progress)).toEqual(roomInvestigations(JSON.parse(JSON.stringify(progress))));
  });
  it('reflects the remembered Moonsha choice without changing it',()=>{
    let state=newCharacterLife();
    for(const entry of ROOM_INVESTIGATIONS){
      for(const required of entry.required)state=inspectCharacterRoom(state,entry.characterId,required);
    }
    const open=decideYuesha(state,'transparent');
    const careful=decideYuesha(state,'careful');
    expect(roomInvestigationConclusion(open)).toContain('公开');
    expect(roomInvestigationConclusion(careful)).toContain('可靠');
    expect(state.decisions['yuesha-first-visit']).toBeUndefined();
  });
});
