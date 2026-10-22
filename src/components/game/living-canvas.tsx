'use client';
import * as Phaser from 'phaser';
import { useEffect, useRef } from 'react';
import { LivingScene } from '@/game/living-scene';
import type { LivingState } from '@/core/living-engine';

export function LivingCanvas({state}:{state:LivingState}){
  const host=useRef<HTMLDivElement>(null);
  const scene=useRef<LivingScene|null>(null);
  const latest=useRef(state);
  useEffect(()=>{latest.current=state;});
  useEffect(()=>{
    if(!host.current)return;
    const activeHost=host.current;
    const world=new LivingScene();
    scene.current=world;
    world.onReady=()=>world.sync(latest.current);
    const game=new Phaser.Game({
      type:Phaser.AUTO,parent:activeHost,width:960,height:570,
      backgroundColor:'#151a30',
      scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},
      render:{pixelArt:false,antialias:true},scene:[world],
    });
    return ()=>{
      world.onReady=undefined;
      scene.current=null;
      game.destroy(true);
      activeHost.replaceChildren();
    };
  },[]);
  useEffect(()=>{if(scene.current?.sys.isActive())scene.current.sync(state);},[state]);
  return <div data-testid="living-phaser" ref={host} role="img"
    aria-label="An interactive cutaway sanctuary: a glowing core reactor, a leafy greenhouse, a defensive gate and visible approaching intruders."
    className="living-phaser absolute inset-0 overflow-hidden"/>;
}
