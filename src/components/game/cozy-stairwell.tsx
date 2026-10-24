import type { ApartmentRoom, CozyVisit } from '@/core/cozy-engine';

const LANDINGS=[120,360,600] as const;
const GLYPHS=['✧','✦','✧'] as const;

/** The building's physical circulation spine. Rooms connect through this
 * shared stairwell; active visits illuminate the route the resident takes.
 * Drawn from engine visits, never from independent decorative randomness. */
export function CozyStairwell({visits,rooms}:{visits:readonly CozyVisit[];rooms:readonly (ApartmentRoom|null)[]}){
  return <div className="cozy-stairwell" data-testid="cozy-stairwell"
    data-active-visits={visits.length} aria-hidden="true">
    <svg viewBox="0 0 110 720" preserveAspectRatio="none" focusable="false">
      <defs>
        <linearGradient id="cozy-stair-wall" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#423541"/>
          <stop offset="22%" stopColor="#6a5051"/>
          <stop offset="68%" stopColor="#705452"/>
          <stop offset="100%" stopColor="#2c2d3c"/>
        </linearGradient>
        <linearGradient id="cozy-stair-tread" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e1bf9b"/>
          <stop offset="100%" stopColor="#81645d"/>
        </linearGradient>
        <radialGradient id="cozy-stair-lamp">
          <stop offset="0%" stopColor="#ffe7ae" stopOpacity=".64"/>
          <stop offset="100%" stopColor="#ffe7ae" stopOpacity="0"/>
        </radialGradient>
        <pattern id="cozy-stair-bricks" width="44" height="26" patternUnits="userSpaceOnUse">
          <path d="M0 0 H44 M22 0 V13 M0 13 H44 M0 13 V26"
            fill="none" stroke="#d2ac89" strokeOpacity=".12" strokeWidth="1.5"/>
        </pattern>
      </defs>
      <rect width="110" height="720" fill="url(#cozy-stair-wall)"/>
      <rect width="110" height="720" fill="url(#cozy-stair-bricks)"/>
      <path d="M6 0 V720 M104 0 V720" stroke="#2e2635" strokeWidth="9"/>
      <path d="M12 0 V720 M98 0 V720" stroke="#bf9981" strokeWidth="3" opacity=".55"/>
      {LANDINGS.map((center,row)=>{
        const y=center-88;
        const lit=Boolean(rooms[row*2]?.resident||rooms[row*2+1]?.resident);
        return <g key={'landing-'+row} className={'cozy-stair-landing'+(lit?' is-lit':'')}>
          <rect x="16" y={y} width="78" height="171" rx="2"
            fill="#343543" fillOpacity=".34"/>
          <path d={`M19 ${center+78} H93`} stroke="#332c3b" strokeWidth="12"/>
          <path d={`M19 ${center+73} H93`} stroke="url(#cozy-stair-tread)" strokeWidth="6"/>
          <path d={`M19 ${center-80} H93`} stroke="#cfab88" strokeWidth="4" opacity=".36"/>
          <rect x="37" y={center-79} width="36" height="62" rx="17"
            fill="#26374a" stroke="#aa8d7e" strokeWidth="5"/>
          <rect x="44" y={center-66} width="22" height="42" rx="10"
            fill="#8091a2" fillOpacity=".24"/>
          <path d={`M55 ${center-78} V${center-18} M39 ${center-46} H71`}
            stroke="#b8a18c" strokeWidth="3" opacity=".8"/>
          <ellipse className="cozy-stair-window-light" cx="54" cy={center-49} rx="52" ry="69"
            fill="url(#cozy-stair-lamp)" opacity={lit?'.68':'.13'}/>
          <path d={`M45 ${center+67} V${center-5} L72 ${center-65}`}
            fill="none" stroke="#342c3b" strokeWidth="8" strokeLinejoin="round"/>
          <path d={`M45 ${center+67} V${center-5} L72 ${center-65}`}
            fill="none" stroke="#bca085" strokeWidth="3" strokeLinejoin="round"/>
          {Array.from({length:7},(_,i)=>{
            const tx=20+i*9,ty=center+56-i*12;
            return <g key={i}>
              <path d={`M${tx} ${ty} l29 -5`} stroke="#473841" strokeWidth="9"/>
              <path d={`M${tx} ${ty-2} l29 -5`}
                stroke="url(#cozy-stair-tread)" strokeWidth="4"/>
            </g>;
          })}
          <rect x="11" y={center+82} width="88" height="8" fill="#291f30"/>
          <rect x="13" y={center+79} width="84" height="3" fill="#ddb38c"/>
          <circle cx="24" cy={center+70} r="5" fill="#d5ab7e"/>
          <circle cx="86" cy={center+70} r="5" fill="#d5ab7e"/>
          <text x="55" y={center+97} fontSize="11" fontFamily="Georgia,serif"
            fill="#f6dcc0" textAnchor="middle" opacity=".78">{3-row} F</text>
          <text x="55" y={center-97} fontSize="17" textAnchor="middle"
            fill="#f4cea0" opacity=".72">{GLYPHS[row]}</text>
        </g>;
      })}
      {visits.map(visit=>{
        const a=LANDINGS[Math.floor(visit.from/2)],b=LANDINGS[Math.floor(visit.to/2)];
        const p=`M${visit.from%2===0?8:102} ${a+2}
          Q55 ${a+20} 55 ${a+2}
          L55 ${b+2}
          Q55 ${b+20} ${visit.to%2===0?8:102} ${b+2}`;
        return <g key={visit.visitor} className="cozy-stair-route"
          data-testid={'cozy-stair-route-'+visit.visitor}>
          <path d={p} fill="none" stroke="#ffe5b1" strokeWidth="20"
            strokeOpacity=".12" strokeLinecap="round"/>
          <path d={p} fill="none" stroke="#ffedc2" strokeWidth="4.5"
            strokeLinecap="round" strokeDasharray="8 9"
            className="cozy-stair-route-line"/>
          <circle cx="55" cy={b+2} r="9" fill="#ffe9bf" opacity=".74"
            className="cozy-stair-arrival"/>
        </g>;
      })}
      <path d="M16 0 V720 M94 0 V720" stroke="#fff1d3"
        strokeWidth="2" opacity=".17"/>
    </svg>
  </div>;
}
