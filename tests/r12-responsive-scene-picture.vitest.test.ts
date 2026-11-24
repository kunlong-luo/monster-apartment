import {describe,expect,it} from 'vitest';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {R12ApprovedScenePicture} from '../src/components/game/r12-approved-scene-picture';

const desktop='/monster-apartment/art/world-scenes/r12/apartment-desktop.webp';
const mobile='/monster-apartment/art/world-scenes/r12/apartment-mobile.webp';
const render=(kind:'backdrop'|'hero')=>renderToStaticMarkup(
  createElement(R12ApprovedScenePicture,{desktop,mobile,kind,alt:'独立场景'}),
);

describe('R12.31 approved PC/mobile scene loading',()=>{
  for(const kind of ['backdrop','hero'] as const){
    it(kind+' SSR emits only one image with a native responsive mobile source',()=>{
      const html=render(kind);
      expect(html.match(/<img\b/g)).toHaveLength(1);
      expect(html.match(/<source\b/g)).toHaveLength(1);
      expect(html).toContain('data-r12-responsive-art="'+kind+'"');
      expect(html).toContain('media="(max-width:700px)"');
      expect(html).toContain('srcSet="'+mobile+'"');
      expect(html).toContain('src="'+desktop+'"');
      expect(html).not.toContain('loading="eager"');
      // The user agent chooses <source> before downloading; we must not
      // render hidden desktop/mobile <img> twins that still fetch both 4K art.
    });
  }
});
