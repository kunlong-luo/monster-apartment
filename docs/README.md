# 《怪物公寓》文档导航与维护约定

> 2026-11-22 起作为**找文档的统一入口**；不是又一份取代全部文档的长篇需求书。工程执行先读仓库根目录的 `AGENTS.md`，以实际代码、清单和 CI 结果核实实现状态。

## 读文档的最短路径

| 要做的事 | 当前主依据 | 其他参考（不自动代表已上线） |
| --- | --- | --- |
| 每次开始工作 | [AGENTS.md](../AGENTS.md) → [快速迭代操作手册](engineering/ITERATION-PLAYBOOK.md) | [依赖优先原则](engineering/DEPENDENCY-FIRST-FAST-ITERATION.md) |
| 产品范围、角色与经营循环 | [PRODUCT.md](../PRODUCT.md)、[正式架构](CURRENT_ARCHITECTURE.md) | [V3 策划索引](v3/README.md) |
| PC/移动端 UI 与交互 | [DESIGN.md](../DESIGN.md)、[Impeccable](IMPECCABLE.md) | [大厅参考布局](DESKTOP-REFERENCE-LAYOUT.md)、[R12 视觉改造](design/R12-00-VISUAL-REBUILD-PLAN.md) |
| Web / PC 本地原画解码生命周期（R12.34） | [异步解码取消、Blob URL 所有权和回归](design/R12-34-WEB-REVIEW-IMAGE-LIFECYCLE-2026-11-24.md) | **V3.99.0**：快速换图、恢复、退出审核时释放未完成及已接受的本地 URL；仅审稿工具修复，未新增或晋级高清原画；CI/Pages 按新 SHA 核验 |
| Web / PC 场景研究审稿 URL 隔离（R12.33） | [Next SPA 退出审核立即撤下研究图、Back 不恢复旧预览、静态导出与浏览器回归](design/R12-33-WEB-REVIEW-QUERY-ISOLATION-2026-11-24.md) | **V3.98.0**：补上 `r12-art-review=1` 的 App Router 实时状态，离开审核参数立即恢复正式场景，禁止历史记录误显示未批准图片；保留六份研究素材仍为 review，原生高清 S01/S02/S05/S06 仍待生产 |
| Web / PC 独立场景研究图实景审核（R12.32） | [S02/S05/S06 六张真实横/竖版 WebP 一键游戏预览、未批准水印与防误晋级回归](design/R12-32-IN-GAME-RESEARCH-SCENE-PREVIEW-2026-11-24.md) | **V3.97.0**：原仓库六张不同场景研究画可在显式 `r12-art-review=1` 中点击一键预览；保留原生尺寸红灯、PC/手机场景截图和“未批准”水印。**正常玩家不加载、没有正式晋级**；真实高清资源生产仍见 #16/#24 |
| Web / PC 原生场景按设备单图加载（R12.31） | [4K PC/独立手机版 `<picture>` 响应式加载、SSR/浏览器验收与高清素材入库条件](design/R12-31-WEB-RESPONSIVE-SCENE-ASSET-LOADING-2026-11-24.md) | **V3.96.0**：正式场景由旧 PC+手机双 `<img>` 改为浏览器原生单 `<picture>`；错误重试/中性回退与生产审核门槛保留。**尚未替换高清原画**，三场景仍是 review；检查/上线以最终 SHA 的 CI 和 Pages 为准 |
| Web / PC 高清美术审稿与月纱深链（R12.30） | [3840×2160 原生审稿门槛、私人房间 URL/Back 修复与美术入库边界](design/R12-30-WEB-ART-REVIEW-DPR2-AND-YUESHA-ROUTING-2026-11-24.md) | **V3.95.0**：PC 场景本地预览审核门槛改为 3840×2160；月纱私人房间跟随 `?visit=yuesha`，支持浏览器 Back 并保留显式审核参数；新增定向 E2E。原生高清绘景和正式 CG **尚未生成/晋级**，CI/Pages 以最新提交 SHA 为准 |
| Web / PC 高清像素预算回归（R12.29） | [图鉴 DPR2 测试修复、大厅高密像素取证与原生高清重制规格](design/R12-29-WEB-DPR2-IMAGE-REGRESSION-AND-HERO-REBUILD-2026-11-24.md) | 图鉴右侧详情图定位已改正；新增 PC 1648×928 + 手机 390×844 的 DPR2 实测和截图门禁。**没有新高清原画上线**，大厅旧图约 2.08× PC 采样、独立公寓绘景仍缺；最新 Quality / 视觉 / Pages 依实际 SHA 状态判定 |
| Web / PC 私人房间与审核深链收口（R12.28） | [研究模式参数保留、剧情刷新与全量浏览器失败复盘](design/R12-28-WEB-ROOM-REVIEW-DEEPLINK-AND-REGRESSION-2026-11-24.md) | **V3.94.0**：修复图鉴进入泉泡/青枝/炽角房间时丢失显式 `roomArtReview=1`、退出审核状态不保留的问题；修正剧情故事刷新后应直接恢复房间的旧测试。历史完整浏览器 176 通过/4 失败/3 跳过，最新 Quality、Web 验收和 Pages 以最终 SHA 回读为准；正式原画及 CG 未晋级 |
| Web / PC 人物图鉴高清显示（R12.27） | [去除二次放大与 DPR2 像素预算回归](design/R12-27-PC-WEB-ART-PIXEL-BUDGET-2026-11-24.md) | **V3.93.0**：去除图鉴神话月纱 2.05× 缩放和人物卡悬停 1.02× 图片缩放，增加原生像素预算浏览器断言；未重绘新原画，首页背景和私人房间高清问题仍见 #24。代码提交、Quality、Desktop Visual Review、Pages 逐项分开验证 |
| Web / PC 角色房间深链修复（R12.26） | [角色图鉴 SPA 访问、Back 与私人房间一致性](design/R12-26-WEB-CHARACTER-ROOM-DEEPLINKS-2026-11-24.md) | **V3.92.0** 代码已提交：有效 `visit` 参数直接决定显示的住客房间，进入/离开走 Next 路由；PC 定向浏览器回归已加入视觉工作流。最新提交的 Quality / Pages / 浏览器结果分别核实，不能以提交等同上线 |
| Web / PC 首页优先优化（R12.25） | [欢迎页按需加载与地图关闭交互](design/R12-25-WEB-FIRST-LOBBY-LOAD-AND-NAVIGATION-2026-11-24.md) | 已提交 Web 代码与定向浏览器测试，发布标识更新为 **V3.91.0**；按最终 SHA 核对 Quality、PC 视觉审核与 Pages，未晋级任何新头像/CG |
| 首页菜单：现行顶角方案 | [R12.15 顶角世界地图](design/R12-15-LOBBY-CORNER-WORLD-ATLAS-2026-11-23.md) | 取代底部 Dock，七个真实页面仍可达；视觉 QA 以最新 SHA 为准 |
| 首页两幅海报 / 图鉴清晰度 | [R12.16 边栏精简与候选原画 DPR 保护](design/R12-16-LOBBY-RAIL-DENSITY-AND-CG-DPR-2026-11-23.md) | 保留故事入口；移除重复大肖像和切换动画放大模糊 |
| 全站是否也要升级 / 首页同脸 | [R12.17 七页面美术与身份审计](design/R12-17-FULL-SITE-VISUAL-IDENTITY-AUDIT-2026-11-23.md) | 修复玩家头像和月光街错图；四居民面部差异化与跨场景高质量重制次序 |
| 四位人物 G1 入库与质量门禁（R12.24） | [R12.24 入库技术验证与阻碍](art-reviews/R12-24-G1-SOURCE-INTAKE-REGRESSION-2026-11-24.md) · [最新状态 JSON](art-reviews/R12-24-G1-IDENTITY-STATUS.json) · [校验脚本](../scripts/verify-g1-face-sources.mjs) · [离线测试](../scripts/tests/g1-face-source-intake.test.mjs) | 四位独立研究原图已在 ZIP，实际素材 **10/10 本地哈希检查通过**，G1 入库回归 **9/9 本地通过**；**新 PNG/WebP 仍未上传 GitHub**，正式身份签署 **0/4**、封面 **0/2**、五张全身 CG **0/5** |
| 新角色、立绘、CG、换装、武器 | [角色 G0–G7 SOP](CHARACTER-CREATION-SOP.md) → [任务模板](templates/CHARACTER-DESIGN-BRIEF-TEMPLATE.md) | [逐卡镜头表](CHARACTER-CG-DIFFERENTIATION-V1.md)、[原生高清可选管线](CHARACTER-CG-NATIVE-PIPELINE.md) |
| 全站美术要重做哪些 / 制作任务 | [R12.7 全站资源重制审计](art-reviews/R12-07-ASSET-REBUILD-AUDIT-2026-11-22.md) → [可执行 CSV 台账](art-reviews/R12-07-ASSET-REBUILD-BACKLOG.csv) | [像素取证](art-reviews/R12-01-REAL-BROWSER-PIXEL-EVIDENCE.md)、[五卡差异化](CHARACTER-CG-DIFFERENTIATION-V1.md) |
| 首张 S05 独立绘景样板（候选） | [R12.8 S05 契约大厅审稿报告](art-reviews/R12-08-S05-CONTRACT-HALL-REVIEW-2026-11-22.md) | 1672×941 原生图已入 Git review；尚未通过生产尺寸/人审 |
| S05 双端 + 青枝拉弓（已入 Git 审稿目录） | [R12.9 美术资源与校验](art-reviews/R12-09-ART-PACK-2026-11-22.md) | 3 PNG + 3 WebP + [联系表](art-reviews/R12-09-ART-CONTACT-SHEET-REVIEW-ONLY.jpg) 均在 main；**不是 production** |
| S06 晶核仓库 PC / 手机独立候选（已入 Git 待审） | [R12.11 桌面](art-reviews/R12-11-WAREHOUSE-DESKTOP-REVIEW-2026-11-22.md) · [R12.12 手机](art-reviews/R12-12-WAREHOUSE-MOBILE-REVIEW-2026-11-23.md) | 两组真实原始 PNG + WebP 在 main review 目录；双端原生尺寸仍未达标、不能正式替换 |
| S02 六房门中庭（新版桌面候选已入 Git） | [R12.13 六门中庭审稿](art-reviews/R12-13-S02-SIX-DOOR-DESKTOP-REVIEW-2026-11-23.md) | 左右 3+3 扇，1672×941 PNG/WebP，非正式高清；手机原画与热点实机核对仍缺 |
| S02 六门公寓双端原画（待审） | [R12.13 桌面审稿](art-reviews/R12-13-S02-SIX-DOOR-DESKTOP-REVIEW-2026-11-23.md) · [R12.14 手机审稿与门心草案](art-reviews/R12-14-S02-SIX-DOOR-MOBILE-REVIEW-2026-11-23.md) | 两张原生 PNG + WebP 已存 Git review；尺寸/人审/六门真实点击尚未达生产标准 |
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
