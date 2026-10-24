import type { CozyIncidentKind } from '@/core/cozy-engine';

/** Three illustrated disruptions with different material, motion and shape.
 * The overlay uses the same room projection as the existing cutaway. */
export function CozyIncidentArt({kind}:{kind:CozyIncidentKind}){
  return <span className={'cozy-mishap-art is-'+kind}
    data-testid={'cozy-incident-art-'+kind} aria-hidden="true">
    <svg viewBox="0 0 480 240" preserveAspectRatio="xMidYMid slice" focusable="false">
      <defs>
        <radialGradient id={'mishap-glow-'+kind}>
          <stop offset="0" stopColor={kind==='drips'?'#98ecf6':kind==='shadows'?'#ffd89e':'#b2eea0'}
            stopOpacity=".7"/>
          <stop offset="1" stopColor={kind==='drips'?'#91d2f2':kind==='shadows'?'#e7aa7b':'#72bda7'}
            stopOpacity="0"/>
        </radialGradient>
      </defs>
      <ellipse cx="246" cy="115" rx="162" ry="111"
        fill={'url(#mishap-glow-'+kind+')'}/>
      {kind==='drips'&&<g className="cozy-mishap-rain">
        <path d="M171 55 Q156 26 194 16 Q225 -6 258 22 Q290 1 315 25 Q355 17 357 56 Q383 91 344 107 Q302 120 260 103 Q215 128 177 100 Q153 91 171 55Z"
          fill="#6ba2b5" stroke="#b5ebed" strokeWidth="7" strokeLinejoin="round"/>
        <path d="M187 46 Q222 16 266 43" stroke="#f3ffff" strokeOpacity=".64"
          strokeWidth="8" fill="none" strokeLinecap="round"/>
        <path d="M187 88 Q252 108 340 78" stroke="#466a83" strokeWidth="4" fill="none"/>
        <g className="cozy-mishap-droplets" fill="#c6faff" stroke="#528ba2" strokeWidth="3">
          <path d="M192 128 Q181 152 177 164 Q174 182 193 183 Q209 179 206 165Z"/>
          <path d="M267 132 Q248 162 250 173 Q255 188 271 182 Q286 178 277 160Z"/>
          <path d="M326 116 Q307 143 312 156 Q318 173 333 165 Q349 158 339 141Z"/>
        </g>
        <path d="M111 204 Q242 181 374 203" fill="none"
          stroke="#bef1ff" strokeWidth="6" strokeDasharray="18 12" opacity=".78"/>
      </g>}
      {kind==='shadows'&&<g className="cozy-mishap-blackout">
        <path d="M155 178 Q119 142 144 91 Q161 40 221 46 Q247 -4 306 38 Q367 47 360 113 Q387 166 333 186Z"
          fill="#4e4c76" stroke="#b8a0ba" strokeWidth="7" strokeLinejoin="round"/>
        <path d="M197 72 L220 104 L200 130 L230 159 M302 61 L280 103 L305 125 L289 160"
          fill="none" stroke="#fce2aa" strokeWidth="5" strokeLinecap="round"/>
        <g className="cozy-mishap-spark">
          <path d="M259 49 L272 91 L312 104 L274 121 L261 163 L243 122 L201 108 L242 91Z"
            fill="#ffeac8" stroke="#fff6d5" strokeWidth="5"/>
          <circle cx="258" cy="103" r="23" fill="#ffb85f" opacity=".8"/>
          <path d="M228 100 Q259 124 285 98" stroke="#fff5d0" strokeWidth="4"
            fill="none" strokeLinecap="round"/>
        </g>
        <path d="M155 180 H361" stroke="#e6c7aa" strokeWidth="8" strokeDasharray="7 15"/>
      </g>}
      {kind==='sprouts'&&<g className="cozy-mishap-vines">
        <path d="M95 220 Q110 152 190 173 T260 105 Q312 31 401 52"
          stroke="#335b55" strokeWidth="17" fill="none" strokeLinecap="round"/>
        <path d="M83 216 Q102 147 190 173 T260 105 Q312 31 401 52"
          stroke="#91bd86" strokeWidth="9" fill="none" strokeLinecap="round"/>
        <path d="M385 216 Q330 175 338 110 Q358 56 405 71"
          stroke="#487764" strokeWidth="13" fill="none" strokeLinecap="round"/>
        <path d="M384 215 Q330 175 338 110 Q357 58 405 71"
          stroke="#b1d88b" strokeWidth="6" fill="none" strokeLinecap="round"/>
        <g fill="#91d49a" stroke="#3a7465" strokeWidth="4">
          <path d="M150 170 Q124 113 79 124 Q87 180 150 170Z"/>
          <path d="M212 159 Q182 97 232 75 Q251 137 212 159Z"/>
          <path d="M305 73 Q267 19 296 9 Q347 31 305 73Z"/>
          <path d="M340 132 Q278 137 287 174 Q343 182 340 132Z"/>
          <path d="M392 84 Q434 46 457 62 Q452 100 392 84Z"/>
        </g>
        <g className="cozy-mishap-pollen" fill="#e1e6a5">
          <circle cx="174" cy="96" r="6"/><circle cx="331" cy="35" r="5"/>
          <circle cx="399" cy="122" r="6"/>
        </g>
      </g>}
    </svg>
    <span className="cozy-mishap-stamp">!</span>
  </span>;
}
