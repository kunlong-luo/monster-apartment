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
import { cn } from '@/components/ui/cn';

export function GameScreen() {
  const {
    state, selected, moveSource, error, help, locale, tutorialActive, tutorialStep, saveAvailable,
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
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale === 'en' ? 'en' : 'zh-CN';
  }, [locale]);

  const occupied = state.rooms.filter(Boolean).length;
  const canSettle = occupied > 0 && !state.over;
  const tutorialKeys = ['guide1', 'guide2', 'guide3', 'guide4'] as const;

  return (
    <div className="min-h-screen bg-ink-950 font-sans text-mist-300 antialiased">
      <div className="radial-gradient-ellipse-at-45%-20% from-[#24425b] via-transparent to-transparent bg-no-repeat">
        <header className="max-w-[1470px] mx-auto px-4 sm:px-6 py-6 border-b border-ink-700">
          <GameHeader helpOpen={help} locale={locale} onSetLocale={setLocale}
            onToggleHelp={toggleHelp} onReset={reset} onReplayTutorial={replayTutorial} />
        </header>

        <main className="max-w-[1470px] mx-auto px-4 sm:px-6 py-6">
          <div className={cn(
            'grid gap-4',
            'grid-cols-1',
            'lg:grid-cols-[minmax(0,296px)_minmax(0,1fr)_minmax(0,298px)]',
            'lg:items-start',
          )}>
            <aside className="min-w-0">
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

            <section className="min-w-0 flex flex-col gap-4">
              {tutorialActive && (
                <Panel className="border-mint-400/50 bg-ink-800">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <strong className="text-mint-300">{t(locale, 'guideTitle')}</strong>
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
              <Panel className="flex-1 min-h-[360px] p-0 overflow-hidden">
                <ApartmentView state={state} selected={selected} moveSource={moveSource}
                  locale={locale} onPick={pickRoom} />
              </Panel>
              <StatusBar message={localizeGameText(error || state.notice, locale)} />
            </section>

            <aside className="min-w-0 flex flex-col gap-4">
              <ManagementPanel />
              <div className="flex flex-col gap-3">
                <Button variant="primary" size="lg" fullWidth disabled={!canSettle} onClick={nextDay}>
                  {t(locale, 'nextDay')}
                </Button>
                {state.over && (
                  <ResultCard outcome={state.outcome === 'win' ? 'win' : 'lose'}
                    locale={locale} notice={localizeGameText(state.notice, locale)} onReset={reset} />
                )}
              </div>
              <Panel className="flex-1 min-h-0">
                <LogList entries={state.log.map((entry) => localizeGameText(entry, locale))}
                  empty={t(locale, 'emptyLog')} />
              </Panel>
            </aside>
          </div>
        </main>

        <footer className="max-w-[1470px] mx-auto px-4 sm:px-6 py-6 border-t border-ink-700">
          <p className="text-center text-xs text-mist-500">
            Phaser / Next.js / TypeScript · {t(locale, saveAvailable ? 'saveReady' : 'saveUnavailable')}
          </p>
        </footer>
      </div>
    </div>
  );
}
