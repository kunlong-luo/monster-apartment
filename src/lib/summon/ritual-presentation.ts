import type {GachaRarity,SummonableCharacter} from './gacha-engine';

/** Animation metadata only: no RNG, currency access, odds or persistence. */
export type RitualPhase='charge'|'seal'|'omen'|'flip'|'reveal';
export type ActiveRitualPhase=Exclude<RitualPhase,'reveal'>;
export const RITUAL_PHASES:readonly RitualPhase[]=['charge','seal','omen','flip','reveal'];
export const RITUAL_PHASE_DURATION:Record<ActiveRitualPhase,number>={
  charge:620,seal:780,omen:790,flip:1150,
};
export const RITUAL_RARITY_ORDER:readonly GachaRarity[]=['N','R','SR','SSR-Legend','SSR-Mythic'];
export const RITUAL_RARITY_SCENE:Record<GachaRarity,{title:string;subtitle:string;accent:string;tone:string}>={
  N:{title:'月影轻启',subtitle:'一份新契约正在回应',accent:'#bdc4d7',tone:'silver'},
  R:{title:'霜蓝共鸣',subtitle:'稀有之光穿透封印',accent:'#88d4f1',tone:'blue'},
  SR:{title:'暮紫回响',subtitle:'古老的魔力正在苏醒',accent:'#d5a5fc',tone:'violet'},
  'SSR-Legend':{title:'金色誓约',subtitle:'传说契约即将降临',accent:'#f8d39b',tone:'gold'},
  'SSR-Mythic':{title:'神话 · 月蚀',subtitle:'红月升起，命运为她停驻',accent:'#ff7a91',tone:'crimson'},
};
export function strongestSummonResult(characters:readonly Pick<SummonableCharacter,'rarity'>[]){
  const highest=characters.reduce<GachaRarity>((best,character)=>
    RITUAL_RARITY_ORDER.indexOf(character.rarity)>RITUAL_RARITY_ORDER.indexOf(best)
      ?character.rarity:best,'N');
  return {rarity:highest,scene:RITUAL_RARITY_SCENE[highest]};
}
export function nextRitualPhase(phase:RitualPhase):RitualPhase{
  return RITUAL_PHASES[Math.min(RITUAL_PHASES.length-1,RITUAL_PHASES.indexOf(phase)+1)];
}
