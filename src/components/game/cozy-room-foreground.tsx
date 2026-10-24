import type { HomeType, ResidentActivity } from '@/core/cozy-engine';

/** Foreground occlusion layer is drawn AFTER the resident. The tub, bed cover,
 * workbench and planted bed share coordinates with CozyRoomArt (480 × 250).
 * This is what makes the actors physically occupy the room instead of sitting
 * like stickers on top of the background. */
export function CozyRoomForeground({type,activity}:{
  type:HomeType;activity:ResidentActivity|null;
}){
  return <svg className={'cozy-room-foreground is-'+type}
    data-testid={'cozy-foreground-'+type} viewBox="0 0 480 250"
    preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id={'cozy-foreground-'+type} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fff5d6" stopOpacity=".25"/>
        <stop offset=".35" stopColor="#fff0da" stopOpacity=".08"/>
        <stop offset="1" stopColor="#151b2c" stopOpacity=".28"/>
      </linearGradient>
    </defs>
    {type==='nest'&&<g>
      <path d="M26 199 Q124 166 242 196 L236 220 Q133 204 31 230 Z"
        fill="#ad6e84" stroke="#dbb1a4" strokeWidth="4"/>
      <path d="M33 203 Q122 176 233 198" fill="none" stroke="#f1d3b5"
        strokeWidth="4" opacity=".62"/>
      <path d="M40 223 Q136 213 224 223" fill="none" stroke="#684658"
        strokeWidth="3" opacity=".65"/>
      {activity==='sleep'&&<g className="cozy-room-dreams" fill="#ffefcf"
        stroke="#f5d9b5" strokeWidth="1.4">
        <path d="M162 139 L173 139 L163 153 L174 153" fill="none"
          strokeWidth="2.4"/>
        <circle cx="146" cy="149" r="2.5" opacity=".45"/>
        <circle cx="182" cy="128" r="2" opacity=".6"/>
      </g>}
    </g>}
    {type==='bath'&&<g>
      <path d="M31 173 Q138 190 269 174 L257 216 Q250 236 211 239 H94 Q49 238 44 219Z"
        fill="#d2e4de" stroke="#779ba1" strokeWidth="5"/>
      <path d="M35 181 Q153 196 265 181" stroke="#f4fff0"
        strokeWidth="5" opacity=".86" fill="none"/>
      <path d="M53 209 Q143 219 245 207" stroke="#91b8b5" strokeWidth="3"
        opacity=".45" fill="none"/>
      {activity==='work'&&<g className="cozy-room-bubbles" fill="#d8f6ef">
        <circle cx="78" cy="153" r="6" opacity=".46"/>
        <circle cx="107" cy="143" r="4" opacity=".5"/>
        <circle cx="203" cy="159" r="7" opacity=".45"/>
      </g>}
    </g>}
    {type==='workshop'&&<g>
      <path d="M25 158 H269 V175 H25Z" fill="#65504b"
        stroke="#d4ac7c" strokeWidth="4"/>
      <path d="M40 174 H58 V234 H43Z M238 175 H254 V235 H240Z"
        fill="#4c383e" stroke="#9c7969" strokeWidth="2"/>
      <path d="M30 167 H265" stroke="#efd0a0" strokeWidth="2.5"
        opacity=".67"/>
      <path d="M67 178 H232" stroke="#2a2734" strokeWidth="4"
        opacity=".4"/>
      {activity==='work'&&<g className="cozy-room-sparks"
        fill="#ffe5a7">
        <path d="M186 121 L193 108 L198 122 L210 128 L194 133 L187 145 L182 130 L168 125Z"/>
        <circle cx="218" cy="115" r="3"/>
        <circle cx="172" cy="102" r="2.3"/>
      </g>}
    </g>}
    {type==='greenhouse'&&<g>
      <rect x="32" y="210" width="269" height="18" rx="3"
        fill="#876d55" stroke="#c3ab85" strokeWidth="3"/>
      <path d="M32 216 H302 M45 228 H291" stroke="#e6cda5"
        strokeWidth="2" opacity=".48"/>
      <path d="M103 211 Q97 184 82 164 M109 211 Q119 180 132 164 M185 211 Q181 182 166 155 M191 213 Q203 177 220 151"
        fill="none" stroke="#426f58" strokeWidth="6"/>
      <ellipse cx="80" cy="175" rx="23" ry="10" fill="#a2c99c"
        transform="rotate(32 80 175)"/>
      <ellipse cx="130" cy="174" rx="23" ry="10" fill="#b6d29f"
        transform="rotate(-34 130 174)"/>
      <ellipse cx="166" cy="170" rx="19" ry="10" fill="#88b691"
        transform="rotate(30 166 170)"/>
      <ellipse cx="221" cy="166" rx="23" ry="10" fill="#b4d098"
        transform="rotate(-30 221 166)"/>
      {activity==='work'&&<g className="cozy-room-pollen"
        fill="#f8df9c">
        <circle cx="167" cy="130" r="2.9"/>
        <circle cx="194" cy="124" r="2.4"/>
        <circle cx="227" cy="139" r="3.1"/>
      </g>}
    </g>}
    <path d="M0 249 H480" stroke="#1b2331" strokeWidth="5"
      opacity=".73"/>
    <rect x="0" y="238" width="480" height="12"
      fill={'url(#cozy-foreground-'+type+')'}/>
  </svg>;
}
