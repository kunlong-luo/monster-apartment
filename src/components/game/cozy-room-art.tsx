import { useId } from 'react';
import type { Furnishing, HomeType } from '@/core/cozy-engine';

type RoomPalette={wall:string;wallBright:string;wallDark:string;floor:string;trim:string;accent:string;glow:string};
const PALETTE:Record<HomeType,RoomPalette>={
  nest:{wall:'#a77880',wallBright:'#d3a8a3',wallDark:'#6f516a',floor:'#81536a',trim:'#e0b6a0',accent:'#e6c0ae',glow:'#ffce92'},
  bath:{wall:'#72989e',wallBright:'#b4cdca',wallDark:'#4a7089',floor:'#53798c',trim:'#d8e4cc',accent:'#a7dcd6',glow:'#c3f7eb'},
  workshop:{wall:'#887257',wallBright:'#c2a47b',wallDark:'#584d55',floor:'#775744',trim:'#dac09a',accent:'#f2c27a',glow:'#ffd488'},
  greenhouse:{wall:'#729180',wallBright:'#b6c5a3',wallDark:'#4f6b66',floor:'#63725b',trim:'#dfd5ae',accent:'#c6d8a2',glow:'#dcf6aa'},
};

/** Original architectural cutaway art. All furniture, light and shadows are
 * drawn as one coherent room scene; deliberately no platform-dependent emoji. */
