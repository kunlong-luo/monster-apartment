# 工坊 · 压缩过时 Dock 留白并归还生产场景视野

**日期：2026-11-04** · **范围：正式 /workshop/，PC 1440×900、1672×941，手机 390×844**

## Critique

V3.90 虽已将工坊默认调整为「场景优先」并允许点击「详细调度」展开三栏调度台，但 CSS `gothic-workshop.css` 仍保留先前全宽七入口底栏的导航占位：
- 桌面 `--workshop-dock-clearance: 108px`
- 窄屏 `--workshop-dock-clearance: 84px`

而 V3.21 后**全宽 Dock 仅在大厅存在**，工坊实际只显示根布局统一的两个小型「大厅 / 地点」按钮，固定左下。旧高度依然进入 `.middle` 的 bottom 计算，真实 Pixi 设备画布因此被无意义地压缩。继续调小字体和缩卡片不会解决这个空间浪费。

## Polish

- 将变量重命名为 `--workshop-scene-nav-clearance`，与真实唯一根导航组件对应；桌面 64px、767px 以下 60px。该数值与 safe-area、`--workshop-stage-gap` 一起计算，避免控制台挡住左下入口。
- 保留 `--workshop-console-height`、原来的「场景优先/详细调度」切换和 ResizeObserver，调整的额外空间完全归还中间生产场景；不改变设备建设、三名工匠派工、自动生产、手动轮班、委托或存档。
- 在 1440×900，设计上较旧版增加约 **44px** 实际场景高度；在 390×844 增加约 **24px**。这些是 CSS 计算所释放的尺寸，不代表已经换了美术原画，也不能代替真实浏览器视觉验收。
- 不创建新导航、不引入新库；继续复用 `GameSceneNavigation` 和统一暗金材质。

## Audit

- `e2e/workshop-dock-clearance.spec.ts` 验证两个屏幕宽度的真实 DOM 盒子、实际场景高度、控制台与导航之间 4–28px 的可见分隔、页面横向溢出和轮班按钮 hit test。
- `Desktop Visual Review` 加入本专项，且保留三名工匠、Pixi 场景、自动生产、A05 截图与七路由检查。
- 判定通过需要 Quality + GitHub Pages 成功；视觉工作流另行报告。在线截图人工复核不能只依靠静态 CSS 推断。

后续仅在确认该版布局无回归后，再评估是否将 PC 的三栏调度改成常用的二栏/按需详情面板。不得删去语义不同的自动生产、手动轮班或一键派工。
