'use client';

import { useEffect, useState } from 'react';
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

type MobilePanel = 'recruit' | 'rooms' | 'manage' | 'log';

export function GameScreen() {
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>('recruit');
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

  const mobileTabs: Array<{ id: MobilePanel; zh: string; en: string; icon: string }> = [
    { id: 'recruit', zh: '招募', en: 'Recruit', icon: '✦' },
    { id: 'rooms', zh: '房间', en: 'Rooms', icon: '⌂' },
    { id: 'manage', zh: '经营', en: 'Manage', icon: '◈' },
    { id: 'log', zh: '手记', en: 'Journal', icon: '☾' },
  ];

  return (
    <div className="game-shell font-sans text-mist-300 antialiased">
      <div className="game-page-layer">
        <header className="game-masthead game-container">
          <GameHeader helpOpen={help} locale={locale} onSetLocale={setLocale}
            onToggleHelp={toggleHelp} onReset={reset} onReplayTutorial={replayTutorial}
            day={state.day} coins={state.coins} />
        </header>

        <main className="game-container game-main">
          <div className="game-layout">
            <aside className={'game-roster ' + (mobilePanel === 'recruit' || mobilePanel === 'rooms' ? '' : 'game-mobile-hidden')}
              aria-label={locale === 'zh' ? '租客与房间操作' : 'Tenants and rooms'}>
              <div className="game-mobile-pane" data-selected={mobilePanel === 'rooms'}>
                <RoomPicker rooms={state.rooms} selected={selected} moveSource={moveSource}
                  disabled={state.over} onPick={pickRoom} />
                <div className="game-move-controls">
                  <Button variant="secondary" size="sm" fullWidth
                    disabled={state.over || selected === null || !state.rooms[selected] || moveSource !== null}
                    onClick={beginMove}>{t(locale, 'move')}</Button>
                  {moveSource !== null && (
                    <Button variant="quiet" size="sm" fullWidth onClick={cancelMove}>
                      {t(locale, 'cancelMove')}
                    </Button>
                  )}
                </div>
              </div>
              <div className="game-mobile-pane game-hire-pane" data-selected={mobilePanel === 'recruit'}>
                <TenantList disabled={state.over || selected === null} onRecruit={recruit} />
              </div>
            </aside>

            <section className="game-stage" data-testid="apartment-stage">
              <div className="game-moon-card game-stage-heading">
                <div className="min-w-0">
                  <p className="game-eyebrow">✧ MIDNIGHT RESIDENCE ✧</p>
                  <h2 className="game-section-title">{locale === 'zh'
                    ? '今夜，谁住进公寓？' : 'Who moves in tonight?'}</h2>
                </div>
                <span className="game-day-chip">☾ {locale === 'zh'
                  ? '第 ' + state.day + ' / 5 夜' : 'NIGHT ' + state.day + ' / 5'}</span>
              </div>
              {tutorialActive && (
                <div className="game-tutorial-banner" role="note" aria-label={t(locale, 'guideTitle')}>
                  <div className="flex-1 min-w-0">
                    <strong className="text-gold-200 text-xs">✦ {t(locale, 'guideTitle')} · {tutorialStep + 1}/4</strong>
                    <p className="text-xs text-mist-300 leading-snug">{t(locale, tutorialKeys[tutorialStep])}</p>
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    <Button size="sm" variant="primary" onClick={nextTutorial}>
                      {t(locale, tutorialStep === 3 ? 'guideDone' : 'guideNext')}
                    </Button>
                    <Button size="sm" variant="quiet" onClick={skipTutorial}>{t(locale, 'guideSkip')}</Button>
                  </div>
                </div>
              )}
              {help && (
                <div className="game-help-drawer">
                  <PlayHelp />
                </div>
              )}
              <div className="game-board-frame">
                <div className="game-board-inner">
                  <ApartmentView state={state} selected={selected} moveSource={moveSource}
                    locale={locale} onPick={(index) => {
                      pickRoom(index);
                      if (moveSource === null && !state.over) setMobilePanel('recruit');
                    }} />
                </div>
              </div>
              <div className="game-stage-foot">
                <span>{moveSource !== null
                  ? t(locale, 'moveHint')
                  : locale === 'zh' ? '点房间 · 招募租客 · 经营五夜'
                    : 'Choose rooms · Recruit · Survive five nights'}</span>
                <StatusBar message={localizeGameText(error || state.notice, locale)} />
              </div>
            </section>

            <aside className={'game-ledger ' + (mobilePanel === 'manage' || mobilePanel === 'log' ? '' : 'game-mobile-hidden')}
              aria-label={locale === 'zh' ? '经营与结算' : 'Management and settlement'}>
              <div className="game-mobile-pane game-manage-pane" data-selected={mobilePanel === 'manage'}>
                <EconomyPanel />
                <ManagementPanel />
                <div className="game-night-action">
                  <Button variant="primary" size="lg" fullWidth className="game-action-primary"
                    disabled={!canSettle} onClick={nextDay}>
                    ☾ {t(locale, 'nextDay')}
                  </Button>
                </div>
                {state.over && (
                  <ResultCard outcome={state.outcome === 'win' ? 'win' : 'lose'}
                    locale={locale} notice={localizeGameText(state.notice, locale)} onReset={reset} />
                )}
              </div>
              <div className="game-mobile-pane game-log-pane" data-selected={mobilePanel === 'log'}>
                <Panel className="game-log">
                  <p className="game-panel-heading">
                    {locale === 'zh' ? '公寓夜间手记' : 'Nightly journal'}
                  </p>
                  <LogList entries={state.log.map((entry) => localizeGameText(entry, locale))}
                    empty={t(locale, 'emptyLog')} />
                </Panel>
              </div>
            </aside>
          </div>
        </main>

        <nav className="game-mobile-tabs" role="tablist"
          aria-label={locale === 'zh' ? '游戏操作面板' : 'Game panels'}>
          {mobileTabs.map((tab) => (
            <button key={tab.id} type="button" role="tab"
              aria-selected={mobilePanel === tab.id}
              className={mobilePanel === tab.id ? 'is-current' : ''}
              onClick={() => setMobilePanel(tab.id)}>
              <span aria-hidden="true">{tab.icon}</span>
              <span>{locale === 'zh' ? tab.zh : tab.en}</span>
            </button>
          ))}
        </nav>
        <footer className="game-footer game-container">
          ✧ MONSTER APARTMENT · {t(locale, saveAvailable ? 'saveReady' : 'saveUnavailable')} ✧
        </footer>
      </div>
    </div>
  );
}
