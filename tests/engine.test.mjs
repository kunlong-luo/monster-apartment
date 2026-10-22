import assert from 'node:assert/strict';
import test from 'node:test';
import { newGame, placeSpirit, removeSpirit, moveOrSwap, advanceDay, synergyDetails,
  adjacency, TARGET_COINS, preferenceDetails } from '../src/core/engine.ts';

test('six rooms begin empty with five nights', () => {
  const s = newGame();
  assert.equal(s.coins, 35);
  assert.equal(s.rooms.length, 6);
  assert.equal(s.day, 1);
});
test('an owned spirit is placed for free; duplicates are not allowed', () => {
  const base = newGame();
  const outcome = placeSpirit(base, 0, 'seedling');
  assert.equal(outcome.error, null);
  assert.equal(outcome.state.coins, 35);
  assert.equal(outcome.state.rooms[0], 'seedling');
  assert.ok(placeSpirit(outcome.state, 1, 'seedling').error);
  assert.equal(base.rooms[0], null);
});
test('move, swap and withdraw manage actual spirits', () => {
  let s = placeSpirit(newGame(), 0, 'pebble-crab').state;
  s = placeSpirit(s, 1, 'lantern-beetle').state;
  s = moveOrSwap(s, 0, 1).state;
  assert.equal(s.rooms[0], 'lantern-beetle');
  s = moveOrSwap(s, 1, 4).state;
  assert.equal(s.rooms[4], 'pebble-crab');
  assert.equal(removeSpirit(s, 4).state.rooms[4], null);
});
test('room traits and original faction synergy affect income', () => {
  const rooms = ['pebble-crab', 'mirror-koi', null, null, null, null];
  assert.equal(adjacency(rooms).length, 7);
  assert.equal(synergyDetails(rooms).coins, 4);
  assert.equal(preferenceDetails(rooms).matches, 1);
});
test('one spirit can finish five nights while empty rooms cannot', () => {
  assert.ok(advanceDay(newGame()).error);
  let s = placeSpirit(newGame(), 5, 'seedling').state;
  for (let i = 0; i < 5; i++) s = advanceDay(s).state;
  assert.equal(s.day, 5);
  assert.equal(s.history.length, 5);
  assert.equal(s.over, true);
  assert.ok(advanceDay(s).error);
  assert.equal(typeof TARGET_COINS, 'number');
});
test('invalid placement cannot change existing state', () => {
  const s = newGame();
  assert.equal(placeSpirit(s, 0, 'slime').state, s);
  assert.equal(placeSpirit(s, -1, 'seedling').state, s);
  assert.equal(JSON.stringify(s), JSON.stringify(newGame()));
});
