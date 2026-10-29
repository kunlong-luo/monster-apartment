'use client';
import {useRef,useState} from 'react';
import {AnimatePresence} from 'motion/react';
import {CharacterAdornment} from '@/components/game/character-adornment';
import {CharacterSummonReveal} from '@/components/game/character-summon-reveal';
import Image from 'next/image';
import moonveilPortrait from '../../../public/art/yuesha-portrait-v3.webp';
import moonveilBust from '../../../public/art/yuesha-bust-v3.webp';
import {WorkerArtwork} from '@/components/moonwork/worker-artwork';
import {useCharacterLife} from '@/lib/game/character-life-store';
import {commitCollection,useCharacterCollection} from '@/lib/game/character-collection-store';
import {CHARACTER_CARDS,FORGE_RECIPES,availableContracts,earnedContracts} from '@/core/character-collection';
import type {CardKey,GearId} from '@/core/character-collection';
import {CHARACTER_PROFILES} from '@/core/character-life';

function Portrait({id}:{id:'yuesha'|'brook'|'fern'|'cinder'}){
  return <span className="relative block size-16 shrink-0 overflow-hidden rounded-lg border border-[#e2b7835d] bg-[#241b31]">
    {id==='yuesha'?<Image src={moonveilPortrait} alt="" fill unoptimized sizes="64px"
      className="object-cover object-top"/>:
      <WorkerArtwork id={id} name={CHARACTER_PROFILES[id].name} compact/>}
    <CharacterAdornment id={id} compact/>
  </span>;
}
const colors:Record<string,string>={
  '普通':'border-[#8f9db1]/65 bg-[#2d3542]/70 text-[#d8e6f5]',
  '稀有':'border-[#6eabdd]/75 bg-[#123555]/70 text-[#a8dbff]',
  '史诗':'border-[#bb84ed]/75 bg-[#40224e]/75 text-[#e7bdff]',
  '传说':'border-[#e3b85d]/75 bg-[#493218]/75 text-[#ffe3a4]',
  '神话·月蚀':'border-[#ff5265] bg-[#620e29]/90 text-[#ffe1e3] shadow-[0_0_20px_#b1174580]',
};
export function CharacterCollectionPanel({completed}:{completed:number}){
  const life=useCharacterLife();
  const {status,collection}=useCharacterCollection();
  const [chosen,setChosen]=useState<CardKey|null>(null);
  const [featured,setFeatured]=useState<CardKey>('yuesha-eclipse');
  const [notice,setNotice]=useState('');
  const [reveal,setReveal]=useState<{card:CardKey;duplicate:boolean}|null>(null);
  const summonButton=useRef<HTMLButtonElement>(null);
  const dismissReveal=()=>{
    setReveal(null);
    window.requestAnimationFrame(()=>summonButton.current?.focus());
  };
  const earned=earnedContracts(completed,life.status==='ok'?life.progress.visited.length:0);
  const available=availableContracts(collection,earned);
  const selectedCard=CHARACTER_CARDS.find(card=>card.key===chosen&&collection.draws.includes(card.key))??
    CHARACTER_CARDS.find(card=>collection.draws.includes(card.key));
  const selectedId=selectedCard?.character??null;
  const ownedCount=new Set(collection.draws).size;
  const feature=CHARACTER_CARDS.find(card=>card.key===featured)!;
  const featureOwned=collection.draws.includes(feature.key);
  const summon=()=>{
    const roll=window.crypto.getRandomValues(new Uint32Array(1))[0]/4294967296;
    const result=commitCollection({type:'summon',earned,roll});
    if(result.status==='applied'&&result.card){
      const card=CHARACTER_CARDS.find(c=>c.key===result.card)!;
      setChosen(result.card);
      setFeatured(result.card);
      setReveal({card:result.card,duplicate:collection.draws.includes(result.card)});
      setNotice('召唤成功：'+card.title+'。'+
        (collection.draws.includes(result.card)?'重复契约已化为更多锻造碎片。':'新契约已加入图鉴。'));
    }else setNotice(result.status==='duplicate'?'当前契约券已用完。':'收藏存档不可写入，请检查存储权限和历史数据。');
  };
  const forge=(id:GearId)=>{
    const result=commitCollection({type:'forge',id});
    setNotice(result.status==='applied'?'装备锻造成功，已进入收藏装备库。':
      '无法打造：材料不足、已持有，或收藏存档不可用。');
  };
  const equip=(id:GearId)=>{
    if(!selectedId)return;
    const result=commitCollection({type:'equip',id,character:selectedId});
    setNotice(result.status==='applied'?CHARACTER_PROFILES[selectedId].name+
      '已装备'+FORGE_RECIPES.find(item=>item.id===id)!.name+'，档案属性已更新。':
      '无法装备：请选择已收录角色并确认装备已打造。');
  };
  return <section id="summon" className="gothic-summon-shell mb-4 min-w-0 space-y-4 rounded-xl border border-[#c4a1777c] bg-[#100910e8] p-3 sm:p-5"
    data-testid="character-collection" aria-label="月影契约召唤">
    <header className="gothic-summon-heading">
      <span className="text-[10px] tracking-[.21em] text-[#e3b37a]">MOONLIT COVENANT · 契约召唤</span>
      <h2 className="text-2xl font-semibold tracking-[.13em] text-[#ffe5c0] sm:text-3xl">神话 · 月蚀</h2>
      <p className="text-xs leading-5 text-[#dfc0aa]">收集人物契约，揭晓她们的故事。所有卡池均使用真实概率；选择预览不影响抽取结果。</p>
    </header>
    {status!=='ok'&&<p role="alert" data-testid="collection-storage-error"
      className="rounded-lg border border-red-400/60 bg-red-950/35 p-3 text-xs text-red-100">
      {status==='corrupt'?'检测到收藏存档损坏，已停止写入。原始数据完整保留。':
        '当前浏览器无法保存收藏记录，抽取和打造已停用。'}
    </p>}
    <div className="gothic-summon-stage" data-testid="gothic-summon-stage">
      <nav className="gothic-summon-banners" aria-label="预览五张人物契约">
        {CHARACTER_CARDS.slice().reverse().map(card=><button key={card.key} type="button"
          data-testid={'summon-preview-'+card.key}
          aria-pressed={featured===card.key}
          onClick={()=>setFeatured(card.key)}
          className="gothic-summon-banner" data-tier={card.tier}>
          <Portrait id={card.character}/>
          <span className="gothic-summon-banner-copy"><strong>{card.title}</strong>
            <small>{card.rarity} · {card.weight}%</small></span>
        </button>)}
      </nav>
      <div className="gothic-summon-hero" data-testid="summon-featured-portrait" data-tier={feature.tier}>
        <div className="gothic-summon-hero-moon" aria-hidden="true">☾</div>
        {feature.character==='yuesha'?
          <Image src={moonveilBust} unoptimized alt="月纱的现有肖像绘景"
            fill sizes="(max-width:700px) 80vw, 480px" className="gothic-summon-hero-image object-cover object-top"/>:
          <div className="gothic-summon-worker"><WorkerArtwork id={feature.character} name={CHARACTER_PROFILES[feature.character].name}/></div>}
        <div className="gothic-summon-hero-copy" aria-live="polite">
          <span>月光契约 · {feature.rarity}</span>
          <strong>{feature.title}</strong>
          <small>{featureOwned?'已收录 · 可查看人物属性':'尚未收录 · 召唤概率 '+feature.weight+'%'}</small>
        </div>
      </div>
      <div className="gothic-summon-sidebar">
        <p className="text-[10px] tracking-[.17em] text-[#e3be9a]">MOONLIT CONTRACT</p>
        <h3 className="text-xl font-semibold text-[#ffe1ba]">月影契约</h3>
        <p className="text-xs text-[#dec3ac]">预览：{feature.title}</p>
        <div className="grid grid-cols-3 gap-1 rounded-lg border border-[#ad795459] bg-[#21121d] p-2 text-center text-[10px]">
          <div><span className="block text-[#cfad8d]">可召唤</span><strong className="text-lg text-[#ffe8c7]" data-testid="collection-tickets">{available}</strong></div>
          <div><span className="block text-[#cfad8d]">已收录</span><strong className="text-lg text-[#ffe8c7]" data-testid="collection-owned">{ownedCount} / 5</strong></div>
          <div><span className="block text-[#cfad8d]">锻造碎片</span><strong className="text-lg text-[#ffe8c7]" data-testid="collection-shards">{collection.shards}</strong></div>
        </div>
        <div className="gothic-summon-odds" data-testid="collection-odds">
          <h4>召唤概率公示</h4>
          {CHARACTER_CARDS.slice().reverse().map(card=><div key={card.key} className="gothic-summon-odd-row" data-tier={card.tier}>
            <span>{card.rarity}</span><span>{card.weight.toFixed(2)}%</span>
          </div>)}
          <small>选择预览不会改变概率；无保底及概率提升。</small>
        </div>
        <button ref={summonButton} type="button" data-testid="collection-summon"
          disabled={status!=='ok'||life.status!=='ok'||available<1||Boolean(reveal)}
          onClick={summon}
          className="gothic-summon-primary min-h-12 w-full px-4 text-sm font-bold text-[#ffeed5] disabled:cursor-not-allowed disabled:opacity-40">
          ✦ 单次召唤 · 消耗 1 张
        </button>
        <p className="text-[11px] leading-5 text-[#d5b49b]">
          首次赠送 3 张；每拜访一位新住客、每完成一单工坊委托，各得 1 张。无付费入口。
        </p>
      </div>
    </div>
    <AnimatePresence>
      {reveal&&<CharacterSummonReveal key={reveal.card}
        cardKey={reveal.card} duplicate={reveal.duplicate} onClose={dismissReveal}/>}
    </AnimatePresence>
    {notice&&<p role="status" data-testid="collection-feedback"
      className="rounded-lg border border-[#c09b727e] bg-[#41283a] p-2 text-xs leading-5 text-[#ffe7c9]">{notice}</p>}
    <div>
      <h3 className="mb-2 text-sm font-semibold text-[#f9d3ac]">人物契约图鉴</h3>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {CHARACTER_CARDS.map(card=>{
          const count=collection.draws.filter(key=>key===card.key).length;
          const owned=count>0;
          const children=<><Portrait id={card.character}/><span className="min-w-0 flex-1 text-left">
            <span className="block text-xs font-bold leading-5">{card.title}</span>
            <span className="mt-1 block text-[10px]">{owned?'已收录 · '+count+' 张':'待收录 · '+card.rarity}</span>
          </span></>;
          const cls='flex min-h-[80px] w-full items-center gap-2 rounded-lg border p-2 transition '+
            colors[card.rarity]+(owned?' hover:brightness-110':' opacity-60');
          return owned?<button type="button" key={card.key} onClick={()=>setChosen(card.key)}
            data-testid={'collection-card-'+card.key} aria-pressed={selectedCard?.key===card.key}
            className={cls+(selectedCard?.key===card.key?' outline outline-2 outline-[#ffdb9b]':'')}>
            {children}</button>:
            <div key={card.key} data-testid={'collection-card-'+card.key} className={cls}>{children}</div>;
        })}
      </div>
    </div>
    <div className="space-y-2 border-t border-[#a780615c] pt-3" data-testid="collection-forge">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold text-[#f9d3ac]">首饰与装备工坊</h3>
        <span className="text-[11px] text-[#ddc3a9]" data-testid="collection-active-character">
          {selectedId?'当前角色：'+CHARACTER_PROFILES[selectedId].name:'先召唤角色卡'}
        </span>
      </div>
      <p className="text-[11px] leading-5 text-[#bda38f]">每次召唤获得碎片，重复契约获得额外碎片。打造后可给已收录角色装备，真正提升档案能力。</p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {FORGE_RECIPES.map(recipe=>{
          const owned=collection.inventory.includes(recipe.id);
          const current=selectedId&&collection.equipped[selectedId]?.[recipe.slot]===recipe.id;
          return <div key={recipe.id} className="flex min-w-0 flex-col justify-between gap-2 rounded-lg border border-[#80634982] bg-[#2a1d29] p-3">
            <div>
              <p className="text-xs font-semibold text-[#ffe2bf]">{recipe.name} <span className="text-[10px] text-[#be9f8b]">· {recipe.slot==='jewelry'?'首饰':'装备'}</span></p>
              <p className="mt-1 text-[11px] text-[#e0c3ac]">{recipe.description}</p>
            </div>
            <button type="button" data-testid={'collection-gear-'+recipe.id}
              disabled={status!=='ok'||(owned?(!selectedId||Boolean(current)):collection.shards<recipe.cost)}
              onClick={()=>owned?equip(recipe.id):forge(recipe.id)}
              className="min-h-10 rounded-md border border-[#c39b70] bg-[#583444] px-2 text-xs font-semibold text-[#ffe9cf] hover:brightness-110 disabled:opacity-45">
              {current?'已佩戴':owned?'给当前角色装备':'打造 · '+recipe.cost+' 碎片'}
            </button>
          </div>;
        })}
      </div>
    </div>
  </section>;
}
