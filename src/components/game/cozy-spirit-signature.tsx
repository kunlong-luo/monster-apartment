import type { SpiritId } from '@/core/spirit-collection';

/** Each lived-in character gets a species-specific close-up. These are NOT
 * recolors of the same oval: silhouettes, costume, materials and face grammar
 * all differ. Kept inside the existing 120px puppet and animation rig. */
export function CozySpiritSignature({id}:{id:SpiritId}){
  switch(id){
    case 'seedling':return <g className="cozy-signature is-seedling">
      <path d="M61 44 Q43 27 38 14 Q56 16 66 35 Q75 16 95 18 Q86 39 65 44"
        fill="#77b886" stroke="#385e4e" strokeWidth="2.4" strokeLinejoin="round"/>
      <path d="M62 41 Q58 32 46 22 M66 41 Q75 31 84 24"
        fill="none" stroke="#d9f8b3" strokeWidth="2.2" strokeLinecap="round"/>
      <path d="M38 75 Q32 89 46 93 Q59 101 72 95" fill="none"
        stroke="#e7e7b1" strokeOpacity=".55" strokeWidth="5" strokeLinecap="round"/>
      <path d="M55 82 Q61 89 69 82" fill="none" stroke="#365e4c" strokeWidth="2.4"/>
      <circle cx="41" cy="79" r="5" fill="#eb9a93" opacity=".58"/>
      <circle cx="80" cy="78" r="5" fill="#eb9a93" opacity=".58"/>
      <path d="M58 47 Q52 39 48 44 M69 46 Q74 38 80 44"
        stroke="#faf2cb" fill="none" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M59 45 Q65 38 70 45" stroke="#4e8464" fill="none" strokeWidth="2.4"/>
    </g>;
    case 'dewdrop':return <g className="cozy-signature is-dewdrop">
      <path d="M62 20 Q73 45 86 63 Q94 89 74 97"
        stroke="#f5ffff" strokeOpacity=".58" fill="none" strokeWidth="5" strokeLinecap="round"/>
      <path d="M39 87 Q60 98 85 84" fill="none" stroke="#edf9f7"
        strokeWidth="5" strokeOpacity=".65" strokeLinecap="round"/>
      <path d="M40 85 Q61 94 82 83" fill="none" stroke="#3f8fb2"
        strokeWidth="2.1" opacity=".8"/>
      <path d="M40 55 Q50 45 57 33" stroke="#f6fdff"
        strokeWidth="4" strokeOpacity=".57" fill="none" strokeLinecap="round"/>
      <ellipse cx="45" cy="82" rx="5" ry="3" fill="#e7acc5" opacity=".65"/>
      <ellipse cx="82" cy="82" rx="5" ry="3" fill="#e7acc5" opacity=".65"/>
      <path d="M53 85 Q62 94 71 84" stroke="#235f7e" strokeWidth="2.6" fill="none" strokeLinecap="round"/>
      <circle cx="94" cy="47" r="5" fill="#bcf7f3" stroke="#f4ffff" strokeWidth="1.6"/>
      <circle cx="105" cy="59" r="3.5" fill="#bcf7f3" stroke="#f4ffff" strokeWidth="1.2"/>
    </g>;
    case 'lantern-beetle':return <g className="cozy-signature is-lantern-beetle">
      <path d="M43 42 Q51 31 61 39 Q72 28 82 43"
        stroke="#5d4149" strokeWidth="5" fill="none" strokeLinecap="round"/>
      <path d="M41 79 Q42 92 57 98 M84 78 Q84 91 68 99"
        fill="none" stroke="#ffdda0" strokeWidth="5" opacity=".62"/>
      <path d="M61 47 V94" stroke="#7a4852" strokeWidth="3"/>
      <path d="M45 83 Q61 92 80 82 M44 69 Q62 76 79 67" fill="none"
        stroke="#ffe4b1" strokeWidth="2.8" opacity=".65"/>
      <rect x="32" y="51" width="57" height="20" rx="9" fill="#594653"
        stroke="#d7b48a" strokeWidth="2.5"/>
      <rect x="37" y="54" width="20" height="14" rx="6" fill="#e8e2aa"
        fillOpacity=".52" stroke="#f9e7ba" strokeWidth="1.1"/>
      <rect x="65" y="54" width="20" height="14" rx="6" fill="#e8e2aa"
        fillOpacity=".52" stroke="#f9e7ba" strokeWidth="1.1"/>
      <path d="M58 61 H64" stroke="#e4c396" strokeWidth="2.5"/>
      <path d="M27 19 Q23 8 18 8 M95 19 Q101 8 106 12"
        stroke="#f4c47e" strokeWidth="3" strokeLinecap="round" fill="none"/>
      <circle cx="18" cy="8" r="4" fill="#ffdc88"/>
      <circle cx="106" cy="12" r="4" fill="#ffdc88"/>
      <path d="M55 78 Q61 82 68 78" fill="none" stroke="#553d4a" strokeWidth="2.2" strokeLinecap="round"/>
    </g>;
    case 'fern-hare':return <g className="cozy-signature is-fern-hare">
      <path d="M44 40 Q34 22 41 10 Q53 19 53 43 M69 38 Q77 10 87 11 Q90 26 77 43"
        fill="#e7a9a6" stroke="#62836a" strokeWidth="3" strokeLinejoin="round"/>
      <path d="M36 78 Q45 96 64 97 Q82 96 90 78"
        fill="#738f75" stroke="#496f5b" strokeWidth="2.4"/>
      <path d="M36 80 Q60 93 89 80" stroke="#e7e8c0" strokeWidth="2" fill="none"/>
      <path d="M46 86 L76 86 M61 82 V97" fill="none" stroke="#c6ba96" strokeWidth="2.2"/>
      <path d="M54 66 Q62 62 70 67 L63 75 Z" fill="#f3bbc1"
        stroke="#a77778" strokeWidth="1.8"/>
      <path d="M56 78 Q61 84 66 78" fill="none" stroke="#496750" strokeWidth="2.4"/>
      <circle cx="41" cy="75" r="5" fill="#ffb4aa" opacity=".55"/>
      <circle cx="84" cy="75" r="5" fill="#ffb4aa" opacity=".55"/>
      <path d="M31 90 Q23 98 14 90 Q10 83 20 80"
        fill="#f6f8e3" stroke="#759675" strokeWidth="2.6"/>
    </g>;
    case 'moon-scout':return <g className="cozy-signature is-moon-scout">
      <path d="M39 80 Q60 101 83 84 L85 95 Q60 112 39 91Z"
        fill="#46567a" stroke="#b5a9d9" strokeWidth="3"/>
      <path d="M45 83 Q55 92 66 94" stroke="#f6dbab" fill="none" strokeWidth="2.4"/>
      <path d="M69 48 Q85 45 87 69 Q80 83 69 79"
        fill="#d0bce2" fillOpacity=".62" stroke="#8465a3" strokeWidth="2"/>
      <path d="M43 57 Q52 45 59 51 M76 56 Q82 48 89 54"
        fill="none" stroke="#f7e4c9" strokeWidth="3" strokeLinecap="round"/>
      <path d="M59 72 L68 67 L65 76Z" fill="#e7b792" stroke="#6d547b" strokeWidth="1.8"/>
      <path d="M56 83 Q65 88 72 81" stroke="#6b5489" strokeWidth="2" fill="none"/>
      <path d="M56 38 Q64 30 69 25" stroke="#f0dfbd" strokeWidth="2.2" strokeLinecap="round"/>
      <path d="M90 37 L93 44 L100 45 L94 49 L95 56 L90 51 L84 55 L86 48 L81 44 L88 43 Z"
        fill="#ffe1a0" opacity=".83"/>
    </g>;
    case 'pebble-crab':return <g className="cozy-signature is-pebble-crab">
      <path d="M13 40 Q2 36 7 22 Q22 19 29 41 M107 39 Q118 27 109 21 Q96 22 91 41"
        fill="#ccebb9" stroke="#517e7d" strokeWidth="3.5"/>
      <path d="M42 83 Q62 91 82 82" fill="none" stroke="#d8e5ce" strokeWidth="3"/>
      <path d="M47 70 L60 63 L74 70 L69 79 L54 79Z" fill="#8fb8ab" stroke="#dcefd1" strokeWidth="2"/>
    </g>;
    case 'whisper-cat':return <g className="cozy-signature is-whisper-cat">
      <path d="M41 36 L44 22 L55 39 M79 39 L89 23 L92 48" fill="#d8b4d5" stroke="#695c91" strokeWidth="3"/>
      <path d="M54 75 L62 80 L70 75" stroke="#4b4c81" strokeWidth="3" fill="none"/>
      <path d="M53 82 Q61 88 69 82" fill="none" stroke="#665980" strokeWidth="2"/>
      <path d="M39 78 L20 72 M39 83 L21 85 M83 78 L104 72 M83 83 L103 86" stroke="#ece2f2" strokeWidth="2.3"/>
    </g>;
    case 'moss-keeper':return <g className="cozy-signature is-moss-keeper">
      <path d="M41 46 Q23 16 29 9 Q48 15 54 44 M75 46 Q86 15 101 16 Q105 39 84 55"
        fill="#7da781" stroke="#3e715a" strokeWidth="3"/>
      <path d="M55 38 L63 17 L72 39" fill="#d9ebb0" stroke="#4d795f" strokeWidth="2.5"/>
      <circle cx="60" cy="80" r="12" fill="#eef5ca" opacity=".23"/>
      <path d="M44 82 Q60 97 81 82" fill="none" stroke="#e3eab8" strokeWidth="3"/>
    </g>;
    case 'prism-mole':return <g className="cozy-signature is-prism-mole">
      <path d="M36 51 L41 24 L53 46 L65 15 L76 44 L86 27 L90 51"
        fill="#cfd2e8" fillOpacity=".7" stroke="#776783" strokeWidth="2.5"/>
      <path d="M46 71 L60 61 L76 72 L60 86Z" fill="#e8bda8" stroke="#8b6775" strokeWidth="2.6"/>
      <path d="M37 89 Q60 105 86 89" fill="none" stroke="#ece1ca" strokeWidth="3"/>
    </g>;
    default:return null;
  }
}
