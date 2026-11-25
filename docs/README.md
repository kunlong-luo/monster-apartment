# 《怪物公寓》文档总入口

> R12.101：本页是导航和治理状态，不重复各阶段报告。先读 [AGENTS.md](../AGENTS.md)；当前事实以源码、manifest、发布 SHA 与实际验收为准。

## 现行规范（新开发从这里开始）

| 任务 | 主入口 |
| --- | --- |
| 产品定位、核心循环 | [PRODUCT.md](../PRODUCT.md) |
| UI 与视觉系统 | [DESIGN.md](../DESIGN.md)、[Impeccable](IMPECCABLE.md)、[现行视觉合同 R12.37](design/R12-37-CURRENT-VISUAL-CONTRACT-2026-11-24.md) |
| 架构与工程边界 | [CURRENT_ARCHITECTURE.md](CURRENT_ARCHITECTURE.md)、[ADR](DECISIONS.md) |
| 研发流程与风险验收 | [ITERATION-PLAYBOOK.md](engineering/ITERATION-PLAYBOOK.md)、[依赖优先](engineering/DEPENDENCY-FIRST-FAST-ITERATION.md) |
| 美术目录、命名、实际资源 | [ART-RESOURCE-CATALOG.md](ART-RESOURCE-CATALOG.md)、[源图清单](../art-sources/source-catalog.json) |
| 新人物、CG、武器、服装与身份 | [CHARACTER-CREATION-SOP.md](CHARACTER-CREATION-SOP.md)、[人物 brief](templates/CHARACTER-DESIGN-BRIEF-TEMPLATE.md)、[五卡差异化](CHARACTER-CG-DIFFERENTIATION-V1.md)、[原生高清管线](CHARACTER-CG-NATIVE-PIPELINE.md) |
| 工坊设备美术 | [WORKSHOP-ASSET-SPEC.md](design/WORKSHOP-ASSET-SPEC.md)、[机器清单](../engine/art/asset-pack.v1.json) |
| 独立场景原画审核 | [R12 原画入库规则](art-reviews/R12-02-SCENE-ART-INTAKE.md)、[场景视觉验收](engineering/R12-41-INDEPENDENT-SCENE-VISUAL-REVIEW-2026-11-24.md) |
| 当前缺口和任务 | [风险台账](engineering/GAP-REGISTER-2026-11-22.md)、[GitHub Issues](https://github.com/kunlong-luo/monster-apartment/issues) |
| 真人首次试玩 | [观察协议](research/2026-11-13-r113-first-session-protocol.md) |

## 现行发布与美术边界

版本与发布入口统一见[根 README](../README.md)，不在各报告反复复制当前状态。重要最近证据：[R12.54 转换回读](art-reviews/R12-54-TRANSITION-ASSET-VERIFICATION-2026-11-24.md)、[R12.60 房间观景](design/R12-60-PLAYER-ROOM-SCENIC-MODE-2026-11-24.md)、[R12.62 PC 世界场景](art-reviews/R12-62-WORLD-PC-TRANSITION-2026-11-24.md)、[R12.64 合并记录](engineering/R12-64-ROOM-RELEASE-WORLD-INTEGRATION-2026-11-24.md)。上述均为当时的快照，不因后来合并而修改原审稿结论。

## 历史资料与长期策划

| 目录/文档 | 职责 |
| --- | --- |
| [长期产品与内容策划](v3/README.md) | R12.77 已由 88 份减至 72 份；保留剧情、人物和独立证据，重复实施说明归 Git 历史；不是上线功能清单 |
| [design/](design/) | 设计原稿、R12 历史迭代与参考证据 |
| [art-reviews/](art-reviews/) | 原画来源、授权、像素、审稿、候选和历史证据 |
| [engineering/](engineering/) | 历史工程验收、事故复盘、长期迭代手册 |
| [CHANGELOG.md](CHANGELOG.md) | 版本演进 |
| [V0.x 历史规划与实验](https://github.com/kunlong-luo/monster-apartment/tree/f3a3b708f4ae8cda2ef1d4ee9088c71c9eef36ac/docs) | 六份旧 Markdown 已退役；原型、旧技术栈、灵核、守卫战仅供追溯，不覆盖现行产品 |
| [旧工坊文档快照](https://github.com/kunlong-luo/monster-apartment/tree/e4d74994de44989f3e16296caf9f85e118ab807c/v2/docs) | 旧路线、旧路由、旧角色方案；仅历史追溯 |
| [旧原画归档索引](art-reviews/legacy-2026-10-29-catalog.json) | 2026-10-29 外部归档元数据，非实际在仓库的媒体路径 |
| [历史发布基线 R11.3](engineering/2026-11-12-r11-3-release-baseline.md) | 历史完整回归及当时治理状态，不替代新 SHA |

## R12.67 治理核查与 85 分目标

基线：2026-11-24，`0f9188a282dfa8a831b9d4d8d389a43e4ed1e2d0`，完整 Git 树未截断。766 个跟踪 blob、220 份 Markdown、146 个指定媒体路径、19 份 CSS。根 README 和当前架构曾引用过时版本/数量；本次收敛两级入口、更新实际资源目录，保留独立的证据文件。无需为每次文档索引更新另建一份阶段报告。

| 后续清理项 | 当前结论与验收条件 |
| --- | --- |
| 重复历史资料 | 不再在总入口复制每阶段候选状态；仅在确认无独有设计/证据/引用后删除文件，Git 历史可恢复 |
| 重复媒体 | R12.70 已统一泉泡、炽角两组同源站姿运行路径，删除 1,415,186 B 副本；保留原图与生产审批，资源目录更新为 144 路径。月纱副本绑定 WineChan intake IMG_0268.png，保留审稿证据与运行路径；R12.71 实际门禁通过：144 路径、0 未登记重复 |
| 组件与 CSS | R12.68 Quality 审计 330 文件、94 模块、1 不可达、0 未解析；R12.69 删除旧召唤与不可用旧图鉴分支、31 条旧根限定 CSS，详见[架构](CURRENT_ARCHITECTURE.md)。保留其余选择器及 19 份 CSS；R12.70 的 Quality 三作业成功、321/321；R12.71 审计增加源码字面路径引用报告，R12.71 实际日志确认 character-adornment 无导入/字面路径引用，R12.72 删除 |
| 锁文件 | bun 是根应用依赖锁；pnpm-lock.yaml importer 只锁 pnpm 12.13.0 工具本身；engine npm 锁独立，三者保留 |
| 发布、产品与美术 | R12.70 Quality/Pages 成功；R12.71 三项 Quality 成功；R12.72-A V3.106.0 Quality/Pages 已成功；R12.72-B V3.107.0 Quality/Pages 成功、大厅回归通过，A05 动态 DPR 失败；R12.72-C V3.108.0 Quality/Pages 成功，浏览器未完成；R12.74 清除独立历史目录与旧平台元数据。真人试玩和生产 CG/原画不能由文档治理替代 |

评分采用六维证据：工程架构 20、文档与资源 20、功能/存档 20、视觉体验 20、验证/发布 15、真实玩家反馈 5。R12.91 基线证据评分 **72/100**，85/100 为目标；唯一评分细项和现行执行优先级见[风险台账](engineering/GAP-REGISTER-2026-11-22.md#r1291--2026-11-25-综合复审现行优先级)。

## R12.74 · 目录收敛

删除 `.aistudio/`（过时工具方案）、`management/`（V0.x 任务/冲刺/问题表）、`docs/prototypes/`（未运行的旧 TSX 实验）、根 `metadata.json`（已废弃 Gemini 平台元数据）。`artwork/catalog.json` 原始索引移入 `docs/art-reviews/legacy-2026-10-29-catalog.json`，旧 README 与归档路径说明保留于[清理前 Git 快照](https://github.com/kunlong-luo/monster-apartment/tree/782fc74fd6e597048a293cbf9777593447c76bb3/artwork)。历史任务表的剩余事项归入当前风险台账；不再维护平行待办。运行资源、原始 PNG、审批清单、七路由、存档和 Pixi sidecar 均不变。新增目录门禁，禁止旧路径和未经登记根目录回流。

## R12.75 · 工坊文档归并

原 `v2/docs/` 四份文件收敛为现行设备规格一份；旧路线/旧路由/旧人物规划使用固定 Git 快照，必要的设计与工程约束合并到现行 SOP、架构和风险台账。目录门禁禁止恢复 `v2/` 与 `engine/docs/`。新增 `pnpm audit:engine-paths` 扫描当前引擎目录之外的明确路径、npm --prefix、tsconfig 等引用，为后续单独的 engine 迁移准备清单；该轮未移动运行引擎或改动存档键。

## 维护约定

- 同一规则只维护一份主规范，索引链接不复制历史结论；过时规则注明替代者，保留审稿证据和 ADR。
- `research-only`、`review`、`approved`、`production` 分开；正式清单晋级和运行时引用均需有证据。
- 代码已提交、Quality 通过、浏览器通过、Pages 已部署是四个不同事实，分别记录 SHA。
- 新素材按角色/用途稳定英文小写连字符目录，遵循角色 SOP；CG 原生最低 1086×1448 可进入人审，禁止插值冒充原生或同脸换色。
- 保留七条正式路由、存档键、经济/概率、全屏绘景、小型角落 HUD；禁用 Sparkles/WandSparkles。


R12.76：引擎迁至 `engine/`，旧根路径退役；历史报告保留当时路径，现行入口与构建命令以根 README 为准。PR #60 四项候选检查均成功后已合并 f3a3b70，主线 Quality、Pages、工坊性能与 WebGL 生命周期成功。


## R12.81 · V0.x 历史规范退役

六份文件原件：[DEVELOPMENT_PLAN.md](https://github.com/kunlong-luo/monster-apartment/blob/f3a3b708f4ae8cda2ef1d4ee9088c71c9eef36ac/docs/DEVELOPMENT_PLAN.md) · [PRODUCT_SPEC.md](https://github.com/kunlong-luo/monster-apartment/blob/f3a3b708f4ae8cda2ef1d4ee9088c71c9eef36ac/docs/PRODUCT_SPEC.md) · [SPIRIT_COLLECTION_V050.md](https://github.com/kunlong-luo/monster-apartment/blob/f3a3b708f4ae8cda2ef1d4ee9088c71c9eef36ac/docs/SPIRIT_COLLECTION_V050.md) · [TECH_STACK_PAGEVELA.md](https://github.com/kunlong-luo/monster-apartment/blob/f3a3b708f4ae8cda2ef1d4ee9088c71c9eef36ac/docs/TECH_STACK_PAGEVELA.md) · [UI_DIRECTION.md](https://github.com/kunlong-luo/monster-apartment/blob/f3a3b708f4ae8cda2ef1d4ee9088c71c9eef36ac/docs/UI_DIRECTION.md) · [V060_TACTICAL_DEFENSE.md](https://github.com/kunlong-luo/monster-apartment/blob/f3a3b708f4ae8cda2ef1d4ee9088c71c9eef36ac/docs/V060_TACTICAL_DEFENSE.md)。其余 191 份跟踪 Markdown 和 118 个 scripts/.github/tests 中指定脚本、配置、测试文件已扫描明确文件名引用；五份文档引用修正。独立二进制 `Development_Plan.docx` 暂留，尚未核查内容，不假定等同 Markdown。旧规则与技术以固定快照追溯；保留真人免费试玩、核心乐趣验证优先、避免未验证商业投入、独立 IP、可解释失败及实际状态驱动表现的原则；历史守卫战不属于正式七路由，不能视为现行功能或自动恢复。现行执行以 PRODUCT、DESIGN、架构、风险台账为准。


R12.82：三个既有功能 PR 的 Quality、桌面及完整玩法均通过；为保留最新清理成果统一组合候选，具体验收记录见 [CHANGELOG](CHANGELOG.md)。组合已由 #53 合并为 80eb69a，Quality、桌面、玩法和 Pages 均成功；#54/#58 重复 PR 已关闭。

## R12.84 · 设计规范归并

`docs/design/` 35 → 31 个跟踪文件，Markdown 32 → 28（其余 SVG/JSON 保留）；全仓 Markdown 191 → 187。退役四份旧实施报告：[R12-02-MOBILE-ROOM-CHOOSER.md](https://github.com/kunlong-luo/monster-apartment/blob/80eb69abb56c8a0a398e53ff27cdf513e76b695e/docs/design/R12-02-MOBILE-ROOM-CHOOSER.md) · [R12-03-LOBBY-ART-CLEARANCE.md](https://github.com/kunlong-luo/monster-apartment/blob/80eb69abb56c8a0a398e53ff27cdf513e76b695e/docs/design/R12-03-LOBBY-ART-CLEARANCE.md) · [R12-40-YUESHA-RELOAD-LORE-REGRESSION-2026-11-24.md](https://github.com/kunlong-luo/monster-apartment/blob/80eb69abb56c8a0a398e53ff27cdf513e76b695e/docs/design/R12-40-YUESHA-RELOAD-LORE-REGRESSION-2026-11-24.md) · [R12-62-ROOM-SCENIC-BUILD-FIX-2026-11-24.md](https://github.com/kunlong-luo/monster-apartment/blob/80eb69abb56c8a0a398e53ff27cdf513e76b695e/docs/design/R12-62-ROOM-SCENIC-BUILD-FIX-2026-11-24.md)。现行交互规则归入 [DESIGN.md](../DESIGN.md)，构建/回归证据在固定 Git 历史，保留原画、独立像素/审批记录和现行视觉合同。其余 187 份 Markdown 与 118 个 scripts/.github/tests 指定文件进行明确文件名引用扫描，三份历史引用改为固定链接；未声称覆盖所有动态/源码引用。六条非 main 分支已分类退役，实际 refs 删除仍待支持客户端操作，不将 PR 关闭误报为分支删除。

## R12.85 · 现行文档链接门禁扩容

`pnpm audit:doc-links` 从 5 份索引扩至 16 份现行文档；新增 AGENTS、产品、设计、当前架构、ADR、迭代手册、风险台账、人物 SOP、CG 原生管线、Impeccable、工坊设备规范。基线 `480128e` 完整 Git 树 732 个 blob、187 份 Markdown；按现有链接匹配规则只读核查 16 份文件共 257 条仓库相对链接，0 个缺失目标。Quality 已有调用，沿用原检查；本轮 CI 结果以实际提交为准。外链、锚点、引用式 Markdown、动态路径和内容准确性不属于该检查；不自动删除历史报告。仅改治理脚本和现行文档，不改变版本、资源、路由、存档或审批。下一步优先分层检查历史文档中的失效相对链接，区分可修复路径与应固定到 Git 历史的证据。

## R12.86 · 全仓 Markdown 链接门禁

基线 `58e52a0` 的 [Quality](https://github.com/kunlong-luo/monster-apartment/actions/runs/45398980151) 已成功。完整 Git 树分批只读扫描全部 187 份跟踪 Markdown：工程 20 份/46 条、设计 28 份/46 条、美术审稿 46 份/94 条、V3 72 份/207 条、其余 21 份/173 条；共 566 条匹配现行检查规则的仓库相对链接，未发现缺失目标。`audit:doc-links` 自动发现全部跟踪 Markdown，同时保留 16 份必需入口缺失检查；不新增依赖、文档或目录。历史证据仍保留，路径有效不代表内容现行；本轮没有删除文档或改动运行代码、美术、存档、版本。外链、锚点、引用式链接、动态路径、内容时效和独立证据价值仍须分别核查；本轮 Quality 以新 SHA 为准。下一步按内容逐项归并重复设计/工程报告，不按文件日期自动删除。

## R12.87 · 审稿工具历史报告退役

R12.86 主线 `b9e00ac` 的 [Quality](https://github.com/kunlong-luo/monster-apartment/actions/runs/45400453801) 与 [Pages](https://github.com/kunlong-luo/monster-apartment/actions/runs/45400627025) 均成功。R12.33/R12.34 两份历史实施报告已逐份阅读，现行 URL 隔离、PC/手机异步解码与对象 URL 生命周期规则归入 [DESIGN.md](../DESIGN.md)，工程与回归约束归入 [迭代手册](engineering/ITERATION-PLAYBOOK.md)。原件及独立失败/验收证据以固定 SHA 保留：[R12.33 原报告](https://github.com/kunlong-luo/monster-apartment/blob/b9e00acf9b343fe4ab5cc1c423b9b8325afb57d2/docs/design/R12-33-WEB-REVIEW-QUERY-ISOLATION-2026-11-24.md) · [R12.34 原报告](https://github.com/kunlong-luo/monster-apartment/blob/b9e00acf9b343fe4ab5cc1c423b9b8325afb57d2/docs/design/R12-34-WEB-REVIEW-IMAGE-LIFECYCLE-2026-11-24.md)。

完整 Git 树中的 187 份 Markdown 均逐份扫描两个明确文件名，仅发现两份退役报告之间的一条引用；另外核查 19 个相关工作流、审稿测试和审计脚本，无明确文件名引用。现行场景组件、三条页面包装及回归 spec 已回读，未改动其实现。未穷尽所有非 Markdown 动态引用。两份文件从主线移除，全仓 Markdown 187 → 185、设计 Markdown 28 → 26；没有新增目录、文档、依赖或媒体，生产审批、七路由、存档和 V3.109.0 均不变。新 SHA 的 Quality/Pages 须独立核验。下一步审查旧脚本与工作流的真实调用、产物及保留理由。

## R12.88 · 工作流退役与工程入口治理

R12.87 主线 `cd07183` 的 [Quality](https://github.com/kunlong-luo/monster-apartment/actions/runs/45407284178) 与 [Pages](https://github.com/kunlong-luo/monster-apartment/actions/runs/45407448939) 均成功。核查完整 Git 树 13 份工作流的触发条件、脚本引用及用途，并核查当前七条分支；185 份 Markdown 逐份扫描三个退役工作流明确文件名，无直接引用，其余工作流和根 package.json 无明确引用。退役三份：[recover-stale-pages.yml](https://github.com/kunlong-luo/monster-apartment/blob/cd07183d278de73f066fe891b48f16fd08b23444/.github/workflows/recover-stale-pages.yml) · [r12-53-art-transition.yml](https://github.com/kunlong-luo/monster-apartment/blob/cd07183d278de73f066fe891b48f16fd08b23444/.github/workflows/r12-53-art-transition.yml) · [r12-61-world-scene-art.yml](https://github.com/kunlong-luo/monster-apartment/blob/cd07183d278de73f066fe891b48f16fd08b23444/.github/workflows/r12-61-world-scene-art.yml)。第一份仅取消固定历史失败部署 `5dd2dae77ec8`，非通用恢复工具；后两份同时受已不存在候选分支的 push 和 job ref 限制，main 手动触发也不会执行转换。工作流 13 → 10；根 scripts/ 的 49 个跟踪文件、原始素材、转换配方、产物清单和 Quality 审核均保留。R12.53 和 R12.61 的转换脚本只作历史复现，不能在当前主线盲目覆盖已经迁移或重新审批的素材。现行 Pages 排队、Quality 成功门禁和独立视觉/玩法检查不变。工作流专属历史 runs 列表接口不可读，未声称查到一次性取消任务的具体执行结论；保留旧 SHA 可追溯。未穷尽非 Markdown 外部或动态引用。新 SHA 的 CI/Pages 独立验收，游戏版本仍 V3.109.0。下一批以真实组件可达性、CSS 动态引用及浏览器证据为准继续精简。

## R12.89 · 组件与样式残留清理

R12.88 `b70830c` 的 [Quality](https://github.com/kunlong-luo/monster-apartment/actions/runs/45554784920) 与 [Pages](https://github.com/kunlong-luo/monster-apartment/actions/runs/45554886829) 均成功。最新组件审计 92/92 app 可达、0 不可达与未解析本地引用，321/321 Vitest，故不删除整组件。扫描全部 80 份 app/src/engine/src TSX、19 份 CSS 及 16 个相关测试/脚本，收敛旧底部导航残留：8 条退役选择器规则、2 处选择器列表旧成员、1 个空 media 块、1 个无效 GothicDock compact 参数；CSS 减少 1176 个字符。现行规则见 [当前架构](CURRENT_ARCHITECTURE.md)。未穷尽非 TSX 动态类或全站视觉覆盖，通用 dock 样式保留；未修改生产逻辑、路由、资产与版本号。新 SHA 的 CI 与浏览器证据分别核验；下一批治理聚焦真实资产路径、动态引用与目录层级。

## R12.90 · 美术库存自动对账

基线 `be66775` 的 [Quality](https://github.com/kunlong-luo/monster-apartment/actions/runs/45556397728) 已成功；桌面、玩法和 Pages 结果另核。完整 Git 树的 144 条媒体路径、156696945 B 与现行资源目录第 5 节逐项相符，33 条新批源图清单也一致。将第 5 节完整路径、实际文件字节与 Git blob 前缀核对接入现有媒体去重门禁及测试，输出目录归属统计；唯一历史重复例外和审批不变。未移动或删除原画、不新增目录或依赖。三份公开目录设计参考共 9161328 B 是后续隔离候选，须先核查动态与测试引用。详见 [资源总目录](ART-RESOURCE-CATALOG.md)。本轮不宣称已完成全量资源可达性或实机画质复审；新 SHA 的 Quality/Pages 单独验收。

R12.91：R12.90 的 Quality/Pages 已成功，库存新门禁实际报告 144 路径、0 issues、0 未登记重复。综合复审转向真实游戏体验，评分及任务顺序统一维护在现行风险台账，不另建阶段报告。下一切片先回读 R12.89 桌面/玩法回归，按证据修复，再进入原画、真人验证与经营闭环。游戏版本仍 V3.109.0。

R12.92：R12.89 的桌面与独立场景浏览器作业成功，真实大厅 DPR2 采样仍暴露 PC 原生像素欠账。修复四视口像素诊断的 JSON/PNG 归档及最小源尺寸检查，统一证据见[真实浏览器像素取证](art-reviews/R12-01-REAL-BROWSER-PIXEL-EVIDENCE.md)；新测试与完整玩法待回读，不改原画和游戏版本，下一切片 R12.93 独立高清场景与人物身份。

R12.93：实际制作 S02 PC 六门中庭候选 v2，原始 PNG 1672×941，低于生产原生门槛且暂未入 Git。真实哈希、拟入库路径与审核限制见[资源总目录](ART-RESOURCE-CATALOG.md)及[场景准入](art-reviews/R12-02-SCENE-ART-INTAKE.md)。实际媒体库存仍 144；不晋级、不切换运行时、不改变版本或存档。下一批继续独立竖版及 S05/S06，需实际原图与人审。

R12.94：核查 public/art 全部 67 文件，56 媒体按用途分类（36 正常/回退、7 交互研究、10 离线研究候选、3 优先退役候选）；9 JSON、2 Markdown 保留。更新 public/art 入口，删除过时现行身份描述并保留固定历史链接。唯一分类及迁退顺序见[资源总目录](ART-RESOURCE-CATALOG.md) 第 4.1 节。核实 S02 目录存在但 v2 PNG 尚未上传。此次不移动/删除媒体，先完成全部运行、动态、测试及文档引用检查；库存仍 144 路径。

R12.95：56 → 43 张 public/art，十张研究输出迁至已有 [sources/](art-reviews/sources/) 保持原 Git blob，三张废弃月纱头像/肖像退役；全仓 141 媒体、156439517 B。同步镜头表、场景输出清单、审核器、文档图片及第 5 节库存。现有玩家运行资源、回退、生产状态与存档不变。新 SHA CI 待验收；下一批继续正常 review 路径和历史 public/assets 隔离，详见[资源目录](ART-RESOURCE-CATALOG.md) 第 4.1 节。

R12.96：将 public/art/a05 与 public/art/feature-postcards 两组历史命名迁为 decorations 与 postcards；5 个媒体、2 个来源清单原 Git blob 不变。同步 3 个 React 消费者、海报回退 E2E、转换脚本和来源工作流，保留 A05 验收 ID、截图目录、旧历史 SHA、来源与审批。351 个代码/工具/测试文件、185 个 Markdown、19 个资源 JSON/CSV 已做相关路径与文件名专项扫描。未改变玩法、布局、图片字节及存档；43 公开媒体、141 全仓媒体不变。新提交 CI/Pages/视觉结果独立验证。 详见[美术资源总目录](ART-RESOURCE-CATALOG.md)。上一轮 [Quality](https://github.com/kunlong-luo/monster-apartment/actions/runs/45559920394)、[桌面视觉](https://github.com/kunlong-luo/monster-apartment/actions/runs/45559920349)、[Pages](https://github.com/kunlong-luo/monster-apartment/actions/runs/45560036324) 均成功。

R12.97：将 public/art 顶层业务目录与现存根文件纳入现有 `pnpm audit:repository-layout` 门禁；旧 a05、feature-postcards、任意未登记顶层目录或根文件均失败。新用途必须同步更新资源目录、public/art 入口和门禁；现存角色、封面、房间、场景及回退路径不动。下一批优先核对正常 PC 场景 review 路径，未完成完整引用扫描前不迁移或删除；暂缓批量生成新美术。

R12.98：将正常 PC 工坊、月光街两张过渡 WebP 由各自 review/ 移入地点目录，命名 workshop-desktop-transition.webp、town-desktop-transition.webp；原 Git blob、原始 PNG、四候选 SHA-256、尺寸、review-only 状态及未选研究图不变。同步两处页面导入、两处真实浏览器断言、生成器、审核器及资源清单。旧路径不再保留副本；手机背景、故障回退、正式场景准入、存档不变。公开媒体仍 43、全仓 141；新提交 Quality、桌面浏览器及 Pages 须独立核验。暂缓批量新美术；下一批审查角色与欢迎封面目录。

R12.99（第一批：欢迎封面）：两张双端群像 WebP 由 beauty-beasts/cover/ 原 Git blob 迁入 public/art/covers/，保留 world-cover.webp 与 world-cover-mobile.webp 文件名、欢迎页语义标记和大厅故障回退。同步欢迎页、大厅、R12.53 转换脚本及 manifest、库存测试、设计资源清单和当前缺口台账；目录门禁登记 covers 并拒绝旧封面目录回流。媒体仍 43 公开、141 全仓；未改变审批、图片字节、布局、概率或存档。人物目录仍为 beauty-beasts/characters/，须完成头像、CG 晋级脚本、历史证据及动态路径引用核对后独立迁移（R12.99 第二批）；不宣称全部角色目录已收敛。暂缓批量新美术；新提交 CI、桌面及 Pages 结果独立验收。

R12.99 第二批：将 beauty-beasts/characters/ 的 3 张头像、3 张候选 CG 原 Git blob 迁入 public/art/characters/<id>/，同时迁移 cg-manifest.json 并更新五卡正式/预览槽、运行注册、CG 审核/晋级/生成、源图映射、测试及现行 SOP。beauty-beasts/ 整个公开历史目录退役，门禁登记 characters 并拒绝旧目录回流。月纱根目录三张 V3 肖像仍留待 R12.101；泉泡/炽角继续共享 rooms 下站姿，不重建两张重复候选。五卡仍 portrait（0/5 production），现行原画、哈希、身份、抽卡、存档、回退不变。固定历史 SHA URL、历史清单与 legacyOutput 保留旧路径。43 公开媒体、141 全仓媒体不变；新 SHA 的 Quality、真实浏览器及 Pages 独立验收。暂缓批量新美术；下一阶段 R12.100 核查房间正常观景与显式研究图路径。

R12.100 第一批（发布修复优先）：R12.99 第二批 5a44daf 的 Quality 静态导出与桌面浏览器失败，Pages 跳过；CI 日志定位工坊全景及派工控件共六个旧头像静态导入。两组件改为复用 HEROINE_FACE_ART 唯一注册表，保持图片、角色 ID、显示行为和存档不变。扩展 audit:repository-layout，在 app/src/engine 的运行代码及 CSS/JSON 中扫描退役 beauty-beasts、a05、feature-postcards 和 PC 场景 review 路径的字面引用；历史文档和 provenance 的旧路径不参与此运行引用门禁。新 SHA 需独立通过 Quality、桌面及 Pages 验收，之后才迁移私人房间 8 个观景层；显式月纱审稿图及回退保留。没有移动、删除或新增图片；43 公开媒体、141 全仓媒体不变。继续暂停批量生成新美术。

R12.100 第二批：四个房间的 8 张常规观景/显式审稿共用 WebP 原 Git blob 迁至 rooms/<id>/scenic/{background,standing}.webp；roomScenicArt 统一普通观景与显式审稿的路径解析；R12.57 转换、审核与输出清单、R12.53 转换清单、CG 预览注册及审核、单元与真实浏览器断言同步。泉泡、炽角仍共享站姿，四张 concept-scene.svg 与独立月纱 room-review 保留，正式 room manifest、剧情热点、原画、Alpha、SHA-256、审批、存档不变；旧四个 review 目录防回流。公开媒体 43、全仓 141，未新增美术。前置修复 029f019 已通过 Quality/Pages；本次提交仍须独立验收。下一批 R12.101 整理根目录散落肖像与大厅图。

R12.101 第一批：四张大厅 WebP（V2、V3、V4 桌面与 V4 手机）原 Git blob 迁入 public/art/world-scenes/lobby/，保留原文件名；正常大厅、欢迎页回退、公寓背景及 Pixi V3→V2 回退均保留。engine/scripts/build.mjs 只调整源路径，dist/assets 输出文件名不变；同步 R12.53 转换器、清单、测试及目录门禁，禁止根目录旧大厅路径回流。未新增、删除或重新编码媒体，43 公开媒体与 141 全仓媒体保持不变。前置 R12.100 已通过 Quality/Pages，本提交须独立验收。月纱三张根目录肖像留待 R12.101 第二批；暂停新增美术。
