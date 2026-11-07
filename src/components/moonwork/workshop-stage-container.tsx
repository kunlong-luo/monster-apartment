'use client';
import {PanelBottomOpen,PanelBottomClose,Clapperboard,Grid3X3} from 'lucide-react';
import {useEffect,useSyncExternalStore} from 'react';
import {WorkshopCinematicStage} from './workshop-cinematic-stage';
import {presentWorkshopStations} from '../../../v2/src/workshop-station-presenter';

import {
  workshopRank,
  machineUpgradeQuote,
  machineLevel,
  machineSalvageRefund,
  workshopNextStep,
  workshopHint,
  WORKERS,
  MACHINES,
} from '../../../v2/src/workshop-engine';
import type {Craft, WorkerId, WorkshopState} from '../../../v2/src/workshop-engine';
import type {WorkshopAction,WorkshopPresentationMode} from '../../../v2/src/workshop-runtime-contract';

function subscribeWideStage(callback:()=>void){
  const query=window.matchMedia('(min-width:1100px) and (min-height:730px)');
  query.addEventListener('change',callback);
  return ()=>query.removeEventListener('change',callback);
}
function getWideStage(){
  return typeof window!=='undefined'&&
    window.matchMedia('(min-width:1100px) and (min-height:730px)').matches;
}

