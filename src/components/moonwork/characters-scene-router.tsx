'use client';
import {useSyncExternalStore} from 'react';
import {MoonworkWorld} from './world-ui';
import {GothicSummonScreen} from '@/components/summon/gothic-summon-screen';

/** Summoning and the established private-room gallery share /characters/.
 * The hash is a view selector, never an eighth top-level navigation route. */
function currentView(){return window.location.hash==='#summon-screen'?'summon':'gallery';}
function subscribe(cb:()=>void){
  window.addEventListener('hashchange',cb);
  return ()=>window.removeEventListener('hashchange',cb);
}
export function CharactersSceneRouter(){
  const view=useSyncExternalStore(subscribe,currentView,()=> 'gallery');
  return view==='summon'?<GothicSummonScreen/>:<MoonworkWorld area="characters"/>;
}
