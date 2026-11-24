# 怪物公寓 · Monster Apartment

[打开游戏](https://kunlong-luo.github.io/monster-apartment/) · [发布版本](public/release.json) · [文档总入口](docs/README.md) · [美术资源总目录](docs/ART-RESOURCE-CATALOG.md) · [Issues](https://github.com/kunlong-luo/monster-apartment/issues)

Next.js 16 + React 19 + TypeScript strict + Tailwind CSS v4 + Motion + PixiJS 8。全屏哥特绘景、自动经营、人物招募与私人房间；优先 PC Web，同时保持手机可用。

## 当前可核实发布基线

2026-11-24，V3.109.0 正式主线 [80eb69a](https://github.com/kunlong-luo/monster-apartment/commit/80eb69abb56c8a0a398e53ff27cdf513e76b695e)：[Quality](https://github.com/kunlong-luo/monster-apartment/actions/runs/45392165404)、[Desktop Visual Review](https://github.com/kunlong-luo/monster-apartment/actions/runs/45392165400)、[Gameplay Browser Review](https://github.com/kunlong-luo/monster-apartment/actions/runs/45392165444)、[Pages](https://github.com/kunlong-luo/monster-apartment/actions/runs/45392330890) 全部成功。三功能由 [#53](https://github.com/kunlong-luo/monster-apartment/pull/53) 统一合并；#54/#58 的有效代码和测试原 blob 一致，重复 PR 已关闭。原包下载独立失败仍待处理，不代表正式美术审核。R12.84 仅整理文档，不改变 UI 版本。

- V3.103.0 欢迎页、头像、卡面与大厅过渡图已接入；正式 CG 人工签审仍未完成。
- V3.104.0 四位人物拥有独立背景/人物层的观景模式；原故事模式与真实热点保留。
- V3.105.0 PC 工坊采用 V1 绘景、月光街采用 V2 绘景；手机、Pixi 建造和存档保持既有路径。过渡图可见不等于 production 原画晋级。
- V3.109.0 仓库显示真实需求/采购反馈、公寓显式研究模式支持六门与 HUD 共存、工坊按真实产量显示三种工序动效；正常玩家场景、七路由、存档与审批不变。
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
| [engine/src/](engine/src/)、[engine/scripts/](engine/scripts/)、[engine/art/](engine/art/) | 正在使用的 Pixi sidecar、经营引擎与贴图，不是废弃游戏 |
| [public/](public/) | Web 运行时资源、回退、审稿资源与版本标识 |
| [art-sources/](art-sources/) | 源 PNG 与来源/哈希清单，不直接作为页面素材 |
| [scripts/](scripts/) | 原画转换、资源审核、依赖与设计检查 |
| [tests/](tests/)、[e2e/](e2e/) | 单元/集成及浏览器验证 |
| [docs/](docs/) | 现行规范、产品策划、历史审稿与证据；从索引进入 |
| [vendor/](vendor/)、[.agents/](.agents/) | Impeccable 子模块及设计技能链接 |
| [.github/](.github/) | Quality、视觉、玩法及 Pages 工作流 |

**根目录只允许上表对应的 12 个职责目录**：`app`、`src`、`engine`、`public`、`art-sources`、`scripts`、`tests`、`e2e`、`docs`、`.github`、`.agents`、`vendor`。不再保留 `.aistudio`、`artwork`、`management`、`docs/prototypes` 或旧 Gemini `metadata.json`。当前任务统一进入 Issues 和风险台账，历史记录通过 [清理前快照](https://github.com/kunlong-luo/monster-apartment/tree/782fc74fd6e597048a293cbf9777593447c76bb3) 追溯。`pnpm audit:repository-layout` 在 Quality 阻止未登记根目录和退役路径回流。工坊文档统一进入 [设备美术规格](docs/design/WORKSHOP-ASSET-SPEC.md)，旧 `v2/docs/` 已退役。`pnpm audit:engine-paths` 输出跨源码、构建、测试及文档的旧引擎路径检查（非文档旧路径失败）。

根 `bun.lock` 是当前 CI 安装依据；根 `pnpm-lock.yaml` 的 importer 仅锁定 packageManagerDependencies.pnpm 12.13.0，不是根应用依赖锁；保留工具链锁。Pixi 的 `engine/package-lock.json` 单独维护。资源路径与哈希以[资源总目录](docs/ART-RESOURCE-CATALOG.md)为索引，生产状态以相应 manifest 为准。

## 开发与验证

先读 [AGENTS.md](AGENTS.md)、[PRODUCT.md](PRODUCT.md)、[DESIGN.md](DESIGN.md) 和[迭代手册](docs/engineering/ITERATION-PLAYBOOK.md)。Node 版本见 [.node-version](.node-version)，pnpm 12.13.0 用于执行脚本。

```sh
bun install --frozen-lockfile
npm --prefix engine ci
pnpm dev
# 另一个终端：Pixi 静态服务
npm --prefix engine run dev
```

组件治理：`pnpm audit:components`（只读候选报告）、`pnpm test:component-audit`（审计逻辑测试）；CI 已接入，报告不是自动删除许可。R12.68 [Quality](https://github.com/kunlong-luo/monster-apartment/actions/runs/45374117852) 通过，320/320 Vitest；R12.69 收敛旧召唤与重复图鉴，详见[当前架构](docs/CURRENT_ARCHITECTURE.md)。

文档治理：`pnpm audit:doc-links` 已接入 Quality，R12.86 自动检查全部 Git 跟踪 Markdown（基线 187 份），并要求 16 份核心入口始终存在。历史证据使用固定 Git SHA；检查仓库相对路径，不替代外链、锚点及内容事实审查。

资源治理：`pnpm audit:media-duplicates` 核查 Git 跟踪媒体的实际字节，只有明确路径和 Git blob 的授权例外可重复；`pnpm test:media-duplicates` 验证新副本及变更例外被拒绝。

日常：`pnpm check:design`、`pnpm typecheck`、`pnpm lint`、`pnpm test`、`NEXT_STATIC_EXPORT=1 pnpm build`。完整质量门禁见 [Quality 工作流](.github/workflows/quality.yml)，浏览器按风险分层运行。主分支保护、真实试玩仍由 [#9](https://github.com/kunlong-luo/monster-apartment/issues/9)、[#10](https://github.com/kunlong-luo/monster-apartment/issues/10) 跟踪。

存档键保持 `monster-apartment:cozy:v1` 与 `monster-apartment:workshop-v2-lab`，两套经营状态独立；不允许为了整理仓库重置、迁移或假装共享余额。
