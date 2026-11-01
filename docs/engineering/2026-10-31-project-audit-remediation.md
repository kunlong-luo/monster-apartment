# 《怪物公寓》全项目审查与逐项整改台账（2026-10-31）

> 审查基线：`main@fb3cb71a29eef6dbf806b32c8135dc54f34cbfb4`；仓库：`kunlong-luo/monster-apartment`。
> 审查范围：仓库目录、关键源文件、游戏/设计文档、GitHub Actions 近期结果。**不是**线上七页的逐像素人工验收，也**不是**本地全套测试报告。
> 2026-10-31 基线：Quality、Desktop Visual Review、Deploy GitHub Pages 均通过；先前桌面浏览器检查曾出现工匠卡片越界失败，最新基线已修复并通过该检查。CI 成功不等于与设计稿 1:1 或已具备目标游戏品质。

## 一、处理方式

- **先修用户可见的真实缺陷**，再去除导致反复回归的架构/样式技术债，最后替换正式人物、房间与世界美术。
- 按本表 ID **一次处理一项**；每项记录代码变更、验收方式及 Quality/Pages 结果。未经验证的项不能写“已上线”。
- 保持七正式路由、现有玩家存档键、概率/90 抽保底/十连 SR+、现有真实交易逻辑；不增加第八路由与重复导航。
- 设计遵循 `PRODUCT.md`、`DESIGN.md`、`docs/IMPECCABLE.md`：PC 参考图优先、中央人物全屏绘景、酒红/紫黑/细金、小型 HUD、四位成年人物独特脸型、禁用 Sparkles/WandSparkles 图标。
- 优先使用已有 Next.js / React / Tailwind v4 / Motion / PixiJS / Zustand / Dexie / Lucide；平时运行轻量门禁，只有高风险功能或大里程碑才做必要浏览器专项或完整 E2E。
- 不能简单通过追加 `!important`、假全身 CG、把设计稿中带文字的背景直接当游戏背景等手段掩盖问题。

## 二、逐项问题清单

