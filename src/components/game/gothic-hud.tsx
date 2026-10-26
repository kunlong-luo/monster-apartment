import Link from 'next/link';
import type {ReactNode} from 'react';

/**
 * Shared Tailwind CSS v4 primitives for the Gothic game HUD.
 * These replace bespoke, page-scoped button/dock styles; the canvas and
 * atmospheric layers remain the responsibility of PixiJS / scene CSS.
 */
export type GothicDestination={
  href:string;
  icon:string;
  label:string;
  description?:string;
};

const iconButtonStyle=[
  'grid size-9 shrink-0 place-items-center rounded-full border',
  'border-gothic-brass/65 bg-gothic-panel/85 text-gothic-ivory',
  'text-lg shadow-[inset_0_1px_0_#ffe4b52a,0_5px_18px_#0009]',
  'backdrop-blur-md transition-[transform,background-color,border-color] duration-200',
  'hover:border-gothic-glow hover:bg-gothic-wine/90 active:scale-95',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gothic-glow',
  'motion-reduce:transition-none'
].join(' ');

export function GothicIconButton({
  children,onClick,label,title,pressed,expanded
}:{
  children:ReactNode;
  onClick:()=>void;
  label:string;
  title?:string;
  pressed?:boolean;
  expanded?:boolean;
}){
  return <button type="button" className={iconButtonStyle}
    aria-label={label} title={title} aria-pressed={pressed}
    aria-expanded={expanded} onClick={onClick}>
    {children}
  </button>;
}

export function GothicResourcePill({
  symbol,amount,label,testId
}:{
  symbol:string;amount:string|number;label?:string;testId?:string;
}){
  return <span title={label} className={
    'flex h-8 min-w-0 items-center gap-1.5 rounded-full border border-gothic-brass/50 '+
    'bg-gothic-panel/80 px-2.5 text-xs text-gothic-ivory shadow-[inset_0_1px_#ffe5be2c,0_5px_15px_#0008] '+
    'backdrop-blur-lg sm:px-3'
  }>
    <span className="text-base leading-none text-gothic-gold" aria-hidden="true">{symbol}</span>
    <strong data-testid={testId} className="font-medium tabular-nums">{amount}</strong>
    {label&&<small className="hidden text-[10px] text-gothic-muted md:inline">{label}</small>}
  </span>;
}

export function GothicDock({
  items,label,className=''
}:{
  items:readonly GothicDestination[];
  label:string;
  className?:string;
}){
  return <nav aria-label={label} className={
    'absolute bottom-[max(8px,env(safe-area-inset-bottom))] left-1/2 z-[5] '+
    'flex w-max max-w-[98vw] -translate-x-1/2 items-end justify-center gap-1.5 '+
    'sm:gap-3 lg:gap-5 '+className
  }>
    {items.map(item=><Link key={item.href} href={item.href}
      aria-label={item.description?item.label+' · '+item.description:item.label}
      title={item.description}
      className={
        'group flex h-[61px] w-[57px] flex-col items-center justify-center gap-0.5 '+
        'rounded-md border border-gothic-brass/65 bg-[linear-gradient(145deg,#593b39ed,#190f19f2_75%)] '+
        'text-gothic-ivory shadow-[inset_0_1px_#ffdbac30,0_4px_18px_#000b] '+
        'backdrop-blur-sm transition-transform duration-200 '+
        'hover:-translate-y-1 hover:border-gothic-glow '+
        'focus-visible:-translate-y-1 focus-visible:outline-2 focus-visible:outline-gothic-glow '+
        'motion-reduce:transition-none sm:h-[68px] sm:w-[73px] md:w-[82px]'
      }>
      <span aria-hidden="true"
        className="text-[25px] leading-none text-gothic-gold drop-shadow-[0_1px_5px_#000] group-hover:text-gothic-glow sm:text-[29px]">{item.icon}</span>
      <span className="text-[11px] font-medium tracking-wide sm:text-[13px]">{item.label}</span>
    </Link>)}
  </nav>;
}
