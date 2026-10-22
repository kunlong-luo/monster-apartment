export type Locale = 'zh' | 'en';

const catalog = {
  zh: {
    title: '怪物租客公寓', help: '怎么玩？', hideHelp: '收起帮助', reset: '重新开始',
    language: '语言', saveReady: '本地自动存档', saveUnavailable: '本地存档不可用',
    overview: '经营概况', coins: '金币', occupied: '入住', coinTarget: '目标金币',
    satisfactionTarget: '目标满意度', goalPrefix: '金币需达', satisfactionPrefix: '满意度需达',
    totalDays: '共', pickRoom: '选择房间', room: '号房', occupiedRoom: '已入住',
    vacantRoom: '空房', pickHint: '点击选择房间，再招募租客',
    moveHint: '点击另一间房完成搬家/交换', recruitTitle: '可招募租客',
    rent: '租金', recruit: '招募', move: '移动 / 交换租客', cancelMove: '取消搬家',
    dailyManagement: '管理面板', baseRent: '基础租金', upkeep: '维护费用',
    synergy: '组合加成', estimated: '预估净入', activeSynergy: '当前组合效果',
    noSynergy: '暂无相邻组合加成', recruitFirst: '请先招募租客',
    nextDay: '结束今天', emptyLog: '暂无日志', playAgain: '再玩一局',
    win: '🎉 经营成功', lose: '本局未达标',
    howToPlay: '怎么玩？', gameLoop: '核心循环', tenants: '租客图鉴',
    synergies: '相邻组合加成', events: '每日事件', moving: '搬家与交换',
    guide1: '选择一间房。点击左侧房间按钮，或直接点击公寓里的房间。',
    guide2: '招募第一位租客。每种怪物有不同的价格、租金和特殊能力。',
    guide3: '选择已入住房间并点击“移动 / 交换租客”，然后选择目标房间。',
    guide4: '确认收益后，点击“结束今天”收租并处理夜间事件。',
    guideTitle: '新手引导', guideStep: '步骤', guideNext: '下一步',
    guideSkip: '跳过引导', guideReplay: '重新查看引导', guideDone: '完成引导',
    event1: '第 1 天：石像鬼可以得到 6 金币打赏',
    event2: '第 2 天：史莱姆能修水管，否则损失金币与满意度',
    event3: '第 3 天：幽灵与石像鬼相邻可处理神秘访客',
    event4: '第 4 天：火精灵可以处理供暖故障',
    event5: '第 5 天：满意度至少 65 可以获得奖励',
    moveHelp: '选中已入住房间，点击“移动 / 交换租客”，然后点击目标房间。',
    gameplayIntro1: '选择一间空房。', gameplayIntro2: '挑选一位租客安排入住。',
    gameplayIntro3: '查看组合奖励并根据需要调整布局。',
    gameplayIntro4: '结束今天，结算租金和事件，经营 5 天达到目标。',
    synergySteam: '蒸汽供能：火精灵+史莱姆 +3 租金',
    synergyGuard: '夜间守护：幽灵+石像鬼 +4 租金',
    synergyClean: '整洁石像：石像鬼+史莱姆 +2 租金',
    synergyConflict: '冷热争执：火精灵+幽灵 -3 租金 -4 满意度',
    stageTitle: 'MONSTER APARTMENT / FLOOR PLAN', stageFloor: '房间布局',
    stageEmpty: '＋ 空房', stagePick: '点击选择，安排租客',
    stageFooter: '选择房间 · 搬家后选目标房间 · 布局影响收入', stageRent: '基础租金',
  },
  en: {
    title: 'Monster Apartment', help: 'How to play', hideHelp: 'Hide help', reset: 'New game',
    language: 'Language', saveReady: 'Autosaved locally', saveUnavailable: 'Local save unavailable',
    overview: 'Overview', coins: 'Coins', occupied: 'Tenants', coinTarget: 'Coin goal',
    satisfactionTarget: 'Satisfaction goal', goalPrefix: 'Reach', satisfactionPrefix: 'Satisfaction',
    totalDays: 'over', pickRoom: 'Choose a room', room: 'Room', occupiedRoom: 'occupied',
    vacantRoom: 'empty', pickHint: 'Select a room, then recruit a tenant',
    moveHint: 'Select the destination room to move or swap', recruitTitle: 'Recruit tenants',
    rent: 'Rent', recruit: 'Recruit', move: 'Move / Swap tenant', cancelMove: 'Cancel move',
    dailyManagement: 'Management', baseRent: 'Base rent', upkeep: 'Upkeep',
    synergy: 'Neighbor bonus', estimated: 'Expected net', activeSynergy: 'Active combinations',
    noSynergy: 'No adjacent bonuses yet', recruitFirst: 'Recruit a tenant first',
    nextDay: 'End day', emptyLog: 'No activity yet', playAgain: 'Play again',
    win: '🎉 Success!', lose: 'Goal not met',
    howToPlay: 'How to play', gameLoop: 'The daily loop', tenants: 'Tenant guide',
    synergies: 'Neighbor combinations', events: 'Night events', moving: 'Moving and swapping',
    guide1: 'Choose a room from the room selector or apartment floor plan.',
    guide2: 'Recruit your first tenant. Each monster has a price, rent and special talent.',
    guide3: 'Select an occupied room, tap “Move / Swap tenant”, and choose a destination.',
    guide4: 'Review projected income and tap “End day” to collect rent.',
    guideTitle: 'Getting started', guideStep: 'Step', guideNext: 'Next step',
    guideSkip: 'Skip tutorial', guideReplay: 'Replay tutorial', guideDone: 'Finish tutorial',
    event1: 'Day 1: A golem can earn a 6-coin night-watch tip.',
    event2: 'Day 2: A slime can repair the pipes and prevent losses.',
    event3: 'Day 3: A ghost-golem pair can handle mysterious visitors.',
    event4: 'Day 4: An ember spirit can repair the heating.',
    event5: 'Day 5: Satisfaction of at least 65 earns a reward.',
    moveHelp: 'Select an occupied room, tap “Move / Swap tenant”, then choose a destination.',
    gameplayIntro1: 'Choose an empty room.', gameplayIntro2: 'Recruit a monster to live there.',
    gameplayIntro3: 'Check neighbor bonuses and rearrange tenants.',
    gameplayIntro4: 'End each day to collect rent and face night events. Meet the day-five goal.',
    synergySteam: 'Steam power: Ember + Slime, +3 rent',
    synergyGuard: 'Night watch: Ghost + Golem, +4 rent',
    synergyClean: 'Stone cleaning: Golem + Slime, +2 rent',
    synergyConflict: 'Temperature clash: Ember + Ghost, -3 rent, -4 satisfaction',
    stageTitle: 'MONSTER APARTMENT / FLOOR PLAN', stageFloor: 'Floor layout',
    stageEmpty: '+ VACANT', stagePick: 'Select to recruit',
    stageFooter: 'Choose rooms · Move tenants · Layout affects income', stageRent: 'Base rent',
  },
} as const;

