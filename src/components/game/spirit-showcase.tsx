import { SPIRIT_BY_ID, FACTION_LABELS, QUALITY_LABELS, MAX_STARS, starCost } from '@/core/spirit-collection';
import type { SpiritId, SpiritProgress, EvolutionPath } from '@/core/spirit-collection';
import type { Locale } from '@/lib/i18n';
import { SpiritPortrait } from './spirit-portrait';
import { Button } from '@/components/ui/button';

const elementLabels = {
  water: { zh: '潮', en: 'Water' }, fire: { zh: '焰', en: 'Fire' },
  stone: { zh: '岩', en: 'Stone' }, wind: { zh: '风', en: 'Wind' },
  light: { zh: '光', en: 'Light' }, shadow: { zh: '影', en: 'Shadow' },
};
const roleLabels = {
  economy: { zh: '经营', en: 'Economy' }, repair: { zh: '修缮', en: 'Repair' },
  guard: { zh: '守护', en: 'Guard' }, explore: { zh: '探索', en: 'Explore' },
};

export function SpiritProfile({ id, progress, essence, locale, onClose, onLevel, onEvolve, onAwaken }: {
  id: SpiritId;
  progress: SpiritProgress;
  essence: number;
  locale: Locale;
  onClose: () => void;
  onLevel: () => void;
  onEvolve: (path?: EvolutionPath) => void;
  onAwaken: () => void;
}) {
  const spirit = SPIRIT_BY_ID[id];
  const zh = locale === 'zh';
  const nextExperience = 4 + progress.level * 2;
  const evolutionCost = (progress.evolution + 1) * 20;
  const evolutionLevel = (progress.evolution + 1) * 10;
  const canEvolve = progress.evolution < 2 && progress.level >= evolutionLevel && essence >= evolutionCost;
  const stars = progress.stars ?? 0;
  const nextStarCost = starCost(stars);
  const isMythicFinal = spirit.quality === 'UR' && progress.evolution === 1;
  const stage = progress.evolution === 0 ? (zh ? '初生' : 'Origin')
    : progress.evolution === 1 ? (zh ? '共鸣' : 'Resonance') : (zh ? '辉核' : 'Ascendant');

  return (
    <section aria-label={zh ? '灵核角色详情' : 'Spirit profile'} data-testid="spirit-profile"
      className={'game-spirit-profile rounded-2xl border p-3 sm:p-4 ' +
        (spirit.quality === 'UR' ? 'border-pink-400/60' : spirit.quality === 'SSR'
          ? 'border-amber-400/60' : 'border-line')}>
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <span className="text-gold-300 text-[10px] tracking-widest uppercase">
            {QUALITY_LABELS[spirit.quality][locale]} · {spirit.quality}
          </span>
          <h3 className="text-lg font-bold text-mist-100">{spirit[locale]}</h3>
        </div>
        <Button size="sm" variant="quiet" onClick={onClose}>
          {zh ? '收起详情' : 'Close profile'}
        </Button>
      </div>
      <div className="flex gap-3 items-center">
        <SpiritPortrait id={id} evolution={progress.evolution} size={118} />
        <div className="min-w-0 flex-1 text-xs space-y-1 text-mist-300">
          <p>{FACTION_LABELS[spirit.faction][locale]} · {elementLabels[spirit.element][locale]}</p>
          <p>{roleLabels[spirit.role][locale]} · Lv.{progress.level}/30</p>
          <p className="text-gold-200">{zh ? '进化形态' : 'Evolution'}: {stage} ({progress.evolution}/2)</p>
          <p>◈ {zh ? '基础增收' : 'Base income'} {spirit.coins >= 0 ? '+' : ''}{spirit.coins}
            {' · '}{zh ? '满意度' : 'Mood'} {spirit.mood >= 0 ? '+' : ''}{spirit.mood}
          </p>
          <p className="text-mist-400">{zh ? '碎片' : 'Shards'} {progress.shards} ·
            {zh ? '精华' : 'Essence'} {essence}</p>
          <p className="text-amber-300" data-testid="spirit-stars">{'★'.repeat(stars)}{'☆'.repeat(MAX_STARS - stars)} {stars}/{MAX_STARS}</p>
        </div>
      </div>
      <p className="mt-3 text-sm text-mist-200">{zh ? spirit.skillZh : spirit.skillEn}</p>
      <div className="mt-3 space-y-1">
        <div className="flex justify-between text-[11px] text-mist-400">
          <span>{zh ? '成长经验' : 'Experience'}</span>
          <span>XP {progress.xp}/{nextExperience}</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-ink-950">
          <div className="h-full bg-mint-300 rounded-full" style={{ width: Math.min(100, 100 * progress.xp / nextExperience) + '%' }} />
        </div>
      </div>
      <p className="mt-2 text-xs text-mist-400">
        {progress.evolution >= 2
          ? (zh ? '已达到最高形态。' : 'Final form reached.')
          : (zh ? '下次进化需要 Lv.' : 'Next evolution requires Lv.') + evolutionLevel +
            (zh ? ' 与 ' : ' and ') + evolutionCost + (zh ? ' 进化精华。' : ' essence.')}
        {progress.path && (' · ' + (progress.path === 'prosperity'
          ? (zh ? '繁荣进化：每夜 +6 金币' : 'Prosperity: +6 coins/night')
          : (zh ? '守护进化：每夜 +5 满意度' : 'Harmony: +5 mood/night')))}
      </p>
      <div className="flex gap-2 mt-3">
        <Button size="sm" variant="secondary" onClick={onLevel}
          disabled={progress.level >= 30 || progress.xp < nextExperience}>
          {zh ? '升级灵核' : 'Level up'}
        </Button>
        {!isMythicFinal && <Button size="sm" variant="primary" onClick={() => onEvolve()} disabled={!canEvolve}>
          {zh ? '形态进化' : 'Evolve'}
        </Button>}
        <Button size="sm" variant="secondary" onClick={onAwaken}
          disabled={stars >= MAX_STARS || progress.shards < nextStarCost} data-testid="awaken-spirit">
          {zh ? '升星' : 'Awaken'} {stars >= MAX_STARS ? 'MAX' : nextStarCost + (zh ? ' 碎片' : ' shards')}
        </Button>
      </div>
      {isMythicFinal && (
        <div className="mt-3 grid grid-cols-2 gap-2" data-testid="mythic-paths">
          <Button size="sm" variant="secondary" disabled={!canEvolve}
            onClick={() => onEvolve('prosperity')}>
            {zh ? '繁荣进化 · 金币 +6' : 'Prosperity · +6 coins'}
          </Button>
          <Button size="sm" variant="secondary" disabled={!canEvolve}
            onClick={() => onEvolve('harmony')}>
            {zh ? '守护进化 · 满意度 +5' : 'Harmony · +5 mood'}
          </Button>
        </div>
      )}
    </section>
  );
}

