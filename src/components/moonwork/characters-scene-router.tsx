'use client';
import {useSyncExternalStore} from 'react';
import {useSearchParams} from 'next/navigation';
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
  const params=useSearchParams();
  const hashView=useSyncExternalStore(subscribe,currentView,()=> 'gallery');
  // App Router uses pushState for same-route navigations, which does NOT
  // dispatch hashchange. The search-param hook observes that navigation,
  // allowing a featured card to open its existing private suite reliably.
  const target=params.get('visit');
  const visitingWorker=target==='brook'||target==='fern'||target==='cinder';
  const view=visitingWorker?'gallery':hashView;
  return view==='summon'?<GothicSummonScreen/>:<MoonworkWorld area="characters"/>;
}
