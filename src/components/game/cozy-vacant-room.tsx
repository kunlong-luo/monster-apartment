import { useId } from 'react';

/** A vacant wing is architecture awaiting restoration, not a button-shaped
 * placeholder. Six slots have different histories without altering room rules. */
export function CozyVacantRoom({slot}:{slot:number}){
  const token=useId().replace(/:/g,'');
  const wall='vac-wall-'+token, floor='vac-floor-'+token;
  const glass='vac-glass-'+token, dust='vac-dust-'+token;
  const isAttic=slot<2;
  return <svg className="cozy-vacant-room" data-testid={'cozy-vacant-art-'+slot}
    viewBox="0 0 480 250" preserveAspectRatio="xMidYMid slice"
    focusable="false" aria-hidden="true">
    <defs>
      <linearGradient id={wall} x1="0" y1="0" x2=".23" y2="1">
        <stop offset="0%" stopColor={isAttic?'#57606b':'#676570'}/>
        <stop offset="53%" stopColor="#484b5b"/>
        <stop offset="100%" stopColor="#2b3444"/>
      </linearGradient>
      <linearGradient id={floor} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#796a68"/>
        <stop offset="100%" stopColor="#272b37"/>
      </linearGradient>
      <linearGradient id={glass} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#718a97"/>
        <stop offset="100%" stopColor="#354654"/>
      </linearGradient>
      <pattern id={dust} patternUnits="userSpaceOnUse" width="53" height="37">
        <circle cx="9" cy="11" r="1" fill="#ecd2ba" opacity=".23"/>
        <path d="M3 32 L18 30 M35 12 L46 9" fill="none" stroke="#e2bea0"
          strokeWidth="1" strokeOpacity=".14"/>
      </pattern>
    </defs>
    {/* Ceiling, plaster and two receding side walls */}
    <path d="M0 0 H480 V190 H0Z" fill={'url(#'+wall+')'}/>
    <path d="M0 0 H480 V190 H0Z" fill={'url(#'+dust+')'}/>
    <path d="M0 0 H480 L455 23 H27Z" fill="#aa9d96" opacity=".28"/>
    <path d="M0 0 L27 23 V187 L0 210Z" fill="#171f30" opacity=".48"/>
    <path d="M480 0 L455 23 V188 L480 209Z" fill="#141c2b" opacity=".48"/>
    <path d="M27 25 H455 M27 25 V184 M455 25 V184"
      stroke="#baa192" strokeWidth="3" strokeOpacity=".43" fill="none"/>
    {Array.from({length:5},(_,i)=><path key={'cracks'+i}
      d={`M${28+i*101} 22 L${33+i*101} ${59+(i%2)*23} l${(i%3-1)*17} 14`}
      stroke="#252d3c" strokeWidth={i%2?1.7:2.5} opacity=".38" fill="none"/>)}
    <path d="M0 190 H480 V250 H0Z" fill={'url(#'+floor+')'}/>
    <path d="M0 190 H480" stroke="#bd9d83" strokeWidth="6" opacity=".64"/>
    <path d="M0 202 L44 247 M480 201 L441 249" stroke="#211e2a"
      strokeWidth="4" opacity=".37"/>
    {Array.from({length:9},(_,i)=><g key={'board'+i}>
      <path d={`M${i*61-5} 250 L${i*52+19} 202`}
        stroke="#c6a99b" strokeOpacity=".18" strokeWidth="3"/>
      <path d={`M0 ${202+i*6} H480`} stroke="#292936"
        strokeOpacity=".12" strokeWidth="1.2"/>
    </g>)}
    {/* One retained arched window, a structural feature, never a fake CTA. */}
    <rect x="308" y="27" width="126" height="135" rx="55"
      fill="#242e3c" stroke="#947f7b" strokeWidth="9"/>
    <rect x="323" y="38" width="96" height="110" rx="43" fill={'url(#'+glass+')'}/>
    <circle cx="397" cy="57" r="12" fill="#e6d8b7" opacity=".68"/>
    <path d="M324 125 L350 95 L363 116 L391 96 L419 112 V147 H323Z"
      fill="#35475a" opacity=".95"/>
    <path d="M373 39 V149 M324 100 H419" fill="none"
      stroke="#c4b0a0" strokeWidth="6" opacity=".72"/>
    <path d="M321 47 Q331 40 343 45" fill="none" stroke="#f0e6cb"
      strokeOpacity=".4" strokeWidth="3"/>
    <path d="M302 150 H444" stroke="#443e4d" strokeWidth="12"/>
    <path d="M299 145 H447" stroke="#aa9384" strokeWidth="5"/>
    <path d="M325 149 L424 149 L480 244 L213 241Z"
      fill="#b0c9c5" opacity=".045"/>
    {/* A few worn window boards vary by vacant unit. */}
    {slot%3===0&&<g className="cozy-vacant-boards">
      <path d="M315 107 L431 68" stroke="#584b4b" strokeWidth="18"/>
      <path d="M315 107 L431 68" stroke="#b29b83" strokeWidth="11"/>
      <circle cx="326" cy="102" r="2.4" fill="#302d37"/>
      <circle cx="419" cy="72" r="2.4" fill="#302d37"/>
    </g>}
    {slot%3===1&&<g>
      <path d="M322 55 L423 94" stroke="#4b4044" strokeWidth="17"/>
      <path d="M322 55 L423 94" stroke="#aa927d" strokeWidth="11"/>
      <path d="M331 133 L418 111" stroke="#a18d7b" strokeWidth="13"/>
    </g>}
    {slot%3===2&&<g>
      <path d="M332 145 L411 80" stroke="#ab967d" strokeWidth="13"/>
      <path d="M329 62 L414 126" stroke="#9f8b79" strokeWidth="13"/>
      <path d="M333 64 L414 126" stroke="#52464b" strokeWidth="2" opacity=".55"/>
    </g>}
    {/* Reclaimed belongings give each unused unit a different silhouette. */}
    {slot===0||slot===3?<g className="cozy-vacant-relic">
      <path d="M64 178 L97 132 L199 151 L212 210 L54 221Z"
        fill="#4c4650" stroke="#8a7973" strokeWidth="4"/>
      <path d="M80 165 L187 174 L199 215 L61 218Z" fill="#83756b"/>
      <path d="M81 167 Q133 181 190 174" stroke="#e2c3a3" opacity=".46"
        strokeWidth="4" fill="none"/>
      <path d="M91 131 L165 139 L185 168 L79 162Z"
        fill="#7d7472" stroke="#c4ab97" strokeWidth="3"/>
      <path d="M145 137 L156 214 M64 199 L203 196" stroke="#423d49"
        strokeWidth="5" opacity=".4"/>
    </g>:slot===1||slot===4?<g className="cozy-vacant-relic">
      <rect x="51" y="158" width="95" height="65" rx="2"
        fill="#645452" stroke="#bc9a7d" strokeWidth="6"/>
      <path d="M53 179 H143 M100 159 V221" stroke="#c4aa8f"
        strokeWidth="5" opacity=".7"/>
      <path d="M83 145 L188 142 L194 203 L106 211Z" fill="#888280"
        stroke="#a59a89" strokeWidth="3"/>
      <path d="M83 147 Q119 163 149 149 T190 147" stroke="#e0d6be"
        fill="none" strokeWidth="3" opacity=".4"/>
      <ellipse cx="145" cy="219" rx="101" ry="9" fill="#1f2935" opacity=".34"/>
    </g>:<g className="cozy-vacant-relic">
      <path d="M65 220 V107 H174 V219" fill="none" stroke="#85736b"
        strokeWidth="13"/>
      <path d="M62 114 H183 M62 163 H181 M66 210 H181"
        stroke="#bd9d80" strokeWidth="10"/>
      <path d="M80 112 L95 159 M148 112 L163 160 M102 166 L116 207"
        stroke="#dac6a7" strokeWidth="4" opacity=".35"/>
      <path d="M190 208 L218 182 L249 209 L248 223 H189Z"
        fill="#70615a" stroke="#bc9d87" strokeWidth="4"/>
    </g>}
    {/* Loose plaster, old timber, wall scratches and dust line */}
    <path d="M41 63 L60 45 L72 58 L69 91 L46 104Z"
      fill="#a39990" opacity=".2"/>
    <path d="M213 27 L251 22 L263 53 L248 72 L218 65Z"
      fill="#d9c4ad" opacity=".12"/>
    <path d="M31 178 L57 181 L63 191 M214 40 L226 54 L220 73"
      stroke="#e3c5aa" strokeOpacity=".25" fill="none" strokeWidth="3"/>
    <path d="M2 232 Q103 225 192 232 T480 231" stroke="#c9afa1"
      strokeWidth="5" strokeOpacity=".21" fill="none"/>
    <ellipse cx="231" cy="235" rx="180" ry="10" fill="#242634" opacity=".35"/>
    <rect width="480" height="250" fill={'url(#'+dust+')'} opacity=".75"/>
    <path d="M0 0 H480 V250 H0Z" stroke="#cfb69c" strokeWidth="5"
      opacity=".24" fill="none"/>
  </svg>;
}
