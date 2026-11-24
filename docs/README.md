# 《怪物公寓》文档总入口

> R12.86：本页是导航和治理状态，不重复各阶段报告。先读 [AGENTS.md](../AGENTS.md)；当前事实以源码、manifest、发布 SHA 与实际验收为准。

## 现行规范（新开发从这里开始）

| 任务 | 主入口 |
| --- | --- |
| 产品定位、核心循环 | [PRODUCT.md](../PRODUCT.md) |
| UI 与视觉系统 | [DESIGN.md](../DESIGN.md)、[Impeccable](IMPECCABLE.md)、[现行视觉合同 R12.37](design/R12-37-CURRENT-VISUAL-CONTRACT-2026-11-24.md) |
| 架构与工程边界 | [CURRENT_ARCHITECTURE.md](CURRENT_ARCHITECTURE.md)、[ADR](DECISIONS.md) |
| 研发流程与风险验收 | [ITERATION-PLAYBOOK.md](engineering/ITERATION-PLAYBOOK.md)、[依赖优先](engineering/DEPENDENCY-FIRST-FAST-ITERATION.md) |
| 美术目录、命名、实际资源 | [ART-RESOURCE-CATALOG.md](ART-RESOURCE-CATALOG.md)、[源图清单](../art-sources/source-catalog.json) |
| 新人物、CG、武器、服装与身份 | [CHARACTER-CREATION-SOP.md](CHARACTER-CREATION-SOP.md)、[人物 brief](templates/CHARACTER-DESIGN-BRIEF-TEMPLATE.md)、[五卡差异化](CHARACTER-CG-DIFFERENTIATION-V1.md)、[原生高清管线](CHARACTER-CG-NATIVE-PIPELINE.md) |
| 工坊设备美术 | [WORKSHOP-ASSET-SPEC.md](design/WORKSHOP-ASSET-SPEC.md)、[机器清单](../engine/art/asset-pack.v1.json) |
| 独立场景原画审核 | [R12 原画入库规则](art-reviews/R12-02-SCENE-ART-INTAKE.md)、[场景视觉验收](engineering/R12-41-INDEPENDENT-SCENE-VISUAL-REVIEW-2026-11-24.md) |
| 当前缺口和任务 | [风险台账](engineering/GAP-REGISTER-2026-11-22.md)、[GitHub Issues](https://github.com/kunlong-luo/monster-apartment/issues) |
| 真人首次试玩 | [观察协议](research/2026-11-13-r113-first-session-protocol.md) |

## 现行发布与美术边界

版本与发布入口统一见[根 README](../README.md)，不在各报告反复复制当前状态。重要最近证据：[R12.54 转换回读](art-reviews/R12-54-TRANSITION-ASSET-VERIFICATION-2026-11-24.md)、[R12.60 房间观景](design/R12-60-PLAYER-ROOM-SCENIC-MODE-2026-11-24.md)、[R12.62 PC 世界场景](art-reviews/R12-62-WORLD-PC-TRANSITION-2026-11-24.md)、[R12.64 合并记录](engineering/R12-64-ROOM-RELEASE-WORLD-INTEGRATION-2026-11-24.md)。上述均为当时的快照，不因后来合并而修改原审稿结论。

## 历史资料与长期策划

| 目录/文档 | 职责 |
| --- | --- |
| [长期产品与内容策划](v3/README.md) | R12.77 已由 88 份减至 72 份；保留剧情、人物和独立证据，重复实施说明归 Git 历史；不是上线功能清单 |
| [design/](design/) | 设计原稿、R12 历史迭代与参考证据 |
| [art-reviews/](art-reviews/) | 原画来源、授权、像素、审稿、候选和历史证据 |
| [engineering/](engineering/) | 历史工程验收、事故复盘、长期迭代手册 |
| [CHANGELOG.md](CHANGELOG.md) | 版本演进 |
| [V0.x 历史规划与实验](https://github.com/kunlong-luo/monster-apartment/tree/f3a3b708f4ae8cda2ef1d4ee9088c71c9eef36ac/docs) | 六份旧 Markdown 已退役；原型、旧技术栈、灵核、守卫战仅供追溯，不覆盖现行产品 |
| [旧工坊文档快照](https://github.com/kunlong-luo/monster-apartment/tree/e4d74994de44989f3e16296caf9f85e118ab807c/v2/docs) | 旧路线、旧路由、旧角色方案；仅历史追溯 |
| [旧原画归档索引](art-reviews/legacy-2026-10-29-catalog.json) | 2026-10-29 外部归档元数据，非实际在仓库的媒体路径 |
| [历史发布基线 R11.3](engineering/2026-11-12-r11-3-release-baseline.md) | 历史完整回归及当时治理状态，不替代新 SHA |

## R12.67 治理核查与 85 分目标

基线：2026-11-24，`0f9188a282dfa8a831b9d4d8d389a43e4ed1e2d0`，完整 Git 树未截断。766 个跟踪 blob、220 份 Markdown、146 个指定媒体路径、19 份 CSS。根 README 和当前架构曾引用过时版本/数量；本次收敛两级入口、更新实际资源目录，保留独立的证据文件。无需为每次文档索引更新另建一份阶段报告。

| 后续清理项 | 当前结论与验收条件 |
| --- | --- |
| 重复历史资料 | 不再在总入口复制每阶段候选状态；仅在确认无独有设计/证据/引用后删除文件，Git 历史可恢复 |
| 重复媒体 | R12.70 已统一泉泡、炽角两组同源站姿运行路径，删除 1,415,186 B 副本；保留原图与生产审批，资源目录更新为 144 路径。月纱副本绑定 WineChan intake IMG_0268.png，保留审稿证据与运行路径；R12.71 实际门禁通过：144 路径、0 未登记重复 |
| 组件与 CSS | R12.68 Quality 审计 330 文件、94 模块、1 不可达、0 未解析；R12.69 删除旧召唤与不可用旧图鉴分支、31 条旧根限定 CSS，详见[架构](CURRENT_ARCHITECTURE.md)。保留其余选择器及 19 份 CSS；R12.70 的 Quality 三作业成功、321/321；R12.71 审计增加源码字面路径引用报告，R12.71 实际日志确认 character-adornment 无导入/字面路径引用，R12.72 删除 |
| 锁文件 | bun 是根应用依赖锁；pnpm-lock.yaml importer 只锁 pnpm 12.13.0 工具本身；engine npm 锁独立，三者保留 |
| 发布、产品与美术 | R12.70 Quality/Pages 成功；R12.71 三项 Quality 成功；R12.72-A V3.106.0 Quality/Pages 已成功；R12.72-B V3.107.0 Quality/Pages 成功、大厅回归通过，A05 动态 DPR 失败；R12.72-C V3.108.0 Quality/Pages 成功，浏览器未完成；R12.74 清除独立历史目录与旧平台元数据。真人试玩和生产 CG/原画不能由文档治理替代 |

评分采用六维证据：工程架构 20、文档与资源 20、功能/存档 20、视觉体验 20、验证/发布 15、真实玩家反馈 5。未核验项不得按满分计；85/100 仅为目标，待全量引用核对、风险检查、发布与实机视觉证据后重新评分。

## R12.74 · 目录收敛

删除 `.aistudio/`（过时工具方案）、`management/`（V0.x 任务/冲刺/问题表）、`docs/prototypes/`（未运行的旧 TSX 实验）、根 `metadata.json`（已废弃 Gemini 平台元数据）。`artwork/catalog.json` 原始索引移入 `docs/art-reviews/legacy-2026-10-29-catalog.json`，旧 README 与归档路径说明保留于[清理前 Git 快照](https://github.com/kunlong-luo/monster-apartment/tree/782fc74fd6e597048a293cbf9777593447c76bb3/artwork)。历史任务表的剩余事项归入当前风险台账；不再维护平行待办。运行资源、原始 PNG、审批清单、七路由、存档和 Pixi sidecar 均不变。新增目录门禁，禁止旧路径和未经登记根目录回流。

## R12.75 · 工坊文档归并

原 `v2/docs/` 四份文件收敛为现行设备规格一份；旧路线/旧路由/旧人物规划使用固定 Git 快照，必要的设计与工程约束合并到现行 SOP、架构和风险台账。目录门禁禁止恢复 `v2/` 与 `engine/docs/`。新增 `pnpm audit:engine-paths` 扫描当前引擎目录之外的明确路径、npm --prefix、tsconfig 等引用，为后续单独的 engine 迁移准备清单；该轮未移动运行引擎或改动存档键。

## 维护约定

- 同一规则只维护一份主规范，索引链接不复制历史结论；过时规则注明替代者，保留审稿证据和 ADR。
- `research-only`、`review`、`approved`、`production` 分开；正式清单晋级和运行时引用均需有证据。
- 代码已提交、Quality 通过、浏览器通过、Pages 已部署是四个不同事实，分别记录 SHA。
- 新素材按角色/用途稳定英文小写连字符目录，遵循角色 SOP；CG 原生最低 1086×1448 可进入人审，禁止插值冒充原生或同脸换色。
- 保留七条正式路由、存档键、经济/概率、全屏绘景、小型角落 HUD；禁用 Sparkles/WandSparkles。


R12.76：引擎迁至 `engine/`，旧根路径退役；历史报告保留当时路径，现行入口与构建命令以根 README 为准。PR #60 四项候选检查均成功后已合并 f3a3b70，主线 Quality、Pages、工坊性能与 WebGL 生命周期成功。


## R12.81 · V0.x 历史规范退役

六份文件原件：[DEVELOPMENT_PLAN.md](https://github.com/kunlong-luo/monster-apartment/blob/f3a3b708f4ae8cda2ef1d4ee9088c71c9eef36ac/docs/DEVELOPMENT_PLAN.md) · [PRODUCT_SPEC.md](https://github.com/kunlong-luo/monster-apartment/blob/f3a3b708f4ae8cda2ef1d4ee9088c71c9eef36ac/docs/PRODUCT_SPEC.md) · [SPIRIT_COLLECTION_V050.md](https://github.com/kunlong-luo/monster-apartment/blob/f3a3b708f4ae8cda2ef1d4ee9088c71c9eef36ac/docs/SPIRIT_COLLECTION_V050.md) · [TECH_STACK_PAGEVELA.md](https://github.com/kunlong-luo/monster-apartment/blob/f3a3b708f4ae8cda2ef1d4ee9088c71c9eef36ac/docs/TECH_STACK_PAGEVELA.md) · [UI_DIRECTION.md](https://github.com/kunlong-luo/monster-apartment/blob/f3a3b708f4ae8cda2ef1d4ee9088c71c9eef36ac/docs/UI_DIRECTION.md) · [V060_TACTICAL_DEFENSE.md](https://github.com/kunlong-luo/monster-apartment/blob/f3a3b708f4ae8cda2ef1d4ee9088c71c9eef36ac/docs/V060_TACTICAL_DEFENSE.md)。其余 191 份跟踪 Markdown 和 118 个 scripts/.github/tests 中指定脚本、配置、测试文件已扫描明确文件名引用；五份文档引用修正。独立二进制 `Development_Plan.docx` 暂留，尚未核查内容，不假定等同 Markdown。旧规则与技术以固定快照追溯；保留真人免费试玩、核心乐趣验证优先、避免未验证商业投入、独立 IP、可解释失败及实际状态驱动表现的原则；历史守卫战不属于正式七路由，不能视为现行功能或自动恢复。现行执行以 PRODUCT、DESIGN、架构、风险台账为准。


R12.82：三个既有功能 PR 的 Quality、桌面及完整玩法均通过；为保留最新清理成果统一组合候选，具体验收记录见 [CHANGELOG](CHANGELOG.md)。组合已由 #53 合并为 80eb69a，Quality、桌面、玩法和 Pages 均成功；#54/#58 重复 PR 已关闭。

## R12.84 · 设计规范归并

`docs/design/` 35 → 31 个跟踪文件，Markdown 32 → 28（其余 SVG/JSON 保留）；全仓 Markdown 191 → 187。退役四份旧实施报告：[R12-02-MOBILE-ROOM-CHOOSER.md](https://github.com/kunlong-luo/monster-apartment/blob/80eb69abb56c8a0a398e53ff27cdf513e76b695e/docs/design/R12-02-MOBILE-ROOM-CHOOSER.md) · [R12-03-LOBBY-ART-CLEARANCE.md](https://github.com/kunlong-luo/monster-apartment/blob/80eb69abb56c8a0a398e53ff27cdf513e76b695e/docs/design/R12-03-LOBBY-ART-CLEARANCE.md) · [R12-40-YUESHA-RELOAD-LORE-REGRESSION-2026-11-24.md](https://github.com/kunlong-luo/monster-apartment/blob/80eb69abb56c8a0a398e53ff27cdf513e76b695e/docs/design/R12-40-YUESHA-RELOAD-LORE-REGRESSION-2026-11-24.md) · [R12-62-ROOM-SCENIC-BUILD-FIX-2026-11-24.md](https://github.com/kunlong-luo/monster-apartment/blob/80eb69abb56c8a0a398e53ff27cdf513e76b695e/docs/design/R12-62-ROOM-SCENIC-BUILD-FIX-2026-11-24.md)。现行交互规则归入 [DESIGN.md](../DESIGN.md)，构建/回归证据在固定 Git 历史，保留原画、独立像素/审批记录和现行视觉合同。其余 187 份 Markdown 与 118 个 scripts/.github/tests 指定文件进行明确文件名引用扫描，三份历史引用改为固定链接；未声称覆盖所有动态/源码引用。六条非 main 分支已分类退役，实际 refs 删除仍待支持客户端操作，不将 PR 关闭误报为分支删除。

## R12.85 · 现行文档链接门禁扩容

`pnpm audit:doc-links` 从 5 份索引扩至 16 份现行文档；新增 AGENTS、产品、设计、当前架构、ADR、迭代手册、风险台账、人物 SOP、CG 原生管线、Impeccable、工坊设备规范。基线 `480128e` 完整 Git 树 732 个 blob、187 份 Markdown；按现有链接匹配规则只读核查 16 份文件共 257 条仓库相对链接，0 个缺失目标。Quality 已有调用，沿用原检查；本轮 CI 结果以实际提交为准。外链、锚点、引用式 Markdown、动态路径和内容准确性不属于该检查；不自动删除历史报告。仅改治理脚本和现行文档，不改变版本、资源、路由、存档或审批。下一步优先分层检查历史文档中的失效相对链接，区分可修复路径与应固定到 Git 历史的证据。

## R12.86 · 全仓 Markdown 链接门禁

基线 `58e52a0` 的 [Quality](https://github.com/kunlong-luo/monster-apartment/actions/runs/45398980151) 已成功。完整 Git 树分批只读扫描全部 187 份跟踪 Markdown：工程 20 份/46 条、设计 28 份/46 条、美术审稿 46 份/94 条、V3 72 份/207 条、其余 21 份/173 条；共 566 条匹配现行检查规则的仓库相对链接，未发现缺失目标。`audit:doc-links` 自动发现全部跟踪 Markdown，同时保留 16 份必需入口缺失检查；不新增依赖、文档或目录。历史证据仍保留，路径有效不代表内容现行；本轮没有删除文档或改动运行代码、美术、存档、版本。外链、锚点、引用式链接、动态路径、内容时效和独立证据价值仍须分别核查；本轮 Quality 以新 SHA 为准。下一步按内容逐项归并重复设计/工程报告，不按文件日期自动删除。
