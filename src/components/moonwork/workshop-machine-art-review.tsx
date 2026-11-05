'use client';

import {useEffect,useRef,useState} from 'react';
import Image from 'next/image';
import {Eye,Pause,Play,X} from 'lucide-react';
import {workshopAssetRoot} from '@/lib/moonwork/asset-root';
import type {Craft} from '../../../v2/src/workshop-engine';

const CRAFTS:{id:Craft;name:string;material:string}[]=[
  {id:'well',name:'水汽泵',material:'黄铜 · 蓝色储液玻璃'},
  {id:'garden',name:'孢子温室',material:'雕花金属 · 玻璃穹顶 · 月光植物'},
  {id:'kiln',name:'晶核熔炉',material:'紫黑炉体 · 黄铜 · 熔融晶体'},
];
type Level=1|2|3;
const LEVELS=[1,2,3] as const;
const FRAME_LABELS=['回位','启动','峰值','复位'] as const;

/** The review panel never dispatches workshop actions or touches a save.
 * It is not available to ordinary players, not even as a hidden game button. */
export function WorkshopMachineArtReview(){
  const [reviewEnabled,setReviewEnabled]=useState(false);
  const [base,setBase]=useState('');
  const [open,setOpen]=useState(false);
  const [craft,setCraft]=useState<Craft>('well');
  const [level,setLevel]=useState<Level>(2);
  const [frame,setFrame]=useState(0);
  const [playing,setPlaying]=useState(false);
  const [motionAllowed,setMotionAllowed]=useState(false);
  const dialog=useRef<HTMLDialogElement>(null);
  const launcher=useRef<HTMLButtonElement>(null);
  const lastFocus=useRef<HTMLElement|null>(null);

  useEffect(()=>{
    const params=new URLSearchParams(window.location.search);
    setReviewEnabled(params.get('machine-art')==='review');
    setBase(workshopAssetRoot(window.location.href));
  },[]);
  useEffect(()=>{
    const target=dialog.current;
    if(!target)return;
    if(open&&!target.open){lastFocus.current=document.activeElement as HTMLElement;target.showModal();}
    else if(!open&&target.open)target.close();
  },[open]);
  useEffect(()=>{
    if(!reviewEnabled)return;
    const media=window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync=()=>{
      let paused=false;
      try{paused=window.localStorage.getItem('monster-apartment:gothic-motion-reduced')==='1';}
      catch{/* Private storage must not change art review availability. */}
      setMotionAllowed(!media.matches&&!paused);
    };
    sync();
    media.addEventListener('change',sync);
    window.addEventListener('monster-apartment:motion-changed',sync);
    window.addEventListener('storage',sync);
    return ()=>{
      media.removeEventListener('change',sync);
      window.removeEventListener('monster-apartment:motion-changed',sync);
      window.removeEventListener('storage',sync);
    };
  },[reviewEnabled]);
  useEffect(()=>{
    if(!playing||!open||!motionAllowed||level!==2)return;
    const timer=window.setInterval(()=>setFrame(previous=>(previous+1)%4),320);
    return ()=>window.clearInterval(timer);
  },[playing,open,motionAllowed,level]);
  const close=()=>{
    setPlaying(false);setOpen(false);
    window.requestAnimationFrame(()=>lastFocus.current?.focus());
  };
  if(!reviewEnabled||!base)return null;

  const machine=CRAFTS.find(item=>item.id===craft)!;
  const still=new URL('assets/review/machines/'+craft+'/lv'+level+'.webp',base).href;
  const atlas=new URL('assets/review/machines/'+craft+'/working.webp',base).href;
  const showAtlas=level===2;
  return <>
    <button
      type="button" ref={launcher}
      data-testid="workshop-art-review-launcher"
      className="workshop-review-launcher"
      onClick={()=>setOpen(true)}
      aria-haspopup="dialog"
      aria-label="打开工坊设备美术审核"
    ><Eye size={16} aria-hidden="true"/> 设备原画检查</button>
    <dialog
      ref={dialog}
      data-testid="workshop-art-review-dialog"
      className="workshop-art-review"
      aria-labelledby="workshop-art-review-title"
      onClose={()=>{setOpen(false);setPlaying(false);launcher.current?.focus();}}
      onCancel={()=>{setPlaying(false);}}
    >
      <header className="workshop-art-review__header">
        <div>
          <p className="workshop-art-review__eyebrow">ART QA · ONLY IN REVIEW MODE</p>
          <h2 id="workshop-art-review-title">设备原画 · 原尺寸审查</h2>
          <p>12 件候选素材尚未获批。可以查看构图、透明像素、等级外形及工作帧；本面板不修改存档。</p>
        </div>
        <button type="button" onClick={close} aria-label="关闭原画审查" className="workshop-art-review__close"><X size={19}/></button>
      </header>
      <div className="workshop-art-review__controls">
        <fieldset aria-label="选择设备">
          <legend>设备类型</legend>
          <div className="workshop-art-review__choices">
            {CRAFTS.map(item=><button key={item.id} type="button"
              data-testid={'workshop-review-craft-'+item.id}
              aria-pressed={craft===item.id}
              onClick={()=>{setCraft(item.id);setFrame(0);setPlaying(false);}}
            >{item.name}</button>)}
          </div>
        </fieldset>
        <fieldset aria-label="选择设备等级">
          <legend>真实等级外观</legend>
          <div className="workshop-art-review__choices">
            {LEVELS.map(value=><button key={value} type="button"
              data-testid={'workshop-review-level-'+value}
              aria-pressed={level===value}
              onClick={()=>{setLevel(value);setFrame(0);setPlaying(false);}}
            >Lv.{value}</button>)}
          </div>
        </fieldset>
      </div>
      <div className="workshop-art-review__canvases">
        <figure>
          <div className="workshop-art-review__checkboard">
            <Image
              key={still} data-testid="workshop-review-static-image"
              alt={machine.name+' Lv.'+level+' 独立透明美术候选'}
              src={still} unoptimized width={512} height={512} sizes="(max-width:720px) 100vw, 512px"
            />
          </div>
          <figcaption>512 × 512 · {machine.name} Lv.{level} · {machine.material}</figcaption>
        </figure>
        <figure>
          {showAtlas?
            <div className="workshop-art-review__checkboard">
              <div
                role="img"
                aria-label={machine.name+' 第'+(frame+1)+'帧 '+FRAME_LABELS[frame]}
                data-testid="workshop-review-working-frame"
                data-frame={frame}
                className="workshop-art-review__atlas-frame"
                style={{
                  backgroundImage:'url('+JSON.stringify(atlas)+')',
                  backgroundPosition:(frame*100/3)+'% 50%',
                }}
              />
            </div>:
            <div className="workshop-art-review__unavailable" data-testid="workshop-review-no-atlas">
              <strong>Lv.{level} 工作态尚未绘制</strong>
              <p>不使用 Lv.2 动画冒充其他等级；以左侧静态机体为准。</p>
            </div>
          }
          <figcaption>{showAtlas?'2048 × 512 · 四帧局部机械工作态':'Lv.'+level+' · 保留独立机体结构'}</figcaption>
        </figure>
      </div>
      <div className="workshop-art-review__timeline">
        <div className="workshop-art-review__choices" aria-label="逐帧查看">
          {FRAME_LABELS.map((label,index)=><button key={label} type="button"
            data-testid={'workshop-review-frame-'+index}
            disabled={!showAtlas}
            aria-pressed={showAtlas&&frame===index}
            onClick={()=>{setFrame(index);setPlaying(false);}}
          >{index+1} · {label}</button>)}
        </div>
        <button type="button"
          data-testid="workshop-review-playback"
          className="workshop-art-review__play"
          disabled={!showAtlas||!motionAllowed}
          onClick={()=>setPlaying(value=>!value)}
        >{playing?<Pause size={15}/>:<Play size={15}/>}
          {playing?'暂停':'播放四帧'}
        </button>
      </div>
      <p className="workshop-art-review__foot">
        透明棋盘用于识别白边与黑边。所有图像仍属结构审核稿；最终高清哥特 CG 须另行绘制和批准。
        {(!motionAllowed&&showAtlas)&&' 系统或游戏已降低动态效果，请用逐帧按钮检查。'}
      </p>
    </dialog>
  </>;
}