export type MessageKey = keyof typeof catalog.zh;
export function t(locale: Locale, key: MessageKey): string {
  return catalog[locale][key];
}

export const tenantNames: Record<Locale, Record<string, string>> = {
  zh: { slime: '史莱姆', ember: '火精灵', ghost: '幽灵', golem: '石像鬼' },
  en: { slime: 'Slime', ember: 'Ember', ghost: 'Ghost', golem: 'Golem' },
};
export const tenantDescriptions: Record<Locale, Record<string, string>> = {
  zh: {
    slime: '清洁房间；能应对水管事故', ember: '能提供供暖；与幽灵相邻容易争执',
    ghost: '能吸引夜间访客；与石像鬼合作守夜', golem: '能安保；与幽灵相邻有守护加成',
  },
  en: {
    slime: 'Cleans up and fixes broken pipes', ember: 'Provides heat but clashes with ghosts',
    ghost: 'Attracts visitors; guards with golems', golem: 'Provides security and night-watch bonuses',
  },
};

const translated: Record<string, string> = {
  '欢迎入住！选择一间房，为公寓安排第一位租客。': 'Welcome! Choose a room for your first monster.',
  '本局已经结束，请开始新游戏。': 'This game is over. Start a new game.',
  '本局已经结束。': 'The game has ended.',
  '请先选中一个房间。': 'Choose a room first.',
  '不存在的租客。': 'Unknown tenant.',
  '无效房间。': 'Invalid room.',
  '房间已有人。可先搬家或换房。': 'Room occupied. Move or swap its tenant first.',
  '金币不足，无法招募。': 'Not enough coins.',
  '请选择另一间房。': 'Choose another room.',
  '来源房间没有租客。': 'The source room has no tenant.',
  '请至少招募一位租客，再开始结算。': 'Recruit a tenant before ending the day.',
  '恭喜！你经营出了受欢迎的怪物公寓。': 'Congratulations! Your apartment is thriving.',
  '五天结束，经营目标未完成。再试一次不同的布局！': 'Five days are over. Try another layout!',
  '夜间巡逻': 'Night watch', '水管爆裂': 'Burst pipes',
  '古怪访客': 'Strange visitor', '供暖故障': 'Heating failure',
  '公寓年度评选': 'Apartment awards',
  '石像鬼守夜尽责，收到 6 金币打赏。': 'The golem earned a 6-coin patrol tip.',
  '夜晚平静，没有额外收入。': 'A quiet night with no extra income.',
  '史莱姆抢修了管道，获得 4 金币感谢费。': 'The slime repaired the pipes and earned 4 coins.',
  '管道损坏，支付 8 金币并损失 8 满意度。': 'Broken pipes cost 8 coins and 8 satisfaction.',
  '幽灵与石像鬼合作处理访客，收到 12 金币。': 'Ghost and golem handled the visitors and earned 12 coins.',
  '深夜骚动，住户满意度下降 7。': 'A disturbance cost 7 satisfaction.',
  '火精灵及时修好供暖，获得 7 金币。': 'Ember repaired the heating and earned 7 coins.',
  '供暖维修消耗 8 金币。': 'Heating repairs cost 8 coins.',
  '住户对公寓评价不错！奖励 20 金币。': 'The apartment won a 20-coin reward!',
  '口碑一般，缴纳 10 金币整改费。': 'Average reviews cost 10 coins in fees.',
};

