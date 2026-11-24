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
