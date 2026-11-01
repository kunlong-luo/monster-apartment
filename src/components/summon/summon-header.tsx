'use client';
import {Backpack,Droplets,Gem,Mail,Megaphone,Settings,Ticket} from 'lucide-react';
import {GAME_UI_RELEASE} from '@/core/game-release';

export type SummonUtility='bag'|'mail'|'notice'|'settings';
/** Displays actual resource balances supplied by the summon screen. */
export function SummonHeader({tickets,crystals,moonstones,onOpenResources,onUtility}:{
  tickets:number;crystals:number;moonstones:number;
  onOpenResources:()=>void;onUtility:(kind:SummonUtility)=>void;
}){
  return (
      <header className="summon-cinematic-header relative z-20 flex h-14 sm:h-16 w-full items-center justify-between px-3 sm:px-6 bg-gradient-to-b from-[#120713cc] to-transparent">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <span className="text-xl sm:text-2xl text-[#f3ca88]">❦</span>
          <div className="leading-tight">
            <h1 className="text-base sm:text-xl font-bold tracking-[.18em] text-[#ffebcc] drop-shadow-[0_2px_4px_#000]">
              怪物公寓
            </h1>
            <span className="block text-[8px] sm:text-[9px] tracking-[.25em] text-[#bca085] uppercase">
              MONSTER APARTMENT · <span data-testid="game-release">{GAME_UI_RELEASE}</span>
            </span>
          </div>
        </div>

        {/* Center-Right Currencies */}
        <div className="summon-cinematic-header-controls flex items-center gap-2 sm:gap-4">
          <div className="summon-cinematic-wallet flex items-center gap-2 sm:gap-4" aria-label="真实契约资源">
          {/* Contract Tickets */}
          <button type="button" aria-label="查看契约信物来源"
            onClick={() => onOpenResources()}
            className="flex cursor-pointer items-center gap-1.5 rounded-full border border-[#b88c5888] bg-[#22101ecc] px-2.5 py-1 text-xs text-[#ffe1bc] shadow-md hover:border-[#ffd699]"
          >
            <Ticket aria-hidden="true" size={16} strokeWidth={1.6} className="shrink-0 text-[#e8c695]"/>
            <span data-testid="collection-tickets" className="font-semibold text-xs sm:text-sm">
              {tickets}
            </span>
            <span className="flex size-4 items-center justify-center rounded-full bg-[#462135] text-[10px] text-[#ffc66e]">
              +
            </span>
          </button>

          {/* Blood Crystals */}
          <button type="button" aria-label="查看血晶来源"
            onClick={() => onOpenResources()}
            className="flex cursor-pointer items-center gap-1.5 rounded-full border border-[#b88c5888] bg-[#22101ecc] px-2.5 py-1 text-xs text-[#ffe1bc] shadow-md hover:border-[#ffd699]"
          >
            <Droplets aria-hidden="true" size={16} strokeWidth={1.6} className="shrink-0 text-[#d58a9c]"/>
            <span className="font-semibold text-xs sm:text-sm">
              {crystals.toLocaleString()}
            </span>
            <span className="flex size-4 items-center justify-center rounded-full bg-[#462135] text-[10px] text-[#ffc66e]">
              +
            </span>
          </button>

          {/* Moonstones */}
          <button type="button" aria-label="查看月光石来源"
            onClick={() => onOpenResources()}
            className="flex cursor-pointer items-center gap-1.5 rounded-full border border-[#b88c5888] bg-[#22101ecc] px-2.5 py-1 text-xs text-[#ffe1bc] shadow-md hover:border-[#ffd699]"
          >
            <Gem aria-hidden="true" size={16} strokeWidth={1.6} className="shrink-0 text-[#c0b8dc]"/>
            <span className="font-semibold text-xs sm:text-sm">{moonstones}</span>
            <span className="flex size-4 items-center justify-center rounded-full bg-[#462135] text-[10px] text-[#ffc66e]">
              +
            </span>
          </button>

          </div>
          {/* Top-Right Utility Icons */}
          <div className="summon-cinematic-tools flex items-center gap-1.5 border-l border-[#805a4155] pl-2 sm:gap-2 sm:pl-3" aria-label="召唤辅助功能">
            <button
              type="button"
              aria-label="背包"
              onClick={() => onUtility('bag')}
              className="flex size-8 items-center justify-center rounded-lg border border-[#7e5539] bg-[#23121fcc] text-sm text-[#eed0b2] hover:border-[#ffd699] hover:bg-[#3f1f35]"
            >
              <Backpack aria-hidden="true" size={17} strokeWidth={1.6}/>
            </button>
            <button
              type="button"
              aria-label="邮箱"
              onClick={() => onUtility('mail')}
              className="relative flex size-8 items-center justify-center rounded-lg border border-[#7e5539] bg-[#23121fcc] text-sm text-[#eed0b2] hover:border-[#ffd699] hover:bg-[#3f1f35]"
            >
              <Mail aria-hidden="true" size={17} strokeWidth={1.6}/>
            </button>
            <button
              type="button"
              aria-label="公告"
              onClick={() => onUtility('notice')}
              className="relative flex size-8 items-center justify-center rounded-lg border border-[#7e5539] bg-[#23121fcc] text-sm text-[#eed0b2] hover:border-[#ffd699] hover:bg-[#3f1f35]"
            >
              <Megaphone aria-hidden="true" size={17} strokeWidth={1.6}/>
            </button>
            <button
              type="button"
              aria-label="设置"
              onClick={() => onUtility('settings')}
              className="flex size-8 items-center justify-center rounded-lg border border-[#7e5539] bg-[#23121fcc] text-sm text-[#eed0b2] hover:border-[#ffd699] hover:bg-[#3f1f35]"
            >
              <Settings aria-hidden="true" size={17} strokeWidth={1.6}/>
            </button>
          </div>
        </div>
      </header>
  );
}
