import { DAYS_TO_OPEN, TICKS_PER_DAY } from '@/core/cozy-engine';

export type CozyWorldLight = 'dawn'|'day'|'dusk'|'night';
export type CozyWorldWeather = 'clear'|'rain';

/** Pure visual direction: never modifies economic outcomes or stored saves. */
export function cozyWorldLight(tick:number):CozyWorldLight{
  const slice=Math.max(0,Math.trunc(tick))%TICKS_PER_DAY;
  return slice<3?'dawn':slice<7?'day':slice<10?'dusk':'night';
}

export function cozyWorldWeather(tick:number):CozyWorldWeather{
  const day=Math.min(DAYS_TO_OPEN,Math.floor(Math.max(0,tick)/TICKS_PER_DAY)+1);
  return day===3||day===6?'rain':'clear';
}
