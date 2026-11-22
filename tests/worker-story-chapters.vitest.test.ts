import {describe,it,expect} from 'vitest';
import {
  CHARACTER_ROOM_OBJECTS,WORKER_STORY_CHAPTERS,
  decideWorker,inspectCharacterRoom,newCharacterLife,recordWorkerStoryChapter,
  validCharacterLife,visitCharacter,workerStoryProgress,workerStoryChapterText,
} from '../src/core/character-life';
import {decodeCharacterLife} from '../src/lib/game/character-life-store';
import {newWorkshop} from '../v2/src/workshop-engine';

function readyForFirst(){
  let life=visitCharacter(newCharacterLife(),'brook');
  life=decideWorker(life,'brook','practice');
  for(const id of CHARACTER_ROOM_OBJECTS.brook.slice(0,2))
    life=inspectCharacterRoom(life,'brook',id);
  return life;
}

describe('workshop-to-room character story chapters',()=>{
  it('keeps first chapter locked without an actual delivered workshop order',()=>{
    const life=readyForFirst();
    expect(workerStoryProgress(life,'brook',newWorkshop().completed)).toMatchObject({
      current:0,next:1,ready:false,
    });
    expect(recordWorkerStoryChapter(life,'brook',0)).toBe(life);
    expect(life.workerChapters).toBeUndefined();
  });
  it('requires first conversation and two correct room clues, not just any visit',()=>{
    let life=visitCharacter(newCharacterLife(),'fern');
    expect(recordWorkerStoryChapter(life,'fern',99)).toBe(life);
    life=decideWorker(life,'fern','care');
    expect(recordWorkerStoryChapter(life,'fern',99)).toBe(life);
    life=inspectCharacterRoom(life,'fern','watermap');
    life=inspectCharacterRoom(life,'fern','herbarium');
    expect(recordWorkerStoryChapter(life,'fern',99)).toBe(life);
    life=inspectCharacterRoom(life,'fern','moonflower');
    expect(workerStoryProgress(life,'fern',1).ready).toBe(true);
  });
  it('stores two earned chapters once, and unlocks the second only after three orders and all clues',()=>{
    const original=readyForFirst();
    const raw=JSON.stringify(original);
    const first=recordWorkerStoryChapter(original,'brook',1);
    expect(original.workerChapters).toBeUndefined();
    expect(JSON.stringify(original)).toBe(raw);
    expect(first.workerChapters).toEqual({brook:1});
    expect(recordWorkerStoryChapter(first,'brook',1)).toBe(first);
    expect(recordWorkerStoryChapter(first,'brook',99)).toBe(first);
    const allClues=inspectCharacterRoom(first,'brook','nightbell');
    expect(recordWorkerStoryChapter(allClues,'brook',2)).toBe(allClues);
    const finished=recordWorkerStoryChapter(allClues,'brook',3);
    expect(finished.workerChapters).toEqual({brook:2});
    expect(recordWorkerStoryChapter(finished,'brook',100)).toBe(finished);
    expect(workerStoryProgress(finished,'brook',5).next).toBeNull();
    expect(validCharacterLife(finished)).toBe(true);
    expect(decodeCharacterLife(JSON.stringify(finished)).status).toBe('ok');
    expect(Object.keys(finished)).toEqual(['version','visited','decisions','workerDecisions','observations','workerChapters']);
  });
  it('separates character histories and preserves the original one-time choice',()=>{
    const life=recordWorkerStoryChapter(readyForFirst(),'brook',1);
    expect(workerStoryProgress(life,'cinder',5).current).toBe(0);
    expect(workerStoryChapterText(life,'brook',1)).toContain('压力表');
    const care=decideWorker(visitCharacter(newCharacterLife(),'brook'),'brook','care');
    expect(workerStoryChapterText(care,'brook',1)).toContain('放下扳手');
    expect(WORKER_STORY_CHAPTERS.fern).toHaveLength(2);
    expect(WORKER_STORY_CHAPTERS.cinder).toHaveLength(2);
  });
  it('rejects broken optional chapter fields and preserves pre-extension lore saves',()=>{
    const old=newCharacterLife();
    expect(validCharacterLife(old)).toBe(true);
    expect(decodeCharacterLife(JSON.stringify(old)).status).toBe('ok');
    const broken=[
      {...old,workerChapters:{brook:0}},
      {...old,workerChapters:{brook:3}},
      {...old,workerChapters:{stranger:1}},
      {...old,workerChapters:{yuesha:2}},
      {...old,workerChapters:{brook:'1'}},
      {...old,workerChapters:[]},
      {...old,workerChapters:null},
    ];
    for(const invalid of broken){
      expect(validCharacterLife(invalid)).toBe(false);
      expect(decodeCharacterLife(JSON.stringify(invalid)).status).toBe('corrupt');
    }
  });
});
