/** A single continuous illustrated street behind the playable cutaway.
 * All architecture is deterministic SVG geometry, independent of gameplay state. */
const DISTANT_HOUSES = [
  {x:15,w:83,roof:365,h:190},{x:107,w:69,roof:330,h:225},
  {x:185,w:100,roof:373,h:182},{x:291,w:72,roof:314,h:241},
  {x:373,w:85,roof:352,h:203},{x:461,w:71,roof:290,h:265},
  {x:545,w:83,roof:360,h:195},{x:641,w:91,roof:332,h:223},
  {x:745,w:76,roof:372,h:183},{x:831,w:79,roof:302,h:253},
  {x:925,w:87,roof:348,h:207},{x:1028,w:62,roof:314,h:241},
  {x:1103,w:94,roof:360,h:195},
] as const;

function Lantern({x,y}:{x:number;y:number}){
  return <g>
    <path d={`M${x} ${y} V650`} stroke="#202d3b" strokeWidth="11"/>
    <path d={`M${x-6} ${y+1} Q${x-3} ${y-25} ${x+16} ${y-27}`} fill="none" stroke="#34404b" strokeWidth="6"/>
    <ellipse cx={x+17} cy={y-16} rx="43" ry="63" fill="#f0c38b" opacity=".1" className="cozy-street-lamplight"/>
    <path d={`M${x+4} ${y-31} H${x+30} L${x+37} ${y-5} H${x-3}Z`} fill="#3d3941" stroke="#918171" strokeWidth="3"/>
    <path d={`M${x+9} ${y-26} H${x+27} L${x+31} ${y-10} H${x+5}Z`} fill="#e6bd83" className="cozy-street-lamplight"/>
    <path d={`M${x-5} ${y-5} H${x+38}`} stroke="#a39179" strokeWidth="4"/>
  </g>;
}

