'use client';

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useGameStore } from '@/store/game-store';
import { SPIRITS, SPIRIT_BY_ID, FACTION_LABELS, QUALITY_RATES } from '@/core/spirit-collection';
import type { Quality, Spirit } from '@/core/spirit-collection';
import { Button } from '@/components/ui/button';
import { SpiritPortrait } from './spirit-portrait';

type Tab = 'summon' | 'codex' | 'formation';
const qualityColors: Record<Quality, string> = {
  N: 'text-slate-300 border-slate-500/50',
  R: 'text-sky-300 border-sky-400/60',
  SR: 'text-violet-300 border-violet-400/60',
  SSR: 'text-amber-300 border-amber-400/60',
  UR: 'text-pink-300 border-pink-400/60',
};

function SpiritTile({ spirit, locale, children, evolution = 0 }: {
  spirit: Spirit; locale: 'zh' | 'en'; children?: ReactNode; evolution?: number;
}) {
  return (
    <div className={'rounded-xl border bg-ink-800/80 px-3 py-2 min-w-0 ' + qualityColors[spirit.quality]}>
      <div className="flex items-center gap-2">
        <SpiritPortrait id={spirit.id} evolution={evolution} size={56} />
        <div className="min-w-0 flex-1">
          <strong className="block text-sm truncate">{locale === 'zh' ? spirit.zh : spirit.en}</strong>
          <small className="block text-mist-500 text-[10px]">{spirit.quality} · {FACTION_LABELS[spirit.faction][locale]} · {spirit.element}</small>
        </div>
      </div>
      <p className="text-mist-400 text-xs mt-1 leading-snug">{locale === 'zh' ? spirit.skillZh : spirit.skillEn}</p>
      {children}
    </div>
  );
}

