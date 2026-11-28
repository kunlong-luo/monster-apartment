# 怪物公寓 · Monster Apartment

[打开游戏](https://kunlong-luo.github.io/monster-apartment/) · [发布版本](public/release.json) · [文档总入口](docs/README.md) · [美术资源总目录](docs/ART-RESOURCE-CATALOG.md) · [Issues](https://github.com/kunlong-luo/monster-apartment/issues)

Next.js 16 + React 19 + TypeScript strict + Tailwind CSS v4 + Motion + PixiJS 8。全屏哥特绘景、自动经营、人物招募与私人房间；优先 PC Web，同时保持手机可用。

## 当前可核实发布基线

2026-11-26 已核实当前主线 [e1aa356](https://github.com/kunlong-luo/monster-apartment/commit/e1aa356cf5940ed32e3ea80e18325adffc9d795a) 的 [Quality](https://github.com/kunlong-luo/monster-apartment/actions/runs/45742227852) 三作业及 [Pages](https://github.com/kunlong-luo/monster-apartment/actions/runs/45742328737) 成功；版本 V3.109.0。R13.1-A 建议公开免费 Alpha/试玩，暂缓正式商业发行；综合 73/100、内部发行目标 85/100（非充分条件），具体门槛和优先级统一见[风险台账](docs/engineering/GAP-REGISTER-2026-11-22.md)。PR #63 已同步，候选 Quality 成功，桌面/完整玩法待验；未合并。

2026-11-24，V3.109.0 正式主线 [80eb69a](https://github.com/kunlong-luo/monster-apartment/commit/80eb69abb56c8a0a398e53ff27cdf513e76b695e)：[Quality](https://github.com/kunlong-luo/monster-apartment/actions/runs/45392165404)、[Desktop Visual Review](https://github.com/kunlong-luo/monster-apartment/actions/runs/45392165400)、[Gameplay Browser Review](https://github.com/kunlong-luo/monster-apartment/actions/runs/45392165444)、[Pages](https://github.com/kunlong-luo/monster-apartment/actions/runs/45392330890) 全部成功。三功能由 [#53](https://github.com/kunlong-luo/monster-apartment/pull/53) 统一合并；#54/#58 的有效代码和测试原 blob 一致，重复 PR 已关闭。原包下载独立失败仍待处理，不代表正式美术审核。R12.84 仅整理文档，不改变 UI 版本。

- V3.103.0 欢迎页、头像、卡面与大厅过渡图已接入；正式 CG 人工签审仍未完成。
- V3.104.0 四位人物拥有独立背景/人物层的观景模式；原故事模式与真实热点保留。
- V3.105.0 PC 工坊采用 V1 绘景、月光街采用 V2 绘景；手机、Pixi 建造和存档保持既有路径。过渡图可见不等于 production 原画晋级。
- V3.109.0 仓库显示真实需求/采购反馈、公寓显式研究模式支持六门与 HUD 共存、工坊按真实产量显示三种工序动效；正常玩家场景、七路由、存档与审批不变。
- 完整玩法、跨页统一账本、真实玩家验证、原生高清正式原画仍须分别验收。查看[当前治理与风险](docs/README.md)。

2026-11-25 工程治理基线 [ef5aa5b](https://github.com/kunlong-luo/monster-apartment/commit/ef5aa5bc01c2d54d52ab7a666ebe3dcafaff7132) 的 [Quality](https://github.com/kunlong-luo/monster-apartment/actions/runs/45556789291) 与 [Pages](https://github.com/kunlong-luo/monster-apartment/actions/runs/45556888621) 成功；当时组件审计 92/92 可达、321/321 Vitest、144 媒体库存一致。R12.91 历史证据评分 **72/100**，85 是目标，非玩家评分；新 CSS 提交的[桌面视觉回归](https://github.com/kunlong-luo/monster-apartment/actions/runs/45556397863) 已成功、玩法仍待结果，正式原画和真人验证尚未完成。R12.92 四视口像素证据归档见[真实浏览器像素取证](docs/art-reviews/R12-01-REAL-BROWSER-PIXEL-EVIDENCE.md)，不等于高清原画已交付。评分与下一阶段只维护于[风险台账](docs/engineering/GAP-REGISTER-2026-11-22.md)。

资源用途分类：`public/art/` 当前 43 媒体，36 正常/回退、7 交互研究；R12.95 实际迁出 10 份离线研究、删除 3 份旧月纱肖像。具体文件、用途及迁退条件统一见[资源总目录](docs/ART-RESOURCE-CATALOG.md) 第 4.1 节；旧版文件或 review 名称不等于未使用。新原图拟定路径不等于实际入 Git。

## 七个正式游戏场景

| 路由 | 玩家功能 |
| --- | --- |
| `/` | 欢迎页、大厅、月纱互动、世界地图 |
| `/apartment/` | 四位正式人物的居所、共享经营进度与剧情 |
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

组件治理：`pnpm audit:components`（只读候选报告）、`pnpm test:component-audit`（审计逻辑测试）；CI 已接入，报告不是自动删除许可。R12.68 [Quality](https://github.com/kunlong-luo/monster-apartment/actions/runs/45374117852) 通过，320/320 Vitest；R12.69 收敛旧召唤与重复图鉴；R12.89 基线实际 92/92 模块 app 可达，继续移除已退役的底部导航选择器和无效 compact 参数，详见[当前架构](docs/CURRENT_ARCHITECTURE.md)。

文档治理：`pnpm audit:doc-links` 已接入 Quality，R12.86 自动检查全部 Git 跟踪 Markdown（基线 187 份），并要求 16 份核心入口始终存在。历史证据使用固定 Git SHA；检查仓库相对路径，不替代外链、锚点及内容事实审查。

资源治理：`pnpm audit:media-duplicates` 核查 Git 跟踪媒体的实际字节，只有明确路径和 Git blob 的授权例外可重复；R12.90 同一门禁核对资源总目录第 5 节的完整路径、实际字节及 Git blob 前缀，并输出分目录体积；`pnpm test:media-duplicates` 覆盖重复、缺漏、失效路径和不一致记录。

工作流入口：现行 10 份 GitHub Actions 分为 Quality/Pages、桌面/玩法回归、原画像素证据、三个来源审查、工坊性能/WebGL。已退役固定事故取消和两条已不存在候选分支的转换工作流；转换脚本保留用于历史复现，不直接在 main 重跑旧批次。具体边界见[迭代手册](docs/engineering/ITERATION-PLAYBOOK.md)。

日常：`pnpm check:design`、`pnpm typecheck`、`pnpm lint`、`pnpm test`、`NEXT_STATIC_EXPORT=1 pnpm build`。完整质量门禁见 [Quality 工作流](.github/workflows/quality.yml)，浏览器按风险分层运行。主分支保护、真实试玩仍由 [#9](https://github.com/kunlong-luo/monster-apartment/issues/9)、[#10](https://github.com/kunlong-luo/monster-apartment/issues/10) 跟踪。

R14.1-U 候选：公寓、工坊、街区、委托和仓库共用 `monster-apartment:workshop-v2-lab` 经济快照；旧 `monster-apartment:cozy:v1` 仅保留原始记录供只读导出，不再计时或结算，不擅自兑换/删除。候选尚待实机与 CI 验收。

R12.96：图鉴装饰与地点海报分别归入 `public/art/decorations/`、`public/art/postcards/`，旧目录退役，运行引用和来源清单已同步；详见[资源总目录](docs/ART-RESOURCE-CATALOG.md)。

## R12.104 · 现行职责与验收

[美术资源总目录](docs/ART-RESOURCE-CATALOG.md)：完整迁移经过、失败修复和审计证据统一保存在资源总目录；清理前各文档的完整版本见 [372f26f 固定快照](https://github.com/kunlong-luo/monster-apartment/tree/372f26f28933050840b6c6f8ff5f18ed99075e44)。不再逐轮复制报告。
