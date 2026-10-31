---
name: "怪物公寓 · 月蚀契约"
description: "电影式哥特幻想人物收藏与模拟经营，满屏绘景，小型暗金 HUD"
colors:
  night: "#0f0c12"
  panel: "#1b161d"
  wine: "#512832"
  eclipse: "#7d3f4f"
  gold: "#a68d70"
  glow: "#d9c2a1"
  ivory: "#f1e5d6"
  muted: "#bdad9d"
  mythic: "#c98988"
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
**现状记录 + 下一阶段不可破坏的设计规范。** 《怪物公寓》的实际表现来自 `gothic-premium-tokens.css` 的唯一 `--craft-*` 基础、Tailwind v4 与旧 `--moon-ui-*` 的兼容别名、当前七个场景组件及独立绘景资产。这里不虚构现有字体文件，也不假设所有页面已经符合规范。游戏的绘景、交互和收藏画面优先采用 **Experience 模式**；工坊、委托和背包的控件以 **Operate 模式**保持精确。

## Colors
- **底色**：`--craft-night #0f0c12` 是月夜黑紫；`--craft-wine #512832` 是酒红主色，`--craft-wine-lit #6a3741` 只用于神话/月蚀重点。
- **金属**：`--craft-brass #a68d70` 为描边，`--craft-champagne #d9c2a1` 为局部高亮；不是处处大面积金色填充。
- **可读性**：象牙白 `--craft-ivory #f1e5d6` 承担正文，`--craft-muted #bdad9d` 承担非核心标注。背景和文字需按实际渲染检查对比。
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

## V3.76 PC Materiel Refinement
桌面大厅、召唤页与结果卡共享 `gothic-premium-tokens.css` 的旧香槟金（`--craft-champagne`）、低饱和铜线（`--craft-hairline`）、深酒红（`--craft-wine`）、象牙白（`--craft-ivory`）及暗色材质。**背景绘景不整体滤色**，只有 HUD 收敛色相与发光。仅选中导航或十连主按钮允许局部酒红；其余操作回到深色哑光金属。人物与房间原画仍未达到效果图原稿，不能以配色升级冒充 CG 交付。

## V3.77 · 共用材质与架构规则
全站唯一真值：`src/components/game/gothic-premium-tokens.css` 的 `:root`，由 `app/layout.tsx` 唯一引入。`app/globals.css` 的 `--color-gothic-*` 及旧 `--moon-ui-*` 都引用它；旧 `gothic-red-gold.css` 不再定义根级色板。七个场景复用 `GothicDock`、`GothicResourcePill`、`GothicIconButton`、`GothicModal`、`GothicActionButton`、`GothicPanelLink` 的语义类。工坊、月光街、房间可保留不同美术绘景与独立品阶/告警颜色，不得各自设置不同标准文字白、边框金或选中酒红。功能修改时不得改动作/存档/路由。

## V3.87 · 已批准原稿的桌面布局锁定

本次依据**用户此前认可的四幅 1536×1024 哥特大厅 UI 概念图**与 GitHub Desktop Visual Review 的实际 1440×900 截图逐项比较。用户明确指出旧版本已经偏离效果图。旧版的左侧任务 + 召唤两张文本卡、右侧三个小图标按钮不是最终参考布局，不得再恢复为桌面主骨架。

**PC 唯一布局骨架（1440×900 与 1648×928）：**

