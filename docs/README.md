# 文档统一入口

**现行事实以代码、manifest、发布 SHA 为准。** 从 [根 README](../README.md) 进入，不再把每次迭代报告塞进主导航。

| 任务 | 唯一主要入口 |
| --- | --- |
| 工程常驻规则 | [AGENTS](../AGENTS.md)、[迭代手册](engineering/ITERATION-PLAYBOOK.md)、[依赖原则](engineering/DEPENDENCY-FIRST-FAST-ITERATION.md) |
| 当前产品及视觉 | [PRODUCT](../PRODUCT.md)、[DESIGN](../DESIGN.md)、[Impeccable](IMPECCABLE.md) |
| 代码分层/存档 | [现行架构](CURRENT_ARCHITECTURE.md)、[本地存档架构](LOCAL_FIRST_ARCHITECTURE.md) |
| 开发优先级与未完成 | [缺口台账](engineering/GAP-REGISTER-2026-11-22.md)、[GitHub Issues](https://github.com/kunlong-luo/monster-apartment/issues) |
| 原画与资源路径 | [美术总目录](ART-RESOURCE-CATALOG.md)、[源图清单](../art-sources/source-catalog.json)、[实际文件清单](resource-inventory.json)、[原画制作 SOP](CHARACTER-CREATION-SOP.md) |
| 角色 CG | [艺术方向](CHARACTER-CG-ART-DIRECTION.md)、[原生生产管线](CHARACTER-CG-NATIVE-PIPELINE.md)、[当前五卡镜头表](art-reviews/CG-DIFFERENTIATION-SHOT-LIST.json) |
| 产品长期策划 | [V3 策划索引](v3/README.md)（PRD，不等于已实现） |
| 发布、架构决策 | [CHANGELOG](CHANGELOG.md)、[ADR](DECISIONS.md)、[工作流](https://github.com/kunlong-luo/monster-apartment/actions) |
| 真人试玩 | [匿名执行协议](research/2026-11-13-r113-first-session-protocol.md) |
| 本轮治理 | [R12.66](engineering/R12-66-REPOSITORY-GOVERNANCE-2026-11-24.md) |

## 目录分类

- `design/`：已认可设计参考、阶段布局/交互证据；最新 DESIGN 与实际实现优先。
- `art-reviews/`：原画取证、机器可读审核 manifest、权利来源及历史审稿，不作为运行时注册表。
- `engineering/`：工程手册、风险、阶段修复及 CI 证据；缺口台账是唯一活跃状态表。
- `v3/`：剧情、经营、收藏、装备等长期 PRD 及历史技术交付；旧实现描述仅代表当时。
- `templates/`：角色设计任务模板；`research/`：真实玩家研究。
- [archive/](archive/README.md)：必要保留的历史外部资源索引，不是现行原画路径。过期无价值重复方案直接删除，原件可由 Git 历史追溯。

## 维护准则

只更新现行事实的归属文档，阶段证据链接至对应 PR/CI，避免同一状态抄写到多份 README。新文档优先在原有文件更新；确有独立职责才新增，小写连字符命名（既有稳定路径不批量改名）。引用采用相对路径，外部历史引用固定 SHA；机器 manifest 的路径须与实际文件匹配。删除须扫代码、脚本、CI、测试、清单、动态引用及 Markdown 链接。禁止仅凭没有 import 就删原图、回退或审稿依据。
