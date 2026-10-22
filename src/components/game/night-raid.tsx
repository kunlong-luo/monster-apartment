'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '@/store/game-store';
import { SPIRIT_BY_ID, QUALITY_LABELS } from '@/core/spirit-collection';
import type { SpiritId } from '@/core/spirit-collection';
import { advanceRaid, beginRaid, castRaidSkill, deployToLane, prepareRaid, relocateRaid } from '@/core/night-raid';
import type { Lane, RaidState } from '@/core/night-raid';
import { SpiritPortrait } from './spirit-portrait';
import { RaidBattleCanvas } from './raid-battle-canvas';
import { Button } from '@/components/ui/button';

const LANES = [0, 1, 2] as const;
const zhLane = ['上路', '中路', '下路'];
const enLane = ['Upper', 'Middle', 'Lower'];

export function NightRaid({ onClose }: { onClose: () => void }) {
  const { state, collection, locale, claimRaidReward } = useGameStore();
  const [raid, setRaid] = useState<RaidState>(() => prepareRaid(collection));
  const [selected, setSelected] = useState<SpiritId | null>(() =>
    collection.equipped.find((id): id is SpiritId => id !== null) ??
    (Object.keys(collection.owned)[0] as SpiritId | undefined) ?? null);
  const [moving, setMoving] = useState<Lane | null>(null);
  const zh = locale === 'zh';
  const claimed = collection.claimedRaids?.includes(state.day) ?? false;
  const eligible = !state.over && !claimed;
  const owned = Object.keys(collection.owned).filter(
    (id): id is SpiritId => id in SPIRIT_BY_ID);
  const laneName = (lane: Lane) => (zh ? zhLane : enLane)[lane];

  useEffect(() => {
    if (raid.phase !== 'fighting') return;
    const interval = window.setInterval(() => {
      setRaid(current => advanceRaid(current, collection));
    }, 620);
    return () => window.clearInterval(interval);
  }, [raid.phase, collection]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { onClose(); return; }
      if (event.repeat || raid.phase !== 'fighting') return;
      if (['1','2','3'].includes(event.key)) {
        event.preventDefault();
        const lane = Number(event.key) - 1 as Lane;
        setRaid(current => castRaidSkill(current, lane, collection));
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [raid.phase, collection, onClose]);

  const actionLane = (lane: Lane) => {
    if (raid.phase === 'preparing') {
      setRaid(current => deployToLane(current, lane, selected, collection));
    } else if (raid.phase === 'fighting' && moving !== null) {
      setRaid(current => relocateRaid(current, moving, lane));
      setMoving(null);
    }
  };
  const outcome = raid.phase === 'won' || raid.phase === 'lost';
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-ink-950/95 p-2 sm:p-5"
      role="presentation">
      <section role="dialog" aria-modal="true" aria-label={zh ? '星域入侵防线' : 'Starfall Defense'}
        data-testid="night-raid" className="night-raid w-full max-w-4xl max-h-[96dvh] overflow-hidden flex flex-col
          rounded-2xl border border-gold-300/50 bg-ink-900 shadow-2xl">
        <header className="shrink-0 flex justify-between gap-2 items-center border-b border-line px-3 py-2 sm:px-5 sm:py-3">
          <div>
            <p className="text-[10px] tracking-widest text-gold-300">TACTICAL DEFENSE · NIGHT {state.day}</p>
            <h2 className="text-lg sm:text-xl font-extrabold text-mist-100">
              {zh ? '星域入侵 · 三路守卫战' : 'Starfall Defense · Three Lanes'}
            </h2>
          </div>
          <Button size="sm" variant="quiet" onClick={onClose} aria-label={zh ? '退出防线' : 'Exit defense'}>✕</Button>
        </header>
        <div className="shrink-0 grid grid-cols-3 gap-1.5 px-3 py-2 text-center text-xs sm:text-sm" data-testid="raid-stats">
          <div className="rounded-lg bg-ink-800 py-1.5">
            <span className="text-mist-400">{zh ? '核心耐久' : 'Core HP'} </span>
            <strong className={raid.baseHp <= 3 ? 'text-danger-300' : 'text-mint-300'}>{raid.baseHp}</strong>
          </div>
          <div className="rounded-lg bg-ink-800 py-1.5">
            <span className="text-mist-400">{zh ? '战技能量' : 'Energy'} </span>
            <strong className="text-gold-200">{raid.energy}/8</strong>
          </div>
          <div className="rounded-lg bg-ink-800 py-1.5">
            <span className="text-mist-400">{zh ? '击败敌人' : 'Defeated'} </span>
            <strong className="text-mist-100">{raid.kills}</strong>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-3 sm:px-5">
          <p className="text-xs text-mist-400 mb-2" role="status">
            {raid.phase === 'preparing'
              ? (zh ? '先选灵核，再点对应路线安排站位。开始后敌人会持续逼近。'
                : 'Pick a spirit, then its lane. Enemies advance automatically after starting.')
              : raid.phase === 'fighting'
                ? (zh ? '战斗进行中：按 1 / 2 / 3 对对应路线施放战技（消耗 3 能量），或花 2 能量调防。'
                  : 'Live combat: press 1 / 2 / 3 to cast a lane skill (3 energy), or shift a spirit (2).')
                : zh ? raid.notice : raid.phase === 'won' ? 'Defense held! Claim your reward.' : 'The defenses fell. Rearrange and try again.'}
          </p>
          <RaidBattleCanvas raid={raid} collection={collection} />
          {raid.bossWarning && (
            <div role="alert" data-testid="boss-warning"
              className="mt-2 rounded-lg border border-danger-300/70 bg-[#6a314b] p-2 text-center text-xs font-bold text-mist-100">
              {zh ? '⚠ 中路首领蓄力 · ' : '⚠ MID-LANE BOSS CHARGING · '}
              {raid.bossWarning.ticksLeft}
              {zh ? ' 刻后冲击！中路守护灵核可减伤' : ' ticks until impact! A guard in middle lane reduces damage'}
            </div>
          )}
          <div className="space-y-2 mt-2">
            {LANES.map(lane => {
              const defender = raid.lineup[lane];
              const threats = raid.enemies.filter(enemy => enemy.lane === lane);
              return (
                <section key={lane} className="rounded-xl border border-line bg-ink-800 p-2 sm:p-3">
                  <div className="flex justify-between items-center gap-2 text-xs mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <strong className="text-gold-200">{laneName(lane)}</strong>
                      {defender ? <SpiritPortrait id={defender} evolution={collection.owned[defender]?.evolution ?? 0} size={34} /> : <span>◇</span>}
                      <span className="text-mist-300 truncate">
                        {defender ? SPIRIT_BY_ID[defender][locale] : (zh ? '空防线' : 'Empty')}
                      </span>
                    </div>
                    <div className="flex gap-1.5">
                      {raid.phase === 'preparing' && (
                        <Button size="sm" variant="secondary" onClick={() => actionLane(lane)}
                          aria-label={(zh ? '部署到' : 'Deploy to ') + laneName(lane)}>
                          {zh ? '部署' : 'Deploy'}
                        </Button>
                      )}
                      {raid.phase === 'fighting' && (
                        <>
                          <Button size="sm" variant={moving === lane ? 'primary' : 'quiet'}
                            disabled={moving === null && (!defender || raid.energy < 2)}
                            onClick={() => {
                              if (moving === null) setMoving(lane);
                              else actionLane(lane);
                            }}>
                            {moving !== null ? (zh ? '移至此路' : 'Move here') : (zh ? '调防' : 'Shift')}
                          </Button>
                          <Button size="sm" variant="primary"
                            aria-label={(zh ? '对' : 'Cast skill on ') + laneName(lane) + (zh ? '施放战技' : '')}
                            disabled={raid.energy < 3 || threats.length === 0}
                            onClick={() => setRaid(current => castRaidSkill(current, lane, collection))}>
                            ⚡{zh ? '战技' : 'Skill'} 3
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="raid-lane relative min-h-[24px] overflow-hidden rounded-lg border border-line/50 flex items-center justify-between gap-2 px-2 text-[11px]"
                    data-testid={'raid-lane-' + lane}>
                    <span className="text-mist-400">
                      {zh ? '敌军' : 'Enemies'}: {threats.length}
                      {threats.map(enemy => (
                        <span key={enemy.id} data-testid="raid-enemy"
                          className="raid-enemy inline-block ml-1 text-danger-300"
                          aria-label={enemy.kind === 'boss' ? 'Boss' : 'Invader'}>
                          {enemy.kind === 'boss' ? '◉' : enemy.kind === 'brute' ? '◆' : '✦'}
                        </span>
                      ))}
                    </span>
                    <span className="text-gold-200">{defender ? SPIRIT_BY_ID[defender].role.toUpperCase() : '—'}</span>
                  </div>
                </section>
              );
            })}
          </div>
          {raid.phase === 'preparing' && (
            <div className="mt-3">
              <p className="text-xs font-bold text-gold-200 mb-2">
                {zh ? '选择参战灵核（最多三只，可交换路线）' : 'Select your defenders (max three; swap lanes)'}
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {owned.map(id => (
                  <button key={id} type="button" onClick={() => setSelected(id)}
                    aria-pressed={selected === id}
                    className={'flex shrink-0 items-center gap-2 rounded-xl border px-2 py-1.5 text-xs ' +
                      (selected === id ? 'border-gold-300 bg-ink-700' : 'border-line bg-ink-800')}>
                    <SpiritPortrait id={id} size={36} />
                    <span>{SPIRIT_BY_ID[id][locale]} · {QUALITY_LABELS[SPIRIT_BY_ID[id].quality][locale]}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {outcome && (
            <div className="mt-3 rounded-xl border border-gold-300/50 bg-ink-800 p-3 text-center">
              <p className="font-bold text-lg text-gold-200">
                {raid.phase === 'won' ? (zh ? '守卫成功！' : 'Victory!') : (zh ? '防线失守' : 'Defeat')}
              </p>
              <p className="text-xs text-mist-400 mt-1">{raid.phase === 'won'
                ? (zh ? '奖励：3 张召唤券 + 10 进化精华（每夜可领取一次）'
                  : 'Reward: 3 tickets + 10 essence (once per night)')
                : (zh ? '尝试重新调配路线，并把战技留给漏防敌人。' : 'Reassign lanes and save skills for threats that slip through.')}</p>
            </div>
          )}
        </div>
        <footer className="flex justify-between items-center shrink-0 border-t border-line px-3 py-2 sm:px-5 gap-2">
          <span className="text-xs text-mist-400">{zh ? '进度' : 'Progress'} {raid.tick}/42</span>
          {raid.phase === 'preparing' && (
            <Button variant="primary" size="md" data-testid="raid-start"
              disabled={!raid.lineup.some(Boolean)}
              onClick={() => setRaid(current => beginRaid(current, collection))}>
              {zh ? '开始防守 ⚔' : 'Start defense ⚔'}
            </Button>
          )}
          {raid.phase === 'won' && (
            <Button variant="primary" size="md" data-testid="raid-claim"
              onClick={() => { if (eligible) claimRaidReward(raid); onClose(); }}>
              {eligible ? (zh ? '领取奖励' : 'Claim reward') : (zh ? '完成' : 'Finish')}
            </Button>
          )}
          {raid.phase === 'lost' && (
            <Button variant="primary" size="md" onClick={() => {setRaid(prepareRaid(collection)); setMoving(null);}}>
              {zh ? '调整阵容 · 再战' : 'Rematch'}
            </Button>
          )}
        </footer>
      </section>
    </div>
  );
}
