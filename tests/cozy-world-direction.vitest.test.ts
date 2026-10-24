import {describe,expect,it} from 'vitest';
import {cozyWorldLight,cozyWorldWeather} from '../src/game/cozy-world-direction';

describe('cozy world art direction is deterministic and never edits the save',()=>{
  it('turns clock ticks into a four-part visual day',()=>{
    expect(cozyWorldLight(0)).toBe('dawn');
    expect(cozyWorldLight(3)).toBe('day');
    expect(cozyWorldLight(7)).toBe('dusk');
    expect(cozyWorldLight(10)).toBe('night');
    expect(cozyWorldLight(12)).toBe('dawn');
  });
  it('shows forecast rain on preset days without randomness',()=>{
    expect(cozyWorldWeather(0)).toBe('clear');
    expect(cozyWorldWeather(24)).toBe('rain');
    expect(cozyWorldWeather(35)).toBe('rain');
    expect(cozyWorldWeather(36)).toBe('clear');
    expect(cozyWorldWeather(60)).toBe('rain');
    expect(cozyWorldWeather(72)).toBe('clear');
  });
});
