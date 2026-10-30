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
import {
  House,
  Castle,
  Anvil,
  BookOpen,
  ScrollText,
  Map,
  Archive,
  Coins,
  Gem,
  Moon,
  Heart,
  UsersRound,
} from 'lucide-react';

export type GothicDestination={
  href:string;
  icon:string|ReactNode;
  label:string;
  description?:string;
  ariaLabel?:string;
};

function getCanonicalDockIcon(href: string, fallback?: ReactNode) {
  if (href === '/' || href === '') return <House className="size-4 sm:size-[22px]" strokeWidth={1.7}/>;
  if (href.includes('apartment')) return <Castle className="size-4 sm:size-[22px]" strokeWidth={1.7}/>;
  if (href.includes('workshop')) return <Anvil className="size-4 sm:size-[22px]" strokeWidth={1.7}/>;
  if (href.includes('characters')) return <BookOpen className="size-4 sm:size-[22px]" strokeWidth={1.7}/>;
  if (href.includes('orders')) return <ScrollText className="size-4 sm:size-[22px]" strokeWidth={1.7}/>;
  if (href.includes('town')) return <Map className="size-4 sm:size-[22px]" strokeWidth={1.7}/>;
  if (href.includes('warehouse')) return <Archive className="size-4 sm:size-[22px]" strokeWidth={1.7}/>;
  return typeof fallback === 'string' ? <span>{fallback}</span> : fallback;
}

const iconButtonStyle=[
  'gothic-icon-button grid size-9 shrink-0 place-items-center rounded-full border',
  'border-gothic-brass/65 bg-gothic-panel/85 text-gothic-ivory',
  'text-lg shadow-[inset_0_1px_0_#ffe4b52a,0_5px_18px_#0009]',
  'backdrop-blur-md transition-[transform,background-color,border-color] duration-200',
  'hover:border-gothic-glow hover:bg-gothic-wine/90 active:scale-95',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gothic-glow',
  'motion-reduce:transition-none'
].join(' ');

