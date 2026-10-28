'use client';

import {useEffect, useRef, useState} from 'react';
import {useMoonworkState,ensureWorkshopWorld,EMPTY_SELECTION} from '@/lib/moonwork/world-state';
import Link from 'next/link';
import '@/components/game/gothic-workshop.css';
import {workshopAssetRoot} from '@/lib/moonwork/asset-root';
import {GothicDock, GothicResourcePill} from '@/components/game/gothic-hud';
import {WORLD_NAV} from './world-navigation';
import {useWorkshopWorld} from './world-save-react';
import {SAVE_KEY, CHANGE_EVENT, parseSavedWorld} from '@/lib/moonwork/world-store';
import {WorkshopContractPanel} from './workshop-contract-panel';
import {WorkshopShiftPanel} from './workshop-shift-panel';
import {WorkshopStageContainer} from './workshop-stage-container';
import {WorkshopControls} from './workshop-controls';
import {newWorkshop} from '../../../v2/src/workshop-engine';
import lobbyHero from '../../../public/art/lobby-hero-v3.webp';
import moonveilPortrait from '../../../public/art/yuesha-portrait-v3.webp';
import yueshaBust from '../../../public/art/yuesha-bust-v3.webp';
import yueshaAvatar from '../../../public/art/yuesha-avatar-v3.webp';
import Image from 'next/image';
import type {
  WorkshopAction,WorkshopRuntimeController,WorkshopSelectionListener
} from '../../../v2/src/workshop-runtime-contract';

declare global {
  interface Window {
    MoonworkRuntime?: {
      mountWorkshopGame: (
        root: HTMLElement,
        assetBase?: string,
        onSelectionChange?: WorkshopSelectionListener,
      ) => Promise<WorkshopRuntimeController>;
    };
    __moonworkRuntimeLoading?: Promise<void>;
  }
}

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

const ASSISTANT_LINES = [
  '今天的工坊运转非常顺利呢~ 我们再加把劲吧！',
  '晶核熔炉与水汽泵正在稳定产出，阁下请放心~',
  '别忘了为工匠们安排合适的工位哦，工效会大幅提升呢！',
  '月光街的委托人随时可能来访，多储备一些晶核吧~',
  '原料充足时生产效率最高，注意检查仓储消耗哦！',
];

