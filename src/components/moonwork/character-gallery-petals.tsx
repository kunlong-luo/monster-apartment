'use client';

import {motion} from 'motion/react';
import {siteAssetUrl} from '@/lib/game/site-asset-url';

/** Independent, lightweight A05 rose-petal foreground. These are actual
 * transparent decorative assets; all game data/UI stays in separate layers.
 * Coordinates are deterministic so server/client hydration is stable. */
const PETALS=[
  {left:2.5,top:18,size:41,angle:-28,duration:21,delay:0,opacity:.56},
  {left:15,top:5,size:31,angle:54,duration:27,delay:4,opacity:.45},
  {left:27,top:9,size:27,angle:13,duration:24,delay:9,opacity:.42},
  {left:69,top:5,size:35,angle:-39,duration:29,delay:7,opacity:.50},
  {left:91,top:22,size:37,angle:77,duration:23,delay:2,opacity:.54},
  {left:96,top:67,size:45,angle:-65,duration:31,delay:13,opacity:.61},
] as const;

export function CharacterGalleryPetals({reducedMotion}:{reducedMotion:boolean}){
  const petal=siteAssetUrl('/art/a05/rose-petal.svg');
  return <div className="cg-petal-layer" data-testid="a05-petal-layer"
    aria-hidden="true" data-motion={reducedMotion?'reduced':'ambient'}>
    {PETALS.map((item,index)=><motion.span key={index}
      className="cg-petal-layer__petal"
      style={{
        left:item.left+'%',top:item.top+'%',width:item.size,
        aspectRatio:'80 / 52',backgroundImage:'url('+JSON.stringify(petal)+')',
      }}
      initial={false}
      animate={reducedMotion?{opacity:0}:{
        x:[0,-14,22,4],y:[0,24,62,110],
        rotate:[item.angle,item.angle+20,item.angle-24,item.angle+35],
        opacity:[item.opacity,item.opacity*.8,item.opacity*.6,0],
      }}
      transition={reducedMotion?{duration:0}:{
        duration:item.duration,delay:item.delay,
        repeat:Infinity,ease:'linear',
      }}/>)}
  </div>;
}