export function WorkshopStageContainer({
  world,onAction,
  chosenWorker,
  chosenMachine,
  movingFrom,
  selectedPlot,
  expandedConsole,
  onToggleConsole,
  sceneMode,
  onSceneModeChange,
  onPresentationModeChange,
}: {
  world: WorkshopState;
  expandedConsole:boolean;
  onToggleConsole:()=>void;
  sceneMode:'cinematic'|'grid';
  onSceneModeChange:(mode:'cinematic'|'grid')=>void;
  onPresentationModeChange:(mode:WorkshopPresentationMode)=>void;
  onAction:(action:WorkshopAction)=>void;
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
  const selectedStation=selectedPlot!==null
    ?presentWorkshopStations(world,selectedPlot).byPlot[selectedPlot]:null;
  const quote =
    selectedPlot !== null ? machineUpgradeQuote(world, selectedPlot) : null;
  const isMoving = movingFrom !== null;
  const hint = workshopHint(world);
  const desktop=useSyncExternalStore(subscribeWideStage,getWideStage,()=>false);
  // Construction, relocation, and worker assignments require exact tiles.
  // The cinematic view returns automatically after the pending task completes.
  const showCinematic=desktop&&sceneMode==='cinematic'&&
    !chosenWorker&&!chosenMachine&&!isMoving;
  // The actual responsive view, not a stale preference, controls WebGL.
  useEffect(()=>{
    onPresentationModeChange(showCinematic?'cinematic':'grid');
  },[showCinematic,onPresentationModeChange]);

  const selectedText = chosenWorker
    ? '待派工：' + WORKERS[chosenWorker].zh
    : chosenMachine
    ? '待建造：' + MACHINES[chosenMachine].zh
    : isMoving
    ? '移动设备：再选一个空格'
    : selectedPlot !== null
    ? '选中 ' + String(selectedPlot + 1).padStart(2, '0') + ' 号地块 · ' + workshopNextStep(world)
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

  // A single set of action nodes moves into the scenic context when selected;
  // never expose two simultaneous Upgrade / Salvage buttons for one machine.
  const selectedActions=<>
    <button
      type="button" id="salvage" data-testid="v2-salvage"
      onClick={()=>onAction({type:'salvage'})}
      hidden={!selectedTile}
      data-tooltip="只返还设备原价的 60%，已储存材料、升级与派工不会保留"
      className="workshop-selected-action shrink-0 rounded-md border border-gothic-brass/70 bg-gothic-panel/80 px-2 py-1 text-[10px] text-gothic-muted hover:border-gothic-glow hover:text-gothic-ivory"
    >拆除返还 ✦{machineSalvageRefund(selectedTile)}</button>
    <button
      type="button" id="upgrade" data-testid="v2-upgrade"
      onClick={()=>onAction({type:'upgrade'})}
      hidden={!upgradeVisible}
      disabled={upgradeDisabled}
      data-tooltip="等级越高，每班水汽、孢子或晶核产量越多"
      aria-label="设备升级"
      className="workshop-selected-action"
    >{upgradeText}</button>
  </>;

  return (
    <div className="world" aria-label="生产与建设画布区域">
      <div className="stage-label">
        <span>{showCinematic?'月光工坊 · 生产全景':'生产与建设 · 15 格工位'}</span>
        <small id="rank" data-testid="v2-rank">
          {rankText}
        </small>
        <div className="workshop-scene-choices" role="group" aria-label="工坊画面模式">
          <button type="button" aria-pressed={showCinematic}
            data-testid="workshop-view-cinematic"
            onClick={()=>onSceneModeChange('cinematic')}>
            <Clapperboard aria-hidden="true" size={13}/>生产全景
          </button>
          <button type="button" aria-pressed={!showCinematic}
            data-testid="workshop-view-grid"
            onClick={()=>onSceneModeChange('grid')}>
            <Grid3X3 aria-hidden="true" size={13}/>精密建造
          </button>
        </div>
        <button type="button" onClick={onToggleConsole}
          aria-pressed={!expandedConsole} aria-label={expandedConsole?'切换到场景优先布局':'展开详细调度面板'}
          data-testid="workshop-stage-layout-toggle"
          className="workshop-stage-layout-toggle">
          {expandedConsole?<PanelBottomClose aria-hidden="true" size={14}/>:<PanelBottomOpen aria-hidden="true" size={14}/>}
          {expandedConsole?'场景优先':'详细调度'}
        </button>
      </div>

      <div className="workshop-stage-composition"
        data-testid="workshop-stage-composition"
        data-view={showCinematic?'cinematic':'grid'}
        data-selected={showCinematic&&Boolean(selectedTile)?'true':'false'}>
        <div
          id="stage"
          data-testid="v2-stage"
          aria-label="PixiJS WebGL 工坊场景：点击设备或空地进行操作"
        ></div>
        {showCinematic&&<WorkshopCinematicStage world={world}
          selectedPlot={selectedPlot} onAction={onAction}
          onOpenGrid={()=>onSceneModeChange('grid')}/>}
        {showCinematic&&selectedTile&&selectedStation&&
          <aside className="workshop-context" data-testid="workshop-context-panel"
            aria-label="当前设备情境操作">
            <div className="workshop-context__eyebrow">SELECTED STATION · {String(selectedStation.plot+1).padStart(2,'0')}</div>
            <strong>{MACHINES[selectedStation.machine.craft].zh} · Lv.{selectedStation.level}</strong>
            <span>{selectedStation.signal.state==='working'?'生产运行中':
              selectedStation.signal.state==='blocked'?'原料供应受阻':'等待工匠派驻'}</span>
            <span>工匠：{selectedStation.machine.worker?
              WORKERS[selectedStation.machine.worker].zh:'尚未派驻'} · 库存 {selectedStation.machine.stored}</span>
            <div className="workshop-context__actions">{selectedActions}
              {!expandedConsole&&<button type="button" onClick={onToggleConsole}
                data-testid="workshop-context-manage">派工与设备管理</button>}
            </div>
          </aside>}

      </div>
      <span className="sr-only" data-testid="v2-guide-instruction" aria-live="polite">
        {world.completed===0&&hint.target!==null
          ?'操作提示：目标 '+String(hint.target+1).padStart(2,'0')+' 号地块。'
          :''}
      </span>

      <div className="selection">
        <span id="selected" data-testid="v2-next-step" data-tooltip={selectedText}>{selectedText}</span>
        {!showCinematic&&selectedActions}
      </div>
      <p id="status" data-testid="v2-status" role="status"
        className="min-h-7 shrink-0 border-t border-gothic-brass/30 bg-gothic-panel/85 px-3 py-1 text-[11px] leading-5 text-gothic-muted data-[tone=bad]:text-rose-200 data-[tone=good]:text-emerald-200"
      />
    </div>
  );
}
