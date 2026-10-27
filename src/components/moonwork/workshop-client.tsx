'use client';

import {useEffect, useRef, useState} from 'react';
import Link from 'next/link';
import {workshopAssetRoot} from '@/lib/moonwork/asset-root';
import {GothicDock, GothicResourcePill} from '@/components/game/gothic-hud';
import {WORLD_NAV} from './world-navigation';
import {useWorkshopWorld} from './world-save-react';
import {CHANGE_EVENT} from '@/lib/moonwork/world-store';
import {WorkshopContractPanel} from './workshop-contract-panel';
import {WorkshopShiftPanel} from './workshop-shift-panel';
import {WorkshopStageContainer} from './workshop-stage-container';
import {
  WORKERS,
  MACHINES,
  newWorkshop,
} from '../../../v2/src/workshop-engine';
import type {Craft, WorkerId} from '../../../v2/src/workshop-engine';

declare global {
  interface Window {
    MoonworkRuntime?: {
      mountWorkshopGame: (
        root: HTMLElement,
        assetBase?: string,
      ) => Promise<() => void>;
    };
    __moonworkRuntimeLoading?: Promise<void>;
  }
}

const workers = ['brook', 'fern', 'cinder'] as const;
const machines = ['well', 'garden', 'kiln'] as const;
const glyphs: Record<Craft, string> = {well: '◉', garden: '❀', kiln: '⬡'};

type Selection = {
  worker: WorkerId | null;
  machine: Craft | null;
  movingFrom: number | null;
  selectedPlot: number | null;
};

const readSelection = (root: HTMLElement): Selection => ({
  worker: (root.dataset.chosenWorker || null) as WorkerId | null,
  machine: (root.dataset.chosenMachine || null) as Craft | null,
  movingFrom: root.dataset.movingFrom ? Number(root.dataset.movingFrom) : null,
  selectedPlot: root.dataset.selectedPlot
    ? Number(root.dataset.selectedPlot)
    : null,
});

function assetRoot() {
  return workshopAssetRoot(window.location.href);
}

function loadRuntime(base: string) {
  if (window.MoonworkRuntime) return Promise.resolve();
  if (window.__moonworkRuntimeLoading) return window.__moonworkRuntimeLoading;

  const script = document.createElement('script');
  script.src = new URL('assets/workshop-runtime.js', base).href;
  script.async = true;

  const loaded = new Promise<void>((resolve, reject) => {
    script.onload = () =>
      window.MoonworkRuntime
        ? resolve()
        : reject(Error('The PixiJS runtime did not expose a mount function.'));
    script.onerror = () =>
      reject(Error('The workshop script could not be loaded.'));
  });

  window.__moonworkRuntimeLoading = loaded.catch((error) => {
    window.__moonworkRuntimeLoading = undefined;
    script.remove();
    throw error;
  });

  document.head.appendChild(script);
  return window.__moonworkRuntimeLoading;
}