export function SpiritPortal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [tab, setTab] = useState<Tab>('summon');
  const { state, collection, collectionError, selected, locale,
    summonSpirits, assignSpirit, trainSpirit, evolveCompanion } = useGameStore();
  const zh = locale === 'zh';
  useEffect(() => {
    if (!open) return;
    const dismiss = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', dismiss);
    return () => document.removeEventListener('keydown', dismiss);
  }, [open, onClose]);

  if (!open) return null;

  const ownedSpirits = SPIRITS.filter((spirit) => collection.owned[spirit.id]);
  const roomReady = selected !== null && !state.over;
  const companionId = selected === null ? null : state.rooms[selected];
  const tabs: { id: Tab; zh: string; en: string }[] = [
    { id: 'summon', zh: '灵核召唤', en: 'Summon' },
    { id: 'codex', zh: '图鉴养成', en: 'Codex & Growth' },
    { id: 'formation', zh: '房间驻守', en: 'Assignment' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-ink-950/90 backdrop-blur-md" role="presentation">
      <div role="dialog" aria-modal="true" aria-label={zh ? '灵核召唤与图鉴' : 'Spirit Summoning and Codex'}
        data-testid="spirit-portal"
        className="w-full max-w-3xl max-h-[88dvh] flex flex-col rounded-2xl border border-gold-300/40 bg-ink-900 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between gap-2 p-4 border-b border-line">
          <div>
            <p className="text-[10px] uppercase tracking-[.18em] text-gold-300">✧ SPIRIT CONVERGENCE / V0.5</p>
            <h2 className="text-xl font-bold text-gold-200">{zh ? '灵核召唤所' : 'Spirit Convergence'}</h2>
          </div>
          <Button size="sm" variant="quiet" onClick={onClose} aria-label={zh ? '关闭召唤所' : 'Close summoning'}>✕</Button>
        </div>
        <div className="grid grid-cols-3 gap-1.5 p-3 border-b border-line" role="tablist" aria-label={zh ? '灵核功能' : 'Spirit features'}>
          {tabs.map((item) => (
            <button key={item.id} type="button" role="tab" aria-selected={tab === item.id}
              onClick={() => setTab(item.id)}
              className={'rounded-lg px-2 py-2 text-xs font-bold ' + (tab === item.id ? 'bg-gold-300 text-ink-950' : 'bg-ink-700 text-mist-300')}>
              {zh ? item.zh : item.en}
            </button>
          ))}
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
          <div className="flex flex-wrap gap-2 text-xs text-mist-300" data-testid="summon-resources">
            <span className="rounded-lg bg-ink-700 px-2 py-1">✦ {zh ? '召唤券' : 'Tickets'} {collection.tickets}</span>
            <span className="rounded-lg bg-ink-700 px-2 py-1">◇ {zh ? '进化精华' : 'Essence'} {collection.essence}</span>
            <span className="rounded-lg bg-ink-700 px-2 py-1">{zh ? '收集' : 'Owned'} {ownedSpirits.length}/{SPIRITS.length}</span>
          </div>
          {collectionError && <p role="alert" className="text-danger-300 text-xs">{collectionError}</p>}
          {tab === 'summon' && (
            <div className="space-y-3">
              <p className="text-mist-400 text-xs">{zh
                ? '通过五夜经营获得召唤券。首次赠送 10 券；每结束一夜再获得 2 券。'
                : 'Earn tickets through nightly management. Start with 10 tickets and earn 2 more each night.'}</p>
              <div className="grid grid-cols-2 gap-2">
                <Button size="md" variant="secondary" disabled={collection.tickets < 1}
                  onClick={() => summonSpirits(1)}>{zh ? '召唤 1 次 · 1 券' : 'Summon ×1 · 1 ticket'}</Button>
                <Button size="md" variant="primary" disabled={collection.tickets < 10}
                  onClick={() => summonSpirits(10)}>{zh ? '召唤 10 次 · 10 券' : 'Summon ×10 · 10 tickets'}</Button>
              </div>
              <div className="grid grid-cols-5 gap-1.5 text-center text-xs">
                {(['N', 'R', 'SR', 'SSR', 'UR'] as const).map((quality) => (
                  <div key={quality} className={'rounded-lg border bg-ink-800 p-2 ' + qualityColors[quality]}>
                    <strong>{quality}</strong><p>{QUALITY_RATES[quality]}%</p>
                  </div>
                ))}
              </div>
              <p className="text-mist-500 text-xs">{zh
                ? '基础概率如上；第 10 抽保底 SR+，第 50 抽保底 SSR+，第 100 抽保底 UR。保底计数跨十连与单抽累计；抽到相应品质会重置对应计数。'
                : 'Base odds above. SR+ by pull 10, SSR+ by pull 50, UR by pull 100; single and ten-pulls share counters and qualifying pulls reset pity.'}</p>
              <p className="text-mist-400 text-xs" data-testid="summon-pity">
                {zh ? '保底进度' : 'Pity progress'} · SR {collection.pity.sr}/10 · SSR {collection.pity.ssr}/50 · UR {collection.pity.ur}/100
              </p>
              {collection.recent.length > 0 && (
                <div data-testid="summon-results" className="space-y-2">
                  <h3 className="text-gold-200 font-semibold text-sm">{zh ? '最近召唤' : 'Latest summons'}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {collection.recent.map((id, index) => (
                      <SpiritTile key={index} spirit={SPIRIT_BY_ID[id]} locale={locale} />
                    ))}
                  </div>
                  <p className="text-mist-500 text-xs">{zh ? '重复灵核转换为该角色 20 碎片。' : 'Duplicates convert into 20 character shards.'}</p>
                </div>
              )}
            </div>
          )}
          {tab === 'codex' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" data-testid="spirit-codex">
              <p className="col-span-full text-mist-400 text-xs">{zh ? '驻守完成每夜可得 6 XP；等级达到 10 / 20 并消耗进化精华后可进化。' : 'Assigned spirits earn 6 XP each night. Evolve at level 10 / 20 using essence.'}</p>
              {SPIRITS.map((spirit) => {
                const progress = collection.owned[spirit.id];
                return progress ? (
                  <SpiritTile spirit={spirit} locale={locale} key={spirit.id} evolution={progress.evolution}>
                    <p className="text-mist-300 text-xs mt-1">
                      Lv.{progress.level} · XP {progress.xp}/{4 + progress.level * 2} ·
                      {zh ? ' 进化' : ' Evolution'} {progress.evolution}/2 ·
                      {zh ? ' 碎片' : ' Shards'} {progress.shards}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" variant="secondary" disabled={progress.level >= 30 || progress.xp < 4 + progress.level * 2}
                        onClick={() => trainSpirit(spirit.id)}>{zh ? '升级' : 'Level up'}</Button>
                      <Button size="sm" variant="quiet"
                        disabled={progress.evolution >= 2 || progress.level < (progress.evolution + 1) * 10 ||
                          collection.essence < (progress.evolution + 1) * 20}
                        onClick={() => evolveCompanion(spirit.id)}>{zh ? '进化' : 'Evolve'}</Button>
                    </div>
                  </SpiritTile>
                ) : (
                  <div key={spirit.id} className="rounded-xl border border-line bg-ink-800/50 px-3 py-3 opacity-60">
                    <strong className="text-mist-400 text-sm">？ {zh ? '未发现' : 'Unknown'} · {spirit.quality}</strong>
                    <p className="text-xs text-mist-500">{FACTION_LABELS[spirit.faction][locale]}</p>
                  </div>
                );
              })}
            </div>
          )}
          {tab === 'formation' && (
            <div className="space-y-3">
              <p className="text-mist-300 text-sm">{zh ? '当前选中房间：' : 'Selected room: '}
                {selected === null ? '—' : selected + 1} ·
                {roomReady ? (zh ? '可设置驻守' : 'Ready to assign') : (zh ? '可以选择已收集灵核直接入住' : 'Place any owned spirit')}
              </p>
              <p className="text-mist-500 text-xs">{zh
                ? '灵核是房间的真正住户。同阵营 2/4/6 名激活经营加成；可以替换或撤回当前房间的灵核。'
                : 'Spirits live in the rooms directly. Faction 2/4/6 grants bonuses; you can replace or remove residents.'}</p>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                {collection.equipped.map((id, index) => (
                  <div key={index} className="rounded-lg bg-ink-800 p-2 text-center text-xs">
                    <strong>{zh ? '房' : 'Room'} {index + 1}</strong>
                    <p className="text-mist-400 truncate">{id ? SPIRIT_BY_ID[id].icon + ' ' + SPIRIT_BY_ID[id][locale] : '—'}</p>
                  </div>
                ))}
              </div>
              {companionId && <Button size="sm" variant="quiet" onClick={() => assignSpirit(null)}>{zh ? '撤回当前驻守' : 'Unassign current spirit'}</Button>}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ownedSpirits.map((spirit) => {
                  const equippedElsewhere = collection.equipped.some((id, index) => id === spirit.id && index !== selected);
                  return (
                    <SpiritTile key={spirit.id} spirit={spirit} locale={locale}>
                      <Button size="sm" variant="secondary" fullWidth className="mt-2"
                        disabled={!roomReady || equippedElsewhere || companionId === spirit.id}
                        onClick={() => assignSpirit(spirit.id)}>
                        {companionId === spirit.id ? (zh ? '已驻守' : 'Assigned')
                          : equippedElsewhere ? (zh ? '驻守其他房间中' : 'Assigned elsewhere')
                            : (zh ? '驻守选中房间' : 'Assign to selected room')}
                      </Button>
                    </SpiritTile>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        <div className="border-t border-line px-4 py-2 text-mist-500 text-xs">
          {zh ? '原创生物 · 免费游戏内召唤 · 本地自动存档' : 'Original creatures · Free in-game summons · Local autosave'}
        </div>
      </div>
    </div>
  );
}
