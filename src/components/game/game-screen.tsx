'use client';

import { useEffect } from 'react';
import { useGameStore } from '@/store/game-store';
import { t, localizeGameText } from '@/lib/i18n';
import { SAVE_KEY, decodeSave, encodeSave } from '@/lib/save-game';
import { GameHeader } from './game-header';
import { EconomyPanel } from './economy-panel';
import { RoomPicker } from './room-picker';
import { TenantList } from './tenant-list';
import { ManagementPanel } from './management-panel';
import { ResultCard } from './result-card';
import { PlayHelp } from './play-help';
import { StatusBar } from './status-bar';
import { LogList } from '@/components/ui/log-list';
import { ApartmentView } from '@/components/apartment/apartment-view';
import { Panel } from '@/components/ui/panel';
import { Button } from '@/components/ui/button';

export function GameScreen() {
  const {
    state, selected, moveSource, error, help, locale, tutorialActive, tutorialStep, saveAvailable, hydrated,
    pickRoom, recruit, beginMove, cancelMove, nextDay, reset, toggleHelp,
    setLocale, nextTutorial, skipTutorial, replayTutorial,
  } = useGameStore();

  // Browser-only hydration: never read localStorage during SSR or write before
  // restoring a saved run. Store subscriptions save every successful action.
  useEffect(() => {
    let unsubscribe = () => {};
    let canWrite = true;
    const snapshot = () => {
      const current = useGameStore.getState();
      return {
        version: 1 as const,
        state: current.state,
        locale: current.locale,
        tutorialActive: current.tutorialActive,
        tutorialStep: current.tutorialStep,
      };
    };
    const persist = () => {
      if (!canWrite) return;
      try {
        window.localStorage.setItem(SAVE_KEY, encodeSave(snapshot()));
      } catch {
        canWrite = false;
        useGameStore.getState().setSaveAvailable(false);
      }
    };
    try {
      const saved = decodeSave(window.localStorage.getItem(SAVE_KEY));
      if (saved) useGameStore.getState().restoreSave(saved);
      persist();
      if (canWrite) {
        useGameStore.getState().setSaveAvailable(true);
        unsubscribe = useGameStore.subscribe(persist);
      }
    } catch {
      useGameStore.getState().setSaveAvailable(false);
    }
    useGameStore.getState().setHydrated();
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale === 'en' ? 'en' : 'zh-CN';
  }, [locale]);

  // Wait until the saved run has been restored before exposing interactive controls.
  if (!hydrated) {
    return <div className="min-h-screen bg-ink-950 grid place-items-center text-mist-300">正在加载公寓…</div>;
  }

  const occupied = state.rooms.filter(Boolean).length;
  const canSettle = occupied > 0 && !state.over;
  const tutorialKeys = ['guide1', 'guide2', 'guide3', 'guide4'] as const;

  return (
    <div className="game-shell font-sans text-mist-300 antialiased">
      <div className="game-page-layer">
        <header className="game-masthead game-container">
          <GameHeader helpOpen={help} locale={locale} onSetLocale={setLocale}
            onToggleHelp={toggleHelp} onReset={reset} onReplayTutorial={replayTutorial}
            day={state.day} coins={state.coins} />
        </header>

        <main className="game-container">
          <div className="game-layout">
            <aside className="game-roster">
              <EconomyPanel />
              <RoomPicker rooms={state.rooms} selected={selected} moveSource={moveSource}
                disabled={state.over} onPick={pickRoom} />
              <TenantList disabled={state.over || selected === null} onRecruit={recruit} />
              <div className="mt-4">
                <Button variant="secondary" fullWidth
                  disabled={state.over || selected === null || !state.rooms[selected] || moveSource !== null}
                  onClick={beginMove}>
                  {t(locale, 'move')}
                </Button>
              </div>
              {moveSource !== null && (
                <div className="mt-4">
                  <Button variant="quiet" fullWidth onClick={cancelMove}>{t(locale, 'cancelMove')}</Button>
                </div>
              )}
            </aside>

            <section className="game-stage" data-testid="apartment-stage">
              <div className="game-moon-card flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="game-eyebrow mb-1">✧ MIDNIGHT RESIDENCE ✧</p>
                  <h2 className="game-section-title">
                    {locale === 'zh' ? '这栋楼，今夜住着谁？' : 'Who lives here tonight?'}
                  </h2>
                  <p className="game-subtitle mt-1">{locale === 'zh'
                    ? '给怪物们安排房间，让奇妙邻居擦出火花。'
                    : 'Find a room for every monster. Neighbor magic makes the difference.'}</p>
                </div>
                <span className="game-day-chip">☾ {locale === 'zh' ? '第 ' + state.day + ' / 5 夜' : 'NIGHT ' + state.day + ' / 5'}</span>
              </div>
              {tutorialActive && (
                <Panel className="border-gold-300/55 bg-ink-800">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <strong className="text-gold-200">✦ {t(locale, 'guideTitle')}</strong>
                    <span className="text-xs text-mist-500">
                      {t(locale, 'guideStep')} {tutorialStep + 1}/4
                    </span>
                  </div>
                  <p className="text-sm text-mist-300 mb-3">{t(locale, tutorialKeys[tutorialStep])}</p>
                  <div className="flex gap-2 flex-wrap">
                    <Button size="sm" variant="primary" onClick={nextTutorial}>
                      {t(locale, tutorialStep === 3 ? 'guideDone' : 'guideNext')}
                    </Button>
                    <Button size="sm" variant="quiet" onClick={skipTutorial}>{t(locale, 'guideSkip')}</Button>
                  </div>
                </Panel>
              )}
              {help && <PlayHelp />}
              <Panel className="game-board-frame min-h-0 p-0 overflow-hidden">
                <ApartmentView state={state} selected={selected} moveSource={moveSource}
                  locale={locale} onPick={pickRoom} />
              </Panel>
              <div className="game-tip">
                <span className="text-xl leading-5" aria-hidden="true">✦</span>
                <span>{moveSource !== null ? t(locale, 'moveHint') : locale === 'zh'
                  ? '点击公寓房间或使用左侧房号；相邻怪物会触发特别收益。'
                  : 'Tap an apartment room or use the room selector. Neighbors grant special bonuses.'}</span>
              </div>
              <StatusBar message={localizeGameText(error || state.notice, locale)} />
            </section>

            <aside className="game-ledger">
              <ManagementPanel />
              <div className="game-moon-card flex flex-col gap-3">
                <p className="game-eyebrow">☾ NIGHTLY COLLECTION</p>
                <p className="text-sm text-mist-400">{locale === 'zh'
                  ? '准备好了吗？今晚的租金与奇遇都由你决定。'
                  : 'Ready to close the books? Tonight brings rent and surprises.'}</p>
                <Button variant="primary" size="lg" fullWidth className="game-action-primary" disabled={!canSettle} onClick={nextDay}>
                  {t(locale, 'nextDay')}
                </Button>
                {state.over && (
                  <ResultCard outcome={state.outcome === 'win' ? 'win' : 'lose'}
                    locale={locale} notice={localizeGameText(state.notice, locale)} onReset={reset} />
                )}
              </div>
              <Panel className="game-log">
                <p className="game-panel-heading">{locale === 'zh' ? '公寓夜间手记' : 'Nightly journal'}</p>
                <LogList entries={state.log.map((entry) => localizeGameText(entry, locale))}
                  empty={t(locale, 'emptyLog')} />
              </Panel>
            </aside>
          </div>
        </main>

        <footer className="game-footer game-container">
          <p className="text-center text-xs text-mist-500">
            ✧ MONSTER APARTMENT · PHASER / NEXT.JS ✧ · {t(locale, saveAvailable ? 'saveReady' : 'saveUnavailable')}
          </p>
        </footer>
      </div>
    </div>
  );
}
