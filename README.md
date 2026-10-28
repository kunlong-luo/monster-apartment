# 怪物公寓 · Monster Apartment

**唯一正式版本**：Next.js 16 + React 19 + TypeScript + Tailwind CSS v4 + Motion + PixiJS 8。

[打开游戏](https://kunlong-luo.github.io/monster-apartment/)

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

## V3.3 剧情、角色养成、装备锻造与自动经营策划（待开发）

已建立 [**V3.3 完整策划文档目录**](docs/v3/README.md)，包含：

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
- [**人物六维属性、品阶潜力和等级训练设计**](docs/v3/17-CHARACTER-ATTRIBUTES-AND-POTENTIAL.md)
- [**装备首饰与自动锻造系统需求**](docs/v3/18-EQUIPMENT-FORGING-PRD.md)
- [首批装备锻造配方、外观与角色搭配](docs/v3/19-EQUIPMENT-RECIPES-AND-ART.md)

**注意：以上是后续开发基线，不代表自动生产、剧情演出、CG 收藏、隐藏彩蛋、正式概率招募、人物私室、六维属性、自动锻造或人物支线已经上线。** 历史 V0.5 灵核抽卡文档不等同当前正式系统；新招募须先验证迁移。 当前 V2 工坊仍按照游戏日结算；正式迁移之前保留原有数据和玩法。

## 开发

需要 Node.js 24、pnpm 12，开发模式下 PixiJS 资源由独立静态服务器提供。

```bash
pnpm install --frozen-lockfile
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

推送 `main` 后须先通过 GitHub Actions `Quality`，再由 `Deploy GitHub Pages` 发布。新站只部署 Next.js 页面和工坊 PixiJS 静态资源。
