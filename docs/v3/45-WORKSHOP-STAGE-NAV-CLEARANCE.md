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

## 390×844 真实浏览器复核 · 从失败中修复（同轮）

第一次 Desktop Visual Review 的新场景可用性检查发现：PC 验收通过，但手机 390×844 的 Pixi `#stage` 只有 **113.7px**，低于设定的 140px 可用高度门槛。旧 45dvh 的高调度台（约 380px）和横向 HUD 共挤占了生产画面。这属于真实布局不足，不应通过下调测试阈值来掩盖。

再次修复：
- 只在 `max-width:900px` 使用 `--workshop-console-height:clamp(270px,40dvh,345px)`，替换旧 `clamp(300px,45dvh,385px)`，在 390×844 再释放约 **42px** 给画布；保留已有 60px 的统一世界导航安全距离。
- 该高度变量统一驱动 `.console` 和 `.middle` 的边界，删除后方覆盖前方的两套不同手机 clamp 规则，避免画布与控制台不一致。
- 三种调度内容继续以原 `console-tab-equipment/roster/logs` 切换，并保留面板自身滚动；底部自动生产/轮班保持公共操作行，不需要打开某个标签才可使用。
- 仍以 **PC 1440×900 场景可见 / 手机 390×844 画布 >140px / 两种尺寸导航无覆盖且轮班可点击** 为验收标准，后续需要以新一轮实际浏览器测试确认，不能根据 CSS 推算直接标记通过。

此前失败的视觉审核 https://github.com/kunlong-luo/monster-apartment/actions/runs/41804553916 是此问题的可追溯证据；修复后检查结果必须另行判定。

## PC 场景优先二次打磨 · 2026-11-04

- 主分支修复原有底部 Dock 留白后，PC 默认控制台仍使用 `clamp(250px,29dvh,275px)`：在 1440×900 时约 261px，Pixi 场景纵向占比仍偏低。
- 现在只有 `min-width:1100px` 且 `min-height:730px` 的 PC「场景优先」默认态使用 `clamp(232px,27dvh,248px)`；1440×900 的 CSS 预算约从 261px 降至 243px，新增约 18px 场景空间。左右侧栏从 11vw/20.5vw 缩到 10vw/19vw，场景更宽。
- 「详细调度」仍使用旧 `clamp(295px,36dvh,350px)` 完整视图，三名工匠及设备/生产控制不删除。手机（390×844）`clamp(270px,40dvh,345px)` 与世界导航 60px 安全边距不变。
- `e2e/workshop-dock-clearance.spec.ts` 新增 PC 画布宽高、控制台高度、展开/收回的真实 DOM 尺寸验证，并保存 `visual-evidence/workshop/desktop-workshop-{scene,expanded}-1440.png` 两张截图供视觉审查。
- 验收必须由本次提交的 Quality、Desktop Visual Review 与 Pages 状态决定。这里的 18px 是 CSS 预算，不代表 Playwright 已通过，也不代表新增 3D 或更换设备原画。

### 首次 PC 浏览器失败与修复

- 首次视觉工作流 [#41806882160](https://github.com/kunlong-luo/monster-apartment/actions/runs/41806882160) 在四场景冒烟测试中发现第三位工匠卡片下缘为 789px，但面板允许的可视下缘只有 764px；因此 225px 的第一版默认控制台**不合格**。
- 修复不是放宽测试，而是把 PC 默认控制台改为 224–245px 的响应式高度，并简化 PC 三人并排卡片、派工面板内边距/标题间距与底部操作行；在 1440×900 仍比原来增加约 18px 舞台高度。
- 浏览器失败的断言保持不变，必须确认第三张卡片真正处于面板内；新增的场景/展开双截图和 390×844 布局检查也不得跳过。Quality 与 Pages 的成功不等同于视觉验收。

### 第二次 PC 可见性失败与布局收敛

- 第二次视觉审核 [#41807545418](https://github.com/kunlong-luo/monster-apartment/actions/runs/41807545418) 同一断言仍失败：第三张人物卡下缘 778px、面板可视下缘 766px，超出 12px，不能标记通过。
- 更新 PC 默认控制台为 `clamp(232px,27dvh,248px)`，在 1440×900 为约 243px；将派工标题按钮压到 30px，收紧标题与人物卡之间的垂直空隙，保留真人角色头像和三人横排。仍比 V3.90 原 261px 为舞台释放约 18px，并通过左右侧栏收窄增加画布宽度。
- 专项测试对默认控制台设置 <250px 的约束，原有第三位工匠完整可见的断言**没有修改**。最终结果仍以新一轮实际 Playwright 跑通为准。