export function WorkshopClient() {
  const host = useRef<HTMLDivElement>(null);
  const gameController = useRef<WorkshopRuntimeController|null>(null);
  const onAction = (action:WorkshopAction) => gameController.current?.dispatch(action);
  const [error, setError] = useState('');
  // Pixi canvas may be visible before mountWorkshopGame has returned its controller.
  // Keep React and Pixi actions inert until dispatch can actually apply them.
  const [runtimeReady,setRuntimeReady] = useState(false);
  const [blockedSave, setBlockedSave] = useState(false);
  const [recoveryVersion, setRecoveryVersion] = useState(0);
  const [speechIndex, setSpeechIndex] = useState(0);
  const savedWorld = useWorkshopWorld();
  const world = savedWorld ?? newWorkshop();

  const selection=useMoonworkState(state=>state.selection);
  const setSelection=useMoonworkState(state=>state.setSelection);

  // Use the same production art as the other React scenes. The low-res
  // Pixi sidecar portrait remains only for its separate internal textures.
  const portraitUrl=moonveilPortrait.src;

  useEffect(() => {
    setRuntimeReady(false);
    const root = host.current?.querySelector<HTMLElement>('#root');
    if (!root) return;

    // Do not start the Pixi runtime against an existing invalid save: the
    // player must explicitly opt into replacing it.
    let raw: string | null = null;
    try { raw = window.localStorage.getItem(SAVE_KEY); } catch { /* Storage may be blocked. */ }
    if (raw !== null && !parseSavedWorld(raw)) {
      setBlockedSave(true);
      return;
    }
    setBlockedSave(false);
    setError('');

    setSelection(EMPTY_SELECTION);
    root.dataset.reactControls = 'true';
    root.classList.add('gothic-workshop');
    root.style.backgroundImage =
      'linear-gradient(110deg,#0c0712be,#0d0815d5),url('+JSON.stringify(lobbyHero.src)+')';

    const base = assetRoot();

    let cancelled = false;
    let dispose: (() => void) | undefined;

    // Type-safe selection snapshots cross the IIFE boundary through a
    // callback; no DOM attribute decoding or synthetic control-change event.
    const onSelectionChange:WorkshopSelectionListener = (next) => {
      if(cancelled)return;
      setSelection(next);
    };

    void ensureWorkshopWorld()
      .then(()=>cancelled?Promise.resolve():loadRuntime(base))
      .then(async () => {
        if (cancelled) return;
        const runtime = window.MoonworkRuntime;
        if (!runtime) throw Error('PixiJS runtime is missing.');

        const controller = await runtime.mountWorkshopGame(root, base, onSelectionChange);
        if (cancelled) {
          controller.destroy();
        } else {
          gameController.current = controller;
          setRuntimeReady(true);
          dispose = () => {
            if(gameController.current===controller) gameController.current=null;
            controller.destroy();
          };
          window.dispatchEvent(new Event(CHANGE_EVENT));
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      });

    return () => {
      cancelled = true;
      // The IIFE's callback can outlive an aborted async mount, so the
      // cancelled flag prevents state updates after React has unmounted.
      dispose?.();
    };
  }, [recoveryVersion,setSelection]);

  const selectedTile =
    selection.selectedPlot !== null ? world.tiles[selection.selectedPlot] : null;
  const isMoving = selection.movingFrom !== null;

  return (
    <div
      ref={host}
      data-testid="next-workshop-shell"
      className="gothic-workshop-shell relative isolate min-h-dvh overflow-hidden"
    >
      <main id="root" className="lab gothic-workshop" data-react-controls="true"
        data-runtime-ready={runtimeReady?'true':'false'}
        aria-busy={!runtimeReady} inert={!runtimeReady}>
        {/* Top Header */}
        <header className="top">
          <div className="flex items-center gap-2.5">
            {/* Player profile matching reference */}
            <div className="player-profile-badge flex items-center gap-2 rounded-xl border border-[#b68c61]/50 bg-[#160d1b]/85 px-2.5 py-1 backdrop-blur-sm shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
              <div className="relative h-8 w-8 sm:h-9 sm:w-9 shrink-0 overflow-hidden rounded-full border border-[#f0c588]/80 shadow-[0_0_8px_rgba(240,197,136,0.3)]">
                <Image
                  src={yueshaAvatar}
                  alt="工坊领主头像"
                  fill
                  sizes="36px"
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex flex-col text-left">
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="text-[10px] sm:text-[11px] font-bold text-[#f0c588]">Lv.60</span>
                  <span className="text-[11px] sm:text-xs font-semibold text-[#f9eedb]">SparkPrairie</span>
                </div>
                <div className="mt-1 flex items-center gap-1">
                  <span className="text-[8px] sm:text-[9px] font-medium text-[#c8a982]">EXP</span>
                  <div className="h-1.5 w-12 sm:w-16 overflow-hidden rounded-full bg-[#2a1727]">
                    <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-[#b68c61] to-[#e4ad58]" />
                  </div>
                  <span className="text-[8px] text-[#e0cfbe]/70">72%</span>
                </div>
              </div>
            </div>

            <div className="logo hidden lg:flex items-center gap-2">
              <span aria-hidden="true" className="star-sigil">⚜</span>
              <div className="logo-text">
                <strong>月光工坊</strong>
                <small className="workshop-tagline">Lv.3 暗夜工坊</small>
              </div>
            </div>
          </div>

          {/* Upgraded Gothic navigation gates */}
          <nav className="workshop-nav-gates" aria-label="游戏场景导航">
            <Link
              href="/"
              className="gothic-nav-btn world-gate"
              data-testid="v2-return-lobby"
              aria-label="返回大厅"
              data-tooltip="返回哥特公寓主大厅"
            >
              <span className="gothic-nav-glyph" aria-hidden="true">⌂</span>
              <span>返回大厅 ↗</span>
            </Link>
            <Link
              href="/town/"
              className="gothic-nav-btn world-gate"
              data-testid="v2-world-gate"
              aria-label="返回月光街，进入其他游戏场景"
              data-tooltip="前往月光街世界地图"
            >
              <span className="gothic-nav-glyph" aria-hidden="true">🧭</span>
              <span>月光街 · 世界地图 ↗</span>
            </Link>
          </nav>

          <div className="top-stats">
            <div
              data-testid="workshop-react-hud"
              className="workshop-hud-pills flex items-center gap-1 sm:gap-1.5"
              aria-label="工坊当前资源"
            >
              <span className="hidden sm:inline-flex">
                <GothicResourcePill
                  symbol="☾"
                  amount={world.day}
                  label="工坊天数"
                  testId="v2-day"
                />
              </span>
              <span>
                <GothicResourcePill
                  symbol="✦"
                  amount={world.coins}
                  label="星币"
                  testId="v2-coins"
                />
              </span>
              <span>
                <GothicResourcePill
                  symbol="◆"
                  amount={world.warehouse.core}
                  label="晶核"
                />
              </span>
            </div>

            <button
              type="button"
              id="reset"
              data-testid="v2-reset"
              onClick={()=>onAction({type:'reset'})}
              aria-label="重新开始"
              data-tooltip="重新开始工坊"
            >
              ↻
            </button>
          </div>
        </header>

        {/* Middle: Canvas Stage & Sidebar */}
        <section className="middle">
          {/* Left: Moonveil Anime Assistant Cameo & Dialogue */}
          <aside className="gothic-cameo-assistant" aria-label="工坊看板娘月纱">
            <div className="gothic-cameo-frame">
              <div className="gothic-cameo-img-wrap">
                <Image
                  src={yueshaBust}
                  alt="工坊看板娘月纱"
                  fill
                  sizes="(max-width: 1200px) 180px, 240px"
                  className="object-cover object-top filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]"
                  priority
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="gothic-cameo-badge">
                <span className="cameo-role-star" aria-hidden="true">✦</span>
                <span className="cameo-name">月纱 · 首席魔女</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSpeechIndex((prev) => (prev + 1) % ASSISTANT_LINES.length)}
              className="gothic-cameo-bubble text-left"
              data-tooltip="点击倾听工坊见闻"
              aria-label="看板娘台词，点击切换"
            >
              <div className="bubble-speaker">
                <span className="bubble-tag">月纱</span>
                <span className="bubble-hint" aria-hidden="true">点击倾听 ✎</span>
              </div>
              <p className="bubble-content">{ASSISTANT_LINES[speechIndex]}</p>
            </button>
          </aside>

          <WorkshopStageContainer
            onAction={onAction}
            world={world}
            chosenWorker={selection.worker}
            chosenMachine={selection.machine}
            movingFrom={selection.movingFrom}
            selectedPlot={selection.selectedPlot}
          />

          <aside className="sidebar">
            <WorkshopContractPanel world={world} portraitSrc={portraitUrl} onAction={onAction} />
            <WorkshopShiftPanel world={world} />
          </aside>
        </section>

        {/* Factory input controls are one React-owned component. */}
        <WorkshopControls
          onAction={onAction}
          world={world}
          chosenWorker={selection.worker}
          chosenMachine={selection.machine}
          selectedTile={selectedTile}
          isMoving={isMoving}
        />

        {/* Footer */}
        <footer aria-hidden="true">
          <small>✦ 月光商区</small>
        </footer>
        <span id="summary" className="sr-only"></span>
      </main>

      {!runtimeReady&&!blockedSave&&!error&&<p role="status"
        className="pointer-events-none absolute left-1/2 top-[45%] z-[15] -translate-x-1/2 rounded-lg border border-gothic-gold/45 bg-[#170f20eb] px-4 py-3 text-xs text-gothic-ivory shadow-lg">
        正在准备工坊设备…
      </p>}
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

      {blockedSave && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-[#09050ce8] px-5 backdrop-blur-md" role="alertdialog" aria-modal="true" aria-labelledby="workshop-save-error">
          <div className="w-full max-w-md rounded-xl border border-gothic-brass/70 bg-gothic-panel p-6 text-gothic-ivory shadow-2xl">
            <h2 id="workshop-save-error" className="text-xl font-semibold text-gothic-glow">工坊存档需要处理</h2>
            <p className="mt-3 text-sm leading-7 text-gothic-muted">检测到已有但无法读取的工坊存档。为避免意外丢失进度，游戏没有自动覆盖它。只有你确认重新开始后才会创建新存档。</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" className="rounded-lg border border-gothic-gold bg-gothic-wine px-4 py-2 text-sm text-gothic-ivory hover:brightness-110" onClick={() => {
                try {
                  window.localStorage.setItem(SAVE_KEY, JSON.stringify(newWorkshop()));
                  window.dispatchEvent(new Event(CHANGE_EVENT));
                  setBlockedSave(false);
                  setRecoveryVersion((v) => v + 1);
                } catch {
                  setError('无法写入新存档，请检查浏览器存储权限。');
                }
              }}>确认重新开始</button>
              <Link href="/town/" className="rounded-lg border border-gothic-brass/60 px-4 py-2 text-sm text-gothic-ivory">返回月光街</Link>
            </div>
            {error && <p className="mt-3 text-sm text-red-200" role="alert">{error}</p>}
          </div>
        </div>
      )}
      {error && !blockedSave && (
        <p role="alert" className="mw-runtime-error">
          工坊画面未能启动：{error}。请检查浏览器 WebGL 支持并刷新。
        </p>
      )}
    </div>
  );
}
