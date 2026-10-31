import {describe,it,expect} from 'vitest';
import {siteAssetUrl} from '../src/lib/game/site-asset-url';

describe('GitHub Pages public asset URLs',()=>{
  it('prefixes public assets exactly once on Pages',()=>{
    expect(siteAssetUrl('/art/yuesha-avatar-v3.webp','/monster-apartment'))
      .toBe('/monster-apartment/art/yuesha-avatar-v3.webp');
    expect(siteAssetUrl('/monster-apartment/art/yuesha-avatar-v3.webp','/monster-apartment'))
      .toBe('/monster-apartment/art/yuesha-avatar-v3.webp');
  });
  it('prefixes native same-document summon hash URLs on GitHub Pages',()=>{
    expect(siteAssetUrl('/characters/#summon-screen','/monster-apartment'))
      .toBe('/monster-apartment/characters/#summon-screen');
    expect(siteAssetUrl('/characters/#summon-screen',''))
      .toBe('/characters/#summon-screen');
  });
  it('keeps normal development and external URLs unchanged',()=>{
    expect(siteAssetUrl('/art/yuesha-avatar-v3.webp','')).toBe('/art/yuesha-avatar-v3.webp');
    expect(siteAssetUrl('blob:https://localhost/abc','/monster-apartment')).toBe('blob:https://localhost/abc');
    expect(siteAssetUrl('https://cdn.test/face.webp','/monster-apartment')).toBe('https://cdn.test/face.webp');
  });
});
