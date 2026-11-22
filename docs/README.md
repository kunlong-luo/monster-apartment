# 《怪物公寓》文档导航与维护约定

> 2026-11-22 起作为**找文档的统一入口**；不是又一份取代全部文档的长篇需求书。工程执行先读仓库根目录的 `AGENTS.md`，以实际代码、清单和 CI 结果核实实现状态。

## 读文档的最短路径

| 要做的事 | 当前主依据 | 其他参考（不自动代表已上线） |
| --- | --- | --- |
| 每次开始工作 | [AGENTS.md](../AGENTS.md) → [快速迭代操作手册](engineering/ITERATION-PLAYBOOK.md) | [依赖优先原则](engineering/DEPENDENCY-FIRST-FAST-ITERATION.md) |
| 产品范围、角色与经营循环 | [PRODUCT.md](../PRODUCT.md)、[正式架构](CURRENT_ARCHITECTURE.md) | [V3 策划索引](v3/README.md) |
| PC/移动端 UI 与交互 | [DESIGN.md](../DESIGN.md)、[Impeccable](IMPECCABLE.md) | [大厅参考布局](DESKTOP-REFERENCE-LAYOUT.md)、[R12 视觉改造](design/R12-00-VISUAL-REBUILD-PLAN.md) |
| 新角色、立绘、CG、换装、武器 | [角色 G0–G7 SOP](CHARACTER-CREATION-SOP.md) → [任务模板](templates/CHARACTER-DESIGN-BRIEF-TEMPLATE.md) | [逐卡镜头表](CHARACTER-CG-DIFFERENTIATION-V1.md)、[原生高清可选管线](CHARACTER-CG-NATIVE-PIPELINE.md) |
| 全站美术要重做哪些 / 制作任务 | [R12.7 全站资源重制审计](art-reviews/R12-07-ASSET-REBUILD-AUDIT-2026-11-22.md) → [可执行 CSV 台账](art-reviews/R12-07-ASSET-REBUILD-BACKLOG.csv) | [像素取证](art-reviews/R12-01-REAL-BROWSER-PIXEL-EVIDENCE.md)、[五卡差异化](CHARACTER-CG-DIFFERENTIATION-V1.md) |
| 首张 S05 独立绘景样板（候选） | [R12.8 S05 契约大厅审稿报告](art-reviews/R12-08-S05-CONTRACT-HALL-REVIEW-2026-11-22.md) | 1672×941 原生图在对话 ZIP，未进入 Git/未上线、手机独立画与人审仍缺 |
| 场景原画 / 私室 | [R12 原画入库规则](art-reviews/R12-02-SCENE-ART-INTAKE.md) | [房间视觉规则](v3/23-ROOM-ART-PIPELINE-AND-CINEMATIC-PERFORMANCE.md) |
| 当前缺口、下一步 | [缺口与风险台账](engineering/GAP-REGISTER-2026-11-22.md)、[GitHub Issues](https://github.com/kunlong-luo/monster-apartment/issues)、[任务表](../management/TASKS.csv) | [R11.3 已核实历史基线](engineering/2026-11-12-r11-3-release-baseline.md) |
| 技术及产品决策 | [ADR 决策表](DECISIONS.md) | [早期 V0.1 开发计划（历史）](DEVELOPMENT_PLAN.md) |

## 发生冲突时的判定顺序

1. **真实运行证据**：`main` 源码、`package.json`、`public` / `artwork` 的清单、`.github/workflows` 和对应 SHA 的结果；不要用历史「已完成」代替现状。
2. **仓库强制约束**：`AGENTS.md`、`PRODUCT.md`、`DESIGN.md`、经记录的最新 ADR。
3. **专业 SOP**：人物用 `CHARACTER-CREATION-SOP.md`；场景按 R12 入库；工程和发布按迭代手册。
4. **版本提案 / 历史快照**：`docs/v3`、`docs/DEVELOPMENT_PLAN.md`、`docs/TECH_STACK_PAGEVELA.md`、`docs/engineering/20*.md` 等仅用于追溯，未被现行规范明确采纳的提议不能当作交付要求。

**特别注意**：当前开发采用 Next.js / React / Tailwind / Motion / PixiJS；旧 Vite、Phaser、五天试玩原型不是当前游戏的技术和体验目标。根目录保留旧资料用于追溯，不直接删除历史。

## 文档状态及用语（必须写清）

- **提案 / TODO**：可讨论的设计，不代表已有源码或素材。
- **研究稿 / research-only**：用于验证方向；不能作为生产 CG。
- **候选 / review**：文件已准备，等待人工身份、画质、授权与跨端审核。
- **已审 / approved**：有可追踪的审稿人、时间和证据；不自动等于游戏已使用。
- **生产 / production**：正式清单已合法晋级且运行时确实引用。
- **代码已提交**：只意味着仓库有提交；**Quality 通过**、**浏览器验收通过**、**Pages 已部署** 是不同事实。均需记录 SHA、链接或截图。

## 文档变更最小规范

- 每次功能/美术迭代只更新受影响的 **1 份主规范 + 相关 Issue/任务 + 必要 ADR / 变更日志**。禁止在 5 份文档复制同一段新规定。
- 计划与实现冲突时：优先修复事实性文字和文档入口，再决定是否改代码。废止规则须注明“被何文件/ADR 取代”，不能静默抹掉历史。
- 每条新任务要写：玩家可见目标、实际入口、涉及资源/模块、验收证据、不可破坏的存档/概率/布局约束、状态和下一步。
- 文档审查以**链接存在、相对路径可访问、状态可核对、规格唯一、可执行验收**为完成定义；文档提交并不声称进行过实机视觉/人审。
- 每轮结束用 [缺口台账](engineering/GAP-REGISTER-2026-11-22.md) 和 GitHub Issues 复查 P0/P1；更新事实，历史日记/审稿报告保持不可篡改。

## 特别约束

- 当前正式世界只有 7 个场景路由；独立研究页不算第八个游戏场景。
- 人物 CG **原生最低 1086×1448（3:4）可进入首期人审**；1536×2048 为可选精修。像素达标不等于身份、人体、武器、商用权审核通过。
- 保持银发赤瞳月纱身份与既有角色的**骨相差异**；两张月纱卡必须是同一个人，但服装/动作/武器须明显不同。
- 画面以全屏绘景和克制的边角 HUD 为主；不使用 Sparkles/WandSparkles 图标；新页面不得重复造导航或将 CSS 叠层当高清美术。
