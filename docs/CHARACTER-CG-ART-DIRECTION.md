# 《怪物公寓》角色 CG 制作与验收 · V3.79

> 当前状态：月纱跨页面身份已统一，但五张正式全身 3:4 CG 尚未完成。此文是执行规格，不是通过人工美术审核的证书。

> **现行规格（2026-11-22 更新）**：角色 CG 第一阶段接受原生 **1086×1448**、3:4 独立原画参加正式审核；**1536×2048 仅作为可选高清精修目标**。需完整身份、构图、版权、三视口及真人签署，不能因为尺寸达到 1086×1448 自动升为 production。新增人物统一执行 [新角色制作 SOP](CHARACTER-CREATION-SOP.md) 与 [角色任务模板](templates/CHARACTER-DESIGN-BRIEF-TEMPLATE.md)。以下旧版本“必须 1536×2048”的复盘记录均保留作历史，不代表现行门禁。

## 01 · 已锁定的人物身份（不随卡池变化）

| 角色 | 视觉身份 | 候选卡面 | 现有过渡素材 |
| --- | --- | --- | --- |
| 月纱 | 银白长发、赤瞳、黑金蔷薇王冠、酒红黑蕾丝宫廷礼服；冷静而神秘的成年女主人 | 月蚀神话（赤红）、月下誓约 | `yuesha-portrait-v3.webp`、`yuesha-bust-v3.webp` |
| 泉泡 Brook | 泉水/潮汐主题、与月纱不同的脸型与发型 | 潮汐契约 | `brook/face.webp` |
| 青枝 Fern | 绿植/森林主题、与其他角色不同的轮廓与服装 | 春芽契约 | `fern/face.webp` |
| 炽角 Cinder | 烬火/角饰主题、鲜明的暖色材质和体态 | 余烬契约 | `cinder/face.webp` |

