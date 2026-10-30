import {describe,expect,it} from 'vitest';
import {retryAssetUrl} from '../src/components/game/reliable-image';

describe('static image first-load retry',()=>{
  it('does not rewrite a successful original URL',()=>{
    expect(retryAssetUrl('/monster-apartment/_next/static/media/face.webp',0))
      .toBe('/monster-apartment/_next/static/media/face.webp');
  });
  it('retries without destroying the Pages subpath or original query/hash',()=>{
    expect(retryAssetUrl('/monster-apartment/art/room.webp',1))
      .toBe('/monster-apartment/art/room.webp?asset_retry=1');
    expect(retryAssetUrl('/monster-apartment/art/room.webp?v=2#portrait',1))
      .toBe('/monster-apartment/art/room.webp?v=2&asset_retry=1#portrait');
  });
  it('never corrupts local art-review object URLs',()=>{
    expect(retryAssetUrl('blob:https://example.com/abc',1)).toBe('blob:https://example.com/abc');
  });
});
