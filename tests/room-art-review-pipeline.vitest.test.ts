import {describe,expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
import {buildReviewHtml,coverProjection,webpDimensions} from '../scripts/prepare-room-background.mjs';

describe('V3.12 background candidate intake never bypasses visual approval',()=>{
  it('reads real WebP header and rejects arbitrary content',()=>{
    const webp=readFileSync('public/art/yuesha-bust-v3.webp');
    const dimensions=webpDimensions(webp);
    expect(dimensions.width).toBeGreaterThan(100);
    expect(dimensions.height).toBeGreaterThan(100);
    expect(()=>webpDimensions(Buffer.from('not-an-image'))).toThrow();
  });
  it('projects all candidate markers without rewriting concept coordinates',()=>{
    expect(coverProjection([.77,.815],390,315).visible).toBe(true);
    expect(coverProjection([.77,.815],320,315).visible).toBe(false);
  });
  it('generates a three-screen visual review without approving the image',()=>{
    const html=buildReviewHtml({room:'yuesha',anchors:{seal:[.6,.815],tea:[.535,.72],ledger:[.77,.815]},
      sourceWidth:2560,sourceHeight:1440});
    expect(html).toContain('1200×675');
    expect(html).toContain('390×315');
    expect(html).toContain('320×315');
    expect(html).toContain('未批准');
    expect(html).toContain('offscreen');
  });
});
