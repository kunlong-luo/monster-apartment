import type { DayResult } from '@/core/engine';
import type { Locale } from '@/lib/i18n';
import { localizeGameText } from '@/lib/i18n';
import { Panel } from '@/components/ui/panel';

type Props = { result: DayResult; satisfaction: number; locale: Locale };

const signed = (value: number) => (value > 0 ? `+${value}` : String(value));

export function NightSettlement({ result, satisfaction, locale }: Props) {
  const zh = locale === 'zh';
  const decisionMood = result.decisionSatisfaction ?? 0;
  const policyMood = result.policySatisfaction ?? 0;
  const preferenceMood = result.preferenceSatisfaction ?? 0;
  const knownMoodDelta = preferenceMood + policyMood + decisionMood + (result.spiritSatisfaction ?? 0);
  const lines = [
    { label: zh ? '租金' : 'Rent', value: result.rent },
    { label: zh ? '维护成本' : 'Upkeep', value: -result.upkeep },
    { label: zh ? '房间组合' : 'Neighbor synergy', value: result.synergy },
    { label: zh ? '房间偏好' : 'Room affinity', value: result.preference ?? 0 },
    { label: zh ? '经营策略' : 'Policy', value: result.policyCoins ?? 0 },
    { label: zh ? '夜间抉择' : 'Decision', value: result.decisionCoins ?? 0 },
    { label: zh ? '灵核驻守' : 'Spirit support', value: result.spiritCoins ?? 0 },
    { label: zh ? '夜间事件' : 'Night event', value: result.event },
  ];
  return (
    <Panel className="game-night-summary">
      <details className="group">
      <summary className="flex cursor-pointer items-center justify-between gap-2">
        <strong className="text-gold-200 text-sm">{zh ? `第 ${result.day} 夜 · 经营结算` : `Night ${result.day} · Settlement`}</strong>
        <span className="text-mint-300 font-bold">{signed(result.net)} ◈</span>
      </summary>
      <p className="text-mist-300 text-xs my-2">
        ☾ {localizeGameText(result.eventTitle, locale)} · {localizeGameText(result.eventDetail, locale)}
      </p>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs" data-testid="night-settlement">
        {lines.map((line) => (
          <div key={line.label} className="flex justify-between gap-2 border-b border-line py-1">
            <span className="text-mist-400">{line.label}</span>
            <span className={line.value < 0 ? 'text-danger-300' : 'text-mint-300'}>{signed(line.value)}</span>
          </div>
        ))}
        <div className="flex justify-between gap-2 py-1">
          <span className="text-mist-400">{zh ? '当前满意度' : 'Current mood'}</span>
          <strong>{satisfaction}/100</strong>
        </div>
      </div>
      <p className="text-mist-500 text-xs mt-2">
        {zh ? '满意度已结算；房间、策略及抉择的影响' : 'Mood settled; room, policy and decision effects'} {signed(knownMoodDelta)}
        {zh ? '（不含邻接与事件变化）' : ' (excludes adjacency and event changes)'}
      </p>
      </details>
    </Panel>
  );
}
