import assert from 'node:assert/strict';
import test from 'node:test';
import { newGame, hire, moveOrSwap, advanceDay, synergyDetails, adjacency, TENANT_IDS, TARGET_COINS } from '../src/core/engine.js';

test('starts with six empty rooms, 35 coins and five days',()=>{const s=newGame();assert.equal(s.coins,35);assert.equal(s.rooms.length,6);assert.equal(s.day,1);});
test('hire charges price, forbids double booking and unaffordable tenant',()=>{let s=newGame();let x=hire(s,0,'slime');assert.equal(x.error,null);s=x.state;assert.equal(s.coins,29);assert.ok(hire(s,0,'golem').error);let zero={...s,coins:0};assert.ok(hire(zero,1,'golem').error);});
test('swap and move preserve tenant counts',()=>{let s=hire(newGame(),0,'slime').state;s=hire(s,1,'ember').state;let r=moveOrSwap(s,0,1);assert.equal(r.state.rooms[0],'ember');assert.equal(r.state.rooms[1],'slime');r=moveOrSwap(r.state,1,4);assert.equal(r.state.rooms[4],'slime');assert.equal(r.state.rooms[1],null);});
test('neighbor bonuses and conflicts calculate exactly',()=>{const rooms=['slime','ember','ghost','golem',null,null];let a=synergyDetails(rooms);assert.equal(a.coins,7);assert.equal(a.satisfaction,0);assert.equal(adjacency(rooms).length,7);});
test('cannot advance an empty building, and five days concludes the run',()=>{assert.ok(advanceDay(newGame()).error);let s=newGame();for(let i=0;i<4;i++)s=hire(s,i,TENANT_IDS[i]).state;for(let i=0;i<5;i++)s=advanceDay(s).state;assert.equal(s.over,true);assert.equal(s.day,5);assert.equal(s.history.length,5);assert.ok(['win','lose'].includes(s.outcome));assert.ok(advanceDay(s).error);assert.equal(typeof TARGET_COINS,'number');});
test('simulation does not mutate previous state',()=>{const s=newGame();const prev=JSON.stringify(s);hire(s,2,'ghost');assert.equal(JSON.stringify(s),prev);});
