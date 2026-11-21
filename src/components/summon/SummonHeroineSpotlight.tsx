'use client';

import { useState } from 'react';
import { ReliableImage as Image } from '@/components/game/reliable-image';
import { HEROINE_FACE_ART } from './heroine-portrait-assets';
import moonveilBust from '../../../public/art/yuesha-bust-v3.webp';
import { Search } from 'lucide-react';

export type FeaturedWorker = 'brook' | 'fern' | 'cinder' | null;

interface SummonHeroineSpotlightProps {
  featuredWorker: FeaturedWorker;
  featuredBeastName: string;
  poolTitle: string;
  poolSub: string;
  dateRange: string;
  quoteIndex: number;
  onQuoteClick: () => void;
  onQuoteChange: (quote: string) => void;
  saveStatus: string;
  onShowDetails: () => void;
  summonError: string | null;
}

const WORKER_NAMES: Record<Exclude<FeaturedWorker, null>, string> = {
  brook: '泉泡',
  fern: '青枝',
  cinder: '炽角',
};

const OTHER_QUOTES: Record<Exclude<FeaturedWorker, null>, readonly string[]> = {
  brook: [
    '「听见了吗？水脉正在向我们讲述故事。」',
    '「银月下的霜狼，从来不会忘记归途。」',
  ],
  fern: [
    '「荆棘守护的花，总有自己的绽放时刻。」',
    '「跟我去看看真正的月光温室。」',
  ],
  cinder: [
    '「我的锻锤，不是拿来做装饰的。」',
    '「如果你不怕火，就跟上我的脚步。」',
  ],
};

const DEFAULT_QUOTES = [
  '「……你也想，成为我的所有物吗？」',
  '「沉入永夜吧—— 这一次，换我来拥抱你。」',
  '「别把视线移开，今夜你只属于我。」',
  '「这份契约已烙入灵魂，你无法反悔了。」',
];

function workerName(worker: FeaturedWorker): string {
  return worker === null ? '月纱' : WORKER_NAMES[worker];
}

function workerQuotes(worker: FeaturedWorker): readonly string[] {
  return worker === null ? DEFAULT_QUOTES : OTHER_QUOTES[worker];
}

export function SummonHeroineSpotlight(props: SummonHeroineSpotlightProps) {
  const {
    featuredWorker,
    featuredBeastName,
    poolTitle,
    poolSub,
    dateRange,
    quoteIndex: initialQuoteIndex,
    onQuoteClick,
    onQuoteChange,
    saveStatus,
    onShowDetails,
    summonError,
  } = props;

  const [quoteIndex, setQuoteIndex] = useState(initialQuoteIndex);

  const isWorker = featuredWorker !== null;
  const workerImage = isWorker ? HEROINE_FACE_ART[featuredWorker!] : moonveilBust;
  const displayName = workerName(featuredWorker);
  const quotes = workerQuotes(featuredWorker);
  const visibleQuote = quotes[quoteIndex % quotes.length];

  return (
    <section
      className="summon-cinematic-center relative flex min-w-0 flex-1 flex-col items-center justify-between px-2 sm:px-4 py-2 z-10"
    >
      <div
        className={
          'summon-cinematic-character pointer-events-none absolute inset-0 z-[-1]' +
          (isWorker ? ' summon-cinematic-character--worker' : '')
        }
        data-testid="summon-featured-portrait"
        data-featured-character={featuredWorker ?? 'yuesha'}
        aria-hidden="true"
      >
        {isWorker ? (
          <Image
            src={workerImage}
            alt=""
            fill
            loading="eager"
            sizes="(max-width:900px) 90vw, (max-width:1449px) 50vw, 770px"
            className="summon-cinematic-heroine-image"
            data-portrait-source="dedicated-heroine"
          />
        ) : (
          <Image
            src={moonveilBust}
            alt=""
            fill
            loading="eager"
            unoptimized
            sizes="(max-width:900px) 65vw,700px"
            className="object-contain object-bottom opacity-95"
          />
        )}
      </div>

      <button
        type="button"
        aria-label={'与' + displayName + '对话，切换台词'}
        onClick={() => {
          const nextIndex = quoteIndex + 1;
          setQuoteIndex(nextIndex);
          onQuoteClick();
          onQuoteChange(quotes[nextIndex % quotes.length]);
        }}
        className="summon-cinematic-quote relative z-[2] cursor-pointer self-end mr-1 mt-2 rounded border border-[#c99f6b77] px-3 py-2 text-[11px] text-[#ffeed5] shadow-[0_8px_22px_#0009] transition-colors hover:border-[#ffe0b5] focus-visible:outline-2 focus-visible:outline-[#ffe0b5] motion-reduce:transition-none"
      >
        <p className="italic font-serif leading-relaxed">{visibleQuote}</p>
        <span className="block text-right text-[9px] text-[#bfa084]">
          —— {displayName} ☾
        </span>
      </button>

      <div className="summon-cinematic-title text-center my-auto">
        <div className="inline-block">
          <span className="text-[10px] tracking-[.3em] text-[#dca66e] uppercase">
            ✦ {displayName} · {featuredBeastName} ✦
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-[.18em] text-[#fff0d6] drop-shadow-[0_4px_12px_#000]">
            {poolTitle}
          </h2>
          <p className="mt-1 text-xs sm:text-sm tracking-widest text-[#e8cbb0]">
            {poolSub}
          </p>

          <div className="mt-3 inline-flex flex-wrap items-center justify-center gap-2 rounded-full border border-[#ad7a4f77] bg-[#230f1fd8] px-4 py-1 text-[11px] text-[#f5d9bd]">
            <span>同池概率 · 无独立 UP ·</span>
            <span className="text-[#c9a786]">{dateRange}</span>
            <button
              type="button"
              onClick={onShowDetails}
              className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[#ffc66e] hover:underline"
            >
              查看详情 <Search aria-hidden="true" size={12} strokeWidth={1.8} />
            </button>
          </div>

          {saveStatus !== 'ok' && (
            <p
              role="alert"
              data-testid="summon-save-error"
              className="rounded border border-red-500 bg-[#3f1228] p-2 text-xs"
            >
              召唤存档异常，已停止抽取以保护进度。
            </p>
          )}

          {summonError && (
            <div className="mt-2 text-xs font-semibold text-[#ff5577] bg-black/60 px-3 py-1 rounded-full">
              {summonError}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
