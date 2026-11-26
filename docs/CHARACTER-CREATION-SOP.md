# 《怪物公寓》新角色与角色 CG 制作 SOP（长期执行版）

> **适用对象**：新增常驻人物、剧情人物、可抽取人物卡、既有人物的新卡面，以及旧立绘重制。生效日期：2026-11-22。**角色身份与可玩卡面是两种不同对象**：现有 4 位人物（月纱、泉泡、青枝、炽角）拥有 5 张卡（两张月纱）。不得把新卡面自动当作新人物。

## 一、制作目标与质量规格

**第一阶段可用尺寸：原生至少 1086×1448 px，3:4 竖幅。** 已有此尺寸的独立原画可进入正式人工审核；**1536×2048 是推荐的后续高细节版本，不再作为第一阶段上线前置条件**。允许真实原生尺寸更大且接近 3:4；不接受将小图放大后冒称“原生 1086×1448”或“原生 1536×2048”。保持原始源文件/生成记录、导出文件和 SHA-256。**尺寸过关只是入口，不等于立绘已获批准**。

所有人物原画遵守项目既有哥特奇幻风格与 `docs/IMPECCABLE.md`：精细材质、真实光影、完整单人物与武器、独立环境；不把文字、按钮、品阶、抽卡概率或导航烘焙进图片。不使用 Sparkles 图标。以 PC 效果为首要质量目标，同时保证移动端真实可用，优先采用成熟稳定的渲染与图像处理能力，不依靠反复调 CSS 伪造绘画细节。

## 二、角色制作八道关口（必须按顺序执行）

R12.109 现行身份和待办以本文最后的 R13.0 基线为准；早期银发、外部 ZIP 和旧研究路径为历史证据，不是新生产规范。

### G0 · 角色立项：先判断“新人物”还是“旧人物新卡面”

填写 [角色设计任务模板](templates/CHARACTER-DESIGN-BRIEF-TEMPLATE.md)。至少确认：中文名、不可变英文 `characterId`、人物年龄设定为成年、世界观身份、房间、职业/故事职责、性格、动机、伏笔、属性倾向、与现有居民的关系，以及是否需要进入抽卡/经营系统。**旧人物新卡面**沿用同一个 `characterId`、锁定头像与既有角色设定，仅另建唯一 `cardId`；严禁生成另一张脸代替该人物。

不要在没有明确游戏设计的情况下，因一把新武器就自动添加伤害、战斗或装备数值系统。角色武器可以先只作为美术和剧情道具。

### G1 · 冻结角色身份（先做头像/身份板，再做 CG）

建立**唯一身份锚点**：脸型和颧骨、下颌、眉眼/眼距、鼻梁和唇形、发际线、发色、耳/角结构、成熟感、体型比例、姿态习惯、人物性格气质。为新角色制作清晰面部基准并经人工核对后，放在 `public/art/characters/<characterId>/face.webp`（现有月纱为例外，使用 `public/art/characters/yuesha/yuesha-avatar-v3.webp` 的 R12.53 黑发过渡头像；正式 G1 尚待签署）。头像素材需记录来源、版本、原始像素、SHA-256。未经明确审查不得更换头像。

现有角色身份必须保持：

| 人物 | 不可丢失的识别锚点 | 禁止漂移 |
| --- | --- | --- |
| 月纱 `yuesha` | R12.53 现行黑发赤瞳过渡肖像、蔷薇哥特气质；以现行正面原图核对骨相 | 不自动恢复旧银发身份或新增未审核角饰；双卡不得换脸 |
| 泉泡 `brook` | 浅银蓝发、头顶蓝色毛绒兽耳、圆润柔和脸部 | 不得换成高饱和蓝发或长尖精灵耳 |
| 青枝 `fern` | 浅金发、绿眼、自然杏眼和花叶冠 | 不得换成泉泡式圆脸或月纱女王脸 |
| 炽角 `cinder` | 玫瑰红发、粉赤眼、独特双角轮廓 | 尊重 `src/core/character-life.ts` 的**金属铸角头饰**世界观设定；不可擅自改成真正的生物角 |

**同人多卡**：五官骨相必须相同，可切换表情、妆容、服装、武器和动作。不能因为“月蚀”和“誓约”主题不同就生成两张不相干的脸。

### G2 · 与既有人物做差异化设计（必须形成记录）

在 `docs/art-reviews/CG-DIFFERENTIATION-SHOT-LIST.json` 对照已有作品，逐个填写**不可重复的**主剪影、脸部骨相、身体重心、站姿/动作、武器用法、服装纸样、主/辅色、场景、机位、动态线、材质和禁则。至少提供一张远景剪影、脸部对照、服装结构草案。**96px 黑剪影**下应能识别角色和武器类别；不能五个人都并腿站直、同样尖下巴、同款低胸裙，仅更换发色。

已有五卡镜头表为现行参考（不是要求新人物复制姿势）：

- 月纱·月蚀：登阶前踏、月蚀长镰、黑金战斗礼服。
- 月纱·誓约：侧坐祭坛、邀请缔约、誓约细剑、银白酒红仪式长裙；与月蚀**同脸不同动作**。
- 泉泡·潮汐：踏浪扭转、潮汐三叉戟、珍珠水纱与毛绒兽耳。
- 青枝·春芽：侧身拉弓、藤弓、轻甲护臂与游侠靴。
- 炽角·余烬：低重心弓步、熔火锁链镰、赤铜锻炉战甲。

