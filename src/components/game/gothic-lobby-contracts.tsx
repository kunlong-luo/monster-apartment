'use client';

import Link from 'next/link';
import {ArrowUpRight,ChevronRight,Crown,ScrollText} from 'lucide-react';
import {ReliableImage as Image} from './reliable-image';
import {HEROINE_FACE_ART} from '@/components/summon/heroine-portrait-assets';
import moonveilBust from '../../../public/art/yuesha-bust-v3.webp';

type LobbyContractsProps={
  orderReady:boolean;
  orderTarget:number;
  orderStock:number;
  orderProgress:number;
  firstContract:boolean;
  collectionStatus:'ok'|'corrupt'|'unavailable';
  tickets:number;
  ownedContractCount:number;
};

/**
 * Two real destinations share the side rail: the actual workshop order and
 * the summon contract. Gacha/store rules stay in the parent and domain engine.
 */
export function GothicLobbyContracts({
  orderReady,orderTarget,orderStock,orderProgress,
  firstContract,collectionStatus,tickets,ownedContractCount
}:LobbyContractsProps){
  return (
    <section className="gothic-lobby__mission-rail" aria-label="当前主线与契约活动">
      <Link href={orderReady?'/orders/':'/workshop/'}
        aria-label={orderReady?'晶核已备齐，查看委托交期':'晶核不足，前往工坊生产'}
        data-testid="gothic-main-quest" className="gothic-lobby__mission-card gothic-lobby__mission-card--quest">
        <span className="gothic-lobby__card-kicker"><ScrollText className="gothic-lobby__card-icon" aria-hidden="true" size={15} strokeWidth={1.55}/>主线 · 月影之约 <ArrowUpRight aria-hidden="true" size={15} strokeWidth={1.7}/></span>
        <strong>{orderReady?'晶核已备齐 · 去委托核对交期':'与月纱一起筹备第一批晶核'}</strong>
        <span className="gothic-lobby__mission-detail">
          {orderReady?'下一步：确认交付和奖励':'去工坊生产 · 晶核 '+orderStock+' / '+orderTarget}
        </span>
        <span role="progressbar" aria-label="晶核收集进度"
          aria-valuemin={0} aria-valuemax={orderTarget}
          aria-valuenow={Math.min(orderStock,orderTarget)}
          data-testid="gothic-main-quest-progress"
          className="gothic-lobby__progress"><span style={{width:orderProgress+'%'}}/></span>
      </Link>
      <Link href="/characters/#summon-screen"
        className="gothic-lobby__mission-card gothic-lobby__mission-card--eclipse"
        data-testid="gothic-eclipse-feature" data-first-contract={firstContract?'true':'false'}
        aria-label={firstContract?'开始第一次契约召唤，收录你的人物卡':'前往契约召唤，收集更多人物'}>
        <span className="gothic-lobby__card-kicker"><Crown className="gothic-lobby__card-icon" aria-hidden="true" size={15} strokeWidth={1.55}/>{firstContract?'初次契约':'契约收藏'}
          <small className="gothic-lobby__chapter-mark" aria-hidden="true">月蚀誓约</small>
        </span>
        <span className="gothic-lobby__summon-illustration" aria-hidden="true">
          <Image src={moonveilBust} alt="" fill sizes="220px" className="object-cover object-[center_20%]"/>
        </span>
        <strong data-testid="lobby-summon-guide-title">{collectionStatus==='ok'?'神话 · 月蚀':'人物契约需检查'}</strong>
        <span className="gothic-lobby__mission-detail" data-testid="lobby-summon-guide-detail">
          {firstContract?`拥有 ${tickets} 张召唤券 · 开启初次契约`:
            `已收录 ${ownedContractCount}/5 · 剩余 ${tickets} 张召唤券`}
        </span>
        <span className="gothic-lobby__summon-verse">月下的誓言，等待命定之人。</span>
        <div className="gothic-lobby__contract-faces" aria-hidden="true">
          {(['yuesha','brook','fern','cinder'] as const).map(id=>
            <span key={id} className="gothic-lobby__contract-face">
              <Image src={HEROINE_FACE_ART[id]} alt="" width={39} height={39} sizes="39px" loading="eager"/>
            </span>)}
          <ChevronRight className="gothic-lobby__contract-arrow" aria-hidden="true" size={20} strokeWidth={1.6}/>
        </div>
      </Link>
    </section>
  );
}
