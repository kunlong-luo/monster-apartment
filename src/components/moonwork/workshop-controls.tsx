'use client';
import Link from 'next/link';
import workerTriptych from '../../../v2/art/worker-triptych.avif';
import {WORKERS,MACHINES} from '../../../v2/src/workshop-engine';
import type {WorkshopState,Machine,Craft,WorkerId} from '../../../v2/src/workshop-engine';

/** React is the only owner of the worker roster, machine catalog and
 * shift/movement buttons. The Pixi stage handles plot interactions only.
 * data-worker/data-build and #move/#shift are stable runtime contracts. */
const workers=['brook','fern','cinder'] as const;
const machines=['well','garden','kiln'] as const;
const glyphs:Record<Craft,string>={well:'◉',garden:'❀',kiln:'⬡'};
export function WorkshopControls({
  world,chosenWorker,chosenMachine,selectedTile,isMoving
}:{
  world:WorkshopState;
  chosenWorker:WorkerId|null;
  chosenMachine:Craft|null;
  selectedTile:Machine|null;
  isMoving:boolean;
}){
  return (
    <section className="console">
      {/* 工种分配 */}
      <div className="console-panel">
        <div className="panel-head">
          <b>工种分配</b>
          <Link
            className="panel-route-link"
            href="/characters/"
            data-world-route="characters"
          >
            角色档案 ↗
          </Link>
        </div>
        <div id="actions" className="options">
          {workers.map((id) => {
            const profile = WORKERS[id];
            const occupied = world.tiles.findIndex(
              (tile) => tile?.worker === id,
            );
            const isSelected = chosenWorker === id;
            return (
              <button
                key={id}
                type="button"
                data-worker={id}
                data-testid={'v2-worker-' + id}
                aria-pressed={isSelected}
                aria-label={'选择工匠 ' + profile.zh}
                className={`worker group flex min-w-0 flex-col items-center justify-center gap-0.5 rounded-lg border border-gothic-brass/65 bg-gothic-panel/85 px-1.5 py-1 text-gothic-ivory transition-colors hover:border-gothic-glow focus-visible:outline-2 focus-visible:outline-gothic-glow motion-reduce:transition-none ${
                  isSelected
                    ? 'active border-gothic-glow bg-gothic-wine/80'
                    : ''
                }`}
              >
                <span
                  className={'worker-miniature ' + id + ' block size-8 shrink-0 rounded-full border border-gothic-brass/70 bg-no-repeat sm:size-9'}
                  style={{
                    backgroundImage: 'url(' + workerTriptych.src + ')',
                    backgroundSize: '300% 100%',
                    backgroundPosition: id === 'brook' ? '0% center' : id === 'fern' ? '50% center' : '100% center',
                  }}
                  role="img"
                  aria-label={profile.zh + '的绘制头像'}
                />
                <strong className="text-[11px] leading-tight sm:text-xs">
                  {profile.zh}
                </strong>
                <small className="max-w-full truncate text-[9px] text-gothic-muted">
                  {occupied >= 0
                    ? '工位 ' + String(occupied + 1).padStart(2, '0')
                    : '待分配'}
                </small>
              </button>
            );
          })}
        </div>
      </div>

      {/* 建设设备 */}
      <div className="console-panel">
        <div className="panel-head">
          <b>建设设备</b>
          <Link
            className="panel-route-link"
            href="/warehouse/"
            data-world-route="warehouse"
          >
            库存与采购 ↗
          </Link>
        </div>
        <div id="catalog" className="options">
          {machines.map((id) => {
            const info = MACHINES[id];
            const isSelected = chosenMachine === id;
            return (
              <button
                key={id}
                type="button"
                data-build={id}
                data-testid={'v2-build-' + id}
                aria-pressed={isSelected}
                aria-label={'建设 ' + info.zh}
                disabled={world.coins < info.cost}
                className={`machine-card group flex min-w-0 flex-col items-center justify-center gap-0.5 rounded-lg border border-gothic-brass/65 bg-gothic-panel/85 px-1.5 py-1 text-gothic-ivory transition-colors hover:border-gothic-glow focus-visible:outline-2 focus-visible:outline-gothic-glow disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none ${
                  isSelected
                    ? 'active border-gothic-glow bg-gothic-wine/80'
                    : ''
                }`}
              >
                <span
                  className={'machine-symbol ' + id + ' text-gothic-gold'}
                  aria-hidden="true"
                >
                  {glyphs[id]}
                </span>
                <strong className="text-[11px] leading-tight sm:text-xs">
                  {info.zh}
                </strong>
                <small className="tabular-nums text-[9px] text-gothic-muted">
                  ✦ {info.cost}
                </small>
              </button>
            );
          })}
        </div>
      </div>

      {/* 生产控制与设备搬迁 */}
      <div className="main-actions">
        <button
          type="button"
          id="move"
          data-testid="v2-move"
          disabled={!selectedTile && !isMoving}
          aria-pressed={isMoving}
          aria-label="移动机器设备"
          className={`move-btn group flex flex-1 items-center justify-center gap-1 rounded-lg border border-gothic-brass/70 bg-gothic-panel/90 px-2.5 py-1.5 text-xs font-semibold text-gothic-ivory shadow-sm transition-all hover:border-gothic-glow hover:bg-gothic-wine/50 focus-visible:outline-2 focus-visible:outline-gothic-glow disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none ${
            isMoving
              ? 'active border-gothic-glow bg-gothic-wine/80 text-gothic-glow shadow-[0_0_12px_rgba(240,197,136,0.3)]'
              : ''
          }`}
        >
          <span className="text-[11px] font-bold sm:text-xs">
            {isMoving ? '再选空格搬移' : '移动机器 ↗'}
          </span>
        </button>
        <button
          type="button"
          id="shift"
          data-testid="v2-shift"
          aria-label="开始一天生产轮班"
          className="shift-btn group flex flex-1 items-center justify-center gap-1 rounded-lg border border-gothic-gold/80 bg-gradient-to-r from-gothic-gold to-gothic-brass px-3 py-1.5 text-xs font-bold text-ink-950 shadow-md transition-all hover:brightness-110 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-gothic-glow motion-reduce:transition-none"
        >
          <span className="text-[11px] sm:text-xs">开始一天生产 ▶</span>
        </button>
      </div>
    </section>
  );
}
