# 《怪物公寓》V3.1 策划总入口

> **文档状态：需求与剧情方案（Proposal），不是已上线功能。** 编写日期：2026-10-28。本文档体系是后续开发的唯一 V3 产品基线；已有代码与实际发布状态以主分支和 CI 为准。

## 一句话定位

一款**剧情对话驱动 × 精美 CG 收藏 × 自动化经营 × 关键特效演出**的本地优先哥特奇幻 2D 游戏：玩家经营怪物公寓、搭建自动工坊、认识月光街居民，通过真实生产、贸易、建设与角色决策逐步修复「月心灯」，探索三种不同结局。

**核心约束：工匠自动劳动，玩家做有价值的决定；不以重复点击领取产物、推进每日班次或刷好感度为玩法。**

## 文档目录（建议阅读顺序）

| 文件 | 使用者 | 内容与交付物 |
|---|---|---|
| [01-PRODUCT-VISION.md](01-PRODUCT-VISION.md) | 设计/开发 | 核心支柱、七页职责、经营循环、范围边界、20 分钟垂直切片 |
| [02-AUTO-PRODUCTION-PRD.md](02-AUTO-PRODUCTION-PRD.md) | 规则/工程 | 实时生产、仓储预留、自动交付、离线模拟、存档迁移、设备动画 |
| [03-WORLD-STATE-AND-QUESTS.md](03-WORLD-STATE-AND-QUESTS.md) | 工程/叙事 | 共享世界进度、事件机制、剧情触发、任务与关系的状态模型 |
| [04-WORLD-AND-CHARACTERS.md](04-WORLD-AND-CHARACTERS.md) | 编剧/美术 | 世界设定、八位关键 NPC、角色性格、欲望、弱点、人物弧线 |
| [05-MAIN-STORY-SCRIPT.md](05-MAIN-STORY-SCRIPT.md) | 编剧/客户端 | 序章、五章、终章、三结局的完整场景对白与演出/触发条件 |
| [06-CHARACTER-QUESTS.md](06-CHARACTER-QUESTS.md) | 编剧/玩法 | 角色支线、关系分歧、可实施任务和与职业有关的奖励 |
| [07-ROADMAP-AND-ACCEPTANCE.md](07-ROADMAP-AND-ACCEPTANCE.md) | 开发/测试 | P0–P3 依赖排序、验收矩阵、测试、风险与上线门槛 |
| [08-NARRATIVE-DIALOGUE-UX.md](08-NARRATIVE-DIALOGUE-UX.md) | 叙事/客户端 | 剧情对话状态机、角色展示、选项与重要演出分层 |
| [09-CG-COLLECTION-AND-ART.md](09-CG-COLLECTION-AND-ART.md) | 美术/客户端 | 12 主线 + 8 人物 + 6 隐藏收藏 CG、资产生产与解锁规则 |
| [10-FORESHADOWING-AND-EASTER-EGGS.md](10-FORESHADOWING-AND-EASTER-EGGS.md) | 编剧/关卡/QA | **含剧透的内部伏笔表**：6 条主线伏笔、6 个隐藏彩蛋与回收逻辑 |
| [11-VERTICAL-SLICE-AND-CONTENT-PIPELINE.md](11-VERTICAL-SLICE-AND-CONTENT-PIPELINE.md) | 制作/验收 | 自动生产→遇见月纱→解锁 CG→发现第一个彩蛋的完整纵切片 |

## 当前版本与 V3 目标的边界

**已存在：** Next.js + React + TypeScript + Tailwind v4 + PixiJS；七个正式页面；15 格工坊；三类机器；三位工匠；单日生产与物料流动、普通及月纱特别委托；本地存档；Zustand + Dexie 镜像；基础设备状态和产出反馈。现有生产在玩家点击「开始一天生产」后通过 `runShift()` 结算，**尚不是真实时间自动生产**。

**V3.1 待实施：** 自主计时生产和离线结算、自动订单预留、工匠日常行为、沉浸式对话、CG 收藏与隐藏线索、跨七页剧情进度、五章完整主线与三结局、各人物支线、正式透明精灵及专属工作动作、统一任务追踪。本文档将目标与现实分开，不将示意图/文案标为已集成资源。

## 不可破坏的现有约束

1. 七个正式入口：`/`、`/apartment/`、`/workshop/`、`/town/`、`/orders/`、`/characters/`、`/warehouse/`。
2. 旧公寓存档 `monster-apartment:cozy:v1` 和旧工坊存档 `monster-apartment:workshop-v2-lab` 必须可读取，不能静默清空。
3. 目前公寓与工坊经济独立；**先做共享故事状态，不合并两种货币**。任何合并须另出经济迁移 ADR。
4. 保留 PixiJS 负责绘景、React 负责 HUD/交互、纯 TypeScript 负责规则的边界。不要引入第二套正式 UI。
5. 所有动画只表现已确定的状态/结果；不能反向驱动产量、货币、任务完成或剧情进度。
6. 动画支持系统减少动态效果；全页面触控可用、返回大厅背景不失真。
7. 先完成一个可玩的自动生产 + 第一章垂直切片，再扩充人物和美术，避免「只加按钮没有玩法」的回归。

## 设计审查的三个问题

- 玩家作出什么选择？有什么资源成本、后果或关系变化？
- 不操作一分钟，工坊、角色和世界分别会如何变化？
- 如果删掉这个按钮/任务/动画，玩家会失去什么有价值的策略或情感体验？

回答不了，就不要把功能加入正式需求。新需求在此目录更新后，再写代码和验收用例。

## 与历史文档的关系

`docs/PRODUCT_SPEC.md`、`docs/DEVELOPMENT_PLAN.md` 和 `v2/docs/GAME-ROADMAP.md` 记录早期原型与 V2 决策，保留用于追溯；发生冲突时，**新的 V3 产品目标以本目录为准，已部署事实以代码为准**。

## V3.1 新增的关键产品决定（2026-10-28）

- **主要吸引力**：人物对话、角色成长和故事分支；不改成只读文字小说。
- **主要长期奖励**：通过真实经营和剧情获得有收藏价值的审核 CG；不以无限重复点击、抽奖或付费直接解锁关键剧情。
- **特效定位**：日常设备保持真实状态动效，大特效保留给首次来访、旧合同揭示、东街亮灯、黑雾危机与月心灯重燃。
- **惊喜系统**：主线回收六条伏笔，可探索六个可重访彩蛋；`10-FORESHADOWING-AND-EASTER-EGGS.md` 包含剧透，游戏 UI 未解锁时不可泄漏标题或预览。
- **先做小闭环**：首批 6 张 CG、序章及第一章、一次月纱初访、一条可解锁隐藏明信片；其余是后续内容，不得误报已完成。

**规则优先关系：** [01 产品方向](01-PRODUCT-VISION.md) 定义玩家体验，[02 自动生产](02-AUTO-PRODUCTION-PRD.md) 定义经济行为，[03 世界事件](03-WORLD-STATE-AND-QUESTS.md) 定义解锁权威性，[08 对话](08-NARRATIVE-DIALOGUE-UX.md) 和 [09 收藏](09-CG-COLLECTION-AND-ART.md) 定义表现， [10 伏笔](10-FORESHADOWING-AND-EASTER-EGGS.md) 定义悬念回收；一切 UI 不得单独制造领域奖励。
