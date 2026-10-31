import type {GachaRarity} from './gacha-engine';

/** Presentation durations only. Do not import the roll engine or mutate a save. */
export const TEN_PULL_FIRST_REVEAL_MS=380;
export const TEN_PULL_HOLD_MS:Readonly<Record<GachaRarity,number>>={
  N:460,
  R:540,
  SR:790,
  'SSR-Legend':1700,
  'SSR-Mythic':2450,
};
export function getTenPullHoldMs(rarity:GachaRarity):number{
  return TEN_PULL_HOLD_MS[rarity];
}
export function getNextUnrevealedIndex(count:number,revealed:readonly number[]):number{
  for(let i=0;i<count;i++)if(!revealed.includes(i))return i;
  return -1;
}
export function isFeaturedTenPullRarity(rarity:GachaRarity):boolean{
  return rarity==='SSR-Legend'||rarity==='SSR-Mythic';
}
