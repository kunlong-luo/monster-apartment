'use client';

import {useState} from 'react';
import type {KeyboardEvent} from 'react';
import {ChevronLeft,ChevronRight,Eye,Layers3,MoonStar,SkipForward} from 'lucide-react';
import {motion} from 'motion/react';
import type {SummonableCharacter} from '@/lib/summon/gacha-engine';
import {CharacterContractCard,SUMMON_RARITY_RANK} from './character-contract-card';

export function SummonResultStage({characters,still,onSummonAgain,onViewCollection,onClose}:{
  characters:SummonableCharacter[];
  still:boolean;
  onSummonAgain?:()=>void;
  onViewCollection?:()=>void;
  onClose:()=>void;
}){
  const multi=characters.length>1;
  const [revealedIndices,setRevealedIndices]=useState<number[]>(multi?[]:[0]);
  const [selectedIndex,setSelectedIndex]=useState(0);
  const allRevealed=!multi||revealedIndices.length===characters.length;
  const selected=characters[selectedIndex];
  const selectedVisible=!multi||revealedIndices.includes(selectedIndex);
  const bestIndex=characters.reduce((best,current,index)=>
    SUMMON_RARITY_RANK[current.rarity]>SUMMON_RARITY_RANK[characters[best].rarity]?index:best,0);
  const select=(index:number)=>{
    if(index<0||index>=characters.length)return;
    setSelectedIndex(index);
    setRevealedIndices(previous=>previous.includes(index)?previous:[...previous,index]);
  };
  const revealAll=()=>{
    setRevealedIndices(characters.map((_,i)=>i));
    setSelectedIndex(bestIndex);
  };
  const onThumbKeyDown=(event:KeyboardEvent<HTMLButtonElement>,index:number)=>{
    if(event.key==='ArrowRight'||event.key==='ArrowLeft'){
      event.preventDefault();
      const next=(index+(event.key==='ArrowRight'?1:-1)+characters.length)%characters.length;
      const btn=event.currentTarget.closest('[data-testid="collection-reveal"]')
        ?.querySelectorAll<HTMLButtonElement>('[data-testid="summon-result-thumb"]')[next];
      btn?.focus();
      select(next);
    }
  };
  return <motion.div className="summon-result" data-testid="summon-result-stage"
    data-count={characters.length} data-selected-index={selectedIndex}
    initial={still?false:{opacity:0,scale:.975,y:18}} animate={{opacity:1,scale:1,y:0}}
    transition={{duration:still?0:.4,ease:'easeOut'}}>
    <header className="summon-result__heading">
      <span>MOONLIT COVENANT · 契约已缔结</span>
      <h2>{multi?'十连召唤 · 契约回响':'命定相遇 · 契约揭晓'}</h2>
      <p>{multi?'十张契约已存入图鉴 · 点选卡背揭晓人物':'此刻属于你获得的角色'}</p>
    </header>
    <div className="summon-result__body">
      <aside className="summon-result__side summon-result__side--left" aria-label="本次召唤信息">
        <MoonStar size={26} strokeWidth={1.25} aria-hidden="true"/>
        <span className="summon-result__section-label">THE AWAKENING</span>
        <strong>{String(selectedIndex+1).padStart(2,'0')}<small> / {String(characters.length).padStart(2,'0')}</small></strong>
        <span className="summon-result__rule"/>
        <p>每段契约，都有自己的故事。</p>
      </aside>
      <div className="summon-result__focus" aria-live="polite" aria-label="当前人物契约大卡"
        data-testid="summon-result-focus">
        {selectedVisible?
          <motion.div key={selectedIndex} className="summon-result__hero"
            initial={still?false:{opacity:0,rotateY:-14,scale:.92}}
            animate={{opacity:1,rotateY:0,scale:1}}
            transition={{duration:still?0:.42,ease:'easeOut'}}>
            <CharacterContractCard character={selected}
              awardTestId={multi?'collection-focus-award':'collection-reveal-award'}/>
          </motion.div>
        :<div className="summon-result__sealed" data-testid="summon-result-sealed">
          <MoonStar size={62} strokeWidth={1} aria-hidden="true"/>
          <strong>尚未翻开的契约</strong>
          <p>从下方选择卡牌，见证命定的相遇</p>
          <button type="button" onClick={()=>select(selectedIndex)}
            data-testid="summon-reveal-current">揭晓当前契约</button>
        </div>}
      </div>
      <aside className="summon-result__side summon-result__side--right" aria-label="契约详情">
        <span className="summon-result__section-label">CONTRACT</span>
        <strong>{selectedVisible?selected.name:'封印未启'}</strong>
        <span className="summon-result__rule"/>
        <p>{selectedVisible?selected.bio:'每一张卡牌都已对应真实抽取结果，翻开不会重新扣除资源。'}</p>
        {multi&&<div className="summon-result__step-controls">
          <button type="button" aria-label="上一张契约" onClick={()=>select((selectedIndex+characters.length-1)%characters.length)}>
            <ChevronLeft size={18}/>
          </button>
          <button type="button" aria-label="下一张契约" onClick={()=>select((selectedIndex+1)%characters.length)}>
            <ChevronRight size={18}/>
          </button>
        </div>}
      </aside>
    </div>
    {multi&&<div className="summon-result__filmstrip" data-testid="summon-result-filmstrip"
      aria-label="十连契约卡片">
      {characters.map((character,index)=>{
        const revealed=revealedIndices.includes(index);
        return <button key={index} type="button" data-testid="summon-result-thumb"
          className={'summon-result__thumb'+(index===selectedIndex?' is-selected':'')}
          aria-current={index===selectedIndex?'true':undefined}
          aria-label={revealed?'已揭晓：'+character.title:'翻开第 '+(index+1)+' 张契约卡'}
          onClick={()=>select(index)} onKeyDown={event=>onThumbKeyDown(event,index)}>
          {revealed?<CharacterContractCard character={character} mode="thumbnail"
            awardTestId="collection-reveal-award"/>:
            <span className="summon-result__thumb-back">
              <MoonStar aria-hidden="true" size={25} strokeWidth={1.3}/>
              <small>{String(index+1).padStart(2,'0')}</small>
            </span>}
        </button>;
      })}
    </div>}
    <footer className="summon-result__footer">
      <div className="summon-result__progress" role="status">
        {multi?<><Layers3 size={15}/><span>已揭晓 {revealedIndices.length} / {characters.length}</span></>:
        <><Eye size={15}/><span>可随时回到图鉴欣赏角色</span></>}
      </div>
      <div className="summon-result__actions">
        {multi&&!allRevealed&&<button type="button" className="summon-result__secondary"
          onClick={revealAll}><SkipForward size={15}/>全部翻开</button>}
        {allRevealed&&onSummonAgain&&<button type="button" className="summon-result__primary"
          onClick={onSummonAgain}>{multi?'再抽十次':'再抽一次'}</button>}
        {allRevealed&&onViewCollection&&<button type="button" className="summon-result__secondary"
          data-testid="collection-reveal-view-collection" onClick={onViewCollection}>查看获得的契约与装备</button>}
        <button type="button" className="summon-result__secondary"
          data-testid="collection-reveal-close" onClick={onClose}>确定收下</button>
      </div>
    </footer>
  </motion.div>;
}
