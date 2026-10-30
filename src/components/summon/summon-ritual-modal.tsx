'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {getCardFace} from './heroine-portrait-assets';
import {siteAssetUrl} from '@/lib/game/site-asset-url';
import type { SummonableCharacter } from '@/lib/summon/gacha-engine';

interface SummonRitualModalProps {
  characters: SummonableCharacter[];
  onClose: () => void;
  onSummonAgain?: () => void;
  onViewCollection?: () => void;
}

export function SummonRitualModal({ characters, onClose, onSummonAgain, onViewCollection }: SummonRitualModalProps) {
  const [phase, setPhase] = useState<'ritual' | 'reveal'>('ritual');
  const [revealedIndices, setRevealedIndices] = useState<number[]>([]);
  const isMulti = characters.length > 1;

  // Auto transition from ritual vortex to reveal after 2.2 seconds if not skipped
  useEffect(() => {
    if (phase === 'ritual') {
      const timer = window.setTimeout(() => {
        setPhase('reveal');
      }, 2200);
      return () => window.clearTimeout(timer);
    }
  }, [phase]);

  const toggleReveal = (idx: number) => {
    if (!revealedIndices.includes(idx)) {
      setRevealedIndices((prev) => [...prev, idx]);
    }
  };

  const revealAll = () => {
    setRevealedIndices(characters.map((_, i) => i));
  };

  const hasMythicSSR = characters.some((c) => c.rarity === 'SSR-Mythic');
  const allRevealed = !isMulti || revealedIndices.length === characters.length;

  return (
    <div
      role="dialog"
      aria-modal="true"
      data-testid="collection-reveal"
      data-rarity={characters[0]?.title.includes('月蚀') ? '神话·月蚀' : characters[0]?.rarityZh || '普通'}
      data-motion="animated"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/90 backdrop-blur-xl"
    >
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,#4a102480_0%,#170614dd_60%,#09030bcc_100%)]" />

      {/* Skip button in ritual phase */}
      {phase === 'ritual' && (
        <button
          type="button"
          onClick={() => setPhase('reveal')}
          className="absolute top-6 right-6 z-20 rounded-full border border-[#f3d3a088] bg-[#22101ecc] px-4 py-1.5 text-xs tracking-wider text-[#ffdca8] hover:border-[#ffe8be] hover:bg-[#3d1830]"
        >
          跳过仪式 ✕
        </button>
      )}

      {/* PHASE 1: Lunar Eclipse Summoning Ritual */}
      {phase === 'ritual' && (
        <div className="relative flex flex-col items-center justify-center text-center">
          {/* Crimson Moon with Golden Corona */}
          <div className="relative flex size-64 items-center justify-center animate-pulse">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#991530] via-[#c92040] to-[#ffd280] blur-2xl opacity-60 animate-spin" />
            <div className="relative flex size-48 items-center justify-center rounded-full border-2 border-[#ffdb9b] bg-gradient-to-b from-[#240c1a] to-[#0c040d] shadow-[0_0_50px_#cc2046]">
              <span className="text-6xl text-[#ffdca8] animate-bounce">☾</span>
            </div>
          </div>
          <h2 className="mt-6 text-2xl font-serif font-bold tracking-[.25em] text-[#ffe5be]">
            {hasMythicSSR ? '✦ 月蚀共鸣 · 神话临世 ✦' : '✦ 月影低语 · 契约缔结 ✦'}
          </h2>
          <p className="mt-2 text-sm text-[#eac098] tracking-widest">
            正在引动月华之力，唤醒沉睡中的契约之魂……
          </p>
        </div>
      )}

      {/* PHASE 2: Tarot Cards Reveal Stage */}
      {phase === 'reveal' && (
        <div className="relative flex max-h-[95vh] w-full max-w-6xl flex-col items-center justify-between p-4 sm:p-6 overflow-y-auto">
          {/* Top Title */}
          <div className="mb-4 text-center">
            <span className="text-[11px] tracking-[.28em] text-[#d4a872] uppercase">
              COVENANT AWAKENED · 契约揭晓
            </span>
            <h3 className="text-xl font-bold tracking-[.15em] text-[#ffe6c2] sm:text-2xl">
              {isMulti ? '十连召唤 · 契约回响' : '单次召唤 · 命定相遇'}
            </h3>
            {hasMythicSSR && (
              <p
                data-testid="collection-reveal-rarity"
                className="mt-1 inline-block rounded-full border border-[#ff5577] bg-[#5a0f25] px-3 py-0.5 text-xs font-semibold text-[#ffd2dc] shadow-[0_0_15px_#ff205080]"
              >
                ✦ 红色神话角色降临 ✦
              </p>
            )}
          </div>

          {/* Cards Grid */}
          <div
            className={`grid w-full gap-3 sm:gap-4 my-auto justify-center ${
              isMulti
                ? 'grid-cols-2 sm:grid-cols-5 max-w-5xl'
                : 'grid-cols-1 max-w-xs'
            }`}
          >
            {characters.map((char, index) => {
              const isRevealed = revealedIndices.includes(index) || !isMulti;
              const isSSR = char.rarity.startsWith('SSR');
              const isSR = char.rarity === 'SR';

              return (
                <button type="button"
                  key={index}
                  aria-label={isRevealed?`已揭晓：${char.title}`:`翻开第 ${index+1} 张契约卡`}
                  aria-disabled={isRevealed}
                  onClick={() => {if(!isRevealed)toggleReveal(index);}}
                  className={`group relative flex h-72 sm:h-80 w-full cursor-pointer flex-col overflow-hidden rounded-xl border text-left transition-all duration-300 hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffe5b2] ${
                    isRevealed
                      ? isSSR
                        ? 'border-[#ffc060] bg-gradient-to-b from-[#401222] via-[#240e1b] to-[#120713] shadow-[0_0_25px_#ff406080]'
                        : isSR
                        ? 'border-[#c785ff] bg-gradient-to-b from-[#2e1245] via-[#1c0c2d] to-[#10071c] shadow-[0_0_20px_#9b40ff60]'
                        : 'border-[#75849e] bg-gradient-to-b from-[#1b2230] via-[#101620] to-[#090e15]'
                      : 'border-[#8e6840] bg-[#1a0f18] hover:border-[#d4a872] shadow-[0_8px_20px_#00000080]'
                  }`}
                >
                  {/* Card Back (Unrevealed) */}
                  {!isRevealed ? (
                    <div className="flex h-full w-full flex-col items-center justify-center p-3 text-center">
                      <div className="flex size-14 items-center justify-center rounded-full border border-[#c49a60] bg-[#2d1828] text-2xl text-[#f5d7aa] shadow-inner">
                        ☾
                      </div>
                      <span className="mt-3 text-xs tracking-widest text-[#d8b58f]">
                        点击揭晓
                      </span>
                      {/* Aura hint for rarity */}
                      <div
                        className={`mt-4 size-3 rounded-full blur-xs ${
                          isSSR
                            ? 'bg-[#ffb030] shadow-[0_0_12px_#ff8000]'
                            : isSR
                            ? 'bg-[#c060ff] shadow-[0_0_10px_#a020f0]'
                            : 'bg-[#6090e0]'
                        }`}
                      />
                    </div>
                  ) : (
                    /* Card Front (Revealed) */
                    <div className="relative flex h-full w-full flex-col p-3">
                      {/* Top Badges */}
                      <div className="z-10 flex items-center justify-between">
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wider ${
                            isSSR
                              ? 'bg-gradient-to-r from-[#ffd700] to-[#ff4500] text-black shadow-md'
                              : isSR
                              ? 'bg-[#a855f7] text-white'
                              : 'bg-[#475569] text-gray-200'
                          }`}
                        >
                          {char.rarityZh}
                        </span>
                        {char.isUp && (
                          <span className="rounded bg-[#ff2255] px-1.5 py-0.5 text-[9px] font-bold text-white uppercase">
                            UP
                          </span>
                        )}
                      </div>

                      {/* Character Artwork */}
                      <div className="relative my-auto flex h-36 sm:h-44 w-full items-center justify-center overflow-hidden rounded-lg">
                        <Image src={getCardFace(char.id)??siteAssetUrl(char.avatar)} alt={char.name} fill
                          sizes="200px" className="object-cover object-top filter brightness-105"
                          data-portrait-source="dedicated-heroin-face"/>
                        <div className="absolute inset-0 bg-gradient-to-t from-[#140b15] via-transparent to-transparent" />
                      </div>

                      {/* Character Meta */}
                      <div className="z-10 mt-auto text-left">
                        <h4
                          data-testid="collection-reveal-name"
                          className="text-sm font-bold text-[#ffe7c9] truncate"
                        >
                          {char.title}
                        </h4>
                        <p data-testid="collection-reveal-award"
                          className="mt-1 flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-[10px] leading-4">
                          <span className={char.firstAcquired?'font-semibold text-[#ffda92]':'text-[#b8d6e5]'}>
                            {char.firstAcquired?'✦ 首次收录':'重复契约'}
                          </span>
                          <span className="tabular-nums text-[#f1d3a8]">
                            +{char.awardedShards??0} 锻造碎片
                          </span>
                        </p>
                        <p className="mt-0.5 text-[10px] text-[#e0bfa3] line-clamp-2 italic">
                          "{char.quote}"
                        </p>
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Bottom Actions Bar */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {isMulti && revealedIndices.length < characters.length && (
              <button
                type="button"
                onClick={revealAll}
                className="min-h-10 rounded-lg border border-[#e2b77a] bg-[#3a1d30] px-5 py-2 text-xs font-semibold text-[#ffe3bd] hover:bg-[#522542]"
              >
                全部翻开
              </button>
            )}

            {allRevealed && onSummonAgain && (
              <button
                type="button"
                onClick={() => {
                  setPhase('ritual');
                  setRevealedIndices([]);
                  onSummonAgain();
                }}
                className="min-h-10 rounded-lg border border-[#f5b86b] bg-gradient-to-r from-[#9e1c36] to-[#b82245] px-6 py-2 text-xs font-bold text-[#fff0d6] shadow-[0_0_15px_#b8224580] hover:brightness-110"
              >
                再抽十次 (🎫x10)
              </button>
            )}

            {allRevealed&&onViewCollection&&<button type="button"
              data-testid="collection-reveal-view-collection"
              onClick={onViewCollection}
              className="min-h-11 rounded-lg border border-[#f5bf81] bg-gradient-to-r from-[#82314a] to-[#4a203b] px-5 py-2 text-xs font-semibold text-[#fff0d8] hover:brightness-110">
              查看获得的契约与装备
            </button>}

            <button
              type="button"
              data-testid="collection-reveal-close"
              onClick={onClose}
              className="min-h-10 rounded-lg border border-[#c4a070] bg-[#221320] px-6 py-2 text-xs font-semibold text-[#eed2b0] hover:bg-[#341d31]"
            >
              确定收下
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
