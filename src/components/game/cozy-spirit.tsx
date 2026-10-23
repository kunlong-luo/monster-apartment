import { useId } from 'react';
import { SPIRIT_ART } from '@/core/spirit-art';
import type { SpiritId } from '@/core/spirit-collection';

/** The original characters without a portrait tile, rank medallion, or
 * background: they belong inside the living environment. */
export function CozySpirit({id,size=80}:{id:SpiritId;size?:number}){
  const art=SPIRIT_ART[id];
  const unique=useId().replace(/:/g,'');
  const body='cozy-skin-'+unique,ambient='cozy-ambient-'+unique;
  return <svg data-testid={'cozy-spirit-'+id} viewBox="0 0 120 120" width={size} height={size}
    className="cozy-character" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id={body} x1="0" x2=".8" y1="0" y2="1">
        <stop offset="0%" stopColor={art.highlight}/>
        <stop offset="58%" stopColor={art.primary}/>
        <stop offset="100%" stopColor={art.shadow}/>
      </linearGradient>
      <radialGradient id={ambient}>
        <stop offset="10%" stopColor={art.highlight} stopOpacity=".24"/>
        <stop offset="100%" stopColor={art.highlight} stopOpacity="0"/>
      </radialGradient>
    </defs>
    <ellipse cx="62" cy="105" rx="39" ry="9" fill="#2c2734" fillOpacity=".26"/>
    <circle cx="60" cy="60" r="58" fill={'url(#'+ambient+')'}/>
    <path d={art.back} fill={art.highlight} fillOpacity=".83" stroke={art.shadow}
      strokeWidth="2.8" strokeLinejoin="round" strokeLinecap="round"/>
    <path d={art.body} fill={'url(#'+body+')'} stroke={art.shadow} strokeWidth="3.4" strokeLinejoin="round"/>
    <path d={art.mark} fill="none" stroke={art.highlight} strokeWidth="4"
      strokeLinejoin="round" strokeLinecap="round"/>
    <g fill={art.shadow}><ellipse cx="49" cy={art.eyesY} rx="4" ry="5.4"/>
      <ellipse cx="73" cy={art.eyesY} rx="4" ry="5.4"/></g>
    <circle cx="48" cy={art.eyesY-2} r="1.6" fill="white"/>
    <circle cx="72" cy={art.eyesY-2} r="1.6" fill="white"/>
  </svg>;
}
