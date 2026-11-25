# 《怪物公寓》快速迭代执行手册

> 生效：2026-11-22。执行性质：常驻规范，和 [AGENTS.md](../../AGENTS.md)、[依赖优先原则](DEPENDENCY-FIRST-FAST-ITERATION.md) 一起使用。以玩家可见的完整小批次替代反复做无效样式微调。

## 0. 一轮迭代如何开始

1. 先读 `AGENTS.md`、`PRODUCT.md`、`DESIGN.md`、[文档索引](../README.md)；对照当前 `main` SHA、最新工作流、目标页面/资源清单，避免沿用旧报告的 SHA。
2. 从 [缺口台账](GAP-REGISTER-2026-11-22.md) 或 Issues 选一个 P0/P1。确认玩家为什么需要、现在哪里坏、如何验证改善；**一次只解决一个可验收问题簇**。
3. 写最小任务卡：`问题/复现 → 目标画面或玩家操作 → 涉及文件 → 不变量 → 通过条件 → 证据路径 → 状态`。若无复现或真实问题，先调查，不要先改 CSS。
4. 先查现有组件/引擎/图片管线/成熟库再动手；能删除重复逻辑就不新增抽象；别重新做一套导航、按钮或游戏状态模型。
5. 实现一个纵向完整切片，随改随做**定向检查**；同轮补文档与状态，不把任务一拆十次只为累计提交数。
6. 根据下面风险矩阵验证，通过后再提交。发布之后核对玩家能看到的实际页面，不把“已经 push”称作“上线”。
7. 用证据更新原 Issue / 任务表、必要 ADR、[缺口台账](GAP-REGISTER-2026-11-22.md)，明确下一轮唯一优先项。

## 1. 工程边界（保留单一事实来源）

| 层 | 维护边界 |
| --- | --- |
| 路由 / HUD | `app/`、`src/components/game/`、`src/components/moonwork/`；统一七路由注册表和全站色板、材质，避免重复底栏 |
| 经营规则 | `src/core/cozy-engine.ts`、`engine/src/workshop-engine.ts` 与其子模块；计算、交易、概率及存档用可测 TS 逻辑 |
| 场景 / 动效 | Motion 管 React 交互动效，PixiJS 8 管工坊 2D 场景；避免 DOM 与 Pixi 双重管理同一个交互控件 |
| 数据 | 保留 `monster-apartment:cozy:v1` 与 `monster-apartment:workshop-v2-lab` 两个既有存档键；未设计并验证迁移前，不擅自统一账本或清档 |
| 素材 | 只通过角色/场景审核流程晋级，记录原生像素、来源、许可、SHA-256、浏览器呈现；不以模糊滤镜、放大或背景换色顶替独立绘景 |

**不得**为新功能重新加入旧版 Vite/Phaser 页、`/classic`、`/legacy` 或独立 `/workshop-lab`。`engine/` 当前仍包含必需的 Pixi sidecar 运行时，不能因为目录名就删掉。

## 2. 快速与安全如何平衡

| 改动类型 | 必做检查 | 视情况增加 |
| --- | --- | --- |
| 纯 Markdown / 规划 | 交叉链接、文档状态、引用路径与事实核对 | 不冒称已跑 Quality / 截图 |
| 普通组件、样式、小修复 | `pnpm check:design`（涉及视觉）、`pnpm typecheck`、`pnpm lint`、相关 Vitest、构建 | 对应 PC/手机截图，验证点击与加载 |
| 七路由 / 首次加载 / 图片回退 | 上述 + 目标场景真实浏览器冒烟、直达 URL / 返回 / 刷新 | `Gameplay Browser Review` 的 `smoke` |
| 抽卡概率、扣费、自动生产、存档/恢复/迁移 | 上述 + 核心不变量和旧档兼容的**定向单测**，所改玩家路径的浏览器验证 | 重大更改执行 `full` |
| 新人物 / CG / 场景原画 | 上述 + 美术入库审计 + 人工身份、画质、武器、授权和真实视口签署 | 不得自动把 `review` 改成 `production` |
| 版本冻结 / 大改版 | `Quality`、相同 SHA 的桌面视觉与 `Gameplay Browser Review full`、人工验收、`Pages` 部署证据 | 记录前后截图、残余缺陷、回退策略 |

`Quality` 当前工作流执行三组作业：`checks`（含依赖/美术/TypeScript/Lint/Vitest）、`pixi-v2-scaffold`、`static-export`。GitHub Pages 只在 `main` push 对应的 Quality 通过后发布；**桌面视觉及 full E2E 并非 Pages 自动发布的必要条件**。不能因为快迭代而省去高风险路径的验证。

