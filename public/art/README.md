# Web 美术资源入口（R12.101 月纱归类候选）

唯一完整资产清单、用途分类、清理条件及命名规则见 [美术资源总目录](../../docs/ART-RESOURCE-CATALOG.md)，尤其第 4.1 节和第 5 节。本页只说明目录职责，不维护第二份库存。当前游戏 V3.109.0；“运行中”不代表 production 人审通过。

| 路径（相对于本目录） | 用途与处理 |
| --- | --- |
| `decorations/` | 图鉴装饰与粒子，保留 |
| `characters/` | 头像、当前候选卡；离线动作研究已迁出 |
| `covers/` | 双端欢迎封面与故障回退，保留 |
| `postcards/` | 大厅两张地点入口海报，保留 |
| `world-scenes/lobby/lobby-hero-v4*.webp` | PC/手机大厅正常背景，保留 |
| `world-scenes/lobby/lobby-hero-v3.webp`、`world-scenes/lobby/lobby-hero-v2.webp` | 旧公寓/世界背景与 Pixi 回退链，保留 |
| `yuesha-*-v3.webp` | 当前注册头像、立绘和半身像，保留 |
| `rooms/` | 故事概念背景、正常观景背景与站姿、审稿清单，保留 |
| `room-review/` | 显式月纱研究预览仍有调用，保留 |
| `world-scenes/` | 地点正常背景、回退、显式交互审稿；两张 PC 过渡图已归入地点目录，未选研究稿已迁出 |

现有 43 张公开媒体；10 张离线研究已迁到 [文档研究图](../../docs/art-reviews/sources/)，3 张旧月纱肖像已退役。9 个 JSON 均为来源/审稿/准入记录或运行 manifest；2 个 Markdown 为本入口和私室准入说明。不要把研究或来源记录当成可随意删的图片。正常使用的 `review/` 图保留并记录角色，纯离线研究图只有完成引用迁移才移出 public；未入 Git 的新原画不在此目录创建占位文件。

源 PNG 放在 [art-sources](../../art-sources/)，历史审稿资料放在 [docs/art-reviews](../../docs/art-reviews/)，设备侧车贴图放在 [engine/art](../../engine/art/)。原 `public/art/README.md` 的 V2/V3、V3.79 身份及 V3.88–89 来源历史见 [固定历史版本](https://github.com/kunlong-luo/monster-apartment/blob/329cbdec70273a91f788f8de18689bdde4e7cac8/public/art/README.md)，不再将早期银发/黑发身份叙述当作现行资产事实。

R12.96：图鉴装饰与入口海报分别使用 decorations/ 与 postcards/，来源清单随目录原字节迁移。A05 是历史视觉验收编号，不再是运行资源目录名。

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
