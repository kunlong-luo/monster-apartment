'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import {SummonHeader} from './summon-header';
import {SummonPoolRail} from './summon-pool-rail';
import {SummonActionBar} from './summon-action-bar';
import {SummonShowcase} from './summon-showcase';
import {SummonCollectionArchive} from './summon-collection-archive';
import {SummonHeroineSpotlight} from './SummonHeroineSpotlight';
import './summon-screen.css';
import lobbyHero from '../../../public/art/lobby-hero-v3.webp';
import lobbyHeroBackup from '../../../public/art/lobby-hero-v2.webp';
import {useCharacterLife} from '@/lib/game/character-life-store';
import {useWorkshopWorld} from '@/components/moonwork/world-save-react';
import {claimProgressTickets,claimTrialTicket,gachaSaveStatus,GACHA_CHARACTERS} from '@/lib/summon/gacha-engine';
import {ReliableImage as Image} from '@/components/game/reliable-image';
import Link from 'next/link';
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
  // Use the actual gacha catalog grade, not a guessed label from potential
  // tier. Brook is N, not R; visual themes never change draw weights.
  const featuredCardKey=featuredWorker==='brook'?'brook-tide':
    featuredWorker==='fern'?'fern-spring':
    featuredWorker==='cinder'?'cinder-ember':'yuesha-eclipse';
  const featuredCard=GACHA_CHARACTERS.find(c=>c.id===featuredCardKey)??GACHA_CHARACTERS[0];


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
  const [currentQuote, setCurrentQuote] = useState('「……你也想，成为我的所有物吗？」');

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
        <SummonHeroineSpotlight
          featuredWorker={featuredWorker}
          featuredBeastName={featuredBeast.name}
          poolTitle={currentPool.bannerTitle}
          poolSub={currentPool.bannerSub}
          dateRange={currentPool.dateRange}
          quoteIndex={0}
          onQuoteClick={() => {}}
          onQuoteChange={(quote) => setCurrentQuote(quote)}
          saveStatus={saveStatus}
          onShowDetails={() => setShowDetails(true)}
          summonError={summonError}
        />

        <SummonActionBar disabled={saveStatus!=='ok'||ritualModal.open}
          pityCountdown={state.pityCountdown} onHistory={()=>setShowHistory(true)}
          onSingle={handleSingleSummon} onTen={handleTenSummon}/>

        {/* ----------------------------------------------------------- */}
        {/* RIGHT COLUMN: SSR CARD SHOWCASE & PROBABILITIES             */}
        {/* ----------------------------------------------------------- */}
        <SummonShowcase featuredWorker={featuredWorker} featuredName={featuredName}
          featuredBeastName={featuredBeast.name} featuredCard={featuredCard}
          quote={currentQuote}
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
