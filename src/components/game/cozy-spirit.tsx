import { useId } from 'react';
import { SPIRIT_ART } from '@/core/spirit-art';
import type { HomeType, ResidentActivity } from '@/core/cozy-engine';
import type { SpiritId } from '@/core/spirit-collection';

/** Room residents and visitor portraits share one authored vector puppet.
 * Expressions, appendages and the ground contact are animated separately, so a
 * resident does not appear to float on top of a static icon tile. */
export function CozySpirit({id,size=80,activity,frame=0,roomType}:{
  id:SpiritId;size?:number;activity?:ResidentActivity;
  frame?:0|1|2|3;roomType?:HomeType;
}){
  const art=SPIRIT_ART[id];
  const unique=useId().replace(/:/g,'');
  const body='cozy-skin-'+unique,ambient='cozy-ambient-'+unique;
  const rim='cozy-rim-'+unique;
  const sleeping=activity==='sleep';
  const walking=activity==='wander'||activity==='visit';
  const alternate=frame%2===1;
  const leftFoot=walking?(alternate?42:54):48;
  const rightFoot=walking?(alternate?83:69):76;
  const leftLift=walking?(alternate?90:99):96;
  const rightLift=walking?(alternate?99:90):96;
  const leftArm=walking?(alternate?'M34 74 Q17 59 19 69 Q27 80 38 84Z'
    :'M34 76 Q25 85 18 92 Q30 99 38 86Z')
    : sleeping?'M33 80 Q24 81 28 89 Q37 91 40 82Z'
    : alternate?'M34 73 Q22 67 20 79 Q25 87 38 85Z'
    :'M34 76 Q20 78 22 87 Q29 92 40 82Z';
  const rightArm=walking?(alternate?'M88 77 Q104 87 108 97 Q91 98 85 84Z'
    :'M88 75 Q105 62 108 72 Q102 83 84 86Z')
    : sleeping?'M87 80 Q98 81 95 89 Q86 90 82 82Z'
    :alternate?'M87 77 Q104 77 103 90 Q95 92 83 85Z'
    :'M86 77 Q99 69 101 79 Q101 87 84 85Z';
  const poseRotation=sleeping?-5:activity==='work'?(alternate?3:-3):0;
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
      <g className="cozy-spirit-pose" transform={'rotate('+poseRotation+' 60 90)'}>
      <g className="cozy-spirit-appendages">
        <path d={art.back} fill={art.highlight} fillOpacity=".79" stroke={art.shadow}
          strokeWidth="3.1" strokeLinejoin="round" strokeLinecap="round"/>
      </g>
      <g className="cozy-spirit-feet" fill={art.shadow} stroke={art.highlight}
        strokeOpacity=".48" strokeWidth="1.8">
        <ellipse className="cozy-spirit-left-foot" cx={leftFoot} cy={leftLift} rx="14" ry="8"/>
        <ellipse className="cozy-spirit-right-foot" cx={rightFoot} cy={rightLift} rx="14" ry="8"/>
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
        <path className="cozy-spirit-left-arm" d={leftArm}/>
        <path className="cozy-spirit-right-arm" d={rightArm}/>
      </g>
      {activity==='work'&&<g className={'cozy-spirit-tool is-'+(roomType??'nest')}>
        {roomType==='greenhouse'?<g>
          <path d="M92 77 L111 74 L113 88 Q101 96 95 82Z" fill="#8cbdaf" stroke="#446a69" strokeWidth="2.5"/>
          <path d="M111 76 Q121 61 111 60 Q99 61 101 74" fill="none" stroke="#b8dfb7" strokeWidth="3"/>
          <path d="M109 91 L117 96" stroke="#90bac3" strokeWidth="2.4" strokeLinecap="round"/>
          <circle cx="118" cy="103" r="2.5" fill="#b4ecee"/>
        </g>:roomType==='bath'?<g>
          <path d="M92 79 L112 72 L117 88 L99 94Z" fill="#d8f5eb" stroke="#779eab" strokeWidth="2.5"/>
          <path d="M94 80 L110 86" stroke="#91bdc0" strokeWidth="2"/>
        </g>:roomType==='workshop'?<g>
          <path d={alternate?'M95 76 L112 54':'M95 77 L110 62'} stroke="#eacb9b" strokeWidth="5" strokeLinecap="round"/>
          <path d={alternate?'M104 51 L119 60':'M104 58 L119 67'} stroke="#68717a" strokeWidth="9" strokeLinecap="round"/>
          <path d={alternate?'M104 50 L119 59':'M104 57 L119 66'} stroke="#e2c58e" strokeWidth="3" strokeLinecap="round"/>
        </g>:<g>
          <path d="M98 75 L106 58" stroke="#b39476" strokeWidth="3.5" strokeLinecap="round"/>
          <path d="M100 54 L111 46 M102 56 L116 56 M98 59 L113 67"
            stroke="#f1e2b7" strokeWidth="4" strokeLinecap="round"/>
        </g>}
      </g>}
      {activity==='visit'&&<g className="cozy-spirit-visit-gift">
        <path d="M97 84 H111 L108 96 H100Z" fill="#d8b38d" stroke="#805d5c" strokeWidth="2.1"/>
        <path d="M110 86 Q120 82 117 91 L109 94" fill="none" stroke="#efcaa4" strokeWidth="2.1"/>
        <path d="M102 79 Q97 74 102 70" fill="none" stroke="#f8e5c6" strokeWidth="2" opacity=".7"/>
      </g>}
      {activity==='work'&&<path className="cozy-spirit-mouth"
        d={alternate?'M56 83 Q61 85 66 82':'M56 84 Q61 87 66 84'}
        stroke={art.shadow} strokeWidth="2.3" strokeLinecap="round" fill="none"/>}
      {walking&&<path className="cozy-spirit-mouth"
        d="M56 82 Q61 89 67 82" stroke={art.shadow} strokeWidth="2" fill="none"/>}
      </g>
    </g>
  </svg>;
}
