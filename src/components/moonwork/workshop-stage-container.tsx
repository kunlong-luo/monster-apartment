'use client';

import {
  workshopRank,
  machineUpgradeQuote,
  machineLevel,
  machineSalvageRefund,
  workshopNextStep,
  WORKERS,
  MACHINES,
} from '../../../v2/src/workshop-engine';
import type {Craft, WorkerId, WorkshopState} from '../../../v2/src/workshop-engine';

export function WorkshopStageContainer({
  world,
  chosenWorker,
  chosenMachine,
  movingFrom,
  selectedPlot,
}: {
  world: WorkshopState;
  chosenWorker: WorkerId | null;
  chosenMachine: Craft | null;
  movingFrom: number | null;
  selectedPlot: number | null;
}) {
  const rank = workshopRank(world.completed);
  const rankText =
    rank.zh +
    (rank.nextGoal === null
      ? ' · 主线达成，自由经营'
      : ' · 下一目标 ' + rank.nextGoal + ' 单');

  const selectedTile =
    selectedPlot !== null ? world.tiles[selectedPlot] : null;
  const quote =
    selectedPlot !== null ? machineUpgradeQuote(world, selectedPlot) : null;
  const isMoving = movingFrom !== null;

  const selectedText = chosenWorker
    ? '待派工：' + WORKERS[chosenWorker].zh
    : chosenMachine
    ? '待建造：' + MACHINES[chosenMachine].zh
    : isMoving
    ? '移动设备：再选一个空格'
    : selectedPlot !== null
    ? '选中 ' + String(selectedPlot + 1).padStart(2, '0') + ' 号地块'
    : workshopNextStep(world);

  const upgradeVisible = Boolean(selectedTile && quote);
  const upgradeDisabled = Boolean(quote && !quote.canUpgrade);
  const upgradeText =
    selectedTile && quote
      ? world.completed < quote.requiresCompleted
        ? 'Lv.' + quote.next + ' · 完成 ' + quote.requiresCompleted + ' 单解锁'
        : '升级 Lv.' +
          machineLevel(selectedTile) +
          ' → ' +
          quote.next +
          ' · ✦ ' +
          quote.cost
      : '设备升级';

  return (
    <div className="world" aria-label="生产与建设画布区域">
      <div className="stage-label">
        <span>● 生产与建设区</span>
        <small id="rank" data-testid="v2-rank">
          {rankText}
        </small>
      </div>

      <div
        id="stage"
        data-testid="v2-stage"
        aria-label="PixiJS WebGL 工坊场景：点击设备或空地进行操作"
      ></div>

      <div className="selection">
        <span id="selected" data-testid="v2-next-step">{selectedText}</span>
        <button
          type="button"
          id="salvage"
          data-testid="v2-salvage"
          hidden={!selectedTile}
          title="只返还设备原价的 60%，已储存材料、升级与派工不会保留"
          className="shrink-0 rounded-md border border-gothic-brass/70 bg-gothic-panel/80 px-2 py-1 text-[10px] text-gothic-muted transition-colors hover:border-gothic-glow hover:text-gothic-ivory focus-visible:outline-2 focus-visible:outline-gothic-glow motion-reduce:transition-none"
        >
          拆除返还 ✦{machineSalvageRefund(selectedTile)}
        </button>
        <button
          type="button"
          id="upgrade"
          data-testid="v2-upgrade"
          hidden={!upgradeVisible}
          disabled={upgradeDisabled}
          title="等级越高，每班水汽、孢子或晶核产量越多"
          aria-label="设备升级"
        >
          {upgradeText}
        </button>
      </div>
      <p id="status" data-testid="v2-status" role="status"
        className="min-h-7 shrink-0 border-t border-gothic-brass/30 bg-gothic-panel/85 px-3 py-1 text-[11px] leading-5 text-gothic-muted data-[tone=bad]:text-rose-200 data-[tone=good]:text-emerald-200"
      />
    </div>
  );
}
