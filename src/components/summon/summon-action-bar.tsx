'use client';
import {History,Ticket,Droplets} from 'lucide-react';
/** Button surface only: the parent owns payout and reveal state. */
export function SummonActionBar({disabled,pityCountdown,onHistory,onSingle,onTen}:{
  disabled:boolean;pityCountdown:number;
  onHistory:()=>void;onSingle:()=>void;onTen:()=>void;
}){
  return (
          {/* Gacha Action Control Bar */}
          <div className="w-full max-w-2xl flex flex-col items-center gap-2 mb-2">
            <div className="flex w-full items-center justify-center gap-2 sm:gap-4">
              {/* History Button */}
              <button
                type="button"
                onClick={onHistory}
                className="flex flex-col items-center justify-center rounded-xl border border-[#9b6e45] bg-[#241120cc] px-3 sm:px-4 py-2 text-xs text-[#ffdcb0] hover:border-[#f3ce8a] hover:bg-[#381a32] shadow-md transition"
              >
                <History aria-hidden="true" size={18} strokeWidth={1.6} className="text-[#e6c49c]"/>
                <span className="text-[10px] sm:text-xs font-semibold">召唤记录</span>
              </button>

              {/* Single Summon Button */}
              <button
                type="button"
                data-testid="collection-summon"
                disabled={disabled}
                onClick={onSingle}
                className="group relative flex min-h-12 sm:min-h-14 flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-[#e5c38e] bg-gradient-to-b from-[#f9f2e4] to-[#ded0b6] px-4 py-2 text-black shadow-[0_6px_20px_#00000099] hover:brightness-105 active:scale-95 transition"
              >
                <div className="text-left">
                  <span className="block text-xs sm:text-sm font-extrabold tracking-wider text-[#221015]">
                    单次召唤
                  </span>
                  <span className="block text-[10px] font-bold text-[#623a1a]">
                    <span className="summon-cinematic-cost"><Ticket aria-hidden="true" size={12} strokeWidth={1.6}/> × 1 <i>或</i> <Droplets aria-hidden="true" size={12} strokeWidth={1.6}/> 160</span>
                  </span>
                </div>
              </button>

              {/* Ten-Fold Summon Button */}
              <button
                type="button"
                onClick={onTen}
                data-testid="collection-summon-ten"
                disabled={disabled}
                className="group relative flex min-h-12 sm:min-h-14 flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-[#f5b86b] bg-gradient-to-r from-[#9b1834] via-[#b61d40] to-[#7f1128] px-4 py-2 text-[#fff3db] shadow-[0_6px_25px_#9b1834aa] hover:brightness-110 active:scale-95 transition"
              >
                <div className="text-left">
                  <span className="block text-xs sm:text-sm font-extrabold tracking-wider text-[#ffe5be]">
                    十连召唤
                  </span>
                  <span className="block text-[10px] font-bold text-[#ffbacb]">
                    <span className="summon-cinematic-cost"><Ticket aria-hidden="true" size={12} strokeWidth={1.6}/> × 10 <i>或</i> <Droplets aria-hidden="true" size={12} strokeWidth={1.6}/> 1600</span>
                  </span>
                </div>
              </button>

            </div>

            {/* Pity Indicator */}
            <p className="text-[11px] font-semibold text-[#f8d8b4] tracking-wider drop-shadow-[0_1px_2px_#000]">
              再召唤 <span className="font-bold text-[#ffc66e]">{pityCountdown}</span> 次内必得{' '}
              <span className="text-[#ffd700]">SSR</span> 角色
            </p>
          </div>

  );
}
