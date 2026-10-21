import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Panel } from '@/components/ui/panel';
import { TENANTS } from '@/core/engine';
import type { TenantId } from '@/core/engine';
import { t, tenantNames, tenantDescriptions } from '@/lib/i18n';
import type { Locale } from '@/lib/i18n';

type TenantCardProps = {
  tenant: TenantId;
  locale: Locale;
  disabled: boolean;
  onRecruit: (id: TenantId) => void;
};

export function TenantCard({ tenant: id, locale, disabled, onRecruit }: TenantCardProps) {
  const tenant = TENANTS[id];
  const colorHex = '#' + tenant.color.toString(16).padStart(6, '0');

  return (
    <Panel className="p-3">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 grid place-items-center rounded-xl text-2xl w-10 h-10 bg-ink-700"
          style={{ color: colorHex }} aria-hidden="true">
          {tenant.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <strong className="text-mist-300 truncate">{tenantNames[locale][id]}</strong>
            <Badge tone="gold">-{tenant.price}</Badge>
          </div>
          <p className="text-mist-500 text-xs mt-0.5 truncate">{tenantDescriptions[locale][id]}</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge tone="mint">{t(locale, 'rent')} +{tenant.rent}</Badge>
          </div>
        </div>
      </div>
      <Button variant="primary" fullWidth className="mt-3" disabled={disabled}
        onClick={() => onRecruit(id)}
        aria-label={tenantNames[locale][id] + ' -' + tenant.price + ' ' + t(locale, 'coins') + ', ' + t(locale, 'rent') + ' +' + tenant.rent}>
        {t(locale, 'recruit')}
      </Button>
    </Panel>
  );
}
