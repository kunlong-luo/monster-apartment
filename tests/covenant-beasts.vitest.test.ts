import {describe,it,expect} from 'vitest';
import {COVENANT_BEASTS} from '../src/lib/summon/covenant-beasts';
import {CHARACTER_CARDS} from '../src/core/character-collection';

describe('adult heroine / distinct beast contract design',()=>{
  it('has four distinct beast shapes, materials and character names',()=>{
    const beasts=Object.values(COVENANT_BEASTS);
    expect(beasts).toHaveLength(4);
    for(const property of ['id','name','silhouette','anatomy','palette'] as const)
      expect(new Set(beasts.map(beast=>beast[property])).size).toBe(4);
  });
  it('retains one beast for each of four story characters across five actual cards',()=>{
    expect(CHARACTER_CARDS).toHaveLength(5);
    for(const card of CHARACTER_CARDS)expect(COVENANT_BEASTS[card.character]).toBeDefined();
    expect(CHARACTER_CARDS.filter(card=>card.character==='yuesha')).toHaveLength(2);
  });
});