- **视觉底层**：整屏绘景、人物为主要焦点，无平铺仪表盘。不得再用渐变/纯色块替代已入库图片。绘景首先检查实际 HTMLImageElement.naturalWidth，再验收截图；禁止在图片尚未加载的空白屏上做布局验收。
- **左上**：正式游戏名和玩家头像；其下是月纱、泉泡、青枝、炽角四人肖像竖列，四个入口必须分别打开对应已存在的房间。主线进度为名单下方的小任务卡，不抢占人物列表。不能把大厅左侧重新变成一堆任务或契约按钮。
- **中央**：留出大幅人物与真实绘景空间；月纱的话语泡位于人物右侧留白，点击打开真实剧情对话，不得遮脸。场景主体不能被左/右 HUD 卡盖住。
- **右侧**：一幅大尺寸月蚀召唤肖像活动卡；其下三张带绘景/人物图片的功能海报（工坊、月光街、剧情回顾），每项实际可用。不能简化成右侧三个占据大面积空白的小图标方块。
- **底部**：只有一个七目的地紧凑导航，保持从左到右完整可用。对外复制活动与功能入口只是角色/世界的艺术化宣传，不得叠加第二套底部导航。
- **PC 位置校验**：四人肖像必须在左侧四分之一之内，活动卡与海报在右侧约后三成内，右侧海报自活动卡下方开始并于底部导航前结束。中央对话泡与两侧栏目不得相交；在 1440×900 与 1648×928 用 Playwright 按 boundingBox 自动断言。
- **手机**：继续使用独立紧凑的原两张剧情入口和月纱互动小控件，确保 390×844 无横向滚动；不要为了桌面复刻把桌面巨幅海报硬挤进手机。

**后续约束：** 新功能优先在原有面板内做，而不是改变这组四区位置。CG 画质未达到原图也要如实说明，视觉布局回归不能被写成角色原画重新绘制或“1:1 美术复原”。


## V3.88 · 右侧场景卡真实素材

在 V3.87 锁定的左人像、中月纱、右海报、底导航布局上，只替换右侧工坊与月光街海报的**重复大厅画面**。正式 UI 现在使用 `public/art/feature-postcards/gothic-workshop.webp` 和 `moonlit-street.webp` 两张独立横幅（960×320）。来自 [WineChan Gothic Manor](https://winechan.itch.io/gothic-manor) 页面声称为 public domain / AI-assisted 的资源包；经过源 ZIP、源图 SHA-256 和导出文件 SHA-256 校验，具体见 `public/art/feature-postcards/source-manifest.json`。

两张仅是“入口宣传气氛图”：第一张表现复古操作台，非完整设备工作场景；第二张是夜色哥特建筑，非正式月光街地图。不可用于四间私人房间，不能修改 `public/art/rooms/manifest.json` 审核状态或冒充像素级 1:1。完整工坊锻造 CG、独立夜街远景 CG 仍待制作。

强制测试验证两张图片在 1440×900 与 1648×928 下均能实际加载原生 960px 宽度，两个 `src` 各不相同，入口链接到已有的 `/workshop/` 与 `/town/`；390×844 不加载额外桌面大面板，维持唯一导航和原有存档与交互。


## V3.89 · 分离世界实际场景绘景（不改变首页参考布局）

V3.88 PC 截图表明 `/town/` 左侧曾使用 `lobby-hero-v2.webp`，`/workshop/` 的 Pixi WebGL 画布使用 `lobby-hero-v3.webp`，两个不同场所显示同一位大厅女主。V3.89 为两个正式路由加入**真实 1920×1080** 的独立世界绘景（`public/art/world-scenes/`）；许可声明、源图与输出 SHA-256 见 `source-manifest.json`，原 V3.87 大厅四区版式维持不变。

- 工坊的 React 根背景及 Pixi WebGL 内层绘景同步采用 `workshop-gothic-hall.webp`（哥特室内厅堂）；真实设备的 Pixi 精灵、15 格地块、工匠、自动生产、委托交付均不改动。Pixi 通过 `v2/scripts/build.mjs` 将绘景复制到自己的 `dist/assets/`，优先加载，失败回退 V3/V2 背景及程序画面。
- 月光街的全屏绘景使用 `town-moonlit-gate.webp`（点灯的夜间庄园入口）；右侧仍显示真实市集、今日居民和通往工坊/委托所/仓库的入口。玩家角色封面仍是世界剧情插画，不重复充当背景。
- WineChan Gothic Manor 素材源站声称 public domain 并披露 AI-assisted，真实原图均为 1920×1080。本次图像**仅是独立过渡环境**，厅堂不包含锻造炉、庄园外景也不是完整的商业街地图；不能冒称正式锻造 CG 或街区可导航原画，不可替换已设审核门槛的住客房间图。
- 在 1440×900 的浏览器验收中必须检查 Pixi `data-backdrop-source=world-hall-2k`、`data-runtime-ready=true`、场景图解码 1920px，以及真实交易与七项导航保持运行；移动端继续无重复导航。
