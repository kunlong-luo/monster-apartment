# 《怪物公寓》文档总入口

> R12.68：本页是导航和治理状态，不重复各阶段报告。先读 [AGENTS.md](../AGENTS.md)；当前事实以源码、manifest、发布 SHA 与实际验收为准。

## 现行规范（新开发从这里开始）

| 任务 | 主入口 |
| --- | --- |
| 产品定位、核心循环 | [PRODUCT.md](../PRODUCT.md) |
| UI 与视觉系统 | [DESIGN.md](../DESIGN.md)、[Impeccable](IMPECCABLE.md)、[现行视觉合同 R12.37](design/R12-37-CURRENT-VISUAL-CONTRACT-2026-11-24.md) |
| 架构与工程边界 | [CURRENT_ARCHITECTURE.md](CURRENT_ARCHITECTURE.md)、[ADR](DECISIONS.md) |
| 研发流程与风险验收 | [ITERATION-PLAYBOOK.md](engineering/ITERATION-PLAYBOOK.md)、[依赖优先](engineering/DEPENDENCY-FIRST-FAST-ITERATION.md) |
| 美术目录、命名、实际资源 | [ART-RESOURCE-CATALOG.md](ART-RESOURCE-CATALOG.md)、[源图清单](../art-sources/source-catalog.json) |
| 新人物、CG、武器、服装与身份 | [CHARACTER-CREATION-SOP.md](CHARACTER-CREATION-SOP.md)、[人物 brief](templates/CHARACTER-DESIGN-BRIEF-TEMPLATE.md)、[五卡差异化](CHARACTER-CG-DIFFERENTIATION-V1.md)、[原生高清管线](CHARACTER-CG-NATIVE-PIPELINE.md) |
| 独立场景原画审核 | [R12 原画入库规则](art-reviews/R12-02-SCENE-ART-INTAKE.md)、[场景视觉验收](engineering/R12-41-INDEPENDENT-SCENE-VISUAL-REVIEW-2026-11-24.md) |
| 当前缺口和任务 | [风险台账](engineering/GAP-REGISTER-2026-11-22.md)、[任务表](../management/TASKS.csv)、[GitHub Issues](https://github.com/kunlong-luo/monster-apartment/issues) |
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
| [v2/docs/](../v2/docs/)、[prototypes/](prototypes/) | 历史原型和旧方案；非现行页面 |
| [历史发布基线 R11.3](engineering/2026-11-12-r11-3-release-baseline.md) | 历史完整回归及当时治理状态，不替代新 SHA |

## R12.67 治理核查与 85 分目标

基线：2026-11-24，`0f9188a282dfa8a831b9d4d8d389a43e4ed1e2d0`，完整 Git 树未截断。766 个跟踪 blob、220 份 Markdown、146 个指定媒体路径、19 份 CSS。根 README 和当前架构曾引用过时版本/数量；本次收敛两级入口、更新实际资源目录，保留独立的证据文件。无需为每次文档索引更新另建一份阶段报告。

| 后续清理项 | 当前结论与验收条件 |
| --- | --- |
| 重复历史资料 | 不再在总入口复制每阶段候选状态；仅在确认无独有设计/证据/引用后删除文件，Git 历史可恢复 |
| 重复媒体 | 3 组相同 blob；资源目录记录实际路径。两组分别承担 CG 与房间观景输出，另一组承担文档证据与运行审稿；先核对源图与动态加载、manifest、生成脚本及测试，再合并 |
| 组件与 CSS | R12.68 已接入 [引用审计](../scripts/audit-component-usage.mjs) 和 [测试](../scripts/tests/component-usage.test.mjs)，Quality 输出可达性、入边、未知动态引用；19 份 CSS 的选择器级使用仍待真实双端核查，不自动删除 |
| 锁文件 | bun 是根 CI 安装依据；核对 pnpm 锁文件与外部开发链；v2 npm 锁独立 |
| 发布、产品与美术 | 基线 Quality/Pages 已成功；新提交的 CI 及完整浏览器证据另验。真人试玩和生产 CG/原画不能由文档治理替代 |

评分采用六维证据：工程架构 20、文档与资源 20、功能/存档 20、视觉体验 20、验证/发布 15、真实玩家反馈 5。未核验项不得按满分计；85/100 仅为目标，待全量引用核对、风险检查、发布与实机视觉证据后重新评分。

## 维护约定

- 同一规则只维护一份主规范，索引链接不复制历史结论；过时规则注明替代者，保留审稿证据和 ADR。
- `research-only`、`review`、`approved`、`production` 分开；正式清单晋级和运行时引用均需有证据。
- 代码已提交、Quality 通过、浏览器通过、Pages 已部署是四个不同事实，分别记录 SHA。
- 新素材按角色/用途稳定英文小写连字符目录，遵循角色 SOP；CG 原生最低 1086×1448 可进入人审，禁止插值冒充原生或同脸换色。
- 保留七条正式路由、存档键、经济/概率、全屏绘景、小型角落 HUD；禁用 Sparkles/WandSparkles。
