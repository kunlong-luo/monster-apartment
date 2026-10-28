'use client';

import type {CSSProperties} from 'react';

/** Story objects are selected on the scene itself, not duplicated as dashboard actions. */
export type SceneHotspotItem<T extends string=string>={id:T;label:string};
const SPOTS=[
  {left:'9%',top:'35%'},
  {left:'29%',top:'68%'},
  {left:'49%',top:'24%'},
] as const;

export function RoomSceneHotspots<T extends string>({
  items,observed,selected,onInspect,characterName,
}:{
  items:readonly SceneHotspotItem<T>[];
  observed:readonly T[];
  selected:T|null;
  onInspect:(id:T)=>void;
  characterName:string;
}){
  return <div className="pointer-events-none absolute inset-0 z-[4]" aria-label={characterName+'的房间物件'}>
    {items.slice(0,SPOTS.length).map((item,index)=>{
      const known=observed.includes(item.id);
      const point=SPOTS[index];
      return <button type="button" key={item.id}
        aria-label={item.label}
        aria-pressed={selected===item.id}
        data-testid={'scene-object-'+item.id}
        style={{left:point.left,top:point.top} as CSSProperties}
        onClick={()=>onInspect(item.id)}
        className={'group pointer-events-auto absolute z-10 flex min-h-11 min-w-11 max-w-[min(52vw,190px)] -translate-y-1/2 items-center gap-2 rounded-full border px-2.5 py-1.5 shadow-[0_3px_16px_#0009] backdrop-blur-md transition-[background-color,border-color,box-shadow] duration-200 focus-visible:outline-2 focus-visible:outline-[#ffe3b2] motion-reduce:transition-none '+
          (selected===item.id
            ?'border-[#ffe0aa] bg-[#765540dd] text-[#fff0d3] shadow-[0_0_19px_#eac38f7a]'
            :known
              ?'border-[#d3ab719e] bg-[#2a1a27cc] text-[#f9d8a3] hover:border-[#ffe0aa]'
              :'border-[#d7af8091] bg-[#201521c9] text-[#f5e1cd] hover:border-[#ffe0aa] hover:bg-[#674556dd]')}
      >
        <span aria-hidden="true" className="flex size-6 shrink-0 items-center justify-center rounded-full border border-[#daba8f70] bg-[#3c2834d9] text-sm text-[#f5d3a7]">
          {known?'✦':'⌕'}
        </span>
        <span className="min-w-0 text-left text-[10px] leading-[1.3] sm:hidden sm:group-hover:block sm:group-focus-visible:block">
          {item.label}
        </span>
      </button>;
    })}
    <span className="pointer-events-none absolute bottom-2 left-3 rounded-full border border-[#c79b7258] bg-[#160f1ad5] px-2.5 py-1 text-[10px] text-[#f1c99f]">
      探索房间 · {observed.length}/{items.length}
    </span>
  </div>;
}
