import { lazy, Suspense, useMemo } from 'react';
import { TENANTS, TENANT_IDS, TARGET_COINS, LAST_DAY, synergyDetails } from './core/engine.js';
import { useGameStore } from './store/useGameStore';

// Phaser is ~1.5 MB; keep it out of the first paint so the React shell shows instantly.
const GameBoard = lazy(() => import('./components/GameBoard'));

export default function App() {
const { state, selected, moveSource, error, help, pickRoom, recruit, beginMove, cancelMove, nextDay, reset, toggleHelp } = useGameStore();
const occupant = selected===null ? null : state.rooms[selected];
const occupied = state.rooms.filter(Boolean).length;
const bonus = useMemo(()=>synergyDetails(state.rooms),[state.rooms]);
  return <div className="app">
    <header className="topbar">
      <div className="brand"><span className="brand-mark">✦</span><div><strong>怪物租客公寓</strong><small>MONSTER APARTMENT / V0.1.1</small></div></div>
      <div className="header-actions"><button className="quiet" onClick={toggleHelp}>{help?'关闭说明':'玩法说明'}</button><button className="quiet" onClick={reset}>↻ 新的一局</button></div>
    </header>
    <main className="layout">
      <section className="left-panel">
        <p className="eyebrow">经营概况 · DAY {state.day}/{LAST_DAY}</p>
        <div className="stats"><div className="stat"><small>金币</small><strong>◈ {state.coins}</strong></div><div className="stat"><small>满意度</small><strong>{state.satisfaction}%</strong></div></div>
        <div className="progress"><div style={{width:`${Math.min(100,Math.max(0,state.coins/TARGET_COINS*100))}%`}} /></div>
        <p className="hint">胜利目标：第 5 天结束金币 ≥ {TARGET_COINS}，满意度 ≥ 55。</p>
        <div className="section-heading"><h2>入住管理</h2><span>已选 {selected===null?'无':selected+1+' 号房'}</span></div>
        <div className="room-picker" role="group" aria-label="选择房间">
          {state.rooms.map((_, i)=><button
            key={i}
            type="button"
            className={`room-chip${selected===i?' active':''}${moveSource===i?' moving':''}`}
            aria-pressed={selected===i}
            aria-label={`${i+1} 号房${state.rooms[i]?'（已入住）':'（空房）'}`}
            disabled={state.over}
            onClick={()=>pickRoom(i)}
          >{i+1}</button>)}
        </div>
        <div className="tenant-list">
          {TENANT_IDS.map((id)=>{const t=TENANTS[id];return <button className="tenant" disabled={state.over} onClick={()=>recruit(id)} key={id}>
            <span className="tenant-icon" style={{color:`#${t.color.toString(16).padStart(6,'0')}`}}>{t.icon}</span>
            <span className="tenant-label"><strong>{t.name}</strong><small>{t.description}</small></span>
            <span className="tenant-cost"><strong>-{t.price}</strong><small>租金 +{t.rent}</small></span>
          </button>;})}
        </div>
        <p className="hint">招募只能入住空房；已入住房间可以免费搬家或与别的房间互换。</p>
        <button className="secondary full" disabled={selected===null || !occupant || state.over} onClick={beginMove}>⇄ {moveSource!==null?'请选择目标房间':'移动 / 交换当前租客'}</button>
        {moveSource!==null && <button className="text-button" onClick={cancelMove}>取消搬家</button>}
      </section>
      <section className="center-panel">
        {help && <div className="help"><strong>怎么玩？</strong><br/>① 选房间 → 招募租客。② 调整相邻关系获取组合奖励。③ 点击“结束今天”收取租金并处理事件。④ 经营 5 天完成目标。夜间事件是固定顺序，测试更容易复现。</div>}
        <Suspense fallback={<div className="game-canvas loading">正在加载公寓地图…</div>}>
          <GameBoard state={state} selected={selected} moveSource={moveSource} onPick={pickRoom}/>
        </Suspense>
        <div className="status" role="status"><span className="status-dot" />{error || state.notice}</div>
      </section>
      <aside className="right-panel">
        <p className="eyebrow">MANAGEMENT</p><h2>每日经营</h2>
        <div className="metric"><span>相邻组合奖励</span><strong className={bonus.coins<0?'negative':'positive'}>{bonus.coins>=0?'+':''}{bonus.coins} / 天</strong></div>
        <div className="metric"><span>已入住</span><strong>{occupied} / 6</strong></div>
        <div className="metric"><span>每晚维护费</span><strong>{occupied ? -occupied*3 : 0}</strong></div>
        <div className="bonus-list">{bonus.messages.length ? bonus.messages.map((m,i)=><p key={i}>{m}</p>) : <p>将不同住户安排在相邻房间，可以解锁隐藏组合。</p>}</div>
        <button className="primary full" disabled={state.over} onClick={nextDay}>☾ 结束今天 · 结算</button>
        {state.over && <div className={`result ${state.outcome==='win'?'good':''}`}><strong>{state.outcome==='win'?'🎉 经营成功':'本局未达标'}</strong><p>{state.notice}</p><button className="secondary full" onClick={reset}>再玩一局</button></div>}
        <div className="section-heading"><h2>经营日志</h2><span>{state.history.length} / 5</span></div>
        <div className="log" aria-live="polite">{[...state.log].reverse().slice(0,8).map((l,i)=><p key={i}>{l}</p>)}</div>
      </aside>
    </main>
    <footer className="footer">V0.1.1 Tech Refresh · 单人离线版 · 本版本不收集个人数据 · 由 Phaser / React / TypeScript 构建</footer>
  </div>;
}
