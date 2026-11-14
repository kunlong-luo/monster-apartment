'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useEffect,useRef,useState} from 'react';
import {Archive,Anvil,BookOpen,Castle,ChevronUp,House,Map,ScrollText,X} from 'lucide-react';
import {WORLD_NAV} from '@/components/moonwork/world-navigation';
import './game-scene-navigation.css';

const ICONS={
  lobby:House,apartment:Castle,workshop:Anvil,characters:BookOpen,
  orders:ScrollText,town:Map,warehouse:Archive,
} as const;

function canonicalPath(pathname:string){
  const path=pathname.replace(/^\/monster-apartment(?=\/|$)/,'').replace(/\/+$/,'')||'/';
  return path==='/'?path:path+'/';
}

/** Single, consistent navigation affordance for every *non-lobby* scene.
 * The full seven-destination dock belongs only to the lobby. */
export function GameSceneNavigation(){
  const pathname=usePathname();
  const route=canonicalPath(pathname||'/');
  // Closing on a route change is derived from the route key rather than a
  // synchronous setState inside useEffect (React 19 hooks lint).
  const [expandedRoute,setExpandedRoute]=useState<string|null>(null);
  const open=expandedRoute===route;
  const root=useRef<HTMLDivElement>(null);
  const toggle=useRef<HTMLButtonElement>(null);
  const active=WORLD_NAV.find(item=>item.href===route);
  useEffect(()=>{
    if(!open)return;
    const pointer=(event:PointerEvent)=>{
      if(event.target instanceof Node&&!root.current?.contains(event.target))setExpandedRoute(null);
    };
    const key=(event:KeyboardEvent)=>{
      if(event.key!=='Escape')return;
      event.preventDefault();
      setExpandedRoute(null);
      toggle.current?.focus();
    };
    document.addEventListener('pointerdown',pointer);
    document.addEventListener('keydown',key);
    return ()=>{
      document.removeEventListener('pointerdown',pointer);
      document.removeEventListener('keydown',key);
    };
  },[open]);

  // The compact world navigator belongs only to the seven game scenes,
  // never unlisted research/admin pages or unknown routes.
  if(route==='/'||!active)return null;

  return <div ref={root} className="game-scene-nav" data-testid="scene-navigation"
    data-current-route={route}>
    <div className="game-scene-nav__controls">
      <Link href="/" className="game-scene-nav__control" aria-label="返回大厅"
        data-testid="scene-return-lobby" title="返回大厅">
        <House size={18} strokeWidth={1.8} aria-hidden="true"/>
        <span>大厅</span>
      </Link>
      <button type="button" ref={toggle} className="game-scene-nav__control"
        data-testid="scene-navigation-toggle" aria-controls="game-scene-nav-panel"
        aria-haspopup="true" aria-expanded={open}
        aria-label={open?'收起世界导航':'展开世界导航'}
        onClick={()=>setExpandedRoute(value=>value===route?null:route)}>
        <Map size={18} strokeWidth={1.8} aria-hidden="true"/>
        <span>地点</span>
        <ChevronUp className={open?'game-scene-nav__chevron game-scene-nav__chevron--open':'game-scene-nav__chevron'}
          size={12} aria-hidden="true"/>
      </button>
    </div>
    {open&&<section id="game-scene-nav-panel" className="game-scene-nav__panel"
      data-testid="scene-navigation-panel" aria-label="切换游戏地点">
      <header className="game-scene-nav__heading">
        <div>
          <small>MONSTER APARTMENT</small>
          <strong>世界导航</strong>
          <span>当前位置 · {active?.full??'游戏场景'}</span>
        </div>
        <button type="button" onClick={()=>{setExpandedRoute(null);toggle.current?.focus();}}
          aria-label="关闭世界导航" className="game-scene-nav__close">
          <X size={17} aria-hidden="true"/>
        </button>
      </header>
      <nav className="game-scene-nav__destinations" aria-label="游戏七个正式地点">
        {WORLD_NAV.map(item=>{
          const Icon=ICONS[item.id];
          const selected=item.href===route;
          return <Link key={item.id} href={item.href}
            data-destination={item.href}
            aria-current={selected?'page':undefined}
            onClick={()=>{
              setExpandedRoute(null);
              // Next Link uses pushState for same-path hash-only navigation,
              // which does not notify the gallery's hashchange subscriber.
              // Clear an existing subscene hash natively before navigating to
              // the canonical route, so summon -> gallery is a real transition.
              if(item.href===route && window.location.hash)window.location.hash='';
            }}
            className={'game-scene-nav__destination'+(selected?' game-scene-nav__destination--current':'')}>
            <Icon size={19} aria-hidden="true" strokeWidth={1.65}/>
            <span><strong>{item.label}</strong><small>{item.purpose}</small></span>
            {selected&&<em>当前</em>}
          </Link>;
        })}
      </nav>
    </section>}
  </div>;
}
