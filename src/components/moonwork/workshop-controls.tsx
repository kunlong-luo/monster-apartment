'use client';

import {useState} from 'react';
import Image from 'next/image';
import {WorkerArtwork} from './worker-artwork';
import {WORKERS, MACHINES} from '../../../v2/src/workshop-engine';
import type {WorkshopState, Machine, Craft, WorkerId} from '../../../v2/src/workshop-engine';
import type {WorkshopAction} from '../../../v2/src/workshop-runtime-contract';
import wellArt from '../../../v2/art/well-art-review.avif';
import gardenArt from '../../../v2/art/garden-art-review.avif';
import kilnArt from '../../../v2/art/kiln-art-review.avif';

const workers = ['brook', 'fern', 'cinder'] as const;
const machines = ['well', 'garden', 'kiln'] as const;
const glyphs: Record<Craft, string> = {well: '◉', garden: '❀', kiln: '⬡'};

const MACHINE_IMAGES = {
  well: wellArt,
  garden: gardenArt,
  kiln: kilnArt,
};

const MACHINE_OUTPUTS: Record<Craft, {name: string; icon: string; count: number}> = {
  well: {name: '清水', icon: '💧', count: 2},
  garden: {name: '孢子纤维', icon: '🌿', count: 2},
  kiln: {name: '精制晶核', icon: '◆', count: 1},
};

