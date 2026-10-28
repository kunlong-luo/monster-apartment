'use client';
import {useEffect} from 'react';
import {connectMoonworkState,useMoonworkState} from '@/lib/moonwork/world-state';

/** Zustand is the single React source of truth for all Moonwork routes.
 * Pixi still owns the canvas while game actions sync through one event bridge. */
export function useWorkshopWorld(){
  const world=useMoonworkState(state=>state.world);
  useEffect(()=>connectMoonworkState(),[]);
  return world;
}
