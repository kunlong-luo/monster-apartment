export const CANONICAL_GAME_NAV = [
  { id: 'lobby', label: '大厅', full: '哥特主大厅', glyph: '⌂', href: '/' },
  { id: 'apartment', label: '公寓', full: '经营住客与房间', glyph: '♜', href: '/apartment/' },
  { id: 'workshop', label: '工坊', full: '晶核生产与派工', glyph: '⚒', href: '/workshop/' },
  { id: 'characters', label: '角色', full: '角色与工匠图鉴', glyph: '♟', href: '/characters/' },
  { id: 'orders', label: '委托', full: '契约与特别委托', glyph: '❦', href: '/orders/' },
  { id: 'town', label: '探索', full: '月光街', glyph: '⚜', href: '/town/' },
  { id: 'warehouse', label: '仓库', full: '魔法仓库与物料', glyph: '♧', href: '/warehouse/' },
] as const;

export const WORLD_NAV = [
  { id: 'apartment', label: '公寓', full: '暗夜公寓', glyph: '♜', href: '/apartment/' },
  { id: 'workshop', label: '工坊', full: '晶核工坊', glyph: '⚒', href: '/workshop/' },
  { id: 'characters', label: '角色', full: '角色图鉴', glyph: '♟', href: '/characters/' },
  { id: 'orders', label: '委托', full: '委托大厅', glyph: '❦', href: '/orders/' },
  { id: 'town', label: '探索', full: '月光街', glyph: '⚜', href: '/town/' },
  { id: 'warehouse', label: '仓库', full: '魔法仓库', glyph: '♧', href: '/warehouse/' },
] as const;
