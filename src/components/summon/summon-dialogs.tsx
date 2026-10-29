'use client';

import { useState } from 'react';
import {useGothicMotion} from '@/lib/game/gothic-motion';
import Image from 'next/image';
import {
  History,
  Scroll,
  Swords,
  Gem,
  Ticket,
  Droplets,
  Backpack,
  Mail,
  Megaphone,
  Settings,
  Trophy,
} from 'lucide-react';
import type { SummonRecord, GachaPool } from '@/lib/summon/gacha-engine';

// -------------------------------------------------------------
// 1. 召唤记录弹窗 (Summon History Modal)
// -------------------------------------------------------------
export function SummonHistoryModal({
  records,
  onClose,
}: {
  records: SummonRecord[];
  onClose: () => void;
}) {
  const [filterRarity, setFilterRarity] = useState<string>('all');

  const filtered = records.filter((r) => {
    if (filterRarity === 'all') return true;
    if (filterRarity === 'SSR') return r.rarity.startsWith('SSR');
    if (filterRarity === 'SR') return r.rarity === 'SR';
    return true;
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
    >
      <div className="relative flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl border border-[#c49a62] bg-[#1a0f19] p-5 shadow-[0_15px_50px_#000000ee] text-[#f2dac2]">
        <div className="flex items-center justify-between border-b border-[#c49a6244] pb-3">
          <div>
            <h3 className="text-lg font-bold text-[#ffe2be] flex items-center gap-2">
              <History className="size-5 text-[#ffc66e]" />
              <span>契约召唤历史记录</span>
            </h3>
            <p className="text-xs text-[#d2af8e]">记录最近 100 次召唤的祈愿明细与稀有度</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full border border-[#b88c58] text-sm text-[#eac59b] hover:bg-[#341a2c]"
          >
            ✕
          </button>
        </div>

        {/* Filter Bar */}
        <div className="my-3 flex items-center gap-2 text-xs">
          <span className="text-[#c4a17d]">筛选品阶:</span>
          {(['all', 'SSR', 'SR'] as const).map((rarity) => (
            <button
              key={rarity}
              type="button"
              onClick={() => setFilterRarity(rarity)}
              className={`rounded px-3 py-1 font-semibold ${
                filterRarity === rarity
                  ? 'border border-[#e5ba79] bg-[#492237] text-[#ffe6c2]'
                  : 'border border-[#755238] bg-[#221320] text-[#c9a786]'
              }`}
            >
              {rarity === 'all' ? '全部记录' : rarity}
            </button>
          ))}
          <span className="ml-auto text-[11px] text-[#aa8669]">共 {filtered.length} 条</span>
        </div>

        {/* List Content */}
        <div className="flex-1 space-y-2 overflow-y-auto pr-1">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-[#aa8669]">暂无符合条件的召唤记录</div>
          ) : (
            filtered.map((record) => {
              const isSSR = record.rarity.startsWith('SSR');
              const isSR = record.rarity === 'SR';

              return (
                <div
                  key={record.id}
                  className={`flex items-center justify-between rounded-lg border p-2.5 text-xs transition ${
                    isSSR
                      ? 'border-[#ffb347] bg-[#3f1625]/80 text-[#ffe5be]'
                      : isSR
                      ? 'border-[#be77ff] bg-[#2d143c]/80 text-[#f1d4ff]'
                      : 'border-[#584033] bg-[#201320]/60 text-[#d8c2ad]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                        isSSR
                          ? 'bg-[#d97706] text-black'
                          : isSR
                          ? 'bg-[#9333ea] text-white'
                          : 'bg-[#4b5563] text-gray-200'
                      }`}
                    >
                      {record.rarityZh}
                    </span>
                    <strong className="text-sm">{record.title}</strong>
                  </div>
                  <div className="text-right text-[11px] text-[#bca087]">
                    <div>{record.poolName}</div>
                    <div className="text-[10px] opacity-70">
                      {new Date(record.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="mt-4 flex justify-end border-t border-[#c49a6244] pt-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[#c49a62] bg-[#291724] px-5 py-1.5 text-xs text-[#ffe2be] hover:bg-[#3f2137]"
          >
            关闭记录
          </button>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 2. 卡池详情与规则说明弹窗 (Pool Details Modal)
// -------------------------------------------------------------
export function PoolDetailsModal({
  pool,
  onClose,
}: {
  pool: GachaPool;
  onClose: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
    >
      <div className="relative flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl border border-[#c49a62] bg-[#1a0f19] p-5 shadow-[0_15px_50px_#000000ee] text-[#f2dac2]">
        <div className="flex items-center justify-between border-b border-[#c49a6244] pb-3">
          <div>
            <h3 className="text-lg font-bold text-[#ffe2be] flex items-center gap-2">
              <Scroll className="size-5 text-[#ffc66e]" />
              <span>{pool.name} · 卡池详情与规则公示</span>
            </h3>
            <p className="text-xs text-[#d2af8e]">开放时间：{pool.dateRange}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full border border-[#b88c58] text-sm text-[#eac59b] hover:bg-[#341a2c]"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto pr-1 py-3 text-xs leading-relaxed">
          <section className="rounded-lg border border-[#916a44] bg-[#261522] p-3">
            <h4 className="font-bold text-[#ffdca8]">✦ 概率公示明细</h4>
            <ul className="mt-2 grid grid-cols-2 gap-2 text-xs">
              <li className="flex justify-between border-b border-[#4f323e] pb-1 text-[#ff8090]">
                <span>SSR 神话角色:</span> <strong>1.00%</strong>
              </li>
              <li className="flex justify-between border-b border-[#4f323e] pb-1 text-[#ffd700]">
                <span>SSR 传说角色:</span> <strong>5.00%</strong>
              </li>
              <li className="flex justify-between border-b border-[#4f323e] pb-1 text-[#c084fc]">
                <span>SR 精英角色:</span> <strong>17.00%</strong>
              </li>
              <li className="flex justify-between border-b border-[#4f323e] pb-1 text-[#93c5fd]">
                <span>R 稀有角色:</span> <strong>31.00%</strong>
              </li>
              <li className="flex justify-between border-b border-[#4f323e] pb-1 text-[#cbd5e1]">
                <span>N 常规角色:</span> <strong>46.00%</strong>
              </li>
            </ul>
          </section>

          <section className="rounded-lg border border-[#916a44] bg-[#261522] p-3 space-y-2">
            <h4 className="font-bold text-[#ffdca8]">✦ 保底规则与 UP 机制</h4>
            <p>
              1. <strong>90 抽大保底</strong>：在任意卡池中，若连续 89 次召唤未出现 SSR 角色，则第 90 次必定获得 SSR 角色。抽中任意 SSR 角色后，保底计数立即重置为 90。
            </p>
            <p>
              2. <strong>十连保底</strong>：单次进行十连召唤时，必定获得至少 1 名 SR 精英或以上品质的角色。
            </p>
            <p>
              3. <strong>保底分配</strong>：常规神话概率 1%、传说 5%；触发 90 抽保底时神话与传说各占 50%。五个主题共用概率，不存在额外限时概率提升。
            </p>
            <p>
              4. <strong>人物收藏联动</strong>：五种契约同步收藏和装备系统；原有四名住客房间保持独立，不会凭空生成工坊住客。
            </p>
          </section>
        </div>

        <div className="mt-3 flex justify-end border-t border-[#c49a6244] pt-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[#c49a62] bg-[#291724] px-5 py-1.5 text-xs text-[#ffe2be] hover:bg-[#3f2137]"
          >
            我已知晓
          </button>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 3. 角色档案弹窗 (Character Archive Modal)
// -------------------------------------------------------------
export function CharacterArchiveModal({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'bio' | 'stats' | 'voices'>('bio');

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
    >
      <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl border border-[#d4aa70] bg-[#180e18] p-5 sm:p-6 shadow-[0_20px_60px_#000000f0] text-[#f4ddc5]">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#c49a6244] pb-4">
          <div className="flex items-center gap-3">
            <div className="relative size-14 overflow-hidden rounded-xl border border-[#ffdb9b] bg-[#311626]">
              <Image
                src="/art/yuesha-avatar-v3.webp"
                alt="月纱"
                fill
                className="object-cover object-top"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-serif font-bold text-[#ffe6c2]">月纱 ☾</h3>
                <span className="rounded bg-gradient-to-r from-[#d97706] to-[#dc2626] px-2 py-0.5 text-[10px] font-bold text-black">
                  SSR 神话
                </span>
              </div>
              <p className="text-xs text-[#d6b08f]">神话 · 月蚀 · 夜行高阶魔女</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full border border-[#b88c58] text-sm text-[#eac59b] hover:bg-[#341a2c]"
          >
            ✕
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex gap-2 my-3 border-b border-[#5e4231] pb-2 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('bio')}
            className={`rounded-lg px-4 py-1.5 font-semibold transition ${
              activeTab === 'bio'
                ? 'border border-[#e5ba79] bg-[#421d31] text-[#ffe5be]'
                : 'text-[#c4a17d] hover:text-white'
            }`}
          >
            生平与传记
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('stats')}
            className={`rounded-lg px-4 py-1.5 font-semibold transition ${
              activeTab === 'stats'
                ? 'border border-[#e5ba79] bg-[#421d31] text-[#ffe5be]'
                : 'text-[#c4a17d] hover:text-white'
            }`}
          >
            契约权能雷达
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('voices')}
            className={`rounded-lg px-4 py-1.5 font-semibold transition ${
              activeTab === 'voices'
                ? 'border border-[#e5ba79] bg-[#421d31] text-[#ffe5be]'
                : 'text-[#c4a17d] hover:text-white'
            }`}
          >
            语音台词
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto space-y-3 text-xs leading-relaxed pr-2">
          {activeTab === 'bio' && (
            <>
              <div className="rounded-xl border border-[#7a5438] bg-[#221321] p-4">
                <h4 className="font-bold text-[#ffdca8]">【人物引言】</h4>
                <p className="mt-1 italic text-[#f0caa5]">
                  “「沉入永夜吧—— 这一次，换我来拥抱你。」”
                </p>
              </div>
              <div className="rounded-xl border border-[#7a5438] bg-[#221321] p-4 space-y-2">
                <h4 className="font-bold text-[#ffdca8]">【背景故事】</h4>
                <p>
                  月纱是统治月光街古老结界的纯血魔女。在百年前的圣战中，她以永眠为代价封印了肆虐的混沌深渊。随着血月之蚀的再度降临，她在公寓钟楼的最高层静静苏醒。
                </p>
                <p>
                  她手持刻满古代誓约的血晶法杖，身着深绯天鹅绒巴洛克礼裙，既是守护全体怪物的庇护者，也是冷酷洞察一切贪婪与背叛的契约主宰。
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-[#7a5438] bg-[#221321] p-3">
                  <span className="text-[#c49a62]">喜好：</span>
                  <p className="mt-1 text-[#edd0b5]">月纹印章、红茶、巴洛克花饰、宁静的深宵</p>
                </div>
                <div className="rounded-lg border border-[#7a5438] bg-[#221321] p-3">
                  <span className="text-[#c49a62]">恐惧：</span>
                  <p className="mt-1 text-[#edd0b5]">失去誓约的羁绊、再次目睹同伴在晨曦中消逝</p>
                </div>
              </div>
            </>
          )}

          {activeTab === 'stats' && (
            <div className="rounded-xl border border-[#7a5438] bg-[#221321] p-4 space-y-3">
              <h4 className="font-bold text-[#ffdca8]">【契约权能评估】</h4>
              <div className="space-y-2.5">
                {[
                  { label: '月影秘术 (智慧 & 灵能)', value: '98/100', width: '98%' },
                  { label: '契约法则 (意志 & 掌控)', value: '95/100', width: '95%' },
                  { label: '夜域支配 (感知 & 领域)', value: '92/100', width: '92%' },
                  { label: '血晶同调 (生命 & 韧性)', value: '88/100', width: '88%' },
                  { label: '近身战技 (速度 & 敏捷)', value: '75/100', width: '75%' },
                ].map((stat, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-xs text-[#eed3b8]">
                      <span>{stat.label}</span>
                      <span className="font-mono text-[#ffc66e]">{stat.value}</span>
                    </div>
                    <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-[#140a15]">
                      <div
                        className="h-full bg-gradient-to-r from-[#d97706] to-[#dc2626]"
                        style={{ width: stat.width }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'voices' && (
            <div className="space-y-2">
              {[
                { title: '初次相见', text: '「……你也想，成为我的所有物吗？」' },
                { title: '契约加深', text: '「把手给我。从今夜起，你的脉搏由我代为聆听。」' },
                { title: '关于公寓', text: '「这些吵闹的住客……哼，虽然嘴硬，但有他们在身边，长夜也不算太冷。」' },
                { title: '并肩作战', text: '「借月华之芒，化作斩破虚妄的利刃！」' },
              ].map((voice, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-[#6b4731] bg-[#221321] p-3 text-xs"
                >
                  <strong className="text-[#ffdca8]">【{voice.title}】</strong>
                  <p className="mt-1 italic text-[#e4c4a6]">{voice.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-end border-t border-[#c49a6244] pt-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[#c49a62] bg-[#291724] px-6 py-1.5 text-xs text-[#ffe2be] hover:bg-[#3f2137]"
          >
            完成查阅
          </button>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 4. 角色试玩演习弹窗 (Character Trial Modal)
// -------------------------------------------------------------
export function CharacterTrialModal({
  onRewardClaimed,
  onClose,
  alreadyClaimed=false,
}: {
  onRewardClaimed: () => void;
  onClose: () => void;
  alreadyClaimed?: boolean;
}) {
  const [battleState, setBattleState] = useState<'intro' | 'action' | 'cleared'>('intro');

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
    >
      <div className="relative flex max-h-[90vh] w-full max-w-xl flex-col items-center rounded-2xl border border-[#d4aa70] bg-[#180e18] p-6 text-center shadow-[0_20px_60px_#000000f0] text-[#f4ddc5]">
        <h3 className="text-xl font-serif font-bold text-[#ffe6c2] flex items-center gap-2">
          <Swords className="size-5 text-[#ffc66e]" />
          <span>角色技能展示</span>
        </h3>
        <p className="mt-1 text-xs text-[#d6b08f]">
          体验限定角色「月纱 · 神话·月蚀」的终极契约权能
        </p>

        {battleState === 'intro' && (
          <div className="my-6 space-y-4">
            <div className="relative mx-auto size-32 overflow-hidden rounded-full border-2 border-[#ffdb9b] shadow-[0_0_30px_#cc2046]">
              <Image
                src="/art/yuesha-avatar-v3.webp"
                alt="月纱"
                fill
                className="object-cover object-top"
              />
            </div>
            <p className="text-xs text-[#e8cbb0]">
              目标：模拟击溃迷雾深处的「暗蚀阴影」，检验月影秘术的范围破坏力。
            </p>
            <div className="rounded-lg border border-[#7a5438] bg-[#271424] p-3 text-xs text-[#ffdca8]">
              技能演示首通奖励：<strong>契约信物 x 1</strong>
            </div>
            <button
              type="button"
              onClick={() => {
                setBattleState('action');
                setTimeout(() => setBattleState('cleared'), 1800);
              }}
              className="min-h-11 rounded-lg border border-[#e5ba79] bg-gradient-to-r from-[#9e1c36] to-[#b82245] px-8 py-2 text-sm font-bold text-[#ffe5be] shadow-[0_0_20px_#b8224580] hover:brightness-110"
            >
              施放终极绝技「永夜月蚀曼荼罗」!
            </button>
          </div>
        )}

        {battleState === 'action' && (
          <div className="my-10 space-y-3 animate-pulse">
            <div className="text-4xl text-[#ff3366]">✦ ☾ ✦</div>
            <h4 className="text-lg font-bold text-[#ffe5be]">月华破晓，暗蚀归于无形！</h4>
            <p className="text-xs text-[#d8b58f]">这是月蚀魔法的演示效果，尚不是正式战斗系统。</p>
          </div>
        )}

        {battleState === 'cleared' && (
          <div className="my-6 space-y-4">
            <div className="text-2xl text-[#ffc66e] flex items-center justify-center gap-2">
              <Trophy className="size-6 text-[#ffd700]" />
              <span>演习胜利！</span>
            </div>
            <p className="text-xs text-[#eed2b6]">
              技能演示已结束。{alreadyClaimed?'本次首通奖励此前已领取。':'点击下方按钮领取一次首通契约奖励。'}
            </p>
            <button
              type="button"
              disabled={alreadyClaimed}
              onClick={() => {
                onRewardClaimed();
                onClose();
              }}
              className="min-h-10 rounded-lg border border-[#c49a62] bg-[#2e1929] px-6 py-2 text-xs font-semibold text-[#ffe3bd] hover:bg-[#48223d] disabled:opacity-50"
            >
              {alreadyClaimed?'首通奖励已领取':'领取 1 张契约信物并返回'}
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="mt-2 text-xs text-[#aa8669] hover:underline"
        >
          退出试玩
        </button>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 5. 货币快捷兑换与补充弹窗 (Currency Replenish Modal)
// -------------------------------------------------------------
export function CurrencyReplenishModal({
  onAddTickets,
  onAddCrystals,
  onAddMoonstones,
  onClose,
}: {
  onAddTickets: (n: number) => void;
  onAddCrystals: (n: number) => void;
  onAddMoonstones: (n: number) => void;
  onClose: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
    >
      <div className="relative flex max-h-[85vh] w-full max-w-lg flex-col rounded-2xl border border-[#c49a62] bg-[#1a0f19] p-5 shadow-[0_15px_50px_#000000ee] text-[#f2dac2]">
        <div className="flex items-center justify-between border-b border-[#c49a6244] pb-3">
          <h3 className="text-lg font-bold text-[#ffe2be]">✦ 契约物资与货币补给</h3>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full border border-[#b88c58] text-sm text-[#eac59b] hover:bg-[#341a2c]"
          >
            ✕
          </button>
        </div>

        <div className="my-4 space-y-3 text-xs">
          <div className="flex items-center justify-between rounded-lg border border-[#7a5438] bg-[#221321] p-3">
            <div>
              <strong className="text-sm text-[#ffdca8] flex items-center gap-1.5">
                <Ticket className="size-4 text-[#ffc66e]" />
                <span>契约信物补给包</span>
              </strong>
              <span className="text-[11px] text-[#cca583]">免费领取月度赞助 10 张信物</span>
            </div>
            <button
              type="button"
              onClick={() => onAddTickets(10)}
              className="rounded-lg border border-[#e5ba79] bg-[#421d31] px-4 py-1.5 text-xs font-bold text-[#ffe5be] hover:bg-[#582542]"
            >
              +10 信物
            </button>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-[#7a5438] bg-[#221321] p-3">
            <div>
              <strong className="text-sm text-[#ffdca8] flex items-center gap-1.5">
                <Droplets className="size-4 text-[#ff4466] fill-[#ff4466]" />
                <span>血月晶石补给包</span>
              </strong>
              <span className="text-[11px] text-[#cca583]">工坊晶核熔炼提纯 1,600 颗血晶</span>
            </div>
            <button
              type="button"
              onClick={() => onAddCrystals(1600)}
              className="rounded-lg border border-[#e5ba79] bg-[#421d31] px-4 py-1.5 text-xs font-bold text-[#ffe5be] hover:bg-[#582542]"
            >
              +1600 血晶
            </button>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-[#7a5438] bg-[#221321] p-3">
            <div>
              <strong className="text-sm text-[#ffdca8] flex items-center gap-1.5">
                <Gem className="size-4 text-[#6ee7b7]" />
                <span>月光石勘探礼包</span>
              </strong>
              <span className="text-[11px] text-[#cca583]">探索街道发现的纯净宝石 100 颗</span>
            </div>
            <button
              type="button"
              onClick={() => onAddMoonstones(100)}
              className="rounded-lg border border-[#e5ba79] bg-[#421d31] px-4 py-1.5 text-xs font-bold text-[#ffe5be] hover:bg-[#582542]"
            >
              +100 月光石
            </button>
          </div>
        </div>

        <div className="flex justify-end border-t border-[#c49a6244] pt-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[#c49a62] bg-[#291724] px-5 py-1.5 text-xs text-[#ffe2be] hover:bg-[#3f2137]"
          >
            完成领取
          </button>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 6. 通用功能弹窗 (背包、邮件、公告、设置)
// -------------------------------------------------------------
export function UtilityModal({
  type,
  onClose,
}: {
  type: 'bag' | 'mail' | 'notice' | 'settings';
  onClose: () => void;
}) {
  const {reduced,toggle}=useGothicMotion();
  const getHeader = () => {
    switch (type) {
      case 'bag':
        return (
          <div className="flex items-center gap-2">
            <Backpack className="size-5 text-[#ffc66e]" />
            <span>随身背包与契约魂石</span>
          </div>
        );
      case 'mail':
        return (
          <div className="flex items-center gap-2">
            <Mail className="size-5 text-[#ffc66e]" />
            <span>怪物公寓收件箱</span>
          </div>
        );
      case 'notice':
        return (
          <div className="flex items-center gap-2">
            <Megaphone className="size-5 text-[#ffc66e]" />
            <span>最新活动与更新公告</span>
          </div>
        );
      case 'settings':
        return (
          <div className="flex items-center gap-2">
            <Settings className="size-5 text-[#ffc66e]" />
            <span>游戏偏好设置</span>
          </div>
        );
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
    >
      <div className="relative flex max-h-[85vh] w-full max-w-lg flex-col rounded-2xl border border-[#c49a62] bg-[#1a0f19] p-5 shadow-[0_15px_50px_#000000ee] text-[#f2dac2]">
        <div className="flex items-center justify-between border-b border-[#c49a6244] pb-3">
          <h3 className="text-lg font-bold text-[#ffe2be]">{getHeader()}</h3>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full border border-[#b88c58] text-sm text-[#eac59b] hover:bg-[#341a2c]"
          >
            ✕
          </button>
        </div>

        <div className="my-4 space-y-3 text-xs leading-relaxed">
          {type === 'bag' && (
            <div className="space-y-2">
              <p>当前保管契约信物、血月晶石与人物锻造碎片。所有抽中角色已同步登记至公寓。</p>
              <div className="rounded-lg border border-[#7a5438] bg-[#241322] p-3 text-[#eed1b5]">
                ✦ 提示：可在图鉴面板打造专属首饰并为角色穿戴，提升全维属性。
              </div>
            </div>
          )}

          {type === 'mail' && (
            <div className="space-y-2">
              <div className="rounded-lg border border-[#7a5438] bg-[#241322] p-3">
                <strong className="block text-[#ffdca8]">当前没有待领取的新邮件</strong>
                <span className="text-[10px] text-[#aa8669]">本地单机存档</span>
                <p className="mt-1">游戏尚未接入在线邮件服务，不会显示虚构的系统赠礼。</p>
              </div>
            </div>
          )}

          {type === 'notice' && (
            <div className="space-y-2">
              <div className="rounded-lg border border-[#7a5438] bg-[#241322] p-3">
                <strong className="block text-[#ffdca8]">「神话·月蚀」契约主题已开放</strong>
                <p className="mt-1 text-[11px] text-[#d6b08f]">
                  当前长期开放：神话基础概率为 1.00%，主题间不提供虚假的概率加成或过期倒计时。
                </p>
              </div>
            </div>
          )}

          {type === 'settings' && (
            <div className="space-y-3">
              <label className="flex items-center justify-between rounded-lg border border-[#7a5438] bg-[#241322] p-3">
                <span>减少月蚀召唤仪式动画</span>
                <input type="checkbox" checked={reduced} onChange={toggle} className="accent-[#d97706]" />
              </label>
              <p className="rounded-lg border border-[#7a5438] bg-[#241322] p-3 text-[#c9a786]">正式音效尚未实现，不提供无效音效开关。</p>
            </div>
          )}
        </div>

        <div className="flex justify-end border-t border-[#c49a6244] pt-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[#c49a62] bg-[#291724] px-5 py-1.5 text-xs text-[#ffe2be] hover:bg-[#3f2137]"
          >
            确定
          </button>
        </div>
      </div>
    </div>
  );
}
