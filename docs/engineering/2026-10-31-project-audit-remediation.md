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
| **A09 · P1** 巨型组件与样式维护成本 | `src/components/summon/gothic-summon-screen.tsx` 约 760 行，`src/components/game/gothic-workshop.css` 约 1359 行，`src/core/cozy-engine.ts` 约 591 行；部分文件包含混合展示/交互/规则。 | 按 UI 场景、领域规则和控制器拆分；尽量保留行为测试，避免机械拆分导致重复 DOM 与新 CSS 覆盖层。 | **大厅+召唤+图鉴锻造已验证上线；工坊样式及领域大文件待处理** |
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

## 七、A09 · 召唤页面模块化第一阶段（2026-11-01）

- 从 `gothic-summon-screen.tsx` 提取 `SummonHeader`（真实资源/工具）、`SummonPoolRail`（卡池切换）、`SummonActionBar`（召唤入口/保底文字）、`SummonShowcase`（人物、概率公示与收藏进度），将约 760 行主组件压缩到约 450 行。
- 父组件仍是 `useGacha` 和抽卡弹窗的唯一控制器；子组件只接收真实状态和回调，不读写存档、概率、奖励或资源。
- 保持五个卡池、单抽/十连、90 抽保底、卡池主题无 UP、实际概率公示、装备/收藏入口、资源异常保护和现有 className/data-testid；不更改路由/游戏逻辑/美术。
- 代码修复提交为 `279a9ba68f54ff35b4e2043142d5b25c46fef598` + `a0eaf88e65a5fe964c2e101046110e552d5a3d95`。**Quality 已通过**（[41262808023](https://github.com/kunlong-luo/monster-apartment/actions/runs/41262808023)），**Pages 已发布**（[41262854945](https://github.com/kunlong-luo/monster-apartment/actions/runs/41262854945)）。**Desktop Visual Review 已通过**（[41262807980](https://github.com/kunlong-luo/monster-apartment/actions/runs/41262807980)，真实浏览器测试）。未执行人工逐像素对图，也未生成正式人物全身 CG。完整原画仍未完成，不能把组件拆分冒充艺术升级。

## 八、A09 · 图鉴与锻造弹窗组件化（2026-11-01）

- 新增 `SummonCollectionArchive`：统一承载角色契约卡、异兽契约档案及弹窗关闭等展示，不自建/复制收藏存档；组件在关闭时保持挂载，选中的装备人物与锻造反馈不因临时关闭而丢失。
- 新增 `SummonForgePanel`：只接收收藏数据、选中人物及回调，继续通过既有 `commitCollection({type:'forge'|'equip'})` 结算，保留存档不可用时禁用按钮和所有当前 data-testid。
- 修复已收录卡片“拜访私人房间”使用根相对原生 `<a>` 导致 GitHub Pages 子路径丢失的问题：改用 Next `Link`，保留同一路由和 `?visit=...`，添加桌面浏览器目标路径断言。
- 本阶段不改变抽卡引擎、角色概率/90 抽保底、装备价格、能力增益、资源存档键、已有卡牌归属，也不替换原画；相关代码提交 `402025d14c3f57c07cc5a8c847ecbb5d6137ec74` 已经通过 Quality、静态导出和 Pages；后续专项浏览器验证见下方记录。

### A09 锻造/房间链接专项浏览器门禁

- Desktop Visual Review 已加入现存 `e2e/character-collection.spec.ts` 的两条定向流程：已收录卡片打造并穿戴、私人房间链接导航；不是全量 E2E 门禁。
- 在已有打造和穿戴场景中增加“关闭后再次打开图鉴，装备人物选项和真实操作反馈仍保留”的断言，防止组件重新挂载造成用户操作状态丢失。
- **专项验证已通过**：本次工作流同时验证原桌面场景、完整锻造与穿戴、关闭重开状态保持、角色房间链接。截图产物由相同工作流上传；不等同于设计图逐像素人工审查。

### A09 本轮最终验收（2026-11-01）

- 功能重构：`402025d14c3f57c07cc5a8c847ecbb5d6137ec74`；定向浏览器门禁：`b86b5e51689144b81162730fdedfa43d22b0d250`；兼容开发与 Pages 斜杠的断言修正：`7c5688e7e47d1c258aad1d4302e65f78a1661d1b`。
- **Quality 全绿**：<https://github.com/kunlong-luo/monster-apartment/actions/runs/41263427516>（TypeScript、Lint、Vitest、Next 静态导出、Pixi）。
- **Desktop Visual Review 全绿**：<https://github.com/kunlong-luo/monster-apartment/actions/runs/41263427563>；其中 `Run four-scene desktop browser smoke` 与 `Run focused archive forge and room-navigation browser regression` 两个步骤均明确为 success。
- **GitHub Pages 部署成功**：<https://github.com/kunlong-luo/monster-apartment/actions/runs/41263485730>。线上入口 `/monster-apartment/characters/#summon-screen`，页面保持七个正式路由与原有资源存档键。
- 尚未完成：整套 PC 设计原画逐像素验收、独立高清角色全身 CG、工坊 CSS 领域拆分、`cozy-engine` 核心分层。A09 的此阶段交付不等同于整个 A09 已结案。

## 九、抽卡结果播放状态机与最高品阶聚焦（2026-11-01）

- `use-ten-pull-playback.ts` 统一十连的自动播放、暂停、继续、手动选择、全部翻开和纯重播；`ten-pull-playback.ts` 将状态转换提取成无副作用 reducer 并增加 Vitest。
- 十连自动播放完整结束后将视角停在最高品阶已获人物卡，卡牌和历史仍按真实召唤顺序收录，绝不重新抽取或额外扣除资源。
- 进入结果页后如果玩家开启系统或游戏“减少动效”，取消旧定时器并立即展开所有已结算的卡片。增加真实浏览器用例检查中途切换动效、最高品阶聚焦和存档仍为十张。
- 现有最高品阶视效继续放在侧栏与卡框外，不覆盖人物脸部；照片保持比例展示。独立全身 CG 未完成，不伪称已替换。
- **验收已完成**：9ed7436 + 8df00f5 两次提交组成此轮代码；Quality、Desktop Visual Review 和 Pages 均已成功，详见下方记录。

### 抽卡动画状态机最终验收（2026-11-01）

- 代码提交：`9ed7436f51dcf4ec37983d1e081edfae68bc0f5a`；严格 TypeScript 未使用导入修复：`8df00f53a61c51e99ea2c4816edcd1a2ac991076`。
- **Quality 成功**：<https://github.com/kunlong-luo/monster-apartment/actions/runs/41265195009>（包含新纯 reducer 单测、静态导出与 Pixi 构建）。
- **Desktop Visual Review 成功**：<https://github.com/kunlong-luo/monster-apartment/actions/runs/41265194850>（运行了 `e2e/summon-result-desktop.spec.ts`，包含中途开启减少动效与十张实际落盘记录不变的浏览器验证）。
- **Pages 部署成功**：<https://github.com/kunlong-luo/monster-apartment/actions/runs/41265244992>。
- 十连完成后聚焦真实最高品阶的结果卡；重播、暂停和减少动效不做任何召唤结算。当前卡片继续使用已审核肖像；五张独立全身 CG 制作仍列为 A05 未完成，不属于本轮修复范围。设计图与截图逐像素审核也尚未完成。

## 十、A05 · 角色 CG 生产设计包与审核预览（2026-11-01）

- 所有五张卡 `cg-manifest.json` 目前仍为 `portrait`。两次尝试生成的图像均变成了**整张游戏 UI/错误人物与概率信息**，并非独立 3:4 全身立绘；此类图片不入库、不改 production 标志、不冒充完成。
- 新增 `docs/design/2026-11-01-character-cg-production-brief.md`：分别锁定月纱两版、泉泡、青枝、炽角的成年人物身份、服装、站姿、光源和兽类剪影规则；避免同脸、裁手裁脚及错误材料。
- 强化 `scripts/prepare-character-cg.mjs`：生成线下审核包时附带仓库现有 `reference-face.webp`，使用缩放后保持真实视口比例的 1440×900、1648×928 与 390×844 卡面预览，并列出需要人工检查的项目。只提交审核程序与规范，不做虚假素材晋级。
- 新增 Vitest `tests/character-cg-intake.vitest.test.ts` 检查五个插画槽位、正确的身份参考和三种视口预览。CG 图片本身仍待合格的单幅原生插画，验收依旧遵循原正式来源审核、权限及字节哈希闸门。
- **已验证**：代码提交 `8680a4f7fd6d7e17d23504db483b8c324d3796cf` + 严格 TypeScript 脚本声明 `6a41ed8d24f5659b3f6c799be0db4bd38a42e624`；Quality 成功 <https://github.com/kunlong-luo/monster-apartment/actions/runs/41268348382>；GitHub Pages 对应成功发布 <https://github.com/kunlong-luo/monster-apartment/actions/runs/41268398637>。本轮没有变更玩家游戏页面及人物图片，所以不将浏览器美术截图或未合格 CG 写成已通过。

## 十一、A05 · 肖像过渡卡视觉可用性与错图修复（2026-11-01）

- 修复 `src/lib/summon/gacha-engine.ts` 三位工坊住客（泉泡、青枝、炽角）的 `avatar` 仍指向 `lobby-hero-v3.webp`（月纱大厅绘景）的身份错误：目录的正式 fallback 指向各自真实 `face.webp`，**不触碰品阶/概率/结算**。
- `heroine-portrait-assets.ts` 的图片错误回退也改为同一人物的经过审查的肖像，而不是错误人物。角色照片不可用时，宁可保持同人身份及重试逻辑，不将月纱误当成其他工坊住客。
- 十连缩略卡改为肖像+可读角色名的紧凑构图，移除肉眼不可辨的 6–7px 碎片奖励文字（仅视觉隐藏，DOM、奖金 data-testid 和真实获得记录仍保留）。主展示卡仍完整显示首收、碎片、角色引文；缩略卡无新的二次导航/按钮。
- 扩充原头像一致性 Vitest 和十连真实 Playwright 回归，包括头像路径、缩略卡字号与画面可用空间。**正式全身 CG 仍是 0/5**，不要将此轮的卡框打磨误称 A05 原画入库。
- **本次验证已通过**：代码提交 `46146911b399c3d21e97ef9c496834babb28eeb4`；Quality <https://github.com/kunlong-luo/monster-apartment/actions/runs/41269106559>；Desktop Visual Review <https://github.com/kunlong-luo/monster-apartment/actions/runs/41269106523>（含 `e2e/summon-result-desktop.spec.ts`）；GitHub Pages 发布 <https://github.com/kunlong-luo/monster-apartment/actions/runs/41269154331>。这些是行为/构图门禁，不代表五张正式 CG 的原画审查通过。

## 十二、A05 · 卡池主题元数据的人物肖像统一（2026-11-01）

- 仓库图像审计确认：目前没有合格的独立 3:4 全身 CG 资产，历史大图是游戏设计稿/场景和过渡肖像。图像生成再次给出带错误身份与概率的整张 UI 图，不作为月纱 CG 使用。
- 修复 `GACHA_POOLS` 三个主题卡池的原始头像：赤焰工坊 → `cinder/face.webp`、荆棘回响 → `fern/face.webp`、潮汐来信 → `brook/face.webp`。避免任何消费卡池数据的未来视图把月纱误显示为其他人物。
- 卡池按钮新增稳定 `data-pool-id` 和测试定位符；新增定向 Playwright 测试，验证 PC 四种人物主题头像确实加载、切换后人物不同、显示真实基础概率且没有主题 UP；单元测试约束卡池目录和角色肖像一致。
- 保持抽卡 RNG、保底、存档及现有角色 CG 审核门槛不变。三视口原画身份审核仍是进入正式生产卡面的前提，本轮仍为 CG 0/5。

- 本轮验收（`9d1b43c7c1855016c1764cbc3c6fdab07962067e`）：Quality [41270231555](https://github.com/kunlong-luo/monster-apartment/actions/runs/41270231555)、Desktop Visual Review [41270231581](https://github.com/kunlong-luo/monster-apartment/actions/runs/41270231581)、Pages [41270277543](https://github.com/kunlong-luo/monster-apartment/actions/runs/41270277543) 成功。CG 仍为 0/5。

## 十三、A05 过渡肖像的主卡装裱（2026-11-01）

- 仅对 `face-crop` 人物（泉泡、青枝、炽角）的**主契约结果卡**使用暗铜边肖像装裱，最大化已审核方形脸部绘画清晰度，并保留原生等比 contain；不伪造下半身或使用背景模糊扩张为“全身 CG”。小型十连缩略卡仍是无外框的清晰肖像，不牺牲可读性。
- 正式独立 `full-body-cg` 和月纱 `scene-portrait` 继续使用既有构图，在未来原画通过审核之后不用改动组件；抽卡历史、资源、概率和装备存档逻辑未变。
- 新增桌面 Playwright 验证非月纱主卡的图片自然宽度、contain 装裱、清晰的卡框尺寸和截图，结果由 Quality / Desktop Visual Review / Pages 门禁决定。再次生成的五人拼图混入错误人物名与烘焙稀有度，不符合 CG 审查，未进入生产目录；正式 CG 仍为 0/5。

### A05 装裱版主卡验收（2026-11-01）

- 初次代码提交 `57be897f4822ce12d6da41735fef844abac8db52`；首次桌面浏览器检查在新加的固定像素宽度断言中失败（22 通过、1 失败，真实肖像画框约 126px，预设 220px 不适用）。已根据真实结果修复不合理的较大边距和断言，而非忽略失败。
- 修复提交 `7f0839e6c190d9c912711b3aff9b781f2902079a`：画框在窄桌面卡内按百分比保留人物面积，Playwright 检查实际图片解码、`object-fit:contain`、装裱占卡面比例与真实截图。
- **Quality 成功**：<https://github.com/kunlong-luo/monster-apartment/actions/runs/41270996297>。
- **Desktop Visual Review 成功**：<https://github.com/kunlong-luo/monster-apartment/actions/runs/41270996301>，原桌面场景+召唤结果+锻造/房间定向浏览器测试均通过；截图产物由同工作流保存，但未做人眼逐像素设计图复刻审查。
- **Pages 发布成功**：<https://github.com/kunlong-luo/monster-apartment/actions/runs/41271041032>；线上入口 `/monster-apartment/characters/#summon-screen`。
- 本次只优化审核已通过的旧肖像过渡显示，未进入新的全身美术素材，正式独立全身 CG 数仍为 **0/5**，游戏规则与存档未改变。

## 十四、A07 · 实时自动工坊第一阶段（2026-11-01）

- 上线目标：工坊一键开启/暂停真实时间产线，三个机器独立按 30/45/60 秒结算；原料仍需与相邻机器连接，机器必须有真实工匠，不能靠动画发货。
- 新增 `v2/src/workshop-auto-production.ts` 纯领域模拟，输出时使用已经经过历史验证的 `projectMachineProduction` 单机投影；仓储限制水汽36/孢子36/晶核80；无原料或满仓的周期不欠产。自动生产**不调用**旧 `runShift()`，不推进工坊天数、不结算或逾期普通及月纱订单、不扣星币。
- 生产时钟（设备截止时间、最后结算时间、累计产物）作为 `WorkshopState.auto?` 可选字段与库存写入**同一份旧 V2 JSON**；旧存档继续可读，不清除原有画面、雇工、设备或订单；布局/岗位改变重启设备周期，不重复补发。
- `WorkshopAutoRuntime` 挂载全站布局，通过浏览器 Web Locks 选举自动写入者；运行时使用实际时间戳而非定时器触发次数，离线最多补算8小时，停在原料/容量瓶颈。**不支持 Web Locks 的浏览器明确拒绝启用**，不假装已自动生产；原有 Dexie 备份仍跟随存档事件同步。
- 工坊底部新增单个开启/暂停操作，与原手动轮班并排；运行中手动轮班禁用，防止 V2 按天罚款叠加；Pixi 同步同标签页自动进度。自动生产不会自动完成普通订单，下一阶段需要独立设计“库存预留及交付”的权威事务。
- 新增 Vitest 测试生产物料守恒、节拍、离线恢复、布局重置、旧班次隔离；定向 Playwright 验证按钮、真库存、跨页继续、暂停及截图。此阶段只是 A07 的可玩基础，严格多标签跨所有**手动**写入的事务 CAS 与完整 V3 订单模型仍未完成。

### A07 实时生产第一阶段最终验收（2026-11-01）

- 实际版本代码以 `5b21510ff4b373ec17ed41eb7adb6ffb7b8657c4` 为准（此前的若干增量提交经历严格检查修复）。
- **Quality 成功**：<https://github.com/kunlong-luo/monster-apartment/actions/runs/41273772769>。TypeScript、Lint、全套 Vitest（包括新自动工坊守恒与离线模拟）、Next 静态构建、Pixi 构建通过。
- **Desktop Visual Review 成功**：<https://github.com/kunlong-luo/monster-apartment/actions/runs/41273772738>；包含原四场景浏览器冒烟、图鉴锻造/房间回归，以及新增 `e2e/moonwork-next-workshop.spec.ts` 的自动生产真库存、时钟、日期/星币保护、跨页持续和暂停恢复专项。截图产物 `desktop-v377-screenshots`（ID 13070233765），不能将此写成参考原画逐像素人眼审查。
- **GitHub Pages 成功部署**：<https://github.com/kunlong-luo/monster-apartment/actions/runs/41273824088>，玩家入口 `/monster-apartment/workshop/`。
- 尚待 A07 下一阶段：按世界统一库存自动预留与订单交付、多人标签所有手动写入的严格事务协调，以及更丰富的设备生产状态反馈；本阶段不把这些未实现项标记为完成。A05 独立 3:4 全身人物 CG 仍 0/5，不能由自动工坊代码弥补。

## 十五、A05 · 用户选定月纱全身立绘候选（2026-11-01）

- 用户在当前对话明确上传并选定黑发、赤瞳、双角、红黑礼服的「月纱·神话月蚀」单人全身图，原始 PNG **1086×1448**，无烘焙 UI、双手和脚尖完整。此最新身份依据取代早期错误银白发设定。已保留原画并生成同尺寸 WebP q92（不对小图假造 1536×2048 原生像素）。
- GitHub 文本代码提交 `72b0a06a762f6145c3168a691ceaabf358626aab` + `8029aae0b3a539ff3f1e163a7853c576c1a8571e`：增加**仅在 manifest opt-in previewPath 存在时**才选择候选图片的资源映射；大卡展示候选，十连缩略卡继续旧肖像，加载失败回退到原角色；正式 `production`/哈希/来源/人审门禁不受影响。当前线上 manifest 尚未登记 previewPath，因此不引用不存在的文件。
- 用户原始图片在本会话容器，已产出可下载的 `A05_Yuesha_Eclipse_Integration.zip`，包含原 PNG、WebP、尺寸与 SHA-256、可重复且原子执行的 `install_a05.py`。当前 GitHub 接口不接受容器本地二进制路径，**因此图片文件仍未提交到 GitHub 仓库**，仓库线上画面未切换；不能把代码支持或本地包称为已真正入库或已部署美术。
- 正式 CG 仍为 **0/5**，只有按原生 1536×2048 的生产标准做高清重绘、完成版权与人工逐视口审核并提交正式文件/证明，才能切换 `production`。

### A05 用户确认的月蚀立绘实际入库（2026-11-01）

- 已通过 GitHub 二进制 Git Blob 上传并校验用户明确选定的 1086×1448 WebP（456,622 bytes，SHA-256 `7f2f34b205b156f08c02be683244175951c45da6cbab1113930bee0ae971b8ae`），提交位置 `public/art/beauty-beasts/characters/yuesha/cg-eclipse-candidate.webp`。不再要求用户手动执行接入包。
- 将 `cg-manifest.json` 的 `yuesha-eclipse.previewPath` 指向实际存在的图片，`status` **保持 `portrait`**，因为原生 1086×1448 仍低于正式 CG 审核 1536×2048 的尺寸门槛；其余四张合同不改动。
- 召唤页右侧主题画像与神话月蚀抽卡结果大卡优先加载用户选定的月蚀立绘；已收录迷你头像、十连缩略卡继续使用同人的旧肖像，并保留加载失败回退。新增 SHA-256、图片字节存在性、PC 真实图片解码与页面截图测试。抽卡概率、角色品阶、资源结算与保存数据未改变。
- 新图只是**已接入且用户批准展示的全身候选插画（1/5 候选接入）**，不冒充正式高清美术审定（0/5 production）。后续正式高清原画需原生升级并经过三视口审查，不能仅进行软件插值便宣称原生达标。

### A05 已有月蚀原画扩展至人物收藏（2026-11-01）

- 在 `SummonCollectionArchive` 中针对**真正已收录**的 `yuesha-eclipse` 增加「欣赏完整立绘」入口，以已提交、用户选定的 `cg-eclipse-candidate.webp` 显示完整人物和服饰，无需再抽到卡才有大图可看；未拥有的卡不显示入口，避免未获卡提前解锁。
- 收藏详情采用单一图鉴 Dialog 内切换展示，保留真实装备、碎片与装备目标状态；图片响应式等比 `contain`，不盖住鞋尖、奖励或其他页面 HUD。可从详情返回图鉴并继续锻造。
- 增加真实浏览器的 PC 1440×900、移动端 390×844 的图片解码、真实 1086×1448 尺寸、URL、横向溢出、返回与存档不变的检查；Desktop Visual Review 的重点回归包含此新增用例。
- 第二张「月纱·月下誓约」的单人 CG 生成持续出现错误五人宣传 UI，不能裁切替代或冒充同一张脸；**本轮没有新增第二张 CG，正式 production 仍 0/5，已入库候选仍 1/5**。
