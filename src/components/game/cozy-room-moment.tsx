import type { CSSProperties } from 'react';

export type CozyMomentKind = 'build'|'welcome'|'furnish';
export type CozyMoment = {kind:CozyMomentKind;sequence:number};

/** A room action that visibly happens IN the world. This is presentational:
 * callers only create a moment AFTER a successful engine state transition. */
export function CozyRoomMoment({kind}:{kind:CozyMomentKind}){
  const flecks=Array.from({length:9},(_,i)=>({
    x:52+(i*73)%385,
    y:55+(i*47)%146,
    delay:(i*.11)+'s',
  }));
  return <span className={'cozy-room-moment is-'+kind}
    data-testid={'cozy-moment-'+kind} aria-hidden="true">
    <svg viewBox="0 0 480 250" preserveAspectRatio="xMidYMid slice" focusable="false">
      {kind==='build'&&<g className="cozy-moment-construction">
        <rect x="0" y="0" width="240" height="250" className="cozy-moment-shutter-left"
          fill="#4c4050" fillOpacity=".94"/>
        <rect x="240" y="0" width="240" height="250" className="cozy-moment-shutter-right"
          fill="#4c4050" fillOpacity=".94"/>
        <g stroke="#d8b18b" strokeWidth="9" opacity=".73">
          <path d="M32 5 V235 M225 5 V235 M255 5 V235 M449 5 V235"/>
          <path d="M0 62 H480 M0 180 H480"/>
        </g>
        <path d="M15 224 H466" stroke="#fae4be" strokeWidth="5" opacity=".46"/>
      </g>}
      {kind==='welcome'&&<g className="cozy-moment-welcome">
        <ellipse cx="248" cy="210" rx="95" ry="23" fill="#f4daa6" fillOpacity=".18"
          stroke="#feeac3" strokeWidth="4"/>
        <ellipse cx="248" cy="207" rx="55" ry="12" fill="none"
          stroke="#fff3cc" strokeWidth="3.4"/>
        <path d="M248 101 V184 M214 128 L245 98 L279 129"
          stroke="#ffe2ab" strokeWidth="4" fill="none" strokeLinecap="round"/>
        <circle cx="248" cy="143" r="56" fill="none" stroke="#f6ddb8"
          strokeWidth="2.8" strokeDasharray="9 15"/>
      </g>}
      {kind==='furnish'&&<g className="cozy-moment-furnish">
        <path d="M328 60 L349 108 L397 129 L349 147 L328 196 L308 147 L259 129 L308 108Z"
          fill="#f7d39e" fillOpacity=".22" stroke="#fff0c9" strokeWidth="2.5"/>
        <circle cx="330" cy="128" r="67" fill="none" stroke="#fde5bb"
          strokeDasharray="5 14" strokeWidth="3"/>
      </g>}
      {flecks.map((f,i)=><circle key={i}
        className="cozy-moment-fleck" cx={f.x} cy={f.y} r={i%3===0?3.7:2.1}
        fill={i%2?'#fff1ce':'#dfb593'}
        style={{'--fleck-delay':f.delay} as CSSProperties}/>)}
    </svg>
  </span>;
}
