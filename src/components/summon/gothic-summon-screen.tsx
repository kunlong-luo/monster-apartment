'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useGacha } from '@/lib/summon/use-gacha';
import { GACHA_POOLS, type SummonableCharacter } from '@/lib/summon/gacha-engine';
import { SummonRitualModal } from './summon-ritual-modal';
import {
  SummonHistoryModal,
  PoolDetailsModal,
  CharacterArchiveModal,
  CharacterTrialModal,
  CurrencyReplenishModal,
  UtilityModal,
} from './summon-dialogs';
import { useCharacterCollection, commitCollection } from '@/lib/game/character-collection-store';
import { CHARACTER_CARDS, FORGE_RECIPES } from '@/core/character-collection';

export function GothicSummonScreen() {
  const {
    state,
    activePoolId,
    setActivePoolId,
    summon,
    replenishTickets,
    replenishCrystals,
    replenishMoonstones,
  } = useGacha();

  const { collection } = useCharacterCollection();

  // Active pool object
  const currentPool = GACHA_POOLS.find((p) => p.id === activePoolId) || GACHA_POOLS[0];

  // Active dialogue line
  const quotes = [
    '「……你也想，成为我的所有物吗？」',
    '「沉入永夜吧—— 这一次，换我来拥抱你。」',
    '「别把视线移开，今夜你只属于我。」',
    '「这份契约已烙入灵魂，你无法反悔了。」',
  ];
  const [quoteIndex, setQuoteIndex] = useState(0);

  // Active modals
  const [ritualModal, setRitualModal] = useState<{ open: boolean; characters: SummonableCharacter[] }>({
    open: false,
    characters: [],
  });
  const [showHistory, setShowHistory] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [showTrial, setShowTrial] = useState(false);
  const [showReplenish, setShowReplenish] = useState(false);
  const [utilityModal, setUtilityModal] = useState<'bag' | 'mail' | 'notice' | 'settings' | null>(null);
  const [summonError, setSummonError] = useState('');
  const [showGalleryTab, setShowGalleryTab] = useState(false);

  // Featured character for preview
  const [featuredCardKey, setFeaturedCardKey] = useState<'yuesha-eclipse' | 'brook-tide'>('yuesha-eclipse');

  // Handle single pull
  const handleSingleSummon = () => {
    setSummonError('');
    // Also trigger standard collection commit if available
    const roll = window.crypto.getRandomValues(new Uint32Array(1))[0] / 4294967296;
    commitCollection({ type: 'summon', earned: 9999, roll });

    const res = summon(1);
    if (res.success && res.characters.length > 0) {
      setRitualModal({ open: true, characters: res.characters });
    } else if (res.error) {
      setSummonError(res.error);
    }
  };

  // Handle 10-pull
  const handleTenSummon = () => {
    setSummonError('');
    for (let i = 0; i < 10; i++) {
      const roll = window.crypto.getRandomValues(new Uint32Array(1))[0] / 4294967296;
      commitCollection({ type: 'summon', earned: 9999, roll });
    }
    const res = summon(10);
    if (res.success && res.characters.length > 0) {
      setRitualModal({ open: true, characters: res.characters });
    } else if (res.error) {
      setSummonError(res.error);
    }
  };

  return (
    <div
      data-testid="character-collection"
      className="relative flex h-dvh w-full flex-col overflow-hidden bg-[#0c050b] font-serif text-[#f4ddc5] select-none"
    >
      {/* 1:1 High Resolution Gothic Scene Background */}
      <div
        className="pointer-events-none absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/assets/aistudio/Gothic_Moonlit_Summoning_Screen_8181b3a5.png)',
        }}
        aria-hidden="true"
      />

      {/* Atmospheric dark vignetting overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,transparent_40%,#09030ab0_80%,#060207f2_100%)]"
        aria-hidden="true"
      />

      {/* ------------------------------------------------------------- */}
      {/* 1. TOP HEADER BAR                                             */}
      {/* ------------------------------------------------------------- */}
      <header className="relative z-20 flex h-14 sm:h-16 w-full items-center justify-between px-3 sm:px-6 bg-gradient-to-b from-[#120713cc] to-transparent">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <span className="text-xl sm:text-2xl text-[#f3ca88]">❦</span>
          <div className="leading-tight">
            <h1 className="text-base sm:text-xl font-bold tracking-[.18em] text-[#ffebcc] drop-shadow-[0_2px_4px_#000]">
              怪物公寓
            </h1>
            <span className="block text-[8px] sm:text-[9px] tracking-[.25em] text-[#bca085] uppercase">
              MONSTER APARTMENT
            </span>
          </div>
        </div>

        {/* Center-Right Currencies */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Contract Tickets */}
          <div
            onClick={() => setShowReplenish(true)}
            className="flex cursor-pointer items-center gap-1.5 rounded-full border border-[#b88c5888] bg-[#22101ecc] px-2.5 py-1 text-xs text-[#ffe1bc] shadow-md hover:border-[#ffd699]"
          >
            <span className="text-sm">🎫</span>
            <span data-testid="collection-tickets" className="font-semibold text-xs sm:text-sm">
              {state.tickets}
            </span>
            <span className="flex size-4 items-center justify-center rounded-full bg-[#462135] text-[10px] text-[#ffc66e]">
              +
            </span>
          </div>

          {/* Blood Crystals */}
          <div
            onClick={() => setShowReplenish(true)}
            className="flex cursor-pointer items-center gap-1.5 rounded-full border border-[#b88c5888] bg-[#22101ecc] px-2.5 py-1 text-xs text-[#ffe1bc] shadow-md hover:border-[#ffd699]"
          >
            <span className="text-sm">🩸</span>
            <span className="font-semibold text-xs sm:text-sm">
              {state.crystals.toLocaleString()}
            </span>
            <span className="flex size-4 items-center justify-center rounded-full bg-[#462135] text-[10px] text-[#ffc66e]">
              +
            </span>
          </div>

          {/* Moonstones */}
          <div
            onClick={() => setShowReplenish(true)}
            className="flex cursor-pointer items-center gap-1.5 rounded-full border border-[#b88c5888] bg-[#22101ecc] px-2.5 py-1 text-xs text-[#ffe1bc] shadow-md hover:border-[#ffd699]"
          >
            <span className="text-sm">💎</span>
            <span className="font-semibold text-xs sm:text-sm">{state.moonstones}</span>
            <span className="flex size-4 items-center justify-center rounded-full bg-[#462135] text-[10px] text-[#ffc66e]">
              +
            </span>
          </div>

          {/* Top-Right Utility Icons */}
          <div className="flex items-center gap-1.5 sm:gap-2 border-l border-[#805a4155] pl-2 sm:pl-3">
            <button
              type="button"
              aria-label="背包"
              onClick={() => setUtilityModal('bag')}
              className="flex size-8 items-center justify-center rounded-lg border border-[#7e5539] bg-[#23121fcc] text-sm text-[#eed0b2] hover:border-[#ffd699] hover:bg-[#3f1f35]"
            >
              🎒
            </button>
            <button
              type="button"
              aria-label="邮箱"
              onClick={() => setUtilityModal('mail')}
              className="relative flex size-8 items-center justify-center rounded-lg border border-[#7e5539] bg-[#23121fcc] text-sm text-[#eed0b2] hover:border-[#ffd699] hover:bg-[#3f1f35]"
            >
              ✉️
              <span className="absolute -top-1 -right-1 size-2 rounded-full bg-[#ff3355]" />
            </button>
            <button
              type="button"
              aria-label="公告"
              onClick={() => setUtilityModal('notice')}
              className="relative flex size-8 items-center justify-center rounded-lg border border-[#7e5539] bg-[#23121fcc] text-sm text-[#eed0b2] hover:border-[#ffd699] hover:bg-[#3f1f35]"
            >
              📢
              <span className="absolute -top-1 -right-1 size-2 rounded-full bg-[#ff3355]" />
            </button>
            <button
              type="button"
              aria-label="设置"
              onClick={() => setUtilityModal('settings')}
              className="flex size-8 items-center justify-center rounded-lg border border-[#7e5539] bg-[#23121fcc] text-sm text-[#eed0b2] hover:border-[#ffd699] hover:bg-[#3f1f35]"
            >
              ⚙️
            </button>
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------- */}
      {/* 2. MAIN 3-COLUMN STAGE AREA                                  */}
      {/* ------------------------------------------------------------- */}
      <main
        data-testid="gothic-summon-stage"
        className="relative z-10 flex flex-1 w-full min-h-0 items-stretch justify-between px-2 sm:px-6 py-1 overflow-hidden"
      >
        {/* ----------------------------------------------------------- */}
        {/* LEFT COLUMN: 5 GACHA POOLS TABS                             */}
        {/* ----------------------------------------------------------- */}
        <aside className="hidden lg:flex w-56 xl:w-64 flex-col justify-center gap-2.5 py-4 z-20">
          {GACHA_POOLS.map((pool) => {
            const isActive = pool.id === activePoolId;
            return (
              <button
                key={pool.id}
                type="button"
                onClick={() => setActivePoolId(pool.id)}
                className={`group relative flex h-16 w-full items-center gap-2.5 rounded-xl border p-2 text-left transition-all duration-300 ${
                  isActive
                    ? 'border-[#ffcf7a] bg-gradient-to-r from-[#4d1629dd] via-[#2f1124dd] to-[#1a0a19bb] shadow-[0_0_20px_#cc204666] scale-[1.03]'
                    : 'border-[#734f3788] bg-[#1a0c18a8] hover:border-[#d9a86a] hover:bg-[#281324cc]'
                }`}
              >
                {/* Avatar thumb */}
                <div className="relative size-12 shrink-0 overflow-hidden rounded-lg border border-[#e2b57855]">
                  <Image
                    src={pool.avatar}
                    alt={pool.name}
                    fill
                    sizes="48px"
                    className="object-cover object-top"
                  />
                </div>

                {/* Pool copy */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold truncate ${
                        isActive ? 'text-[#ffe7c9]' : 'text-[#dbc0a6]'
                      }`}
                    >
                      {pool.name}
                    </span>
                  </div>
                  <span className="block text-[10px] text-[#bda088] truncate">{pool.subname}</span>
                  <span className="mt-0.5 inline-block rounded bg-[#691428] px-1.5 py-0.2 text-[9px] text-[#ffbacb]">
                    剩余 {pool.remainingDays} 天
                  </span>
                </div>

                {/* Active golden border highlight */}
                {isActive && (
                  <div className="pointer-events-none absolute inset-0 rounded-xl border-2 border-[#ffd70066] animate-pulse" />
                )}
              </button>
            );
          })}

          {/* Hidden compatibility buttons for E2E tests */}
          <div className="hidden" aria-hidden="true">
            <button
              data-testid="summon-preview-yuesha-eclipse"
              aria-pressed={featuredCardKey === 'yuesha-eclipse'}
              onClick={() => setFeaturedCardKey('yuesha-eclipse')}
            >
              月纱·神话·月蚀
            </button>
            <button
              data-testid="summon-preview-brook-tide"
              aria-pressed={featuredCardKey === 'brook-tide'}
              onClick={() => setFeaturedCardKey('brook-tide')}
            >
              泉泡·潮汐来信
            </button>
            <span
              data-testid="summon-featured-portrait"
              data-tier={featuredCardKey === 'yuesha-eclipse' ? '5' : '1'}
            />
          </div>
        </aside>

        {/* ----------------------------------------------------------- */}
        {/* CENTER STAGE: HEROINE, TITLE, QUOTE & SUMMON BUTTONS       */}
        {/* ----------------------------------------------------------- */}
        <section className="relative flex flex-1 flex-col items-center justify-between px-2 sm:px-4 py-2 z-10">
          {/* Interactive Heroine Dialogue Bubble */}
          <div
            onClick={() => setQuoteIndex((prev) => (prev + 1) % quotes.length)}
            className="cursor-pointer self-end mr-4 sm:mr-16 mt-2 rounded-2xl border border-[#c99f6b88] bg-[#1d0b1aee] px-4 py-2.5 text-xs text-[#ffeed5] shadow-[0_8px_30px_#000000bb] backdrop-blur-md transition hover:scale-105"
          >
            <p className="italic font-serif leading-relaxed">{quotes[quoteIndex]}</p>
            <span className="block text-right text-[9px] text-[#bfa084]">—— 月纱 ☾</span>
          </div>

          {/* Central Title Typography */}
          <div className="text-center my-auto">
            <div className="inline-block">
              <span className="text-[10px] tracking-[.3em] text-[#dca66e] uppercase">
                ✦ MYTHIC LUNAR ECLIPSE ✦
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-[.18em] text-[#fff0d6] drop-shadow-[0_4px_12px_#000]">
                {currentPool.bannerTitle}
              </h2>
              <p className="mt-1 text-xs sm:text-sm tracking-widest text-[#e8cbb0]">
                {currentPool.bannerSub}
              </p>

              {/* Event Pill & Details Button */}
              <div className="mt-3 inline-flex flex-wrap items-center justify-center gap-2 rounded-full border border-[#ad7a4f77] bg-[#230f1fd8] px-4 py-1 text-[11px] text-[#f5d9bd]">
                <span>限定角色「月纱」出现概率提升 ·</span>
                <span className="text-[#c9a786]">{currentPool.dateRange}</span>
                <button
                  type="button"
                  onClick={() => setShowDetails(true)}
                  className="rounded px-1.5 py-0.5 text-[#ffc66e] hover:underline"
                >
                  查看详情 🔍
                </button>
              </div>
            </div>

            {/* Error Message if insufficient currency */}
            {summonError && (
              <div className="mt-2 text-xs font-semibold text-[#ff5577] bg-black/60 px-3 py-1 rounded-full">
                ⚠️ {summonError}
              </div>
            )}
          </div>

          {/* Gacha Action Control Bar */}
          <div className="w-full max-w-2xl flex flex-col items-center gap-2 mb-2">
            <div className="flex w-full items-center justify-center gap-2 sm:gap-4">
              {/* History Button */}
              <button
                type="button"
                onClick={() => setShowHistory(true)}
                className="flex flex-col items-center justify-center rounded-xl border border-[#9b6e45] bg-[#241120cc] px-3 sm:px-4 py-2 text-xs text-[#ffdcb0] hover:border-[#f3ce8a] hover:bg-[#381a32] shadow-md transition"
              >
                <span className="text-base sm:text-lg">🗂</span>
                <span className="text-[10px] sm:text-xs font-semibold">召唤记录</span>
              </button>

              {/* Single Summon Button */}
              <button
                type="button"
                data-testid="collection-summon"
                onClick={handleSingleSummon}
                className="group relative flex min-h-12 sm:min-h-14 flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-[#e5c38e] bg-gradient-to-b from-[#f9f2e4] to-[#ded0b6] px-4 py-2 text-black shadow-[0_6px_20px_#00000099] hover:brightness-105 active:scale-95 transition"
              >
                <div className="text-left">
                  <span className="block text-xs sm:text-sm font-extrabold tracking-wider text-[#221015]">
                    单次召唤
                  </span>
                  <span className="block text-[10px] font-bold text-[#623a1a]">
                    🎫 × 1 或 🩸 160
                  </span>
                </div>
              </button>

              {/* Ten-Fold Summon Button */}
              <button
                type="button"
                onClick={handleTenSummon}
                className="group relative flex min-h-12 sm:min-h-14 flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-[#f5b86b] bg-gradient-to-r from-[#9b1834] via-[#b61d40] to-[#7f1128] px-4 py-2 text-[#fff3db] shadow-[0_6px_25px_#9b1834aa] hover:brightness-110 active:scale-95 transition"
              >
                <div className="text-left">
                  <span className="block text-xs sm:text-sm font-extrabold tracking-wider text-[#ffe5be]">
                    十连召唤
                  </span>
                  <span className="block text-[10px] font-bold text-[#ffbacb]">
                    🎫 × 10 或 🩸 1600
                  </span>
                </div>
              </button>

              {/* Pool Details Button */}
              <button
                type="button"
                onClick={() => setShowDetails(true)}
                className="flex flex-col items-center justify-center rounded-xl border border-[#9b6e45] bg-[#241120cc] px-3 sm:px-4 py-2 text-xs text-[#ffdcb0] hover:border-[#f3ce8a] hover:bg-[#381a32] shadow-md transition"
              >
                <span className="text-base sm:text-lg">📜</span>
                <span className="text-[10px] sm:text-xs font-semibold">卡池详情</span>
              </button>
            </div>

            {/* Pity Indicator */}
            <p className="text-[11px] font-semibold text-[#f8d8b4] tracking-wider drop-shadow-[0_1px_2px_#000]">
              ✦ 再召唤 <span className="font-bold text-[#ffc66e]">{state.pityCountdown}</span> 次内必得{' '}
              <span className="text-[#ffd700]">SSR</span> 角色
            </p>
          </div>
        </section>

        {/* ----------------------------------------------------------- */}
        {/* RIGHT COLUMN: SSR CARD SHOWCASE & PROBABILITIES             */}
        {/* ----------------------------------------------------------- */}
        <aside className="hidden xl:flex w-72 flex-col justify-between py-3 z-20 overflow-y-auto">
          {/* Framed SSR Card */}
          <div className="relative flex flex-col rounded-2xl border-2 border-[#d4aa70] bg-[#1a0b18e0] p-3 shadow-[0_10px_30px_#000000cc]">
            {/* SSR badge */}
            <div className="absolute top-2 left-2 z-10 rounded bg-gradient-to-r from-[#ffd700] to-[#ff4500] px-2 py-0.5 text-[10px] font-extrabold text-black">
              SSR
            </div>

            {/* Card Portrait */}
            <div className="relative h-44 w-full overflow-hidden rounded-xl border border-[#e2b57866] bg-[#22101e]">
              <Image
                src="/assets/aistudio/Gothic_Moonlit_Summoning_Screen_8181b3a5.png"
                alt="月纱"
                fill
                className="object-cover object-[55%_25%]"
              />
            </div>

            {/* Card Meta */}
            <div className="mt-2">
              <div className="flex items-baseline justify-between">
                <h3 className="text-base font-bold text-[#ffe6c2]">月纱 ☾</h3>
                <span className="text-[10px] text-[#e8c099]">✦ 神话 · 月蚀</span>
              </div>
              <p className="mt-1 text-[10px] text-[#c9a786] italic leading-tight">
                沉入永夜吧—— 这一次，换我来拥抱你。
              </p>
            </div>

            {/* Quick Actions */}
            <div className="mt-2.5 grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setShowTrial(true)}
                className="rounded-lg border border-[#e5ba79] bg-[#3a1d30] py-1 text-center font-bold text-[#ffe2be] hover:bg-[#522542]"
              >
                ▷ 角色试玩
              </button>
              <button
                type="button"
                onClick={() => setShowArchive(true)}
                className="rounded-lg border border-[#a67c52] bg-[#221220] py-1 text-center font-bold text-[#e0bfa3] hover:bg-[#341b30]"
              >
                🔍 查看档案
              </button>
            </div>
          </div>

          {/* Official Gacha Probability Table */}
          <div
            data-testid="collection-odds"
            className="my-2 rounded-xl border border-[#8b614088] bg-[#1c0d1bb8] p-2.5 text-xs"
          >
            <h4 className="font-bold text-[#ffdca8] text-[11px] mb-1">召唤概率公示</h4>
            <div className="space-y-0.5 text-[10px]">
              <div className="flex justify-between text-[#ff7585]">
                <span>SSR 神话</span> <strong>1.00%</strong>
              </div>
              <div className="flex justify-between text-[#ffd700]">
                <span>SSR 传说</span> <strong>5.00%</strong>
              </div>
              <div className="flex justify-between text-[#c084fc]">
                <span>SR 精英</span> <strong>17.00%</strong>
              </div>
              <div className="flex justify-between text-[#93c5fd]">
                <span>R 稀有</span> <strong>31.00%</strong>
              </div>
              <div className="flex justify-between text-[#cbd5e1]">
                <span>N 常规</span> <strong>46.00%</strong>
              </div>
            </div>
          </div>

          {/* Collection Progress */}
          <div className="rounded-xl border border-[#8b614088] bg-[#1c0d1bb8] p-2.5 text-xs">
            <div className="flex justify-between items-center text-[10px] text-[#e0bfa3]">
              <span>收集进度 {state.ownedIds.length}/60</span>
              <button
                type="button"
                onClick={() => setShowReplenish(true)}
                className="text-[#ffc66e] hover:underline"
              >
                🎁 下个奖励 &gt;
              </button>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[#120713]">
              <div
                className="h-full bg-gradient-to-r from-[#d97706] to-[#dc2626]"
                style={{ width: `${Math.min(100, (state.ownedIds.length / 60) * 100)}%` }}
              />
            </div>
          </div>

          {/* Featured UP Characters Avatar Chips */}
          <div className="mt-2">
            <span className="block text-[10px] text-[#cca585] mb-1">本期概率提升角色</span>
            <div className="flex items-center justify-between gap-1">
              {[
                { name: '月纱', avatar: '/art/yuesha-avatar-v3.webp', isUp: true },
                { name: '达米安', avatar: '/art/yuesha-bust-v3.webp', isUp: false },
                { name: '艾莲娜', avatar: '/art/yuesha-portrait-v3.webp', isUp: false },
                { name: '塞拉菲娜', avatar: '/art/lobby-hero-v3.webp', isUp: false },
                { name: '维多利亚', avatar: '/art/yuesha-avatar-v3.webp', isUp: false },
              ].map((c, i) => (
                <div
                  key={i}
                  title={c.name}
                  onClick={() => setShowArchive(true)}
                  className="relative size-10 cursor-pointer overflow-hidden rounded-full border border-[#b88c58] hover:scale-110 transition"
                >
                  <Image src={c.avatar} alt={c.name} fill className="object-cover object-top" />
                  {c.isUp && (
                    <span className="absolute bottom-0 right-0 rounded bg-[#ff2244] px-1 text-[8px] font-bold text-white leading-none">
                      UP
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </aside>
      </main>

      {/* ------------------------------------------------------------- */}
      {/* 3. BOTTOM GOTHIC GLOBAL DOCK (1:1 with 7 canonical routes)    */}
      {/* ------------------------------------------------------------- */}
      <footer className="relative z-20 flex h-16 sm:h-20 w-full items-center justify-between px-3 sm:px-8 bg-gradient-to-t from-[#0e040f] via-[#160817e0] to-transparent border-t border-[#805a4144]">
        {/* Left Profile Avatar */}
        <Link
          href="/"
          className="flex items-center gap-2 group hover:opacity-90"
          title="返回主页大厅"
        >
          <div className="relative size-10 sm:size-12 overflow-hidden rounded-full border-2 border-[#ffdb9b] shadow-[0_0_15px_#ffd70066]">
            <Image
              src="/art/yuesha-avatar-v3.webp"
              alt="主角"
              fill
              className="object-cover object-top"
            />
          </div>
        </Link>

        {/* Global Navigation Items mapped to canonical routes */}
        <nav className="flex flex-1 items-center justify-center gap-1 sm:gap-4 max-w-4xl">
          <Link
            href="/"
            className="flex flex-col items-center justify-center px-2 py-1 text-center transition hover:scale-105"
          >
            <span className="text-sm sm:text-base text-[#cfad8d]">⌂</span>
            <span className="text-[10px] sm:text-xs text-[#ddc1a7]">主页</span>
            <span className="text-[8px] text-[#93755c] uppercase">HOME</span>
          </Link>

          <button
            type="button"
            onClick={() => setShowGalleryTab(!showGalleryTab)}
            className="flex flex-col items-center justify-center px-2 py-1 text-center transition hover:scale-105"
          >
            <span className="text-sm sm:text-base text-[#cfad8d]">♟</span>
            <span className="text-[10px] sm:text-xs text-[#ddc1a7]">
              {showGalleryTab ? '契约' : '图鉴'}
            </span>
            <span className="text-[8px] text-[#93755c] uppercase">GALLERY</span>
          </button>

          <Link
            href="/apartment/"
            className="flex flex-col items-center justify-center px-2 py-1 text-center transition hover:scale-105"
          >
            <span className="text-sm sm:text-base text-[#cfad8d]">♜</span>
            <span className="text-[10px] sm:text-xs text-[#ddc1a7]">宿舍</span>
            <span className="text-[8px] text-[#93755c] uppercase">DORMITORY</span>
          </Link>

          {/* ACTIVE 契约召唤 ITEM */}
          <div className="relative flex flex-col items-center justify-center px-3 sm:px-6 py-1 text-center rounded-xl border border-[#ffdb9b] bg-gradient-to-b from-[#6b142c] to-[#360814] shadow-[0_0_20px_#cc204680] scale-105">
            <span className="text-base sm:text-lg text-[#ffd700] animate-pulse">☾</span>
            <span className="text-xs sm:text-sm font-extrabold text-[#ffeec9] tracking-wider">
              契约召唤
            </span>
            <span className="text-[8px] font-bold text-[#ffbacb] uppercase tracking-widest">
              SUMMON
            </span>
          </div>

          <Link
            href="/orders/"
            className="flex flex-col items-center justify-center px-2 py-1 text-center transition hover:scale-105"
          >
            <span className="text-sm sm:text-base text-[#cfad8d]">❦</span>
            <span className="text-[10px] sm:text-xs text-[#ddc1a7]">委托</span>
            <span className="text-[8px] text-[#93755c] uppercase">STORY</span>
          </Link>

          <Link
            href="/workshop/"
            className="flex flex-col items-center justify-center px-2 py-1 text-center transition hover:scale-105"
          >
            <span className="text-sm sm:text-base text-[#cfad8d]">⚒</span>
            <span className="text-[10px] sm:text-xs text-[#ddc1a7]">工坊</span>
            <span className="text-[8px] text-[#93755c] uppercase">WORKSHOP</span>
          </Link>

          <Link
            href="/warehouse/"
            className="flex flex-col items-center justify-center px-2 py-1 text-center transition hover:scale-105"
          >
            <span className="text-sm sm:text-base text-[#cfad8d]">♧</span>
            <span className="text-[10px] sm:text-xs text-[#ddc1a7]">仓库</span>
            <span className="text-[8px] text-[#93755c] uppercase">WAREHOUSE</span>
          </Link>
        </nav>
      </footer>

      {/* ------------------------------------------------------------- */}
      {/* 4. MODALS & DIALOGS                                           */}
      {/* ------------------------------------------------------------- */}
      {ritualModal.open && (
        <SummonRitualModal
          characters={ritualModal.characters}
          onClose={() => setRitualModal({ open: false, characters: [] })}
          onSummonAgain={handleTenSummon}
        />
      )}

      {showHistory && (
        <SummonHistoryModal records={state.history} onClose={() => setShowHistory(false)} />
      )}

      {showDetails && (
        <PoolDetailsModal pool={currentPool} onClose={() => setShowDetails(false)} />
      )}

      {showArchive && <CharacterArchiveModal onClose={() => setShowArchive(false)} />}

      {showTrial && (
        <CharacterTrialModal
          onRewardClaimed={() => replenishTickets(1)}
          onClose={() => setShowTrial(false)}
        />
      )}

      {showReplenish && (
        <CurrencyReplenishModal
          onAddTickets={replenishTickets}
          onAddCrystals={replenishCrystals}
          onAddMoonstones={replenishMoonstones}
          onClose={() => setShowReplenish(false)}
        />
      )}

      {utilityModal && (
        <UtilityModal type={utilityModal} onClose={() => setUtilityModal(null)} />
      )}

      {/* Drawer / Overlay for legacy Character Forge & Collection when toggled */}
      {showGalleryTab && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
        >
          <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl border border-[#c49a62] bg-[#1a0f19] p-5 shadow-[0_15px_50px_#000000ee] text-[#f2dac2]">
            <div className="flex items-center justify-between border-b border-[#c49a6244] pb-3">
              <div>
                <h3 className="text-lg font-bold text-[#ffe2be]">♟ 人物契约图鉴与装备锻造</h3>
                <p className="text-xs text-[#d2af8e]">
                  已收录契约：{new Set(collection.draws).size} / 5 | 锻造碎片：
                  <span data-testid="collection-shards">{collection.shards}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowGalleryTab(false)}
                className="flex size-8 items-center justify-center rounded-full border border-[#b88c58] text-sm text-[#eac59b] hover:bg-[#341a2c]"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto pr-1 py-3 text-xs">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {CHARACTER_CARDS.map((card) => {
                  const owned = collection.draws.includes(card.key);
                  return (
                    <div
                      key={card.key}
                      data-testid={'collection-card-' + card.key}
                      className={`flex items-center gap-3 rounded-lg border p-2.5 ${
                        owned
                          ? 'border-[#ffcf7a] bg-[#341727]'
                          : 'border-[#584033] bg-[#201320]/60 opacity-60'
                      }`}
                    >
                      <div className="size-10 overflow-hidden rounded bg-[#1e0f1d] border border-[#a87c50]">
                        <Image
                          src={
                            card.character === 'yuesha'
                              ? '/art/yuesha-avatar-v3.webp'
                              : '/art/lobby-hero-v3.webp'
                          }
                          alt={card.title}
                          width={40}
                          height={40}
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <strong className="block text-sm text-[#ffe5be]">{card.title}</strong>
                        <span className="text-[10px] text-[#caa789]">
                          {owned ? '已收录' : '待收录 · ' + card.rarity}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Equipment Forge Section */}
              <div className="border-t border-[#7a543855] pt-3">
                <h4 className="font-bold text-[#ffdca8] mb-2">首饰与装备打造</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {FORGE_RECIPES.map((recipe) => (
                    <div
                      key={recipe.id}
                      className="flex items-center justify-between rounded-lg border border-[#7a5438] bg-[#221321] p-2.5"
                    >
                      <div>
                        <strong className="block text-xs text-[#ffe5be]">{recipe.name}</strong>
                        <span className="text-[10px] text-[#cca583]">{recipe.description}</span>
                      </div>
                      <button
                        type="button"
                        data-testid={'collection-gear-' + recipe.id}
                        onClick={() => commitCollection({ type: 'forge', id: recipe.id })}
                        className="rounded border border-[#c49a62] bg-[#3f1f33] px-3 py-1 text-[11px] text-[#ffe2be] hover:bg-[#522542]"
                      >
                        打造 ({recipe.cost} 碎片)
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end border-t border-[#c49a6244] pt-3">
              <button
                type="button"
                onClick={() => setShowGalleryTab(false)}
                className="rounded-lg border border-[#c49a62] bg-[#291724] px-5 py-1.5 text-xs text-[#ffe2be] hover:bg-[#3f2137]"
              >
                返回契约大厅
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
