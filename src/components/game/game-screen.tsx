'use client';

import { useGameStore } from '@/store/game-store';
import { GameHeader } from './game-header';
import { EconomyPanel } from './economy-panel';
import { RoomPicker } from './room-picker';
import { TenantList } from './tenant-list';
import { ManagementPanel } from './management-panel';
import { BonusList } from './bonus-list';
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
    state,
    selected,
    moveSource,
    error,
    help,
    pickRoom,
    recruit,
    cancelMove,
    nextDay,
    reset,
    toggleHelp,
  } = useGameStore();

  const occupied = state.rooms.filter(Boolean).length;
  const canSettle = occupied > 0 && !state.over;

  return (
    <div className="min-h-screen bg-ink-950 font-sans text-mist-300 antialiased">
      <div className="radial-gradient-ellipse-at-45%-20% from-[#24425b] via-transparent to-transparent bg-no-repeat">
        <header className="max-w-[1470px] mx-auto px-4 sm:px-6 py-6 border-b border-ink-700">
          <GameHeader helpOpen={help} onToggleHelp={toggleHelp} onReset={reset} />
        </header>

        <main className="max-w-[1470px] mx-auto px-4 sm:px-6 py-6">
          <div
            className={cn(
              'grid gap-4',
              'grid-cols-1',
              'lg:grid-cols-[minmax(0,296px)_minmax(0,1fr)_minmax(0,298px)]',
              'lg:items-start',
            )}
          >
            {/* Left Column */}
            <aside className="min-w-0">
              <EconomyPanel />
              <RoomPicker
                rooms={state.rooms}
                selected={selected}
                moveSource={moveSource}
                disabled={state.over}
                onPick={pickRoom}
              />
              <TenantList disabled={state.over || selected === null} onRecruit={recruit} />
              {moveSource !== null && (
                <div className="mt-4">
                  <Button variant="quiet" fullWidth onClick={cancelMove}>
                    取消搬家
                  </Button>
                </div>
              )}
            </aside>

            {/* Center Column */}
            <section className="min-w-0 flex flex-col gap-4">
              {help && <PlayHelp />}
              <Panel className="flex-1 min-h-[360px] p-0 overflow-hidden">
                <ApartmentView
                  state={state}
                  selected={selected}
                  moveSource={moveSource}
                  onPick={pickRoom}
                />
              </Panel>
              <StatusBar message={error || state.notice} />
            </section>

            {/* Right Column */}
            <aside className="min-w-0 flex flex-col gap-4">
              <ManagementPanel />
              <BonusList messages={[]} />
              <div className="flex flex-col gap-3">
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  disabled={!canSettle}
                  onClick={nextDay}
                >
                  结束今天
                </Button>
                {state.over && (
                  <ResultCard
                    outcome={state.outcome === 'win' ? 'win' : 'lose'}
                    notice={state.notice}
                    onReset={reset}
                  />
                )}
              </div>
              <Panel className="flex-1 min-h-0">
                <LogList entries={state.log} empty="暂无日志" />
              </Panel>
            </aside>
          </div>
        </main>

        <footer className="max-w-[1470px] mx-auto px-4 sm:px-6 py-6 border-t border-ink-700">
          <p className="text-center text-xs text-mist-500">
            Phaser / React / TypeScript
          </p>
        </footer>
      </div>
    </div>
  );
}