### G3 · 美术制作：先独立原画，再考虑特效与分层

1. 以 **G1 已批准的身份头像 + G2 该卡独立动作设定**作为参考，先画一人一图的 3:4 草稿。坚决拒绝五人拼版、截取其他作品的角色、复制换色、模糊上采样与整张 UI 概念图。
2. **原生至少 1086×1448**；建议以人物脚尖、头顶、耳/角及**完整武器最远端**为界留足画幅安全区，并保持合理的手指抓握、重心、布料和武器受力。1536×2048 可另设“精修版”里程碑，但不阻断第一阶段。
3. 每人至少有：锁定面部 `face.webp`、一张独立动作研究稿、独立角色 CG、来源/权利与审核记录；有房间剧情的角色另做**独立房间场景**，不得用同一大厅背景换色冒充独立空间。
4. 原始生成或分层工程文件安全留存（PNG、PSD 或原始模型输出及许可记录），转成 WebP 时不得虚构原生尺寸。WebP 允许渐进加载与合理压缩，但脸、手、纹饰、武器不可出现明显糊块。

**示例文件约定**（`<cardSlug>` 为卡面主题，不是人物名）：

```text
public/art/characters/<characterId>/
  face.webp
  cg-<cardSlug>-pose-study-v1.webp       # 仅研究，不由游戏读取
  cg-<cardSlug>-candidate.webp           # 指定候选，配套 SHA-256
  cg-<cardSlug>.webp                     # 只有人工晋级后才存在
  cg-provenance-cg-<cardSlug>.json        # 审核工具实际生成的 provenance 命名以代码为准
```

不要覆盖旧候选或历史研究稿；每次修改另建版本并在审核文档说明 `supersedes`，SHA-256 随真实文件更新。

### G4 · 技术初检与人工验收

自动门禁检查：文件真是 WebP、原生像素不少于 1086×1448、3:4、合理文件大小、路径与 SHA-256 对得上、原人物参考图存在。**这些检查不代表美术通过**。人工至少检查：

- 身份：四位不同人物明显不是同一张脸；同一人物不同卡仍是同一脸，耳型/角饰/发际线/眼型符合基准。
- 视觉：不同站姿、武器、衣装纸样、轮廓与表情；96px 黑剪影和小卡仍能辨别。
- 解剖：手指、武器握持、弓弦/锁链、脚底支点、衣服重力和身体透视合理。
- 安全区：完整 3:4 `contain` 没有断头、断脚、断武器；窄卡 `cover` 不切脸，卡片铭牌不压住核心形象。
- **三个真实视口**：1440×900、1648×928、390×844；不能只靠截图模拟或静态 HTML 就宣布浏览器验收完成。
- 源文件、创作方式、版权/商用许可、身份对照、人工 reviewer 和审核时间真实可追溯。

当一张 WebP 真正准备审核，按现有工具创建**独立审核目录**：

```bash
pnpm art:cg:review --card yuesha-eclipse --source /path/to/original-1086x1448.webp --out .art-staging/reviews/yuesha-eclipse
```

此命令只准备审核页和 `review-status.DRAFT.json`，**不自动批准**。审核中任何一项不合格则继续 `research-only` 或 `portrait`；不允许伪造 `approved:true`。原生 1536×2048 精修作品可以使用独立的 `pnpm art:cg:native` 生产入口，但它是**可选**的付费生成方式。

### G5 · 美术卡面晋级（仅通过正式签署后）

只有来源、身份、完整构图、原生尺寸、三视口与人工签署真实通过后，才使用：

```bash
pnpm art:cg:promote --card yuesha-eclipse --source /path/review/cg-candidate.webp --approval /path/review/signed-review.json
pnpm check:design
pnpm test
pnpm build
```

工具会把真正合格的资源放入原来批准的正式路径，记录 provenance，并令 `cg-manifest.json` 状态转为 `production`。**未获签署时仍为 `portrait`，玩家仅可使用已有候选/肖像。**审核通过 1086×1448 不等于“1536×2048 精修已完成”，不要混淆生产阶段。

### G6 · 真正新增可玩人物时的代码接入（切勿只复制图片）

**现有系统目前硬编码了 4 位剧情人物与 5 张卡，不能只往目录加入图片就当新角色成功。**先由产品确定新人物的剧情房间与玩法，再依需求同步更改：

1. **身份与剧情**：`src/core/character-life.ts` 的 `CharacterId`、`CHARACTER_PROFILES`、房间物件/对话及相关角色路由；如果只是旧角色新卡，不新增 `CharacterId`。
2. **卡面和抽取**：`src/core/character-collection.ts` 的卡位、`src/lib/summon/gacha-engine.ts` 的 `GACHA_CHARACTERS` 和必要卡池/规则。**概率总量应经过设计审查、加总核对与测试**；绝不因新增人物静默修改原有抽卡概率或保底。
3. **素材路由与锁定基准**：`src/components/summon/heroine-portrait-assets.ts` 的头像和预览表；`scripts/audit-character-cg.mjs` 的生产/候选/身份白名单；`public/art/characters/cg-manifest.json` 的卡位；镜头表与审核相关测试。考虑将现有固定 5 卡断言逐步重构为集中注册，但未经迁移测试不要贸然改造。
4. **经营、收藏与存档兼容**：新人物房间、人物关系、工坊派工、装备/属性、存档验证与旧存档迁移逐项审查。不得因增加角色导致已收藏、已有装备、老玩家数据无效；必要时增加向后兼容策略和回归测试。
5. **发布**：Quality、PC 桌面与移动端视觉、人物抽卡/收藏/房间导航及 GitHub Pages 部署确认后才能宣布已上线。若未接入玩法，说明“只有美术设定，尚不可抽取/访问”。