export function WorkshopControls({
  world,
  chosenWorker,
  chosenMachine,
  selectedTile,
  isMoving,
  onAction,
}: {
  world: WorkshopState;
  onAction: (action: WorkshopAction) => void;
  chosenWorker: WorkerId | null;
  chosenMachine: Craft | null;
  selectedTile: Machine | null;
  isMoving: boolean;
}) {
  const [activeTab, setActiveTab] = useState<'devices' | 'materials' | 'products'>('devices');
  const [logFilter, setLogFilter] = useState<'all' | 'output' | 'alert'>('all');
  const [activeConsole,setActiveConsole]=useState<'equipment'|'roster'|'logs'>('roster');

  // This action only selects a worker. The actual assignment happens when
  // the player clicks a machine on the canvas; never claim it auto-assigned.
  const selectAvailableWorker=()=>{
    const available=workers.find(id=>!world.tiles.some(tile=>tile?.worker===id));
    if(available)onAction({type:'choose-worker',worker:available});
  };

  // Build live production log entries from world state and reports
  const report = world.last;
  const waterStock=world.tiles.reduce((total,tile)=>total+(tile?.craft==='well'?(tile.stored??0):0),0);
  const fiberStock=world.tiles.reduce((total,tile)=>total+(tile?.craft==='garden'?(tile.stored??0):0),0);
  const logs = [
    {
      time: '本班次',
      type: 'output',
      icon: '◆',
      text: report?.cores && report.cores > 0 ? `生产完成：获得 精制晶核 x${report.cores}` : '晶核熔炉等待原料输入中',
      tone: 'good',
    },
    {
      time: '本班次',
      type: 'output',
      icon: '🌿',
      text: report?.fiber && report.fiber > 0 ? `温室培育产出：获得 孢子纤维 x${report.fiber}` : '银叶苗床持续光合作用',
      tone: 'good',
    },
    {
      time: '本班次',
      type: 'output',
      icon: '💧',
      text: report?.water && report.water > 0 ? `水汽泵抽提：产出 清水 x${report.water}` : '月井地下水脉充盈',
      tone: 'good',
    },
    ...(report?.blocked && report.blocked.length > 0
      ? report.blocked.map((b, idx) => ({
          time: `异常 ${idx+1}`,
          type: 'alert',
          icon: '⚠',
          text: b.includes(':water') ? '银叶苗床告警：水汽供应不足，需靠近水泵' : '夜光熔炉告警：原料短缺，需两份孢子炼核',
          tone: 'bad',
        }))
      : [
          {
            time: '本班次',
            type: 'all',
            icon: '✦',
            text: world.completed > 0 ? `契约达成结算：工坊总交付 ${world.completed} 单` : '工坊处于第一生产周期，排班稳定',
            tone: 'neutral',
          },
        ]),
  ];

  const filteredLogs = logs.filter(
    (item) => logFilter === 'all' || item.type === logFilter || (logFilter === 'output' && item.tone === 'good'),
  );

  return (
    <section className="console gothic-console-3col" aria-label="工坊底部综合调度控制台"
      data-testid="workshop-console" data-mobile-panel={activeConsole}>
      <nav className="workshop-console-tabs" aria-label="工坊调度栏目">
        {([{id:'equipment',label:'设备'},{id:'roster',label:'派工'},{id:'logs',label:'生产'}] as const)
          .map(tab=><button type="button" key={tab.id}
            data-testid={'console-tab-'+tab.id} aria-pressed={activeConsole===tab.id}
            onClick={()=>setActiveConsole(tab.id)}
            className={activeConsole===tab.id?'is-active':''}>{tab.label}</button>)}
      </nav>
      {/* 栏目 1：设备库与建设卡片 */}
      <div className="console-panel gothic-panel-col gothic-panel-equipment" data-testid="console-equipment">
        <div className="panel-head flex items-center justify-between border-b border-gothic-brass/35 pb-2">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('devices')}
              className={`rounded-md px-2 py-0.5 text-xs font-bold transition-colors ${
                activeTab === 'devices'
                  ? 'bg-gothic-wine text-gothic-glow shadow-sm'
                  : 'text-gothic-muted hover:text-gothic-ivory'
              }`}
            >
              设备 ({machines.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('materials')}
              className={`rounded-md px-2 py-0.5 text-xs font-bold transition-colors ${
                activeTab === 'materials'
                  ? 'bg-gothic-wine text-gothic-glow shadow-sm'
                  : 'text-gothic-muted hover:text-gothic-ivory'
              }`}
            >
              材料 (2)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('products')}
              className={`rounded-md px-2 py-0.5 text-xs font-bold transition-colors ${
                activeTab === 'products'
                  ? 'bg-gothic-wine text-gothic-glow shadow-sm'
                  : 'text-gothic-muted hover:text-gothic-ivory'
              }`}
            >
              成品 (1)
            </button>
          </div>
          <span className="text-[10px] text-gothic-muted">✦ 建造与升级</span>
        </div>

        {activeTab === 'devices' && (
          <div id="catalog" className="options workshop-machine-grid mt-2 grid grid-cols-3 gap-2">
            {machines.map((id) => {
              const info = MACHINES[id];
              const isSelected = chosenMachine === id;
              const output = MACHINE_OUTPUTS[id];
              const countOnField = world.tiles.filter((t) => t?.craft === id).length;
              const isWorking = countOnField > 0;

              return (
                <button
                  key={id}
                  type="button"
                  data-build={id}
                  data-testid={'v2-build-' + id}
                  onClick={() => onAction({type:'choose-machine',machine:id})}
                  aria-pressed={isSelected}
                  aria-label={'建设 ' + info.zh}
                  disabled={world.coins < info.cost && !isSelected}
                  className={`machine-card group relative flex flex-col justify-between overflow-hidden rounded-xl border bg-gothic-panel/90 p-1.5 text-left transition-all hover:border-gothic-glow focus-visible:outline-2 focus-visible:outline-gothic-glow disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none ${
                    isSelected
                      ? 'active border-gothic-glow bg-gothic-wine/90 shadow-[0_0_16px_rgba(240,197,136,0.35)]'
                      : 'border-gothic-brass/65 hover:bg-gothic-wine/40'
                  }`}
                >
                  {/* Equipment Thumbnail Art */}
                  <div className="relative h-14 w-full overflow-hidden rounded-lg bg-[#140c16] border border-gothic-brass/30">
                    <Image
                      src={MACHINE_IMAGES[id]}
                      alt={info.zh}
                      fill
                      className="object-cover object-center transition-transform group-hover:scale-105"
                      sizes="120px"
                    />
                    <span className="absolute left-1 top-1 rounded bg-black/75 px-1 py-0.5 text-[8px] font-bold text-gothic-gold">
                      已建 {countOnField}
                    </span>
                    <span
                      className={`absolute right-1 top-1 rounded px-1 py-0.5 text-[8px] font-bold ${
                        isWorking ? 'bg-emerald-950/85 text-emerald-300' : 'bg-amber-950/85 text-amber-300'
                      }`}
                    >
                      {isWorking ? '已建造' : '未建造'}
                    </span>
                  </div>

                  {/* Info Header */}
                  <div className="mt-1 flex items-center justify-between">
                    <strong className="truncate text-xs font-bold text-gothic-ivory">
                      {info.zh}
                    </strong>
                    <span className="text-[11px] text-gothic-gold" aria-hidden="true">
                      {glyphs[id]}
                    </span>
                  </div>

                  {/* Production Output & Cost Tag */}
                  <div className="mt-0.5 flex items-center justify-between text-[10px] text-gothic-muted">
                    <span className="truncate">
                      产出: {output.icon} {output.name}
                    </span>
                  </div>

                  {/* Cost / Action Button */}
                  <div className="mt-1 flex items-center justify-between rounded-md bg-black/40 px-1.5 py-0.5 text-[10px]">
                    <span className="tabular-nums text-gothic-gold">✦ {info.cost}</span>
                    <span className="text-[9px] font-bold text-gothic-ivory group-hover:text-gothic-glow">
                      {isSelected ? '取消选定' : countOnField > 0 ? '添置 +' : '建设 ↗'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {activeTab === 'materials' && (
          <div className="mt-2 space-y-1.5 text-xs text-gothic-muted">
            <div className="flex items-center justify-between rounded-lg border border-gothic-brass/40 bg-black/30 p-2">
              <div className="flex items-center gap-2">
                <span className="text-base">💧</span>
                <div>
                  <strong className="text-gothic-ivory">地下泉水</strong>
                  <p className="text-[10px] text-gothic-muted">由水汽泵持续凝结，用于温室灌溉</p>
                </div>
              </div>
              <span className="shrink-0 font-bold tabular-nums text-gothic-gold">储量 {waterStock}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-gothic-brass/40 bg-black/30 p-2">
              <div className="flex items-center gap-2">
                <span className="text-base">🌿</span>
                <div>
                  <strong className="text-gothic-ivory">银叶孢子纤维</strong>
                  <p className="text-[10px] text-gothic-muted">由银叶苗床培育，熔炉炼核必需原料</p>
                </div>
              </div>
              <span className="shrink-0 font-bold tabular-nums text-gothic-gold">储量 {fiberStock}</span>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="mt-2 space-y-1.5 text-xs text-gothic-muted">
            <div className="flex items-center justify-between rounded-lg border border-gothic-brass/40 bg-black/30 p-2">
              <div className="flex items-center gap-2">
                <span className="text-base">◆</span>
                <div>
                  <strong className="text-gothic-ivory">精制夜光晶核</strong>
                  <p className="text-[10px] text-gothic-muted">用于交付每日委托与月纱魔女特殊契约</p>
                </div>
              </div>
              <span className="font-bold text-gothic-gold">存量: {world.warehouse.core} 枚</span>
            </div>
          </div>
        )}
      </div>

      {/* 栏目 2：工匠派工管理 */}
      <div className="console-panel gothic-panel-col gothic-panel-roster" data-testid="console-roster">
        <div className="panel-head flex items-center justify-between border-b border-gothic-brass/35 pb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-gothic-ivory">⚙ 工匠派工</span>
          </div>
          <button type="button" onClick={selectAvailableWorker}
            disabled={!workers.some(id=>!world.tiles.some(tile=>tile?.worker===id))}
            data-testid="workshop-pick-idle-worker"
            className="min-h-9 shrink-0 rounded-full border border-gothic-brass/60 bg-gothic-panel/80 px-3 text-xs font-semibold text-gothic-ivory hover:border-gothic-glow disabled:opacity-45">
            选择空闲工匠
          </button>
        </div>

        <p className="workshop-roster-hint">选择工匠后，点击场景中的设备完成派工；换岗也按此操作。</p>
        <div id="actions" className="options workshop-worker-list mt-2" role="group" aria-label="三名工匠的当前岗位">
          {workers.map((id) => {
            const profile = WORKERS[id];
            const occupied = world.tiles.findIndex((tile) => tile?.worker === id);
            const isSelected = chosenWorker === id;
            const assignedMachine = occupied >= 0 ? world.tiles[occupied] : null;

            return (
              <button
                key={id}
                type="button"
                data-worker={id}
                data-testid={'v2-worker-' + id}
                onClick={() => onAction({type:'choose-worker',worker:id})}
                aria-pressed={isSelected}
                aria-label={'选择工匠 ' + profile.zh}
                className={`worker group flex items-center justify-between rounded-xl border p-2.5 text-gothic-ivory transition-all hover:border-gothic-glow focus-visible:outline-2 focus-visible:outline-gothic-glow motion-reduce:transition-none ${
                  isSelected
                    ? 'active border-gothic-glow bg-gothic-wine/90 shadow-[0_0_14px_rgba(240,197,136,0.3)]'
                    : 'border-gothic-brass/55 bg-gothic-panel/80 hover:bg-gothic-wine/40'
                }`}
              >
                {/* Avatar & Role Info */}
                <div className="worker-identity flex min-w-0 items-center gap-3">
                  <span className="worker-miniature block size-9 shrink-0 overflow-hidden rounded-full border border-gothic-brass/70 bg-[#22374a] shadow-inner">
                    <WorkerArtwork id={id} name={profile.zh} compact />
                  </span>
                  <div className="min-w-0 text-left">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <strong className="text-xs font-bold text-gothic-ivory">{profile.zh}</strong>
                      <span className="rounded bg-black/50 px-1 py-0.2 text-[9px] text-gothic-muted">
                        Lv.30
                      </span>
                    </div>
                    <small className="block text-[10px] text-gothic-gold">
                      {assignedMachine ? MACHINES[assignedMachine.craft].zh : '待分配'}
                    </small>
                  </div>
                </div>

                {/* Status Tag & Operation Button */}
                <div className="worker-status flex shrink-0 items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                      occupied >= 0
                        ? 'border border-emerald-500/50 bg-emerald-950/80 text-emerald-300'
                        : 'border border-amber-500/50 bg-amber-950/80 text-amber-300'
                    }`}
                  >
                    {occupied >= 0 ? '工作中' : '空闲中'}
                  </span>
                  <span className="rounded-md border border-gothic-brass/50 bg-black/40 px-2 py-1 text-[10px] font-semibold text-gothic-ivory transition-colors group-hover:border-gothic-glow group-hover:text-gothic-glow">
                    {occupied >= 0 ? '换岗' : '派工'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 栏目 3：实时生产日志与快捷行动 */}
      <div className="console-panel gothic-panel-col gothic-panel-logs" data-testid="console-logs">
        <div className="panel-head flex items-center justify-between border-b border-gothic-brass/35 pb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-gothic-ivory">📜 生产日志</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setLogFilter('all')}
              className={`rounded px-1.5 py-0.5 text-[9px] font-bold transition-colors ${
                logFilter === 'all' ? 'bg-gothic-wine text-gothic-glow' : 'text-gothic-muted hover:text-gothic-ivory'
              }`}
            >
              全部
            </button>
            <button
              type="button"
              onClick={() => setLogFilter('output')}
              className={`rounded px-1.5 py-0.5 text-[9px] font-bold transition-colors ${
                logFilter === 'output' ? 'bg-gothic-wine text-gothic-glow' : 'text-gothic-muted hover:text-gothic-ivory'
              }`}
            >
              产出
            </button>
            <button
              type="button"
              onClick={() => setLogFilter('alert')}
              className={`rounded px-1.5 py-0.5 text-[9px] font-bold transition-colors ${
                logFilter === 'alert' ? 'bg-gothic-wine text-gothic-glow' : 'text-gothic-muted hover:text-gothic-ivory'
              }`}
            >
              告警
            </button>
          </div>
        </div>

        {/* Live Timeline List */}
        <div className="options workshop-log-list mt-2 flex min-h-0 flex-col gap-1 overflow-y-auto pr-0.5 scrollbar-thin">
          {filteredLogs.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-lg border border-gothic-brass/25 bg-black/35 px-2 py-1 text-[10.5px]"
            >
              <div className="flex items-center gap-1.5 truncate">
                <span className="text-[9px] text-gothic-muted">{item.time}</span>
                <span className="text-gothic-gold">{item.icon}</span>
                <span
                  className={`truncate ${
                    item.tone === 'good'
                      ? 'text-emerald-200'
                      : item.tone === 'bad'
                      ? 'text-rose-200 font-semibold'
                      : 'text-gothic-ivory'
                  }`}
                >
                  {item.text}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Production Shift & Move Actions */}
        <div className="main-actions mt-2 flex items-center gap-2">
          <button
            type="button"
            id="move"
            data-testid="v2-move"
            onClick={() => onAction({type:'toggle-move'})}
            disabled={!selectedTile && !isMoving}
            aria-pressed={isMoving}
            aria-label="移动机器设备"
            className={`move-btn flex-1 rounded-lg border px-2.5 py-1.5 text-center text-xs font-bold transition-all ${
              isMoving
                ? 'active border-gothic-glow bg-gothic-wine/90 text-gothic-glow shadow-[0_0_12px_rgba(240,197,136,0.3)]'
                : 'border-gothic-brass/70 bg-gothic-panel/90 text-gothic-ivory hover:border-gothic-glow hover:bg-gothic-wine/50 disabled:cursor-not-allowed disabled:opacity-40'
            }`}
          >
            <span>{isMoving ? '再选空格搬移' : '⚡ 调度机器 ↗'}</span>
          </button>

          <button
            type="button"
            id="shift"
            data-testid="v2-shift"
            onClick={() => onAction({type:'shift'})}
            aria-label="开始一天生产轮班"
            className="shift-btn flex-[1.4] rounded-lg border border-gothic-gold/80 bg-gradient-to-r from-gothic-gold via-[#e2b06e] to-gothic-brass px-3 py-1.5 text-center text-xs font-extrabold text-ink-950 shadow-md transition-all hover:brightness-110 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-gothic-glow motion-reduce:transition-none"
          >
            <span>▶ 开始生产轮班</span>
          </button>
        </div>
      </div>
    </section>
  );
}
