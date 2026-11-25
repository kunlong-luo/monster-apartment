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

2026-11-25 工程治理基线 [ef5aa5b](https://github.com/kunlong-luo/monster-apartment/commit/ef5aa5bc01c2d54d52ab7a666ebe3dcafaff7132) 的 [Quality](https://github.com/kunlong-luo/monster-apartment/actions/runs/45556789291) 与 [Pages](https://github.com/kunlong-luo/monster-apartment/actions/runs/45556888621) 成功；最新组件审计 92/92 可达、321/321 Vitest、144 媒体库存一致。R12.91 综合证据暂评 **72/100**，85 是目标，非玩家评分；新 CSS 提交的[桌面视觉回归](https://github.com/kunlong-luo/monster-apartment/actions/runs/45556397863) 已成功、玩法仍待结果，正式原画和真人验证尚未完成。R12.92 四视口像素证据归档见[真实浏览器像素取证](docs/art-reviews/R12-01-REAL-BROWSER-PIXEL-EVIDENCE.md)，不等于高清原画已交付。评分与下一阶段只维护于[风险台账](docs/engineering/GAP-REGISTER-2026-11-22.md)。

资源用途分类：`public/art/` 当前 43 媒体，36 正常/回退、7 交互研究；R12.95 实际迁出 10 份离线研究、删除 3 份旧月纱肖像。具体文件、用途及迁退条件统一见[资源总目录](docs/ART-RESOURCE-CATALOG.md) 第 4.1 节；旧版文件或 review 名称不等于未使用。新原图拟定路径不等于实际入 Git。

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

组件治理：`pnpm audit:components`（只读候选报告）、`pnpm test:component-audit`（审计逻辑测试）；CI 已接入，报告不是自动删除许可。R12.68 [Quality](https://github.com/kunlong-luo/monster-apartment/actions/runs/45374117852) 通过，320/320 Vitest；R12.69 收敛旧召唤与重复图鉴；R12.89 基线实际 92/92 模块 app 可达，继续移除已退役的底部导航选择器和无效 compact 参数，详见[当前架构](docs/CURRENT_ARCHITECTURE.md)。

文档治理：`pnpm audit:doc-links` 已接入 Quality，R12.86 自动检查全部 Git 跟踪 Markdown（基线 187 份），并要求 16 份核心入口始终存在。历史证据使用固定 Git SHA；检查仓库相对路径，不替代外链、锚点及内容事实审查。

资源治理：`pnpm audit:media-duplicates` 核查 Git 跟踪媒体的实际字节，只有明确路径和 Git blob 的授权例外可重复；R12.90 同一门禁核对资源总目录第 5 节的完整路径、实际字节及 Git blob 前缀，并输出分目录体积；`pnpm test:media-duplicates` 覆盖重复、缺漏、失效路径和不一致记录。

工作流入口：现行 10 份 GitHub Actions 分为 Quality/Pages、桌面/玩法回归、原画像素证据、三个来源审查、工坊性能/WebGL。已退役固定事故取消和两条已不存在候选分支的转换工作流；转换脚本保留用于历史复现，不直接在 main 重跑旧批次。具体边界见[迭代手册](docs/engineering/ITERATION-PLAYBOOK.md)。

日常：`pnpm check:design`、`pnpm typecheck`、`pnpm lint`、`pnpm test`、`NEXT_STATIC_EXPORT=1 pnpm build`。完整质量门禁见 [Quality 工作流](.github/workflows/quality.yml)，浏览器按风险分层运行。主分支保护、真实试玩仍由 [#9](https://github.com/kunlong-luo/monster-apartment/issues/9)、[#10](https://github.com/kunlong-luo/monster-apartment/issues/10) 跟踪。

存档键保持 `monster-apartment:cozy:v1` 与 `monster-apartment:workshop-v2-lab`，两套经营状态独立；不允许为了整理仓库重置、迁移或假装共享余额。

R12.96：图鉴装饰与地点海报分别归入 `public/art/decorations/`、`public/art/postcards/`，旧目录退役，运行引用和来源清单已同步；详见[资源总目录](docs/ART-RESOURCE-CATALOG.md)。

R12.97：将 public/art 顶层业务目录与现存根文件纳入现有 `pnpm audit:repository-layout` 门禁；旧 a05、feature-postcards、任意未登记顶层目录或根文件均失败。新用途必须同步更新资源目录、public/art 入口和门禁；现存角色、封面、房间、场景及回退路径不动。下一批优先核对正常 PC 场景 review 路径，未完成完整引用扫描前不迁移或删除；暂缓批量生成新美术。

R12.98：将正常 PC 工坊、月光街两张过渡 WebP 由各自 review/ 移入地点目录，命名 workshop-desktop-transition.webp、town-desktop-transition.webp；原 Git blob、原始 PNG、四候选 SHA-256、尺寸、review-only 状态及未选研究图不变。同步两处页面导入、两处真实浏览器断言、生成器、审核器及资源清单。旧路径不再保留副本；手机背景、故障回退、正式场景准入、存档不变。公开媒体仍 43、全仓 141；新提交 Quality、桌面浏览器及 Pages 须独立核验。暂缓批量新美术；下一批审查角色与欢迎封面目录。

R12.99（第一批：欢迎封面）：两张双端群像 WebP 由 beauty-beasts/cover/ 原 Git blob 迁入 public/art/covers/，保留 world-cover.webp 与 world-cover-mobile.webp 文件名、欢迎页语义标记和大厅故障回退。同步欢迎页、大厅、R12.53 转换脚本及 manifest、库存测试、设计资源清单和当前缺口台账；目录门禁登记 covers 并拒绝旧封面目录回流。媒体仍 43 公开、141 全仓；未改变审批、图片字节、布局、概率或存档。人物目录仍为 beauty-beasts/characters/，须完成头像、CG 晋级脚本、历史证据及动态路径引用核对后独立迁移（R12.99 第二批）；不宣称全部角色目录已收敛。暂缓批量新美术；新提交 CI、桌面及 Pages 结果独立验收。

R12.99 第二批：将 beauty-beasts/characters/ 的 3 张头像、3 张候选 CG 原 Git blob 迁入 public/art/characters/<id>/，同时迁移 cg-manifest.json 并更新五卡正式/预览槽、运行注册、CG 审核/晋级/生成、源图映射、测试及现行 SOP。beauty-beasts/ 整个公开历史目录退役，门禁登记 characters 并拒绝旧目录回流。月纱根目录三张 V3 肖像仍留待 R12.101；泉泡/炽角继续共享 rooms 下站姿，不重建两张重复候选。五卡仍 portrait（0/5 production），现行原画、哈希、身份、抽卡、存档、回退不变。固定历史 SHA URL、历史清单与 legacyOutput 保留旧路径。43 公开媒体、141 全仓媒体不变；新 SHA 的 Quality、真实浏览器及 Pages 独立验收。暂缓批量新美术；下一阶段 R12.100 核查房间正常观景与显式研究图路径。

R12.100 第一批（发布修复优先）：R12.99 第二批 5a44daf 的 Quality 静态导出与桌面浏览器失败，Pages 跳过；CI 日志定位工坊全景及派工控件共六个旧头像静态导入。两组件改为复用 HEROINE_FACE_ART 唯一注册表，保持图片、角色 ID、显示行为和存档不变。扩展 audit:repository-layout，在 app/src/engine 的运行代码及 CSS/JSON 中扫描退役 beauty-beasts、a05、feature-postcards 和 PC 场景 review 路径的字面引用；历史文档和 provenance 的旧路径不参与此运行引用门禁。新 SHA 需独立通过 Quality、桌面及 Pages 验收，之后才迁移私人房间 8 个观景层；显式月纱审稿图及回退保留。没有移动、删除或新增图片；43 公开媒体、141 全仓媒体不变。继续暂停批量生成新美术。

R12.100 第二批：四个房间的 8 张常规观景/显式审稿共用 WebP 原 Git blob 迁至 rooms/<id>/scenic/{background,standing}.webp；roomScenicArt 统一普通观景与显式审稿的路径解析；R12.57 转换、审核与输出清单、R12.53 转换清单、CG 预览注册及审核、单元与真实浏览器断言同步。泉泡、炽角仍共享站姿，四张 concept-scene.svg 与独立月纱 room-review 保留，正式 room manifest、剧情热点、原画、Alpha、SHA-256、审批、存档不变；旧四个 review 目录防回流。公开媒体 43、全仓 141，未新增美术。前置修复 029f019 已通过 Quality/Pages；本次提交仍须独立验收。下一批 R12.101 整理根目录散落肖像与大厅图。

R12.101 第一批：四张大厅 WebP（V2、V3、V4 桌面与 V4 手机）原 Git blob 迁入 public/art/world-scenes/lobby/，保留原文件名；正常大厅、欢迎页回退、公寓背景及 Pixi V3→V2 回退均保留。engine/scripts/build.mjs 只调整源路径，dist/assets 输出文件名不变；同步 R12.53 转换器、清单、测试及目录门禁，禁止根目录旧大厅路径回流。未新增、删除或重新编码媒体，43 公开媒体与 141 全仓媒体保持不变。前置 R12.100 已通过 Quality/Pages，本提交须独立验收。月纱三张根目录肖像留待 R12.101 第二批；暂停新增美术。

R12.101 第二批前置发布修复：ffe0698 的 Quality（45572993876）目录审计及静态导出失败，Pages（45573188961）跳过。实际 CI 日志定位 world-ui.tsx 的 V3 背景和 gothic-summon-screen.tsx 的 V3/V2 背景，共三处旧 public/art/lobby-hero-v*.webp 静态导入。修复为 world-scenes/lobby/ 同一原图路径；保留所有回退及 Pixi dist/assets 公开文件名，不修改图片、玩法、存档或审核状态。原图 43 公开、141 全仓媒体不变。月纱三张根目录肖像暂不迁移，须先确认本修复 Quality/Pages，并完成全仓引用预检（包括静态导入、CSS、动态路径、机器清单、构建复制和测试）。目录门禁在本次故障中正确报告三处遗留路径，不能以树/哈希一致代替编译。当前远端逐文件读取无法证明穷尽扫描，后续路径迁移应先在同一候选 SHA 完成 audit:repository-layout、pnpm build、Pixi build 和定向测试，再作为发布候选；若无法本地执行，先使用临时验证分支的 CI，成功后快进 main，避免再次直接引入构建失败。

R12.101 发布收口：bfff544 的 Desktop Visual Review 45573444869、Gameplay Browser Review 45573444886、Quality 中 static-export 与 pixi-v2-scaffold 已通过；checks 的 pnpm test 有 318 通过/3 失败（64 个测试文件）。三个失败均源于 tests/typescript-tailwind-migration.vitest.test.ts 的旧大厅路径（静态导入、WebP 文件读取、引擎复制源）。仅更新至 public/art/world-scenes/lobby/，保留所有原有格式、尺寸、字节门槛及运行/回退断言；同时新增已保留 V2 文件存在与引擎输出名检查。新 SHA 须独立通过 Quality/Pages，不以此前浏览器成功代替。月纱迁移将在独立候选 PR 验证，不直接将未经构建的迁移提交 main。

R12.101 第二批候选：月纱头像、半身像、肖像三张原 Git blob 迁入 public/art/characters/yuesha/（原文件名不变），同步跨页面静态导入、人物注册、抽卡公开 URL、CG 身份参考、R12.53 转换器及 manifest、设计清单、资源测试与目录门禁。Pixi 构建仅改变源路径，dist/assets/yuesha-avatar-v3.webp 及引擎加载链不变。公开 art 根目录只允许 README.md 和 r12-53-transition-manifest.json；43 公开、141 全仓媒体、原始像素、身份、卡面审批、存档、概率与回退保持不变。此迁移在独立 PR 进行候选 CI，未通过前不得称已合并或上线。

R12.101 第二批 PR #61 验收修复：主线 c6c0624 的 Quality 45577636793 与 Pages 45577758778 均成功；候选 2e39b0f 的目录审计与静态构建因六处旧月纱路径失败（45577859432），桌面及像素检查由相同缺图故障阻塞。补齐 room-memory-gallery、room-resident-sprite、yuesha-memory-shelf、SummonHeroineSpotlight、summon-dialogs、summon-showcase 的原图静态导入；不改渲染行为、原始图片、概率、存档及准入。继续在同一 PR 验证，未通过不合并。

R12.102 迁移前实盘：public/assets/aistudio/ 仅三张 PNG，合计 9,161,328 B；按 Git tree 精确列在第 5 节（当前仍保留）。docs/ 内媒体 39 项、17,428,549 B：art-reviews 38 项（含 WineChan 来源/审稿及人物姿态证据），design 仅 layout-map.svg 1 项（现有设计说明直接引用）。下一批优先把三张公开历史设计参考原字节移出部署目录，目标 docs/design/2026-10-29-gothic-red-gold/references/；先逐个验证实际引用、原图 SHA-256 与映射，不按文件名猜测归属或授权。WineChan candidate-05.webp 与运行审稿图为已登记的 155188 B 唯一重复组，保留两条路径和 intake 审核链，待明确引用与许可后再处理；不删除证据。旧日期的文档仅在无独有规范、验收、授权或入站链接时退役至固定 Git SHA。此次仅完成分类与计划，不声称已迁移/删除历史文件或降低线上包大小。

R12.102 第一批候选（PR #61）：fcfecf4 的静态导出、Pixi 构建与目录审计通过，Quality 因 CG-IDENTITY-POSE-COMPARISON 两处旧月纱 Markdown 图片链接失败（45586490095），现已修正。三张原 public/assets/aistudio PNG 原 Git blob 迁入 docs/design/2026-10-29-gothic-red-gold/references/，合计 9,161,328 B；退役公开目录并新增运行引用门禁，更新设计说明、路线图、执行清单及 reference manifest 的实际仓库副本记录。旧外部原始设计清单不改写、未核实 SHA-256 一一对应，不将匿名图片猜测为指定原图；保留旧文件名便于追溯。全仓 141 媒体、156439517 B 不变，public/art 43 项不变，整个 public 媒体 47→44 项，docs 媒体 39→42 项、26589877 B。候选 CI 需独立验证静态导出、运行与文档引用；未完成全仓动态路径穷尽审查，未合并/部署前不宣称线上包缩减。未删除设计证据或改变玩法、存档、审批。

R12.103 候选全量审计（31cdcb3 / Quality 45586963823，checks job 139110904572）：完整 Git tree 724 个 blob、185 Markdown（docs 内 179）、19 CSS；目录 12 根/0 违规，621 条文档链接/0 违规，旧引擎可执行路径 0 违规。组件审计 333 文件、11 app roots、92 组件/样式全部 app-reachable，0 auxiliary-only、0 review-unreachable、0 unresolved local references、0 nonliteral imports；不能据此证明每条 CSS 选择器或动态资源路径有效，暂不删除组件/CSS。媒体真实字节 SHA-256 审计 141 路径、156439517 B、1 组已登记 WineChan 155188 B 重复、0 意外重复，库存匹配；历史三图隔离已在候选完成。Next 静态导出和 Pixi 三方检查通过，类型与 lint 通过。Vitest 62/64 文件通过，318/319 已执行测试通过，room-art-promotion 套件收集失败，room-art-review-pipeline 一项失败，皆为旧月纱胸像路径；本次只改两个 fixture 路径，保留真实 WebP 与审批门槛测试，需新 SHA 重跑。PR #61 尚未合并。
