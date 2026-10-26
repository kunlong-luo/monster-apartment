import {describe,it,expect} from 'vitest';
import {workshopAssetRoot} from '../src/lib/moonwork/asset-root';

describe('Pixi asset directory survives Next static route normalization',()=>{
  it('keeps the exact GitHub Pages project subpath',()=>{
    for(const url of [
      'https://kunlong-luo.github.io/monster-apartment/workshop/',
      'https://kunlong-luo.github.io/monster-apartment/workshop',
      'https://kunlong-luo.github.io/monster-apartment/workshop?worker=fern',
      'https://kunlong-luo.github.io/monster-apartment/workshop/?worker=brook#canvas',
    ])expect(workshopAssetRoot(url)).toBe(
      'https://kunlong-luo.github.io/monster-apartment/workshop/');
  });
  it('keeps local Next + standalone V2 dev paths working',()=>{
    expect(workshopAssetRoot('http://127.0.0.1:3000/workshop?worker=cinder'))
      .toBe('http://127.0.0.1:3901/');
    expect(workshopAssetRoot('http://localhost:3000/workshop/'))
      .toBe('http://127.0.0.1:3901/');
    expect(workshopAssetRoot('http://127.0.0.1:3901/'))
      .toBe('http://127.0.0.1:3901/');
  });
  it('does not accept query or fragment as part of asset directory',()=>{
    expect(workshopAssetRoot('https://games.example.com/workshop/?x=2#thing'))
      .toBe('https://games.example.com/workshop/');
  });
});
