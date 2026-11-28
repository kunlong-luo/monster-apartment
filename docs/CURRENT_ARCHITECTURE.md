# 当前架构（R12.91 复审）

现行架构以 V3.109.0、R12.90 主线 `ef5aa5bc01c2d54d52ab7a666ebe3dcafaff7132` 为证据基线。实际 Quality 92/92 组件及样式可达、19 份 CSS、321/321 Vitest；历史实现记录不用于推断当前资产或数量。评分及后续重构优先级见[风险台账](engineering/GAP-REGISTER-2026-11-22.md)。

- Next.js App Router + React + TypeScript strict + Tailwind CSS v4 + Motion；PixiJS 8 独立工坊运行时。根 `package.json` 声明 Zustand 与 Dexie；依赖声明不等同全站实际用法，未完成逐模块使用审计，不再断言不存在。
- 七个游戏路由见[根 README](../README.md)；研究页独立。根布局挂载共享导航、过渡、错误边界、发布提示和工坊自动运行。现行大厅采用顶角地图而非旧底部 Dock，见[现行视觉合同](design/R12-37-CURRENT-VISUAL-CONTRACT-2026-11-24.md)。
- R14.1-U 候选：公寓与工坊统一读取 `engine/src/workshop-engine.ts` 的经营快照，旧 Cozy V1 独立运行退役；旧记录只读保留，不自动兑换。人物收藏和剧情独立领域数据暂保持兼容；本候选尚待完整发布门禁。U04 在共享 HUD 删除旧幸福度/入住图标分支，并在现有 `pnpm audit:engine-paths` 增加退役住房名称、路径和旧键的专项报告/门禁；历史文档及旧档保护测试不属于第二经营引擎，既有只读导出边界保留。U05 已通过专项自动验收（e088d41）：删除四份 CSS 中已退役住房抽屉、警告/救援、旧房门入住状态及专属动画样式；共享故事面板、现行四位人物房门、绘景、研究模式、可达焦点及减弱动效规则保留。现有路径审计对旧住房表现标识新增全仓文本门禁；同 SHA Quality、桌面/手机真实 Chromium、像素和完整玩法已通过；详见风险台账。文本审计不证明任意动态拼接或 CSS 全覆盖，截图已归档但尚未人工阅图。
- `engine/src/runtime.ts`、`engine/src/workshop-lab-stage.ts`、`engine/scripts/build.mjs` 与 `engine/art/` 是当前 Pixi sidecar，不得按名称清除。
- 当前 19 份 CSS（含 `app/globals.css`），全局视觉 token 为 `src/components/game/gothic-premium-tokens.css`。布局导入 tokens、globals、red-gold、desktop-ui；大厅导入 lobby、polish、reference-layout、lobby-navigation；共享导航和图鉴分别导入自己的样式，工人房间仍导入 polish。未证明全量 CSS 规则使用情况，不据数量删除。
- 正式欢迎图/大厅 V4、四间房间观景、PC 工坊与街区新绘景的实际路径见[资源目录](ART-RESOURCE-CATALOG.md)。生产、过渡、审稿、回退分开。房间故事热点与观景层分离；Pixi 精密建造、手机与旧档保持。
- 工程验证按 [迭代手册](engineering/ITERATION-PLAYBOOK.md)，以实际 CI SHA 与浏览器结果为准。

## R12.68 · 组件引用关系

