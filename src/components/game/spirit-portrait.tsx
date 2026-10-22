import { SPIRIT_ART } from '@/core/spirit-art';
import { SPIRIT_BY_ID } from '@/core/spirit-collection';
import type { SpiritId } from '@/core/spirit-collection';

/** Lightweight original vector art, shared by roster, codex and summon results. */
export function SpiritPortrait({ id, evolution = 0, size = 54 }: {
  id: SpiritId;
  evolution?: number;
  size?: number;
}) {
  const art = SPIRIT_ART[id];
  const quality = SPIRIT_BY_ID[id].quality;
  const mythic = quality === 'UR';
  const rare = quality === 'SSR' || mythic;
  return (
    <svg data-testid={'spirit-portrait-' + id} viewBox="0 0 120 120" width={size} height={size}
      aria-hidden="true" focusable="false" className="shrink-0 rounded-xl">
      <defs>
        <radialGradient id={'aura-' + id} cx="50%" cy="53%" r="53%">
          <stop offset="0%" stopColor={art.primary} stopOpacity=".35" />
          <stop offset="100%" stopColor={art.primary} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={'skin-' + id} x1="0" y1="0" x2=".8" y2="1">
          <stop offset="0%" stopColor={art.highlight} />
          <stop offset="52%" stopColor={art.primary} />
          <stop offset="100%" stopColor={art.shadow} />
        </linearGradient>
      </defs>
      <rect width="120" height="120" rx="18" fill="#211E36" />
      <circle cx="60" cy="60" r="55" fill={'url(#aura-' + id + ')'} />
      {rare && (
        <g fill="none" stroke={mythic ? '#F8CFAB' : '#DBBFF7'} strokeOpacity=".6">
          <circle cx="60" cy="59" r="50" strokeDasharray={mythic ? '6 5' : '3 8'} />
          <path d="M60 3 L64 12 L60 20 L56 12 Z M60 97 L64 108 L60 116 L56 108 Z" />
        </g>
      )}
      <ellipse cx="60" cy="101" rx="38" ry="8" fill="#141226" opacity=".48" />
      <path d={art.back} fill={art.highlight} fillOpacity=".72" stroke={art.shadow} strokeWidth="2.8"
        strokeLinejoin="round" strokeLinecap="round" />
      <path d={art.body} fill={'url(#skin-' + id + ')'} stroke={art.shadow}
        strokeWidth="3" strokeLinejoin="round" />
      <path d={art.mark} fill="none" stroke={art.highlight} strokeWidth="4"
        strokeLinejoin="round" strokeLinecap="round" />
      <g fill={art.shadow}>
        <ellipse cx="49" cy={art.eyesY} rx="3.6" ry="5.3" />
        <ellipse cx="73" cy={art.eyesY} rx="3.6" ry="5.3" />
      </g>
      <g fill="#FFFFFF" opacity=".9">
        <circle cx="48" cy={art.eyesY - 2} r="1.5" />
        <circle cx="72" cy={art.eyesY - 2} r="1.5" />
      </g>
      {evolution > 0 && (
        <g>
          <path d="M47 34 L55 22 L62 32 L70 21 L78 34 L70 38 L53 38 Z"
            fill={evolution > 1 ? '#F8CB8D' : art.highlight} stroke={art.shadow} strokeWidth="2" />
          <circle cx="61" cy="30" r={evolution > 1 ? 4 : 2.5} fill="#FFF5DC" />
        </g>
      )}
      {evolution > 1 && (
        <g fill="#FFF0B9">
          <path d="M16 62 L20 54 L24 62 L20 70 Z M98 62 L102 54 L106 62 L102 70 Z" />
          <circle cx="60" cy="8" r="2.5" />
        </g>
      )}
      <circle cx="100" cy="18" r="12" fill={mythic ? '#6D3758' : rare ? '#6A4C2A' : '#302D4B'}
        opacity=".92" />
      <text x="100" y="22" textAnchor="middle" fill={mythic ? '#F8D1EA' : '#FBE6AD'}
        fontSize="8" fontWeight="bold">{quality}</text>
    </svg>
  );
}
