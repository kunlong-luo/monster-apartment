'use client';

import { useGameStore } from '@/store/game-store';
import { SPIRITS, SPIRIT_BY_ID, FACTION_LABELS } from '@/core/spirit-collection';
import { Panel } from '@/components/ui/panel';
import { SectionHeading } from '@/components/ui/section-heading';
import { Button } from '@/components/ui/button';
import { t } from '@/lib/i18n';
import { SpiritPortrait } from './spirit-portrait';

export function SpiritRoster({ onSummon }: { onSummon: () => void }) {
  const { state, collection, locale, selected, assignSpirit, collectionError } = useGameStore();
  const zh = locale === 'zh';
  const owned = SPIRITS.filter(spirit => collection.owned[spirit.id]);
  return (
    <Panel>
      <div className="flex items-center justify-between gap-2 mb-2">
        <SectionHeading title={t(locale, 'recruitTitle')} />
        <Button size="sm" variant="primary" onClick={onSummon}>{zh ? '✦ 召唤' : '✦ Summon'}</Button>
      </div>
      <p className="text-mist-500 text-xs mb-2">{zh
        ? '选择房间，然后安排已收集的灵核入住；每只灵核只能占据一间房。'
        : 'Select a room to place an owned spirit. Each species occupies one room.'}</p>
      {collectionError && <p className="text-danger-300 text-xs mb-2" role="alert">{collectionError}</p>}
      <div className="grid grid-cols-2 lg:grid-cols-1 gap-2" data-testid="spirit-roster">
        {owned.map(spirit => {
          const current = selected === null ? null : state.rooms[selected];
          const busy = state.rooms.some((id, index) => id === spirit.id && index !== selected);
          const level = collection.owned[spirit.id]?.level ?? 1;
          return (
            <div className="game-tenant" key={spirit.id} data-spirit={spirit.id}>
              <div className="flex items-center gap-2">
                <SpiritPortrait id={spirit.id} evolution={collection.owned[spirit.id]?.evolution ?? 0} size={52} />
                <div className="min-w-0 flex-1">
                  <strong className="block text-mist-300 text-sm truncate">{spirit[locale]}</strong>
                  <p className="text-[10px] text-mist-400">{spirit.quality} · {FACTION_LABELS[spirit.faction][locale]} · Lv.{level}</p>
                </div>
              </div>
              <p className="text-mist-400 text-[11px] mt-2 leading-snug">{zh ? spirit.skillZh : spirit.skillEn}</p>
              <Button size="sm" variant="secondary" fullWidth className="mt-2"
                disabled={state.over || selected === null || busy || current === spirit.id}
                onClick={() => assignSpirit(spirit.id)}
                aria-label={zh ? spirit.zh + ' 入住选中房间' : 'Place ' + spirit.en + ' in selected room'}>
                {current === spirit.id ? (zh ? '已入住' : 'Placed')
                  : busy ? (zh ? '已在其他房间' : 'In another room')
                    : (zh ? '安排入住' : 'Place spirit')}
              </Button>
            </div>
          );
        })}
      </div>
      {selected !== null && state.rooms[selected] && (
        <div className="mt-2 flex items-center justify-between gap-2 text-xs text-mist-400">
          <span>{zh ? '当前：' : 'Current: '}{SPIRIT_BY_ID[state.rooms[selected]!][locale]}</span>
          <Button size="sm" variant="quiet" disabled={state.over} onClick={() => assignSpirit(null)}>
            {zh ? '撤回' : 'Remove'}
          </Button>
        </div>
      )}
    </Panel>
  );
}
