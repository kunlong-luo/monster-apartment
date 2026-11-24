# 怪物公寓 · Monster Apartment

哥特幻想人物收藏 × 自动化模拟经营。Web PC 优先，手机可玩；无第二套旧游戏。

[打开游戏](https://kunlong-luo.github.io/monster-apartment/) · [发布记录与工作流](https://github.com/kunlong-luo/monster-apartment/actions) · [问题与任务](https://github.com/kunlong-luo/monster-apartment/issues)

## 开发与维护唯一入口

- [文档总入口](docs/README.md)：按任务找到唯一现行规范、缺口与历史证据。
- [AGENTS.md](AGENTS.md)：任何开发会话先读；[PRODUCT.md](PRODUCT.md) 定产品范围，[DESIGN.md](DESIGN.md) 定视觉。
- [架构](docs/CURRENT_ARCHITECTURE.md) · [美术资源目录](docs/ART-RESOURCE-CATALOG.md) · [现行缺口](docs/engineering/GAP-REGISTER-2026-11-22.md) · [迭代手册](docs/engineering/ITERATION-PLAYBOOK.md)。

## 仓库目录职责（保留清单）

| 路径 | 用途 |
| --- | --- |
| [app/](app/) | Next.js App Router、根布局及全局样式；七条正式游戏路由 |
| [src/](src/) | React UI、TS 规则、状态、资源注册与服务；禁止新增第二套游戏页面 |
| [v2/](v2/) | **现行** PixiJS 8 工坊运行时、经营规则、构建与资源；目录名是兼容历史，不是废弃项目 |
| [public/](public/) | 静态导出实际可访问文件，含 [美术](public/art/)、研究工具、发布版本；不存原始生成大图 |
| [art-sources/](art-sources/) | 原始 PNG、来源与 SHA 证据，非运行时；[源图清单](art-sources/source-catalog.json) |
| [docs/](docs/) | 现行规范、剧情 PRD、ADR、阶段证据、来源授权；不要另建平行文档根目录 |
| [scripts/](scripts/) | 原画转换、准入、审计、构建辅助，不是玩家代码 |
| [tests/](tests/) | Vitest 规则与数据不变量 |
| [e2e/](e2e/) | Playwright 真实浏览器交互、视觉与性能取证 |
| [.github/](.github/) | Quality、浏览器、Pages 等工作流 |
| [vendor/](vendor/) / [.agents/](.agents/) | 固定 Impeccable 子模块及技能入口，保留 |

`artwork/`、`management/` 和 `.aistudio/` 是本轮清理对象；最终移除与保留的精确路径见 [治理报告](docs/engineering/R12-66-REPOSITORY-GOVERNANCE-2026-11-24.md) 与机器检查。原始素材、许可、存档兼容、真实运行依赖不得因目录名称误删。

## 正式游戏路线

| 路径 | 功能 |
| --- | --- |
| [大厅](/monster-apartment/) | 月纱、召唤入口、世界地图 |
| [公寓](/monster-apartment/apartment/) | 六房经营、入住与月纱私室 |
| [工坊](/monster-apartment/workshop/) | 15 格建设、派工、自动生产 |
| [月光街](/monster-apartment/town/) | 采购与居民交易 |
| [委托](/monster-apartment/orders/) | 订单与自动履约 |
| [人物](/monster-apartment/characters/) | 收藏、档案与私室 |
| [仓库](/monster-apartment/warehouse/) | 库存及装备相关操作 |

上表为站点子路径；[正式站](https://kunlong-luo.github.io/monster-apartment/) 可由地图进入。不存在 classic/legacy/survival/workshop-lab 独立游戏。

## 发布与质量

版本真值：[public/release.json](public/release.json)、[运行时版号](src/core/game-release.ts)；部署真值是对应 SHA 的 Quality 与 Pages，而不是文档里的旧日期。核实基线：V3.104.0 房间观景已部署（[Pages](https://github.com/kunlong-luo/monster-apartment/actions/runs/45370337560)，[完整回归 191 通过/3 跳过](https://github.com/kunlong-luo/monster-apartment/actions/runs/45368652700)）；V3.105.0 场景已合并 `0f9188a2` 且 [主线 Quality](https://github.com/kunlong-luo/monster-apartment/actions/runs/45371899930) 通过，Pages 以实际结果为准。正式 CG 0/5，正式机器原画 0/9；过渡展示不等于人审批准。

## 本地开发

Node 24、Bun（根依赖按 bun.lock）、pnpm 12（执行 scripts）、npm（v2 独立依赖）。先 `git submodule update --init --recursive`。

```sh
bun install --frozen-lockfile
npm --prefix v2 ci
# 两个终端：
pnpm dev
npm --prefix v2 run dev
```

```sh
pnpm check:stable-deps
pnpm check:design
pnpm typecheck
pnpm lint
pnpm test
pnpm audit:room-art
pnpm audit:r12-review-art
node scripts/audit-r12-57-room-review.mjs
node scripts/audit-r12-61-world-scene-review.mjs
npm --prefix v2 run build
NEXT_STATIC_EXPORT=1 pnpm build
```

重大交互做定向 Playwright，里程碑再执行完整回归。不得重置 `monster-apartment:cozy:v1`、`monster-apartment:workshop-v2-lab` 或人物收藏存档。主线保护和真实玩家测试仍需实际验证。
