import {describe,expect,it} from 'vitest';
import {ROOM_CONVERSATION_TOPICS,roomConversationTopics} from '../src/core/room-conversations';

describe('private-room replayable dialogue',()=>{
  it('has one immediately available topic per resident without revealing locked words',()=>{
    for(const id of ['yuesha','brook','fern','cinder'] as const){
      const topics=roomConversationTopics(id,[]);
      expect(topics).toHaveLength(3);
      expect(topics.filter(topic=>topic.unlocked).map(topic=>topic.id))
        .toEqual([ROOM_CONVERSATION_TOPICS[id][0].id]);
      expect(topics.filter(topic=>!topic.unlocked).every(topic=>topic.lockedHint.length>0)).toBe(true);
    }
  });
  it('unlocks only matching observations, regardless of their order',()=>{
    const records=[
      {id:'yuesha',items:['ledger','seal'],topic:'contract'},
      {id:'brook',items:['gauge','toolbox'],topic:'water'},
      {id:'fern',items:['moonflower','herbarium'],topic:'moonwater'},
      {id:'cinder',items:['blueprint','hammer'],topic:'safe'},
    ] as const;
    for(const record of records){
      expect(roomConversationTopics(record.id,[record.items[0]])
        .find(topic=>topic.id===record.topic)?.unlocked).toBe(false);
      expect(roomConversationTopics(record.id,record.items)
        .find(topic=>topic.id===record.topic)?.unlocked).toBe(true);
    }
  });
});
