export type Locale = 'zh' | 'en';

const catalog = {
  zh: {
    title: '灵核公寓', help: '怎么玩？', hideHelp: '收起帮助', reset: '重新开始',
    language: '语言', saveReady: '本地自动存档', saveUnavailable: '本地存档不可用',
    overview: '经营概况', coins: '金币', occupied: '入住', coinTarget: '目标金币',
    satisfactionTarget: '目标满意度', goalPrefix: '金币需达', satisfactionPrefix: '满意度需达',
    totalDays: '共', pickRoom: '选择房间', room: '号房', occupiedRoom: '已入住',
    vacantRoom: '空房', pickHint: '选择房间，然后从灵核列表安排入住',
    moveHint: '点击另一间房完成搬家/交换', recruitTitle: '已收藏灵核',
    rent: '租金', recruit: '入住', move: '移动 / 交换灵核', cancelMove: '取消调配',
    dailyManagement: '管理面板', baseRent: '基础租金', upkeep: '维护费用',
    synergy: '组合加成', estimated: '预估净入', activeSynergy: '当前组合效果',
    noSynergy: '暂无相邻阵营或属性加成', recruitFirst: '请先安排灵核入住',
    nextDay: '结束今天', emptyLog: '暂无日志', playAgain: '再玩一局',
    win: '🎉 经营成功', lose: '本局未达标',
    howToPlay: '怎么玩？', gameLoop: '核心循环', tenants: '原创灵核',
    synergies: '相邻组合加成', events: '每日事件', moving: '搬家与交换',
    guide1: '先选择一间房，灵核可直接入住。',
    guide2: '将初始赠送的芽核安排入住，或前往召唤所抽取新灵核。',
    guide3: '可以调整灵核的房间位置，尝试阵营和属性共鸣。',
    guide4: '结束今天后可获得召唤券、成长经验与进化精华。',
    guideTitle: '新手引导', guideStep: '步骤', guideNext: '下一步',
    guideSkip: '跳过引导', guideReplay: '重新查看引导', guideDone: '完成引导',
    event1: '第 1 夜：守护职业灵核可化解夜间访客危机',
    event2: '第 2 夜：潮属性或修缮职业能修复能量管路',
    event3: '第 3 夜：探索职业或前两夜关怀可处理访客',
    event4: '第 4 夜：焰属性或经营职业修复恒炉',
    event5: '第 5 夜：满意度至少 65 可获得星域评选奖励',
    moveHelp: '选中已入住房间，点击移动 / 交换灵核，再点目标房间。',
    gameplayIntro1: '选择一间空房或已有灵核的房间。', gameplayIntro2: '从已拥有灵核中选择入住，或使用免费召唤券扩充收藏。',
    gameplayIntro3: '通过属性匹配和阵营共鸣优化六间房。',
    gameplayIntro4: '完成五夜经营，获取培养资源并达成经营目标。',
    synergySteam: '同阵营相邻：+4 金币、+1 满意度',
    synergyGuard: '同阵营 2/4/6：激活编组共鸣',
    synergyClean: '岩与潮相邻：+2 金币',
    synergyConflict: '焰与潮相邻：-2 金币、-2 满意度',
    stageTitle: 'SPIRIT CORE RESIDENCE / FLOOR PLAN', stageFloor: '房间布局',
    stageEmpty: '＋ 待入住', stagePick: '点击选择，安排灵核',
    stageFooter: '选择房间 · 灵核调配 · 阵营与属性决定收益', stageRent: '基础租金',
  },
  en: {
    title: 'Spirit Core Residence', help: 'How to play', hideHelp: 'Hide help', reset: 'New game',
    language: 'Language', saveReady: 'Autosaved locally', saveUnavailable: 'Local save unavailable',
    overview: 'Overview', coins: 'Coins', occupied: 'Tenants', coinTarget: 'Coin goal',
    satisfactionTarget: 'Satisfaction goal', goalPrefix: 'Reach', satisfactionPrefix: 'Satisfaction',
    totalDays: 'over', pickRoom: 'Choose a room', room: 'Room', occupiedRoom: 'occupied',
    vacantRoom: 'empty', pickHint: 'Choose a room and place an owned spirit',
    moveHint: 'Select the destination room to move or swap', recruitTitle: 'Owned spirits',
    rent: 'Rent', recruit: 'Place', move: 'Move / Swap spirit', cancelMove: 'Cancel move',
    dailyManagement: 'Management', baseRent: 'Base rent', upkeep: 'Upkeep',
    synergy: 'Neighbor bonus', estimated: 'Expected net', activeSynergy: 'Active combinations',
    noSynergy: 'No adjacent bonuses yet', recruitFirst: 'Place a spirit first',
    nextDay: 'End day', emptyLog: 'No activity yet', playAgain: 'Play again',
    win: '🎉 Success!', lose: 'Goal not met',
    howToPlay: 'How to play', gameLoop: 'The daily loop', tenants: 'Original spirits',
    synergies: 'Neighbor combinations', events: 'Night events', moving: 'Moving and swapping',
    guide1: 'Select a room where a spirit can reside.',
    guide2: 'Place your starter Seedcore or summon more original spirits.',
    guide3: 'Rearrange spirits to create faction and elemental synergy.',
    guide4: 'End the day to earn summoning tickets, XP and evolution essence.',
    guideTitle: 'Getting started', guideStep: 'Step', guideNext: 'Next step',
    guideSkip: 'Skip tutorial', guideReplay: 'Replay tutorial', guideDone: 'Finish tutorial',
    event1: 'Night 1: Guard spirits handle visitors.',
    event2: 'Night 2: Water or Repair spirits restore the energy conduits.',
    event3: 'Night 3: Explorer spirits or earlier care resolve guests.',
    event4: 'Night 4: Fire or Economy spirits repair the forge.',
    event5: 'Night 5: Mood 65+ earns the star-domain award.',
    moveHelp: 'Choose an occupied room, tap Move / Swap spirit, then select a target.',
    gameplayIntro1: 'Choose an empty or occupied room.', gameplayIntro2: 'Place an owned spirit or summon more for free.',
    gameplayIntro3: 'Match elements and factions to enhance the six rooms.',
    gameplayIntro4: 'Manage five nights while growing and collecting spirits.',
    synergySteam: 'Adjacent same faction: +4 coins and +1 mood',
    synergyGuard: 'Same faction 2/4/6 unlocks bonus effects',
    synergyClean: 'Stone + Water adjacency: +2 coins',
    synergyConflict: 'Fire + Water adjacency: -2 coins and -2 mood',
    stageTitle: 'MONSTER APARTMENT / FLOOR PLAN', stageFloor: 'Floor layout',
    stageEmpty: '+ VACANT', stagePick: 'Select to recruit',
    stageFooter: 'Choose rooms · Move spirits · Faction synergy', stageRent: 'Base rent',
  },
} as const;

