import {describe,expect,it} from 'vitest';
import {roomSceneReaction,yueshaRoomEasterEgg} from '../src/core/room-scene-reactions';

describe('layered private-room narrative reactions',()=>{
  it('responds only with presentation copy, not mutated save state',()=>{
    expect(roomSceneReaction('yuesha','seal')).toContain('半月');
    expect(roomSceneReaction('brook','gauge')).toContain('铜铃');
    expect(roomSceneReaction('fern','moonflower')).toContain('花瓣');
    expect(roomSceneReaction('cinder','blueprint')).toContain('安全');
  });
  it('keeps the easter egg locked until all three clues are observed',()=>{
    const observed=['seal','ledger'] as const;
    expect(yueshaRoomEasterEgg(observed,undefined)).toBeNull();
    expect(yueshaRoomEasterEgg([...observed,'tea'],undefined)).toContain('倒置的半月');
    expect(yueshaRoomEasterEgg([...observed,'tea'],'transparent')).toContain('真相');
    expect(yueshaRoomEasterEgg([...observed,'tea'],'careful')).toContain('证据');
  });
});
