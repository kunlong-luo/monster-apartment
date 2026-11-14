# 怪物公寓 · Monster Apartment

**唯一正式版本**：Next.js 16 + React 19 + TypeScript + Tailwind CSS v4 + Motion + PixiJS 8。

[打开游戏](https://kunlong-luo.github.io/monster-apartment/)

## 已实现的人物房间纵切片

目前游戏已经有四位角色的可进入式房间：月纱的契约会客室、泉泡的铜管休息间、青枝的叶影温室、炽角的炉火修补间。四室具有独立的 **1920×1080 SVG 环境概念绘景**、分离的人物展示层、可点击物件、对话演出、调查线索与跨房间记录。SVG 环境不烘焙角色、按钮或数值，保持角色可以按出勤情况出现/离开。

**美术阶段声明：** 以上属于 **V3.8 独立分层概念场景**，不是已经审核通过的高清 WebP 正式原画；月纱的旧立绘尚未变成真实透明分层精灵。正式原画仍须通过 `scripts/audit-room-art.mjs` 中的背景分辨率、透明人物姿态、原创授权与人工审稿检查，再修改 `manifest.json` 的 `status` 为 `production`。旧公寓和工坊存档不迁移、不重置。

## 游戏入口

| 场景 | 网址 | 功能 |
| --- | --- | --- |
| 哥特大厅 | `/` | 月纱互动、主线任务、资源概览 |
| 公寓 | `/apartment/` | 建房、入住、装修、住客照顾与突发事件 |
| 月光工坊 | `/workshop/` | PixiJS 设备建设、派工、搬迁、升级、拆除回收、生产 |
| 月光街 | `/town/` | 商店采购、居民委托 |
| 委托大厅 | `/orders/` | 普通订单与月纱特别委托 |
| 角色 | `/characters/` | 工匠和岗位 |
| 仓库 | `/warehouse/` | 真实库存及采购 |

不再包含旧版 `/classic`、`/legacy`、`/survival` 和独立 `/workshop-lab` 实验室。

## 当前发布状态（2026-11-14 · R11.3 技术发布完成，治理与真人试玩待办）

- **最新核实的正式游戏代码基线**：`main` [`6d997e4d`](https://github.com/kunlong-luo/monster-apartment/commit/6d997e4d0b2a8229d989f5643bcd4bc19f311e08) 的 [Quality](https://github.com/kunlong-luo/monster-apartment/actions/runs/43551717561)、[Desktop Visual Review](https://github.com/kunlong-luo/monster-apartment/actions/runs/43551717522)、[Gameplay Browser Review full](https://github.com/kunlong-luo/monster-apartment/actions/runs/43551717531) 与 [Pages](https://github.com/kunlong-luo/monster-apartment/actions/runs/43551776453) **全部成功、四工作流同一 SHA**；完整浏览器日志为 **166 passed / 2 skipped / 0 failed**。随后若只合入文档，不代表新文档 SHA 再跑过 full；请以此功能代码 SHA 为准。
- **存档正确性**：[PR #19](https://github.com/kunlong-luo/monster-apartment/pull/19) 与 [PR #21](https://github.com/kunlong-luo/monster-apartment/pull/21) 已处理公寓损坏存档恢复、跨标签页正常操作与计时事务化。仍保留公寓 V1、工坊 V2 各自既有存档键，**并未**完成全游戏跨七页 V3 统一账本。
- **真人试玩准备工具已上线**：[PR #22](https://github.com/kunlong-luo/monster-apartment/pull/22) 的 [匿名观察记录页](https://kunlong-luo.github.io/monster-apartment/research/first-session/) 可供主持人手动输入 T01 等匿名编号并在本地导出单人 CSV；它不招募玩家、不上传或持久化观察记录。协议及字段模板见 [首次试玩执行协议](docs/research/2026-11-13-r113-first-session-protocol.md)。
- **主分支保护未完成**：GitHub `branches/main` 仍为 `protected:false`，`rulesets=[]`。管理员须按 [Issue #9](https://github.com/kunlong-luo/monster-apartment/issues/9) 设置 PR-only 与实际 required checks，再由 API 复核；CI 全绿不等于仓库规则已经生效。
- **真实玩家验证未完成**：尚无 10 名首次玩家的经过验证的独立观察记录；[Issue #10](https://github.com/kunlong-luo/monster-apartment/issues/10) 保持 open。不能用 E2E、主持人自己的试玩或空白表单计算玩家完成率／留存率。
- **正式美术未交付**：独立公寓、委托和仓库绘景仍由 [Issue #16](https://github.com/kunlong-luo/monster-apartment/issues/16) 跟进；九张机器静态候选为 `review`，工匠／月纱正式资源和机器动画仍为 `pending`，不可标记 `releaseReady`。
- **仍不等于 V3 全部交付**：此前的 R09.5 WebGL API 生命周期观测、R10.x 工坊迭代、R11–R11.2 显式自动履约与日历已经通过阶段性发布，但完整跨七页统一存档、人物 CG 量产及完整章节仍是后续目标。R11.3 的**技术发布门禁完成**不意味着治理、真实试玩或美术量产已经结束。

详见 [R11.3 发布证据与状态矩阵](docs/engineering/2026-11-12-r11-3-release-baseline.md)。历史任务的 `DONE` 是旧版阶段事实，不意味着 V3 全部完成。


## V3.4 人物与剧情长期策划（经营核心已有阶段性实现）

已建立 [**V3.4 完整策划文档目录**](docs/v3/README.md)，包含：

- [产品方向与七页经营循环](docs/v3/01-PRODUCT-VISION.md)
- [自动生产、离线经营、仓库与订单 PRD](docs/v3/02-AUTO-PRODUCTION-PRD.md)
- [世界状态、剧情事件与任务模型](docs/v3/03-WORLD-STATE-AND-QUESTS.md)
- [世界观与八位关键 NPC 人物档案](docs/v3/04-WORLD-AND-CHARACTERS.md)
- [**序章至第五章、三结局的完整主线剧本**](docs/v3/05-MAIN-STORY-SCRIPT.md)
- [人物支线及职业成长](docs/v3/06-CHARACTER-QUESTS.md)
- [分阶段开发计划与验收测试](docs/v3/07-ROADMAP-AND-ACCEPTANCE.md)
- [对话驱动的剧情交互与镜头规范](docs/v3/08-NARRATIVE-DIALOGUE-UX.md)
- [高品质故事 CG 收藏与美术生产规范](docs/v3/09-CG-COLLECTION-AND-ART.md)
- [**六条伏笔、六个隐藏彩蛋及回收机制（含剧透）**](docs/v3/10-FORESHADOWING-AND-EASTER-EGGS.md)
- [首个 15–20 分钟可玩章节与内容流水线](docs/v3/11-VERTICAL-SLICE-AND-CONTENT-PIPELINE.md)
- [**五品阶免费角色抽取：概率、保底及存档 PRD**](docs/v3/12-GACHA-RECRUITMENT-PRD.md)
- [首批招募人物卡池、性格与高品质卡牌美术规范](docs/v3/13-CARD-ROSTER-AND-ART-DIRECTION.md)
- [**每人独立房间、进入房间与角色对话 PRD**](docs/v3/14-CHARACTER-PRIVATE-ROOMS-PRD.md)
- [**二十位人物的专属房间原画与生活互动设定**](docs/v3/15-CHARACTER-ROOM-BIBLE.md)
- [**UR 神话·月蚀绯红主题及五品阶色彩规范**](docs/v3/16-RARITY-VISUAL-TOKENS.md)
- [**人物多维能力、品阶潜力和等级训练设计**](docs/v3/17-CHARACTER-ATTRIBUTES-AND-POTENTIAL.md)
- [**装备首饰与自动锻造系统需求**](docs/v3/18-EQUIPMENT-FORGING-PRD.md)
- [首批装备锻造配方、外观与角色搭配](docs/v3/19-EQUIPMENT-RECIPES-AND-ART.md)
- [**人物完整模拟：20 项能力、人格、心情、关系、习惯和人生档案**](docs/v3/20-HOLISTIC-PERSON-SYSTEM.md)
- [**月纱、泉泡、青枝等八位核心人物的完整生活档案**](docs/v3/21-CHARACTER-LIVING-PROFILES.md)

**注意：以上大多数是后续开发目标，并非全部已上线。** 工坊现已有 R10.9/R10.10 真实时间自动设备周期和 R11–R11.2 **由玩家显式开启**的自动履约；旧存档默认不自动履约，合同日历独立于设备周期。完整跨七页生产、Dexie V3 权威账本迁移、剧情演出、CG 收藏、隐藏彩蛋、正式概率招募、完整人物私室/档案/20 项能力、自动锻造和人物支线仍须分项实现与验收。历史 V0.5 灵核抽卡不等同当前正式系统；手动班次保持兼容。

## 开发

需要 Node.js 24、pnpm 12，开发模式下 PixiJS 资源由独立静态服务器提供。

```bash
bun install --frozen-lockfile
npm --prefix v2 ci
# 终端一
pnpm dev
# 终端二：只提供 PixiJS 资源，不再托管第二套游戏 UI
npm --prefix v2 run dev
```

本地检查：

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm e2e
NEXT_STATIC_EXPORT=1 pnpm build
```

## 架构

- `app/`：七个最新页面及 Tailwind v4 全局入口
- `src/components/game/gothic-*.tsx`：大厅、公寓与共享 HUD
- `src/components/moonwork/`：工坊、街区、委托、仓库与经营交互
- `src/core/cozy-engine.ts`：公寓规则
- `v2/src/workshop-engine.ts`：工坊、订单、市集规则
- `v2/src/workshop-lab-stage.ts`：PixiJS 2D 游戏舞台
- `v2/src/runtime.ts`、`v2/src/gothic-atmosphere.ts`：按需加载的 WebGL 资源
- `v2/art/`：当前角色及建筑素材

TypeScript 负责业务和 React UI，Tailwind 管布局与视觉，Motion 负责 UI 过渡，PixiJS 负责 2D 场景。

## 存档说明

当前公寓与工坊保留各自既有存档键：

- `monster-apartment:cozy:v1`
- `monster-apartment:workshop-v2-lab`

删除仓库中的旧代码**不会清空浏览器本地存储**。但公寓与工坊当前仍是两套独立经营状态；不要将两者星币视为共享余额。

目前 Pages 在 `main` 的 Quality 成功后触发；这**不是**受保护分支或完整浏览器门禁。R11.3 目标是 PR 必须通过 Quality 与 Desktop Visual Review，里程碑还需同 SHA 完整 Gameplay Browser Review，并审查 Pages 与截图；分支规则须实际配置且复查后才能宣称门禁生效。新站只部署 Next.js 页面与工坊 PixiJS 静态资源。
