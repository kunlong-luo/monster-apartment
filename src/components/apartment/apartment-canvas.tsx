'use client';

import * as Phaser from 'phaser';
import { useEffect, useRef } from 'react';
import type { GameState } from '@/core/engine';
import { apartmentEvents } from '@/game/events';
import ApartmentScene from '@/game/apartment-scene';

type ApartmentCanvasProps = {
  state: GameState;
  selected: number | null;
  moveSource: number | null;
  onPick: (index: number) => void;
};

/**
 * Thin adapter around the Phaser game: React owns the data, the scene only renders.
 * All rendering calls flow through `updateBoard`, so the scene never holds state.
 */
export function ApartmentCanvas({ state, selected, moveSource, onPick }: ApartmentCanvasProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const latest = useRef({ state, selected, moveSource, onPick });

  useEffect(() => {
    latest.current = { state, selected, moveSource, onPick };
  });

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const handlePick = (index: number) => latest.current.onPick(index);
    const handleReady = (scene: ApartmentScene) => {
      const snapshot = latest.current;
      scene.updateBoard(snapshot.state, snapshot.selected, snapshot.moveSource);
    };

    apartmentEvents.on('room-picked', handlePick);
    apartmentEvents.on('scene-ready', handleReady);

    const instance = new Phaser.Game({
      type: Phaser.AUTO,
      parent: host,
      width: 628,
      height: 676,
      backgroundColor: '#101b2d',
      scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
      scene: [ApartmentScene],
      render: { pixelArt: false, antialias: true },
    });
    gameRef.current = instance;

    return () => {
      apartmentEvents.off('room-picked', handlePick);
      apartmentEvents.off('scene-ready', handleReady);
      instance.destroy(true);
      gameRef.current = null;
    };
  }, []);

  useEffect(() => {
    const scene = gameRef.current?.scene.getScene<ApartmentScene>(ApartmentScene.KEY);
    if (scene?.sys.isActive()) scene.updateBoard(state, selected, moveSource);
  }, [state, selected, moveSource]);

  return (
    <div
      ref={hostRef}
      role="img"
      aria-label="六间房的怪物公寓楼层示意图，可用左侧房间按钮键盘选择"
      className="apartment-canvas w-full overflow-hidden rounded-2xl border border-line-strong bg-ink-900 shadow-[0_15px_48px_#0005]"
    />
  );
}
