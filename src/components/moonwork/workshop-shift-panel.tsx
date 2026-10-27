'use client';

import {
  PREMIUM_ORDER_PENALTY,
  STANDARD_ORDER_PENALTY,
  forecastNextShift,
} from '../../../v2/src/workshop-engine';
import type {WorkshopState} from '../../../v2/src/workshop-engine';

export function getDiagnosisText(world: WorkshopState): string {
  const report = world.last;
  const stall = report?.blocked ?? [];

  if (report?.milestone) {
    return report.milestone === 3
      ? '⭐ 3 单达成！升级权限提升至 Lv.3，并获得 70 星币的工坊发展资金。'
      : '🌙 5 单达成！月光大师工坊目标完成，获得 160 星币，可继续自由经营。';
  }
  if (report?.fulfilled) {
    return '订单完成！交付晶核，获得星币。下一批需求提高了。';
  }
  if (report?.lost) {
    return `交付失败：晶核不足，损失 ${
      report.premium ? PREMIUM_ORDER_PENALTY : STANDARD_ORDER_PENALTY
    } 星币。新订单已开始。`;
  }
  if (stall.length) {
    return stall.some((s) => s.includes(':water'))
      ? '温室缺水：让它与水汽泵紧挨，并确保水泵有人操作。'
      : '熔炉缺孢子：让它靠近温室；两份孢子才能炼出晶核。';
  }
  if (report && report.cores === 0) {
    return '今天还没炼出晶核。检查设备连接和工人分配。';
  }
  if (report) {
    return '生产链运转了。可以继续调整布局来提升产量。';
  }
  return '水汽泵 → 孢子温室 → 晶核熔炉。设备必须上下左右相邻，专长匹配时产量更高。';
}

export function WorkshopShiftPanel({world}: {world: WorkshopState}) {
  const report = world.last;
  const diagnosis = getDiagnosisText(world);
  const predicted = forecastNextShift(world);
  const previewNote = predicted.willDeliver
    ? '本班结算订单 · 奖励 ✦' + predicted.reward
    : predicted.willMiss
      ? '本班将逾期 · 先补足晶核'
      : predicted.blocked.some(reason=>reason.endsWith(':water'))
        ? '温室缺水 · 检查水泵和相邻布局'
        : predicted.blocked.some(reason=>reason.endsWith(':fiber'))
          ? '熔炉缺孢子 · 检查温室和相邻布局'
          : predicted.cores===0
            ? '暂无晶核产出 · 先连接设备并派工'
            : '按当前设备和工匠排班推演';

  return (
    <section className="panel" aria-label="上一轮生产报告">
      <small className="eyebrow">LAST SHIFT / 生产报告</small>
      <div className="flow">
        <div>
          <b id="water" data-testid="v2-water">
            {report?.water ?? 0}
          </b>
          <small>水汽</small>
        </div>
        <span aria-hidden="true">→</span>
        <div>
          <b id="fiber" data-testid="v2-fiber">
            {report?.fiber ?? 0}
          </b>
          <small>孢子</small>
        </div>
        <span aria-hidden="true">→</span>
        <div>
          <b id="output" data-testid="v2-output">
            {report?.cores ?? 0}
          </b>
          <small>晶核</small>
        </div>
      </div>
      <div data-testid="v2-shift-forecast"
        className="mt-2 rounded-md border border-gothic-brass/35 bg-gothic-panel/65 px-2.5 py-2 text-[10px] leading-snug text-gothic-muted">
        <span className="text-gothic-gold">NEXT SHIFT · 下一班预计</span>
        <strong className="mt-1 block font-semibold tabular-nums text-gothic-ivory">
          水汽 +{predicted.water}　→　孢子 +{predicted.fiber}　→　晶核 +{predicted.cores}
        </strong>
        <small className={predicted.willMiss||predicted.blocked.length
          ?'mt-1 block text-rose-200':'mt-1 block text-gothic-muted'}>{previewNote}</small>
      </div>
      <p id="diagnosis" data-testid="v2-diagnosis" role="status">
        {diagnosis}
      </p>
    </section>
  );
}