## 3. PC 优先，但必须验证手机

- 以用户确认的黑紫/酒红/细金、中央女主人、左右内容区和克制的场景导航为视觉基线；**PC 1440×900 与 1648×928** 优先核对，**手机 390×844 与 390×550** 检查遮挡/触控/裁切。
- 截图必须等关键图片真实解码并记录 `naturalWidth/Height`、URL、可见比例与 DPR；对比参考图的构图，而非只比 CSS 数值。画质不足应先查源图是否有真实细节。
- 图片要独立绘制、具有场景身份；角色 CG 以完整人物为主，不能多人拼版裁切。背景、人物、交互热点分层；UI 不烘焙到画里。
- 交互遵守键盘焦点、屏幕阅读器语义、Esc、触控热区与 `prefers-reduced-motion`；动效不许遮挡按钮或导致重采样发糊。隐藏子节点时检查父层是否仍拦截真实指针；门位/热点须用普通 Playwright 点击，不能用 force 或脚本派发掩盖遮挡。
- 任何 Client Component 的 portal、document/window 访问都须检查直接 URL 的 SSR 与 hydration 路径；复用既有客户端 snapshot 或已存在的安全生命周期。静态导出通过不能替代直接网址浏览器测试，明确观察 hydration 错误。
- 禁用 `Sparkles` / `WandSparkles`。从组件源头修正布局和唯一设计 tokens，不堆叠 `!important` 或新增一套页面菜单。

## 4. 角色与素材生产必须走审核关口

角色从 [G0–G7 SOP](../CHARACTER-CREATION-SOP.md) 和 [设计 Brief](../templates/CHARACTER-DESIGN-BRIEF-TEMPLATE.md) 开始：区分**新人物**与**旧人物新卡**，先锁定人脸/兽耳/角饰身份，再区别姿势、重心、武器、衣装、主剪影和机位。五张卡是四名人物（两张月纱须保持同一脸），不能量产同脸换色。

首期可审核的**原生独立 3:4 至少 1086×1448**；1536×2048 是可选更精细输出，不可插值冒充原生尺寸。艺术研究稿、待审候选、正式运行时素材分清状态。人工未签署，不得提交伪造的批准状态；使用 `pnpm art:cg:review` 只能生成审稿材料，`art:cg:promote` 必须在真实审批后执行。场景另依 [R12 入库方案](../art-reviews/R12-02-SCENE-ART-INTAKE.md) 运行。

## 5. 分支、依赖与速度

