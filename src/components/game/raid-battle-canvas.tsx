'use client';

import * as Phaser from 'phaser';
import { useEffect, useRef } from 'react';
import type { CollectionState } from '@/core/spirit-collection';
import type { RaidState } from '@/core/night-raid';
import { RaidScene } from '@/game/raid-scene';

export function RaidBattleCanvas({ raid, collection }: {
  raid: RaidState;
  collection: CollectionState;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<RaidScene | null>(null);
  const current = useRef({ raid, collection });

  useEffect(() => { current.current = { raid, collection }; });

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const scene = new RaidScene();
    sceneRef.current = scene;
    const ready = () => scene.sync(current.current.raid, current.current.collection);
    scene.onReady = ready;
    const instance = new Phaser.Game({
      type: Phaser.AUTO,
      parent: host,
      width: 960,
      height: 342,
      backgroundColor: '#16182c',
      scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
      render: { pixelArt: false, antialias: true },
      scene: [scene],
    });
    return () => {
      scene.onReady = undefined;
      sceneRef.current = null;
      instance.destroy(true);
      host.replaceChildren();
    };
  }, []);

  useEffect(() => {
    const scene = sceneRef.current;
    if (scene?.sys.isActive()) scene.sync(raid, collection);
  }, [raid, collection]);

  return (
    <div ref={hostRef} data-testid="raid-phaser-canvas" role="img"
      aria-label="Three tactical lanes with animated spirit defenders, enemy waves and spell effects."
      className="raid-phaser-canvas w-full aspect-[960/342] overflow-hidden rounded-xl bg-[#16182c]" />
  );
}
