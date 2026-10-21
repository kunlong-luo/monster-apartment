import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Panel } from '@/components/ui/panel';
import { TENANTS } from '@/core/engine';
import type { TenantId } from '@/core/engine';

type TenantCardProps = {
  tenant: TenantId;
  disabled: boolean;
  onRecruit: (id: TenantId) => void;
};

export function TenantCard({ tenant: id, disabled, onRecruit }: TenantCardProps) {
  const tenant = TENANTS[id];
  const colorHex = `#${tenant.color.toString(16).padStart(6, '0')}`;
  const canAfford = !disabled;

  return (
    <Panel className="p-3">
      <div className="flex items-start gap-3">
        <div
          className="flex-shrink-0 grid place-items-center rounded-xl text-2xl w-10 h-10 bg-ink-700"
          style={{ color: colorHex }}
          aria-hidden="true"
        >
          {tenant.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <strong className="text-mist-300 truncate">{tenant.name}</strong>
            <Badge tone="gold">-{tenant.price}</Badge>
          </div>
          <p className="text-mist-500 text-xs mt-0.5 truncate">{tenant.description}</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge tone="mint">租金 +{tenant.rent}</Badge>
          </div>
        </div>
      </div>
      <Button
        variant="primary"
        fullWidth
        className="mt-3"
        disabled={!canAfford}
        onClick={() => onRecruit(id)}
        aria-label={`${tenant.name} -${tenant.price} 金币，租金 +${tenant.rent}`}
      >
        招募
      </Button>
    </Panel>
  );
}