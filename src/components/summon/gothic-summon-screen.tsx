'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import './summon-screen.css';
import lobbyHero from '../../../public/art/lobby-hero-v3.webp';
import moonveilBust from '../../../public/art/yuesha-bust-v3.webp';
import moonveilPortrait from '../../../public/art/yuesha-portrait-v3.webp';
import {GothicDock} from '@/components/game/gothic-hud';
import {HEROINE_FACE_ART,getCardFace} from './heroine-portrait-assets';
import {WORLD_NAV} from '@/components/moonwork/world-navigation';
import {useCharacterLife} from '@/lib/game/character-life-store';
import {useWorkshopWorld} from '@/components/moonwork/world-save-react';
import {claimProgressTickets,claimTrialTicket,gachaSaveStatus,GACHA_CHARACTERS} from '@/lib/summon/gacha-engine';
import Image from 'next/image';
import Link from 'next/link';
import {Backpack,Droplets,Gem,History,Mail,Megaphone,Settings,Ticket} from 'lucide-react';
import { useGacha } from '@/lib/summon/use-gacha';
import { GACHA_POOLS, type SummonableCharacter } from '@/lib/summon/gacha-engine';
import { SummonRitualModal } from './summon-ritual-modal';
import {
  SummonHistoryModal,
  PoolDetailsModal,
  CharacterTrialModal,
  UtilityModal,
} from './summon-dialogs';
import { useCharacterCollection, commitCollection } from '@/lib/game/character-collection-store';
import { CHARACTER_CARDS, FORGE_RECIPES } from '@/core/character-collection';
import type {CharacterId} from '@/core/character-life';
import {COVENANT_BEASTS} from '@/lib/summon/covenant-beasts';
import {GAME_UI_RELEASE} from '@/core/game-release';

