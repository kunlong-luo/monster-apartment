'use client';

import {useEffect,useState} from 'react';
import {createPortal} from 'react-dom';
import {MACHINES,WORKERS} from '../../../v2/src/workshop-engine';
import type {Craft,WorkerId,WorkshopState} from '../../../v2/src/workshop-engine';

const workers=['brook','fern','cinder'] as const;
const machines=['well','garden','kiln'] as const;
const glyphs:Record<Craft,string>={well:'◉',garden:'❀',kiln:'⬡'};

type Selection={worker:WorkerId|null;machine:Craft|null};
const readSelection=(root:HTMLElement):Selection=>({
  worker:(root.dataset.chosenWorker||null) as WorkerId|null,
  machine:(root.dataset.chosenMachine||null) as Craft|null,
});

/**
 * React/Tailwind toolbar for the Next-owned workshop. The buttons are
 * portaled into the same #actions/#catalog that the standalone Pixi scene
 * exposes. Native click bubbling is handled by the existing engine, so
 * engine actions, production results and the V2 save schema do not fork.
 */
export function WorkshopReactControls({root,world}:{
  root:HTMLElement|null;
  world:WorkshopState|null;
}){
  const [selection,setSelection]=useState<Selection>({worker:null,machine:null});
  useEffect(()=>{
    if(!root)return;
    const update=()=>setSelection(previous=>{
      const next=readSelection(root);
      return previous.worker===next.worker&&previous.machine===next.machine
        ?previous:next;
    });
    root.addEventListener('moonwork:controls-change',update);
    update();
    return ()=>root.removeEventListener('moonwork:controls-change',update);
  },[root]);

  const actions=root?.querySelector<HTMLElement>('#actions');
  const catalog=root?.querySelector<HTMLElement>('#catalog');
  if(!root||!world||!actions||!catalog)return null;
  return <>
    {createPortal(workers.map(id=>{
      const profile=WORKERS[id];
      const occupied=world.tiles.findIndex(tile=>tile?.worker===id);
      const selected=selection.worker===id;
      return <button key={id} type="button" data-worker={id}
        data-testid={'v2-worker-'+id} aria-pressed={selected}
        aria-label={'选择工匠 '+profile.zh}
        className={'worker group flex min-w-0 flex-col items-center justify-center gap-0.5 rounded-lg border border-gothic-brass/65 bg-gothic-panel/85 px-1.5 py-1 text-gothic-ivory transition-colors hover:border-gothic-glow focus-visible:outline-2 focus-visible:outline-gothic-glow motion-reduce:transition-none '+(selected?'active border-gothic-glow':'')}>
        <span className={'worker-miniature '+id} role="img" aria-label={profile.zh+'的绘制头像'}/>
        <strong className="text-[11px] leading-tight sm:text-xs">{profile.zh}</strong>
        <small className="max-w-full truncate text-[9px] text-gothic-muted">
          {occupied>=0?'工位 '+String(occupied+1).padStart(2,'0'):'待分配'}
        </small>
      </button>;
    }),actions)}
    {createPortal(machines.map(id=>{
      const info=MACHINES[id];
      const selected=selection.machine===id;
      return <button key={id} type="button" data-build={id}
        data-testid={'v2-build-'+id} aria-pressed={selected}
        aria-label={'建设 '+info.zh}
        disabled={world.coins<info.cost}
        className={'machine-card group flex min-w-0 flex-col items-center justify-center gap-0.5 rounded-lg border border-gothic-brass/65 bg-gothic-panel/85 px-1.5 py-1 text-gothic-ivory transition-colors hover:border-gothic-glow focus-visible:outline-2 focus-visible:outline-gothic-glow disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none '+(selected?'active border-gothic-glow':'')}>
        <span className={'machine-symbol '+id+' text-gothic-gold'} aria-hidden="true">{glyphs[id]}</span>
        <strong className="text-[11px] leading-tight sm:text-xs">{info.zh}</strong>
        <small className="tabular-nums text-[9px] text-gothic-muted">✦ {info.cost}</small>
      </button>;
    }),catalog)}
  </>;
}
