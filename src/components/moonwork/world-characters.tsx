'use client';
import Link from 'next/link';
import {WORLD_LINK_CLASS} from './world-primitives';
import Image from 'next/image';
import workerTriptych from '../../../v2/art/worker-triptych.avif';
import moonveilPortrait from '../../../public/art/yuesha-portrait-v2.webp';
import {WORKERS,MACHINES} from '../../../v2/src/workshop-engine';
import type {WorkshopState,WorkerId} from '../../../v2/src/workshop-engine';
const ids=['brook','fern','cinder'] as const;

export function Characters({s}:{s:WorkshopState}){
  return <>
    <section className="mw-art-gallery-intro" data-testid="character-gallery-header">
      <span className="mw-eyebrow">WORKER ROSTER · THE PEOPLE OF MOONLIGHT WORKSHOP</span>
      <h2>真正的工匠，在真正的岗位工作。</h2>
      <p>每位工匠只对应一个岗位。查看当前派工，再进入工坊改变水汽、孢子和晶核的生产效率。</p>
    </section>
    <div className="mw-worker-grid" data-testid="painted-worker-gallery">
      {ids.map((id:WorkerId,i)=>{
        const w=WORKERS[id];const plot=s.tiles.findIndex(t=>t?.worker===id);
        const working=plot>=0;
        return <section key={id} className={'mw-worker-card '+(working?'on-duty':'off-duty')}
          data-testid={'worker-card-'+id}>
          <div className="mw-worker-portrait" role="img"
            aria-label={w.zh+'的彩色奇幻角色绘景'}
            style={{backgroundImage:'url('+workerTriptych.src+')',
              backgroundPosition:i===0?'0% center':i===1?'50% center':'100% center'}}>
            <span className="mw-worker-role">{w.skill==='water'?'水汽匠':w.skill==='plant'?'园艺师':'晶核锻造师'}</span>
          </div>
          <div className="mw-worker-details">
            <p className="mw-eyebrow">GUILD PERSONNEL · {String(i+1).padStart(2,'0')}</p>
            <h2>{w.zh} <small>{w.en}</small></h2>
            <p className="mw-worker-job">{w.skill==='water'?'水汽制造':w.skill==='plant'?'孢子种植':'晶核锻造'}专长</p>
            <p className="mw-worker-assignment">{working
              ?'正在 '+String(plot+1).padStart(2,'0')+' 号工位 · '+MACHINES[s.tiles[plot]!.craft].zh
              :'目前待派工'}</p>
            <Link href={'/workshop/?worker='+id} className={WORLD_LINK_CLASS+' mt-auto w-full max-[620px]:px-2 max-[620px]:text-[11px]'}
              aria-label={'安排'+w.zh+'到工坊'}>前往工坊安排岗位 ↗</Link>
          </div>
        </section>;
      })}
    </div>
    <section className="mw-witch-banner">
      <div className="mw-witch-painting">
        <Image src={moonveilPortrait} fill unoptimized sizes="150px"
          alt="成年魔女商人月纱的绘制立绘"/>
      </div>
      <div><p className="mw-eyebrow">MOONLIT COMMISSIONS · THE MERCHANT</p>
        <h2>月纱 · 28 岁月夜魔女</h2>
        <p>她的委托从真实库存扣除晶核，并与普通订单竞争交付资源。
          {s.patron?'当前委托状态：'+s.patron.status:'首张正式订单完成后解锁。'}</p>
        <Link className={WORLD_LINK_CLASS} href="/orders/">进入委托大厅 ↗</Link>
      </div>
    </section>
  </>;
}
