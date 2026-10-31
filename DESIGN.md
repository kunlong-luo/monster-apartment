---
name: "怪物公寓 · 月蚀契约"
description: "电影式哥特幻想人物收藏与模拟经营，满屏绘景，小型暗金 HUD"
colors:
  night: "#100913"
  panel: "#1e1420"
  wine: "#5c1834"
  eclipse: "#b72d51"
  gold: "#dfb77e"
  glow: "#ffe3b5"
  ivory: "#f7dfc3"
  muted: "#d6b99f"
  mythic: "#ed7e83"
typography:
  display:
    fontFamily: "Georgia, Noto Serif SC, Songti SC, serif"
    fontSize: "2rem"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "0.06em"
  body:
    fontFamily: "Trebuchet MS, Noto Sans CJK SC, Microsoft YaHei, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.6
rounded:
  small: "6px"
  medium: "9px"
  portrait: "14px"
spacing:
  tight: "4px"
  compact: "8px"
  regular: "16px"
  airy: "24px"
components:
  contract-primary:
    backgroundColor: "{colors.wine}"
    textColor: "{colors.glow}"
    rounded: "{rounded.small}"
    padding: "10px 18px"
  contract-secondary:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ivory}"
    rounded: "{rounded.small}"
    padding: "10px 18px"
---

## Overview
**现状记录 + 下一阶段不可破坏的设计规范。** 《怪物公寓》的实际表现来自 `app/globals.css` 的 Tailwind v4 Gothic tokens、`src/components/game/gothic-red-gold.css` 的 `--moon-ui-*`、当前七个场景组件及独立绘景资产。这里不虚构现有字体文件，也不假设所有页面已经符合规范。游戏的绘景、交互和收藏画面优先采用 **Experience 模式**；工坊、委托和背包的控件以 **Operate 模式**保持精确。

## Colors
- **底色**：`--moon-ui-night #100913` 是月夜黑紫；`--moon-ui-wine #5c1834` 是酒红主色，`--moon-ui-eclipse #b72d51` 只用于神话/月蚀重点。
- **金属**：`--moon-ui-gold #dfb77e` 为描边，`--moon-ui-glow #ffe3b5` 为局部高亮；不是处处大面积金色填充。
- **可读性**：象牙白 `--moon-ui-text #f7dfc3` 承担正文，`--moon-ui-muted #d6b99f` 承担非核心标注。背景和文字需按实际渲染检查对比。
- **稀有度**：N 雾银、R 霜蓝、SR 暮紫、SSR 传说暖金、SSR 神话赤红。不得根据卡池主题推断真实品阶。

## Typography
- 剧情标题/角色称号优先中文衬线 `Noto Serif SC` / `Songti SC` + Georgia 备用；功能和交互用 `Noto Sans CJK SC` / `Microsoft YaHei`。
- 不随意引用 CDN 字体，避免 GitHub Pages 首次加载出现闪烁或中文豆腐块。新字体只能以有授权、可随应用分发的文件单独接入。
- 角色名称是主标题，英文契约或说明是配角；不要连用多个很小的眉题、奇怪英文标签和开发用词。
- 复杂数值采用 tabular nums，控制在实际屏幕下不裁切。

## Layout
- **PC 1440×900 基准**：艺术画面为 70% 以上的视觉焦点；顶栏轻、导航贴边，按钮不能铺满整屏。角色卡居中显示，十连缩略图放底部，不遮住主卡。
- **PC 1648×928**：保持同一构图比例，增加的是留白与美术展示面积，不是把侧栏无限加宽。
- **移动 Web 390×844**：精简侧栏，保留一张清晰的主卡、可滚动缩略图及关键操作；不得出现页面级竖向后台长滚动。
- 保持七条路由不变；仅局部对话框可使用 Portal，不能新建重复的导航模式。
- 每张正式角色 CG 必须先有独立的卡面构图验证；现有脸部肖像在大卡里只能作为诚实标注的过渡素材，不做模糊放大/伪全身图。

## Elevation & Depth
- 场景空间深度优先来自实际画面；UI 深度只由**暗表面 + 一道细金边 + 一层有方向柔阴影**构成。
- 聚焦 SSR 可有短暂金色/赤红光晕，但不得盖住人物脸部、文字或眼睛；不要叠加四层外发光做“塑料金边”。
- 材质质感使用低对比度真实绘景、暗铜金属，不用无来源网格、假镜面玻璃、重复径向渐变制造噪声。

## Shapes
- 操作按钮 6–9px 小圆角，人物卡约 14px；圆角不替代哥特纹样。
- 热点、徽章与焦点提示可为小圆/椭圆，但**所有图标必须来自 Lucide 或经授权的游戏素材**。
- 永久禁止 Sparkles 闪光星图标。品阶用 Diamond，神话特写用 Crown，资源用 Gem，月蚀用 MoonStar；所有 icon 只表达语义。

## Components
- `SummonRitualModal`：全屏叙事仪式，四段渐进，提供跳过、减少动态效果，真实概率和扣费绝不在 UI 中重做。
- `CharacterContractCard`：姓名、专属肖像、品阶、实际奖励；人物脸部优先，完整美术占卡面约 70–80%，卡底铭牌紧凑。
- `SummonResultStage`：十连自动揭晓，玩家可以暂停、继续、重播、手动选卡；禁止因自动播放反复结算。
- `GothicDock`：七项稳定导航；尺寸小但有效热区足够，不应成为一排巨型应用卡。
- `WorkshopControls`：自动生产/派工真实可玩，3 人头像清晰，不把三列调度台再次挤成小字。
- 房间场景：环境绘景、人物 Sprite、物件热点分层；热点要与房间建筑布局匹配。

## Do's and Don'ts
- **Do** 保留原已批准截图的布局；先 `critique` / `audit`，然后限定范围 `polish`，用真实浏览器截图验证。
- **Do** 让不同人物具备不同脸型、服饰、光源和房间；优先提升可收藏的人物 CG 和实景素材。
- **Do** 核验 1440×900、1648×928、390×844，检测卡面边界、标题遮挡、图片 naturalWidth、减少动效。
- **Don't** 把通用 SaaS 卡片、紫蓝渐变、彩色状态标签、毛玻璃仪表盘和占位图套进游戏。
- **Don't** 使用 Sparkles 图标、emoji 当导航、无意义重复按钮、多层 `!important` 覆盖或装饰驱动的自制动画框架。
- **Don't** 让设计技能改变游戏结算、存档、人物身份、美术授权或静态发布方式。