export function GothicTooltip({
  text,
  children,
  position = 'top',
}: {
  text?: string;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}) {
  if (!text) return <>{children}</>;

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div className="group/tooltip relative inline-flex">
      {children}
      <div
        role="tooltip"
        className={`pointer-events-none absolute ${positionClasses[position]} z-50 hidden whitespace-nowrap rounded-lg border border-gothic-brass/70 bg-[#180d1a]/95 px-2.5 py-1 text-[11px] font-medium text-gothic-glow shadow-[0_4px_20px_rgba(0,0,0,0.9)] backdrop-blur-md group-hover/tooltip:block group-focus-within/tooltip:block motion-reduce:transition-none`}
      >
        <span className="mr-1 text-gothic-gold" aria-hidden="true">✦</span>
        {text}
      </div>
    </div>
  );
}

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
  const hint = title || label;
  return (
    <button
      type="button"
      className={iconButtonStyle}
      aria-label={label}
      data-tooltip={hint}
      aria-pressed={pressed}
      aria-expanded={expanded}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function GothicResourcePill({
  symbol,amount,label,testId
}:{
  symbol:string;amount:string|number;label?:string;testId?:string;
}){
  // A single semantic mapping for all seven HUDs; avoid fallback font glyphs
  // on desktop when labels legitimately differ between apartment and workshop.
  const ResourceIcon=label==='星币'?Coins
    :label==='晶核'?Gem
    :label?.includes('天')||label==='生产日'?Moon
    :label==='幸福度'?Heart
    :label==='入住'?UsersRound:null;
  return (
    <span
      data-tooltip={label}
      className={
        'flex h-8 min-w-0 shrink-0 items-center gap-1 rounded-full border border-gothic-brass/50 '+
        'bg-gothic-panel/80 px-2.5 text-xs text-gothic-ivory shadow-[inset_0_1px_#ffe5be2c,0_5px_15px_#0008] '+
        'whitespace-nowrap backdrop-blur-lg sm:gap-1.5 sm:px-3'
      }
    >
      {ResourceIcon ? <ResourceIcon aria-hidden="true" size={15} strokeWidth={1.7} className="shrink-0 text-gothic-gold"/> : <span className="text-base leading-none text-gothic-gold" aria-hidden="true">{symbol}</span>}
      <strong data-testid={testId} className="font-medium tabular-nums">{amount}</strong>
      {label&&<small className="hidden text-[10px] text-gothic-muted md:inline">{label}</small>}
    </span>
  );
}

export function GothicDock({
  items,label,className='',activeHref,testId
}:{
  items:readonly GothicDestination[];
  label:string;
  className?:string;
  activeHref?:string;
  testId?:string;
  compact?:boolean;
}){
  return <nav data-testid={testId} aria-label={label} className={
    'gothic-dock-bar absolute bottom-[max(8px,env(safe-area-inset-bottom))] left-1/2 z-[20] '+
    'flex w-[calc(100vw-16px)] max-w-[1400px] -translate-x-1/2 items-center justify-between gap-1 '+
    'rounded-2xl border border-gothic-brass/55 bg-[linear-gradient(180deg,#1c101de8,#0d0813f5)] '+
    'p-1.5 shadow-[0_12px_36px_#000c,inset_0_1px_#ffe0a228] backdrop-blur-xl sm:p-2 '+className
  }>
    {items.map(item => {
      const isActive = activeHref === item.href;
      return (
        <Link
          key={item.href}
          href={item.href}
          data-destination={item.href}
          aria-label={item.ariaLabel ?? (item.description ? item.label + ' · ' + item.description : item.label)}
          aria-current={isActive ? 'page' : undefined}
          data-tooltip={item.description || item.label}
          className={
            'group flex flex-1 min-w-0 flex-col items-center justify-center rounded-xl py-1 px-0.5 sm:px-1 '+
            'transition-all duration-200 border '+
            (isActive
              ? 'border-[#ff4d6d] bg-gradient-to-b from-[#6e1430] to-[#390d1c] text-[#fff0f2] shadow-[0_0_20px_#e11d4866]'
              : 'border-transparent text-[#e8cbb0] hover:border-[#a67c5255] hover:bg-[#251322aa]')
          }
        >
          <span
            aria-hidden="true"
            className={
              'gothic-dock__icon flex size-8 sm:size-9 items-center justify-center rounded-lg border transition-colors '+
              (isActive
                ? 'border-[#ff758f] bg-[#881738] text-[#ffd699] shadow-[0_0_12px_#ff4d6d88]'
                : 'border-[#8f694666] bg-[#2d1829aa] text-[#f3ca88] group-hover:border-[#d4aa70]')
            }
          >
            {getCanonicalDockIcon(item.href, item.icon)}
          </span>
          <span className="gothic-dock__label mt-1 text-[10px] sm:text-xs font-bold tracking-wider truncate max-w-full">
            {item.label}
          </span>
          {item.description && (
            <span className="gothic-dock__subtitle hidden md:block text-[9px] text-[#c9a68c] truncate max-w-full opacity-80" aria-hidden="true">
              {item.description}
            </span>
          )}
        </Link>
      );
    })}
  </nav>;
}

/** Compact contextual action used inside the room drawer, never a permanent tile. */
export function GothicActionButton({
  rune,label,detail,onClick,disabled,testId,pressed
}:{
  rune:ReactNode;
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
      'border-gothic-brass/70 bg-[linear-gradient(135deg,#432a31dc,#1a111cdd)] px-2.5 py-2 text-left overflow-hidden '+
      'text-gothic-ivory shadow-[inset_0_1px_#ffdbac32,0_3px_12px_#0004] '+
      'transition-[border-color,background-color,transform] duration-150 '+
      'hover:border-gothic-glow hover:bg-gothic-wine/80 active:scale-[.98] '+
      'disabled:cursor-not-allowed disabled:opacity-45 disabled:active:scale-100 '+
      'focus-visible:outline-2 focus-visible:outline-gothic-glow '+
      'motion-reduce:transition-none sm:min-h-[68px] sm:px-3'
    }>
    <span aria-hidden="true" className="text-[22px] leading-none text-gothic-gold">{rune}</span>
    <strong className="w-full break-words text-xs font-medium leading-snug">{label}</strong>
    <small className="line-clamp-2 text-[10px] leading-snug text-gothic-muted">{detail}</small>
  </button>;
}

/**
 * Accessible, reusable in-game modal. Focus starts inside the panel and
 * returns to the invoking button on close. Uses Tailwind rather than a
 * separate CSS panel implementation.
 */
export function GothicModal({
  title,onClose,children,wide=false,immersive=false,closeLabel="关闭面板"
}:{
  title:string;
  onClose:()=>void;
  children:ReactNode;
  wide?:boolean;
  /** Scenic visit mode: scene artwork owns the majority of the visible modal. */
  immersive?:boolean;
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
        'relative flex w-full gap-3 overflow-y-auto rounded-xl border border-gothic-brass/80 '+
        (immersive?'max-h-[93dvh] ':'max-h-[88dvh] ')+
        'bg-[radial-gradient(ellipse_at_15%_0%,#69374647,transparent_55%),linear-gradient(140deg,#291b28,#100c15_85%)] '+
        'p-5 text-gothic-ivory shadow-[0_26px_75px_#000e,inset_0_0_0_3px_#f1d09b14] '+
        'outline-none sm:gap-6 sm:p-9 '+
        (immersive?'max-w-[1440px] p-3 sm:p-5 ':wide?'max-w-[690px]':'max-w-[610px]')
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
