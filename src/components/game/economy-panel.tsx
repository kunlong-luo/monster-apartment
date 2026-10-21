'use client';

import { useGameStore } from '@/store/game-store';
import { Panel } from '@/components/ui/panel';
import { SectionHeading } from '@/components/ui/section-heading';
import { StatTile } from '@/components/ui/stat-tile';
import { ProgressBar } from '@/components/ui/progress-bar';
import { LAST_DAY, TARGET_COINS, TARGET_SATISFACTION } from '@/core/engine';

export function EconomyPanel() {
  const { state } = useGameStore();
  const occupied = state.rooms.filter(Boolean).length;

  return (
    <Panel>
      <SectionHeading title="经营概况" meta={`DAY ${state.day}/${LAST_DAY}`} />
      <div className="grid grid-cols-2 gap-2 mb-4">
        <StatTile label="金币" value={`◈ ${state.coins}`} tone="gold" />
        <StatTile label="入住" value={`${occupied} / 6`} />
      </div>
      <ProgressBar value={state.coins} max={TARGET_COINS} label="目标金币" />
      <ProgressBar value={state.satisfaction} max={TARGET_SATISFACTION} label="目标满意度" />
      <p className="hint text-mist-500 text-xs mt-3 leading-relaxed">
        金币需达 {TARGET_COINS} · 满意度需达 {TARGET_SATISFACTION} · 共 {LAST_DAY} 天
      </p>
    </Panel>
  );
}