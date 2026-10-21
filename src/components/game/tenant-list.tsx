'use client';

import { useGameStore } from '@/store/game-store';
import { Panel } from '@/components/ui/panel';
import { SectionHeading } from '@/components/ui/section-heading';
import { TenantCard } from './tenant-card';
import { TENANT_IDS, TENANTS } from '@/core/engine';
import { cn } from '@/components/ui/cn';
import type { TenantId } from '@/core/engine';

type TenantListProps = {
  disabled: boolean;
  onRecruit: (id: TenantId) => void;
};

export function TenantList({ disabled, onRecruit }: TenantListProps) {
  const { state } = useGameStore();

  return (
    <Panel>
      <SectionHeading title="可招募租客" />
      <div
        className={cn(
          'grid gap-2',
          'grid-cols-2',
          'sm:grid-cols-2',
          'lg:grid-cols-1',
        )}
      >
{TENANT_IDS.map((id) => (
            <TenantCard
              key={id}
              tenant={id}
              disabled={disabled || state.coins < (TENANTS[id]?.price ?? 999)}
              onRecruit={onRecruit}
            />
          ))}
      </div>
    </Panel>
  );
}