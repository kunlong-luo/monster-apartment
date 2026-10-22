import { describe, expect, it } from 'vitest';
import { SPIRITS } from '../src/core/spirit-collection';
import { SPIRIT_ART } from '../src/core/spirit-art';

describe('Original spirit art registry', () => {
  it('gives all eighteen spirits unique silhouettes', () => {
    const ids = SPIRITS.map(spirit => spirit.id);
    expect(ids).toHaveLength(18);
    expect(Object.keys(SPIRIT_ART).sort()).toEqual([...ids].sort());
    expect(new Set(ids.map(id => SPIRIT_ART[id].body)).size).toBe(ids.length);
    expect(new Set(ids.map(id => SPIRIT_ART[id].mark)).size).toBe(ids.length);
  });
  it('keeps all palettes explicit, accessible to Phaser and valid SVG', () => {
    for (const spirit of SPIRITS) {
      const art = SPIRIT_ART[spirit.id];
      expect(art.body.startsWith('M')).toBe(true);
      expect(art.back.startsWith('M')).toBe(true);
      expect(art.mark.startsWith('M')).toBe(true);
      expect(art.body.length).toBeGreaterThan(45);
      expect(art.eyesY).toBeGreaterThan(40);
      expect(art.eyesY).toBeLessThan(90);
      for (const color of [art.primary, art.highlight, art.shadow]) {
        expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      }
    }
  });
  it('mythic and legendary have diverse identities, not palette swaps', () => {
    const mythics = SPIRITS.filter(spirit => spirit.quality === 'UR');
    const legends = SPIRITS.filter(spirit => spirit.quality === 'SSR');
    expect(mythics).toHaveLength(8);
    expect(legends).toHaveLength(4);
    expect(new Set([...mythics, ...legends].map(s => SPIRIT_ART[s.id].back)).size).toBe(12);
  });
});