| ID / 优先级 | 代码证据与问题 | 整改目标与验收 | 状态 |
| --- | --- | --- | --- |
| **A01 · P0** 角色图鉴原生链接缺少 Pages 子路径 | `src/components/moonwork/world-characters.tsx` 内 `<a href="/characters/#summon-screen">` 不经 Next basePath 处理；Pages 实际部署于 `/monster-apartment/`，直接链接可能跳至错误根路径。该场景的 `characters-scene-router.tsx` 依赖浏览器 `hashchange` 触发视图切换。 | 保留原生 hash 导航语义（可发 `hashchange`），但 href 必须兼容 Pages basePath；补浏览器断言校验同路径 hash 切换，不得新增路由、改变抽卡存档。 | **Quality 与 Pages 已通过**（主分支 4317634；新增浏览器用例仍需专项执行） |
| **A02 · P0** PC 布局多重覆盖 | `src/components/game/gothic-desktop-ui.css` 约 554 行/173 处 `!important`；`gothic-reference-layout.css` 也控制相同大厅区域，`gothic-lobby.css` 与 Tailwind 还参与布局。 | 建立单一 PC 几何布局所有权，逐步删除重复选择器与 `!important`；固定中央人物、左名册、右功能海报、底部七项 Dock；以 1440×900、1648×928 与参考设计截图验收，也检查 390×844 无溢出。 | **第一阶段通过**（bbf472a；[Quality](https://github.com/kunlong-luo/monster-apartment/actions/runs/41261747129)、[Desktop Visual Review](https://github.com/kunlong-luo/monster-apartment/actions/runs/41261747138)、[Pages](https://github.com/kunlong-luo/monster-apartment/actions/runs/41261806481)；原画 1:1 仍待验收） |
| **A03 · P1** 抽卡界面状态校验不完整 | `src/lib/summon/use-gacha.ts` 读取数据仅检查 `tickets` 数字后强制断言 `GachaState`，而 `gacha-engine.ts` 已有 `validGachaState`。损坏但局部合法的存档可能在界面访问其它字段时出错。 | 只接受完整有效的状态；损坏数据须保留且操作不可扣费，显示清楚的修复提示；补针对性单测/浏览器检查。 | **Quality 与 Pages 已通过**（ae54661；新增浏览器用例待专项执行） |
| **A04 · P1** 抽卡与收藏跨键一致性 | `src/lib/summon/gacha-engine.ts` 依次写入收藏键与抽卡键，通过回滚降低失败风险，但 localStorage 两次写入不是事务。 | 设计安全的结算/重入与恢复策略，模拟 quota/写入失败，保护玩家真实资源与卡片；不更改概率。 | **Quality 与 Pages 已通过**（修复 0455ad4；[Quality](https://github.com/kunlong-luo/monster-apartment/actions/runs/41261010443) / [Pages](https://github.com/kunlong-luo/monster-apartment/actions/runs/41261114898)；浏览器专项待执行） |
| **A05 · P1** 五张卡面缺正式全身 CG | `public/art/beauty-beasts/characters/cg-manifest.json` 的 5 张卡均为 `portrait`；`heroine-portrait-assets.ts` 明确使用人物肖像过渡。 | 分角色锁脸、审核并接入 5 张独立卡面 CG；真实尺寸/版权/哈希/来源登记；完整人物在抽卡大卡正确展示，不把 512px 脸图拉成全身。 | 等待美术生产与审核 |
| **A06 · P1** 私人房间仍是概念场景 | `public/art/rooms/manifest.json` 四个房间均标记 `concept`；目前仓库实际只有 `concept-scene.svg`，目标背景/pose 路径尚未正式入库。 | 逐室生成并审批无 UI 背景、透明人物姿态、热点锚点；候选图不等于正式上线，恢复/切换房间不糊不失真。 | 等待美术生产与审核 |
| **A07 · P1** 工坊尚非持续自动生产 | `src/components/moonwork/workshop-controls.tsx` 的“开始生产轮班”按钮调用 `shift`，由 `v2/src/main.ts` 执行 `runShift`；虽有 `auto-assign`，但默认并无持续结算循环。 | 先设计自动生产状态机、节奏与离线收益上限，避免标签切换重复结算；保留玩家布置、派工、订单确认等重要决策。 | 待产品/工程设计 |
| **A08 · P1** 经营体系仍分裂 | `src/core/cozy-engine.ts` 有旧住客/公寓经济；`v2/src/workshop-engine.ts` 为工坊规则；`src/lib/game/character-life-store.ts`、`src/lib/game/character-collection-store.ts` 为额外进度键。 | 明确统一角色身份、成长、库存、契约和故事领域接口，支持旧存档无损迁移；禁止不经验证一口气合并键。 | 待设计 |
| **A09 · P1** 巨型组件与样式维护成本 | `src/components/summon/gothic-summon-screen.tsx` 约 760 行，`src/components/game/gothic-workshop.css` 约 1359 行，`src/core/cozy-engine.ts` 约 591 行；部分文件包含混合展示/交互/规则。 | 按 UI 场景、领域规则和控制器拆分；尽量保留行为测试，避免机械拆分导致重复 DOM 与新 CSS 覆盖层。 | **第一批已验证并上线**（f11f6a7 + d9badfa；剩余大型组件仍待拆分） |
| **A10 · P2** 构建与依赖策略需收敛 | 根 `package.json` 声明 pnpm，仓库存 `bun.lock`，CI 用 Bun 安装 + pnpm 执行；`v2/` 单独用 npm。 | 明确一个权威锁文件与分包原因，避免无效缓存、意外升级与重复安装；任何迁移先验证 Pages 静态导出与 Pixi sidecar。 | 待处理 |
| **A11 · P2** 首屏性能与美术加载需实测 | 大厅、召唤、房间同时包含 Next 图层、CSS 光照、Motion、Pixi；虽然已有 `ReliableImage` 和减少动画支持，但尚无在本轮审查中复现的统一性能数字。 | 真实浏览器采样首屏时序、解码、GPU、切页；优先加载关键图，对大图和动效分级，不凭静态分析声称性能故障。 | 待测量 |
| **A12 · P2** 视觉验收与 CI 结果需分层 | 最新 Quality / Desktop Visual Review / Pages 成功；`docs/DESKTOP-REFERENCE-LAYOUT.md` 与 `docs/v3/75-REFERENCE-01-DESKTOP-GEOMETRY.md` 均明确仍非 1:1 美术构图。 | 统一参考图—实机截图的人工差异记录；区分代码提交、质量通过、部署成功、视觉达标；避免将自动截图通过当作高级美术完成。 | 持续验收 |

### 本次整改顺序

`A01 → A03 → A04 → A02 → A09 → A07 → A08 → A05/A06 → A11/A10/A12`。

说明：**先修 A01**，因为问题明确、影响范围小、无须触碰经济和视觉素材。A03/A04 属于数据安全，应先于大规模布局重构。A02 是下一轮最高视觉优先项，不能继续追加 CSS 补丁。正式美术资源准备与审核可并行推进，但不能假称已接入。

## 三、首项 A01 的验收细则

1. 在本地开发 `/characters/` 和 GitHub Pages `/monster-apartment/characters/` 都应使“进入契约召唤”指向**当前角色页面路径** + `#summon-screen`，而非跳离部署子目录。
2. 点击后展示已存在的 `gothic-summon-stage`，且返回角色图鉴仍可用；中键/刷新能恢复正确 hash 视图。
3. 为 `e2e/character-collection.spec.ts` 增加最小真实浏览器断言；保持现有七路由、概率、货币、收藏键不变。
4. 通过 Quality、必要时的定向浏览器测试与 Pages 部署后，才将状态改为“已验证/已上线”，附上对应提交 SHA 和运行链接。

## 四、A04 结算一致性方案（2026-11-01）

- 新增 `src/lib/game/summon-transaction.ts`，保留旧的 `monster-apartment:gacha-v2` 和 `monster-apartment:character-collection:v1` 两个正式存档键，仅添加 `monster-apartment:summon-settlement:v1` 结算日志。
- 结算前记录两个键的原始值与目标值；收藏和抽卡都写入后再删除日志。故障或页面重启时，若两键都已达目标则确认已提交，若只有一键修改则回滚到原样；日志清理或回滚失败时锁定新结算，不得重复消耗或奖励。
- 只有两个键恰好等于结算前/后值时才可自动恢复；发现其他标签页或外部改写的未知值，拒绝覆盖，保留日志供人工排查。
- 新增第二次写入失败、回滚失败后恢复、结算完毕但日志删除失败、未知并发变化等 Vitest 回归测试。此防护是本地可恢复结算，不是跨标签页完全串行化事务，也不替代服务器防作弊机制。
- 质量/Pages 发布结果需以对应提交的 Actions 结果为准；不会以提交成功冒充线上验收。

### A04 验收记录

- 2026-11-01：`0455ad492c5caf5f7713b1b6bce0293e6281e48d` 的 Quality 全绿，GitHub Pages 部署成功；单元测试覆盖写入失败、回滚失败、日志清理失败及并发值冲突。
- **已完成**：代码修复、Vitest 回归、类型检查、Lint、Pixi 构建与 Pages 发布。
- **不等同已完成**：多标签页完全串行化、断电现场实测、手动 Playwright 浏览器专项。相关风险保留为后续安全加强项，不声称 localStorage 是原生跨键事务。

## 五、A02 · PC 大厅 CSS 所有权第一阶段（2026-11-01）

- 清理 `gothic-desktop-ui.css` 中早期大厅任务栏、人物按钮和活动卡的 PC 定位；让共享 Dock 样式显式排除大厅 `.gothic-dock--cinematic`，不影响其他六页和召唤页。
- 参考图的左侧四人名册、右侧月蚀推广和绘景海报、中央人物点击区、底部七项 Dock 统一归 `gothic-reference-layout.css` 管理（PC 宽 ≥1100px 且高 ≥700px）；`gothic-lobby.css` 留作通用结构和窄屏兼容，移除压过桌面参考图的顶栏、Dock、活动边框优先级。
- 参考图 Dock 为 980px 上限，色彩从 `--craft-*` 令牌继承，并显式修复图标背景与链接内边距；按 1440×900 核查边界与横向溢出，保留 1648×928/390×844 现有浏览器用例。
- 本轮未生成新的月纱全身 CG，也未完成实机参考图逐像素对照；A02 只登记为**进行中**，须通过 Quality、Pages 与真实截图后再考虑关闭。

### A02 第一阶段验收结果（2026-11-01）

- 代码：`bbf472af6f609b45ffb3660180758da410379e9f`，共享桌面 CSS 554→491 行，`!important` 173→155；大厅基础 CSS 21→15；PC 参考布局 CSS 4→0。
- **Quality 成功**：<https://github.com/kunlong-luo/monster-apartment/actions/runs/41261747129>（含静态导出、Pixi 构建、常规检查）。
- **Desktop Visual Review 成功**：<https://github.com/kunlong-luo/monster-apartment/actions/runs/41261747138>（真实浏览器多场景冒烟；不等同人工逐像素对图）。
- **Pages 部署成功**：<https://github.com/kunlong-luo/monster-apartment/actions/runs/41261806481>。
- 下一步仍需将设计稿和最新实机图片进行人工并排核对，修复新增角色 CG 前的构图误差；不把 CSS 去重等同于高还原度美术达标。

## 六、A02 第二阶段 + A09 第一步 · 大厅场景边界（2026-11-01）

- **A02 修复真实边界情况**：原桌面气泡从 `52vw` 附近展开，在 1100px 窄 PC 宽度下可能与右侧海报边缘冲突；现在以左侧、右侧剩余实际空间约束其位置。新增 1100×720 浏览器断言，验证右栏、气泡和底部七项 Dock 不重叠，并保存浏览器截图。
- **A09 模块化**：从 `gothic-lobby.tsx` 拆分 `GothicLobbyResidents`、`GothicLobbyContracts`、`GothicLobbyDestinations` 三个展示组件。大厅父组件继续统一拥有世界存档、面板开关、抽卡状态和事件；子组件只接收明确的状态/事件，不再重复读取存档或新增路由。
- **不可破坏的边界**：左侧 4 人房间链接、主线订单完成条件、月蚀召唤展示和右侧真实功能原样，移动端使用既有两按钮，保持同一套 CSS class / data-testid；未换人物原画、未修改概率与经济规则。
- 尚未宣称人工逐像素还原；GitHub Desktop Visual Review 的 artifact 存在，但本次并未直接打开内部 PNG 文件进行视觉分析。视觉下一里程碑仍需设计图和实机图并排验收。

### A02 / A09 本轮验收记录

- 重构代码：`f11f6a79276f8b71149c9208cb6aa771c3d3c41f`；针对单测中“必须在父文件出现 JSX”的过时路径断言，修正测试：`d9badfa5f9ec6d442e011561a85e8dca1deaa3ef`。实际进度条仍在独立组件中，保持原 `aria-valuenow` 和真实数值传递。
- **Quality 成功**：<https://github.com/kunlong-luo/monster-apartment/actions/runs/41262422071>（完整 TypeScript、Lint、核心 Vitest、静态导出和 Pixi）。
- **Desktop Visual Review 成功**：<https://github.com/kunlong-luo/monster-apartment/actions/runs/41262334261>（以相同产品代码运行浏览器检查，包含新增 1100×720 测试和 1440×900 / 1648×928 等已有测试）。
- **GitHub Pages 成功部署**：<https://github.com/kunlong-luo/monster-apartment/actions/runs/41262476066>。
- 浏览器截图打包：`desktop-v377-screenshots`，artifact #13065228668。**尚未人工打开并逐像素核对原设计图与截图**，因此 A02 仍保留设计图 1:1 还原的待办；A09 目前只是完成大厅区域拆分，召唤界面和工坊巨型组件继续待处理。
