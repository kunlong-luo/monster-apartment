'use client';
import {useEffect} from 'react';
import {useMoonworkState,connectMoonworkState} from '@/lib/moonwork/world-state';

/** A single Zustand selector for all world pages and the workshop HUD.
 * The event bridge synchronizes Pixi writes, React actions and other tabs. */
export function useWorkshopWorld(){
  const world=useMoonworkState(state=>state.world);
  useEffect(()=>connectMoonworkState(),[]);
  return world;
}
