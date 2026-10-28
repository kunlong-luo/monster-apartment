'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  Home,
  Hammer,
  Scroll,
  BookOpen,
  Compass,
  Settings,
  Coins,
  Gem,
  Sparkles,
  Mail,
  ShoppingBag,
  Grid,
  Lock,
  Heart,
  MessageSquare,
  Moon,
  Coffee,
  Search,
  Shirt,
  Cat,
  Bed,
  Gift,
  ChevronRight,
} from 'lucide-react';
import moonveilBust from '../../../public/art/yuesha-bust-v3.webp';
import moonveilBackdrop from '../../../public/art/lobby-hero-v3.webp';
import yueshaAvatar from '../../../public/art/yuesha-avatar-v3.webp';
import {
  YUESHA_ROOM_SCENES,
  YUESHA_MEMORIES,
  YUESHA_HOTSPOTS,
  YUESHA_DIALOGUES,
  YUESHA_GIFTS,
  yueshaAfterChoice,
} from '@/core/character-life';
import type { YueshaChoice, RoomObjectId } from '@/core/character-life';
import { commitCharacterLife, useCharacterLife } from '@/lib/game/character-life-store';

export function YueshaPrivateRoom({
  guests = 6,
  happiness = 85,
}: {
  guests?: number;
  happiness?: number;
}) {
  const [activeTab, setActiveTab] = useState<'dialogue' | 'gift' | 'wardrobe' | 'story'>('dialogue');
  const [selectedScene, setSelectedScene] = useState<string>('chamber');
  const [selectedDialogue, setSelectedDialogue] = useState<string | null>(null);
  const [dialogueResponse, setDialogueResponse] = useState<string>('“有些契约不会写在纸上，而是刻在月光里。”');
  const [selectedHotspot, setSelectedHotspot] = useState<string | null>(null);
  const [hotspotText, setHotspotText] = useState<string>('');
  const [affectionXp, setAffectionXp] = useState<number>(320);
  const [selectedGift, setSelectedGift] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string>('');

  const { status, progress } = useCharacterLife();
  const choice = progress.decisions['yuesha-first-visit'];
  const observed = progress.observations?.yuesha ?? [];

  useEffect(() => {
    if (status === 'ok') {
      commitCharacterLife({ type: 'visit', id: 'yuesha' });
    }
  }, [status]);

  const handleHotspotClick = (id: string, text: string) => {
    setSelectedHotspot(id);
    setHotspotText(text);
    if (status === 'ok') {
      const result = commitCharacterLife({ type: 'inspect', id: 'yuesha', item: id as RoomObjectId });
      if (result === 'applied') {
        setFeedback('你记下了这处生动的细节。');
      }
    }
  };

  const handleDialogueClick = (id: string, response: string) => {
    setSelectedDialogue(id);
    setDialogueResponse(response);
  };

  const handleSendGift = (exp: number, name: string) => {
    setAffectionXp((prev) => Math.min(500, prev + exp));
    setFeedback(`赠送了 ${name}，亲密度 +${exp}！`);
  };

  const handleDecision = (value: YueshaChoice) => {
    const result = commitCharacterLife({ type: 'yuesha-choice', choice: value });
    if (result === 'applied') {
      setFeedback('月纱记住了你的选择。');
    }
  };

  // Icon mapping helper
  const renderIcon = (name: string, className = 'size-4') => {
    switch (name) {
      case 'Shirt': return <Shirt className={className} />;
      case 'Search': return <Search className={className} />;
      case 'Coffee': return <Coffee className={className} />;
      case 'Mail': return <Mail className={className} />;
      case 'Cat': return <Cat className={className} />;
      case 'Bed': return <Bed className={className} />;
      case 'MessageSquare': return <MessageSquare className={className} />;
      case 'Moon': return <Moon className={className} />;
      case 'BookOpen': return <BookOpen className={className} />;
      case 'Heart': return <Heart className={className} />;
      default: return <Search className={className} />;
    }
  };

  return (
    <div
      data-testid="yuesha-private-room"
      className="relative flex min-h-[90vh] w-full flex-col overflow-hidden rounded-2xl border border-gothic-brass/80 bg-[#0d0813] text-[#fae5c8] shadow-[0_20px_60px_rgba(0,0,0,0.95)]"
    >
      {/* 1. 顶部导航与资源栏 Header */}
      <header className="z-20 flex flex-wrap items-center justify-between gap-3 border-b border-gothic-brass/40 bg-[linear-gradient(180deg,#1e1223f0,#120b18e6)] px-4 py-2.5 backdrop-blur-md sm:px-6">
        {/* 左侧 Logo */}
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-full border border-gothic-gold/70 bg-gothic-wine/80 shadow-[0_0_12px_rgba(240,197,136,0.3)]">
            <Moon className="size-5 text-gothic-gold" />
          </span>
          <div>
            <h1 className="text-sm font-bold tracking-widest text-gothic-glow sm:text-base">
              怪物公寓
            </h1>
            <p className="text-[9px] tracking-[0.2em] text-gothic-muted uppercase">
              MONSTER APARTMENT
            </p>
          </div>
        </div>

        {/* 中间 页面导航 */}
        <nav className="hidden items-center gap-4 text-xs sm:flex md:gap-6">
          <Link href="/" className="flex items-center gap-1.5 text-gothic-ivory hover:text-gothic-glow">
            <Home className="size-4 gothic-gold-icon" /> 大厅
          </Link>
          <Link href="/workshop/" className="flex items-center gap-1.5 text-gothic-muted hover:text-gothic-glow">
            <Hammer className="size-4 gothic-gold-icon" /> 工坊
          </Link>
          <Link href="/orders/" className="flex items-center gap-1.5 text-gothic-muted hover:text-gothic-glow">
            <Scroll className="size-4 gothic-gold-icon" /> 委托
          </Link>
          <Link href="/characters/" className="flex items-center gap-1.5 text-gothic-muted hover:text-gothic-glow">
            <BookOpen className="size-4 gothic-gold-icon" /> 图鉴
          </Link>
          <Link href="/town/" className="flex items-center gap-1.5 text-gothic-muted hover:text-gothic-glow">
            <Compass className="size-4 gothic-gold-icon" /> 探索
          </Link>
          <button type="button" className="flex items-center gap-1.5 text-gothic-muted hover:text-gothic-glow">
            <Settings className="size-4 gothic-gold-icon" /> 设置
          </button>
        </nav>

        {/* 右侧 资源栏 & 快捷工具 */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-gothic-brass/50 bg-[#190d1f] px-3 py-1 text-xs font-semibold">
            <Coins className="size-4 text-amber-400" />
            <span>128,650</span>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-gothic-brass/50 bg-[#190d1f] px-3 py-1 text-xs font-semibold">
            <Gem className="size-4 text-sky-400" />
            <span>3,240</span>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-gothic-brass/50 bg-[#190d1f] px-3 py-1 text-xs font-semibold">
            <Sparkles className="size-4 text-purple-400" />
            <span>18</span>
          </div>

          <div className="ml-2 flex items-center gap-2">
            <button
              type="button"
              className="relative grid size-8 place-items-center rounded-lg border border-gothic-brass/60 bg-gothic-panel hover:border-gothic-glow"
            >
              <Mail className="size-4 text-gothic-gold" />
              <span className="absolute -top-1 -right-1 grid size-4 place-items-center rounded-full bg-rose-600 text-[9px] font-bold text-white">
                1
              </span>
            </button>
            <button
              type="button"
              className="grid size-8 place-items-center rounded-lg border border-gothic-brass/60 bg-gothic-panel hover:border-gothic-glow"
            >
              <ShoppingBag className="size-4 text-gothic-gold" />
            </button>
            <button
              type="button"
              className="grid size-8 place-items-center rounded-lg border border-gothic-brass/60 bg-gothic-panel hover:border-gothic-glow"
            >
              <Grid className="size-4 text-gothic-gold" />
            </button>
          </div>
        </div>
      </header>

      {/* 中间 主交互区域 (3栏：左侧角色列表 + 中央主舞台 + 右侧对话面板) */}
      <div className="relative flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* 2. 左侧 角色切换侧栏 */}
        <aside className="z-10 flex shrink-0 flex-row gap-2.5 border-b border-gothic-brass/30 bg-[#140b1a]/90 p-3 lg:w-48 lg:flex-col lg:border-r lg:border-b-0">
          <div className="flex items-center gap-3 rounded-xl border border-gothic-gold bg-gothic-wine/80 p-2 shadow-md">
            <div className="relative size-10 shrink-0 overflow-hidden rounded-lg border border-gothic-glow">
              <Image src={yueshaAvatar} alt="月纱" fill className="object-cover" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-gothic-glow">月纱</span>
                <span className="flex items-center text-[10px] text-rose-300">
                  <Heart className="size-3 fill-rose-500 text-rose-500" /> 15
                </span>
              </div>
              <span className="text-[10px] text-gothic-muted">契约会客室</span>
            </div>
          </div>

          {[
            { name: '泉泡', level: 10, avatar: yueshaAvatar },
            { name: '青枝', level: 12, avatar: yueshaAvatar },
            { name: '炽角', level: 11, avatar: yueshaAvatar },
            { name: '露珠灵', level: 8, avatar: yueshaAvatar },
            { name: '洛缇雅', level: 1, avatar: yueshaAvatar },
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 rounded-xl border border-gothic-brass/40 bg-gothic-panel/70 p-2 opacity-85 transition-colors hover:border-gothic-gold hover:opacity-100"
            >
              <div className="relative size-10 shrink-0 overflow-hidden rounded-lg border border-gothic-brass/60">
                <Image src={item.avatar} alt={item.name} fill className="object-cover" />
              </div>
              <div className="min-w-0 hidden lg:block">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-semibold text-gothic-ivory">{item.name}</span>
                  <span className="flex items-center text-[10px] text-rose-400">
                    <Heart className="size-2.5 fill-rose-500 text-rose-500" /> {item.level}
                  </span>
                </div>
              </div>
            </div>
          ))}

          <div className="flex items-center gap-3 rounded-xl border border-gothic-brass/20 bg-[#110915] p-2 opacity-50">
            <div className="grid size-10 shrink-0 place-items-center rounded-lg border border-gothic-brass/30 bg-black/40">
              <Lock className="size-4 text-gothic-muted" />
            </div>
            <div className="hidden lg:block">
              <span className="text-xs text-gothic-muted">??? 未解锁</span>
            </div>
          </div>
        </aside>

        {/* 3. 中央 主舞台与热点浮层 */}
        <div className="relative flex-1 overflow-hidden min-h-[380px]">
          {/* 背景与立绘 */}
          <Image
            src={moonveilBackdrop}
            alt="会客室背景"
            fill
            priority
            className="object-cover object-[48%_40%] opacity-80"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0d0813] via-transparent to-[#0d0813]/60" />

          <div className="pointer-events-none absolute right-[10%] bottom-0 h-[92%] w-[50%] max-w-[420px]">
            <Image
              src={moonveilBust}
              alt="月纱"
              fill
              unoptimized
              className="object-contain object-bottom drop-shadow-[0_12px_30px_rgba(0,0,0,0.9)]"
            />
          </div>

          {/* 散落的热点图标 (Hotspots) */}
          {YUESHA_HOTSPOTS.map((hotspot) => (
            <button
              key={hotspot.id}
              type="button"
              style={{ top: hotspot.top, left: hotspot.left }}
              onClick={() => handleHotspotClick(hotspot.id, hotspot.text)}
              className={`gothic-hotspot-btn absolute z-10 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold text-gothic-glow shadow-lg ${
                selectedHotspot === hotspot.id ? 'ring-2 ring-gothic-glow scale-110' : ''
              }`}
            >
              <span className="grid size-5 place-items-center rounded-full bg-gothic-wine/80">
                {renderIcon(hotspot.icon, 'size-3 text-gothic-gold')}
              </span>
              <span>{hotspot.label}</span>
            </button>
          ))}

          {/* 观察反馈提示 */}
          {hotspotText && (
            <div className="absolute bottom-4 left-6 z-20 max-w-md rounded-xl border border-gothic-gold/80 bg-gothic-panel/95 p-3.5 shadow-2xl backdrop-blur-md">
              <p className="text-xs leading-relaxed text-gothic-glow" data-testid="yuesha-hotspot-text">
                {hotspotText}
              </p>
            </div>
          )}
        </div>

        {/* 4. 右侧 对话与交互面板 */}
        <div className="z-10 flex w-full flex-col border-t border-gothic-brass/30 bg-[#140b1a]/95 p-4 lg:w-80 lg:border-t-0 lg:border-l">
          {/* 角色标题与心形 Badge */}
          <div className="flex items-center justify-between border-b border-gothic-brass/30 pb-3">
            <div>
              <h2 className="text-lg font-bold text-gothic-glow">月纱</h2>
              <p className="text-xs text-gothic-muted">契约会客室</p>
            </div>
            <div className="flex items-center gap-1 rounded-full border border-rose-500/60 bg-rose-950/60 px-3 py-1 text-xs font-bold text-rose-200">
              <Heart className="size-4 fill-rose-500 text-rose-500" />
              <span>15</span>
            </div>
          </div>

          {/* 经典台词 */}
          <div className="my-3 rounded-lg border border-gothic-brass/40 bg-gothic-panel/80 p-3 text-xs leading-relaxed text-gothic-ivory italic">
            {dialogueResponse}
          </div>

          {/* 功能分类 Sub-tabs */}
          <div className="mb-3 flex items-center gap-1 rounded-lg border border-gothic-brass/30 bg-black/40 p-1 text-xs">
            {(
              [
                { id: 'dialogue', label: '对话' },
                { id: 'gift', label: '礼物' },
                { id: 'wardrobe', label: '换装' },
                { id: 'story', label: '剧情' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 rounded-md py-1 text-center font-semibold transition-colors ${
                  activeTab === tab.id
                    ? 'bg-gothic-wine text-gothic-glow shadow-sm'
                    : 'text-gothic-muted hover:text-gothic-ivory'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 对话列表 (Tab = dialogue) */}
          {activeTab === 'dialogue' && (
            <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
              {/* 初次决断选项 (保留原有保存测试兼顾) */}
              {!choice && (
                <div className="mb-2 space-y-2 rounded-lg border border-gothic-gold/60 bg-gothic-wine/40 p-2.5">
                  <p className="text-[11px] text-gothic-glow">如何看待旧合同的影响？</p>
                  <button
                    type="button"
                    onClick={() => handleDecision('transparent')}
                    data-testid="yuesha-choice-transparent"
                    className="w-full rounded border border-gothic-brass/70 bg-gothic-panel px-2.5 py-1.5 text-left text-xs hover:border-gothic-glow"
                  >
                    “先把真实的合同与影响告诉东街。”
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDecision('careful')}
                    data-testid="yuesha-choice-careful"
                    className="w-full rounded border border-gothic-brass/70 bg-gothic-panel px-2.5 py-1.5 text-left text-xs hover:border-gothic-glow"
                  >
                    “先稳定工坊生产，再作公开承诺。”
                  </button>
                </div>
              )}

              {/* 对话反应提示 */}
              <p data-testid="yuesha-dialogue" className="hidden">
                {yueshaAfterChoice(choice)}
              </p>

              {YUESHA_DIALOGUES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleDialogueClick(item.id, item.response)}
                  className={`flex items-center gap-2.5 rounded-xl border p-2.5 text-left text-xs transition-all ${
                    selectedDialogue === item.id
                      ? 'border-gothic-glow bg-gothic-wine text-gothic-glow shadow-md'
                      : 'border-gothic-brass/40 bg-gothic-panel/70 text-gothic-ivory hover:border-gothic-gold'
                  }`}
                >
                  <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-gothic-panel border border-gothic-brass/50">
                    {renderIcon(item.icon, 'size-3.5 text-gothic-gold')}
                  </span>
                  <span className="flex-1 truncate">{item.text}</span>
                  <ChevronRight className="size-3.5 text-gothic-muted" />
                </button>
              ))}

              <p className="mt-2 text-[10px] text-gothic-muted">
                当前住客 {guests} 人 · 满意度 {happiness}% · 已观察细节 {observed.length}/{YUESHA_HOTSPOTS.length}
              </p>
            </div>
          )}

          {activeTab === 'gift' && (
            <div className="flex flex-1 flex-col gap-2">
              <p className="text-xs text-gothic-muted">选择礼物增加与月纱的亲密度：</p>
              <div className="grid grid-cols-2 gap-2">
                {YUESHA_GIFTS.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => handleSendGift(g.exp, g.name)}
                    className="flex flex-col items-center gap-1 rounded-xl border border-gothic-brass/50 bg-gothic-panel p-2.5 text-center hover:border-gothic-glow"
                  >
                    <span className="text-2xl">{g.icon}</span>
                    <span className="text-xs font-semibold text-gothic-ivory">{g.name}</span>
                    <span className="text-[10px] text-rose-300">+{g.exp} 亲密度</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 5. 底部三栏控制台 Dashboard */}
      <footer className="z-10 grid gap-3 border-t border-gothic-brass/40 bg-[linear-gradient(180deg,#120b18f0,#0a050e)] p-3.5 md:grid-cols-3">
        {/* 栏目 1: 房间切换 */}
        <div className="rounded-xl border border-gothic-brass/40 bg-gothic-panel/60 p-3">
          <h3 className="mb-2 text-xs font-bold text-gothic-glow">房间切换</h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-2">
            {YUESHA_ROOM_SCENES.map((scene) => (
              <button
                key={scene.id}
                type="button"
                onClick={() => setSelectedScene(scene.id)}
                className={`flex flex-col rounded-lg border p-2 text-left transition-all ${
                  selectedScene === scene.id
                    ? 'border-rose-500 bg-gothic-wine/80 ring-2 ring-rose-500/50'
                    : 'border-gothic-brass/40 bg-black/40 hover:border-gothic-gold'
                }`}
              >
                <span className="text-xs font-semibold text-gothic-ivory">{scene.name}</span>
                <span className="text-[9px] text-gothic-muted">{scene.sub}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 栏目 2: 已收集记忆 */}
        <div className="rounded-xl border border-gothic-brass/40 bg-gothic-panel/60 p-3">
          <h3 className="mb-2 text-xs font-bold text-gothic-glow">已收集记忆</h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-2">
            {YUESHA_MEMORIES.map((mem) => (
              <div
                key={mem.id}
                className="flex flex-col rounded-lg border border-gothic-brass/40 bg-black/40 p-2 hover:border-gothic-gold"
              >
                <div className="flex items-center gap-1">
                  <Heart className="size-3 fill-rose-500 text-rose-500" />
                  <span className="text-xs font-semibold text-gothic-ivory">{mem.title}</span>
                </div>
                <span className="truncate text-[9px] text-gothic-muted">{mem.quote}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 栏目 3: 亲密度与送礼 */}
        <div className="rounded-xl border border-gothic-brass/40 bg-gothic-panel/60 p-3">
          <div className="mb-1 flex items-center justify-between">
            <h3 className="text-xs font-bold text-gothic-glow">亲密度 Lv.15</h3>
            <span className="text-xs font-semibold tabular-nums text-gothic-ivory">
              {affectionXp} / 500
            </span>
          </div>

          {/* 进度条 */}
          <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-black/60">
            <div
              className="h-full bg-gradient-to-r from-rose-600 to-amber-400 transition-all duration-300"
              style={{ width: `${(affectionXp / 500) * 100}%` }}
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex gap-1.5 flex-1">
              {YUESHA_GIFTS.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setSelectedGift(g.id)}
                  className={`grid size-9 place-items-center rounded-lg border text-lg ${
                    selectedGift === g.id
                      ? 'border-gothic-glow bg-gothic-wine'
                      : 'border-gothic-brass/40 bg-black/40 hover:border-gothic-gold'
                  }`}
                >
                  {g.icon}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => handleSendGift(50, '月光玫瑰')}
              className="flex items-center gap-1.5 rounded-lg border border-gothic-gold bg-gradient-to-r from-amber-600 to-gothic-wine px-3 py-2 text-xs font-bold text-gothic-ivory shadow-md hover:brightness-110"
            >
              <Gift className="size-3.5" /> 赠送礼物
            </button>
          </div>

          {feedback && (
            <p className="mt-1 text-[10px] text-gothic-glow" role="status">
              {feedback}
            </p>
          )}
        </div>
      </footer>
    </div>
  );
}
