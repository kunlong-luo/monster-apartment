'use client';

import {AnimatePresence,motion} from 'motion/react';
import {CircleDot,LockKeyhole,MoonStar,Sparkles} from 'lucide-react';
import type {SummonableCharacter} from '@/lib/summon/gacha-engine';
import {CharacterContractCard} from './character-contract-card';
import {strongestSummonResult,type ActiveRitualPhase} from '@/lib/summon/ritual-presentation';

/** Cinematic layers never perform a pull, consume items or write a save.
 * The existing approved portrait stays separate from its ritual effects. */
export function SummonRitualSequence({characters,phase,still,onSkip}:{
  characters:SummonableCharacter[];phase:ActiveRitualPhase;still:boolean;onSkip:()=>void;
}){
  const {rarity,scene}=strongestSummonResult(characters);
  const mythic=rarity==='SSR-Mythic';
  const legendary=rarity==='SSR-Legend'||mythic;
  const featured=characters.reduce((best,c)=>c.rarity===rarity?c:best,characters[0]);
  const stageText={
    charge:{eyebrow:'THE AWAKENING',title:'月华汇聚',subtitle:'古老的契约回应了你的呼唤'},
    seal:{eyebrow:'THE COVENANT',title:'封印开启',subtitle:'破晓之前，契约之门只为命定之人开启'},
    omen:{eyebrow:'THE OMEN',title:scene.title,subtitle:scene.subtitle},
    flip:{eyebrow:'THE REVELATION',title:legendary?'命运揭晓':'契约显形',subtitle:'她的故事，从这一刻开始'},
  }[phase];
  return <div data-testid="summon-ritual-intro" data-ritual-phase={phase}
    data-omen-rarity={phase==='omen'||phase==='flip'?rarity:undefined}
    data-ritual-tone={scene.tone} className={'summon-cinematic-ritual'+(mythic?' summon-cinematic-ritual--mythic':'')}
    style={{'--ritual-accent':scene.accent} as React.CSSProperties}>
    <div className="summon-cinematic-ritual__sky" aria-hidden="true"/>
    <div className="summon-cinematic-ritual__particles" aria-hidden="true">
      {Array.from({length:14},(_,i)=><i key={i} style={{'--spark-index':i} as React.CSSProperties}/>)}
    </div>
    <div className="summon-cinematic-ritual__art">
      <AnimatePresence mode="wait" initial={false}>
        {phase==='charge'&&<motion.div key="charge" className="summon-cinematic-ritual__seal"
          initial={still?false:{opacity:0,scale:.42,rotate:-25}}
          animate={{opacity:1,scale:1,rotate:0}}
          exit={{opacity:0,scale:1.42}}
          transition={{duration:still?0:.54,ease:'easeOut'}}>
          <div className="summon-cinematic-ritual__ring summon-cinematic-ritual__ring--outer"/>
          <div className="summon-cinematic-ritual__ring summon-cinematic-ritual__ring--inner"/>
          <MoonStar size={91} strokeWidth={.95} aria-hidden="true"/>
        </motion.div>}
        {phase==='seal'&&<motion.div key="seal" className="summon-cinematic-ritual__seal"
          initial={still?false:{opacity:0,scale:.88,rotate:12}}
          animate={{opacity:1,scale:1,rotate:0}}
          exit={{opacity:0,scale:1.18,filter:'blur(16px)'}}
          transition={{duration:still?0:.61,ease:'easeOut'}}>
          <div className="summon-cinematic-ritual__ring summon-cinematic-ritual__ring--opening"/>
          <LockKeyhole size={84} strokeWidth={1.05} aria-hidden="true"/>
          <div className="summon-cinematic-ritual__seam"/>
        </motion.div>}
        {phase==='omen'&&<motion.div key="omen" className="summon-cinematic-ritual__omen"
          initial={still?false:{opacity:0,scale:.72,y:24}}
          animate={{opacity:1,scale:1,y:0}}
          exit={{opacity:0,scale:1.18}}
          transition={{duration:still?0:.55,ease:'easeOut'}}>
          <div className="summon-cinematic-ritual__omen-halo"/>
          {legendary?<Sparkles size={90} strokeWidth={1.2} aria-hidden="true"/>:
            <CircleDot size={90} strokeWidth={1} aria-hidden="true"/>}
          <strong>{featured.rarityZh}</strong>
          <span>{characters.length===10?'十连契约中最耀眼的共鸣':'命定之人的契约气息'}</span>
        </motion.div>}
        {phase==='flip'&&<motion.div key="flip" className="summon-cinematic-ritual__flip"
          data-testid="summon-ritual-flip" aria-label="契约卡牌翻面">
          <motion.div className="summon-cinematic-ritual__turning-card"
            initial={still?false:{rotateY:-180,scale:.74,opacity:.65}}
            animate={{rotateY:0,scale:1,opacity:1}}
            transition={{duration:still?0:.75,ease:[.22,.62,.18,1]}}>
            <CharacterContractCard character={featured}/>
            <div className="summon-cinematic-ritual__card-back" aria-hidden="true">
              <MoonStar size={72} strokeWidth={1}/>
            </div>
          </motion.div>
          <div className="summon-cinematic-ritual__flash" aria-hidden="true"/>
        </motion.div>}
      </AnimatePresence>
    </div>
    <motion.div className="summon-cinematic-ritual__copy" key={phase}
      initial={still?false:{opacity:0,y:16}}
      animate={{opacity:1,y:0}}
      transition={{duration:still?0:.34}}>
      <span>{stageText.eyebrow}</span>
      <h2>{stageText.title}</h2>
      <p>{stageText.subtitle}</p>
    </motion.div>
    <div className="summon-cinematic-ritual__footer">
      <span className="summon-cinematic-ritual__progress" aria-label="契约仪式进度">
        {(['charge','seal','omen','flip'] as const).map(step=>
          <i key={step} data-active={step===phase} data-passed={(['charge','seal','omen','flip'] as const).indexOf(step)<(['charge','seal','omen','flip'] as const).indexOf(phase)}/>)}
      </span>
      <button type="button" className="summon-cinematic-ritual__skip"
        data-testid="summon-ritual-skip" onClick={onSkip}>跳过仪式</button>
    </div>
  </div>;
}
