# 《怪物公寓》文档总入口

> R12.75：本页是导航和治理状态，不重复各阶段报告。先读 [AGENTS.md](../AGENTS.md)；当前事实以源码、manifest、发布 SHA 与实际验收为准。

## 现行规范（新开发从这里开始）

| 任务 | 主入口 |
| --- | --- |
| 产品定位、核心循环 | [PRODUCT.md](../PRODUCT.md) |
| UI 与视觉系统 | [DESIGN.md](../DESIGN.md)、[Impeccable](IMPECCABLE.md)、[现行视觉合同 R12.37](design/R12-37-CURRENT-VISUAL-CONTRACT-2026-11-24.md) |
| 架构与工程边界 | [CURRENT_ARCHITECTURE.md](CURRENT_ARCHITECTURE.md)、[ADR](DECISIONS.md) |
| 研发流程与风险验收 | [ITERATION-PLAYBOOK.md](engineering/ITERATION-PLAYBOOK.md)、[依赖优先](engineering/DEPENDENCY-FIRST-FAST-ITERATION.md) |
| 美术目录、命名、实际资源 | [ART-RESOURCE-CATALOG.md](ART-RESOURCE-CATALOG.md)、[源图清单](../art-sources/source-catalog.json) |
| 新人物、CG、武器、服装与身份 | [CHARACTER-CREATION-SOP.md](CHARACTER-CREATION-SOP.md)、[人物 brief](templates/CHARACTER-DESIGN-BRIEF-TEMPLATE.md)、[五卡差异化](CHARACTER-CG-DIFFERENTIATION-V1.md)、[原生高清管线](CHARACTER-CG-NATIVE-PIPELINE.md) |
| 工坊设备美术 | [WORKSHOP-ASSET-SPEC.md](design/WORKSHOP-ASSET-SPEC.md)、[机器清单](../v2/art/asset-pack.v1.json) |
| 独立场景原画审核 | [R12 原画入库规则](art-reviews/R12-02-SCENE-ART-INTAKE.md)、[场景视觉验收](engineering/R12-41-INDEPENDENT-SCENE-VISUAL-REVIEW-2026-11-24.md) |
| 当前缺口和任务 | [风险台账](engineering/GAP-REGISTER-2026-11-22.md)、[GitHub Issues](https://github.com/kunlong-luo/monster-apartment/issues) |
| 真人首次试玩 | [观察协议](research/2026-11-13-r113-first-session-protocol.md) |

## 现行发布与美术边界

版本与发布入口统一见[根 README](../README.md)，不在各报告反复复制当前状态。重要最近证据：[R12.54 转换回读](art-reviews/R12-54-TRANSITION-ASSET-VERIFICATION-2026-11-24.md)、[R12.60 房间观景](design/R12-60-PLAYER-ROOM-SCENIC-MODE-2026-11-24.md)、[R12.62 PC 世界场景](art-reviews/R12-62-WORLD-PC-TRANSITION-2026-11-24.md)、[R12.64 合并记录](engineering/R12-64-ROOM-RELEASE-WORLD-INTEGRATION-2026-11-24.md)。上述均为当时的快照，不因后来合并而修改原审稿结论。

## 历史资料与长期策划

| 目录/文档 | 职责 |
| --- | --- |
| [v3/](v3/README.md) | 长期 PRD、剧情、人物、经营及历史实施报告；不是上线功能清单 |
| [design/](design/) | 设计原稿、R12 历史迭代与参考证据 |
| [art-reviews/](art-reviews/) | 原画来源、授权、像素、审稿、候选和历史证据 |
| [engineering/](engineering/) | 历史工程验收、事故复盘、长期迭代手册 |
| [CHANGELOG.md](CHANGELOG.md) | 版本演进 |
| [DEVELOPMENT_PLAN.md](DEVELOPMENT_PLAN.md)、[TECH_STACK_PAGEVELA.md](TECH_STACK_PAGEVELA.md)、[PRODUCT_SPEC.md](PRODUCT_SPEC.md) | 早期规划；不得覆盖现行技术栈与玩法 |
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
| 锁文件 | bun 是根应用依赖锁；pnpm-lock.yaml importer 只锁 pnpm 12.13.0 工具本身；v2 npm 锁独立，三者保留 |
| 发布、产品与美术 | R12.70 Quality/Pages 成功；R12.71 三项 Quality 成功；R12.72-A V3.106.0 Quality/Pages 已成功；R12.72-B V3.107.0 Quality/Pages 成功、大厅回归通过，A05 动态 DPR 失败；R12.72-C V3.108.0 Quality/Pages 成功，浏览器未完成；R12.74 清除独立历史目录与旧平台元数据。真人试玩和生产 CG/原画不能由文档治理替代 |

评分采用六维证据：工程架构 20、文档与资源 20、功能/存档 20、视觉体验 20、验证/发布 15、真实玩家反馈 5。未核验项不得按满分计；85/100 仅为目标，待全量引用核对、风险检查、发布与实机视觉证据后重新评分。

## R12.74 · 目录收敛

删除 `.aistudio/`（过时工具方案）、`management/`（V0.x 任务/冲刺/问题表）、`docs/prototypes/`（未运行的旧 TSX 实验）、根 `metadata.json`（已废弃 Gemini 平台元数据）。`artwork/catalog.json` 原始索引移入 `docs/art-reviews/legacy-2026-10-29-catalog.json`，旧 README 与归档路径说明保留于[清理前 Git 快照](https://github.com/kunlong-luo/monster-apartment/tree/782fc74fd6e597048a293cbf9777593447c76bb3/artwork)。历史任务表的剩余事项归入当前风险台账；不再维护平行待办。运行资源、原始 PNG、审批清单、七路由、存档和 Pixi sidecar 均不变。新增目录门禁，禁止旧路径和未经登记根目录回流。

## R12.75 · 工坊文档归并

原 `v2/docs/` 四份文件收敛为现行设备规格一份；旧路线/旧路由/旧人物规划使用固定 Git 快照，必要的设计与工程约束合并到现行 SOP、架构和风险台账。目录门禁禁止恢复 `v2/docs/`。新增 `pnpm audit:engine-paths` 扫描当前引擎目录之外的明确路径、npm --prefix、tsconfig 等引用，为后续单独的 engine 迁移准备清单；没有移动运行引擎或改动存档键。

## 维护约定

- 同一规则只维护一份主规范，索引链接不复制历史结论；过时规则注明替代者，保留审稿证据和 ADR。
- `research-only`、`review`、`approved`、`production` 分开；正式清单晋级和运行时引用均需有证据。
- 代码已提交、Quality 通过、浏览器通过、Pages 已部署是四个不同事实，分别记录 SHA。
- 新素材按角色/用途稳定英文小写连字符目录，遵循角色 SOP；CG 原生最低 1086×1448 可进入人审，禁止插值冒充原生或同脸换色。
- 保留七条正式路由、存档键、经济/概率、全屏绘景、小型角落 HUD；禁用 Sparkles/WandSparkles。