export function CozyRoomArt({type,decor}:{type:HomeType;decor:Furnishing|null}){
  const token=useId().replace(/:/g,'');
  const theme=PALETTE[type];
  const wall='wall'+token, floor='floor'+token,sky='sky'+token;
  const lamp='lamp'+token,shadow='shadow'+token;
  return <svg data-testid={'cozy-art-'+type} className="cozy-room-art"
    viewBox="0 0 480 250" preserveAspectRatio="xMidYMid slice" focusable="false" aria-hidden="true">
    <defs>
      <linearGradient id={wall} x1="0" y1="0" x2=".2" y2="1">
        <stop offset="0%" stopColor={theme.wallBright}/>
        <stop offset="64%" stopColor={theme.wall}/>
        <stop offset="100%" stopColor={theme.wallDark}/>
      </linearGradient>
      <linearGradient id={floor} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={theme.floor}/><stop offset="100%" stopColor="#33283b"/>
      </linearGradient>
      <linearGradient id={sky} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#2b465f"/><stop offset="100%" stopColor="#829c9c"/>
      </linearGradient>
      <radialGradient id={lamp}><stop offset="0%" stopColor={theme.glow} stopOpacity=".52"/>
        <stop offset="100%" stopColor={theme.glow} stopOpacity="0"/></radialGradient>
      <linearGradient id={shadow} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#1c2334" stopOpacity=".3"/>
        <stop offset="55%" stopColor="#1c2334" stopOpacity="0"/>
        <stop offset="100%" stopColor="#191e30" stopOpacity=".25"/>
      </linearGradient>
      <clipPath id={'window'+token}><rect x="321" y="31" width="103" height="106" rx="42"/></clipPath>
    </defs>
    {/* Painted wall: masonry texture instead of equal-colored box */}
    <rect width="480" height="204" fill={'url(#'+wall+')'}/>
    <path d="M0 20 H480 M0 72 H480 M0 137 H480" stroke="#fff5cf" strokeOpacity=".07" strokeWidth="3"/>
    <path d="M31 0 V197 M151 0 V197 M276 0 V197 M456 0 V197" stroke="#3c2d3f" strokeOpacity=".11" strokeWidth="7"/>
    <path d="M6 4 V194 M473 4 V194" stroke={theme.trim} strokeWidth="8" strokeOpacity=".55"/>
    <rect x="0" y="0" width="480" height="16" fill="#f7d7b0" opacity=".16"/>
    {/* The same warm floor perspective across all room types */}
    <path d="M0 188 H480 V250 H0Z" fill={'url(#'+floor+')'}/>
    <path d="M0 190 H480" stroke={theme.trim} strokeWidth="8"/>
    <path d="M0 204 H480" stroke="#281f31" strokeOpacity=".4" strokeWidth="2"/>
    {Array.from({length:9},(_,i)=><path key={'boards'+i} d={'M'+(i*60)+' 250 L'+(i*60+22)+' 202'}
      stroke="#e7c49d" strokeOpacity=".16" strokeWidth="2"/>)}
    <path d="M0 249 H480" stroke="#181a27" strokeWidth="7"/>
    {/* Arched window: mullions, cityscape and reflected moonlight */}
    <rect x="314" y="23" width="117" height="125" rx="49" fill="#4b3a4e" stroke={theme.trim} strokeWidth="7"/>
    <g clipPath={'url(#window'+token+')'}>
      <rect x="321" y="31" width="103" height="106" fill={'url(#'+sky+')'}/>
      <circle cx="395" cy="52" r="16" fill="#f9dfb0" opacity=".9"/>
      <path d="M321 121 L336 104 L354 114 L370 98 L392 117 L409 100 L424 109 V140 H321Z" fill="#314f63" opacity=".9"/>
      <path d="M321 132 L342 121 L356 126 L385 110 L409 122 L424 113 V143 H321Z" fill="#203d4a"/>
      {[[338,63],[365,48],[408,81],[387,97]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r={i%2?1.6:1.1} fill="#ffe8ca"/>)}
      <path d="M374 31 V139 M321 101 H424" stroke="#e6cbae" strokeWidth="5"/>
      <path d="M326 44 Q350 34 360 36" fill="none" stroke="#ffffff" strokeOpacity=".3" strokeWidth="3"/>
    </g>
    <path d="M304 139 H443 V150 H304Z" fill="#3e3242"/>
    <path d="M300 137 H447 V143 H300Z" fill={theme.trim}/>
    <ellipse cx="355" cy="152" rx="109" ry="50" fill={'url(#'+lamp+')'} opacity=".6"/>
    {/* Room-specific silhouette and recognizable material culture */}
    {type==='nest'&&<g>
      <ellipse cx="154" cy="224" rx="146" ry="15" fill="#3f2b3c" opacity=".38"/>
      <path d="M37 148 Q41 102 100 104 H188 Q238 103 239 151 V206 H34Z" fill="#5f425a" stroke="#e7bcac" strokeWidth="6"/>
      <path d="M45 143 Q64 116 108 119 L206 122 Q230 133 226 156 V191 H42Z" fill="#ead4bd"/>
      <path d="M42 172 Q110 143 225 171 V213 H40Z" fill="#b26d87"/>
      <path d="M43 170 Q107 146 224 168" fill="none" stroke="#e8bdad" strokeWidth="7"/>
      <path d="M49 194 Q118 177 217 192" fill="none" stroke="#f4d4bd" strokeWidth="5" opacity=".6"/>
      <path d="M65 128 Q94 121 110 133 V153 H62Z" fill="#f1e8ce"/>
      <rect x="31" y="203" width="14" height="30" rx="4" fill="#4f3945"/>
      <rect x="220" y="203" width="14" height="30" rx="4" fill="#4f3945"/>
      <rect x="256" y="166" width="48" height="49" rx="5" fill="#705064" stroke="#dbad95" strokeWidth="4"/>
      <rect x="264" y="184" width="34" height="6" fill="#e4bcac" opacity=".65"/>
      <circle cx="281" cy="198" r="3" fill="#f6d59c"/>
      <path d="M20 132 Q48 97 78 109" fill="none" stroke="#ffe1c2" strokeOpacity=".4" strokeWidth="3"/>
    </g>}
    {type==='bath'&&<g>
      <path d="M0 169 H296" stroke="#e5e6d6" strokeWidth="4" strokeOpacity=".65"/>
      {Array.from({length:5},(_,i)=><path key={i} d={'M'+(i*60)+' 128 V188'} stroke="#c6e2d7" strokeOpacity=".33" strokeWidth="2"/>)}
      <ellipse cx="144" cy="207" rx="137" ry="20" fill="#395263" opacity=".3"/>
      <path d="M31 159 Q21 158 29 186 L43 213 Q55 230 94 231 H203 Q245 229 258 207 L273 178 Q277 160 260 158Z"
        fill="#dce9de" stroke="#517b86" strokeWidth="6"/>
      <ellipse cx="150" cy="161" rx="123" ry="21" fill="#d7f4e8" stroke="#6f9fac" strokeWidth="7"/>
      <ellipse cx="151" cy="164" rx="107" ry="12" fill="#7ebdc6" opacity=".73"/>
      <path d="M65 159 Q93 150 110 160 M170 164 Q211 156 233 164" fill="none" stroke="#e8ffef" strokeWidth="4" opacity=".7"/>
      <path d="M100 138 V103 Q100 89 111 89 H151 Q161 89 161 101 V135" fill="none" stroke="#d6dfca" strokeWidth="8" strokeLinecap="round"/>
      <path d="M152 118 Q154 135 140 138" fill="none" stroke="#b4e9ec" strokeWidth="4"/>
      {[92,122,156,197].map((x,i)=><circle key={i} cx={x} cy={118-i%2*24} r={6+i%2*4} fill="#e5ffff" opacity=".38"/>)}
      <rect x="280" y="169" width="25" height="45" rx="4" fill="#3d6272" stroke="#bcd9cd" strokeWidth="3"/>
      <path d="M285 176 H301" stroke="#e1fff0" strokeWidth="4"/>
    </g>}
    {type==='workshop'&&<g>
      <ellipse cx="156" cy="218" rx="160" ry="16" fill="#30273a" opacity=".35"/>
      <rect x="28" y="150" width="236" height="20" rx="3" fill="#553e40" stroke="#dfbd8a" strokeWidth="4"/>
      <path d="M45 170 V231 H61 V170 M230 170 V231 H247 V170" fill="#513a3b" stroke="#c09a70" strokeWidth="3"/>
      <rect x="51" y="94" width="133" height="57" rx="7" fill="#735c52" stroke="#e0bd90" strokeWidth="4"/>
      <path d="M57 111 H176 M57 135 H176" stroke="#b9936f" strokeWidth="5"/>
      <path d="M74 89 H97 L94 66 H79Z" fill="#866c60"/>
      <path d="M68 71 H104" stroke="#f3d1a0" strokeWidth="5"/>
      <path d="M120 122 L134 96 L154 118 L166 101" fill="none" stroke="#f3c38b" strokeWidth="5"/>
      <rect x="172" y="111" width="54" height="40" rx="4" fill="#47465a" stroke="#c99b73" strokeWidth="4"/>
      <circle cx="198" cy="129" r="13" fill="#caad7d" stroke="#efd09b" strokeWidth="4"/>
      <circle cx="198" cy="129" r="4" fill="#74584c"/>
      <path d="M267 169 L289 121 L312 169Z" fill="#604354" stroke="#d8ab8e" strokeWidth="4"/>
      <path d="M289 121 V101" stroke="#e8c99f" strokeWidth="5"/>
      <circle cx="289" cy="98" r="10" fill="#ffe1a0"/>
      <ellipse cx="291" cy="101" rx="63" ry="70" fill={'url(#'+lamp+')'}/>
    </g>}
    {type==='greenhouse'&&<g>
      <path d="M28 26 V188 M82 26 V188 M138 26 V188 M198 26 V188 M258 26 V188" stroke="#dce9c6" strokeOpacity=".31" strokeWidth="5"/>
      <path d="M12 65 Q108 15 227 65 M12 95 Q108 50 227 95" stroke="#446a60" strokeWidth="7" fill="none" strokeOpacity=".78"/>
      <rect x="15" y="182" width="272" height="29" rx="6" fill="#78604e" stroke="#d3bb99" strokeWidth="5"/>
      <rect x="35" y="194" width="32" height="40" fill="#634b42"/>
      <rect x="235" y="194" width="32" height="40" fill="#634b42"/>
      {Array.from({length:6},(_,i)=>{
        const x=43+i*40, high=68+(i%3)*13;
        return <g key={i}>
          <path d={'M'+x+' 183 Q'+(x-10)+' '+(181-high/2)+' '+x+' '+(184-high)}
            fill="none" stroke="#486e59" strokeWidth="5"/>
          <ellipse cx={x-11} cy={182-high*.6} rx="19" ry="9" transform={'rotate(-26 '+(x-11)+' '+(182-high*.6)+')'} fill="#8bb18a"/>
          <ellipse cx={x+10} cy={176-high*.8} rx="20" ry="10" transform={'rotate(25 '+(x+10)+' '+(176-high*.8)+')'} fill="#b4d3a1"/>
          <circle cx={x} cy={184-high} r="6" fill="#edd29b"/>
        </g>;
      })}
      <rect x="20" y="206" width="275" height="10" rx="4" fill="#d4b98d"/>
      <ellipse cx="145" cy="225" rx="145" ry="12" fill="#425444" opacity=".35"/>
    </g>}
    {/* Always-on localized pools of light and rich shadowing */}
    <rect width="480" height="250" fill={'url(#'+shadow+')'} pointerEvents="none"/>
    <ellipse cx="386" cy="185" rx="110" ry="90" fill={'url(#'+lamp+')'} opacity=".6"/>
    {/* Furnishings sit in the same perspective, not as disconnected icons */}
    {decor==='plant'&&<g>
      <ellipse cx="436" cy="228" rx="25" ry="7" fill="#182f2f" opacity=".35"/>
      <path d="M420 189 H453 L449 229 H424Z" fill="#ba7869" stroke="#efd0a0" strokeWidth="4"/>
      <path d="M437 193 Q415 164 421 145 M437 189 Q446 155 449 138 M437 186 Q438 151 434 132" fill="none" stroke="#426a57" strokeWidth="5"/>
      <ellipse cx="416" cy="159" rx="17" ry="9" transform="rotate(-35 416 159)" fill="#b3d19d"/>
      <ellipse cx="450" cy="150" rx="18" ry="9" transform="rotate(37 450 150)" fill="#a9c995"/>
      <ellipse cx="431" cy="138" rx="11" ry="19" fill="#b9d4a6"/>
      <path d="M421 194 H452" stroke="#e9bb9a" strokeWidth="5"/>
    </g>}
    {decor==='lamp'&&<g>
      <ellipse cx="428" cy="228" rx="27" ry="8" fill="#151e2d" opacity=".28"/>
      <ellipse cx="425" cy="163" rx="75" ry="90" fill={'url(#'+lamp+')'}/>
      <path d="M428 158 V222" stroke="#6e5860" strokeWidth="6"/>
      <ellipse cx="429" cy="221" rx="22" ry="5" fill="#584452" stroke="#e8c59c" strokeWidth="3"/>
      <path d="M408 153 Q406 125 429 124 Q453 126 451 153Z" fill="#f7d89d" stroke="#886168" strokeWidth="4"/>
      <ellipse cx="429" cy="155" rx="23" ry="5" fill="#fff0c7"/>
    </g>}
    {decor==='books'&&<g>
      <rect x="396" y="187" width="70" height="8" rx="2" fill="#eac8a6" stroke="#74515f" strokeWidth="3"/>
      <path d="M403 185 L404 154 H414 L414 185Z" fill="#b46b6e" stroke="#f5d3ac" strokeWidth="2"/>
      <path d="M417 185 V147 H430 V185Z" fill="#739b91" stroke="#f1d8b0" strokeWidth="2"/>
      <path d="M434 184 L449 151 L459 155 L446 188Z" fill="#a48bad" stroke="#f1d8b0" strokeWidth="2"/>
      <rect x="400" y="196" width="8" height="31" rx="2" fill="#775562"/>
      <rect x="455" y="196" width="8" height="31" rx="2" fill="#775562"/>
      <path d="M405 164 H414 M419 160 H429 M444 165 L453 169" stroke="#f7ebca" strokeWidth="2"/>
    </g>}
    <path d="M0 1 H480 V249 H0 Z" fill="none" stroke="#f8dab3" strokeOpacity=".24" strokeWidth="4"/>
  </svg>;
}
export function CozyRoomIcon({type}:{type:HomeType}){
  return <svg viewBox="0 0 48 48" width="30" height="30" aria-hidden="true" focusable="false">
    <rect x="2" y="2" width="44" height="44" rx="11" fill={PALETTE[type].wallDark} stroke={PALETTE[type].trim} strokeWidth="2"/>
    {type==='nest'&&<g><path d="M9 24 H39 V34 H9Z" fill="#e1b6b7"/><path d="M11 17 H23 V25 H11Z" fill="#faebd4"/><path d="M9 34 V39 M39 34 V39" stroke="#f4d0a8" strokeWidth="4"/></g>}
    {type==='bath'&&<g><path d="M8 20 H40 L36 34 H12Z" fill="#cff2e4" stroke="#5f8f99" strokeWidth="2"/><path d="M18 19 V12 H29" stroke="#ecffed" strokeWidth="4" fill="none"/></g>}
    {type==='workshop'&&<g><path d="M8 26 H40 V31 H8Z M12 31 V39 M36 31 V39" stroke="#ebc58f" strokeWidth="4" fill="none"/><circle cx="25" cy="17" r="7" fill="#f1c982"/></g>}
    {type==='greenhouse'&&<g><path d="M10 34 H38" stroke="#e7cb9d" strokeWidth="5"/><path d="M23 34 V10" stroke="#bfd5a5" strokeWidth="4"/><ellipse cx="16" cy="21" rx="10" ry="5" fill="#9fc48d" transform="rotate(30 16 21)"/><ellipse cx="31" cy="18" rx="10" ry="5" fill="#bcd8a1" transform="rotate(-30 31 18)"/></g>}
  </svg>;
}
export function CozyDecorIcon({decor}:{decor:Furnishing}){
  return <svg viewBox="0 0 48 48" width="30" height="30" aria-hidden="true">
    <circle cx="24" cy="24" r="22" fill="#4b455a" stroke="#bba38d" strokeWidth="2"/>
    {decor==='plant'&&<g><path d="M15 27 H33 L30 38 H18Z" fill="#d29a85"/><path d="M24 28 V11" stroke="#c3d8ac" strokeWidth="3"/><ellipse cx="18" cy="18" rx="9" ry="5" fill="#b9d5a7" transform="rotate(25 18 18)"/><ellipse cx="30" cy="17" rx="9" ry="5" fill="#87b5a0" transform="rotate(-25 30 17)"/></g>}
    {decor==='lamp'&&<g><path d="M24 23 V36 M16 36 H32" stroke="#efcda1" strokeWidth="3"/><path d="M14 23 L17 12 H31 L34 23Z" fill="#f8dfac"/></g>}
    {decor==='books'&&<g><path d="M11 13 H18 V35 H11Z" fill="#c58c92"/><path d="M21 10 H28 V35 H21Z" fill="#a6ccc3"/><path d="M32 15 L40 17 L35 36 L28 34Z" fill="#c6b2d6"/></g>}
  </svg>;
}
