'use client';

import * as Phaser from 'phaser';
import { useEffect, useRef } from 'react';
import type { CozyState } from '@/core/cozy-engine';
import { CozyAtmosphereScene } from '@/game/cozy-atmosphere-scene';

/** A transparent Phaser canvas, hosted in the existing cutaway.
 * All click targets remain real DOM room buttons above/below this
 * non-interactive light pass; Phaser does not duplicate the game rules. */
export function CozyWorldEffects({state,paused}:{state:CozyState;paused:boolean}){
  const host=useRef<HTMLDivElement>(null);
  const world=useRef<CozyAtmosphereScene|null>(null);
  const latest=useRef({state,paused});

  useEffect(()=>{latest.current={state,paused};});

  useEffect(()=>{
    const element=host.current;
    if(!element)return;
    const scene=new CozyAtmosphereScene();
    world.current=scene;
    scene.onReady=()=>scene.sync(latest.current.state,latest.current.paused);
    const game=new Phaser.Game({
      type:Phaser.CANVAS,parent:element,
      transparent:true,width:1200,height:680,
      scale:{mode:Phaser.Scale.RESIZE},
      render:{pixelArt:false,antialias:true},
      scene:[scene],
    });
    return ()=>{
      scene.onReady=undefined;
      world.current=null;
      game.destroy(true);
      // Phaser may detach the previous canvas on the next frame.
      element.replaceChildren();
    };
  },[]);

  useEffect(()=>{
    if(world.current?.sys.isActive())world.current.sync(state,paused);
  },[state,paused]);

  return <div data-testid="cozy-phaser-atmosphere" ref={host}
    className="cozy-world-effects" aria-hidden="true"/>;
}
