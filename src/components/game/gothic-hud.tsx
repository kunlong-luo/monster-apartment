import Link from 'next/link';
import {useEffect,useRef,useState} from 'react';
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
  ChevronUp,
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

const iconButtonStyle='gothic-icon-button grid size-9 shrink-0 place-items-center rounded-full border text-lg backdrop-blur-md transition-[transform,background-color,border-color] duration-200 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none';

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
        className={`gothic-tooltip pointer-events-none absolute ${positionClasses[position]} z-50 hidden whitespace-nowrap rounded-lg border px-2.5 py-1 text-[11px] font-medium backdrop-blur-md group-hover/tooltip:block group-focus-within/tooltip:block motion-reduce:transition-none`}
      >
        <span className="mr-1 text-gothic-gold" aria-hidden="true">·</span>
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
        'gothic-resource-pill flex h-8 min-w-0 shrink-0 items-center gap-1 rounded-full border px-2.5 text-xs whitespace-nowrap backdrop-blur-lg sm:gap-1.5 sm:px-3'
      }
    >
      {ResourceIcon ? <ResourceIcon aria-hidden="true" size={15} strokeWidth={1.7} className="shrink-0 text-gothic-gold"/> : <span className="text-base leading-none text-gothic-gold" aria-hidden="true">{symbol}</span>}
      <strong data-testid={testId} className="font-medium tabular-nums">{amount}</strong>
      {label&&<small className="hidden text-[10px] text-gothic-muted md:inline">{label}</small>}
    </span>
  );
}

/**
 * R12: lobby alone owns this compact destination rail. Four quick routes are
 * visible on desktop (three on narrow phones); the canonical registry remains
 * available in its entirety through one keyboard-accessible world menu.
 */
export function GothicDock({
  items,label,className='',activeHref,testId
}:{
  items:readonly GothicDestination[];
  label:string;
  className?:string;
  activeHref:'/';
  testId?:string;
  compact?:boolean;
}){
  const [open,setOpen]=useState(false);
  const shellRef=useRef<HTMLDivElement>(null);
  const triggerRef=useRef<HTMLButtonElement>(null);
  const quickRoutes=['/apartment/','/workshop/','/characters/','/town/'];
  const quick=quickRoutes.map(href=>items.find(item=>item.href===href)).filter(
    (item):item is GothicDestination=>Boolean(item)
  );

  useEffect(()=>{
    if(!open)return;
    const outside=(event:PointerEvent)=>{
      if(!shellRef.current?.contains(event.target as Node))setOpen(false);
    };
    const onKey=(event:KeyboardEvent)=>{
      if(event.key==='Escape'){
        event.stopPropagation();
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown',outside,true);
    document.addEventListener('keydown',onKey,true);
    return ()=>{
      document.removeEventListener('pointerdown',outside,true);
      document.removeEventListener('keydown',onKey,true);
    };
  },[open]);
  return <div className="gothic-lobby__navigation" ref={shellRef} data-testid="lobby-navigation">
    <nav data-testid={testId??'lobby-primary-nav'} aria-label={label}
      className={'gothic-dock-bar gothic-dock--r12 '+className}>
      {quick.map((item,index)=><Link key={item.href} href={item.href}
        data-destination={item.href} data-testid="lobby-quick-destination"
        aria-label={item.ariaLabel??item.label}
        className={'gothic-dock__quick'+(index===3?' gothic-dock__quick--desktop':'')}
        onClick={()=>setOpen(false)}>
        <span className="gothic-dock__quick-icon" aria-hidden="true">{getCanonicalDockIcon(item.href,item.icon)}</span>
        <span className="gothic-dock__quick-label">{item.label}</span>
      </Link>)}
      <button ref={triggerRef} type="button" className="gothic-dock__more"
        data-testid="lobby-world-toggle" aria-label="全部地点"
        aria-haspopup="true" aria-expanded={open} aria-controls="lobby-world-menu"
        onClick={()=>setOpen(v=>!v)}>
        <Map aria-hidden="true" size={20} strokeWidth={1.6}/>
        <span>全部地点</span>
        <ChevronUp aria-hidden="true" size={14} strokeWidth={1.6}
          className={open?'gothic-dock__more-arrow gothic-dock__more-arrow--open':'gothic-dock__more-arrow'}/>
      </button>
    </nav>
    {open&&<nav id="lobby-world-menu" aria-label="全部地点导航"
      data-testid="lobby-world-menu" className="gothic-dock__map">
      <div className="gothic-dock__map-header">
        <strong>月蚀领地</strong><span>选择要前往的地点</span>
      </div>
      <div className="gothic-dock__map-grid">
        {items.map(item=><Link key={item.href} href={item.href}
          onClick={()=>setOpen(false)}
          data-destination={item.href}
          aria-current={activeHref===item.href?'page':undefined}
          aria-label={item.ariaLabel??item.label}
          className="gothic-dock__map-link">
          <span className="gothic-dock__map-icon" aria-hidden="true">{getCanonicalDockIcon(item.href,item.icon)}</span>
          <span><strong>{item.label}</strong><small>{item.description}</small></span>
        </Link>)}
      </div>
    </nav>}
  </div>;
}

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
      'gothic-action-button flex min-h-[60px] min-w-0 flex-col items-start gap-1 rounded-md border px-2.5 py-2 text-left overflow-hidden '+
      'transition-[border-color,background-color,transform] duration-150 active:scale-[.98] '+
      'disabled:cursor-not-allowed disabled:opacity-45 disabled:active:scale-100 '+
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
        'gothic-modal__surface relative flex w-full gap-3 overflow-y-auto rounded-xl border '+
        (immersive?'max-h-[93dvh] ':'max-h-[88dvh] ')+
        'p-5 '+
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
    className="gothic-panel-link mt-3 inline-flex min-h-10 items-center rounded-md border
      px-3 py-2 text-xs transition-colors focus-visible:outline-2">
    {children}
  </Link>;
}