export function CozyStreetBackdrop(){
  return <svg className="cozy-street-backdrop" viewBox="0 0 1200 680"
    preserveAspectRatio="xMidYMid slice" focusable="false" aria-hidden="true">
    <defs>
      <linearGradient id="street-evening-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#202c48"/>
        <stop offset="52%" stopColor="#46566e"/>
        <stop offset="82%" stopColor="#907c7c"/>
        <stop offset="100%" stopColor="#394454"/>
      </linearGradient>
      <radialGradient id="street-horizon-light" cx="50%" cy="70%" r="60%">
        <stop offset="0%" stopColor="#e5ab8e" stopOpacity=".4"/>
        <stop offset="100%" stopColor="#e5ab8e" stopOpacity="0"/>
      </radialGradient>
      <radialGradient id="street-moon-halo">
        <stop offset="0%" stopColor="#fae5c1" stopOpacity=".35"/>
        <stop offset="48%" stopColor="#f9d7b1" stopOpacity=".1"/>
        <stop offset="100%" stopColor="#f9d7b1" stopOpacity="0"/>
      </radialGradient>
      <linearGradient id="street-house-face" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#405168"/>
        <stop offset="100%" stopColor="#253647"/>
      </linearGradient>
      <linearGradient id="street-near-house" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#435463"/>
        <stop offset="100%" stopColor="#172a37"/>
      </linearGradient>
      <linearGradient id="street-road" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#354450"/>
        <stop offset="100%" stopColor="#172532"/>
      </linearGradient>
      <pattern id="street-bricks" patternUnits="userSpaceOnUse" width="38" height="22">
        <path d="M0 0 H38 M19 0 V11 M0 11 H38 M0 11 V22" stroke="#d0baa2" strokeOpacity=".1" fill="none" strokeWidth="1.5"/>
      </pattern>
      <filter id="street-haze" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="16"/>
      </filter>
    </defs>
    <rect width="1200" height="680" fill="url(#street-evening-sky)"/>
    <path d="M0 250 Q280 185 540 240 T1200 205 V510 H0Z" fill="url(#street-horizon-light)"/>
    <ellipse cx="1015" cy="113" rx="134" ry="132" fill="url(#street-moon-halo)"/>
    <circle cx="1015" cy="113" r="35" fill="#f6e5c6"/>
    <path d="M1003 91 Q998 112 1006 124 M1028 111 Q1018 128 1031 136" stroke="#dccaa9" strokeWidth="3" strokeLinecap="round" opacity=".55" fill="none"/>
    {[[60,75],[140,123],[223,52],[303,155],[376,96],[486,76],[578,145],[694,61],[781,123],[851,75],[936,194],[1105,54],[1150,155]].map(([x,y],i)=>
      <circle key={'star'+i} className="cozy-street-star" cx={x} cy={y} r={i%4===0?2.1:1.25}
        fill="#fff1d8" opacity={i%3===0?.85:.48} style={{animationDelay:i*.37+'s'}}/>)}
    <g className="cozy-street-cloud" fill="#c9c4c1" opacity=".08">
      <path d="M-120 171 Q-75 146 -19 163 Q23 135 85 158 Q146 150 194 176Z"/>
      <path d="M512 222 Q567 190 643 202 Q714 169 790 206 H875 Q803 229 695 219Z"/>
    </g>
    <path d="M0 437 Q109 375 242 422 Q333 382 441 408 Q570 364 673 408 Q779 380 925 411 Q1084 352 1200 394 V580 H0Z"
      fill="#596276" opacity=".3"/>
    <g opacity=".6">
      {DISTANT_HOUSES.map((house,i)=><g key={'far-house-'+house.x}>
        <rect x={house.x} y={house.roof} width={house.w} height={house.h}
          fill={i%3===0?'#344558':'#394959'}/>
        <path d={`M${house.x-7} ${house.roof+2} L${house.x+house.w/2} ${house.roof-(i%3+1)*13} L${house.x+house.w+7} ${house.roof+2}Z`}
          fill={i%2===0?'#283a4c':'#344459'}/>
        {Array.from({length:3},(_,row)=>Array.from({length:2},(_,col)=>{
          const wx=house.x+17+col*(house.w-30),wy=house.roof+27+row*38;
          return <g key={row+'-'+col}>
            <rect x={wx} y={wy} width="9" height="17" rx="3" fill="#161f32" opacity=".85"/>
            {(row+col+i)%4===0&&<rect className="cozy-street-window" x={wx+2} y={wy+2}
              width="5" height="13" fill="#e9bb83" opacity=".8"/>}
          </g>;
        }))}
      </g>)}
    </g>
    <path d="M0 487 Q160 453 315 476 Q535 436 755 480 Q1000 443 1200 482 V680 H0Z" fill="#344553" opacity=".8"/>
    <g opacity=".92">
      <path d="M-18 328 L64 282 L172 334 V662 H-18Z" fill="url(#street-near-house)"/>
      <path d="M-30 331 L64 269 L183 333" stroke="#1c2b3c" strokeWidth="16" fill="none"/>
      <rect x="2" y="342" width="161" height="310" fill="url(#street-bricks)" opacity=".8"/>
      {[[26,373],[97,376],[26,475],[97,479]].map(([x,y],i)=><g key={'left-window-'+i}>
        <rect x={x} y={y} width="38" height="62" rx="17" fill="#192a38" stroke="#6a6770" strokeWidth="6"/>
        <path d={`M${x+19} ${y+5} V${y+57} M${x+4} ${y+32} H${x+34}`} stroke="#778388" strokeWidth="3"/>
        {i!==1&&<path d={`M${x+5} ${y+31} V${y+54} H${x+33} V${y+31}Z`}
          fill="#c49b76" opacity=".26"/>}
      </g>)}
      <path d="M1039 346 L1111 281 L1199 340 V677 H1039Z" fill="url(#street-near-house)"/>
      <path d="M1028 344 L1110 269 L1209 341" stroke="#172b3a" strokeWidth="16" fill="none"/>
      <rect x="1045" y="348" width="155" height="330" fill="url(#street-bricks)"/>
      <rect x="1088" y="377" width="48" height="74" rx="23" fill="#1d3041" stroke="#697780" strokeWidth="7"/>
      <path d="M1112 380 V445 M1092 417 H1133" stroke="#617580" strokeWidth="4"/>
      <rect x="1088" y="499" width="48" height="74" rx="23" fill="#d0a77a" opacity=".2" stroke="#9c8990" strokeWidth="7"/>
      <path d="M1112 501 V572 M1092 535 H1133" stroke="#77818d" strokeWidth="4"/>
    </g>
    <path d="M0 579 Q500 558 1200 581 V680 H0Z" fill="url(#street-road)"/>
    <path d="M0 604 Q600 590 1200 605" stroke="#c4ab90" strokeWidth="5" strokeOpacity=".17" fill="none"/>
    <path d="M0 612 Q600 598 1200 615" stroke="#1a2e3d" strokeWidth="10" strokeOpacity=".65" fill="none"/>
    <ellipse cx="585" cy="621" rx="320" ry="33" fill="#101e2c" opacity=".5" filter="url(#street-haze)"/>
    <Lantern x={205} y={468}/>
    <Lantern x={982} y={452}/>
    <path d="M-20 615 Q76 572 178 628 T396 626 M794 633 Q953 588 1210 620"
      stroke="#78937e" strokeWidth="18" strokeLinecap="round" opacity=".23" fill="none"/>
    {[ [160,566],[188,551],[952,545],[1009,563],[120,612],[1060,612] ].map(([x,y],i)=>
      <g key={'shrub-'+i} opacity=".7">
        <path d={`M${x} ${y+26} Q${x-34} ${y-26} ${x-14} ${y-39} Q${x+7} ${y-38} ${x} ${y+26}Z`}
          fill="#243e3e"/>
        <path d={`M${x} ${y+26} Q${x+24} ${y-45} ${x+39} ${y-20} Q${x+47} ${y+5} ${x} ${y+26}Z`}
          fill="#2b4c49"/>
      </g>)}
    {[[270,385],[852,338],[244,459],[901,497]].map(([x,y],i)=>
      <circle key={'mote-'+i} className="cozy-street-firefly" cx={x} cy={y} r={i%2?2:2.8}
        fill="#f9d59e" style={{animationDelay:(i*.9)+'s'}}/>)}
  </svg>;
}