当前已为 app/src、测试、脚本及 Pixi 代码建立只读 [组件引用审计](../scripts/audit-component-usage.mjs)，使用现有 TypeScript AST、tsconfig 路径解析与 CSS 导入关系。结果区分 app 可达、辅助可达、待审不可达；不据文件名删除。R12.68 [实际 CI 日志](https://github.com/kunlong-luo/monster-apartment/actions/runs/45374117852/job/138375617179) 扫描 330 文件、11 app 根、94 模块：93 可达、1 不可达、0 辅助独占，未解析本地引用及未知动态导入均为 0。CSS 选择器级覆盖与非字面量动态引用需后续独立审查。操作规范见[迭代手册](engineering/ITERATION-PLAYBOOK.md)。

## R12.69 · 删除旧召唤与重复图鉴

删除 `src/components/game/character-summon-reveal.tsx`（唯一审计不可达，0 入边），保留 `SummonRitualModal` → `SummonResultStage` → `CharacterContractCard`；现有结果对话框和单抽/十连结算契约不变。`MoonworkWorld` 的正式调用者只传 town/orders/warehouse；`app/characters/page.tsx` 使用 `CharactersSceneRouter` → `CharacterGalleryScene` / `GothicSummonScreen`，原 `world-characters.tsx` 仅因旧分支静态导入而可达。本轮收窄 `WorldArea`，删除该分支、旧房间 URL 手工状态、旧图鉴组件，并从 `gothic-world.css` 删除 31 条仅匹配旧 `.mw.mw-gothic[data-area="characters"]` 根的规则；现行图鉴根为 `.cg-scene`。无范围限定的选择器、19 个 CSS 文件、现有页面样式及其他资源暂保留，等待独立覆盖审查。首轮 [Quality](https://github.com/kunlong-luo/monster-apartment/actions/runs/45374555765) 的静态导出/Pixi/类型/Lint通过，Vitest 319/320；旧迁移测试通过 readFileSync 直接读取已删图鉴（未被 import 图覆盖），Pages 跳过。R12.70 前置修复将断言迁往现行图鉴真实派工链接，保留订单/仓库/旧选择器检查，明确禁止恢复旧文件；后续 R12.70 Quality 三项作业均成功，Vitest 321/321，修复已验证；浏览器和 Pages 独立核对。

## R12.71 · 字节与引用门禁

基线 [R12.70 checks](https://github.com/kunlong-luo/monster-apartment/actions/runs/45375073618/job/138379023352)：328 文件、92 组件及样式、91 app 可达、1 不可达（character-adornment）、0 未解析/未知动态引用。由于 R12.69 遗漏了 readFileSync 直接读取路径，增强引用审计：字面源码路径另列引用与不存在路径，报告不改变 app 可达性；刻意不存在的旧文件断言也可能出现，人工核对后再删除。R12.71 [实际审计日志](https://github.com/kunlong-luo/monster-apartment/actions/runs/45375389700/job/138380152391) 确认 character-adornment 无导入/字面路径引用，R12.72 删除；现行图鉴的装备栏和锻造不变。另增 [媒体字节去重门禁](../scripts/audit-media-duplicates.mjs)，禁止未登记的完全重复跟踪素材，保留唯一现有审稿证据例外。依赖锁职责以根 README 为准。

## R12.72 · 图鉴原生像素预算

`CharacterGalleryArtwork` 将已解码的 naturalWidth/naturalHeight 与实时 DPR 分开存储，通过 useSyncExternalStore 订阅 resize 与 resolution media query；DPR 改变后重绑监听并更新 contain 画框，不重新下载图片，卸载清理监听。预算仍至少按 DPR2，保持原始分辨率上限。Chromium 回归覆盖同一张已加载画作在 DPR3/2 变化时的 CSS 预算和 URL；新增测试待 CI。

## 历史架构演进（原记录，仅供追溯）

## 单一 UI 所有权与样式边界（2026-10）

- React + TypeScript：控制按钮、工匠清单、设备目录、委托面板、仓库数据、资源 HUD。工坊按钮与列表收敛在 `src/components/moonwork/workshop-controls.tsx`。
- PixiJS：独立打包的 2D 场景、机器绘景、角色动画、格子命中和视觉反馈。运行时 `engine/src/main.ts` 只负责挂载、派发指令、暂态选择及本地存档；不得用 `innerHTML` 或逐个更新 React 控件。
- 正式工坊仅挂载在 Next 的 `/workshop/`；`engine/src/runtime.ts`、`engine/scripts/build.mjs` 是必需的 Pixi 资源入口及编译工具，不是旧 UI。
- CSS：共七份，`app/globals.css` 负责 Tailwind 主题；其他文件目前仍包含复杂哥特式绘景、响应式布局与特殊视觉效果。继续将普通控件样式迁移至 Tailwind，但不机械删除已在场景中使用的规则。
- JavaScript：无 `.js`/`.jsx` 正式源文件。六个 `.mjs` 仅用于 lint/PostCSS、构建、资源审核与本地静态服务；这些属于现代 Node 工具链，不需要强制改成 TS。
- 技术债：工坊规则模块及 `engine/src/workshop-lab-stage.ts` 仍按实际职责与缺陷治理。旧 `src/core/cozy-engine.ts` 已在 R14.1-U 候选退役，不恢复或拆分旧系统。工坊 React 与 Pixi 暂态选中状态已采用显式 TypeScript 类型回调接口，不再通过 DOM dataset/custom events 反向读取状态；保留现有存档键及行为。

## 工坊领域模块（第二轮拆分）

- `engine/src/workshop-model.ts`：序列化数据类型、设备/工匠静态配置、经济常数与棋盘拓扑。
- `engine/src/workshop-guidance.ts`：纯函数新手引导、下一步目标；不引用任何 UI。
- `engine/src/workshop-town.ts`：街区交易、每日交易次数、居民委托与材料库存变化。
- `engine/src/workshop-production.ts`：单日产出流水线、原料转移、订单和月纱的结算规则。
- `engine/src/workshop-engine.ts`：设备升级与派工、委托选择、预测逻辑、存档校验；同时重导出原有公共接口，旧模块引用不需要修改。

以上模块不引用 React、DOM 或 PixiJS，且与原 V2 存档 JSON 结构兼容。新领域功能应优先进入职责明确的模块，不继续增加巨型单文件。

## Pixi 场景与 Tailwind 组件边界（第三轮）

- `engine/src/workshop-painted-art.ts`：容错加载绘制 AVIF 贴图；失败时沿用现有 GPU 精灵的安全降级路径。
- `engine/src/workshop-floating-feedback.ts`：临时数字贴图的数量上限、逐帧位移、透明度、生命周期；始终不截获地块点击。
- `engine/src/workshop-shift-effects.ts`：依据已结算的真实班次结果生成产量、缺料、交付提示，不重复触发存档重载时的动画。
- `engine/src/workshop-lab-stage.ts`：仍管理 Pixi 容器层级、场景交互、贴图合成与屏幕自适应；不再重复管理以上三个子模块。
- 库存数字行、快捷链接布局以及行为结果提示改用 React 组件及 Tailwind v4 类；删除 `world.css` 中无引用的 `.mw-stock`、`.mw-message`、`.mw-context-links` 等历史选择器。复杂绘景 CSS 暂时保留。

## 运行时到 React 的类型化同步（第四轮）

- `engine/src/workshop-runtime-contract.ts` 声明 `WorkshopSelectionSnapshot` 和 `WorkshopSelectionListener`，作为 React 与单独打包的 Pixi IIFE 的稳定类型契约。
- `mountWorkshopGame(root, assetBase, onSelectionChange)` 在每次工坊暂态选择变更后调用监听器；React 直接接受对象并比较字段，取消监听器无需清除 DOM 自定义事件。
- `#status`、`#summary` 为运行时保留的明确状态节点；`#stage` 的 `data-*` 属性仍用于场景诊断和 E2E，并不作为 React 业务状态来源。
- `WorkshopAction` 联合类型与 `WorkshopRuntimeController.dispatch` 是 React 按钮到运行时的唯一指令通道。工坊按钮的 `onClick` 直接发命令，已经去除 root DOM 点击委托、CSS 选择器查找与 `data-worker/data-build` 输入解析。Pixi 地块仍使用自己的 pointertap，不改变生产或存档模型。

## 场景快捷入口的样式所有权（第四轮）

角色图鉴的派工链接、订单/仓库绘景上的快捷入口统一使用 `world-primitives.tsx` 的 `WORLD_LINK_CLASS` Tailwind v4 组件样式，不再依赖 `gothic-world.css` 中覆盖按钮的 `!important`。已删除 `world.css` 的未使用 `.mw-action-button`、旧工匠链接和快捷入口规则。

## 类型化工坊指令通道（第五轮）

- `engine/src/workshop-runtime-contract.ts` 定义可穷尽的 `WorkshopAction`（选择工匠/设备、移动、升级、拆除、生产、重开、月纱接单与补货）及 `WorkshopRuntimeController`（`dispatch`、`destroy`）。
- React 通过 `gameController.current?.dispatch(action)` 调用运行时；由生命周期内的 controller 同时负责卸载销毁，不向 `window` 暴露全局游戏实例。
- 控件的 DOM `id` 和 `data-testid` 保留以兼容样式与测试，但不再被逻辑事件委托读取。初始角色导览、Pixi 地块点击、订单自动结算、已有 V2 存档不变。

## 大厅主绘景清晰度与返回路由（第六轮）

- `public/lobby-hero.webp` 用 Next 静态图导入，`next/image` 的 `unoptimized` 保留原始像素，生成的图片 URL 由构建系统正确处理 GitHub Pages basePath，不再拼接相对于路由的 `./lobby-hero.webp`。
- 工坊低像素原型图不再作为大厅备用贴图；图片不可加载时退回无模糊的暗色渐变。主绘景不应用持续性 scale/translate GPU 重采样。
- 鼠标轻微互动只移动烛光/氛围图层；雾层使用渐变羽化，不给整屏增加模糊滤镜。
- `gothic-lobby.spec.ts` 检查从工坊返回大厅后主图完成解码、URL 与像素尺寸不变。

## 大厅沉浸式 HUD 精修

- `GothicDock` 支持可选 `compact`，仅大厅启用较小的半透明哥特纹章导航，不影响其他场景控制尺寸；键盘聚焦和文字仍完整。
- 缩减大厅右侧快捷入口与底部任务条的覆盖面积，不再为大厅主画增加额外 dashboard 大卡片。对比度与夜色玻璃质感保留。

## 跨场景导航与清晰背景（第七轮）
- 根布局挂载单一常驻 `GothicRouteTransition`；只在七个正式路由间切换时运行暗金场景幕，不阻拦 Next 路由或历史返回，也不把主绘景缩放、模糊。尊重系统/游戏减弱动效偏好；跳转失败最多 1.7 秒自动复位且永远不截获输入。
- `gothic-apartment.tsx` 与 `world-ui.tsx` 同大厅一样静态导入高质量 WebP，用编译后的图片 `.src` 生成背景 URL，消除 `../lobby-hero.webp` 在无结尾斜线的浏览器路径下指向错误目录的问题。
- 工坊标题区新增可访问的直接“返回大厅”，避免多次跳转才能回首页；`GothicDock` 增加轻微悬停辉光、按压回馈且保留 reduced-motion 行为。
- Playwright 新增往返公寓/工坊/大厅、链接无阻挡、禁用动画以及各正式场景背景解析检查。

## 月光和烛火层次（第八轮）

- 大厅与公寓共享 `GothicSceneIllumination` 透明装饰层：克制的金属边线、渐变月光束、左右烛光光晕。只动画光照（Motion），不变换主背景纹理，不做整屏 CSS Blur，不盖住交互目标。
- `ga-backdrop` 取消 `scale(1.017)`，避免二次重采样影响返回公寓的清晰度。
- 用户关闭动态特效、系统 Reduced Motion、公寓暂停时不会继续播放烛光循环动画。
- `GothicAtmosphere` 补充异步卸载保护，不再在切页后给已卸载的舞台 DOM 写错误标记。保留已有 PixiJS 运行时与存档。
- Vitest 与 Playwright 补充双场景主图清晰度、层级、动画偏好和返回路径的回归检查。

## 动效与 HUD 质量门禁（第九轮）

- 大厅主线任务使用真实存档的库存、订单目标计算进度条，并在库存已满足时显示就绪状态。数值经过 0～100% 限制并提供原生 progressbar ARIA 信息，不增加多余操作按钮。
- 地图弹窗移除重复的委托入口。原有路由和游戏数据不变。
- `GothicRouteTransition` 监听 document 冒泡点击，让 React/Next 以及控件的 `preventDefault()` 先运行；阻止跳转不再触发暗金遮罩。历史返回只用 pathname 的入场渐隐，避免 popstate 的离场状态覆盖入场。过渡仍然永远不可点击且有兜底恢复。
- Playwright 检查导航取消、真实任务进度、历史往返和弹窗入口去重。

## 第九轮原画实装与真实任务 HUD

- `public/art/lobby-hero-v2.webp`：去除烘焙假 UI 后的哥特城堡/月纱双光源绘景，1030×645；替换大厅、公寓、街区/委托/角色/仓库及工坊 React 外层背景，原全屏 SVG/AVIF 原型背景不再充当主大厅绘景。
- `public/art/yuesha-portrait-v2.webp`：450×510，替换大厅头像、公寓头像、角色页及工坊委托肖像。
- `public/art/yuesha-bust-v2.webp`：620×560，用作大厅和公寓的大尺寸月纱对话视觉。三张均为 AI 生成的有背景平面绘景，**不冒充透明分层动作精灵**。
- 窄屏（宽度 700px 及以下）使用约 25% 的图片水平焦点，让月纱在竖屏裁切下继续可见，普通大屏保持 full-cover。
- 新图的 WebP 容器魔数、VP8 帧尺寸与合理大小由 Vitest 验证；Playwright 验证浏览器实际解码的像素分辨率与手机裁切位置。
- `WorkshopClient` 继续使用独立 PixiJS 舞台和原存档，只把其 React UI 背景/委托肖像改成新图，并移除过渡状态导致的旧肖像闪现。
- 旧 `engine/art` 极小 AVIF 仅留给 Pixi 内部待迁移贴图，不会从仓库强行删除造成运行时丢资源。

## PixiJS 工坊场景性能与绘景（第十轮）

- 新版 `lobby-hero-v2.webp` 同步加入独立的 PixiJS sidecar 资源目录。工坊绘景优先解码正式 WebP，旧 AVIF 与 Canvas 程序图仅作为非致命回退；`data-backdrop-source` 可观察真实来源。
- 15 个地块的地面图、编号与交互边框独立放进持久的 `foundation` Container；生产结算/建造/派工只更新地块色调，并重建确实变化的设备和工匠视觉，而不再销毁重建全部基础地砖。`data-foundation-tiles` 保证总数稳定。
- Pixi 的粒子、物流光点、机器轻摆、工匠角色动画遵守操作系统 Reduced Motion 与游戏保存的动效开关。关闭动效时仅保留非装饰的生产反馈计时；后台标签页则暂停 WebGL ticker。切换可恢复，切页移除事件监听。
- 不改变地块的 Pixi 点击坐标、命中层、交易/生产引擎、世界存档或 HUD 标签。
- Playwright 新增减少动效、持久地砖、回大厅后再进工坊与存档持久的回归检查。

## 第十一轮：图像失真修复与月纱美术统一
- 大厅、公寓、月光街、角色页和工坊 React 背景切换为同一张 1587×991 WebP 原画；另有匹配的 500×500 专用头像与不同裁切比例的肖像，避免在 60px 头像、130px 对话和全屏背景之间拉伸同一张贴图。
- PixiJS 工坊的正式场景优先读取 `lobby-hero-v3.webp`，资源解码失败则回退 V2 WebP、旧 AVIF、程序地景；工坊角色月纱优先显示以圆形 Graphics mask 裁切的 `yuesha-avatar-v3.webp` 徽章，而非把有背景的平面肖像强行拼成行走人物。旧动画角色保留资源失败时的后备。
- 委托状态及选中回调、全部存档键、工坊生产规则和场景导航保持不变。测试覆盖浏览器原生图像分辨率、WebP 文件有效性、月纱访客徽章及路由往返。

## R12.74 · 目录所有权

根目录白名单 12 个，详见根 README；不再保留 AI Studio 临时方案、重复历史任务表、无运行入口 TSX 原型、旧 Gemini 配置与单独的 artwork 元数据目录。旧归档索引进入 docs/art-reviews，历史证据在固定 Git SHA。`engine` 是实际运行时及构建链；迁移保留原有相对目录、公开 URL 和存档键，候选须通过所有相关检查。

## R12.75 · 工坊文档与运行边界

旧 V2 路由说明和独立实验路线已退役（[固定快照](https://github.com/kunlong-luo/monster-apartment/tree/e4d74994de44989f3e16296caf9f85e118ab807c/v2/docs)）。当前 Next 七路由、Pixi IIFE、React 挂载/销毁、静态资源同源、现有端口和双存档键依本架构、实际代码与工作流；不恢复独立 HTML。工坊资产制作统一至 [设备规格](design/WORKSHOP-ASSET-SPEC.md)。`pnpm audit:engine-paths` 为后续迁移提供逐文件引用报告；R12.75 时位置仍为 `v2/`；R12.76 已通过四项候选检查并合并 f3a3b70，完整目录迁到 `engine/`，旧路径仅属于历史；主线 Quality、Pages、性能基准和 WebGL 生命周期已通过。

V3.109.0 已发布（80eb69a）：仓库需求/采购预览复用 engine 的 importPatronCore 与 forecastPatronCommission；公寓 HUD 共存仅显式审稿临时状态；工坊 Motion 粒子只读工作状态和预测产量，均不另建存档、经济或运行引擎。

## R12.89 · 现行大厅导航与 CSS 残留收敛

基线 `b70830c` 的 [Quality checks](https://github.com/kunlong-luo/monster-apartment/actions/runs/45554784920/job/139004104218) 实测扫描 333 文件、11 app 根、92 组件及样式模块，92 app 可达、0 辅助独占、0 不可达、0 未解析本地引用、0 未识别非字面导入/可能 glob；Vitest 64 文件/321 测试全通过。模块级可达不证明所有导出、props 或 CSS 选择器有效，不能因治理目标强删组件。

逐份检查 80 个 app/src/engine/src TSX、19 个 CSS、16 个相关导航/设计测试及审计脚本的旧 dock 类名与 GothicDock 调用：现行 GothicDock 只在大厅调用，使用 quick/map 系列类；退役的 `gothic-dock__link`、`__icon`、`__subtitle`、`__label` 无 TSX 输出或相关测试引用。清除 token CSS 的七个仅旧 link 规则及两处选择器列表的旧成员、red-gold 的一条旧 label 规则、公寓空 media 块；移除 GothicDock 未解构/无调用的 compact 可选参数。保留所有当前导航类、仍可能匹配当前 DOM 的通用 dock 规则、设计变量、焦点与 reduced-motion 有效规则、七路由、19 份 CSS、游戏存档及美术审批。历史“七份 CSS”和 compact 说明仅为当时快照，不是现行接口。此次未穷尽非 TSX 动态类生成或全部 CSS 覆盖；新 SHA 的 CI/视觉验收独立记录。

R12.95：历史 V2 月纱头像与胸像路径不再存在于工作树，原字节在 [固定历史提交](https://github.com/kunlong-luo/monster-apartment/tree/87a37023dcc5161696aab9fe006749f3a5a04bb4/public/art)；V3 与必要 Pixi V2 大厅回退仍保留。

## R12.104 · 现行职责与验收

现行组件审计证据与媒体路径见资源总目录；92 个组件/样式模块可达不代表每条 CSS 选择器有效，动态资源及样式细粒度核查仍待执行。

[美术资源总目录](ART-RESOURCE-CATALOG.md)：完整迁移经过、失败修复和审计证据统一保存在资源总目录；清理前各文档的完整版本见 [372f26f 固定快照](https://github.com/kunlong-luo/monster-apartment/tree/372f26f28933050840b6c6f8ff5f18ed99075e44)。不再逐轮复制报告。

## R12.105 · CSS 与动态资源专项核查

基于 PR #61 的 372f26f：逐份读取全部 19 CSS（Git tree 281603 B）。单一 :root 色板在 gothic-premium-tokens.css；扫描 :root 内 --craft-*、--moon-ui-*、--color-gothic-* 声明未发现重复，19 份 CSS 未发现字面 url(...)。文本计数 407 处 !important，其中 summon-screen.css 124、gothic-desktop-ui.css 118、gothic-red-gold.css 97，共 339（83.3%）。这些是级联风险热点，不等于无效选择器；最大文件 gothic-workshop.css 49760 B。先按实际七路由、PC/手机、交互状态及审稿状态建立覆盖证据，再逐组消除覆盖，禁止全局批删或为少量样式引入新依赖。保持唯一色板、当前布局和审批不变。

动态 URL：现有 siteAssetUrl、roomScenicArt、workshopAssetRoot 各自承担公开路径、私室分层、Pixi sidecar 目录职责。旧 site-asset-url 测试使用已退役的月纱样例但没有检查文件存在。本候选改用真实现行路径，增加 5 卡及 5 卡池头像、四房 8 个观景图的 WebP 文件头与 Pages 前缀/idempotence 测试，并覆盖末尾斜杠、协议相对和 data URL。未改运行逻辑；新测试尚未执行，需独立 Quality。

### R12.106 · 召唤移动断点覆盖收敛（候选）

检查 summon-screen.css 两个 max-width:600px 区块，后置 V3.58 紧凑 HUD 规则在同断点覆盖早期 header、首个子区、center、quote、title 及底部操作区属性。仅移除前置明确被后置同选择器（或更高优先级同目标声明）覆盖的 14 项声明；不改后置值、桌面断点、相邻有效规则、角色/卡池/稀有度及抽卡逻辑。该文件 !important 124→116；保留所有真实胜出的声明，不盲目取消强制覆盖。现有 320×700/390×844 浏览器 HUD 测试补充 header 高度 88px、padding 4px 8px、首子区 min-width 0、卡池 72px 计算样式检查，并接入 Desktop Visual Review 定向步骤。尚未执行候选浏览器，不能声称视觉完全一致。

R12.107：R12.106 的 14 项早期覆盖声明删除已通过原 d94bbdf 桌面和 Quality 检查；完整回归仅旧胸像 fixture 失败，已继承主线修复。合并候选继续独立验收。本轮不继续叠加全局 CSS 改动，避免扩大发布风险。

### R12.108 · 桌面覆盖收敛（候选）

逐份核查 gothic-desktop-ui.css 与 gothic-red-gold.css 中相同选择器/媒体条件的重复规则：前者 5 组，后者 0 组（不表示无跨文件覆盖）。仅删除前者 16 项被后置同目标声明完全覆盖的前置属性，包括派工网格、工人按钮、hover/focus/pressed、头像尺寸及市场图标 flex-basis/尺寸；保留后置有效值、过渡动画、不同高度断点和其他样式，不改游戏逻辑、资源或存档。!important 118→112，现有 Desktop Visual Review 覆盖 1440×900 工坊三工人一行、月光街门户、390×844 手机及七路由；本候选尚须独立 CI，未声称视觉一致。保留 gothic-red-gold.css，不凭文本统计删有效兼容规则。

R13.0-G：R12.108 原候选 65b7ace 的 Quality 45615216421、Desktop 45615216278、Gameplay 45615216586 均成功；现复用原验证分支并继承最新 R13 主线。CSS 使用原候选 Git blob，不覆盖任何新 G1/CG 工具或原画；合并候选须新 SHA 独立验证。


R14.1-U06 专项已验收（231f000）：大厅不再以未持久化 `newWorkshop()` 代替共享存档余额，而通过既有 `ensureWorkshopWorld` 锁定初始化；无有效快照时显示不可用，不展示虚假委托奖励。工坊 HUD 星币也只取有效共享快照。交易仍走原领域 reducer 与同一存档锁，恢复边界不变。现有浏览器 spec 的双端跨页交易、失败写入、余额不足、真实委托奖励及损坏档保护已随同 SHA 四项 CI 通过（301 Vitest、200 浏览器通过/3 条件跳过）；175 份运行源码及样式已完成已知标识专项扫描。并发与完整恢复仍分别由 U10/U12 验收；细项及证据见风险台账。

R14.1-U07 修复候选：现行经营日由 `WorkshopState.day` 唯一持有，手动轮班走 `runShift`，物理自动生产只执行机器节拍，明确开启自动履约后才通过 `advanceSafeAutoContractDay` 使用真实库存安全推进；同一事务锁与现行保存键保持。工坊 HUD 不再以准备模型 `newWorkshop()` 展示无效日期，无有效快照不渲染委托剩余日与轮班报告，月纱台词提示记录不可用。扩展原有双端 E2E：实际手动轮班跨七路由、真实自动履约缺货等待/购买/写入失败/重试成功/关闭及刷新，另补损坏记录日期不可用断言。测试中的加速仅设置自动履约时间戳，不直接修改结算结果。当前仅候选，尚待同 SHA CI 与完整审计；详见风险台账。

U07 补充修复：历史手动报告 `last` 没有记录日期，自动履约推进后仍保留原报告，不能使用 `world.day - 1` 伪造报告日期。生产日志改为稳定标记“手动轮班”，上一班诊断不再称作今天；不新增历史日期字段或改存档。补充实际引擎推进的 Vitest 回归，待同 SHA 运行。

U07 继续复验：eabc5ab 同 SHA 四项 CI 成功（302 Vitest、202 浏览器通过/3 跳过），但全仓日期专项发现 Pixi 及电影式场景均将自动履约日期增长误判为手动轮班，重播保留的 last 报告；电影式章节标题还可能显示准备模型日期。复用现有 stage-diff 表现模块的单日手动转移判定，两场景只在直接观察到关闭自动生产的真实单日手动转移时重播，不从自动履约、初始化或跨日跳变推断产出；未就绪章节日期显示不可用。新增既有 Vitest/E2E 中的手动后连续自动履约回归。无新保存字段或时间规则，最新修复候选须独立 CI。

U07 Lint 修复候选：电影式场景不在 effect 内同步更新轮班表现状态；改为共享快照输入身份变化时受条件保护的 React render-time state adjustment，保留 `isObservedManualShift`、首次加载/自动履约不重播及动画完成清理。仅表现状态，不写经营快照。前一 SHA Quality 因 react-hooks/set-state-in-effect 失败，新 SHA 需重新完整验收。