export type MessageKey = keyof typeof catalog.zh;
export function t(locale: Locale, key: MessageKey): string {
  return catalog[locale][key];
}

const translations: Record<string, string> = {
  '欢迎来到灵核公寓！召唤原创灵核，再将它安排进房间。': 'Welcome to Spirit Core Residence! Summon and place your spirits.',
  '本局已经结束。': 'This run is over.',
  '经营成功！灵核公寓已成为星域热门住所。': 'Success! Your spirit residence is thriving.',
  '五夜结束，尚未达成经营目标。': 'Five nights are over. Try a different spirit formation.',
  '星灯巡夜': 'Star lantern patrol',
  '潮汐泄漏': 'Tidal leak',
  '星轨访客': 'Starpath visitors',
  '灵核互助': 'Spirit collaboration',
  '恒炉停摆': 'Forge blackout',
  '经营稽查': 'Management inspection',
  '星域评选': 'Star-domain awards',
  '守护型灵核安抚了夜间访客，获得 6 金币。': 'Guard spirits reassured visitors and earned 6 coins.',
  '第一夜平静度过。': 'The first night passed quietly.',
  '潮属性或修缮灵核修复了能量管路，获得 4 金币。': 'Water or repair spirits repaired the conduits and earned 4 coins.',
  '能量管路受损，损失 8 金币与 8 满意度。': 'Conduit damage cost 8 coins and 8 mood.',
  '此前的关怀带来协作，满意度 +5。': 'Earlier care brought cooperation and 5 mood.',
  '探索型灵核引导旅人，获得 12 金币。': 'Explorer spirits guided visitors and earned 12 coins.',
  '迷路的访客引发混乱，满意度 -7。': 'Lost visitors caused a disturbance and cost 7 mood.',
  '前几夜的逐利引发稽查，损失 8 金币与 5 满意度。': 'Repeated profit-taking triggered an inspection (-8 coins, -5 mood).',
  '焰属性或经营型灵核恢复能源，获得 7 金币。': 'Fire or economy spirits restored power and earned 7 coins.',
  '设备维修耗费 8 金币。': 'Repairs cost 8 coins.',
  '公寓凭借良好口碑获得 20 金币。': 'A great reputation earned 20 coins.',
  '口碑欠佳，缴纳 10 金币整改费。': 'Poor reviews led to 10 coins in fees.',
};

