'use client';
import Image from 'next/image';
import {useEffect,useState} from 'react';
import moonveilBust from '../../../public/art/yuesha-bust-v3.webp';
import moonveilBackdrop from '../../../public/art/lobby-hero-v3.webp';
import {yueshaAfterChoice} from '@/core/character-life';
import type {YueshaChoice} from '@/core/character-life';
import {commitCharacterLife,useCharacterLife} from '@/lib/game/character-life-store';
import {CharacterLifePortrait} from './character-life-portrait';
type Hotspot='seal'|'tea'|'ledger';
export function YueshaPrivateRoom({guests,happiness}:{guests:number;happiness:number}){
  const [hotspot,setHotspot]=useState<Hotspot|null>(null);
  const [feedback,setFeedback]=useState('');
  const {status,progress}=useCharacterLife();
  const choice=progress.decisions['yuesha-first-visit'];
  const observed=progress.observations?.yuesha??[];
  useEffect(()=>{if(status==='ok')commitCharacterLife({type:'visit',id:'yuesha'});},[status]);
  const inspect=(item:Hotspot)=>{
    setHotspot(item);
    const result=commitCharacterLife({type:'inspect',id:'yuesha',item});
    setFeedback(result==='applied'?'你记下了这段细节。':result==='duplicate'?'这个物品你已经仔细看过了。':'人物观察记录暂时无法保存。');
  };
  const discuss=(value:YueshaChoice)=>{
    const result=commitCharacterLife({type:'yuesha-choice',choice:value});
    setFeedback(result==='applied'?'月纱记住了你的选择。':result==='duplicate'?'这段初次谈话已经记录。':'人物档案无法写入，原存档未被覆盖。');
  };
  return <div className="min-w-0 flex-1 space-y-3" data-testid="yuesha-private-room">
    <div className="relative h-[clamp(205px,36vh,310px)] overflow-hidden rounded-xl border border-[#cfaa837c] bg-[#171020]">
      <Image src={moonveilBackdrop} alt="" fill priority sizes="(max-width:700px) 90vw, 640px"
        className="object-cover object-[44%_40%] opacity-65" aria-hidden/>
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,#110b18ba,transparent_48%,#120a1ca8),linear-gradient(0deg,#120a1af4,transparent_43%)]"/>
      <div className="pointer-events-none absolute right-[4%] bottom-0 h-[95%] w-[42%] max-w-[230px]">
        <Image src={moonveilBust} alt="月纱在月夜会客室等待来访" fill sizes="240px" unoptimized
          className="object-contain object-bottom drop-shadow-[0_8px_22px_#000]"/>
      </div>
      <div className="pointer-events-none absolute top-3 left-3 text-[10px] tracking-[.15em] text-[#f6d0a3]">PRIVATE CHAMBER · MOONLIT CONTRACTS</div>
      <div className="absolute bottom-3 left-3 max-w-[56%] space-y-1 text-shadow-md">
        <h3 className="text-lg text-[#ffe3bd] sm:text-2xl">月纱的契约会客室</h3>
        <p className="text-[11px] leading-5 text-[#e4c7ab]">月纹、旧契约和一杯香料茶</p>
      </div>
    </div>
    <p className="text-[10px] text-[#bda089]">场景纵切片：暂复用现有高清绘景与月纱立绘，独立室内 CG 仍待制作。</p>
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#ad89644a] bg-[#211520b8] px-3 py-2 text-xs" data-testid="yuesha-living-state">
      <span>今夜心情：{happiness>=70?'安心':'牵挂邻居'}</span>
      <span>公寓现住 {guests} 位邻居</span>
      <span>与你的关系：{choice==='transparent'?'认可公开负责':choice==='careful'?'认可谨慎守约':'初识 · 保持距离'}</span>
    </div>
    {status!=='ok'&&<p role="alert" className="rounded-lg border border-[#b37f82] p-3 text-xs text-[#ffc5c5]">
      {status==='corrupt'?'人物档案存档损坏：已保留原数据，不会自动覆盖。':'浏览器未允许持久保存人物档案，本次无法记录选择。'}
    </p>}
    <div className="space-y-2">
      <span className="block text-xs text-[#f0c58e]">月纱的私人话题 · 选择一次，之后可以重访回忆</span>
      <p className="rounded-lg border border-[#ac886c55] bg-[#241520c7] px-3 py-2 text-sm leading-7 text-[#f4dcc8]"
        data-testid="yuesha-dialogue">{yueshaAfterChoice(choice)}</p>
      {!choice&&<div className="grid gap-2 sm:grid-cols-2">
        <button type="button" disabled={status!=='ok'} onClick={()=>discuss('transparent')}
          className="min-h-11 rounded-lg border border-[#a68a6b] bg-[#463140bd] px-3 py-2 text-left text-xs leading-5 hover:bg-[#634250] disabled:opacity-50"
          data-testid="yuesha-choice-transparent">“先把真实的合同与影响告诉东街。”</button>
        <button type="button" disabled={status!=='ok'} onClick={()=>discuss('careful')}
          className="min-h-11 rounded-lg border border-[#a68a6b] bg-[#463140bd] px-3 py-2 text-left text-xs leading-5 hover:bg-[#634250] disabled:opacity-50"
          data-testid="yuesha-choice-careful">“先稳定工坊生产，再作公开承诺。”</button>
      </div>}
      {choice&&<p className="text-[11px] text-[#f0c58e]">已记录的观点：{choice==='transparent'?'透明公开优先':'稳健交付优先'}。这是人物故事选择，不会直接修改订单和仓库。</p>}
      {feedback&&<p role="status" className="text-xs text-[#ebc79c]">{feedback}</p>}
    </div>
    <div className="space-y-2">
      <span className="text-xs text-[#f0c58e]">观察会客室的物件</span>
      <div className="flex flex-wrap gap-2">
        {([
          {id:'seal',label:'月纹蜡封'},
          {id:'tea',label:'香料茶杯'},
          {id:'ledger',label:'旧账簿'},
        ] as const).map(item=><button key={item.id} type="button" onClick={()=>inspect(item.id)}
          aria-pressed={hotspot===item.id}
          className="min-h-10 rounded-full border border-[#b18b68a8] bg-[#2d1e2bbd] px-3 py-1.5 text-xs hover:border-[#ffe0b6] aria-pressed:bg-[#674351]">{item.label}</button>)}
      </div>
      {observed.length>0&&<p className="text-[10px] text-gothic-muted">已记录 {observed.length}/3 件会客室物品</p>}
      {hotspot&&<p className="rounded-lg bg-[#382433a1] p-3 text-xs leading-6 text-[#f2d2b5]" data-testid="yuesha-hotspot-text">
        {hotspot==='seal'?'蜡封上的月纹，与旧公寓钥匙的纹样有些相似。月纱没有立即回答你的疑问。':
          hotspot==='tea'?'杯里有桂皮与温暖的香气。月纱说，做生意之前应该先好好喝一杯茶。':
          '账簿封面有多年前的磨损痕迹。里面记着什么，目前还不能公开。'}
      </p>}
    </div>
    <CharacterLifePortrait id="yuesha"/>
  </div>;
}
