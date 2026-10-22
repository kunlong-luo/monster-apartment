'use client';

import { NIGHT_DECISION_IDS, NIGHT_DILEMMAS, nightDecisionImpact } from '@/core/engine';
import type { NightDecisionId } from '@/core/engine';
import { useGameStore } from '@/store/game-store';
import { Panel } from '@/components/ui/panel';
import { SPIRIT_BY_ID } from '@/core/spirit-collection';


const scenarios = [
  { zh: '夜间巡逻', en: 'Night patrol', careZh: '雇人巡夜', careEn: 'Extra patrol',
    profitZh: '卖夜间通行券', profitEn: 'Sell night passes' },
  { zh: '水管危机', en: 'Pipe emergency', careZh: '提前检修', careEn: 'Preventive repair',
    profitZh: '推迟维修', profitEn: 'Delay repairs' },
  { zh: '神秘访客', en: 'Mysterious guests', careZh: '热情接待', careEn: 'Welcome guests',
    profitZh: '提高门票', profitEn: 'Raise entry fees' },
  { zh: '供暖警报', en: 'Heating alert', careZh: '保暖升级', careEn: 'Warmth upgrade',
    profitZh: '节能限暖', profitEn: 'Cut heating' },
  { zh: '年度评选', en: 'Annual judging', careZh: '精心布置', careEn: 'Decorate rooms',
    profitZh: '商业推广', profitEn: 'Commercial ads' },
] as const;

function signed(value: number): string {
  return value > 0 ? '+' + value : String(value);
}

export function NightDecisionPanel() {
  const { state, locale, setNightDecision } = useGameStore();
  const scenario = scenarios[state.day - 1];
  if (!scenario) return null;
  const helper = NIGHT_DILEMMAS[state.day - 1].helper;
  const helperPresent = state.rooms.some(id => id && SPIRIT_BY_ID[id].role === helper);
  const helperZh = { guard: '守护', repair: '修缮', explore: '探索', economy: '经营' }[helper];
  const helperEn = { guard: 'Guard', repair: 'Repair', explore: 'Explorer', economy: 'Economy' }[helper];
  const priorCare = state.history.filter((night) => night.nightDecision === 'care').length;
  const priorProfit = state.history.filter((night) => night.nightDecision === 'profit').length;
  return (
    <Panel className="game-dilemma-panel">
      <p className="game-panel-heading">
        {locale === 'zh' ? '第 ' + state.day + ' 夜 · ' + scenario.zh :
          'Night ' + state.day + ' · ' + scenario.en}
      </p>
      <div className="grid grid-cols-3 gap-1.5" role="group"
        aria-label={locale === 'zh' ? '今晚的事件应对' : 'Tonight event decision'}>
        {NIGHT_DECISION_IDS.map((id: NightDecisionId) => {
          const effect = nightDecisionImpact({ ...state, nightDecision: id });
          const name = id === 'none' ? (locale === 'zh' ? '顺其自然' : 'Do nothing')
            : id === 'care' ? (locale === 'zh' ? scenario.careZh : scenario.careEn)
              : locale === 'zh' ? scenario.profitZh : scenario.profitEn;
          return (
            <button key={id} type="button" disabled={state.over}
              aria-pressed={(state.nightDecision ?? 'none') === id}
              onClick={() => setNightDecision(id)}
              className={'game-policy-option game-dilemma-option ' +
                ((state.nightDecision ?? 'none') === id ? 'is-selected' : '')}>
              <strong>{name}</strong>
              <span>{signed(effect.coins)} {locale === 'zh' ? '金币' : 'coins'}</span>
              <span>{signed(effect.satisfaction)} {locale === 'zh' ? '满意度' : 'mood'}</span>
            </button>
          );
        })}
      </div>
      {(state.day === 3 || state.day === 4) && (
        <p className="text-[10px] text-gold-200 mt-1" data-testid="long-term-consequence">
          {state.day === 3
            ? (locale === 'zh' ? `前两夜关怀 ${priorCare}/2：达到两次可在今晚化解访客危机。` : `Earlier care ${priorCare}/2: two caring nights resolve the visitor crisis.`)
            : (locale === 'zh' ? `此前逐利 ${priorProfit}/2：达到两次会在今晚触发稽查。` : `Earlier profit ${priorProfit}/2: two profit nights trigger an inspection.`)}
        </p>
      )}
      <p className="text-[10px] text-mist-500 mt-1">
        {locale === 'zh'
          ? (helperPresent ? '有' + helperZh + '职业灵核' + '协助，关怀方案包含协助奖励。' :
              tenantNames.zh[helper] + '在场时，关怀方案还有金币奖励。')
          : (helperPresent ? helperEn + ' spirit' + ' is here to help.' :
              tenantNames.en[helper] + ' unlocks a bonus for the care choice.')}
      </p>
    </Panel>
  );
}