function observeGachaSave(callback:()=>void){
  const event=()=>callback();
  window.addEventListener('storage',event);
  window.addEventListener('monster-apartment:gacha-updated',event);
  return ()=>{
    window.removeEventListener('storage',event);
    window.removeEventListener('monster-apartment:gacha-updated',event);
  };
}
export function GothicSummonScreen() {
  const {
    state,
    activePoolId,
    setActivePoolId,
    summon,
  } = useGacha();

  const { collection, status: collectionStatus } = useCharacterCollection();
  const [equipTarget, setEquipTarget] = useState<CharacterId>('yuesha');
  const [forgeNotice,setForgeNotice] = useState('');
  const ownedEquipmentCharacters = [...new Set(CHARACTER_CARDS.filter(card => collection.draws.includes(card.key)).map(card => card.character))] as CharacterId[];
  const selectedEquipTarget = ownedEquipmentCharacters.includes(equipTarget) ? equipTarget : ownedEquipmentCharacters[0] ?? null;
  const ownedCharacters = GACHA_CHARACTERS.filter(c => c.baseCardKey && collection.draws.includes(c.baseCardKey));

  // Active pool object
  const currentPool = GACHA_POOLS.find((p) => p.id === activePoolId) || GACHA_POOLS[0];

  // Theme changes only the story spotlight, never the disclosed roll weights.
  const featuredWorkers:Partial<Record<string,'brook'|'fern'|'cinder'>>={
    'eternal-struggle':'cinder','bond-echo':'fern','memory-remnant':'brook',
  };
  const featuredWorker=featuredWorkers[activePoolId]??null;
  const featuredName=featuredWorker==='brook'?'泉泡':featuredWorker==='fern'?'青枝':featuredWorker==='cinder'?'炽角':'月纱';
  const featuredBeast=COVENANT_BEASTS[featuredWorker??'yuesha'];
  const featuredTier=featuredWorker==='cinder'?3:featuredWorker==='fern'?2:featuredWorker==='brook'?1:5;
  // Use the actual gacha catalog grade, not a guessed label from potential
  // tier. Brook is N, not R; visual themes never change draw weights.
  const featuredCardKey=featuredWorker==='brook'?'brook-tide':
    featuredWorker==='fern'?'fern-spring':
    featuredWorker==='cinder'?'cinder-ember':'yuesha-eclipse';
  const featuredCard=GACHA_CHARACTERS.find(c=>c.id===featuredCardKey)??GACHA_CHARACTERS[0];
  const otherQuotes={
    brook:['「听见了吗？水脉正在向我们讲述故事。」','「银月下的霜狼，从来不会忘记归途。」'],
    fern:['「荆棘守护的花，总有自己的绽放时刻。」','「跟我去看看真正的月光温室。」'],
    cinder:['「我的锻锤，不是拿来做装饰的。」','「如果你不怕火，就跟上我的脚步。」'],
  } as const;
  // Active dialogue line
  const quotes = [
    '「……你也想，成为我的所有物吗？」',
    '「沉入永夜吧—— 这一次，换我来拥抱你。」',
    '「别把视线移开，今夜你只属于我。」',
    '「这份契约已烙入灵魂，你无法反悔了。」',
  ];
  const [quoteIndex, setQuoteIndex] = useState(0);
  const visibleQuotes=featuredWorker?otherQuotes[featuredWorker]:quotes;

  // Active modals
  const [ritualModal, setRitualModal] = useState<{ open: boolean; characters: SummonableCharacter[] }>({
    open: false,
    characters: [],
  });
  const [showHistory, setShowHistory] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showTrial, setShowTrial] = useState(false);
  const [showReplenish, setShowReplenish] = useState(false);
  const [utilityModal, setUtilityModal] = useState<'bag' | 'mail' | 'notice' | 'settings' | null>(null);
  const [summonError, setSummonError] = useState('');
  const [showGalleryTab, setShowGalleryTab] = useState(false);

  // Featured character for preview

  const workshop=useWorkshopWorld();
  const life=useCharacterLife();
  const saveStatus=useSyncExternalStore(observeGachaSave,gachaSaveStatus,()=> 'unavailable');
  useEffect(()=>{
    if(workshop&&life.status==='ok')
      claimProgressTickets(workshop.completed,life.progress.visited.length);
  },[workshop,life.status,life.progress.visited.length]);
  const performSummon=(count:1|10)=>{
    setSummonError('');
    const result=summon(count);
    if(result.success&&result.characters.length)
      setRitualModal({open:true,characters:result.characters});
    else setSummonError(result.error??'召唤未完成，请检查资源。');
  };
  const handleSingleSummon=()=>performSummon(1);
  const handleTenSummon=()=>performSummon(10);

  return (
    <div
      data-testid="character-collection"
      className="summon-cinematic relative flex h-dvh w-full flex-col overflow-hidden bg-[#0c050b] font-serif text-[#f4ddc5]"
    >
      {/* Static imports preserve the real Next.js Pages basePath and keep
          the original painting sharp after client navigation. */}
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
        <Image src={lobbyHero} alt="" fill priority unoptimized sizes="100vw"
          data-testid="summon-background-painting"
          className="select-none object-cover object-center" draggable={false}/>
      </div>

      {/* Atmospheric dark vignetting overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,transparent_40%,#09030ab0_80%,#060207f2_100%)]"
        aria-hidden="true"
      />

      {/* ------------------------------------------------------------- */}
      {/* 1. TOP HEADER BAR                                             */}
      {/* ------------------------------------------------------------- */}
      <header className="summon-cinematic-header relative z-20 flex h-14 sm:h-16 w-full items-center justify-between px-3 sm:px-6 bg-gradient-to-b from-[#120713cc] to-transparent">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <span className="text-xl sm:text-2xl text-[#f3ca88]">❦</span>
          <div className="leading-tight">
            <h1 className="text-base sm:text-xl font-bold tracking-[.18em] text-[#ffebcc] drop-shadow-[0_2px_4px_#000]">
              怪物公寓
            </h1>
            <span className="block text-[8px] sm:text-[9px] tracking-[.25em] text-[#bca085] uppercase">
              MONSTER APARTMENT · <span data-testid="game-release">{GAME_UI_RELEASE}</span>
            </span>
          </div>
        </div>

        {/* Center-Right Currencies */}
        <div className="summon-cinematic-header-controls flex items-center gap-2 sm:gap-4">
          <div className="summon-cinematic-wallet flex items-center gap-2 sm:gap-4" aria-label="真实契约资源">
          {/* Contract Tickets */}
          <button type="button" aria-label="查看契约信物来源"
            onClick={() => setShowReplenish(true)}
            className="flex cursor-pointer items-center gap-1.5 rounded-full border border-[#b88c5888] bg-[#22101ecc] px-2.5 py-1 text-xs text-[#ffe1bc] shadow-md hover:border-[#ffd699]"
          >
            <Ticket aria-hidden="true" size={16} strokeWidth={1.6} className="shrink-0 text-[#e8c695]"/>
            <span data-testid="collection-tickets" className="font-semibold text-xs sm:text-sm">
              {state.tickets}
            </span>
            <span className="flex size-4 items-center justify-center rounded-full bg-[#462135] text-[10px] text-[#ffc66e]">
              +
            </span>
          </button>

          {/* Blood Crystals */}
          <button type="button" aria-label="查看血晶来源"
            onClick={() => setShowReplenish(true)}
            className="flex cursor-pointer items-center gap-1.5 rounded-full border border-[#b88c5888] bg-[#22101ecc] px-2.5 py-1 text-xs text-[#ffe1bc] shadow-md hover:border-[#ffd699]"
          >
            <Droplets aria-hidden="true" size={16} strokeWidth={1.6} className="shrink-0 text-[#d58a9c]"/>
            <span className="font-semibold text-xs sm:text-sm">
              {state.crystals.toLocaleString()}
            </span>
            <span className="flex size-4 items-center justify-center rounded-full bg-[#462135] text-[10px] text-[#ffc66e]">
              +
            </span>
          </button>

          {/* Moonstones */}
          <button type="button" aria-label="查看月光石来源"
            onClick={() => setShowReplenish(true)}
            className="flex cursor-pointer items-center gap-1.5 rounded-full border border-[#b88c5888] bg-[#22101ecc] px-2.5 py-1 text-xs text-[#ffe1bc] shadow-md hover:border-[#ffd699]"
          >
            <Gem aria-hidden="true" size={16} strokeWidth={1.6} className="shrink-0 text-[#c0b8dc]"/>
            <span className="font-semibold text-xs sm:text-sm">{state.moonstones}</span>
            <span className="flex size-4 items-center justify-center rounded-full bg-[#462135] text-[10px] text-[#ffc66e]">
              +
            </span>
          </button>

          </div>
          {/* Top-Right Utility Icons */}
          <div className="summon-cinematic-tools flex items-center gap-1.5 border-l border-[#805a4155] pl-2 sm:gap-2 sm:pl-3" aria-label="召唤辅助功能">
            <button
              type="button"
              aria-label="背包"
              onClick={() => setUtilityModal('bag')}
              className="flex size-8 items-center justify-center rounded-lg border border-[#7e5539] bg-[#23121fcc] text-sm text-[#eed0b2] hover:border-[#ffd699] hover:bg-[#3f1f35]"
            >
              <Backpack aria-hidden="true" size={17} strokeWidth={1.6}/>
            </button>
            <button
              type="button"
              aria-label="邮箱"
              onClick={() => setUtilityModal('mail')}
              className="relative flex size-8 items-center justify-center rounded-lg border border-[#7e5539] bg-[#23121fcc] text-sm text-[#eed0b2] hover:border-[#ffd699] hover:bg-[#3f1f35]"
            >
              <Mail aria-hidden="true" size={17} strokeWidth={1.6}/>
            </button>
            <button
              type="button"
              aria-label="公告"
              onClick={() => setUtilityModal('notice')}
              className="relative flex size-8 items-center justify-center rounded-lg border border-[#7e5539] bg-[#23121fcc] text-sm text-[#eed0b2] hover:border-[#ffd699] hover:bg-[#3f1f35]"
            >
              <Megaphone aria-hidden="true" size={17} strokeWidth={1.6}/>
            </button>
            <button
              type="button"
              aria-label="设置"
              onClick={() => setUtilityModal('settings')}
              className="flex size-8 items-center justify-center rounded-lg border border-[#7e5539] bg-[#23121fcc] text-sm text-[#eed0b2] hover:border-[#ffd699] hover:bg-[#3f1f35]"
            >
              <Settings aria-hidden="true" size={17} strokeWidth={1.6}/>
            </button>
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------- */}
      {/* 2. MAIN 3-COLUMN STAGE AREA                                  */}
      {/* ------------------------------------------------------------- */}
      <main
        data-testid="gothic-summon-stage"
        className="summon-cinematic-main relative z-10 flex flex-1 w-full min-h-0 flex-col lg:flex-row items-stretch justify-between px-2 sm:px-4 py-1 overflow-hidden"
      >
        {/* ----------------------------------------------------------- */}
        {/* LEFT COLUMN: 5 GACHA POOLS TABS                             */}
        {/* ----------------------------------------------------------- */}
        <aside className="summon-cinematic-pools relative flex w-full shrink-0 flex-row gap-2 overflow-x-auto py-1 lg:w-56 lg:flex-col lg:justify-center lg:gap-2 lg:overflow-visible lg:py-4 xl:w-64 z-20">
          {GACHA_POOLS.map((pool) => {
            const isActive = pool.id === activePoolId;
            const workerPreview = featuredWorkers[pool.id] ?? null;
            return (
              <button
                key={pool.id}
                type="button"
                aria-pressed={isActive}
                disabled={saveStatus!=='ok'}
                onClick={() => setActivePoolId(pool.id)}
                className={`summon-pool-item group relative flex min-h-14 w-44 shrink-0 items-center gap-2.5 rounded-md border p-2 text-left transition-colors duration-200 lg:h-20 lg:w-full ${
                  isActive
                    ? 'border-[#ffcf7a] bg-gradient-to-r from-[#4d1629dd] via-[#2f1124dd] to-[#1a0a19bb] shadow-[0_0_14px_#cc204644]'
                    : 'border-[#734f3788] bg-[#1a0c18a8] hover:border-[#d9a86a] hover:bg-[#281324cc]'
                }`}
              >
                {/* Same real character identity on pool tile and main spotlight. */}
                <div className="relative size-12 shrink-0 overflow-hidden rounded-lg border border-[#e2b57855]">
                  <Image src={HEROINE_FACE_ART[workerPreview??'yuesha']}
                    alt={pool.subname} fill sizes="48px"
                    className="object-cover object-top"/>
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
                    {pool.badge}
                  </span>
                </div>

              </button>
            );
          })}


        </aside>

        {/* ----------------------------------------------------------- */}
        {/* CENTER STAGE: HEROINE, TITLE, QUOTE & SUMMON BUTTONS       */}
        {/* ----------------------------------------------------------- */}
        <section className="summon-cinematic-center relative flex min-w-0 flex-1 flex-col items-center justify-between px-2 sm:px-4 py-2 z-10">
          <div className={'summon-cinematic-character pointer-events-none absolute inset-0 z-[-1]'+(featuredWorker?' summon-cinematic-character--worker':'')}
            data-testid="summon-featured-portrait" data-featured-character={featuredWorker??'yuesha'}
            data-tier={featuredTier} aria-hidden="true">
            {featuredWorker ? (
              <Image src={HEROINE_FACE_ART[featuredWorker]} alt="" fill
                sizes="(max-width:900px) 90vw, (max-width:1449px) 50vw, 770px"
                className="summon-cinematic-heroine-image"
                data-portrait-source="dedicated-heroine"/>
            ) : (
              <Image src={moonveilBust} alt="" fill unoptimized
                sizes="(max-width:900px) 65vw,700px"
                className="object-contain object-bottom opacity-95"/>
            )}
          </div>
          {/* Interactive Heroine Dialogue Bubble */}
          <button type="button" aria-label={'与'+featuredName+'对话，切换台词'}
            onClick={() => setQuoteIndex(prev => prev + 1)}
            className="summon-cinematic-quote relative z-[2] cursor-pointer self-end mr-1 mt-2 rounded border border-[#c99f6b77] px-3 py-2 text-[11px] text-[#ffeed5] shadow-[0_8px_22px_#0009] transition-colors hover:border-[#ffe0b5] focus-visible:outline-2 focus-visible:outline-[#ffe0b5] motion-reduce:transition-none"
          >
            <p className="italic font-serif leading-relaxed">{visibleQuotes[quoteIndex % visibleQuotes.length]}</p>
            <span className="block text-right text-[9px] text-[#bfa084]">—— {featuredName} ☾</span>
          </button>

          {/* Central Title Typography */}
          <div className="summon-cinematic-title text-center my-auto">
            <div className="inline-block">
              <span className="text-[10px] tracking-[.3em] text-[#dca66e] uppercase">
                ✦ {featuredName} · {featuredBeast.name} ✦
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-[.18em] text-[#fff0d6] drop-shadow-[0_4px_12px_#000]">
                {currentPool.bannerTitle}
              </h2>
              <p className="mt-1 text-xs sm:text-sm tracking-widest text-[#e8cbb0]">
                {currentPool.bannerSub}
              </p>

              {/* Event Pill & Details Button */}
              <div className="mt-3 inline-flex flex-wrap items-center justify-center gap-2 rounded-full border border-[#ad7a4f77] bg-[#230f1fd8] px-4 py-1 text-[11px] text-[#f5d9bd]">
                <span>同池概率 · 无独立 UP ·</span>
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

            {saveStatus!=='ok'&&<p role="alert" data-testid="summon-save-error" className="rounded border border-red-500 bg-[#3f1228] p-2 text-xs">召唤存档异常，已停止抽取以保护进度。</p>}
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
                <History aria-hidden="true" size={18} strokeWidth={1.6} className="text-[#e6c49c]"/>
                <span className="text-[10px] sm:text-xs font-semibold">召唤记录</span>
              </button>

              {/* Single Summon Button */}
              <button
                type="button"
                data-testid="collection-summon"
                disabled={saveStatus!=='ok'||ritualModal.open}
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
                data-testid="collection-summon-ten"
                disabled={saveStatus!=='ok'||ritualModal.open}
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
        <aside className="summon-cinematic-sidebar relative flex w-full flex-col gap-3 overflow-y-auto py-2 lg:w-64 lg:shrink-0 xl:w-72 z-20">
          {/* Featured card; a visual theme is not a drop-rate boost. */}
          <div data-testid="summon-featured-card" data-card-character={featuredWorker??'yuesha'}
            className="relative flex flex-col rounded-lg border border-[#d4aa7080] bg-[#1a0b18e0] p-3 shadow-[0_10px_30px_#000000aa]">
            {/* Grounded actual catalog grade. */}
            <div data-testid="summon-featured-card-tier"
              className="absolute top-2 left-2 z-10 rounded border border-[#ffe5bd88] bg-[#a96839] px-2 py-0.5 text-[10px] font-bold tracking-[.15em] text-[#fff0ce]">
              {featuredCard.rarityZh}
            </div>

            {/* Card Portrait */}
            <div className="relative h-44 w-full overflow-hidden rounded-xl border border-[#e2b57866] bg-[#22101e]">
              <Image
                src={featuredWorker?HEROINE_FACE_ART[featuredWorker]:moonveilPortrait}
                alt={featuredName}
                fill
                unoptimized
                sizes="(max-width:1023px) 50vw,240px"
                className="object-cover object-[55%_25%]"
              />
            </div>

            {/* Card Meta */}
            <div className="mt-2">
              <div className="flex items-baseline justify-between">
                <h3 className="text-base font-semibold text-[#ffe6c2]">{featuredName} ☾</h3>
                <span className="text-[10px] text-[#e8c099]">✦ {featuredBeast.name}</span>
              </div>
              <p className="mt-1 text-[10px] text-[#c9a786] italic leading-tight">
                {visibleQuotes[quoteIndex % visibleQuotes.length]}
              </p>
            </div>

            <p className="mt-2 text-[10px] leading-5 text-[#c9ae8d]" data-testid="summon-featured-odds">
              基础获取概率 {featuredCard.rate.toFixed(2)}% · 主题不额外加成
            </p>

            {/* Quick Actions */}
            <div className="mt-2.5 text-xs">
              {featuredWorker ? (
                <Link href={'/characters/?visit='+featuredWorker}
                  data-testid="summon-featured-room-link"
                  className="flex min-h-10 w-full items-center justify-center rounded border border-[#c69d6f80] bg-[#2d1a2cbb] px-2 py-2 text-center font-medium text-[#ffe2be] transition-colors hover:border-[#f4d8b0] hover:bg-[#44304a] focus-visible:outline-2 focus-visible:outline-[#ffe0b5]">
                  拜访{featuredName}的房间
                </Link>
              ) : (
                <button type="button" onClick={() => setShowTrial(true)}
                  data-testid="summon-yuesha-trial"
                  className="min-h-10 w-full rounded border border-[#c69d6f80] bg-[#2d1a2cbb] px-2 py-2 font-medium text-[#ffe2be] transition-colors hover:border-[#f4d8b0] hover:bg-[#44304a] focus-visible:outline-2 focus-visible:outline-[#ffe0b5]">
                  月纱技能试玩
                </button>
              )}
            </div>
            <button type="button" onClick={()=>setShowGalleryTab(true)}
              className="mt-2 min-h-11 w-full rounded border border-[#b98b6188] bg-[#261725b8] px-2.5 py-2 text-[11px] font-medium leading-5 text-[#f7d8b2] transition-colors hover:border-[#f8d9b1] hover:bg-[#3d2737] focus-visible:outline-2 focus-visible:outline-[#ffe0b5]">
              查看已收录契约、首饰和装备
            </button>
          </div>

          {/* Official Gacha Probability Table */}
          <div
            data-testid="collection-odds"
            className="my-2 rounded-xl border border-[#8b614088] bg-[#1c0d1bb8] p-2.5 text-xs"
          >
            <h4 className="font-bold text-[#ffdca8] text-[11px] mb-1">召唤概率公示</h4>
            <div className="space-y-0.5 text-[10px]">
              {GACHA_CHARACTERS.map((character,index)=>(
                <div key={character.id} data-testid={'summon-odds-'+character.id}
                  className={'flex justify-between '+(
                    ['text-[#ff7585]','text-[#ffd700]','text-[#c084fc]',
                      'text-[#93c5fd]','text-[#cbd5e1]'][index]??'text-[#e4d2c4]')}>
                  <span>{character.rarityZh}</span>
                  <strong>{character.rate.toFixed(2)}%</strong>
                </div>
              ))}
            </div>
          </div>

          {/* Collection Progress */}
          <div className="rounded-xl border border-[#8b614088] bg-[#1c0d1bb8] p-2.5 text-xs">
            <div className="flex justify-between items-center text-[10px] text-[#e0bfa3]">
              <span data-testid="summon-owned-progress">收集进度 {ownedCharacters.length}/{GACHA_CHARACTERS.length}</span>
              <button
                type="button"
                onClick={() => setShowReplenish(true)}
                className="text-[#ffc66e] hover:underline"
              >
                🎫 契约资源来源 &gt;
              </button>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[#120713]">
              <div
                className="h-full bg-gradient-to-r from-[#d97706] to-[#dc2626]"
                style={{ width: `${Math.min(100, (ownedCharacters.length / GACHA_CHARACTERS.length) * 100)}%` }}
              />
            </div>
          </div>

          {/* Collectable portraits; visual themes have no UP. */}
          <div className="mt-2">
            <span className="block text-[10px] text-[#cca585] mb-1">可收录契约</span>
            <div className="flex items-center justify-between gap-1">
              {GACHA_CHARACTERS.map(character => (
                <button type="button" key={character.id}
                  data-testid="summon-available-card" data-character-id={character.id}
                  title={character.title} aria-label={`查看契约档案：${character.title}`}
                  onClick={() => setShowGalleryTab(true)}
                  className="relative size-10 shrink-0 overflow-hidden rounded-full border border-[#b88c58] bg-[#2a1023] text-xs font-bold text-[#f6d5aa] transition hover:border-[#ffe3b3] hover:scale-105">
                  <Image src={getCardFace(character.id)??character.avatar} alt=""
                    fill sizes="40px" className="object-cover object-top"
                    data-portrait-source="dedicated-heroin-face"/>
                </button>
              ))}
            </div>
          </div>
        </aside>
      </main>

      {/* One canonical global dock; the summon scene is a mode of the Character route. */}
      <GothicDock label="月影契约世界导航" activeHref="/characters/#summon-screen" className="gothic-dock--world summon-cinematic-dock"
        items={WORLD_NAV.map(n=>({href:n.id==='characters'?'/characters/#summon-screen':n.href,icon:n.glyph,
          label:n.id==='characters'?'契约召唤':n.label,
          ariaLabel:n.id==='characters'?'契约召唤':n.full,description:n.purpose}))}/>
      {/* ------------------------------------------------------------- */}
      {/* 4. MODALS & DIALOGS                                           */}
      {/* ------------------------------------------------------------- */}
      {ritualModal.open && (
        <SummonRitualModal
          characters={ritualModal.characters}
          onClose={() => setRitualModal({ open: false, characters: [] })}
          onSummonAgain={state.tickets+Math.floor(state.crystals/160)>=10
            &&collectionStatus==='ok'&&saveStatus==='ok'?handleTenSummon:undefined}
          onViewCollection={()=>{
            setRitualModal({open:false,characters:[]});
            setShowGalleryTab(true);
          }}
        />
      )}

      {showHistory && (
        <SummonHistoryModal records={state.history} onClose={() => setShowHistory(false)} />
      )}

      {showDetails && (
        <PoolDetailsModal pool={currentPool} onClose={() => setShowDetails(false)} />
      )}


      {showTrial && (
        <CharacterTrialModal
          onRewardClaimed={()=>claimTrialTicket()}
          alreadyClaimed={state.claimedProgressRewards.includes(-1)}
          onClose={() => setShowTrial(false)}
        />
      )}

      {showReplenish&&<div role="dialog" aria-modal="true" aria-label="契约资源来源"
        className="fixed inset-0 z-[90] grid place-items-center bg-black/85 p-4">
        <section className="w-full max-w-sm rounded-xl border border-[#e6b478] bg-[#211020] p-5 text-sm text-[#ffe0bb]">
          <h3 className="text-lg font-semibold">契约资源获取</h3>
          <p className="my-3 leading-7">初始赠送 3 张召唤券。首次拜访角色房间及完成工坊委托可获得额外召唤券，奖励按真实存档计算。</p>
          <div className="flex gap-2">
            <Link className="rounded border border-[#c99b64] px-3 py-2" href="/workshop/">前往工坊</Link>
            <Link className="rounded border border-[#c99b64] px-3 py-2" href="/characters/">拜访角色</Link>
            <button onClick={()=>setShowReplenish(false)} className="ml-auto rounded border border-[#c99b64] px-3 py-2">关闭</button>
          </div>
        </section>
      </div>}

      {utilityModal && (
        <UtilityModal type={utilityModal} onClose={() => setUtilityModal(null)} />
      )}

      {/* Drawer / Overlay for legacy Character Forge & Collection when toggled */}
      {showGalleryTab && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="角色契约图鉴与装备锻造"
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
                        <Image src={HEROINE_FACE_ART[card.character]} alt={card.title}
                          width={40} height={40} className="size-full object-cover"/>
                      </div>
                      <div className="min-w-0 flex-1">
                        <strong className="block text-sm text-[#ffe5be]">{card.title}</strong>
                        <span className="text-[10px] text-[#caa789]">
                          {owned ? '已收录' : '待收录 · ' + card.rarity}
                        </span>
                        {owned&&<a
                          data-testid={'collection-visit-'+card.key}
                          href={card.character==='yuesha'?'/apartment/?visit=yuesha':
                            '/characters/?visit='+card.character}
                          className="mt-2 inline-flex min-h-9 items-center rounded border border-[#d2a874] bg-[#5a2440] px-3 py-1.5 text-[11px] text-[#ffe4c3] hover:brightness-125">
                          拜访私人房间 ↗
                        </a>}
                      </div>
                    </div>
                  );
                })}
              </div>

              <section data-testid="beast-contract-roster" aria-label="美女与野兽契约档案"
                className="border-t border-[#b8895866] pt-3">
                <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                  <h4 className="text-sm font-semibold text-[#ffe0b5]">✦ 美女与野兽 · 契约传说</h4>
                  <span className="text-[10px] text-[#d4b090]">四只独特异兽 · 正式 CG 制作中</span>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {Object.entries(COVENANT_BEASTS).map(([characterId,beast])=>{
                    const owned=CHARACTER_CARDS.some(card=>
                      card.character===characterId&&collection.draws.includes(card.key));
                    return <article key={beast.id} data-testid={'beast-lore-'+beast.id}
                      data-beast-identity={beast.silhouette}
                      data-beast-art-status="awaiting-independent-cg"
                      className={'covenant-beast-card covenant-beast-card--'+beast.palette}>
                      <div className="covenant-beast-card__top">
                        <span className="text-[10px] tracking-[.12em]">BEAST COVENANT</span>
                        <span className="text-[10px]">{owned?'人物卡已收录':'对应人物待收录'}</span>
                      </div>
                      <strong className="block text-sm text-[#ffe8c8]">{beast.name}</strong>
                      <p className="mt-1 text-[11px] text-[#e5c9a9]">{beast.epithet}</p>
                      <p className="mt-2 text-[11px] leading-5 text-[#d8c4b6]">{beast.bond}</p>
                    </article>;
                  })}
                </div>
              </section>

              {/* Equipment Forge Section: the canonical collection save also owns
                  equipment, not a second standalone legacy gacha panel. */}
              <div className="border-t border-[#7a543855] pt-3">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <h4 className="font-bold text-[#ffdca8]">首饰与装备打造</h4>
                  <label className="flex items-center gap-2 text-[11px] text-[#e9ceaf]">
                    装备人物
                    <select data-testid="collection-equip-target"
                      value={selectedEquipTarget??''}
                      disabled={ownedEquipmentCharacters.length===0||collectionStatus!=='ok'}
                      onChange={e=>setEquipTarget(e.target.value as CharacterId)}
                      className="min-h-9 rounded border border-[#b58d62] bg-[#241222] px-3 text-[#ffe3bd]">
                      {ownedEquipmentCharacters.length===0&&<option value="">先召唤人物</option>}
                      {ownedEquipmentCharacters.map(id=><option value={id} key={id}>
                        {id==='yuesha'?'月纱':id==='brook'?'泉泡':id==='fern'?'青枝':'炽角'}
                      </option>)}
                    </select>
                  </label>
                </div>
                {collectionStatus!=='ok'&&<p role="alert" className="mb-2 text-xs text-red-200">人物收藏存档不可读取，装备操作已暂停。</p>}
                {forgeNotice&&<p data-testid="collection-forge-feedback" role="status" className="mb-2 text-xs text-[#f3cf9d]">{forgeNotice}</p>}
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
                      <div className="ml-2 flex shrink-0 flex-col gap-1.5">
                        <button type="button" data-testid={'collection-gear-' + recipe.id}
                          disabled={collectionStatus!=='ok'||collection.inventory.includes(recipe.id)||collection.shards<recipe.cost}
                          onClick={()=>{
                            const result=commitCollection({type:'forge',id:recipe.id});
                            setForgeNotice(result.status==='applied'?recipe.name+'已打造，可以选择人物穿戴。':'打造未完成，请检查碎片或存档。');
                          }}
                          className="min-h-9 rounded border border-[#c49a62] bg-[#3f1f33] px-2 py-1 text-[11px] text-[#ffe2be] hover:bg-[#522542] disabled:cursor-not-allowed disabled:opacity-50">
                          {collection.inventory.includes(recipe.id)?'已打造':'打造 ('+recipe.cost+' 碎片)'}
                        </button>
                        {collection.inventory.includes(recipe.id)&&<button
                          type="button" data-testid={'collection-equip-'+recipe.id}
                          disabled={!selectedEquipTarget||collectionStatus!=='ok'}
                          onClick={()=>{
                            if(!selectedEquipTarget)return;
                            const result=commitCollection({type:'equip',character:selectedEquipTarget,id:recipe.id});
                            setForgeNotice(result.status==='applied'?'装备已穿戴，人物属性已更新。':'穿戴未完成，请检查人物是否已收录。');
                          }}
                          className="min-h-9 rounded border border-[#d8ab78] bg-[#722844] px-2 py-1 text-[11px] text-[#ffe4c1] hover:brightness-110 disabled:opacity-50">
                          {selectedEquipTarget&&collection.equipped[selectedEquipTarget]?.[recipe.slot]===recipe.id?'已穿戴':'穿戴'}
                        </button>}
                      </div>
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
