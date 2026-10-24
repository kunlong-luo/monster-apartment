import type { HomeType } from '@/core/cozy-engine';

/** Final hand-authored materials for the cutaway furniture.
 * Painted on the same 480×250 stage as the room rather than separate icons.
 * Highlights describe wood grain, stitched fabric, masonry and small daily tools. */
export function CozyRoomPatina({type}:{type:HomeType}){
  return <g className={'cozy-room-patina is-'+type} pointerEvents="none">
    {/* Shared contact shade and hand-painted floorboard imperfections. */}
    <path d="M0 211 Q88 213 150 210 T320 214 T480 211"
      fill="none" stroke="#201c2d" strokeOpacity=".27" strokeWidth="3"/>
    {Array.from({length:7},(_,i)=><path key={i}
      d={`M${20+i*68} 242 q12 -6 25 -3`}
      fill="none" stroke="#e9c5a7" strokeOpacity=".15" strokeWidth="1.6"/>)}
    {type==='nest'&&<g className="cozy-patina-nest">
      <path d="M43 170 Q118 154 225 169 L222 200 Q115 184 44 207Z"
        fill="#bf8a94" opacity=".46"/>
      {Array.from({length:7},(_,i)=><path key={i}
        d={`M${52+i*23} ${175-(i%3)*3} q-7 13 -1 26`}
        fill="none" stroke="#f3cfbb" strokeWidth="1.7" strokeOpacity=".56"/>)}
      <path d="M50 192 Q127 172 216 188" fill="none" stroke="#733f60"
        strokeWidth="2.5" strokeDasharray="7 5" opacity=".7"/>
      <path d="M76 124 Q101 115 109 130 V143 H72Z"
        fill="#fff2d9" opacity=".45"/>
      <path d="M66 144 L103 149 M68 148 L100 152"
        stroke="#b58a84" strokeWidth="2" opacity=".54"/>
      <path d="M270 172 H300 M267 189 H301"
        stroke="#f5d6ac" strokeWidth="2" opacity=".55"/>
      <path d="M280 179 l5 4 5 -4" fill="none" stroke="#e9bf95"
        strokeWidth="1.7" opacity=".67"/>
      <g transform="translate(250 224)">
        <path d="M0 0 Q30 -9 76 -3 L70 13 Q28 18 -2 11Z"
          fill="#8f6577" opacity=".65" stroke="#d8b1a0" strokeWidth="1.5"/>
        <path d="M6 8 Q33 0 68 5" fill="none" stroke="#edc7ae"
          strokeWidth="1.5" opacity=".46"/>
      </g>
      {/* A small folded blanket with readable fabric edges. */}
      <path d="M139 185 Q159 179 179 187 L181 205 Q157 207 140 201Z"
        fill="#d2aaa2" opacity=".62"/>
      <path d="M143 187 L177 191 M142 196 L178 200"
        stroke="#ffddbd" strokeWidth="1.3" opacity=".5"/>
    </g>}
    {type==='bath'&&<g className="cozy-patina-bath">
      {Array.from({length:5},(_,r)=>Array.from({length:4},(_,col)=>
        <path key={r+'-'+col}
          d={`M${11+col*56} ${35+r*27} H${62+col*56}`}
          stroke="#d2f0e0" opacity=".22" strokeWidth="2"/>))}
      <path d="M15 140 H269" stroke="#e8eee2" strokeWidth="5" opacity=".5"/>
      <path d="M15 146 H269" stroke="#305666" strokeWidth="2" opacity=".5"/>
      <path d="M54 185 Q135 194 236 183 M57 196 Q127 207 231 195"
        stroke="#f3fff0" strokeWidth="2.1" opacity=".62" fill="none"/>
      {Array.from({length:9},(_,i)=><circle key={i}
        cx={45+(i*29)%197} cy={163+(i%3)*5}
        r={i%3===0?2.4:1.5} fill="#f9fff5" opacity=".5"/>)}
      <path d="M105 91 L105 69 Q105 58 117 58 H160 M148 58 V77"
        stroke="#c7c7b9" strokeWidth="6" fill="none" strokeLinecap="round"/>
      <circle cx="105" cy="76" r="6" fill="#c8ddcf" stroke="#628b98"
        strokeWidth="2.5"/>
      <path d="M284 173 h15 M284 181 h15" stroke="#e3e9d0"
        strokeWidth="2.6" opacity=".68"/>
      <path d="M290 153 q6 -15 15 0 l-1 16 h-15Z"
        fill="#d0ddd2" opacity=".52"/>
      <path d="M292 159 h13" stroke="#8da9a4" strokeWidth="2"/>
      <g fill="none" stroke="#d2eee4" strokeWidth="1.7" opacity=".5">
        <path d="M27 47 L36 53 L44 44 M203 70 L212 74 L218 65"/>
      </g>
    </g>}
    {type==='workshop'&&<g className="cozy-patina-workshop">
      <path d="M36 155 H251 M36 161 H250" fill="none"
        stroke="#f1d6a9" strokeWidth="2.4" opacity=".62"/>
      {Array.from({length:11},(_,i)=><path key={i}
        d={`M${40+i*18} 154 q-3 5 0 12`}
        stroke="#3b3039" strokeWidth="1.5" opacity=".57" fill="none"/>)}
      <path d="M58 114 H171 M59 140 H167"
        stroke="#f5daa8" strokeWidth="1.6" opacity=".56"/>
      <path d="M68 125 l12 -10 5 7 8 -11 M109 132 L124 113 L134 124"
        stroke="#dbab7b" strokeWidth="3" strokeLinecap="round" fill="none"/>
      {/* Tools belong on a worktop, not in action buttons. */}
      <g stroke="#ead1ac" strokeWidth="4" fill="none"
        strokeLinecap="round" opacity=".79">
        <path d="M74 148 L88 128 M82 127 L94 135"/>
        <path d="M139 147 L152 120 M147 120 L161 123"/>
        <path d="M218 150 V134 M213 134 H223"/>
      </g>
      <g fill="#413747" stroke="#c7a27d" strokeWidth="2">
        <circle cx="175" cy="154" r="5"/>
        <circle cx="182" cy="161" r="4"/>
        <circle cx="191" cy="155" r="3"/>
      </g>
      <path d="M49 193 H241 M46 218 H245" stroke="#d5ae83"
        strokeWidth="2.2" opacity=".34"/>
      <path d="M261 167 L291 109 L319 167" stroke="#ffdfaa"
        fill="none" strokeWidth="2" opacity=".66"/>
      <g transform="translate(296 211)" fill="none" stroke="#b79079"
        strokeWidth="2.3">
        <circle r="11"/><circle r="4"/>
        <path d="M0 -15 V-10 M0 10 V15 M-15 0 H-10 M10 0 H15"/>
      </g>
      <path d="M300 87 q9 5 0 16" fill="none" stroke="#ffe8ac"
        opacity=".7" strokeWidth="2"/>
    </g>}
    {type==='greenhouse'&&<g className="cozy-patina-greenhouse">
      {Array.from({length:6},(_,i)=><g key={i}>
        <path d={`M${36+i*41} 196 q5 -23 0 -43`} stroke="#345e50"
          strokeWidth="2.2" fill="none" opacity=".65"/>
        <ellipse cx={49+i*41} cy={151-(i%3)*9} rx="9" ry="4"
          transform={`rotate(-25 ${49+i*41} ${151-(i%3)*9})`}
          fill="#d6e7b1" opacity=".58"/>
      </g>)}
      <path d="M25 185 Q137 175 283 185"
        fill="none" stroke="#e7cba0" strokeWidth="2.5" opacity=".43"/>
      <path d="M17 207 H279 M19 215 H284" fill="none"
        stroke="#e9d2ac" strokeWidth="2" opacity=".5"/>
      <path d="M22 66 Q121 29 225 66 M25 88 Q126 53 230 87"
        fill="none" stroke="#fcf4d8" strokeWidth="2.1" opacity=".25"/>
      <path d="M261 116 q25 12 19 37 M254 121 q10 13 12 35" fill="none"
        stroke="#3f745d" strokeWidth="4" opacity=".65"/>
      <ellipse cx="274" cy="135" rx="16" ry="7" fill="#aed5a1"
        transform="rotate(37 274 135)" opacity=".75"/>
      <ellipse cx="263" cy="158" rx="13" ry="6" fill="#b6d4a6"
        transform="rotate(-35 263 158)" opacity=".7"/>
      <path d="M303 225 L322 199 L346 224Z" fill="#846b52"
        stroke="#b9a07e" strokeWidth="3"/>
      <path d="M311 216 H339 M307 222 H343" stroke="#eed6aa"
        strokeWidth="2" opacity=".48"/>
      <path d="M313 200 Q327 180 344 203" fill="none"
        stroke="#cfb088" strokeWidth="4"/>
      {[[310,77],[291,94],[265,65],[329,100]].map(([x,y],i)=>
        <circle key={i} className="cozy-patina-pollen" cx={x} cy={y}
          r={i%2===0?2.2:1.2} fill="#fff1b5"
          style={{animationDelay:i*.7+'s'}}/>)}
    </g>}
  </g>;
}
