# 怪物公寓 · Monster Apartment

[打开游戏](https://kunlong-luo.github.io/monster-apartment/) · [发布版本](public/release.json) · [文档总入口](docs/README.md) · [美术资源总目录](docs/ART-RESOURCE-CATALOG.md) · [Issues](https://github.com/kunlong-luo/monster-apartment/issues)

Next.js 16 + React 19 + TypeScript strict + Tailwind CSS v4 + Motion + PixiJS 8。全屏哥特绘景、自动经营、人物招募与私人房间；优先 PC Web，同时保持手机可用。

## 当前可核实发布基线

2026-11-24，V3.105.0，功能代码 [0f9188a](https://github.com/kunlong-luo/monster-apartment/commit/0f9188a282dfa8a831b9d4d8d389a43e4ed1e2d0)：[Quality](https://github.com/kunlong-luo/monster-apartment/actions/runs/45371899930) 与 [Pages](https://github.com/kunlong-luo/monster-apartment/actions/runs/45372059731) 成功。[Desktop Visual Review](https://github.com/kunlong-luo/monster-apartment/actions/runs/45371900097) 与 [Gameplay Browser Review](https://github.com/kunlong-luo/monster-apartment/actions/runs/45371899905) 在本次核查时仍运行中；不可把部署等同完整浏览器验收。此为有日期的证据，不是自动更新状态。

- V3.103.0 欢迎页、头像、卡面与大厅过渡图已接入；正式 CG 人工签审仍未完成。
- V3.104.0 四位人物拥有独立背景/人物层的观景模式；原故事模式与真实热点保留。
- V3.105.0 PC 工坊采用 V1 绘景、月光街采用 V2 绘景；手机、Pixi 建造和存档保持既有路径。过渡图可见不等于 production 原画晋级。
- 完整玩法、跨页统一账本、真实玩家验证、原生高清正式原画仍须分别验收。查看[当前治理与风险](docs/README.md)。

## 七个正式游戏场景

| 路由 | 玩家功能 |
| --- | --- |
| `/` | 欢迎页、大厅、月纱互动、世界地图 |
| `/apartment/` | 建房、入住、住客与事件 |
| `/workshop/` | 设备建造、派工、自动生产与升级 |
| `/town/` | 街区、采购与居民委托 |
| `/orders/` | 委托和特别订单 |
| `/characters/` | 招募、图鉴、人物档案及房间 |
| `/warehouse/` | 真实库存与采购 |

研究工具 `/research/first-session/` 不是第八个正式场景；旧 classic/legacy/survival/workshop-lab 页面不恢复。

## 仓库目录与所有权

| 路径 | 职责 |
| --- | --- |
| [app/](app/) | Next App Router、页面、根布局与全局样式 |
| [src/](src/) | React UI、核心规则、资产注册、客户端状态与工具 |
| [v2/src/](v2/src/)、[v2/scripts/](v2/scripts/)、[v2/art/](v2/art/) | 正在使用的 Pixi sidecar、经营引擎与贴图，不是废弃游戏 |
| [public/](public/) | Web 运行时资源、回退、审稿资源与版本标识 |
| [art-sources/](art-sources/) | 源 PNG 与来源/哈希清单，不直接作为页面素材 |
| [artwork/](artwork/) | 美术元数据与审核清单 |
| [scripts/](scripts/) | 原画转换、资源审核、依赖与设计检查 |
| [tests/](tests/)、[e2e/](e2e/) | 单元/集成及浏览器验证 |
| [docs/](docs/) | 现行规范、产品策划、历史审稿与证据；从索引进入 |
| [management/](management/) | 任务表与历史管理记录；当前问题以 Issues 核实 |
| [vendor/](vendor/)、[.agents/](.agents/) | Impeccable 子模块及设计技能链接 |
| [.github/](.github/) | Quality、视觉、玩法及 Pages 工作流 |
| [.aistudio/](.aistudio/)、[v2/docs/](v2/docs/) | 历史设计与旧方案；非运行时，不作为新开发规范 |

根 `bun.lock` 是当前 CI 安装依据；根 `pnpm-lock.yaml` 实际存在，兼容用途尚待确认，不能称不存在或擅删。Pixi 的 `v2/package-lock.json` 单独维护。资源路径与哈希以[资源总目录](docs/ART-RESOURCE-CATALOG.md)为索引，生产状态以相应 manifest 为准。

## 开发与验证

先读 [AGENTS.md](AGENTS.md)、[PRODUCT.md](PRODUCT.md)、[DESIGN.md](DESIGN.md) 和[迭代手册](docs/engineering/ITERATION-PLAYBOOK.md)。Node 版本见 [.node-version](.node-version)，pnpm 12.13.0 用于执行脚本。

```sh
bun install --frozen-lockfile
npm --prefix v2 ci
pnpm dev
# 另一个终端：Pixi 静态服务
npm --prefix v2 run dev
```

组件治理：`pnpm audit:components`（只读候选报告）、`pnpm test:component-audit`（审计逻辑测试）；CI 已接入，报告不是自动删除许可。

日常：`pnpm check:design`、`pnpm typecheck`、`pnpm lint`、`pnpm test`、`NEXT_STATIC_EXPORT=1 pnpm build`。完整质量门禁见 [Quality 工作流](.github/workflows/quality.yml)，浏览器按风险分层运行。主分支保护、真实试玩仍由 [#9](https://github.com/kunlong-luo/monster-apartment/issues/9)、[#10](https://github.com/kunlong-luo/monster-apartment/issues/10) 跟踪。

存档键保持 `monster-apartment:cozy:v1` 与 `monster-apartment:workshop-v2-lab`，两套经营状态独立；不允许为了整理仓库重置、迁移或假装共享余额。