### G7 · 追踪与复盘

每位人物/卡面留一条 Issue，勾选：立项 → 身份锁定 → 差异化审查 → 原画文件 → SHA-256 → 原生分辨率 → 人工身份/动作/版权审核 → 三视口 → 正式晋级 → 代码回归 → 部署。保存被拒绝方案及原因（同脸、拼版、换耳型、武器出界），下一次避免再犯。

## 三、交付清单（任何新人物交付前逐项填写）

- [ ] 已明确是**新人物**还是**旧人物新卡面**，ID 唯一，角色设定与世界观一致
- [ ] 已冻结真人可对照的角色面部基准，骨相、耳/角、年龄感与配色明确
- [ ] 已和现有角色对照：不同脸、姿态、重心、武器、服装和剪影；同人多卡保持同脸
- [ ] 生成的是**独立单人 3:4** CG，不是拼版/截图/低清裁切，原生至少 **1086×1448**
- [ ] 已审核整把武器、发梢、鞋尖安全区，手指关节与动作受力合理
- [ ] 源文件、WebP、SHA-256、生成/版权/商用记录齐全
- [ ] 1440×900、1648×928、390×844 的真实视觉审核和人工签署完成
- [ ] 只有通过完整审核后才运行晋级和修改正式卡位
- [ ] 新增可玩人物的代码注册、概率、数据兼容、测试和部署均已完成（若不涉及请标记“不适用”）

**历史说明**：2026-11-22 之前文档中的“必须原生 1536×2048”属于旧阶段规格，已由本 SOP 与 `scripts/audit-character-cg.mjs` 的 1086×1448 最低尺寸规定替代。此前的人工拒绝记录依然有效（例如人物身份漂移、武器裁切和未签署），**不能因为降低最低像素就自动改变原画的审批结论**。

### 2026-11-23 · R12.17 G1 面部骨相差异门槛

新增四人物**同尺寸、相同机位和光线**的脸部身份板。审核必须能在不靠发色、耳、角、服装的情况下区分：月纱细长沉稳眼与较长脸、泉泡圆润颊和宽眼距、青枝清晰颧骨及游侠聚焦神态、炽角较宽的有力量感下颌和更坚定的眉眼；表情、鼻梁/鼻翼、唇峰/嘴角另行核对。**以上为待人工确认的设计方向，不是新的正式脸**。每人 3/4 侧脸也需区别，不能只在发型换色。同一月纱的月蚀/誓约两卡骨相必须相同，不能过度差异导致变成两个角色。

特别检查旧封面 `world-cover.webp` / `world-cover-mobile.webp`：当前黑发中景女性没有证据与已锁定银发月纱身份一致，三女性脸型模板化。未经人物身份审核不可借封面人物声称它们是可玩角色；详见 [R12.17](design/R12-17-FULL-SITE-VISUAL-IDENTITY-AUDIT-2026-11-23.md)。


### 2026-11-23 · R12.19 G1 单人面部生产新拒收条件

- **单角色身份稿必须是真正独立的一人一图**。任何输出若含项目进度板、标题、表格、CG 拼版、人物档案卡框、第二个人物或烘焙 UI，均直接标为 `rejected`；**不得从进度图裁切成独立源图**，即使裁出来局部尺寸看似可用。
- 每位现有人物先获得**单独生成的正脸原始源图＋3/4 侧脸原始源图**，原生尺寸、SHA-256、来源与权利记录要可复核；四人 2×2 比较板只能作展示，不算四幅独立源图。每人还要有至少三种有区分度的表情参考；此处是 **G1 头像规格**，不能代替 G3 单人物完整武器/足部 CG。
- **身份冻结与可绘性分开判**：新稿像素达到 1086×1448 不证明它就是 V3 月纱；必须先对照既有 canon，确认眼距、鼻唇、颧骨、脸型、耳/铸角类型与性格延续。四人灰度、遮发饰的同机位盲测和人工身份签署均不允许填充假结果。月纱双卡必须维持一张脸。
- 新候选保存在 `art-sources/characters/<characterId>/identity/`，历史批次目录只用于追溯，**下载包不等于 GitHub 入库**；必须核对文件真的存在于仓库并重算 SHA-256，才能宣称“已入项目”。确认身份和权限前不覆盖 `public/art/` 的现有 `face.webp` / V3，不动正式图片路由或 `cg-manifest.json`。
- 当前执行与拒收案例：[R12.19 月纱单人面部候选](art-reviews/R12-19-YUESHA-G1-INDEPENDENT-PORTRAIT-2026-11-23.md)、[G1 机器可读状态](art-reviews/R12-19-G1-IDENTITY-STATUS.json)。**截至该轮仅有月纱单人研究源图在会话 ZIP 中，4 人正式审核 0/4；封面 0/2、CG 0/5。**

### 2026-11-23 · R12.20 G1 审稿辅助板与错误生成隔离

