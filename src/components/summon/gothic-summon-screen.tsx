'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import {SummonHeader} from './summon-header';
import {SummonPoolRail} from './summon-pool-rail';
import {SummonActionBar} from './summon-action-bar';
import {SummonShowcase} from './summon-showcase';
import './summon-screen.css';
import lobbyHero from '../../../public/art/lobby-hero-v3.webp';
import lobbyHeroBackup from '../../../public/art/lobby-hero-v2.webp';
import moonveilBust from '../../../public/art/yuesha-bust-v3.webp';
import {GothicDock} from '@/components/game/gothic-hud';
import {HEROINE_FACE_ART} from './heroine-portrait-assets';
import {WORLD_NAV} from '@/components/moonwork/world-navigation';
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
import { useCharacterCollection, commitCollection } from '@/lib/game/character-collection-store';
import { CHARACTER_CARDS, FORGE_RECIPES } from '@/core/character-collection';
import type {CharacterId} from '@/core/character-life';
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
