import Link from 'next/link';
import {useEffect,useRef} from 'react';
import type {ReactNode} from 'react';
import {motion,useReducedMotion} from 'motion/react';
import {useGothicMotion} from '@/lib/game/gothic-motion';

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
  ariaLabel?:string;
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
  items,label,className='',activeHref,testId,compact=false
}:{
  items:readonly GothicDestination[];
  label:string;
  className?:string;
  activeHref?:string;
  testId?:string;
  /** Smaller jewel-like entry points for a scene-led lobby. */
  compact?:boolean;
}){
  return <nav data-testid={testId} aria-label={label} className={
    'absolute bottom-[max(8px,env(safe-area-inset-bottom))] left-1/2 z-[5] '+
    'flex w-max max-w-[98vw] -translate-x-1/2 items-end justify-center gap-1.5 '+
    (compact?'sm:gap-2 lg:gap-3 ':'sm:gap-3 lg:gap-5 ')+className
  }>
    {items.map(item=><Link key={item.href} href={item.href}
      aria-label={item.ariaLabel??(item.description?item.label+' · '+item.description:item.label)}
      aria-current={activeHref===item.href?'page':undefined}
      title={item.description}
      className={
        'group relative flex flex-col items-center justify-center gap-0.5 '+
        'text-gothic-ivory backdrop-blur-[3px] '+
        'transition-[transform,border-color,box-shadow] duration-200 '+
        'hover:-translate-y-0.5 hover:border-gothic-glow hover:shadow-[0_0_22px_#e0ad7547] '+
        'active:translate-y-0 active:scale-[.98] '+
        'focus-visible:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-gothic-glow '+
        'motion-reduce:transform-none motion-reduce:transition-none '+
        (compact
          ?'h-[52px] w-[52px] rounded-[10px] border border-gothic-brass/55 '+
           'bg-[linear-gradient(155deg,#533b43cf,#110c18ea_80%)] '+
           'shadow-[inset_0_1px_#ffddb534,inset_0_0_0_1px_#100b15ad,0_6px_17px_#0008] '+
           'sm:h-[60px] sm:w-[62px] '
          :'h-[61px] w-[57px] rounded-md border border-gothic-brass/65 '+
           'bg-[linear-gradient(145deg,#593b39ed,#190f19f2_75%)] '+
           'shadow-[inset_0_1px_#ffdbac30,0_4px_18px_#000b] '+
           'sm:h-[68px] sm:w-[73px] md:w-[82px] ')+
        (activeHref===item.href?'border-gothic-glow bg-gothic-wine/85 text-gothic-glow -translate-y-1':'')
      }>
      <span aria-hidden="true"
        className={(compact?'text-[22px] sm:text-[25px] ':'text-[25px] sm:text-[29px] ')+
          'leading-none text-gothic-gold drop-shadow-[0_1px_5px_#000] group-hover:text-gothic-glow'}>{item.icon}</span>
      <span className={(compact?'text-[10px] sm:text-[11px] ':'text-[11px] sm:text-[13px] ')+
        'font-medium tracking-[.08em]'}>{item.label}</span>
    </Link>)}
  </nav>;
}

/** Compact contextual action used inside the room drawer, never a permanent tile. */
export function GothicActionButton({
  rune,label,detail,onClick,disabled,testId,pressed
}:{
  rune:string;
  label:string;
  detail:string;
  onClick:()=>void;
  disabled?:boolean;
  testId?:string;
  pressed?:boolean;
}){
  return <button type="button" data-testid={testId} disabled={disabled}
    aria-pressed={pressed} onClick={onClick}
    className={
      'flex min-h-[60px] min-w-0 flex-col items-start gap-1 rounded-md border '+
      'border-gothic-brass/70 bg-[linear-gradient(135deg,#432a31dc,#1a111cdd)] px-2.5 py-2 text-left '+
      'text-gothic-ivory shadow-[inset_0_1px_#ffdbac32,0_3px_12px_#0004] '+
      'transition-[border-color,background-color,transform] duration-150 '+
      'hover:border-gothic-glow hover:bg-gothic-wine/80 active:scale-[.98] '+
      'disabled:cursor-not-allowed disabled:opacity-45 disabled:active:scale-100 '+
      'focus-visible:outline-2 focus-visible:outline-gothic-glow '+
      'motion-reduce:transition-none sm:min-h-[68px] sm:px-3'
    }>
    <span aria-hidden="true" className="text-[22px] leading-none text-gothic-gold">{rune}</span>
    <strong className="text-xs font-medium leading-snug">{label}</strong>
    <small className="line-clamp-2 text-[10px] leading-snug text-gothic-muted">{detail}</small>
  </button>;
}