1. **混合来源审核板必须显式逐格标注独立/拼版裁图。** 研究板可以同时显示四个人，便于看不同脸，但只有各自单独生成、保留原始源文件的肖像才可统计为 `independentSourceCreated`。例如 [R12.20 四人审核板](art-reviews/R12-20-BROOK-G1-INDEPENDENT-PORTRAIT-2026-11-23.md) 中，月纱、泉泡为独立源，青枝、炽角仍是 R12.18 旧拼版裁图。
2. **灰阶五官对照不等于盲测签署。** 它可以去掉配色干扰，仍必须进一步统一正/3⁄4 视角、头部比例、光线、表情与发饰遮挡；审核人必须真实记录结果。不同镜头的截图/裁切不可用作跨人物身份判定的充分证据。
3. **连续输出多人物项目汇报图应主动中止本批生产**。即使生成画面自称“G1 4/4”“CG 5/5 完成”，也不得写入实际状态；把不合格图单独记录为 `rejected`，逐项记录原图规格、SHA-256 和原因，但不要把它们塞进合格角色候选文件夹。
4. 本阶段**真实进度快照**见 [R12.20 G1 身份状态](art-reviews/R12-20-G1-IDENTITY-STATUS.json)：四人独立正面源图 **2/4**，3/4 同人视角 **0/4**，正式人工身份签署 **0/4**，PC/手机封面 **0/2**，正式五张 CG **0/5**。新源图仅在会话 ZIP 交付、暂未入 GitHub。不能以文档记录或下载包代替项目图片文件已存在的证据。

### 2026-11-23 · R12.21 G1 审稿实践补充：新脸不等于身份重置

- 新版**单人物原生高清研究稿**须同时保留生成器原始字节、导出 WebP 与 SHA-256，`art-sources/identity-r12-XX/` 是研究包的**目标路径**；只有仓库真实存在该文件且哈希相符，才能写 `inRepository:true`。会话 ZIP 或 Markdown 中出现目标路径都不是已入库证据。
- 新稿不但要检查已知身份锚点，还要逐项检查**意外新特征**（如旧设定未确认的尖耳、伤疤、异色瞳或额外生物角）。R12.21 青枝候选虽然浅金发、绿瞳、颧骨更鲜明，但明显的精灵耳与淡疤必须与 `fern/face.webp` 和剧情核对；尚不能确认为 canon。炽角的角必须按世界观表现成**金属铸角头饰**。
- 一张从无字单人原图输出的 WebP 是 G1 研究资产，不等于完整带武器、头脚可见的 G3 CG。四人 3/4 同人视角、遮发饰的灰阶身份盲测、权利来源及真实人工审查缺一不可；月纱两卡始终共用一个面部身份。
- 错误的“研发进度海报”“4/4 通过”“5/5 CG 完成”是**图中烘焙文字，不是验收结论**；连续两次将单人头像误生成进度图，应终止该批次，记录原图 SHA-256 和拒收原因后重新组织独立创作，禁止拼版裁切补数。R12.21 本轮按此规则拒收两幅炽角错误稿，保留真实计数 **独立研究 3/4、身份批准 0/4、封面 0/2、CG 0/5**。
- 最新对应证据：[R12.21 青枝独立原画及拒收记录](art-reviews/R12-21-FERN-G1-INDEPENDENT-PORTRAIT-2026-11-23.md)、[R12.21 G1 状态快照](art-reviews/R12-21-G1-IDENTITY-STATUS.json)。

### 2026-11-23 · R12.22 四位独立 G1 原画齐备后的**身份连续性关口**

**“四人独立原画完成”只表示四张单独生成的面部研究源图存在，不表示四位人物正式身份已锁定，更不等于四张含全身和武器的 CG。** [R12.22 审稿报告](art-reviews/R12-22-FOUR-INDEPENDENT-G1-FACES-2026-11-23.md)与 [最新机读状态](art-reviews/R12-22-G1-IDENTITY-STATUS.json) 中的准确计数为研究源图 **4/4**、G1 人工批准 **0/4**、正式封面 **0/2**、正式五卡 CG **0/5**。

- **新增“风格连续性”验收：** 新四人肖像明显偏写实 CG，而项目当前 `face.webp` / 月纱 V3 肖像偏二次元绘景，必须先确定未来正式统一画风，再逐张与旧身份特征、私室和抽卡卡面核对。不能让首页新写实头、图鉴旧动漫脸、房间另一套脸共存而宣称“身份一致”。
- **必须审旧脸认知而不是只比较新四人：** 月纱银发赤瞳及 V3、泉泡浅银蓝发＋蓝毛绒耳、青枝浅金绿瞳花叶冠、炽角玫红发＋金属铸角头饰，均需在新旧同尺度对照表中确认。尤其炽角旧头像更粉、脸更柔和；新研究稿更成熟写实，新增浅脸疤不应未经确认成为角色正典。青枝新稿尖耳／淡疤也要通过旧画及设定比对；旧图中的耳形可能已有尖耳轮廓，但不能凭记忆假定新耳型已批准。
- **建议下一组人审材料：** 四人各有同身份独立正面＋3/4 侧脸、三种表情；统一头部比例、镜头、光线、妆容，并制作遮发色／耳／角／首饰的灰阶骨相盲测。2026-11-23 的第一张灰阶对照**视角尚未统一**，只是视觉参考。
- **原始字节/发布状态必须双重校验：** R12.22 ZIP 汇集四位原生 1086×1448 PNG 与 WebP，配有逐文件 SHA-256 和验证脚本。它们尚未实际上传 GitHub；只有复制到仓库、GitHub 读取回真实文件哈希一致，才可将 G1 研究资产标成 `inRepository:true`。该字段**不等于** `approved:true` 或正式 `face.webp`。
- G1 人审真正通过后才允许封面 16:9 PC / 9:16 手机与五卡独立全身 CG 的重制。仍不改现有七路由、卡池概率、存档或 `cg-manifest.json`，不允许插值放大、卡片 UI 烘焙、拼版裁切冒充原画。


