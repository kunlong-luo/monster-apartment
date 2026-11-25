import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {GACHA_CHARACTERS,GACHA_POOLS} from '../src/lib/summon/gacha-engine';
import {roomScenicArt} from '../src/core/room-scenic-art';
import {siteAssetUrl} from '../src/lib/game/site-asset-url';

describe('GitHub Pages public asset URLs',()=>{
  it('prefixes public assets exactly once on Pages',()=>{
    expect(siteAssetUrl('/art/characters/yuesha/yuesha-avatar-v3.webp','/monster-apartment'))
      .toBe('/monster-apartment/art/characters/yuesha/yuesha-avatar-v3.webp');
    expect(siteAssetUrl('/monster-apartment/art/characters/yuesha/yuesha-avatar-v3.webp','/monster-apartment'))
      .toBe('/monster-apartment/art/characters/yuesha/yuesha-avatar-v3.webp');
  });
  it('prefixes native same-document summon hash URLs on GitHub Pages',()=>{
    expect(siteAssetUrl('/characters/#summon-screen','/monster-apartment'))
      .toBe('/monster-apartment/characters/#summon-screen');
    expect(siteAssetUrl('/characters/#summon-screen',''))
      .toBe('/characters/#summon-screen');
  });
  it('keeps normal development and external URLs unchanged',()=>{
    expect(siteAssetUrl('/art/characters/yuesha/yuesha-avatar-v3.webp','')).toBe('/art/characters/yuesha/yuesha-avatar-v3.webp');
    expect(siteAssetUrl('blob:https://localhost/abc','/monster-apartment')).toBe('blob:https://localhost/abc');
    expect(siteAssetUrl('https://cdn.test/face.webp','/monster-apartment')).toBe('https://cdn.test/face.webp');
  });
});

// Exercise the real dynamic catalogs, not just invented URL strings.
describe('runtime public art catalog resolves to tracked WebPs',()=>{
  const base='/monster-apartment';
  function assertWebp(path:string){
    expect(path).toMatch(/^\/art\/[a-z0-9/.-]+\.webp$/);
    const bytes=readFileSync('public'+path);
    expect(bytes.toString('ascii',0,4)).toBe('RIFF');
    expect(bytes.toString('ascii',8,12)).toBe('WEBP');
    const url=siteAssetUrl(path,base);
    expect(url).toBe(base+path);
    expect(siteAssetUrl(url,base+'/')).toBe(url);
    expect(siteAssetUrl(path,base+'/')).toBe(url);
    expect(siteAssetUrl(path,'')).toBe(path);
  }
  it('checks every summon card and pool avatar against real files',()=>{
    expect(GACHA_CHARACTERS).toHaveLength(5);
    expect(GACHA_POOLS).toHaveLength(5);
    for(const entry of [...GACHA_CHARACTERS,...GACHA_POOLS])assertWebp(entry.avatar);
  });
  it('checks all eight room scenic URLs without relying on absent production slots',()=>{
    for(const id of ['yuesha','brook','fern','cinder'] as const){
      const scenic=roomScenicArt(id);
      for(const kind of ['background','standing'] as const){
        const path='/art/rooms/'+id+'/scenic/'+kind+'.webp';
        expect(scenic[kind]).toBe(siteAssetUrl(path));
        assertWebp(path);
      }
    }
  });
  it('does not rewrite protocol-relative or data URLs',()=>{
    expect(siteAssetUrl('//cdn.test/face.webp',base)).toBe('//cdn.test/face.webp');
    expect(siteAssetUrl('data:image/webp;base64,AA==',base)).toBe('data:image/webp;base64,AA==');
  });
});