旧 `beauty-beasts/characters/yuesha/face.webp` 黑发角饰与已上线银发月纱不一致，不能作为正式月纱 CG 的参考或加载回退。R12.95 已退役该旧 WebP，历史原件见 [固定 Git 快照](https://github.com/kunlong-luo/monster-apartment/blob/87a37023dcc5161696aab9fe006749f3a5a04bb4/public/art/beauty-beasts/characters/yuesha/face.webp)，不把它误认成第五位新角色。

## 02 · 原画交付要求

- 每张角色 CG 为独立 **3:4 竖幅，第一阶段原生至少 1086 × 1448px（推荐后期精修到 1536 × 2048px）**。双眼、面部、头饰、手指与服装结构应在原生像素下清晰；人物身形从头到脚完整可见，头顶与足部有安全边距。不能将 512px 头像用 AI 拉伸或 CSS 放大称为全身。
- **不烘焙游戏 UI、数字、按钮、人物名称、台词、边框和品阶字样**；这些全部由 React 渲染。不得生成与当前世界观冲突的宠物式人设或同脸量产模型。
- 输出主文件保留有授权的源格式，交付 WebP 游戏版时记录生成原始分辨率、压缩后分辨率和文件哈希；不要把导出尺寸谎称为原生创作分辨率。
- 月纱高阶卡以黑紫/酒红/哑光细金、赤红月蚀轮廓光为主；其余角色按个人场景分别配置环境光，**全站标准文本与按钮仍使用 DESIGN.md 的唯一 token 色板**。
- 独立的候选原画必须先在 1440×900、1648×928、390×844 三个实际浏览器视口进行卡片展示审核：完整脸部、手部、身体、卡面底部铭牌不能被遮挡；缩略图仅需脸部清楚，不必硬塞全身。
- 明确记录生成/创作方式、作者/来源、使用许可、人物身份一致性、是否有人审阅，以及审阅日期；审核不足时保持候选状态，不改生产映射。

## 03 · 拍板门槛与接入步骤

1. **Critique**：用真实截图检查人物视觉身份是否和大厅/房间一致；任何黑发月纱或同脸异角度、手指畸形、穿模都不通过。
2. **Polish**：逐张原画修正材质、完整体态和光源，导出适用 WebP；不要以 CSS 光晕代替画质。
3. **Audit**：核实画像来源与授权、原生像素尺寸、无烘焙 UI、人物边界/构图，再记录人工审核信息。没有真实审批不得标记已审核。
4. 将通过审核的图片加入 `public/art/characters/<id>/`，再更新 `src/components/summon/heroine-portrait-assets.ts`；保持原有卡牌 ID、抽卡概率、保存及奖励不变。
5. 执行 `pnpm check:design`、`pnpm test`、`pnpm build` 和 PC/手机视觉截图，确认实际 Next.js 静态导出与 Pages 发布成功。
6. 房间 CG 是另一条制作线：宽幅至少 1920×1080、单独纯背景、物件锚点一致；严格按照 `scripts/prepare-room-background.mjs` / `promote-room-background.mjs` 的人工审批流程，不能提前修改 `public/art/rooms/manifest.json` 的生产状态。

## 04 · 本阶段真实边界

V3.79 只使用库中已经存在的 V3 银发月纱肖像，实现跨页面身份一致，并修复失效时回退到不一致角色的问题。新生成的带完整 UI 的效果图只可作概念参考，**不得作为可供卡面接入的角色透明立绘或正式房间 CG**。下一项正式原画制作仍待独立候选与人工质量审核。

## 05 · V3.80 已接入 CG 生产门禁

正式卡位清单：`public/art/characters/cg-manifest.json`。五张人物卡对应五条确定的生产路径；`status=portrait` 时沿用独立肖像，只有完整人工审核通过且资源存在才将卡位标记为 `production`。召唤卡的图片来源由 `getApprovedCardCg` 自动切换，失败则退回原人物肖像；抽卡结果、保底、奖励和存档完全不变。

**审核候选**（生成的图先放在本地工作目录，不在正式游戏路径里）：

```bash
pnpm art:cg:review --card yuesha-eclipse --source /path/candidate.webp --out /path/review-yuesha
# 在浏览器打开 review-yuesha/review.html；逐项认真审查
# 签署 review-status.DRAFT.json 里的批准、来源和人工检查结果
pnpm art:cg:promote --card yuesha-eclipse --source /path/review-yuesha/cg-candidate.webp --approval /path/review-yuesha/review-status.DRAFT.json
pnpm check:design && pnpm test && pnpm build
```

审核由 `scripts/audit-character-cg.mjs` 在 Quality 检查阶段强制执行：图像格式、最小原画像素、3:4 画布、文件哈希、审阅记录、权利来源、原生分辨率以及三种视口签署缺一不可。严禁将 UI 截图裁切版、背景烘焙了导航的截图或仅半身的低分辨率素材勾选为正式全身 CG。房间素材继续使用独立的房间审核流程，不能共享背景/人物批准签名。

## V3.81 · 已有合格绘景的玩家可见升级

本轮**没有把 2026-10-31 的低分辨率候选原画/会客室图放进生产目录**。使用现有 `yuesha-bust-v3.webp` 与 `lobby-hero-v3.webp`，将大厅中的“与月纱交谈”“剧情回顾”升级为单幅绘景 + 文字同屏的电影式叙事面板；在 PC 上进一步提高已有召唤活动卡的肖像可见面积。所有可交互元素仍由 React 渲染，适配窄屏、键盘焦点与减少动态效果；不新增无意义入口，不改抽卡概率及存档。

**美术边界**：场景和人物的真正正式全身 CG 仍需通过 `scripts/audit-character-cg.mjs` 与房间审核系统，不能以这次 UI 布局/现有肖像升级冒充新原画入库。

## V3.82 · PC 房间沉浸浏览（使用合格旧素材）

- 月纱、泉泡、青枝、炽角的房间采用**同一个观赏控制**，默认房间绘景/剧情双栏，PC 可切换为全宽绘景，再一键恢复剧情。切换过程保留在场的物件热点、当前剧情与存档状态，不新建页面或改变世界进度。手机没有这个多余切换，始终显示剧情内容。
- 场景比例提高到 PC 约 75% 绘景/25% 剧情，避免普通数据后台压缩画面。交互使用已有 Next.js/React/Tailwind/Lucide，无新依赖，禁用 Sparkles。
- 新的月纱沙龙候选由混合设定板独立裁出，仅约 888×499px，**不是正式房间 CG**，未满足独立 1920×1080 的审核门槛，也未写入生产 manifest。源图还含卧室布景、与现有会客室物件（seal/tea/ledger）不完全匹配，不可直接修改场景热点坐标。

## V3.83 · 16:9 房间与纯画面观赏

- 四套房间原始概念绘景均采用 1920×1080 坐标系。PC 场景容器统一为 16:9，避免旧固定高度裁切画面、影响热点定位；手机仍保持纵向紧凑浏览。
- 观赏模式隐藏剧情栏、物件标记、焦点圆环、标题和人物反应文字，只保留建筑绘景、独立人物和环境光；退出后所有互动与剧情状态原样恢复。
- 「画面外物件」菜单下移，避免覆盖右上角观赏按钮。对话演出期间禁用观赏切换，不打断演出。
- 候选外部来源为 WineChan 的 73 张 [Gothic Manor 背景](https://winechan.itch.io/gothic-manor)，网页声明公共领域；单张文件**尚未下载及审核**，不能直接写为 `production`。另有 Ebbasuke 的 4K [Gloomy Mansion 背景](https://ebbasuke.itch.io/gloomy-mansion-background-pack)，授权为 CC BY 4.0，需标注来源。


## V3.84 · 真实原包 CG 的候选预览（QA-only）

本轮通过免费资源发布者的正常下载通道获取了完整 `Gothic Manor.zip`，实际逐张读取 **73 张 1920×1080 原图**、记录来源 ZIP 的 SHA256，生成全量 5 页索引。原始图均来自 [WineChan Gothic Manor](https://winechan.itch.io/gothic-manor)，页面公开说明 public domain、AI-assisted。需要强调：尺寸合格不代表符合月纱三处物件/审核要求。

从 `IMG_0277.png` 生成 1920×1080 WebP 室内风格候选，接入 `public/art/room-review/yuesha-salon-candidate.webp`，**仅当用户显式在 `/apartment/?visit=yuesha&roomArtReview=1` 打开「本地美术审核」并点击「预览已入库候选」时显示**。正常游戏继续保留原概念背景，`public/art/rooms/manifest.json` 的 `backgroundStatus` 仍为 `concept`。

该素材可用来评估酒红家具、火炉、会客桌的画面层次，但真实蜡封、香料茶杯、旧账簿及其锚点仍待专门审核。未经人工确认的候选不能冒充 production。支持恢复原绘景，且预览不写入存档。

## V3.85 · 候选图物件实景定位工具

此前候选图片预览会错误复用旧会客室坐标，用户点击还可能污染探索记录。现在 **QA 候选预览不挂载正式调查热点与焦点层**，也不会调用 `commitCharacterLife` 的调查动作；正常游戏仅在还原旧背景后恢复可玩物件。此改变不修改概率、存档键或角色玩法。

在 `/apartment/?visit=yuesha&roomArtReview=1` 中选择高清候选后可启用「开始在画面中标注真实物件」，分别选择蜡封、茶杯、账簿并点击对应的**实物位置**。投影按 16:9 `object-fit:cover` 做反变换，检查 390×315 手机热点是否可触及、有无 44px 重叠。三项真实物件均有标注且几何合规后才可导出三项坐标草稿 JSON，不能产生生产审批证书或写入 manifest。退出预览即丢弃草稿。

**当前候选** `IMG_0277.png` 仍未具备清晰可辨的月纹蜡封与旧账簿，因此尚不能通过完整视觉审查，即使其原生分辨率足够高；不能以无效坐标作弊通过审核。正式入库继续运行独立 `art:review`／`art:promote` 流程并由人工复核。


## A05 人物原画身份锁定与真实窄卡审核（2026-11-02）

本轮检查发现 `prepare-character-cg.mjs` 原来按照 `card.split('-')[0]/face.webp` 从角色目录读取身份基准。这会把 **月纱已退役的黑发角饰概念头像**拿给新原画作者作参考，与现有银白长发、赤瞳 V3 月纱冲突。

现已修复并在审核脚本中锁定五张卡的准确源文件：
- 神话月蚀：`public/art/characters/yuesha/yuesha-portrait-v3.webp`
- 月下誓约：`public/art/characters/yuesha/yuesha-bust-v3.webp`
- 泉泡：`public/art/characters/brook/face.webp`
- 青枝：`public/art/characters/fern/face.webp`
- 炽角：`public/art/characters/cinder/face.webp`

新审核草稿记录每张身份基准的相对路径及 SHA-256。正式晋级与 CI 审核都必须核对该哈希，避免准备、签署与正式入库期间偷偷换参考面孔。旧草稿必须重新走审核，不能直接用来跳过最新审查。

`art:cg:review` 的审核 HTML 已同时展示 **完整 3:4 原画**与**实际 A05 细长卡的 cover 裁切**，三个桌面/手机视口分别审查。仅 3:4 展示好看不代表放到 1:3 竖卡里仍能清楚看见双眼、头饰与重要体态。完整欣赏界面保持 contain，不可把真实画面缺陷用模糊光晕遮蔽。

本轮未产生新的合格独立 1536×2048 全身 CG，也没有更改 `cg-manifest.json` 的 `production` 状态。上线前继续按人工审核/授权与浏览器画质评估。

## V3.86 · 高清会客室独立物件合成（不自动成为正式素材）

候选 `IMG_0277.png` 画有客厅与茶几，但缺少清晰可辨的蜡封与账簿。V3.86 加入 **透明物件图片合成审核**，不是通过 CSS 绘制假家具，也不会把不匹配的背景设为正式场景：

1. 在 `/apartment/?visit=yuesha&roomArtReview=1` 中选用已有的 1920×1080 背景候选；
2. 准备**彼此独立、有商业许可、透明边缘的 PNG/WebP** 三张，分别上传蜡封、茶杯与旧账簿；上传时验证格式、原生尺寸和真实透明边缘；
3. 用已有物件标注器在画面上确定三张物件的投影位置，并完成 390px 手机触达/重叠检查；
4. 系统按原生 1920×1080 坐标与素材真实纵横比，把三张透明物件合成到真实 WebP 绘景中，一键下载 `yuesha-room-composite.UNAPPROVED.webp`，供下一道独立审核；
5. 审核时必须逐张核对三件物件的透视、家具表面接触关系、局部阴影、来源授权及双端布局；**浏览器能合成不是人工作品验收通过**，不能改 `public/art/rooms/manifest.json` 的 `backgroundStatus`。

其他三个工匠私人房间也已修复：在 QA 模式上传新背景时禁用旧调查热点及其焦点效果，退出预览后重新启用，避免跨房间产生不真实的探索记录。所有新图片通过临时 Blob URL 管理，不写存档或服务器，退出/reset 撤销链接。没有增加额外路由、生产依赖或 Sparkles 图标。


## 2026-11-21 · 四位角色候选交付（未正式晋级）

已完成月纱「月下誓约」、泉泡「潮汐契约」、青枝「春芽契约」、炽角「余烬契约」共 4 张**独立 3:4 候选**的外部美术交付。源图 1086×1448px，**不足项目规定的原生 1536×2048px**。当前四张候选 WebP 已通过提交 `5304201595af` 进入 GitHub 的 `public/` 文件夹；仓库同时保留文件清单、原生规格与 SHA-256，详见 `docs/art-reviews/CG-CANDIDATES-2026-11-21.md` 和同名 JSON。

继续保留 `cg-manifest.json` 的五张 `status: portrait`；不得把已生成的候选图、浏览器样张或外部图像副本说成已上线正式角色 CG。二进制资源同步及哈希复核已完成。下一步仍需独立正式规格补绘、逐张人工审核签署与正式晋级流程；仅入库不等于正式上线。


## 2026-11-21 · 月纱月蚀银发身份修复（仅候选）

旧 `yuesha/cg-eclipse-candidate.webp` 的黑发双角身份与现行 V3 银发月纱冲突。已将**同一候选路径**替换为银白长发、赤瞳、蔷薇王冠的独立 3:4 月蚀绘景，并更新 `cg-manifest.json` 的 `previewSha256`；旧版可从 Git 历史追溯。

新候选原生 **1086×1448**，足以通过当前仅供 QA 的预览像素门槛，但**未达到正式 1536×2048 原生 CG 要求**，`yuesha-eclipse` 的 `status` 仍为 `portrait`；不得借此绕过人审或把候选宣称为正式上线。SHA-256、生成方式、原版哈希和未完成人工核对项目见 `docs/art-reviews/2026-11-21-yuesha-eclipse-silver-hair-candidate.md`。


## 2026-11-21 · 动作、姿势、服装与武器剪影差异化冻结

已建立 [角色 CG 差异化制作规范](CHARACTER-CG-DIFFERENTIATION-V1.md) 和 [`CG-DIFFERENTIATION-SHOT-LIST.json`](art-reviews/CG-DIFFERENTIATION-SHOT-LIST.json)。五张卡必须区分动作、身体重心、武器受力、衣装结构与构图剪影；两张月纱维持一致脸部身份但使用不同服装和姿势。`pnpm audit:character-cg-brief` 只检查镜头表条目齐全和唯一性，**不能证明图像已经按照镜头表重绘，不能代替真实图片人审**。正式入库门槛、哈希、权限与三种视口审查不变。


## 2026-11-22 · 第一阶段尺寸与新角色 SOP（现行，覆盖此前尺寸要求）

现在将原生 1086×1448 正式列为首批角色卡可审核的最低规格，支持在现有高质量独立动作研究稿上继续优化，并将“原生 1536×2048”改为后期可选精修任务。代码门禁见 `scripts/audit-character-cg.mjs`（`CG_MIN_NATIVE_SIZE`）；审核工具 `pnpm art:cg:review` 与 `pnpm art:cg:promote` 同步使用该标准，但**原生尺寸、权利、人物身份、武器/服装/动作、三视口及人工签署要求全部保留**。目前候选/研究稿不会因更改尺寸门槛自动晋级。

**新增人物必须按 [CHARACTER-CREATION-SOP.md](CHARACTER-CREATION-SOP.md) 的 G0—G7 流程**：先立项确认新人物/旧人物新卡 → 冻结独立面部骨相及耳角结构 → 对比全体已有角色的姿态、武器与服装剪影 → 单人原画与原生像素记录 → WebP/哈希/版权/三视口审核 → 人工签署后晋级 → 如需可玩则接入人物、卡池、存档与测试。任务开始时复制 [设计模板](templates/CHARACTER-DESIGN-BRIEF-TEMPLATE.md)，禁止跳过身份和差异化设计直接批量生成。

R12.101 第二批候选：月纱头像、半身像、肖像三张原 Git blob 迁入 public/art/characters/yuesha/（原文件名不变），同步跨页面静态导入、人物注册、抽卡公开 URL、CG 身份参考、R12.53 转换器及 manifest、设计清单、资源测试与目录门禁。Pixi 构建仅改变源路径，dist/assets/yuesha-avatar-v3.webp 及引擎加载链不变。公开 art 根目录只允许 README.md 和 r12-53-transition-manifest.json；43 公开、141 全仓媒体、原始像素、身份、卡面审批、存档、概率与回退保持不变。此迁移在独立 PR 进行候选 CI，未通过前不得称已合并或上线。