## R12.75 · 工坊角色规范归并

旧 V2 成年人物方案已退役（[固定快照](https://github.com/kunlong-luo/monster-apartment/tree/e4d74994de44989f3e16296caf9f85e118ab807c/v2/docs/adult-character-art-direction.md)），不沿用其未实施的别名与身份。角色保持明确成年、独立脸型/体态/姿态、职业服装与实际工具，工作岗位保留合理防护；服装不遮挡有效交互。制作独立工作帧而非静图平移，人物身份、年龄与原画审批以现行数据与本 SOP 为准，不重复另建角色规范。

R12.101 第二批候选：月纱头像、半身像、肖像三张原 Git blob 迁入 public/art/characters/yuesha/（原文件名不变），同步跨页面静态导入、人物注册、抽卡公开 URL、CG 身份参考、R12.53 转换器及 manifest、设计清单、资源测试与目录门禁。Pixi 构建仅改变源路径，dist/assets/yuesha-avatar-v3.webp 及引擎加载链不变。公开 art 根目录只允许 README.md 和 r12-53-transition-manifest.json；43 公开、141 全仓媒体、原始像素、身份、卡面审批、存档、概率与回退保持不变。此迁移在独立 PR 进行候选 CI，未通过前不得称已合并或上线。

## R12.109 → R13.0 · 现行角色原画交付基线（2026-11-25）

现行过渡素材以已发布 083699c 的实际 [源图清单](../art-sources/source-catalog.json)、[转换清单](../public/art/r12-53-transition-manifest.json)、[CG manifest](../public/art/characters/cg-manifest.json) 为准。R12.24 的外部 G1 ZIP 属于不同历史批次，未入库的旧 ZIP 不等于现有四位原图缺失；不得混用哈希或更改历史审核记录。当前 `art-sources/characters/` 共 17 张独立登记 PNG：4 张正面、4 张 3/4 候选、5 张 CG 源图、4 张站姿。正面源图均为 review；人审签署 0/4，正式 CG 0/5。月纱当前玩家可见为 R12.53 黑发过渡身份（非正式 G1 批准），不是早期银发版本；不得按历史银发描述自动恢复或换脸。当前正面原图优先作为同人对照，正式身份仍须人审。

| 人物 | 当前正面 | 3/4 候选 | CG 下一动作 |
| --- | --- | --- | --- |
| 月纱 | `characters/yuesha/identity/front.png` | rework：银发与新增双角偏离黑发基准 | 月蚀 / 誓约两稿均 review；先同脸对照，再各自完整武器、动作与衣装验收 |
| 泉泡 | `characters/brook/identity/front.png` | rework：兽耳变鱼鳍 | 潮汐原图 rework：烘焙英文标题/标志；重绘独立无字完整三叉戟画面 |
| 青枝 | `characters/fern/identity/front.png` | review：颊纹和脸部一致性 | 春芽原图 review：完整藤弓、手部和身份 |
| 炽角 | `characters/cinder/identity/front.png` | review：金属铸角、脸型及新增纹样 | 余烬原图 rework：烘焙英文标题/标志；重绘独立无字完整链镰画面 |

表中路径相对于 `art-sources/`；其余 3/4、CG、站姿确切路径见源图清单。R13.0 第一切片先以四位已入仓正面原图制作同尺度身份对照，核查四张独立 3/4（优先修月纱与泉泡），表情参考至少三种，记录人审/来源与真实原生像素。再处理两张必须返工的 CG；其余三张先审后决定是否重绘，避免无意义重复生产。G1 没有签署不得改头像或晋级。原生 1086×1448 最低人审入口、1536×2048 推荐精修、PC/手机真实预览与现有概率/存档均保持。

### R13.0-A · 现有原图审稿入口与完整性校验

不新增图片副本。以下三列分别链接真实仓库正面、3/4 候选、玩家实际头像，打开即可对照原图。尺寸来自现行转换清单；不是本轮人工看图验收。

| 人物 | 正面原图（1086×1448） | 侧脸原图（原生尺寸 / 状态） | 游戏头像（600×600） |
| --- | --- | --- | --- |
| 月纱 | [正面](../art-sources/characters/yuesha/identity/front.png) | [1199×1312 / rework](../art-sources/characters/yuesha/identity/three-quarter-candidate.png) | [头像](../public/art/characters/yuesha/yuesha-avatar-v3.webp) |
| 泉泡 | [正面](../art-sources/characters/brook/identity/front.png) | [1199×1312 / rework](../art-sources/characters/brook/identity/three-quarter-candidate.png) | [头像](../public/art/characters/brook/face.webp) |
| 青枝 | [正面](../art-sources/characters/fern/identity/front.png) | [1218×1292 / review](../art-sources/characters/fern/identity/three-quarter-candidate.png) | [头像](../public/art/characters/fern/face.webp) |
| 炽角 | [正面](../art-sources/characters/cinder/identity/front.png) | [1199×1312 / review](../art-sources/characters/cinder/identity/three-quarter-candidate.png) | [头像](../public/art/characters/cinder/face.webp) |

四张侧脸均低于现行竖幅身份原画 1448px 高度门槛，不能作为最终原生达标稿；其中两张还存在明确身份漂移。优先重绘月纱、泉泡；青枝、炽角先审身份，再补匹配角度和原生尺寸。不得放大冒充原生，也不得以正面达标自动判定侧脸通过。

复用现有 G1 校验器：`node scripts/verify-g1-face-sources.mjs --current`，检查 8 个 PNG 原始字节、尺寸、SHA-256、Git blob、源图/转换清单状态和 4 个 WebP 实际头像字节、600×600 裁切元数据及来源关系。原 `pnpm art:g1:verify` 仍检查历史 R12.22 外部 ZIP，两个入口不混用。现有 `pnpm art:g1:test` / `pnpm check:design` 增加真实仓库检查；新检查尚待 CI，不替代像素级裁切对照、人工身份/授权签署。下一步为原生独立单人侧脸返工与审稿，不改运行资源、概率、审批或存档。

### R13.0-B · 月纱与泉泡侧脸返工任务（待取得图像参考后制作）

R13.0-A 已经通过 [Quality 45616340403](https://github.com/kunlong-luo/monster-apartment/actions/runs/45616340403)：当前 12 项 PNG/WebP 字节、尺寸、来源与哈希检查通过；历史 ZIP 校验测试与当前仓库校验共 10/10，64 Vitest 文件/324 测试通过，649 条文档链接零违规。此为自动技术核验，不代表人工身份审核。当前会话 GitHub 读取接口无法返回原画二进制，不能把未看见的图像当作已视觉比对，也不生成缺少原图参照的替代脸。以下为真实文件的 GitHub 可视审稿入口，未复制图片。

| 人物 | 现行正面原画（以此为身份参考） | 已登记返工侧脸（不得当作身份参考） |
| --- | --- | --- |
| 月纱 | [<img src="../art-sources/characters/yuesha/identity/front.png" width="210" alt="月纱现行正面候选">](../art-sources/characters/yuesha/identity/front.png) | [<img src="../art-sources/characters/yuesha/identity/three-quarter-candidate.png" width="210" alt="月纱待返工侧脸">](../art-sources/characters/yuesha/identity/three-quarter-candidate.png) |
| 泉泡 | [<img src="../art-sources/characters/brook/identity/front.png" width="210" alt="泉泡现行正面候选">](../art-sources/characters/brook/identity/front.png) | [<img src="../art-sources/characters/brook/identity/three-quarter-candidate.png" width="210" alt="泉泡待返工侧脸">](../art-sources/characters/brook/identity/three-quarter-candidate.png) |

#### B1 月纱：独立 3/4 身份原画

以 R12.53 已入库正面原图为唯一人物身份图像参照，而不是银发旧候选。成年哥特奇幻女性、黑发赤瞳、蔷薇与金月饰、沉静自信；以正面实图锁定脸部骨相、颧骨、下颌、眉眼、鼻唇比例、发际线与衣领，不自行增删原图既有饰物。头部转向约 35–45°、自然视线、中性闭唇表情；头顶、全部发饰、双肩可见；中性暗紫背景、柔和侧前光、头部比例与原正面一致。禁止银发回退、凭空新增双角、换成模板脸、拼版、文字、水印、UI、放大冒充原生。只输出一位角色的一张独立 3:4 PNG；至少 1086×1448，推荐 1536×2048。拟存 `art-sources/characters/yuesha/identity/three-quarter-candidate-v2.png`（尚不存在）。

#### B2 泉泡：独立 3/4 身份原画

以 R12.53 泉泡正面原图为唯一人物身份图像参照。成年幻想女性、浅银蓝发、头顶蓝色毛绒兽耳、柔和圆润骨相；严格核对耳朵根部、毛绒质感、面部宽高比和眼鼻唇结构，沿用正面服饰与配饰。采用与 B1 一致的头部角度、画幅、镜头比例、中性表情和光照，保持人物本身差异而非靠颜色识别。禁止鱼鳍状兽耳、长尖精灵耳、饱和蓝发、月纱式模板脸、其他角色、拼版、文字、水印与 UI。独立原生 3:4 PNG ≥1086×1448。拟存 `art-sources/characters/brook/identity/three-quarter-candidate-v2.png`（尚不存在）。

#### 收件与拒收

- 先检查单人物、原生尺寸、源图实际字节、权利/生成来源；只在文件实际入仓并读回 SHA-256/Git blob 后新增源图登记。v1 原稿及原转换清单保持不动；新稿标记 review 与 supersedes，不能改写 v1 哈希或把拟存路径列入实际库存。
- 对照正面及头像：人审记录骨相、耳/角、发际线、同人连续性、风格一致性，另附至少三种表情参考与跨人物同尺度灰阶审稿。任何失败退回重绘；没有人审签署不晋级。
- 当前两张新版侧脸均未生成、未上传、未批准；先完成 B1，再 B2，不先生成封面或 CG。青枝、炽角继续按现有 SOP 评估；正式身份 0/4，正式 CG 0/5。

### R13.0-C · 青枝与炽角身份审核与原生侧脸返工准备（未签审）

本阶段并行准备剩余两位的审稿任务，不表示 R13.0-B 已完成。以下问题来自现有台账和转换清单，不是本次重新看图的结论。

| 人物 | 现行正面参照 | 现行侧脸候选（均不达原生高度） | 正式游戏头像对照 |
| --- | --- | --- | --- |
| 青枝 | [正面](../art-sources/characters/fern/identity/front.png) | [1218×1292，review](../art-sources/characters/fern/identity/three-quarter-candidate.png) | [头像](../public/art/characters/fern/face.webp) |
| 炽角 | [正面](../art-sources/characters/cinder/identity/front.png) | [1199×1312，review](../art-sources/characters/cinder/identity/three-quarter-candidate.png) | [头像](../public/art/characters/cinder/face.webp) |

- C1 青枝：保留浅金发、绿瞳、杏眼、花叶冠、清晰颧骨和游侠神态。对照正面与实际头像审核颊纹、尖耳和淡疤是否有正典依据；未经确认不得新增或擅删。拒绝泉泡式圆脸、月纱式女王脸。拟存 `art-sources/characters/fern/identity/three-quarter-candidate-v2.png`（拟定路径，尚未交付）。
- C2 炽角：保留玫瑰红发、粉赤眼、坚定眉眼、较宽下颌；双角必须遵守金属铸角头饰设定，不得变成生物角。审核旧头像与研究稿脸型差别及新增纹样、脸疤；未经签审不得确认为正典。拟存 `art-sources/characters/cinder/identity/three-quarter-candidate-v2.png`（拟定路径，尚未交付）。
- 两位与 B1/B2 统一独立单人原生 3:4 PNG，至少 1086×1448，推荐 1536×2048，35–45° 机位、中性闭唇、同尺度柔和审稿光；不得拼版裁切、插值放大或烘焙 UI。优先锁定实际正面面部结构，再补侧脸。新图实际入库、读取哈希、来源及人工签审之后才更新登记与生产状态。
- 四人最终联合审查：先同尺度灰阶遮蔽发色与装饰，比对眼距、颧骨、颌线、鼻唇与年龄感；再核对色彩、耳角、发饰及同人正侧面连续性。每位分别记录通过、拒绝或待审、审稿人及证据；技术门禁通过不等于人审。
- 当前四位正面尺寸合格 4/4，侧脸高度达标 0/4，正式身份 0/4，正式 CG 0/5。未取得原画图像内容，不生成无参照新脸，不更改 v1 或生产 manifest，不提前进入封面及 CG 重制。B1/B2 优先制作，C1/C2 为并行准备；四位通过身份审稿后才推进五卡。

### R13.0-D · 四人五卡身份映射（准备完成，尚未签审）

以 [源图清单](../art-sources/source-catalog.json)、[转换清单](../public/art/r12-53-transition-manifest.json)、[CG manifest](../public/art/characters/cg-manifest.json) 和 [运行注册表](../src/components/summon/heroine-portrait-assets.ts) 为准。每位人物的正面与侧脸固定在 `art-sources/characters/<id>/identity/{front,three-quarter-candidate}.png`；站姿源在 `sprites/standing.png`，房间观景使用 `public/art/rooms/<id>/scenic/standing.webp`，不等于正式角色层审批。

| 卡 ID | 人物 | 原始 CG（相对 art-sources/characters） | 现行预览（相对 public/art） |
| --- | --- | --- | --- |
| yuesha-eclipse | 月纱 | yuesha/cg/eclipse.png · review | characters/yuesha/cg-eclipse-candidate.webp |
| yuesha-vow | 月纱 | yuesha/cg/vow.png · review | characters/yuesha/cg-vow-candidate.webp |
| brook-tide | 泉泡 | brook/cg/tide.png · rework | rooms/brook/scenic/standing.webp |
| fern-spring | 青枝 | fern/cg/spring.png · review | characters/fern/cg-spring-candidate.webp |
| cinder-ember | 炽角 | cinder/cg/ember.png · rework | rooms/cinder/scenic/standing.webp |

五项预览路径、来源人物目录、类型和登记输出 SHA-256 在两个 manifest 间一致；本次为元数据核对，非实际图片哈希重算。月纱头像、肖像及胸像来自同一正面候选；两卡独立 CG 不能换脸。其余三人使用各自 face.webp，泉泡与炽角的过渡站姿共享路径不新建副本。仍为 4 正面、4 侧脸、5 CG、4 站姿源，身份批准 0/4、正式 CG 0/5。

[现行机器镜头表](art-reviews/CG-DIFFERENTIATION-SHOT-LIST.json) 已纠偏：浅银蓝泉泡、浅金青枝、金属铸角与粉赤眼炽角、黑发同脸月纱。暂沿用 R12.53 机器表魔典/重锤候选方向，历史细剑/链镰保留为备选研究而非强制要求，最终武器须产品/人工确认。五项姿态、剪影、武器、服装 ID 分别唯一；两张月纱 face/identity 字段一致。见 [差异化规范](CHARACTER-CG-DIFFERENTIATION-V1.md) 的 R13.0-D 当前覆盖规则；历史研究图与哈希不变。

现有 CG 审核器会核对卡位、当前肖像哈希、原生尺寸、商业授权、具名视觉人审和三视口，但不能判断实际脸部一致性，且肖像引用不等于独立 G1 签审。后续正式晋级前必须补四人 G1 正侧脸具名签审与证据绑定，不能靠改 status 绕过。B/C 原画未交付前，不执行封面/CG 批量重绘或运行时切换。保持卡池权重、概率、角色 ID、存档及资源审批原样。

### R13.0-E · 正式 CG 的 G1 强制准入

正式 CG 的审核与晋级均经 `assertCharacterCgReview`，现在必须验证同人物具名 G1 证明及其实际 SHA-256；两个现有候选/过渡流程不受影响。新审核草稿的 `g1Approval` 默认为 null，不可自动批准。

未来每位通过人审的证明固定为 `art-sources/characters/<id>/identity/approval.json`（本轮不创建虚假证明）。schemaVersion=1、character、approved、humanVisualReview、identityConsistent、independentNativeSources、rightsConfirmed、commercialUse、crossCharacterReview 均须符合审核要求，并填写 reviewer、reviewedAt、reviewNotes、sourceReference。front 与 angle 分别指向 front.png 和 three-quarter-candidate-v2.png；每个证据含 path、bytes、sha256、pixelDimensions 数组。源图须原生 3:4 ≥1086×1448，源图清单唯一登记为 review、实际 Git blob 与字节一致；禁止 rework、同图或跨人物冒用。references 包含当前头像（及月纱肖像、胸像）的相同字段，须与现行转换清单中同一 front 来源及哈希、尺寸一致。正式 CG 审核 JSON 填入 g1Approval: {path,sha256}，两张月纱卡绑定同一个身份文件。任何身份文件或图片变更必须重新签审、核对 CG 来源。

这是具名审核记录的技术完整性门禁，不是数字签名、图像完整解码或自动识脸；人审仍不可跳过。现行 CI 的 G1 测试增加合成正例及错误人物、缺失签审、过时哈希、尺寸不足、同图和来源错配反例。晋级成功时清除旧候选预览字段，仍保留原有失败回滚。没有新原画或真实人审，本轮正式身份 0/4、正式 CG 0/5，待新 SHA Quality 验收。

### R13.0-F · 身份审核草稿与 CG 晋级闭环

R13.0-E 的 [Quality 45618780099](https://github.com/kunlong-luo/monster-apartment/actions/runs/45618780099) 三作业成功。在仓库根目录执行 `node scripts/verify-g1-face-sources.mjs --draft brook` 可输出 JSON 草稿，所有人工批准字段默认为 false，缺失文件为 null，不创建 approval.json。实际 v2 原画入库后同步源图清单与媒体总目录第 5 节，生成草稿并具名人审；签审后才保存固定 approval.json 并将其 SHA-256 写入 CG 审核 JSON。

历史动作研究与正式卡面可以共存：研究记录必须仍为 research-only、approved=false，哈希及路径固定，正式 CG 不能与研究稿字节相同。晋级后同时执行 CG 审核与差异化检查，失败恢复原 manifest 并移除本次新增正式资源和证明。新增合成测试覆盖草稿、独立正式晋级、历史稿冒用回滚和缺失 G1 拒收，不代表实际画稿人审。其他仓库级媒体库存与 CI 仍须独立同步验收。正式身份 0/4、CG 0/5。

### R13.0-G · 美术生产待办与收件

[90b4959 Quality](https://github.com/kunlong-luo/monster-apartment/actions/runs/45619281666) 与 [Pages](https://github.com/kunlong-luo/monster-apartment/actions/runs/45619429730) 已成功；技术准备不等于 G1 人审。2026-11-26 实际仓库树核对四份 v2 侧脸与四份 approval.json 全部不存在。

| 优先 | 人物 | 下一份真实交付 | CG 后续 |
| --- | --- | --- | --- |
| 1 | 月纱 | 黑发正面参照 → 独立 3/4 v2，排除银发和多余角 | 月蚀与誓约先同脸审核 |
| 2 | 泉泡 | 浅银蓝发、毛绒兽耳 3/4 v2 | 潮汐去烘焙标题标志，独立重绘 |
| 3 | 青枝 | 浅金发、花叶冠 3/4 v2，额外纹样先确认 | 春芽完整藤弓与身份审核 |
| 4 | 炽角 | 金属铸角、粉赤眼 3/4 v2 | 余烬去烘焙标题标志，武器候选先定案 |

收件顺序：实际 PNG → 原生尺寸及真实字节/来源 → Git blob 与 SHA-256 → source-catalog.json 唯一路径 review 条目（保留旧 v1）→ 资源总目录第 5 节新增库存行 → `node scripts/verify-g1-face-sources.mjs --draft <id>` → 具名人审 → 正式审核 JSON 与绑定 → `pnpm audit:media-duplicates`、`pnpm check:design`、Quality。草稿不是批准；禁止对缺失路径填虚构哈希。若重绘正面，必须同时更新所有相关头像转换及证据，不单独改 front。已有原图 17 张不重复制；当前四人 G1 0/4、正式 CG 0/5。后续停止单纯扩张管理工具，优先实际原画或经营体验。


## R13.1-J · 两张修复候选已实际入库

泉泡 [tide-clean-v2.png](../art-sources/characters/brook/cg/tide-clean-v2.png)、炽角 [ember-clean-v2.png](../art-sources/characters/cinder/cg/ember-clean-v2.png) 已入 Git；角色源图现19张（4正面、4侧脸、7 CG含两份原rework与修复候选、4站姿）。两张独立公开候选由 [CG manifest](../public/art/characters/cg-manifest.json) 绑定，旧房间站姿仍供观景，不再为这两张卡的当前预览。原画去字、人物/武器与四人同人差异仍需人审；新 SHA 需验证现有原生尺寸与哈希测试。4张新版侧脸 v2 尚未入库；G1 0/4、生产CG 0/5，不能跳过审批。
