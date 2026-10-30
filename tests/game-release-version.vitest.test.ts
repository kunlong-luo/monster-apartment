import {readFileSync} from 'node:fs';
import {describe,expect,it} from 'vitest';
import {GAME_UI_RELEASE} from '../src/core/game-release';
import {isNewerGameRelease} from '../src/lib/game/release-version';

describe('live GitHub Pages release visibility',()=>{
  it('the exported manifest matches the UI release embedded in the client',()=>{
    const data=JSON.parse(readFileSync(new URL('../public/release.json',import.meta.url),'utf8'));
    expect(data.release).toBe(GAME_UI_RELEASE);
  });
  it('only a strictly newer numeric release should offer refresh',()=>{
    expect(isNewerGameRelease('V3.64','V3.63')).toBe(true);
    expect(isNewerGameRelease('V4.0','V3.63')).toBe(true);
    expect(isNewerGameRelease('V3.100','V3.99')).toBe(true);
    expect(isNewerGameRelease('V3.63','V3.63')).toBe(false);
    expect(isNewerGameRelease('V3.62','V3.63')).toBe(false);
    expect(isNewerGameRelease('not-a-release','V3.63')).toBe(false);
    expect(isNewerGameRelease('V3.64','invalid')).toBe(false);
  });
});