export function localizeGameText(value: string, locale: Locale): string {
  if (locale === 'zh') return value;
  if (translations[value]) return translations[value];
  const pair = value.match(/^房间 (\d+)-(\d+)：(阵营共鸣|属性干扰|生态协作) (.+)$/);
  if (pair) {
    const kind: Record<string,string> = {
      阵营共鸣: 'Faction resonance', 属性干扰: 'Element clash', 生态协作: 'Ecological teamwork',
    };
    return 'Rooms ' + pair[1] + '-' + pair[2] + ': ' + kind[pair[3]] + ' ' +
      pair[4].replaceAll('金币', 'coins').replaceAll('满意度', 'mood');
  }
  const settled = value.match(/^第 (\d+) 天结算：(.*)，净收入 ([+-]?\d+) 金币。$/);
  if (settled) return 'Day ' + settled[1] + ': ' + localizeGameText(settled[2], 'en') + '. Net ' + settled[3] + ' coins.';
  const opened = value.match(/^第 (\d+) 天：灵核公寓开张，初始资金 (\d+) 金币。$/);
  if (opened) return 'Day ' + opened[1] + ': Opened the residence with ' + opened[2] + ' coins.';
  const placed = value.match(/^第 (\d+) 天：(.+) 入住 (\d+) 号房。$/);
  if (placed) return 'Day ' + placed[1] + ': ' + placed[2] + ' settled into room ' + placed[3] + '.';
  const moved = value.match(/^第 (\d+) 天：调整 (\d+) \/ (\d+) 号房。$/);
  if (moved) return 'Day ' + moved[1] + ': Rearranged rooms ' + moved[2] + ' and ' + moved[3] + '.';
  const dayLog = value.match(/^第 (\d+) 天：收益 (-?\d+)，维护 (-?\d+)，组合 ([+-]?\d+)，事件 ([+-]?\d+)，结余 ([+-]?\d+)。(.*)$/);
  if (dayLog) return 'Day ' + dayLog[1] + ': Revenue ' + dayLog[2] + ', upkeep ' + dayLog[3] +
    ', synergy ' + dayLog[4] + ', event ' + dayLog[5] + ', net ' + dayLog[6] + '. ' +
    localizeGameText(dayLog[7], 'en');
  const strategyLog = value.match(/^第 (\d+) 天：房间偏好 ([+-]?\d+) 金币，满意度 ([+-]?\d+)；经营策略 (steady|festival|savings)，金币 ([+-]?\d+)，满意度 ([+-]?\d+)。$/);
  if (strategyLog) {
    const labels: Record<string,string> = { steady: 'Steady', festival: 'Party', savings: 'Savings' };
    return 'Day ' + strategyLog[1] + ': Room affinity ' + strategyLog[2] +
      ' coins, ' + strategyLog[3] + ' mood. ' + labels[strategyLog[4]] +
      ': ' + strategyLog[5] + ' coins, ' + strategyLog[6] + ' mood.';
  }
  const decision = value.match(/^第 (\d+) 天：夜间抉择 (care|profit)，金币 ([+-]?\d+)，满意度 ([+-]?\d+)。$/);
  if (decision) return 'Day ' + decision[1] + ': Night decision ' +
    (decision[2] === 'care' ? 'Care' : 'Profit') + ', ' + decision[3] +
    ' coins, ' + decision[4] + ' mood.';
  return value;
}
