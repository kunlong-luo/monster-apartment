'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import {SummonHeader} from './summon-header';
import {SummonPoolRail} from './summon-pool-rail';
import {SummonActionBar} from './summon-action-bar';
import {SummonShowcase} from './summon-showcase';
import {SummonCollectionArchive} from './summon-collection-archive';
import './summon-screen.css';
import lobbyHero from '../../../public/art/lobby-hero-v3.webp';
import lobbyHeroBackup from '../../../public/art/lobby-hero-v2.webp';
import moonveilBust from '../../../public/art/yuesha-bust-v3.webp';
import {HEROINE_FACE_ART} from './heroine-portrait-assets';
import {useCharacterLife} from '@/lib/game/character-life-store';
import {useWorkshopWorld} from '@/components/moonwork/world-save-react';
import {claimProgressTickets,claimTrialTicket,gachaSaveStatus,GACHA_CHARACTERS} from '@/lib/summon/gacha-engine';
import {ReliableImage as Image} from '@/components/game/reliable-image';
import Link from 'next/link';
import {AlertTriangle,Search} from 'lucide-react';
import { useGacha } from '@/lib/summon/use-gacha';
import { GACHA_POOLS, type SummonableCharacter } from '@/lib/summon/gacha-engine';
import { SummonRitualModal } from './summon-ritual-modal';
import {
  SummonHistoryModal,
  PoolDetailsModal,
  CharacterTrialModal,
  UtilityModal,
} from './summon-dialogs';
import {useCharacterCollection} from '@/lib/game/character-collection-store';
import {COVENANT_BEASTS} from '@/lib/summon/covenant-beasts';

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
  const [ritualModal, setRitualModal] = useState<{open:boolean;characters:SummonableCharacter[];sequence:number}>({
    open:false,characters:[],sequence:0,
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
      setRitualModal(previous=>({open:true,characters:result.characters,sequence:previous.sequence+1}));
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
        <Image src={lobbyHero} fallbackSrc={lobbyHeroBackup} alt="" fill priority unoptimized sizes="100vw"
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
      <SummonHeader tickets={state.tickets} crystals={state.crystals}
        moonstones={state.moonstones} onOpenResources={()=>setShowReplenish(true)}
        onUtility={setUtilityModal}/>

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
        <SummonPoolRail activePoolId={activePoolId} featuredWorkers={featuredWorkers}
          disabled={saveStatus!=='ok'} onSelectPool={setActivePoolId}/>

        {/* ----------------------------------------------------------- */}
        {/* CENTER STAGE: HEROINE, TITLE, QUOTE & SUMMON BUTTONS       */}
        {/* ----------------------------------------------------------- */}
        <section className="summon-cinematic-center relative flex min-w-0 flex-1 flex-col items-center justify-between px-2 sm:px-4 py-2 z-10">
          <div className={'summon-cinematic-character pointer-events-none absolute inset-0 z-[-1]'+(featuredWorker?' summon-cinematic-character--worker':'')}
            data-testid="summon-featured-portrait" data-featured-character={featuredWorker??'yuesha'}
            data-tier={featuredTier} aria-hidden="true">
            {featuredWorker ? (
              <Image src={HEROINE_FACE_ART[featuredWorker]} alt="" fill loading="eager"
                sizes="(max-width:900px) 90vw, (max-width:1449px) 50vw, 770px"
                className="summon-cinematic-heroine-image"
                data-portrait-source="dedicated-heroine"/>
            ) : (
              <Image src={moonveilBust} alt="" fill loading="eager" unoptimized
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
                  className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[#ffc66e] hover:underline"
                >
                  查看详情 <Search aria-hidden="true" size={12} strokeWidth={1.8}/>
                </button>
              </div>
            </div>

            {saveStatus!=='ok'&&<p role="alert" data-testid="summon-save-error" className="rounded border border-red-500 bg-[#3f1228] p-2 text-xs">召唤存档异常，已停止抽取以保护进度。</p>}
          {/* Error Message if insufficient currency */}
            {summonError && (
              <div className="mt-2 text-xs font-semibold text-[#ff5577] bg-black/60 px-3 py-1 rounded-full">
                <AlertTriangle aria-hidden="true" size={13} strokeWidth={1.7} className="mr-1 inline"/> {summonError}
              </div>
            )}
          </div>

          <SummonActionBar disabled={saveStatus!=='ok'||ritualModal.open}
            pityCountdown={state.pityCountdown} onHistory={()=>setShowHistory(true)}
            onSingle={handleSingleSummon} onTen={handleTenSummon}/>        </section>

        {/* ----------------------------------------------------------- */}
        {/* RIGHT COLUMN: SSR CARD SHOWCASE & PROBABILITIES             */}
        {/* ----------------------------------------------------------- */}
        <SummonShowcase featuredWorker={featuredWorker} featuredName={featuredName}
          featuredBeastName={featuredBeast.name} featuredCard={featuredCard}
          quote={visibleQuotes[quoteIndex % visibleQuotes.length]}
          ownedCharactersCount={ownedCharacters.length} onOpenTrial={()=>setShowTrial(true)}
          onOpenCollection={()=>setShowGalleryTab(true)}
          onOpenResources={()=>setShowReplenish(true)}/>
      </main>

      {/* ------------------------------------------------------------- */}
      {/* 4. MODALS & DIALOGS                                           */}
      {/* ------------------------------------------------------------- */}
      {ritualModal.open && (
        <SummonRitualModal
          key={ritualModal.sequence}
          characters={ritualModal.characters}
          onClose={() => setRitualModal(previous=>({...previous,open:false,characters:[]}))}
          onSummonAgain={state.tickets+Math.floor(state.crystals/160)>=ritualModal.characters.length
            &&collectionStatus==='ok'&&saveStatus==='ok'
            ?()=>performSummon(ritualModal.characters.length===10?10:1):undefined}
          onViewCollection={()=>{
            setRitualModal(previous=>({...previous,open:false,characters:[]}));
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

      <SummonCollectionArchive open={showGalleryTab} collection={collection}
        collectionStatus={collectionStatus} onClose={()=>setShowGalleryTab(false)}/>
    </div>
  );
}
