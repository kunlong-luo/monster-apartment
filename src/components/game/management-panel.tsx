'use client';

import { useGameStore } from '@/store/game-store';
import { Panel } from '@/components/ui/panel';
import { SectionHeading } from '@/components/ui/section-heading';
import { MeterRow } from '@/components/ui/meter-row';
import { Badge } from '@/components/ui/badge';
import { synergyDetails } from '@/core/engine';
import { TENANTS } from '@/core/engine';

export function ManagementPanel() {
  const { state } = useGameStore();
  const occupied = state.rooms.filter(Boolean).length;
  const synergy = synergyDetails(state.rooms);

  return (
    <Panel>
      <SectionHeading title="管理面板" />
      <div className="space-y-2 mb-4">
        <MeterRow
          label="基础租金"
          value={state.rooms.reduce((sum, id) => sum + (id ? TENANTS[id].rent : 0), 0)}
          tone="positive"
        />
        <MeterRow label="维护费用" value={-occupied * 3} tone="negative" />
        <MeterRow
          label="组合加成"
          value={synergy.coins >= 0 ? `+${synergy.coins}` : synergy.coins}
          tone={synergy.coins >= 0 ? 'positive' : 'negative'}
        />
        <MeterRow
          label="预估净入"
          value={state.rooms.reduce((sum, id) => sum + (id ? TENANTS[id].rent : 0), 0) - occupied * 3 + synergy.coins}
          tone="default"
        />
      </div>
      {synergy.messages.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-mist-500 text-xs font-medium">当前组合效果</p>
          <div className="flex flex-wrap gap-1.5">
            {synergy.messages.map((msg, i) => (
              <Badge key={i} tone={msg.includes('-') ? 'danger' : 'mint'}>
                {msg}
              </Badge>
            ))}
          </div>
        </div>
      )}
      {synergy.messages.length === 0 && occupied > 0 && (
        <p className="text-mist-500 text-xs">暂无相邻组合加成</p>
      )}
      {occupied === 0 && (
        <p className="text-mist-500 text-xs">请先招募租客</p>
      )}
    </Panel>
  );
}