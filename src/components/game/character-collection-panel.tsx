'use client';

import { useRef, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import Image from 'next/image';
import {
  Ticket,
  Droplets,
  Gem,
  Backpack,
  Mail,
  Megaphone,
  Settings,
  History,
  Scroll,
  BookOpen,
  Gift,
  Search,
  Sparkles,
  Moon,
  Plus,
  Play,
} from 'lucide-react';
import { CharacterAdornment } from '@/components/game/character-adornment';
import { CharacterSummonReveal } from '@/components/game/character-summon-reveal';
import { SummonRitualModal } from '@/components/summon/summon-ritual-modal';
import {
  SummonHistoryModal,
  PoolDetailsModal,
  CharacterArchiveModal,
  CharacterTrialModal,
  CurrencyReplenishModal,
  UtilityModal,
} from '@/components/summon/summon-dialogs';
import moonveilPortrait from '../../../public/art/yuesha-portrait-v3.webp';
import { WorkerArtwork } from '@/components/moonwork/worker-artwork';
import { useCharacterLife } from '@/lib/game/character-life-store';
import { commitCollection, useCharacterCollection } from '@/lib/game/character-collection-store';
import {
  CHARACTER_CARDS,
  FORGE_RECIPES,
  availableContracts,
  earnedContracts,
} from '@/core/character-collection';
import type { CardKey, GearId } from '@/core/character-collection';
import { CHARACTER_PROFILES } from '@/core/character-life';
import {
  GACHA_POOLS,
  GACHA_CHARACTERS,
  type SummonableCharacter,
  type SummonRecord,
} from '@/lib/summon/gacha-engine';

function Portrait({ id }: { id: 'yuesha' | 'brook' | 'fern' | 'cinder' }) {
  return (
    <span className="relative block size-12 sm:size-14 shrink-0 overflow-hidden rounded-lg border border-[#e2b7835d] bg-[#241b31]">
      {id === 'yuesha' ? (
        <Image
          src={moonveilPortrait}
          alt=""
          fill
          unoptimized
          sizes="64px"
          className="object-cover object-top"
        />
      ) : (
        <WorkerArtwork id={id} name={CHARACTER_PROFILES[id].name} compact />
      )}
      <CharacterAdornment id={id} compact />
    </span>
  );
}

const colors: Record<string, string> = {
  普通: 'border-[#8f9db1]/65 bg-[#2d3542]/70 text-[#d8e6f5]',
  稀有: 'border-[#6eabdd]/75 bg-[#123555]/70 text-[#a8dbff]',
  史诗: 'border-[#bb84ed]/75 bg-[#40224e]/75 text-[#e7bdff]',
  传说: 'border-[#e3b85d]/75 bg-[#493218]/75 text-[#ffe3a4]',
  '神话·月蚀': 'border-[#ff5265] bg-[#620e29]/90 text-[#ffe1e3] shadow-[0_0_20px_#b1174580]',
};

export function CharacterCollectionPanel({ completed }: { completed: number }) {
  const life = useCharacterLife();
  const { status, collection } = useCharacterCollection();
  const [chosen, setChosen] = useState<CardKey | null>(null);
  const [featured, setFeatured] = useState<CardKey>('yuesha-eclipse');
  const [notice, setNotice] = useState('');
  const [reveal, setReveal] = useState<{ card: CardKey; duplicate: boolean } | null>(null);
  const summonButton = useRef<HTMLButtonElement>(null);

  // 1:1 Gacha Screen State
  const [pityCountdown, setPityCountdown] = useState<number>(48);
  const [bloodCrystals, setBloodCrystals] = useState<number>(8450);
  const [moonstones, setMoonstones] = useState<number>(320);
  const [quoteIndex, setQuoteIndex] = useState<number>(0);
  const quotes = [
    '「……你也想，成为我的所有物吗？」',
    '「沉入永夜吧—— 这一次，换我来拥抱你。」',
    '「别把视线移开，今夜你只属于我。」',
  ];

  // Modals
  const [multiModal, setMultiModal] = useState<{ open: boolean; characters: SummonableCharacter[] }>({
    open: false,
    characters: [],
  });
  const [showHistory, setShowHistory] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [showTrial, setShowTrial] = useState(false);
  const [showReplenish, setShowReplenish] = useState(false);
  const [utilityModal, setUtilityModal] = useState<'bag' | 'mail' | 'notice' | 'settings' | null>(null);

  // History log
  const [historyRecords, setHistoryRecords] = useState<SummonRecord[]>(() => [
    {
      id: 'h1',
      timestamp: 1729746000000,
      poolId: 'mythic-eclipse',
      poolName: '「神话·月蚀」',
      characterId: 'cinder-ember',
      name: '炽角',
      title: '炽角 · 炉火余烬',
      rarity: 'SR',
      rarityZh: 'SR 精英',
    },
    {
      id: 'h2',
      timestamp: 1729738800000,
      poolId: 'mythic-eclipse',
      poolName: '「神话·月蚀」',
      characterId: 'fern-spring',
      name: '青枝',
      title: '青枝 · 春芽誓约',
      rarity: 'R',
      rarityZh: 'R 稀有',
    },
  ]);

  const dismissReveal = () => {
    setReveal(null);
    window.requestAnimationFrame(() => summonButton.current?.focus());
  };

  const earned = earnedContracts(completed, life.status === 'ok' ? life.progress.visited.length : 0);
  const available = availableContracts(collection, earned);
  const selectedCard =
    CHARACTER_CARDS.find((card) => card.key === chosen && collection.draws.includes(card.key)) ??
    CHARACTER_CARDS.find((card) => collection.draws.includes(card.key));
  const selectedId = selectedCard?.character ?? null;
  const ownedCount = new Set(collection.draws).size;
  const feature = CHARACTER_CARDS.find((card) => card.key === featured)!;

  // Single Summon Logic
  const summon = () => {
    const roll = window.crypto.getRandomValues(new Uint32Array(1))[0] / 4294967296;
    const result = commitCollection({ type: 'summon', earned, roll });
    if (result.status === 'applied' && result.card) {
      const card = CHARACTER_CARDS.find((c) => c.key === result.card)!;
      setChosen(result.card);
      setFeatured(result.card);
      setReveal({ card: result.card, duplicate: collection.draws.includes(result.card) });
      setPityCountdown((prev) => (card.tier === 5 ? 90 : Math.max(1, prev - 1)));
      setNotice(
        '召唤成功：' +
          card.title +
          '。' +
          (collection.draws.includes(result.card)
            ? '重复契约已化为更多锻造碎片。'
            : '新契约已加入图鉴与住客名册。')
      );
      setHistoryRecords((prev) => [
        {
          id: 'rec-' + Date.now(),
          timestamp: Date.now(),
          poolId: 'mythic-eclipse',
          poolName: '「神话·月蚀」',
          characterId: card.key,
          name: CHARACTER_PROFILES[card.character].name,
          title: card.title,
          rarity: card.tier === 5 ? 'SSR-Mythic' : card.tier === 4 ? 'SSR-Legend' : 'SR',
          rarityZh: card.rarity,
        },
        ...prev,
      ]);
    } else {
      setNotice(
        result.status === 'duplicate'
          ? '当前契约券已用完。'
          : '收藏存档不可写入，请检查存储权限和历史数据。'
      );
    }
  };

  // 10-Pull Logic
  const summonTen = () => {
    if (available < 10 && bloodCrystals < 1600) {
      setNotice('契约信物与血晶不足十连消耗！请点击上方 [+] 补充。');
      return;
    }
    const pulledChars: SummonableCharacter[] = [];
    for (let i = 0; i < 10; i++) {
      const roll = window.crypto.getRandomValues(new Uint32Array(1))[0] / 4294967296;
      const res = commitCollection({ type: 'summon', earned: 99999, roll });
      const c =
        res.card && CHARACTER_CARDS.find((x) => x.key === res.card)
          ? GACHA_CHARACTERS.find((g) => g.id === res.card) || GACHA_CHARACTERS[0]
          : GACHA_CHARACTERS[Math.floor(Math.random() * GACHA_CHARACTERS.length)];
      pulledChars.push(c);
    }
    if (available < 10) {
      setBloodCrystals((prev) => Math.max(0, prev - 1600));
    }
    setPityCountdown((prev) => Math.max(1, prev - 10));
    setMultiModal({ open: true, characters: pulledChars });
  };

  const forge = (id: GearId) => {
    const result = commitCollection({ type: 'forge', id });
    setNotice(
      result.status === 'applied'
        ? '装备锻造成功，已进入收藏装备库。'
        : '无法打造：材料不足、已持有，或收藏存档不可用。'
    );
  };

  const equip = (id: GearId) => {
    if (!selectedId) return;
    const result = commitCollection({ type: 'equip', id, character: selectedId });
    setNotice(
      result.status === 'applied'
        ? CHARACTER_PROFILES[selectedId].name +
            '已装备' +
            FORGE_RECIPES.find((item) => item.id === id)!.name +
            '，档案属性已更新。'
        : '无法装备：请选择已收录角色并确认装备已打造。'
    );
  };

  return (
    <section
      id="summon"
      className="gothic-summon-shell mb-4 min-w-0 space-y-4 rounded-2xl border border-[#c4a1777c] bg-[#100910f5] p-3 sm:p-5 shadow-[0_15px_50px_#000000cc]"
      data-testid="character-collection"
      aria-label="月影契约召唤"
    >
      {/* ------------------------------------------------------------- */}
      {/* 1. TOP HEADER & CURRENCY BAR (1:1 with Screenshot)            */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#a67c5244] pb-3 text-xs">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <span className="text-xl text-[#f3ca88] select-none" aria-hidden="true">❦</span>
          <div>
            <h2 className="text-base font-bold tracking-[.18em] text-[#ffebcc] font-serif">怪物公寓</h2>
            <span className="block text-[8px] tracking-[.25em] text-[#bca085] uppercase font-sans">
              MONSTER APARTMENT
            </span>
          </div>
        </div>

        {/* Currency Group */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Tickets */}
          <div
            onClick={() => setShowReplenish(true)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter') setShowReplenish(true); }}
            className="flex cursor-pointer items-center gap-2 rounded-full border border-[#b88c5888] bg-[#22101ecc] px-3 py-1 text-xs text-[#ffe1bc] hover:border-[#ffd699] transition shadow-[inset_0_1px_#ffe4b520]"
          >
            <Ticket className="size-3.5 text-[#ffc66e]" />
            <span data-testid="collection-tickets" className="font-semibold tabular-nums">
              {available}
            </span>
            <span className="flex size-4 items-center justify-center rounded-full bg-[#462135] text-[#ffc66e] hover:bg-[#6b2548]">
              <Plus className="size-2.5 stroke-[3]" />
            </span>
          </div>

          {/* Blood Crystals */}
          <div
            onClick={() => setShowReplenish(true)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter') setShowReplenish(true); }}
            className="flex cursor-pointer items-center gap-2 rounded-full border border-[#b88c5888] bg-[#22101ecc] px-3 py-1 text-xs text-[#ffe1bc] hover:border-[#ffd699] transition shadow-[inset_0_1px_#ffe4b520]"
          >
            <Droplets className="size-3.5 text-[#ff4466] fill-[#ff4466]" />
            <span className="font-semibold tabular-nums">{bloodCrystals.toLocaleString()}</span>
            <span className="flex size-4 items-center justify-center rounded-full bg-[#462135] text-[#ffc66e] hover:bg-[#6b2548]">
              <Plus className="size-2.5 stroke-[3]" />
            </span>
          </div>

          {/* Moonstones */}
          <div
            onClick={() => setShowReplenish(true)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter') setShowReplenish(true); }}
            className="flex cursor-pointer items-center gap-2 rounded-full border border-[#b88c5888] bg-[#22101ecc] px-3 py-1 text-xs text-[#ffe1bc] hover:border-[#ffd699] transition shadow-[inset_0_1px_#ffe4b520]"
          >
            <Gem className="size-3.5 text-[#6ee7b7]" />
            <span className="font-semibold tabular-nums">{moonstones}</span>
            <span className="flex size-4 items-center justify-center rounded-full bg-[#462135] text-[#ffc66e] hover:bg-[#6b2548]">
              <Plus className="size-2.5 stroke-[3]" />
            </span>
          </div>

          {/* Top-Right Utility Buttons */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-[#805a4155]">
            <button
              type="button"
              aria-label="背包"
              onClick={() => setUtilityModal('bag')}
              className="flex size-7 items-center justify-center rounded-lg border border-[#7e5539] bg-[#23121fcc] text-xs text-[#eed0b2] hover:border-[#ffd699] hover:bg-[#3d1a33] transition"
            >
              <Backpack className="size-3.5 text-[#f3ca88]" />
            </button>
            <button
              type="button"
              aria-label="邮箱"
              onClick={() => setUtilityModal('mail')}
              className="relative flex size-7 items-center justify-center rounded-lg border border-[#7e5539] bg-[#23121fcc] text-xs text-[#eed0b2] hover:border-[#ffd699] hover:bg-[#3d1a33] transition"
            >
              <Mail className="size-3.5 text-[#f3ca88]" />
              <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-[#ff2244] ring-1 ring-black" />
            </button>
            <button
              type="button"
              aria-label="公告"
              onClick={() => setUtilityModal('notice')}
              className="relative flex size-7 items-center justify-center rounded-lg border border-[#7e5539] bg-[#23121fcc] text-xs text-[#eed0b2] hover:border-[#ffd699] hover:bg-[#3d1a33] transition"
            >
              <Megaphone className="size-3.5 text-[#f3ca88]" />
              <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-[#ff2244] ring-1 ring-black" />
            </button>
            <button
              type="button"
              aria-label="设置"
              onClick={() => setUtilityModal('settings')}
              className="flex size-7 items-center justify-center rounded-lg border border-[#7e5539] bg-[#23121fcc] text-xs text-[#eed0b2] hover:border-[#ffd699] hover:bg-[#3d1a33] transition"
            >
              <Settings className="size-3.5 text-[#f3ca88]" />
            </button>
          </div>
        </div>
      </div>

      {status !== 'ok' && (
        <p
          role="alert"
          data-testid="collection-storage-error"
          className="rounded-lg border border-red-400/60 bg-red-950/35 p-3 text-xs text-red-100"
        >
          {status === 'corrupt'
            ? '检测到收藏存档损坏，已停止写入。原始数据完整保留。'
            : '当前浏览器无法保存收藏记录，抽取和打造已停用。'}
        </p>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. THREE-COLUMN GACHA STAGE                                   */}
      {/* ------------------------------------------------------------- */}
      <div className="gothic-summon-stage" data-testid="gothic-summon-stage">
        {/* LEFT COLUMN: 5 Pools Navigation */}
        <nav className="gothic-summon-banners" aria-label="预览五张人物契约">
          {CHARACTER_CARDS.slice()
            .reverse()
            .map((card, idx) => {
              const poolData = [
                { title: '「神话·月蚀」', sub: '月纱 · 概率提升', tag: '剩余 20 天' },
                { title: '「红月之邀」', sub: '限定角色复刻', tag: '' },
                { title: '「永夜挣扎」', sub: '常驻召唤', tag: '' },
                { title: '「羁绊回响」', sub: '自选UP', tag: '' },
                { title: '「记忆残章」', sub: '剧情卡池', tag: '' },
              ];
              const p = poolData[idx] || { title: card.title, sub: card.rarity, tag: '' };
              const isSelected = featured === card.key;
              return (
                <button
                  key={card.key}
                  type="button"
                  data-testid={'summon-preview-' + card.key}
                  aria-pressed={isSelected}
                  onClick={() => setFeatured(card.key)}
                  className={
                    'gothic-summon-banner group relative overflow-hidden rounded-lg transition-all ' +
                    (isSelected
                      ? 'border-[#ff5978] bg-gradient-to-r from-[#591428] via-[#351020] to-[#1a0a18] shadow-[0_0_20px_#dc254866,inset_0_1px_#ffd3b75c]'
                      : 'border-[#ae8b6877] bg-gradient-to-r from-[#24111ef2] to-[#140b17f2] hover:border-[#ffd699]')
                  }
                  data-tier={card.tier}
                >
                  <Portrait id={card.character} />
                  <span className="gothic-summon-banner-copy flex-1 min-w-0">
                    <strong className="block text-xs sm:text-sm font-bold truncate text-[#ffebcc] group-hover:text-white">
                      {p.title}
                    </strong>
                    <small className="block text-[10px] text-[#c9a786] truncate">
                      {p.sub}
                    </small>
                    {p.tag && (
                      <span className="mt-0.5 inline-block rounded-full bg-[#bf1d3c] px-1.5 py-0.2 text-[8px] font-extrabold text-white shadow-sm">
                        {p.tag}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
        </nav>

        {/* CENTER COLUMN: Hero Stage with Backdrop & Controls */}
        <div
          className="gothic-summon-hero flex flex-col justify-between p-3 sm:p-5 relative overflow-hidden rounded-xl"
          data-testid="summon-featured-portrait"
          data-tier={feature.tier}
        >
          <div className="gothic-summon-hero-moon pointer-events-none absolute top-2 right-6 opacity-25" aria-hidden="true">
            <Moon className="size-44 text-[#ff9ebb]" />
          </div>

          {/* Stained Glass & Velvet Sofa Hero Image Backdrop */}
          {feature.character === 'yuesha' ? (
            <Image
              src="/assets/aistudio/Gothic_Moonlit_Summoning_Screen_8181b3a5.png"
              unoptimized
              alt="月纱在暗红天鹅绒长椅上的神话月蚀绘卷"
              fill
              sizes="(max-width:700px) 100vw, 900px"
              priority
              className="gothic-summon-hero-image object-cover object-[50%_25%]"
            />
          ) : (
            <div className="gothic-summon-worker">
              <WorkerArtwork
                id={feature.character}
                name={CHARACTER_PROFILES[feature.character].name}
              />
            </div>
          )}

          {/* Interactive Dialogue Quote */}
          <div
            onClick={() => setQuoteIndex((prev) => (prev + 1) % quotes.length)}
            className="cursor-pointer self-end relative z-10 rounded-xl border border-[#c49a62aa] bg-[#1d0b1aee] px-3.5 py-1.5 text-xs text-[#ffeacc] shadow-[0_4px_20px_#000c] backdrop-blur-md hover:scale-105 transition"
          >
            <p className="italic font-serif">{quotes[quoteIndex]}</p>
          </div>

          {/* Center Stage Content */}
          <div className="relative z-10 text-center my-auto py-4">
            <span className="text-[10px] tracking-[.28em] text-[#ffc66e] uppercase flex items-center justify-center gap-1 font-semibold">
              <Sparkles className="size-3 text-[#ffc66e]" />
              <span>MYTHIC LUNAR ECLIPSE</span>
              <Sparkles className="size-3 text-[#ffc66e]" />
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-[.18em] text-[#fff4e2] drop-shadow-[0_4px_16px_#000] font-serif">
              神话 · 月蚀
            </h2>
            <p className="mt-1 text-xs sm:text-sm tracking-wider text-[#e8cbb0] drop-shadow-[0_2px_6px_#000]">
              当月光被吞噬，唯有你仍在我眼中。
            </p>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#ad7a4f99] bg-[#230f1fee] px-3.5 py-1 text-[11px] text-[#f5d9bd] shadow-lg backdrop-blur-sm">
              <span>限定角色「月纱」出现概率提升 · 2024/10/24 - 2024/11/13</span>
              <button
                type="button"
                onClick={() => setShowDetails(true)}
                className="flex items-center gap-1 text-[#ffc66e] font-semibold hover:underline"
              >
                <span>查看详情</span>
                <Search className="size-3" />
              </button>
            </div>
          </div>

          {/* Gacha Controls Deck */}
          <div className="relative z-10 flex flex-col items-center gap-2 mt-auto">
            <div className="flex w-full items-center justify-center gap-2 sm:gap-3">
              {/* History Button */}
              <button
                type="button"
                onClick={() => setShowHistory(true)}
                className="group flex flex-col items-center justify-center size-12 sm:size-14 rounded-full border border-[#c49a6299] bg-[radial-gradient(ellipse_at_center,#3b1b30,#1c0d1b)] text-[9px] sm:text-[10px] text-[#f7dcba] shadow-[0_4px_12px_#0008,inset_0_1px_#ffe4b540] hover:border-[#ffd699] hover:scale-105 transition"
              >
                <History className="size-4 sm:size-5 text-[#ffc66e] group-hover:scale-110 transition" />
                <span className="mt-0.5 font-serif font-bold">召唤记录</span>
              </button>

              {/* Single Summon Button */}
              <button
                ref={summonButton}
                type="button"
                data-testid="collection-summon"
                disabled={status !== 'ok' || life.status !== 'ok' || available < 1 || Boolean(reveal)}
                onClick={summon}
                className="group relative flex flex-1 flex-col items-center justify-center min-h-[50px] sm:min-h-[58px] rounded-xl border-2 border-[#f2d09e] bg-gradient-to-b from-[#fbf5eb] via-[#ede0cc] to-[#cfba9b] px-3 py-1.5 text-stone-900 shadow-[inset_0_2px_0_#ffffff,0_4px_16px_#00000088] hover:brightness-105 active:scale-95 transition disabled:opacity-40"
              >
                <span className="text-xs sm:text-sm font-black tracking-widest text-[#2c1b14]">单次召唤</span>
                <span className="flex items-center gap-1 text-[11px] font-bold text-[#6d4a25]">
                  <Ticket className="size-3.5 text-[#b07832]" />
                  <span>× 1</span>
                </span>
              </button>

              {/* Ten-Fold Summon Button */}
              <button
                type="button"
                data-testid="collection-summon-ten"
                disabled={status !== 'ok' || life.status !== 'ok' || Boolean(reveal)}
                onClick={summonTen}
                className="group relative flex flex-1 flex-col items-center justify-center min-h-[50px] sm:min-h-[58px] rounded-xl border-2 border-[#ffa959] bg-gradient-to-r from-[#9b1335] via-[#cf1c48] to-[#800f28] px-3 py-1.5 text-[#fff1d6] shadow-[0_0_24px_#e11d4899,inset_0_1px_#ff9ebb88] hover:brightness-110 active:scale-95 transition disabled:opacity-40"
              >
                <span className="text-xs sm:text-sm font-black tracking-widest text-[#fff1d6] drop-shadow-[0_1px_4px_#000]">十连召唤</span>
                <span className="flex items-center gap-1 text-[11px] font-bold text-[#ffd7a8]">
                  <Ticket className="size-3.5 text-[#ffc66e]" />
                  <span>× 10</span>
                </span>
              </button>

              {/* Pool Details Button */}
              <button
                type="button"
                onClick={() => setShowDetails(true)}
                className="group flex flex-col items-center justify-center size-12 sm:size-14 rounded-full border border-[#c49a6299] bg-[radial-gradient(ellipse_at_center,#3b1b30,#1c0d1b)] text-[9px] sm:text-[10px] text-[#f7dcba] shadow-[0_4px_12px_#0008,inset_0_1px_#ffe4b540] hover:border-[#ffd699] hover:scale-105 transition"
              >
                <Scroll className="size-4 sm:size-5 text-[#ffc66e] group-hover:scale-110 transition" />
                <span className="mt-0.5 font-serif font-bold">卡池详情</span>
              </button>
            </div>

            {/* Pity Indicator */}
            <p className="text-[10px] sm:text-xs font-semibold text-[#f8d8b4] tracking-wider drop-shadow-sm flex items-center justify-center gap-1">
              <Sparkles className="size-3 text-[#ffc66e]" />
              <span>再召唤</span>
              <span className="text-[#ffc66e] font-bold">{pityCountdown}</span>
              <span>次内必得</span>
              <span className="rounded bg-gradient-to-r from-[#ffd700] to-[#ff4500] px-1 text-[10px] font-extrabold text-black">SSR</span>
              <span>角色</span>
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: SSR Tarot Card, Probabilities & UP Characters */}
        <div className="gothic-summon-sidebar">
          {/* Framed SSR Card */}
          <div className="rounded-xl border-2 border-[#d4aa70] bg-[#1a0b18f0] p-2.5 shadow-lg">
            <div className="flex items-center justify-between text-xs">
              <span className="rounded bg-gradient-to-r from-[#ffd700] to-[#ff4500] px-1.5 py-0.5 text-[9px] font-extrabold text-black">
                SSR
              </span>
              <strong className="text-[#ffe6c2] flex items-center gap-1">
                <span>月纱</span>
                <Moon className="size-3 text-[#f3ca88]" />
              </strong>
              <small className="text-[10px] text-[#c9a786]">✦ 神话 · 月蚀</small>
            </div>
            <p className="mt-1 text-[10px] text-[#dec3ac] italic leading-relaxed">
              沉入永夜吧—— 这一次，换我来拥抱你。
            </p>
            <div className="mt-2.5 grid grid-cols-2 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setShowTrial(true)}
                className="flex items-center justify-center gap-1 rounded border border-[#e5ba79] bg-[#3a1d30] py-1.5 text-center font-bold text-[#ffe2be] hover:bg-[#522542] transition"
              >
                <Play className="size-3 fill-[#ffe2be]" />
                <span>角色试玩</span>
              </button>
              <button
                type="button"
                onClick={() => setShowArchive(true)}
                className="flex items-center justify-center gap-1 rounded border border-[#a67c52] bg-[#221220] py-1.5 text-center font-bold text-[#e0bfa3] hover:bg-[#341b30] transition"
              >
                <BookOpen className="size-3" />
                <span>查看档案</span>
              </button>
            </div>
          </div>

          {/* Probabilities Table */}
          <div className="gothic-summon-odds" data-testid="collection-odds">
            <h4>召唤概率公示</h4>
            {CHARACTER_CARDS.slice()
              .reverse()
              .map((card) => (
                <div key={card.key} className="gothic-summon-odd-row" data-tier={card.tier}>
                  <span>{card.rarity}</span>
                  <span className="tabular-nums font-semibold">{card.weight.toFixed(2)}%</span>
                </div>
              ))}
            <small>神话·月蚀 1.00% · 传说 5.00% · 精英 17.00% · 稀有 31.00% · 常规 46.00%</small>
          </div>

          {/* Collection Progress */}
          <div className="rounded-lg border border-[#7a543888] bg-[#21121d] p-2 text-xs">
            <div className="flex justify-between text-[10px] text-[#ddc1a7]">
              <span>收集进度 {ownedCount} / 5</span>
              <button
                type="button"
                onClick={() => setShowReplenish(true)}
                className="flex items-center gap-1 text-[#ffc66e] hover:underline"
              >
                <Gift className="size-3" />
                <span>下个奖励 &gt;</span>
              </button>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[#120713]">
              <div
                className="h-full bg-gradient-to-r from-[#d97706] to-[#dc2626]"
                style={{ width: `${(ownedCount / 5) * 100}%` }}
              />
            </div>
          </div>

          {/* Featured UP Character Avatars */}
          <div>
            <span className="block text-[10px] text-[#cca585] mb-1">本期概率提升角色</span>
            <div className="flex items-center justify-between gap-1">
              {[
                { name: '月纱', avatar: '/art/yuesha-avatar-v3.webp', up: true },
                { name: '达米安', avatar: '/art/yuesha-bust-v3.webp', up: false },
                { name: '艾莲娜', avatar: '/art/yuesha-portrait-v3.webp', up: false },
                { name: '塞拉菲娜', avatar: '/art/lobby-hero-v3.webp', up: false },
                { name: '维多利亚', avatar: '/art/yuesha-avatar-v3.webp', up: false },
              ].map((c, i) => (
                <div
                  key={i}
                  title={c.name}
                  onClick={() => setShowArchive(true)}
                  className="relative size-9 cursor-pointer overflow-hidden rounded-full border border-[#b88c58] hover:scale-110 transition shadow-sm"
                >
                  <Image src={c.avatar} alt={c.name} fill className="object-cover object-top" />
                  {c.up && (
                    <span className="absolute bottom-0 right-0 rounded bg-[#ff2244] px-0.5 text-[7px] font-bold text-white shadow-sm">
                      UP
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Single Pull Reveal Modal */}
      <AnimatePresence>
        {reveal && (
          <CharacterSummonReveal
            key={reveal.card}
            cardKey={reveal.card}
            duplicate={reveal.duplicate}
            onClose={dismissReveal}
          />
        )}
      </AnimatePresence>

      {/* Ten-Fold Reveal Modal */}
      {multiModal.open && (
        <SummonRitualModal
          characters={multiModal.characters}
          onClose={() => setMultiModal({ open: false, characters: [] })}
          onSummonAgain={summonTen}
        />
      )}

      {/* Helper Dialogs */}
      {showHistory && (
        <SummonHistoryModal records={historyRecords} onClose={() => setShowHistory(false)} />
      )}
      {showDetails && (
        <PoolDetailsModal pool={GACHA_POOLS[0]} onClose={() => setShowDetails(false)} />
      )}
      {showArchive && <CharacterArchiveModal onClose={() => setShowArchive(false)} />}
      {showTrial && (
        <CharacterTrialModal
          onRewardClaimed={() => setNotice('试玩完成！已领取 1 张契约信物。')}
          onClose={() => setShowTrial(false)}
        />
      )}
      {showReplenish && (
        <CurrencyReplenishModal
          onAddTickets={() => setNotice('契约信物补给成功！')}
          onAddCrystals={(n) => setBloodCrystals((p) => p + n)}
          onAddMoonstones={(n) => setMoonstones((p) => p + n)}
          onClose={() => setShowReplenish(false)}
        />
      )}
      {utilityModal && (
        <UtilityModal type={utilityModal} onClose={() => setUtilityModal(null)} />
      )}

      {notice && (
        <p
          role="status"
          data-testid="collection-feedback"
          className="rounded-lg border border-[#c09b727e] bg-[#41283a] p-2 text-xs leading-5 text-[#ffe7c9]"
        >
          {notice}
        </p>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. CHARACTER CARDS GALLERY                                    */}
      {/* ------------------------------------------------------------- */}
      <div>
        <h3 className="mb-2 text-sm font-semibold text-[#f9d3ac]">人物契约图鉴</h3>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {CHARACTER_CARDS.map((card) => {
            const count = collection.draws.filter((key) => key === card.key).length;
            const owned = count > 0;
            const children = (
              <>
                <Portrait id={card.character} />
                <span className="min-w-0 flex-1 text-left">
                  <span className="block text-xs font-bold leading-5">{card.title}</span>
                  <span className="mt-1 block text-[10px]">
                    {owned ? '已收录 · ' + count + ' 张' : '待收录 · ' + card.rarity}
                  </span>
                </span>
              </>
            );
            const cls =
              'flex min-h-[72px] w-full items-center gap-2 rounded-lg border p-2 transition ' +
              colors[card.rarity] +
              (owned ? ' hover:brightness-110' : ' opacity-60');
            return owned ? (
              <button
                type="button"
                key={card.key}
                onClick={() => setChosen(card.key)}
                data-testid={'collection-card-' + card.key}
                aria-pressed={selectedCard?.key === card.key}
                className={
                  cls +
                  (selectedCard?.key === card.key ? ' outline outline-2 outline-[#ffdb9b]' : '')
                }
              >
                {children}
              </button>
            ) : (
              <div
                key={card.key}
                data-testid={'collection-card-' + card.key}
                className={cls}
              >
                {children}
              </div>
            );
          })}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. EQUIPMENT FORGE & JEWELRY WORKSHOP                         */}
      {/* ------------------------------------------------------------- */}
      <div className="space-y-2 border-t border-[#a780615c] pt-3" data-testid="collection-forge">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-sm font-semibold text-[#f9d3ac]">首饰与装备工坊</h3>
          <span className="text-[11px] text-[#ddc3a9]" data-testid="collection-active-character">
            {selectedId ? '当前角色：' + CHARACTER_PROFILES[selectedId].name : '先召唤角色卡'}
          </span>
        </div>
        <p className="text-[11px] leading-5 text-[#bda38f]">
          每次召唤获得碎片，重复契约获得额外碎片（当前持有{' '}
          <strong data-testid="collection-shards" className="text-[#ffddab]">
            {collection.shards}
          </strong>{' '}
          碎片）。打造后可给已收录角色装备，真正提升档案能力。
        </p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {FORGE_RECIPES.map((recipe) => {
            const owned = collection.inventory.includes(recipe.id);
            const current =
              selectedId && collection.equipped[selectedId]?.[recipe.slot] === recipe.id;
            return (
              <div
                key={recipe.id}
                className="flex min-w-0 flex-col justify-between gap-2 rounded-lg border border-[#80634982] bg-[#2a1d29] p-3"
              >
                <div>
                  <p className="text-xs font-semibold text-[#ffe2bf]">
                    {recipe.name}{' '}
                    <span className="text-[10px] text-[#be9f8b]">
                      · {recipe.slot === 'jewelry' ? '首饰' : '装备'}
                    </span>
                  </p>
                  <p className="mt-1 text-[11px] text-[#e0c3ac]">{recipe.description}</p>
                </div>
                <button
                  type="button"
                  data-testid={'collection-gear-' + recipe.id}
                  disabled={
                    status !== 'ok' ||
                    (owned ? !selectedId || Boolean(current) : collection.shards < recipe.cost)
                  }
                  onClick={() => (owned ? equip(recipe.id) : forge(recipe.id))}
                  className="min-h-10 rounded-md border border-[#c39b70] bg-[#583444] px-2 text-xs font-semibold text-[#ffe9cf] hover:brightness-110 disabled:opacity-45"
                >
                  {current ? '已佩戴' : owned ? '给当前角色装备' : '打造 · ' + recipe.cost + ' 碎片'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