export function WorkshopClient() {
  const host = useRef<HTMLDivElement>(null);
  const [error, setError] = useState('');
  const savedWorld = useWorkshopWorld();
  const world = savedWorld ?? newWorkshop();

  const [selection, setSelection] = useState<Selection>({
    worker: null,
    machine: null,
    movingFrom: null,
    selectedPlot: null,
  });

  const [portraitUrl, setPortraitUrl] = useState<string>(
    './assets/moonveil-portrait.avif',
  );

  useEffect(() => {
    const root = host.current?.querySelector<HTMLElement>('#root');
    if (!root) return;

    root.dataset.reactControls = 'true';
    root.classList.add('gothic-workshop');
    root.style.backgroundImage =
      'linear-gradient(110deg,#0c0712be,#0d0815d5),url(../lobby-hero.webp)';

    const base = assetRoot();
    setPortraitUrl(new URL('assets/moonveil-portrait.avif', base).href);

    let cancelled = false;
    let dispose: (() => void) | undefined;

    const onControlsChange = () => {
      setSelection((prev) => {
        const next = readSelection(root);
        return prev.worker === next.worker &&
          prev.machine === next.machine &&
          prev.movingFrom === next.movingFrom &&
          prev.selectedPlot === next.selectedPlot
          ? prev
          : next;
      });
    };

    root.addEventListener('moonwork:controls-change', onControlsChange);

    void loadRuntime(base)
      .then(async () => {
        if (cancelled) return;
        const runtime = window.MoonworkRuntime;
        if (!runtime) throw Error('PixiJS runtime is missing.');

        const cleanup = await runtime.mountWorkshopGame(root, base);
        if (cancelled) {
          cleanup();
        } else {
          dispose = cleanup;
          window.dispatchEvent(new Event(CHANGE_EVENT));
          onControlsChange();
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      });

    return () => {
      cancelled = true;
      root.removeEventListener('moonwork:controls-change', onControlsChange);
      dispose?.();
    };
  }, []);

  const selectedTile =
    selection.selectedPlot !== null ? world.tiles[selection.selectedPlot] : null;
  const isMoving = selection.movingFrom !== null;

  return (
    <div
      ref={host}
      data-testid="next-workshop-shell"
      className="gothic-workshop-shell relative isolate min-h-dvh overflow-hidden"
    >
      <main id="root" className="lab gothic-workshop" data-react-controls="true">
        {/* Top Header */}
        <header className="top">
          <div className="logo">
            <span>✧</span>
            <div>
              <strong>月光工坊</strong>
              <small>
                <Link
                  className="world-gate"
                  href="/town/"
                  data-testid="v2-world-gate"
                  aria-label="返回月光街，进入其他游戏场景"
                >
                  月光街 · 世界地图 ↗
                </Link>
              </small>
            </div>
          </div>
          <div className="top-stats">
            <span>
              第 <b id="day" data-testid="v2-internal-day">{world.day}</b> 天
            </span>
            <span>
              ✦ <b id="coins" data-testid="v2-internal-coins">{world.coins}</b>
            </span>
            <button
              type="button"
              id="reset"
              data-testid="v2-reset"
              aria-label="重新开始"
            >
              ↻
            </button>
          </div>
        </header>

        {/* Middle: Canvas Stage & Sidebar */}
        <section className="middle">
          <WorkshopStageContainer
            world={world}
            chosenWorker={selection.worker}
            chosenMachine={selection.machine}
            movingFrom={selection.movingFrom}
            selectedPlot={selection.selectedPlot}
          />

          <aside className="sidebar">
            <WorkshopContractPanel world={world} portraitSrc={portraitUrl} />
            <WorkshopShiftPanel world={world} />
          </aside>
        </section>

        {/* Console: Workers, Machines & Main Actions */}
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
                const isSelected = selection.worker === id;
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
                      className={'worker-miniature ' + id}
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
                const isSelected = selection.machine === id;
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

        {/* Footer */}
        <footer>
          <p id="status" data-testid="v2-status" role="status"></p>
          <small>✦ 月光商区 · 工坊日志</small>
        </footer>
        <span id="summary" className="sr-only"></span>
      </main>

      {/* Floating HUD Resource Pills */}
      <div
        data-testid="workshop-react-hud"
        className="pointer-events-none absolute right-14 top-2 z-[22] flex items-start gap-1.5 sm:right-[68px] sm:top-3 sm:gap-2"
        aria-label="工坊当前资源"
      >
        <span className="pointer-events-auto hidden sm:inline-flex">
          <GothicResourcePill
            symbol="☾"
            amount={world.day}
            label="工坊天数"
            testId="v2-day"
          />
        </span>
        <span className="pointer-events-auto">
          <GothicResourcePill
            symbol="✦"
            amount={world.coins}
            label="星币"
            testId="v2-coins"
          />
        </span>
        <span className="pointer-events-auto">
          <GothicResourcePill
            symbol="◆"
            amount={world.warehouse.core}
            label="晶核"
          />
        </span>
      </div>

      {/* Shared Gothic World Navigation Dock */}
      <GothicDock
        label="月光工坊世界"
        activeHref="/workshop/"
        testId="v2-world-nav"
        items={WORLD_NAV.map((item) => ({
          href: item.href,
          icon: item.glyph,
          label: item.label,
          ariaLabel: item.full,
        }))}
      />

      {error && (
        <p role="alert" className="mw-runtime-error">
          工坊画面未能启动：{error}。请检查浏览器 WebGL 支持并刷新。
        </p>
      )}
    </div>
  );
}