/**
 * Accessible, reusable in-game modal. Focus starts inside the panel and
 * returns to the invoking button on close. Uses Tailwind rather than a
 * separate CSS panel implementation.
 */
export function GothicModal({
  title,onClose,children,wide=false,closeLabel="关闭面板"
}:{
  title:string;
  onClose:()=>void;
  children:ReactNode;
  wide?:boolean;
  closeLabel?:string;
}){
  const dialog=useRef<HTMLElement>(null);
  const systemReduced=useReducedMotion();
  const {reduced:gameReduced}=useGothicMotion();
  const reduced=Boolean(systemReduced||gameReduced);
  const fade={duration:reduced ? 0.01 : 0.2};
  useEffect(()=>{
    const previous=document.activeElement;
    dialog.current?.focus();
    return ()=>{if(previous instanceof HTMLElement && previous.isConnected)previous.focus();};
  },[]);
  return <motion.div
    initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
    transition={fade}
    className="absolute inset-0 z-[30] grid place-items-center overflow-y-auto bg-gothic-night/80 p-3 backdrop-blur-[7px] sm:p-5"
    onMouseDown={event=>{if(event.target===event.currentTarget)onClose();}}>
    <motion.section ref={dialog} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title}
      initial={reduced?false:{opacity:0,y:12,scale:.984}}
      animate={{opacity:1,y:0,scale:1}}
      exit={reduced?{opacity:0}:{opacity:0,y:7,scale:.987}}
      transition={reduced?{duration:.01}:{type:'tween',duration:.24,ease:[.2,.78,.28,1]}}
      onKeyDown={event=>{
        if(event.key==='Escape'){event.stopPropagation();onClose();}
        if(event.key==='Tab'){
          const nodes=Array.from(event.currentTarget.querySelectorAll<HTMLElement>(
            'a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])'
          ));
          if(nodes.length===0)return;
          const first=nodes[0],last=nodes[nodes.length-1];
          if(event.shiftKey && (document.activeElement===first || document.activeElement===dialog.current)){
            event.preventDefault();last.focus();
          }else if(!event.shiftKey && document.activeElement===last){
            event.preventDefault();first.focus();
          }
        }
      }}
      className={
        'relative flex max-h-[88dvh] w-full gap-3 overflow-y-auto rounded-xl border border-gothic-brass/80 '+
        'bg-[radial-gradient(ellipse_at_15%_0%,#69374647,transparent_55%),linear-gradient(140deg,#291b28,#100c15_85%)] '+
        'p-5 text-gothic-ivory shadow-[0_26px_75px_#000e,inset_0_0_0_3px_#f1d09b14] '+
        'outline-none sm:gap-6 sm:p-9 '+
        (wide?'max-w-[690px]':'max-w-[610px]')
      }>
      <button type="button" className={
        'absolute right-2.5 top-2.5 z-10 grid size-9 place-items-center rounded-full border '+
        'border-gothic-brass/50 bg-gothic-panel/80 text-2xl leading-none text-gothic-ivory '+
        'hover:border-gothic-glow focus-visible:outline-2 focus-visible:outline-gothic-glow'
      } onClick={onClose} aria-label={closeLabel}>×</button>
      {children}
    </motion.section>
  </motion.div>;
}

/** A shared text CTA for book, dialogue, and commission panels. */
export function GothicPanelLink({href,children,onClick}:{
  href:string;children:ReactNode;onClick?:()=>void;
}){
  return <Link href={href} onClick={onClick}
    className="mt-3 inline-flex min-h-10 items-center rounded-md border border-gothic-brass/70
      bg-gothic-panel/90 px-3 py-2 text-xs text-gothic-ivory
      transition-colors hover:border-gothic-glow hover:bg-gothic-wine/80
      focus-visible:outline-2 focus-visible:outline-gothic-glow">
    {children}
  </Link>;
}
