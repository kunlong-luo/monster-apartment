'use client';

import Link from 'next/link';
import {forecastPatronCommission, PATRON_IMPORT_PRICE} from '../../../v2/src/workshop-engine';
import type {WorkshopState} from '../../../v2/src/workshop-engine';

const PATRON_LINES: Record<string, string> = {
  offered: '「你的工坊真有本事。月光落下之前，能为我准备这些晶核吗？」',
  active: '「今晚的星光很美。希望我们能如约交货。」',
  completed: '「守约的工匠总让我刮目相看。下次月夜再见。」',
  missed: '「月亮不会等待任何人。可惜，这次我们错过了。」',
  expired: '「你没有接受邀请。那就留待下一次月夜吧。」',
};

export function WorkshopContractPanel({
  world,
  portraitSrc,
}: {
  world: WorkshopState;
  portraitSrc: string;
}) {
  const patron = world.patron ?? null;
  const forecast = patron ? forecastPatronCommission(world) : null;
  const progressPercent = Math.min(
    100,
    (100 * world.warehouse.core) / (world.order.cores || 1),
  );
  const remainingDays = Math.max(0, world.order.due - world.day + 1);

  const patronStatus = patron?.status ?? 'offered';
  const patronDialogue = patron ? PATRON_LINES[patronStatus] ?? '' : '';
  const patronDaysText =
    patronStatus === 'offered' || patronStatus === 'active'
      ? '剩 ' + Math.max(0, (patron?.due ?? 0) - world.day + 1) + ' 天'
      : '已结算';

  const showImport =
    Boolean(forecast && (forecast.deficit > 0 || forecast.nextNormalOrder === 'missed'));

  return (
    <section className="panel" aria-label="工坊委托与契约">
      <div className="panel-heading">
        <small className="eyebrow">TODAY&apos;S CONTRACT</small>
        <Link
          className="panel-route-link"
          href="/orders/"
          data-world-route="orders"
          aria-label="前往委托大厅"
        >
          查看委托大厅 ↗
        </Link>
      </div>

      <h2 id="contract-title">
        {world.order.premium ? '高额大宗订单' : '晶核紧急订单'}
      </h2>

      <div className="target">
        <b id="core" data-testid="v2-stock">
          {world.warehouse.core}
        </b>
        <span>/</span>
        <b id="target">{world.order.cores}</b>
        <small>晶核</small>
      </div>

      <div className="meter" role="progressbar" aria-valuenow={world.warehouse.core} aria-valuemin={0} aria-valuemax={world.order.cores}>
        <div id="progress" style={{width: `${progressPercent}%`}}></div>
      </div>

      <div className="contract-footer">
        <span>
          剩 <b id="deadline" data-testid="v2-deadline">{remainingDays}</b> 天
        </span>
        <span>
          完成 <b id="completed" data-testid="v2-completed">{world.completed}</b> · 逾期{' '}
          <b id="failed" data-testid="v2-failed">{world.failed}</b>
        </span>
      </div>

      {/* 月夜魔女月纱委托卡片 */}
      <div
        id="patron"
        className="patron-card"
        data-testid="v2-patron-card"
        hidden={!patron}
        data-status={patron?.status}
      >
        <span className="patron-eyebrow">✦ THE MOONVEIL VISITOR</span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="patron-portrait"
          data-testid="v2-patron-portrait"
          src={portraitSrc}
          width={68}
          height={90}
          alt="原创月夜魔女月纱的手绘肖像"
          decoding="async"
        />
        <strong>
          月纱 <small>28岁 · 月夜魔女</small>
        </strong>
        <p id="patron-dialogue" data-testid="v2-patron-dialogue">
          {patronDialogue}
        </p>

        <div className="patron-progress">
          <span>
            额外晶核{' '}
            <b id="patron-progress" data-testid="v2-patron-progress">
              {world.warehouse.core}/{patron?.cores ?? 0}
            </b>
          </span>
          <span id="patron-days" data-testid="v2-patron-days">
            {patronDaysText}
          </span>
        </div>

        <p
          id="patron-forecast"
          className="patron-forecast"
          data-testid="v2-patron-forecast"
          aria-live="polite"
          hidden={!forecast}
          data-risk={forecast?.deficit ? 'high' : 'low'}
        >
          {forecast
            ? forecast.deficit
              ? `当前排班预测 ${forecast.available}/${forecast.required} · 还缺 ${forecast.deficit} 枚，接单可能损失 ✦20。升级熔炉或调整产线可改变结果。`
              : `当前排班预测 ${forecast.available}/${forecast.required} · 特单有望完成，普通订单${
                  forecast.nextNormalOrder === 'fulfilled'
                    ? '也有望完成。'
                    : forecast.nextNormalOrder === 'missed'
                    ? '可能逾期。'
                    : '仍需关注。'
                }`
            : ''}
        </p>

        <button
          type="button"
          id="patron-accept"
          data-testid="v2-patron-accept"
          hidden={patron?.status !== 'offered'}
        >
          接受月纱委托 · 奖励 ✦135
        </button>

        <button
          type="button"
          id="patron-import"
          data-testid="v2-patron-import"
          hidden={!showImport}
          disabled={world.coins < PATRON_IMPORT_PRICE}
        >
          临时采购 +1 晶核 · ✦{PATRON_IMPORT_PRICE}
        </button>
      </div>
    </section>
  );
}
