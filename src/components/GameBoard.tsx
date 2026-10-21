import { useEffect, useRef } from 'react';
import * as Phaser from 'phaser';
import ApartmentScene, { gameEvents } from '../game/ApartmentScene';
import type { GameState } from '../core/engine.js';

export default function GameBoard({ state, selected, moveSource, onPick }:{ state:GameState; selected:number|null; moveSource:number|null; onPick:(i:number)=>void }) {
  const host = useRef<HTMLDivElement>(null);
  const game = useRef<Phaser.Game|null>(null);
  const current = useRef({state, selected, moveSource});
  current.current={state, selected, moveSource};
  const onPickRef=useRef(onPick); onPickRef.current=onPick;

  useEffect(() => {
    if (!host.current) return;
    const picked=(i:number)=>onPickRef.current(i);
    const ready=(scene:ApartmentScene)=>{
      const v=current.current;
      scene.updateBoard(v.state,v.selected,v.moveSource);
    };
    gameEvents.on('room-picked',picked);
    gameEvents.on('scene-ready',ready);
    const instance = new Phaser.Game({
      type: Phaser.AUTO,
      parent:host.current,
      width:628, height:676,
      backgroundColor:'#101b2d',
      scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},
      scene:[ApartmentScene],
      render:{pixelArt:false, antialias:true}
    });
    game.current=instance;
    return () => {
      gameEvents.off('room-picked',picked);
      gameEvents.off('scene-ready',ready);
      instance.destroy(true);
      game.current=null;
    };
  },[]);

  useEffect(()=>{
    if (!game.current) return;
    const scene = game.current.scene.getScene('ApartmentScene') as ApartmentScene;
    if (scene && scene.sys.isActive()) scene.updateBoard(state, selected, moveSource);
  },[state,selected,moveSource]);

  return <div className="game-canvas" ref={host} role="img" aria-label="六间房的怪物公寓楼层示意图，可用左侧房间按钮键盘选择" />;
}
