import { useId } from 'react';
import { SPIRIT_ART } from '@/core/spirit-art';
import type { ResidentActivity } from '@/core/cozy-engine';
import type { SpiritId } from '@/core/spirit-collection';

/** Room residents and visitor portraits share one authored vector puppet.
 * Expressions, appendages and the ground contact are animated separately, so a
 * resident does not appear to float on top of a static icon tile. */
export function CozySpirit({id,size=80,activity}:{
  id:SpiritId;size?:number;activity?:ResidentActivity;
}){
  const art=SPIRIT_ART[id];
  const unique=useId().replace(/:/g,'');
  const body='cozy-skin-'+unique,ambient='cozy-ambient-'+unique;
  const rim='cozy-rim-'+unique;
  const sleeping=activity==='sleep';
  return <svg data-testid={'cozy-spirit-'+id} viewBox="0 0 120 120" width={size} height={size}
    className={'cozy-character cozy-spirit-svg'+(activity?' is-'+activity:'')}
    aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id={body} x1="0" x2=".8" y1="0" y2="1">
        <stop offset="0%" stopColor={art.highlight}/>
        <stop offset="48%" stopColor={art.primary}/>
        <stop offset="100%" stopColor={art.shadow}/>
      </linearGradient>
      <radialGradient id={ambient}>
        <stop offset="10%" stopColor={art.highlight} stopOpacity=".28"/>
        <stop offset="100%" stopColor={art.highlight} stopOpacity="0"/>
      </radialGradient>
      <linearGradient id={rim} x1="0" y1="0" x2=".8" y2=".7">
        <stop offset="0%" stopColor="#fff9dd" stopOpacity=".73"/>
        <stop offset="70%" stopColor={art.highlight} stopOpacity=".08"/>
        <stop offset="100%" stopColor={art.shadow} stopOpacity=".18"/>
      </linearGradient>
    </defs>
    <ellipse className="cozy-character-shadow" cx="60" cy="110" rx="32" ry="6"
      fill="#1c2332" opacity=".43"/>
    <ellipse cx="60" cy="60" rx="56" ry="54" fill={'url(#'+ambient+')'}
      opacity={activity?'1':'.66'}/>
    <g className="cozy-spirit-puppet">
      <g className="cozy-spirit-appendages">
        <path d={art.back} fill={art.highlight} fillOpacity=".79" stroke={art.shadow}
          strokeWidth="3.1" strokeLinejoin="round" strokeLinecap="round"/>
      </g>
      <g className="cozy-spirit-feet" fill={art.shadow} stroke={art.highlight}
        strokeOpacity=".48" strokeWidth="1.8">
        <ellipse cx="48" cy="96" rx="14" ry="8"/>
        <ellipse cx="76" cy="96" rx="14" ry="8"/>
      </g>
      <path d={art.body} fill={'url(#'+body+')'} stroke={art.shadow}
        strokeWidth="3.5" strokeLinejoin="round"/>
      <path d={art.body} fill={'url(#'+rim+')'} fillOpacity=".19"/>
      <path d={art.mark} fill="none" stroke={art.highlight} strokeWidth="3.6"
        strokeLinejoin="round" strokeLinecap="round"/>
      <path d="M43 51 Q53 39 66 44" fill="none" stroke="#fff9dc"
        strokeWidth="4.4" opacity=".33" strokeLinecap="round"/>
      {sleeping
        ? <g className="cozy-sleep-eyes" fill="none" stroke={art.shadow}
            strokeWidth="3.5" strokeLinecap="round">
            <path d={`M41 ${art.eyesY} Q49 ${art.eyesY+7} 57 ${art.eyesY}`}/>
            <path d={`M65 ${art.eyesY} Q73 ${art.eyesY+7} 81 ${art.eyesY}`}/>
          </g>
        : <g className="cozy-spirit-eye-blink">
            <g fill={art.shadow}>
              <ellipse cx="49" cy={art.eyesY} rx="4.5" ry="5.8"/>
              <ellipse cx="73" cy={art.eyesY} rx="4.5" ry="5.8"/>
            </g>
            <circle cx="47.9" cy={art.eyesY-2.2} r="1.8" fill="#fff"/>
            <circle cx="72" cy={art.eyesY-2.2} r="1.8" fill="#fff"/>
          </g>}
      <ellipse cx="37" cy={art.eyesY+11} rx="7" ry="4" fill="#f5ac9a" opacity=".2"/>
      <ellipse cx="84" cy={art.eyesY+11} rx="7" ry="4" fill="#f5ac9a" opacity=".2"/>
      <g className="cozy-spirit-arms" fill={art.primary}
        stroke={art.shadow} strokeWidth="2.1" strokeLinecap="round">
        <path d="M34 76 Q22 75 23 84 Q26 90 37 84Z"/>
        <path d="M88 76 Q99 73 99 83 Q97 91 85 85Z"/>
      </g>
      {activity==='work'&&<path className="cozy-spirit-tool" d="M96 74 L109 60 M104 61 L115 67"
        stroke="#f8dcaa" strokeWidth="3" strokeLinecap="round" fill="none"/>}
    </g>
  </svg>;
}