- 用户偏好快速主线迭代：当前 `main` 未配置保护时，可针对**低风险的小规模改动**直接提交并看 Quality/Pages；并不表示把失败或未经审核的生产素材直接推入主线是安全做法。
- 对存档、概率、全站导航、付费性质操作和里程碑，优先短命分支 + PR + 对应检查。待 [Issue #9](https://github.com/kunlong-luo/monster-apartment/issues/9) 的保护规则真正启用，**以 GitHub 实际规则为准**，不能为了省一步绕过它。
- 依赖安装以 CI 的 `bun install --frozen-lockfile` 和 `bun.lock` 为可复现基线；`package.json` 当前声明 `pnpm@12.13.0` 用于脚本执行，Pixi `engine/` 使用自己的 npm 构建链。仓库出现多个 lockfile 时先核对用途，**不可盲删/盲重生成**。
- 先查看现有 Next/React/Tailwind/Motion/Pixi/Zustand/Dexie/Lucide 能否解决，再评估新库的维护、许可、安全、包体积、TypeScript 和 Pages basePath；新增依赖记入 ADR，固定可复现版本。
- 不为单次重构写脆弱的源码字符串断言；测试真实的业务不变量和页面行为，不牺牲安全与存档恢复。

## 6. 每轮交付回执模板

`目标：... / 玩家入口：... / 主要改动：...`

`变更：文件路径 / 资源候选与生产状态 / 数据和存档影响：无或明确迁移`

`验证：Quality <SHA+链接或未运行>；目标 Vitest；实际截图 <PC+手机或未完成>；full E2E <必要/不适用/待运行>；Pages <部署链接或未部署>`

`遗留缺口：...；下一项：...；相关 Issue/任务/ADR：...`

**完成定义**：玩家能实际进入并看见改善、关键操作正确、状态不失真、对应风险验证有证据；写了文档或生成了研究图不等于交付完成。

## R12.41 · 场景美术专项验收

Desktop Visual Review 的 `scene-art-review` 与综合 `desktop-review` 并行，各自有独立时间预算和截图证据。场景原画、门位、布局、资源注册改动都触发视觉工作流。六门/原画隔离切片先读独立作业与 `r12-scene-art-review` artifact；完整工作流及全量玩法仍分别记录。取消不等于测试通过；不要为不相关小改动打断关键回归。见 [R12.41](R12-41-INDEPENDENT-SCENE-VISUAL-REVIEW-2026-11-24.md)。


## R12.68 · 组件与样式引用治理

运行 `pnpm audit:components`，机器报告用 `pnpm audit:components --json`；`pnpm test:component-audit` 验证别名、重导出、动态字面量、类型、CSS 导入和辅助代码隔离。复用已安装 TypeScript 的 AST 和解析器，不增加依赖。Quality 执行测试及只读报告。报告以 app 全部模块为保守根，单独计算 tests/e2e/scripts/engine 引用；`review-unreachable` 是待审候选，不是删除授权。非字面量动态导入、未解析本地路径、Next 特殊入口、CSS 选择器、动态 class、资源清单、独立部署和外部调用仍须人工核对；不可据搜索零命中自动删除。删除前按风险验证真实路由与 PC/手机画面。无需为每轮审计增加一份重复报告。


## R12.71 · 防止清理回归

删除组件前除了 import 可达图，还核查 `audit:components` 的 literalReferences、missingLiteralPaths 与实际测试；文件读取、断言、动态路径不是静态 import。缺失路径报告为人工审查项，刻意检查退役文件不存在的测试不得当成运行错误。`pnpm audit:media-duplicates` 检查跟踪素材实际字节，任何新增重复路径都必须复用原件或经过明确路径/哈希例外审查；对应 `pnpm test:media-duplicates` 已接入 Quality。根 pnpm-lock.yaml 仅锁工具 pnpm 12.13.0，根应用依赖由 bun.lock 冻结，Pixi npm 锁独立。三者均保留。


## R12.74 · 目录入口约束

每批结束执行 `pnpm audit:repository-layout`。根目录按职责白名单管理，禁止退役工具目录、旧管理表、旧原型以及 Gemini metadata 回流。源码引用仍依赖编译、组件审计及真实构建验证；目录门禁不自动删除文件。历史任务与问题以固定 SHA 回看，现行仅维护风险台账和 Issues。原画许可/审批证据不得按过期日期随意删除。


R12.75：所有规范归 `docs/`，工坊设备规格为 `docs/design/WORKSHOP-ASSET-SPEC.md`。迁移引擎目录前运行 `pnpm audit:engine-paths`；报告按源码/配置/工作流/测试和文档区分明确引用，只用于评审，不自动改名。保持 npm 独立锁、GitHub Pages 发布 URL、存档键、原图字节及 manifest 状态。


R12.78：文档归并后执行 `pnpm audit:doc-links`，检查根 README、文档总入口、资源目录、运行资源说明、长期策划入口的仓库内相对链接。Git 历史引用使用固定 SHA HTTPS URL，不将历史文档作为现行规范。该检查继承 PR #59 的有效链接门禁思路，不引入重复全量资源库存 JSON 或新的 archive 目录。分支整合须区分 squash 已合并、独有变更、被后续实现替代和待验收；禁止将旧分支整树覆盖 main。

R12.85–86：文档链接门禁由 5 份索引扩至 16 份必需入口，再扩至全部 Git 跟踪 Markdown（自动发现，去重）；新主规范如属必需入口，同步更新 `scripts/audit-doc-links.mjs` 的必需清单。仅核查匹配到的仓库相对链接目标，不检查外链、锚点、引用式 Markdown 或内容准确性。历史报告中的旧路径应按当时事实使用固定 SHA，不为了通过检查恢复废弃目录。删除文档前独立核查其内容、证据和实际引用；链接通过不是删除许可。

R12.87：场景审稿由 Next `useSearchParams` 驱动，保留静态导出所需 Suspense 和 portal hydration 边界；退出用挂载生命周期重置，不在 Effect 内同步级联 setState。PC/手机分别管理 pending/active 本地对象 URL；先取消旧 probe 回调与所有权再释放，解码失败保留旧图，固定仓库 URL 不 revoke。相关 `e2e/r12-local-scene-preview.spec.ts` 覆盖同页 History/Back、延迟解码、退出与对象 URL 释放，修改这些路径须定向回归。历史报告退役不等于删除测试或放宽现行规则；交互合同见 [DESIGN.md](../../DESIGN.md)。

## R12.88 · 工作流和脚本保留边界

现行 GitHub Actions 入口（以实际 workflow YAML 为准）：

| 职责 | 工作流 |
| --- | --- |
| 类型、规则、资源、构建及发布 | [Quality](../../.github/workflows/quality.yml)、[Pages](../../.github/workflows/deploy-pages.yml) |
| PC/手机视觉与玩法 | [Desktop Visual Review](../../.github/workflows/desktop-visual-review.yml)、[Gameplay Browser Review](../../.github/workflows/gameplay-browser-review.yml) |
| 原画像素与来源核查 | [R12 Art Pixel Evidence](../../.github/workflows/r12-art-evidence.yml)、[Gothic Manor Source Review](../../.github/workflows/gothic-art-intake.yml)、[Full ZIP Review](../../.github/workflows/gothic-source-pack.yml)、[Licensed Native 4K Source Review](../../.github/workflows/r12-licensed-4k-review.yml) |
| 工坊性能与 GPU 生命周期 | [Workshop Performance Baseline](../../.github/workflows/workshop-performance-baseline.yml)、[Workshop WebGL Lifecycle](../../.github/workflows/workshop-webgl-lifecycle.yml) |

固定事故 SHA 的一次性恢复任务结束后应退役，不保留可误触发的 pages:write 入口；正常 Pages 仍须等待 main push 的 Quality 成功，保持现有不取消进行中部署的队列。限定候选分支的素材写入工作流在候选分支退役后删除，不放宽权限或分支条件来恢复。保留转换脚本、来源/哈希、生成证据及 CI 审计；历史批次复现使用对应固定 SHA 与工具版本，在隔离工作区执行，不直接重跑覆盖当前 main 资源。手动触发不等于无人使用；删除其他脚本或工作流前须核对 package scripts、工作流、测试、文档、人工入口、输出清单和真实引用。原画来源获取任务仍有独立用途，不能仅因最近失败或非日常调用删除。

R12.89：组件模块可达只是第一层检查；随后按实际调用、导出/props、CSS 选择器和动态 class 分层判断。旧导航只保留现行 quick/map 类与确实匹配的通用规则；删除孤立旧选择器时不得误删逗号列表中的有效成员、焦点、减少动效、媒体查询或 Pixi 动态 class。对可能改变现行级联的样式先做真实浏览器对比，不能凭静态零命中批量删除。现行架构及基线证据见 [CURRENT_ARCHITECTURE](../CURRENT_ARCHITECTURE.md)。

R12.90：新增、移动、删除或重新编码任何受媒体扩展名规则覆盖的 Git 跟踪文件，须同步 [资源总目录](../ART-RESOURCE-CATALOG.md) 第 5 节的路径、字节数、12 位 Git blob 前缀；现有 `pnpm audit:media-duplicates` 检查库存完整性及重复例外，并报告目录体积，现有测试入口覆盖错误记录。旧素材获取工作流若产生新媒体，也须在后续验收前同步该目录；尚未自动接入其写入流程。该门禁不是运行时可达性、原生像素、人审或许可证明；静态 public 资源也不等于每个页面都会下载。不得为让检查通过而改写原始证据或审批状态。

R12.95：纯离线研究图统一到既有 docs/art-reviews/sources，名称加角色/地点 ID；使用原 Git blob 移动而非重编码，同步研究清单、精确路径白名单和文档图片链接，保留哈希。废弃资源仅保留固定 Git 历史链接，不增归档副本；运行/显式浏览器审稿资源仍在 public，正常过渡素材不冒称 production。后续任何重命名须更新第 5 节库存及路径消费者。

R12.96：按业务用途重命名 public 资源时，除了页面导入/动态 URL，须同步相对来源清单、生成脚本 TARGET、工作流 git add、浏览器拦截及路径断言，保持原 blob。保留独立的 A05 历史验收 ID 与截图目录，不以资源命名修改测试语义。

R12.97：将 public/art 顶层业务目录与现存根文件纳入现有 `pnpm audit:repository-layout` 门禁；旧 a05、feature-postcards、任意未登记顶层目录或根文件均失败。新用途必须同步更新资源目录、public/art 入口和门禁；现存角色、封面、房间、场景及回退路径不动。下一批优先核对正常 PC 场景 review 路径，未完成完整引用扫描前不迁移或删除；暂缓批量生成新美术。

R12.98：将正常 PC 工坊、月光街两张过渡 WebP 由各自 review/ 移入地点目录，命名 workshop-desktop-transition.webp、town-desktop-transition.webp；原 Git blob、原始 PNG、四候选 SHA-256、尺寸、review-only 状态及未选研究图不变。同步两处页面导入、两处真实浏览器断言、生成器、审核器及资源清单。旧路径不再保留副本；手机背景、故障回退、正式场景准入、存档不变。公开媒体仍 43、全仓 141；新提交 Quality、桌面浏览器及 Pages 须独立核验。暂缓批量新美术；下一批审查角色与欢迎封面目录。

R12.99（第一批：欢迎封面）：两张双端群像 WebP 由 beauty-beasts/cover/ 原 Git blob 迁入 public/art/covers/，保留 world-cover.webp 与 world-cover-mobile.webp 文件名、欢迎页语义标记和大厅故障回退。同步欢迎页、大厅、R12.53 转换脚本及 manifest、库存测试、设计资源清单和当前缺口台账；目录门禁登记 covers 并拒绝旧封面目录回流。媒体仍 43 公开、141 全仓；未改变审批、图片字节、布局、概率或存档。人物目录仍为 beauty-beasts/characters/，须完成头像、CG 晋级脚本、历史证据及动态路径引用核对后独立迁移（R12.99 第二批）；不宣称全部角色目录已收敛。暂缓批量新美术；新提交 CI、桌面及 Pages 结果独立验收。

R12.99 第二批：将 beauty-beasts/characters/ 的 3 张头像、3 张候选 CG 原 Git blob 迁入 public/art/characters/<id>/，同时迁移 cg-manifest.json 并更新五卡正式/预览槽、运行注册、CG 审核/晋级/生成、源图映射、测试及现行 SOP。beauty-beasts/ 整个公开历史目录退役，门禁登记 characters 并拒绝旧目录回流。月纱根目录三张 V3 肖像仍留待 R12.101；泉泡/炽角继续共享 rooms 下站姿，不重建两张重复候选。五卡仍 portrait（0/5 production），现行原画、哈希、身份、抽卡、存档、回退不变。固定历史 SHA URL、历史清单与 legacyOutput 保留旧路径。43 公开媒体、141 全仓媒体不变；新 SHA 的 Quality、真实浏览器及 Pages 独立验收。暂缓批量新美术；下一阶段 R12.100 核查房间正常观景与显式研究图路径。

R12.100 第一批（发布修复优先）：R12.99 第二批 5a44daf 的 Quality 静态导出与桌面浏览器失败，Pages 跳过；CI 日志定位工坊全景及派工控件共六个旧头像静态导入。两组件改为复用 HEROINE_FACE_ART 唯一注册表，保持图片、角色 ID、显示行为和存档不变。扩展 audit:repository-layout，在 app/src/engine 的运行代码及 CSS/JSON 中扫描退役 beauty-beasts、a05、feature-postcards 和 PC 场景 review 路径的字面引用；历史文档和 provenance 的旧路径不参与此运行引用门禁。新 SHA 需独立通过 Quality、桌面及 Pages 验收，之后才迁移私人房间 8 个观景层；显式月纱审稿图及回退保留。没有移动、删除或新增图片；43 公开媒体、141 全仓媒体不变。继续暂停批量生成新美术。

R12.100 第二批：四个房间的 8 张常规观景/显式审稿共用 WebP 原 Git blob 迁至 rooms/<id>/scenic/{background,standing}.webp；roomScenicArt 统一普通观景与显式审稿的路径解析；R12.57 转换、审核与输出清单、R12.53 转换清单、CG 预览注册及审核、单元与真实浏览器断言同步。泉泡、炽角仍共享站姿，四张 concept-scene.svg 与独立月纱 room-review 保留，正式 room manifest、剧情热点、原画、Alpha、SHA-256、审批、存档不变；旧四个 review 目录防回流。公开媒体 43、全仓 141，未新增美术。前置修复 029f019 已通过 Quality/Pages；本次提交仍须独立验收。下一批 R12.101 整理根目录散落肖像与大厅图。

R12.101 第一批：四张大厅 WebP（V2、V3、V4 桌面与 V4 手机）原 Git blob 迁入 public/art/world-scenes/lobby/，保留原文件名；正常大厅、欢迎页回退、公寓背景及 Pixi V3→V2 回退均保留。engine/scripts/build.mjs 只调整源路径，dist/assets 输出文件名不变；同步 R12.53 转换器、清单、测试及目录门禁，禁止根目录旧大厅路径回流。未新增、删除或重新编码媒体，43 公开媒体与 141 全仓媒体保持不变。前置 R12.100 已通过 Quality/Pages，本提交须独立验收。月纱三张根目录肖像留待 R12.101 第二批；暂停新增美术。
