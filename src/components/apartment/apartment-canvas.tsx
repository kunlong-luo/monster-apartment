'use client';

import * as Phaser from 'phaser';
import { useEffect, useRef } from 'react';
import type { GameState } from '@/core/engine';
import type { CollectionState } from '@/core/spirit-collection';
import type { Locale } from '@/lib/i18n';
import { apartmentEvents } from '@/game/events';
import ApartmentScene from '@/game/apartment-scene';

type ApartmentCanvasProps = {
  state: GameState;
  collection: CollectionState;
  locale: Locale;
  selected: number | null;
  moveSource: number | null;
  onPick: (index: number) => void;
};

/**
 * Thin adapter around the Phaser game: React owns the data, the scene only renders.
 * All rendering calls flow through `updateBoard`, so the scene never holds state.
 */
export function ApartmentCanvas({ state, collection, selected, moveSource, locale, onPick }: ApartmentCanvasProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const latest = useRef({ state, collection, selected, moveSource, locale, onPick });

  useEffect(() => {
    latest.current = { state, collection, selected, moveSource, locale, onPick };
  });

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const handlePick = (index: number) => latest.current.onPick(index);
    const handleReady = (scene: ApartmentScene) => {
      const snapshot = latest.current;
      scene.updateBoard(snapshot.state, snapshot.selected, snapshot.moveSource, snapshot.locale, snapshot.collection);
    };

    apartmentEvents.on('room-picked', handlePick);
    apartmentEvents.on('scene-ready', handleReady);

    const instance = new Phaser.Game({
      type: Phaser.AUTO,
      parent: host,
      width: 628,
      height: 676,
      backgroundColor: '#15162e',
      scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
      scene: [ApartmentScene],
      render: { pixelArt: false, antialias: true },
    });
    gameRef.current = instance;

    return () => {
      apartmentEvents.off('room-picked', handlePick);
      apartmentEvents.off('scene-ready', handleReady);
      instance.destroy(true);
      // Next.js dev StrictMode replays effects. Phaser may remove its canvas on
      // a later frame, so synchronously clear the old host before re-creating it.
      // React does not own any children inside this dedicated Phaser div.
      host.replaceChildren();
      gameRef.current = null;
    };
  }, []);

  useEffect(() => {
    const scene = gameRef.current?.scene.getScene<ApartmentScene>(ApartmentScene.KEY);
    if (scene?.sys.isActive()) scene.updateBoard(state, selected, moveSource, locale, collection);
  }, [state, selected, moveSource, locale, collection]);

  return (
    <div
      ref={hostRef}
      role="img"
      aria-label={locale === 'en' ? 'Six-room spirit residence floor plan. Use room buttons to select rooms with a keyboard.' : '六间房的原创灵核公寓楼层示意图，可用左侧房间按钮键盘选择'}
      className="apartment-canvas w-full overflow-hidden rounded-[18px] bg-[#15162e]"
    />
  );
}