function englishTenant(name: string): string {
  return ({ 史莱姆: 'Slime', 火精灵: 'Ember', 幽灵: 'Ghost', 石像鬼: 'Golem' } as Record<string, string>)[name] ?? name;
}

export function localizeGameText(value: string, locale: Locale): string {
  if (locale === 'zh') return value;
  if (translated[value]) return translated[value];
  const bonus = value.match(/^房间 (\d+)-(\d+)：(蒸汽供能|夜间守护|整洁石像|冷热争执) (.+)$/);
  if (bonus) {
    const names: Record<string, string> = { 蒸汽供能: 'Steam power', 夜间守护: 'Night watch', 整洁石像: 'Stone cleaning', 冷热争执: 'Temperature clash' };
    return 'Rooms ' + bonus[1] + '-' + bonus[2] + ': ' + names[bonus[3]] + ' ' + bonus[4].replace('租金', 'rent').replace('满意度', 'satisfaction');
  }
  const hired = value.match(/^成功入住：(史莱姆|火精灵|幽灵|石像鬼)（-(\d+) 金币）$/);
  if (hired) return englishTenant(hired[1]) + ' moved in (-' + hired[2] + ' coins).';
  const moved = value.match(/^(\d+) 号房与 (\d+) 号房的租客已调整。$/);
  if (moved) return 'Tenants moved between rooms ' + moved[1] + ' and ' + moved[2] + '.';
  const settled = value.match(/^第 (\d+) 天结算：(.*)，净收入 ([+-]?\d+) 金币。$/);
  if (settled) return 'Day ' + settled[1] + ': ' + localizeGameText(settled[2], 'en') + '. Net ' + settled[3] + ' coins.';
  const start = value.match(/^第 (\d+) 天：公寓开张，初始资金 (\d+) 金币。$/);
  if (start) return 'Day ' + start[1] + ': Opened the apartment with ' + start[2] + ' coins.';
  const hireLog = value.match(/^第 (\d+) 天：(史莱姆|火精灵|幽灵|石像鬼) 入住 (\d+) 号房。$/);
  if (hireLog) return 'Day ' + hireLog[1] + ': ' + englishTenant(hireLog[2]) + ' moved into room ' + hireLog[3] + '.';
  const moveLog = value.match(/^第 (\d+) 天：调整 (\d+) \/ (\d+) 号房。$/);
  if (moveLog) return 'Day ' + moveLog[1] + ': Rearranged rooms ' + moveLog[2] + ' and ' + moveLog[3] + '.';
  const dayLog = value.match(/^第 (\d+) 天：租金 (-?\d+)，维护 (-?\d+)，组合 ([+-]?\d+)，事件 ([+-]?\d+)，结余 ([+-]?\d+)。(.*)$/);
  if (dayLog) return 'Day ' + dayLog[1] + ': Rent ' + dayLog[2] + ', upkeep ' + dayLog[3] + ', synergy ' + dayLog[4] + ', event ' + dayLog[5] + ', net ' + dayLog[6] + '. ' + localizeGameText(dayLog[7], 'en');
  const strategyLog = value.match(/^第 (\d+) 天：房间偏好 ([+-]?\d+) 金币，满意度 ([+-]?\d+)；经营策略 (steady|festival|savings)，金币 ([+-]?\d+)，满意度 ([+-]?\d+)。$/);
  if (strategyLog) {
    const labels: Record<string, string> = { steady: 'Steady', festival: 'Party', savings: 'Savings' };
    return 'Day ' + strategyLog[1] + ': Room affinity ' + strategyLog[2] +
      ' coins, ' + strategyLog[3] + ' mood. ' + labels[strategyLog[4]] +
      ': ' + strategyLog[5] + ' coins, ' + strategyLog[6] + ' mood.';
  }
  return value;
}
