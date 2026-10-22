'use client';

import { useGameStore } from '@/store/game-store';
import { POLICY_IDS } from '@/core/engine';
import { policyLabel } from '@/lib/strategy-labels';
import { Panel } from '@/components/ui/panel';

export function StrategyPanel() {
  const { state, locale, setPolicy } = useGameStore();
  return (
    <Panel className="game-policy-panel" >
      <p className="game-panel-heading">{locale === 'zh' ? '今晚的经营策略' : 'Tonight\'s policy'}</p>
      <div className="grid grid-cols-3 gap-1.5" role="group"
        aria-label={locale === 'zh' ? '选择经营策略' : 'Choose nightly policy'}>
        {POLICY_IDS.map((id) => {
          const label = policyLabel(locale, id);
          return (
            <button key={id} type="button" disabled={state.over}
              aria-pressed={state.policy === id}
              onClick={() => setPolicy(id)}
              className={'game-policy-option ' + (state.policy === id ? 'is-selected' : '')}>
              <strong>{label.name}</strong>
              <span>{label.detail}</span>
            </button>
          );
        })}
      </div>
      <p className="text-[10px] text-mist-500 mt-1">
        {locale === 'zh' ? '每夜选择一次；结算后恢复稳健经营。' :
          'Choose each night. Resets to steady after settlement.'}
      </p>
    </Panel>
  );
}