/** Client-only reveal: uses results from the actual saved summon, never rolls or spends resources. */
export function SummonReveal({ results, locale, onConfirm }: {
  results: SpiritId[];
  locale: Locale;
  onConfirm: () => void;
}) {
  const zh = locale === 'zh';
  const best = results.reduce((max, id) => {
    const tiers = { N: 0, R: 1, SR: 2, SSR: 3, UR: 4 };
    return tiers[SPIRIT_BY_ID[id].quality] > tiers[max] ? SPIRIT_BY_ID[id].quality : max;
  }, 'N' as 'N' | 'R' | 'SR' | 'SSR' | 'UR');
  const premium = best === 'UR' || best === 'SSR';
  const title = best === 'UR' ? (zh ? '神话降临' : 'MYTHIC AWAKENING')
    : best === 'SSR' ? (zh ? '传说显现' : 'LEGENDARY REVEAL')
      : (zh ? '灵核召唤完成' : 'SUMMON COMPLETE');

  return (
    <section data-testid="summon-reveal" aria-label={zh ? '召唤结果揭晓' : 'Summon reveal'}
      aria-live="polite" className={'game-summon-reveal absolute inset-0 z-20 flex flex-col bg-ink-950/98 p-3 sm:p-6 ' +
        (premium ? 'is-premium' : '')}>
      <div className="shrink-0 text-center space-y-1 mb-3">
        <p className="text-[10px] text-mist-400 uppercase tracking-[.24em]">
          ✦ {zh ? '灵核共鸣 · 召唤结果' : 'SPIRIT CONVERGENCE · REVEAL'} ✦
        </p>
        <h3 className={'game-summon-headline text-xl sm:text-3xl font-black ' +
          (best === 'UR' ? 'text-pink-300' : best === 'SSR' ? 'text-amber-300' : 'text-gold-200')}>
          {title}
        </h3>
        <p className="text-mist-400 text-xs">
          {zh ? '获得 ' + results.length + ' 只灵核 · 最高品质 ' + best :
            results.length + ' spirit' + (results.length === 1 ? '' : 's') + ' · Highest quality ' + best}
        </p>
      </div>
      <div className={'min-h-0 flex-1 overflow-y-auto grid content-start gap-2 sm:gap-3 p-1 ' +
        (results.length === 1 ? 'grid-cols-1 max-w-xs mx-auto w-full' : 'grid-cols-2 sm:grid-cols-5')}
        data-testid="summon-reveal-cards">
        {results.map((id, index) => {
          const spirit = SPIRIT_BY_ID[id];
          const special = spirit.quality === 'UR' || spirit.quality === 'SSR';
          return (
            <article key={index}
              style={{ animationDelay: Math.min(index * 75, 675) + 'ms' }}
              className={'game-summon-card relative rounded-xl border bg-ink-800 p-2 text-center ' +
                (spirit.quality === 'UR' ? 'border-pink-400/70' : spirit.quality === 'SSR' ?
                  'border-amber-400/70' : 'border-line')}>
              {special && <div className="game-summon-halo" aria-hidden="true" />}
              <div className="relative flex justify-center my-1">
                <SpiritPortrait id={id} size={results.length === 1 ? 164 : 90} />
              </div>
              <p className={'font-bold text-xs sm:text-sm mt-1 ' +
                (spirit.quality === 'UR' ? 'text-pink-300' : spirit.quality === 'SSR' ?
                  'text-amber-300' : 'text-mist-100')}>{spirit[locale]}</p>
              <p className="text-mist-400 text-[10px] mt-1">{spirit.quality} · {FACTION_LABELS[spirit.faction][locale]}</p>
            </article>
          );
        })}
      </div>
      <div className="shrink-0 pt-3 flex justify-center">
        <Button variant="primary" onClick={onConfirm} autoFocus data-testid="summon-reveal-close">
          {zh ? '收下灵核 · 返回召唤所' : 'Collect spirits · Continue'}
        </Button>
      </div>
    </section>
  );
}
