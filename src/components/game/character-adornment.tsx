'use client';
import {Footprints,Gem,Moon,Shield} from 'lucide-react';
import {FORGE_RECIPES,characterPotentialTier} from '@/core/character-collection';
import type {GearId} from '@/core/character-collection';
import type {CharacterId} from '@/core/character-life';
import {useCharacterCollection} from '@/lib/game/character-collection-store';

/** Uses the persisted loadout as the single source for portrait ornaments.
 * These are UI emblems, not claimed to be original character costume art. */
const icons:Record<GearId,typeof Gem>={
  'moon-pendant':Moon,'silver-ring':Gem,'warden-coat':Shield,'swift-boots':Footprints,
};
export function CharacterAdornment({id,compact=false}:{id:CharacterId;compact?:boolean}){
  const {status,collection}=useCharacterCollection();
  if(status!=='ok')return null;
  const equipped=Object.values(collection.equipped[id]??{}).filter((item):item is GearId=>Boolean(item));
  const tier=characterPotentialTier(id,collection);
  if(equipped.length===0&&tier===0)return null;
  const all=equipped.map(item=>FORGE_RECIPES.find(recipe=>recipe.id===item)?.name).filter(Boolean).join('、');
  return <span className={'pointer-events-none absolute bottom-1 right-1 z-[5] flex items-end gap-1 '+(compact?'scale-90 origin-bottom-right':'')}
    data-testid={'character-adornment-'+id} aria-label={'已获得契约 '+tier+' 阶'+(all?'；已装备'+all:'')}>
    {equipped.map(gearId=>{
      const Icon=icons[gearId];
      return <span key={gearId} title={FORGE_RECIPES.find(item=>item.id===gearId)?.name}
        data-testid={'adornment-'+id+'-'+gearId}
        className="flex size-8 items-center justify-center rounded-full border border-[#f2d3a7] bg-[#271729f0] text-[#ffe4b4] shadow-[0_2px_9px_#000a]">
        <Icon size={17} strokeWidth={1.7} aria-hidden="true"/>
      </span>;
    })}
    {tier>0&&<span data-testid={'adornment-tier-'+id}
      className={'flex size-8 items-center justify-center rounded-full border text-xs font-bold shadow-[0_2px_11px_#000a] '+(
        tier===5?'border-[#ff7380] bg-[#6f142f] text-[#ffe4e6]':tier>=4?'border-[#f2cf7e] bg-[#49311f] text-[#ffdf9d]':'border-[#d5ad86] bg-[#26192c] text-[#ffe1bf]')}>
      {tier===5?'☾':tier}
    </span>}
  </span>;
}
