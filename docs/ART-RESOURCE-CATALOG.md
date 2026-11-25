# 怪物公寓 · 美术资源总目录（R12.97）

> 本文件是资源菜单、命名规范及去重记录。第 5 节是当前快照；以下 R12.52–64 阶段记录为历史证据。当前版本见 [根 README](../README.md)，生产与过渡状态以对应 manifest 为准。上传提交 [64485f5](https://github.com/kunlong-luo/monster-apartment/commit/64485f5a5c483bd21e9f781e8f7cd7bbe7c6eaad) 的全部 33 张新增 PNG 均按原 Git blob 迁移，无重新编码。程序仍使用原有正式资源；本次不晋级 CG、不替换页面、不改变版本、概率或存档。机器可读的新批次映射见 [source-catalog.json](../art-sources/source-catalog.json)。

## 1. 目录菜单

| 职责 | 路径 | 维护约定 |
| --- | --- | --- |
| 人物身份 / CG / 透明立绘 | [art-sources/characters/](../art-sources/characters/) | 每个角色一个稳定 ID 文件夹，按 identity/cg/sprites 细分 |
| 欢迎页 | [art-sources/covers/](../art-sources/covers/) | 群像横竖版，不与单人大厅混用 |
| 私人房间 | [art-sources/rooms/](../art-sources/rooms/) | 每个角色独立背景；卧室候选分开 |
| 世界地点 | [art-sources/scenes/](../art-sources/scenes/) | lobby/apartment/workshop/town 等稳定地点 ID |
| 原有审稿原画 | [art-sources/review/](../art-sources/review/) | 已绑定 R12 哈希和审核证据，保留路径 |
| 正式角色与卡面 | [public/art/beauty-beasts/characters/](../public/art/beauty-beasts/characters/) | 由 [CG manifest](../public/art/beauty-beasts/characters/cg-manifest.json) 及 [角色注册](../src/components/summon/heroine-portrait-assets.ts) 管理 |
| 正式欢迎页 | [public/art/beauty-beasts/cover/](../public/art/beauty-beasts/cover/) | 当前 PC/mobile 群像 |
| 正式大厅 | [public/art/](../public/art/) | lobby-hero-v4.webp / lobby-hero-v4-mobile.webp；V3 为旧公寓及回退 |
| 正式私室 | [public/art/rooms/](../public/art/rooms/) | [rooms manifest](../public/art/rooms/manifest.json)，现有概念及未来背景/姿态槽 |
| 世界地点 | [public/art/world-scenes/](../public/art/world-scenes/) | [R12 manifest](../public/art/world-scenes/r12-scene-manifest.json)，现行图和显式审稿资源 |
| 图鉴装饰 | [public/art/decorations/](../public/art/decorations/) | 独立 SVG 装饰及来源清单，不是正式场景 CG |
| 地点海报 | [public/art/postcards/](../public/art/postcards/) | 小型入口图，不当全屏背景 |
| Pixi 工坊 | [engine/art/](../engine/art/) | 运行中的设备和环境资源，R12.76 源目录改名，字节不变 |
| 文档证据 | [docs/art-reviews/](art-reviews/) | 审核来源、权利、对照图及历史记录 |
| 历史设计参考 | [public/assets/aistudio/](../public/assets/aistudio/) | 保留原件及引用；不新增临时重复媒体 |

## 2. 统一命名规范

- 新素材路径及文件名只用英文小写、数字、连字符；稳定角色 ID 为 yuesha / brook / fern / cinder，地点 ID 为 lobby / apartment / workshop / town / orders / warehouse / characters。英文 ID 不随中文角色名称改变。
- 角色原画使用 `characters/<id>/identity/front.png`、`identity/three-quarter-candidate.png`、`cg/<variant>.png`、`sprites/standing.png`；正式动作后续使用 idle/attentive/warm/guarded 等语义名。
- 房间使用 `rooms/<id>/background.png`，附加候选使用 `bedroom-candidate.png`；场景使用 `scenes/<location>/desktop.png`、`mobile.png`，待选方案使用 `desktop-candidate-v1.png` 等。欢迎页用 welcome-desktop/mobile.png。
- 版本、原始路径、哈希和审核状态放入清单，不在长期目录名中堆叠 R12 批次号。PNG 原画只保存一次；WebP 正式输出按真实像素及用途生成。透明素材保留 alpha。生产路径必须由 manifest 明确映射；不直接将研究源图作为正式公开资产。
- 历史引用路径（尤其锁定哈希的审稿链、现行 UI/Pixi 资源）不能直接批量重命名；迁移时必须同时更新代码、CSS、动态引用、测试、文档链接和清单。禁止以清理为由取消回退或校验。

## 3. 33 张新增原画：实际新路径

状态 review = 待验收，rework = 已发现明显内容偏差待返工；两者均非正式批准。文件实际 Git blob/字节已核实；未重新解码这 33 个 PNG，先不声称像素、alpha、内容或角色身份最终通过。此前生成画面已暴露的偏差列于备注。

### 身份基准（4）

| 新资源文件 | 原路径 | 状态 | 审核重点 |
| --- | --- | --- | --- |
| [characters/brook/identity/front.png](../art-sources/characters/brook/identity/front.png) | `art-sources/identity-r12-45/brook.png` | review | 正面身份候选，核对脸型及同人一致性。 |
| [characters/cinder/identity/front.png](../art-sources/characters/cinder/identity/front.png) | `art-sources/identity-r12-45/cinder.png` | review | 正面身份候选，核对脸型及同人一致性。 |
| [characters/fern/identity/front.png](../art-sources/characters/fern/identity/front.png) | `art-sources/identity-r12-45/fern.png` | review | 正面身份候选，核对脸型及同人一致性。 |
| [characters/yuesha/identity/front.png](../art-sources/characters/yuesha/identity/front.png) | `art-sources/identity-r12-45/yuesha.png` | review | 黑发新身份与现行银发正式身份不同，需统一批准后跨页面替换。 |

### 侧脸（4）

| 新资源文件 | 原路径 | 状态 | 审核重点 |
| --- | --- | --- | --- |
| [characters/brook/identity/three-quarter-candidate.png](../art-sources/characters/brook/identity/three-quarter-candidate.png) | `art-sources/identity-r12-50/brook-34.png` | rework | 此前生成稿兽耳变鱼鳍，不作正式身份。 |
| [characters/cinder/identity/three-quarter-candidate.png](../art-sources/characters/cinder/identity/three-quarter-candidate.png) | `art-sources/identity-r12-50/cinder-34.png` | review | 核对铸角、脸型及新增纹样。 |
| [characters/fern/identity/three-quarter-candidate.png](../art-sources/characters/fern/identity/three-quarter-candidate.png) | `art-sources/identity-r12-50/fern-34.png` | review | 核对颊纹及脸部身份。 |
| [characters/yuesha/identity/three-quarter-candidate.png](../art-sources/characters/yuesha/identity/three-quarter-candidate.png) | `art-sources/identity-r12-50/yuesha-34.png` | rework | 此前生成稿银发与新增双角偏离黑发基准，不作正式身份。 |

### CG（5）

| 新资源文件 | 原路径 | 状态 | 审核重点 |
| --- | --- | --- | --- |
| [characters/brook/cg/tide.png](../art-sources/characters/brook/cg/tide.png) | `art-sources/cg-r12-46/brook/cg-tide.png` | rework | 生成图有烘焙英文标题/标志，先修正再作正式 CG。 |
| [characters/cinder/cg/ember.png](../art-sources/characters/cinder/cg/ember.png) | `art-sources/cg-r12-46/cinder/cg-ember.png` | rework | 生成图有烘焙英文标题/标志，先修正再作正式 CG。 |
| [characters/fern/cg/spring.png](../art-sources/characters/fern/cg/spring.png) | `art-sources/cg-r12-46/fern/cg-spring.png` | review | 核对完整人物、武器、同人身份与像素。 |
| [characters/yuesha/cg/eclipse.png](../art-sources/characters/yuesha/cg/eclipse.png) | `art-sources/cg-r12-46/yuesha/cg-eclipse.png` | review | 核对完整人物、武器、同人身份与像素。 |
| [characters/yuesha/cg/vow.png](../art-sources/characters/yuesha/cg/vow.png) | `art-sources/cg-r12-46/yuesha/cg-vow.png` | review | 核对完整人物、武器、同人身份与像素。 |

### 透明立绘（4）

| 新资源文件 | 原路径 | 状态 | 审核重点 |
| --- | --- | --- | --- |
| [characters/brook/sprites/standing.png](../art-sources/characters/brook/sprites/standing.png) | `art-sources/sprites-r12-48/brook.png` | review | 需读取实际 alpha、边缘、头脚、落地点；静态立绘，不代表骨骼动画。 |
| [characters/cinder/sprites/standing.png](../art-sources/characters/cinder/sprites/standing.png) | `art-sources/sprites-r12-48/cinder.png` | review | 需读取实际 alpha、边缘、头脚、落地点；静态立绘，不代表骨骼动画。 |
| [characters/fern/sprites/standing.png](../art-sources/characters/fern/sprites/standing.png) | `art-sources/sprites-r12-48/fern.png` | review | 需读取实际 alpha、边缘、头脚、落地点；静态立绘，不代表骨骼动画。 |
| [characters/yuesha/sprites/standing.png](../art-sources/characters/yuesha/sprites/standing.png) | `art-sources/sprites-r12-48/yuesha.png` | review | 需读取实际 alpha、边缘、头脚、落地点；静态立绘，不代表骨骼动画。 |

### 欢迎封面（2）

| 新资源文件 | 原路径 | 状态 | 审核重点 |
| --- | --- | --- | --- |
| [covers/welcome-desktop.png](../art-sources/covers/welcome-desktop.png) | `art-sources/cover-r12-47/welcome-desktop.png` | review | 群像欢迎页，与大厅分开；验证原生像素与裁切。 |
| [covers/welcome-mobile.png](../art-sources/covers/welcome-mobile.png) | `art-sources/cover-r12-47/welcome-mobile.png` | review | 群像欢迎页，与大厅分开；验证原生像素与裁切。 |

### 大厅（2）

| 新资源文件 | 原路径 | 状态 | 审核重点 |
| --- | --- | --- | --- |
| [scenes/lobby/desktop.png](../art-sources/scenes/lobby/desktop.png) | `art-sources/cover-r12-47/lobby-desktop.png` | review | 月纱单人大厅，与欢迎群像分开；验证真实 HUD 避让。 |
| [scenes/lobby/mobile.png](../art-sources/scenes/lobby/mobile.png) | `art-sources/cover-r12-47/lobby-mobile.png` | review | 月纱单人大厅，与欢迎群像分开；验证真实 HUD 避让。 |

### 私室（4）

| 新资源文件 | 原路径 | 状态 | 审核重点 |
| --- | --- | --- | --- |
| [rooms/brook/background.png](../art-sources/rooms/brook/background.png) | `art-sources/rooms-r12-49/brook.png` | review | 独立房间候选，需确认内容及实际热点位置。 |
| [rooms/cinder/background.png](../art-sources/rooms/cinder/background.png) | `art-sources/rooms-r12-49/cinder.png` | review | 独立房间候选，需确认内容及实际热点位置。 |
| [rooms/fern/background.png](../art-sources/rooms/fern/background.png) | `art-sources/rooms-r12-49/fern.png` | review | 独立房间候选，需确认内容及实际热点位置。 |
| [rooms/yuesha/background.png](../art-sources/rooms/yuesha/background.png) | `art-sources/rooms-r12-49/yuesha.png` | review | 独立房间候选，需确认内容及实际热点位置。 |

### 卧室备选（2）

| 新资源文件 | 原路径 | 状态 | 审核重点 |
| --- | --- | --- | --- |
| [rooms/fern/bedroom-candidate.png](../art-sources/rooms/fern/bedroom-candidate.png) | `art-sources/rooms-r12-49/fern-v2.png` | review | 额外卧室候选，依据前序图片内容与上传名称归类，需回读目视确认。 |
| [rooms/yuesha/bedroom-candidate.png](../art-sources/rooms/yuesha/bedroom-candidate.png) | `art-sources/rooms-r12-49/Gothic Moonlit Luxury Chamber.png` | review | 额外卧室候选，依据前序图片内容与上传名称归类，不覆盖会客室，需回读目视确认。 |

### 地点绘景（6）

| 新资源文件 | 原路径 | 状态 | 审核重点 |
| --- | --- | --- | --- |
| [scenes/apartment/desktop-candidate.png](../art-sources/scenes/apartment/desktop-candidate.png) | `art-sources/scenes-r12-51/hall-desktop.png` | rework | 生成图未呈现六个可独立定位实体门，不替代已通过交互的 S02 研究图。 |
| [scenes/apartment/mobile-candidate.png](../art-sources/scenes/apartment/mobile-candidate.png) | `art-sources/scenes-r12-51/hall-mobile.png` | rework | 生成图未呈现六个可独立定位实体门，不替代已通过交互的 S02 研究图。 |
| [scenes/town/desktop-candidate-v1.png](../art-sources/scenes/town/desktop-candidate-v1.png) | `art-sources/scenes-r12-51/street-desktop.png` | review | 两份独立横版候选，择优后归档另一份；不是手机独立绘景。 |
| [scenes/town/desktop-candidate-v2.png](../art-sources/scenes/town/desktop-candidate-v2.png) | `art-sources/scenes-r12-51/street-desktop-v2.png` | review | 两份独立横版候选，择优后归档另一份；不是手机独立绘景。 |
| [scenes/workshop/desktop-candidate-v1.png](../art-sources/scenes/workshop/desktop-candidate-v1.png) | `art-sources/scenes-r12-51/workshop-desktop.png` | review | 两份独立横版候选，择优后归档另一份；不是手机独立绘景。 |
| [scenes/workshop/desktop-candidate-v2.png](../art-sources/scenes/workshop/desktop-candidate-v2.png) | `art-sources/scenes-r12-51/workshop-desktop-v2.png` | review | 两份独立横版候选，择优后归档另一份；不是手机独立绘景。 |

## 4. 清理、暂留与未完成

33 张新增原画均为不同 Git blob，不能按同名或颜色相近判断为完全重复。统一迁移 95,339,428 B，不删除独一份的新原图。两个工坊横版、两个月光街横版均先保留，待实机评选后归档；两个有身份偏差的侧脸、两张有烘焙文字的 CG、两张未证明六门的公寓绘景不作为生产源。保留原有可交互六门审稿链。工坊/街区独立手机版仍缺；委托所、仓库现有研究稿尚未正式晋级。

本轮删除三张明确位于 AI Studio 临时媒体目录的完全重复 PNG。其原件留在 public/assets/aistudio；旧 implementation_plan 引用保留的参考图名，元数据不引用临时路径。代码搜索未检出这些临时名，但搜索非穷尽；本轮只清理临时副本。旧 Git 提交仍可恢复。另一个相同 blob 的月纱会客室图分别用于文档证据和审稿入口，两条路径暂留。未删除旧正式头像、CG 候选、V2/V3 回退、SVG 房间概念、Pixi 设备或签审证据。

| 删除的临时路径 | 保留原件 | Git blob SHA | 字节 |
| --- | --- | --- | ---: |
| `.aistudio/artifacts/brain/4a79cd63-2b40-45d8-a7f0-401c555007ec/.tempmediaStorage/media_1793152370274_7b85c6fa.png` | `public/assets/aistudio/image_6273408e.png` | `ea8234301ea325a4af5b4ede7ac0d13a711931aa` | 3279821 |
| `.aistudio/artifacts/brain/4a79cd63-2b40-45d8-a7f0-401c555007ec/.tempmediaStorage/media_1793195841168_be04d1c7.png` | `public/assets/aistudio/image_26a43a92.png` | `6c8131dd6719de4cbc5421e9d494900eafdae7c0` | 3154947 |
| `.aistudio/artifacts/brain/4a79cd63-2b40-45d8-a7f0-401c555007ec/.tempmediaStorage/media_1793268762352_c05e189b.png` | `public/assets/aistudio/Gothic_Moonlit_Summoning_Screen_8181b3a5.png` | `3be0ecd75dd6b4ab30c674e21f2a1aaa59d96c16` | 2726560 |

清理 9,161,328 B 的工作树副本；不代表 Git 历史或线上包同等缩小。另组重复：`docs/art-reviews/sources/winechan-gothic-manor-full-pack/candidate-05.webp` / `public/art/room-review/yuesha-salon-candidate.webp`，待将审稿和文档引用统一后再判断去重。

### 4.1 R12.95 · public/art 用途清退（2026-11-25）

基线 [87a3702](https://github.com/kunlong-luo/monster-apartment/commit/87a37023dcc5161696aab9fe006749f3a5a04bb4) 的 56 个媒体已经完成本轮迁退：现有 43 个公开媒体（14008511 B）、9 JSON、2 Markdown。下表为当前工作树公开资源，合计 43 张；第 5 节为唯一逐文件库存。正常运行及必要回退 36 张、显式交互研究 7 张。审批不变。

| 路径 / 精确范围 | 数量 | 处置 | 实际职责或验收限制 |
| --- | ---: | --- | --- |
| `decorations/{foreground-ornaments,moonlight-tracery,rose-petal}.svg` | 3 | 保留 | 图鉴场景、粒子动态 URL |
| `beauty-beasts/characters/{brook,fern,cinder}/face.webp` | 3 | 保留 | 当前人物头像注册 |
| `beauty-beasts/characters/yuesha/cg-{eclipse,vow}-candidate.webp`、`beauty-beasts/characters/fern/cg-spring-candidate.webp` | 3 | 保留 | 正常召唤/鉴赏候选画，不是已审批 CG |
| `beauty-beasts/cover/world-cover.webp`、`world-cover-mobile.webp` | 2 | 保留 | 欢迎页双端，PC 图也用于大厅回退 |
| `postcards/{gothic-workshop,moonlit-street}.webp` | 2 | 保留 | 大厅地点入口 |
| `lobby-hero-v4.webp`、`lobby-hero-v4-mobile.webp` | 2 | 保留 | 正常大厅双端、欢迎页回退 |
| `lobby-hero-v3.webp` | 1 | 保留 | 公寓/世界背景与 Pixi 回退 |
| `yuesha-{avatar,bust,portrait}-v3.webp` | 3 | 保留 | 当前角色注册与对话/剧情 |
| `rooms/{yuesha,brook,fern,cinder}/concept-scene.svg` | 4 | 保留 | 正常故事概念背景与观景故障回退 |
| `rooms/{yuesha,brook,fern,cinder}/review/{background-candidate,standing-candidate}.webp` | 8 | 保留 | 四房正常观景；泉泡、炽角站姿也为候选卡；不能按 review 名称删除 |
| `world-scenes/{town-moonlit-gate,workshop-gothic-hall}.webp` | 2 | 保留 | 月光街手机/回退、Pixi 与图鉴背景 |
| `world-scenes/town/review/desktop-candidate-v2.webp`、`world-scenes/workshop/review/desktop-candidate-v1.webp` | 2 | 保留 | 正常 PC 过渡绘景，后续单独迁移稳定运行路径 |
| `lobby-hero-v2.webp` | 1 | 必要回退 | `engine/scripts/build.mjs` 复制，`engine/src/workshop-painted-art.ts` 加载链；不可直接删 |
| `room-review/yuesha-salon-candidate.webp` | 1 | 显式审稿保留 | room-art-local-preview 动态调用；与 docs 证据重复已有授权例外 |
| `world-scenes/review/2026-11-22/` 三张及 `2026-11-23/` 三张 WebP | 6 | 显式审稿保留 | S02/S05/S06 双端互动研究，现行哈希/热点仍引用 |

**实际迁出 10 张（5498826 B，Git blob 不变）**：统一移到既有 [docs/art-reviews/sources/](art-reviews/sources/)，不再发布纯离线研究输出；文件名加稳定人物/地点 ID。保留全部原画与研究 SHA-256。

- [brook-cg-tide-pose-study-v1.webp](art-reviews/sources/brook-cg-tide-pose-study-v1.webp)
- [brook-cg-tide-pose-study-v2.webp](art-reviews/sources/brook-cg-tide-pose-study-v2.webp)
- [cinder-cg-ember-pose-study-v1.webp](art-reviews/sources/cinder-cg-ember-pose-study-v1.webp)
- [fern-cg-spring-bow-v1.webp](art-reviews/sources/fern-cg-spring-bow-v1.webp)
- [fern-cg-spring-pose-study-v1.webp](art-reviews/sources/fern-cg-spring-pose-study-v1.webp)
- [town-desktop-candidate-v1.webp](art-reviews/sources/town-desktop-candidate-v1.webp)
- [workshop-desktop-candidate-v2.webp](art-reviews/sources/workshop-desktop-candidate-v2.webp)
- [yuesha-cg-eclipse-pose-study-v1.webp](art-reviews/sources/yuesha-cg-eclipse-pose-study-v1.webp)
- [yuesha-cg-eclipse-pose-study-v2.webp](art-reviews/sources/yuesha-cg-eclipse-pose-study-v2.webp)
- [yuesha-cg-vow-pose-study-v1.webp](art-reviews/sources/yuesha-cg-vow-pose-study-v1.webp)

**实际删除 3 张（257428 B）**： [月纱旧 face](https://github.com/kunlong-luo/monster-apartment/blob/87a37023dcc5161696aab9fe006749f3a5a04bb4/public/art/beauty-beasts/characters/yuesha/face.webp)、[旧半身像](https://github.com/kunlong-luo/monster-apartment/blob/87a37023dcc5161696aab9fe006749f3a5a04bb4/public/art/yuesha-bust-v2.webp)、[旧肖像](https://github.com/kunlong-luo/monster-apartment/blob/87a37023dcc5161696aab9fe006749f3a5a04bb4/public/art/yuesha-portrait-v2.webp)。历史仅通过固定 Git 提交追溯，不另建归档副本。扫描 351 个 app/src/engine/scripts/tests/e2e/workflow/public JSON 与代码文件、19 个 docs/art-sources JSON/CSV、185 个 Markdown 的相关名称；旧 face 的历史清单和排除断言保留。研究镜头表、R12-09 ledger、R12-61 输出清单、审核脚本与文档图片链接同步；保持尺寸、哈希及 production 约束。静态文字扫描不是全部动态或外部 URL 的证明，新 SHA 仍需 Quality 验证。公开媒体减少 5756254 B（非页面实际下载量），全仓媒体仅减少 257428 B。

S02 路径纠偏：实际目录 [art-sources/scenes/apartment/](../art-sources/scenes/apartment/) 仅含 `desktop-candidate.png` 与 `mobile-candidate.png`；新 `desktop-candidate-v2.png` 仍未入库。下一批单独核验正常运行的 review 路径、根目录旧版本名、交互研究重复图和三张 public/assets 历史参考；不将本轮写成已完成全部路径重构。

## 5. 全仓实际资源菜单（R12.97）

R12.96 路径迁移后完整 Git tree：141 路径、156439517 B。R12.94 基线 144，R12.95 迁移十张原字节、删除三个旧头像。范围 PNG/WebP/JPEG/AVIF/GIF/SVG/OGG/MP3/WAV/WOFF2，不计 JSON/Markdown。Git blob SHA 不等于原文件 SHA-256；此表不授予生产状态。

### 源图与研究（40）

| 路径 | 字节 | Git blob SHA 前 12 位 |
| --- | ---: | --- |
| `art-sources/characters/brook/cg/tide.png` | 3081979 | `aede1a30063d` |
| `art-sources/characters/brook/identity/front.png` | 2604397 | `0768b615cdde` |
| `art-sources/characters/brook/identity/three-quarter-candidate.png` | 2497845 | `ebede98fb2ce` |
| `art-sources/characters/brook/sprites/standing.png` | 2734487 | `79f9147cd5f1` |
| `art-sources/characters/cinder/cg/ember.png` | 2927246 | `0fdca72efc02` |
| `art-sources/characters/cinder/identity/front.png` | 2514530 | `30f289982eea` |
| `art-sources/characters/cinder/identity/three-quarter-candidate.png` | 2731098 | `f71ae79833a8` |
| `art-sources/characters/cinder/sprites/standing.png` | 2515747 | `92c444aceefc` |
| `art-sources/characters/fern/cg/spring.png` | 3439227 | `a22fe13fc608` |
| `art-sources/characters/fern/identity/front.png` | 2571925 | `7a11d2138f40` |
| `art-sources/characters/fern/identity/three-quarter-candidate.png` | 2735582 | `899188f5fd82` |
| `art-sources/characters/fern/sprites/standing.png` | 2273378 | `6c426fee975d` |
| `art-sources/characters/yuesha/cg/eclipse.png` | 2819782 | `da3a5abbe41d` |
| `art-sources/characters/yuesha/cg/vow.png` | 3060944 | `bea2589a7758` |
| `art-sources/characters/yuesha/identity/front.png` | 2380118 | `164d04d757d2` |
| `art-sources/characters/yuesha/identity/three-quarter-candidate.png` | 2797254 | `71aff0e7a223` |
| `art-sources/characters/yuesha/sprites/standing.png` | 2778407 | `7ba8a5e6733f` |
| `art-sources/covers/welcome-desktop.png` | 3148637 | `25805603c0f7` |
| `art-sources/covers/welcome-mobile.png` | 2956299 | `a83934afbb7b` |
| `art-sources/review/2026-11-22/fern-spring-bow-v1.png` | 2887711 | `2309293fe10f` |
| `art-sources/review/2026-11-22/orders-desktop-v1.png` | 2547230 | `4f5968cc72af` |
| `art-sources/review/2026-11-22/orders-mobile-v1.png` | 2840585 | `0c1bf9901e49` |
| `art-sources/review/2026-11-22/warehouse-desktop-v1.png` | 2832702 | `fe8be9159795` |
| `art-sources/review/2026-11-23/apartment-six-door-desktop-v1.png` | 3071336 | `6179f84f7608` |
| `art-sources/review/2026-11-23/apartment-six-door-mobile-v1.png` | 2964735 | `9c4ce57a367c` |
| `art-sources/review/2026-11-23/warehouse-mobile-v1.png` | 2889158 | `b6ccb601c29e` |
| `art-sources/rooms/brook/background.png` | 3353183 | `94e8550029b4` |
| `art-sources/rooms/cinder/background.png` | 3115964 | `6e0766044bfd` |
| `art-sources/rooms/fern/background.png` | 3443214 | `949343304a94` |
| `art-sources/rooms/fern/bedroom-candidate.png` | 3313487 | `2bcb5bfc8aeb` |
| `art-sources/rooms/yuesha/background.png` | 2920537 | `f4ce90386009` |
| `art-sources/rooms/yuesha/bedroom-candidate.png` | 2806135 | `3f7b37412d61` |
| `art-sources/scenes/apartment/desktop-candidate.png` | 2969990 | `6e9d6dc207b6` |
| `art-sources/scenes/apartment/mobile-candidate.png` | 3008274 | `b80b4fea7546` |
| `art-sources/scenes/lobby/desktop.png` | 2588990 | `6a5303795e97` |
| `art-sources/scenes/lobby/mobile.png` | 2501685 | `16cfdfe2735f` |
| `art-sources/scenes/town/desktop-candidate-v1.png` | 3265423 | `404ea9b9f32d` |
| `art-sources/scenes/town/desktop-candidate-v2.png` | 3248661 | `93a5acd7b7ee` |
| `art-sources/scenes/workshop/desktop-candidate-v1.png` | 3131454 | `813a14b8972d` |
| `art-sources/scenes/workshop/desktop-candidate-v2.png` | 3103549 | `454501ad0087` |

### Web 静态资源（47）

| 路径 | 字节 | Git blob SHA 前 12 位 |
| --- | ---: | --- |
| `public/art/decorations/foreground-ornaments.svg` | 2876 | `fbf4a3c67d88` |
| `public/art/decorations/moonlight-tracery.svg` | 4827 | `c5f2af6e18e6` |
| `public/art/decorations/rose-petal.svg` | 986 | `09f65722ff16` |
| `public/art/beauty-beasts/characters/brook/face.webp` | 92138 | `7a6a0e8b1fb5` |
| `public/art/beauty-beasts/characters/cinder/face.webp` | 83042 | `a36fe1b83f19` |
| `public/art/beauty-beasts/characters/fern/cg-spring-candidate.webp` | 601544 | `9235f2243085` |
| `public/art/beauty-beasts/characters/fern/face.webp` | 75438 | `ef097d0fc27a` |
| `public/art/beauty-beasts/characters/yuesha/cg-eclipse-candidate.webp` | 418170 | `8350e7fd568c` |
| `public/art/beauty-beasts/characters/yuesha/cg-vow-candidate.webp` | 494826 | `7e60bcd337ba` |
| `public/art/beauty-beasts/cover/world-cover-mobile.webp` | 489132 | `edb65eec7fe0` |
| `public/art/beauty-beasts/cover/world-cover.webp` | 526046 | `17c30be4f413` |
| `public/art/postcards/gothic-workshop.webp` | 59254 | `34c4b7fdc29d` |
| `public/art/postcards/moonlit-street.webp` | 34350 | `e7b5404a42ca` |
| `public/art/lobby-hero-v2.webp` | 209336 | `2541cfaeaf7b` |
| `public/art/lobby-hero-v3.webp` | 435400 | `2b10407ea824` |
| `public/art/lobby-hero-v4-mobile.webp` | 344590 | `72307e846c10` |
| `public/art/lobby-hero-v4.webp` | 353842 | `555069296ce8` |
| `public/art/room-review/yuesha-salon-candidate.webp` | 155188 | `3e384235b220` |
| `public/art/rooms/brook/concept-scene.svg` | 9598 | `d2adfb278f67` |
| `public/art/rooms/brook/review/background-candidate.webp` | 621298 | `53d8af7b95dd` |
| `public/art/rooms/brook/review/standing-candidate.webp` | 821724 | `f6b7d13dcdff` |
| `public/art/rooms/cinder/concept-scene.svg` | 12259 | `99fa591dd43a` |
| `public/art/rooms/cinder/review/background-candidate.webp` | 571828 | `fc4ff05e5908` |
| `public/art/rooms/cinder/review/standing-candidate.webp` | 593462 | `867fb42c5d26` |
| `public/art/rooms/fern/concept-scene.svg` | 24221 | `5bb774279f3d` |
| `public/art/rooms/fern/review/background-candidate.webp` | 648462 | `b2d8ade7f8bd` |
| `public/art/rooms/fern/review/standing-candidate.webp` | 585116 | `287ae3c81b86` |
| `public/art/rooms/yuesha/concept-scene.svg` | 21566 | `9b4729638861` |
| `public/art/rooms/yuesha/review/background-candidate.webp` | 479202 | `589f25b5191b` |
| `public/art/rooms/yuesha/review/standing-candidate.webp` | 664030 | `419852a5868b` |
| `public/art/world-scenes/review/2026-11-22/orders-desktop-v1.webp` | 382216 | `61122e427bcd` |
| `public/art/world-scenes/review/2026-11-22/orders-mobile-v1.webp` | 463436 | `d21372731b9a` |
| `public/art/world-scenes/review/2026-11-22/warehouse-desktop-v1.webp` | 387164 | `2c823339e8b3` |
| `public/art/world-scenes/review/2026-11-23/apartment-six-door-desktop-v1.webp` | 479930 | `122c8143fb2c` |
| `public/art/world-scenes/review/2026-11-23/apartment-six-door-mobile-v1.webp` | 423086 | `931970f6dfb9` |
| `public/art/world-scenes/review/2026-11-23/warehouse-mobile-v1.webp` | 419522 | `3e5173ddb694` |
| `public/art/world-scenes/town-moonlit-gate.webp` | 120894 | `c422f2cdf82c` |
| `public/art/world-scenes/town/review/desktop-candidate-v2.webp` | 636018 | `f6da756b2007` |
| `public/art/world-scenes/workshop-gothic-hall.webp` | 180542 | `2e21a83315dd` |
| `public/art/world-scenes/workshop/review/desktop-candidate-v1.webp` | 599408 | `50511005b937` |
| `public/art/yuesha-avatar-v3.webp` | 70710 | `fa60ea5d52da` |
| `public/art/yuesha-bust-v3.webp` | 151936 | `ba77c88612de` |
| `public/art/yuesha-portrait-v3.webp` | 259898 | `3cfe23285826` |
| `public/assets/aistudio/Gothic_Moonlit_Summoning_Screen_8181b3a5.png` | 2726560 | `3be0ecd75dd6` |
| `public/assets/aistudio/image_26a43a92.png` | 3154947 | `6c8131dd6719` |
| `public/assets/aistudio/image_6273408e.png` | 3279821 | `ea8234301ea3` |
| `public/lobby-hero.webp` | 157466 | `a9210c774121` |

### Pixi sidecar（15）

| 路径 | 字节 | Git blob SHA 前 12 位 |
| --- | ---: | --- |
| `engine/art/garden-art-review.avif` | 4204 | `3462d8667303` |
| `engine/art/kiln-art-review.avif` | 4402 | `9132761e794d` |
| `engine/art/moon-workshop.avif` | 2995 | `9e79c2bbe640` |
| `engine/art/moonstone-floor.avif` | 822 | `bcfe239de2b4` |
| `engine/art/moonveil-portrait.avif` | 2938 | `2437231dfdb2` |
| `engine/art/production/machines/garden/lv1.webp` | 36472 | `93e7f1524b65` |
| `engine/art/production/machines/garden/lv2.webp` | 36586 | `3878ae053cd3` |
| `engine/art/production/machines/garden/lv3.webp` | 31590 | `b0e49d26f2bb` |
| `engine/art/production/machines/kiln/lv1.webp` | 29524 | `a2fa549ba4df` |
| `engine/art/production/machines/kiln/lv2.webp` | 30950 | `2664ca2a0ac8` |
| `engine/art/production/machines/kiln/lv3.webp` | 29240 | `6200ac9acd60` |
| `engine/art/production/machines/well/lv1.webp` | 30520 | `5c705000500a` |
| `engine/art/production/machines/well/lv2.webp` | 34550 | `51fcab87365a` |
| `engine/art/production/machines/well/lv3.webp` | 33168 | `d64e7248dac2` |
| `engine/art/well-art-review.avif` | 2817 | `b0159e630ab7` |

### 文档审核证据（39）

| 路径 | 字节 | Git blob SHA 前 12 位 |
| --- | ---: | --- |
| `docs/art-reviews/R12-09-ART-CONTACT-SHEET-REVIEW-ONLY.jpg` | 426045 | `da82adeccbac` |
| `docs/art-reviews/R12-14-S02-mobile-crop-preview.jpg` | 192401 | `fd9cc617f548` |
| `docs/art-reviews/pose-differentiation-2026-11-21.webp` | 428690 | `1598822d80ed` |
| `docs/art-reviews/pose-differentiation-five-cards-2026-11-22.webp` | 487286 | `4a481fe4e35a` |
| `docs/art-reviews/pose-differentiation-five-cards-brook-v2-2026-11-22.webp` | 432064 | `0939f6ddbec2` |
| `docs/art-reviews/sources/brook-cg-tide-pose-study-v1.webp` | 514656 | `ae627af84c91` |
| `docs/art-reviews/sources/brook-cg-tide-pose-study-v2.webp` | 563050 | `8a9f98b31eab` |
| `docs/art-reviews/sources/cinder-cg-ember-pose-study-v1.webp` | 591622 | `b12408260d7d` |
| `docs/art-reviews/sources/fern-cg-spring-bow-v1.webp` | 505954 | `ace0a5dcb21d` |
| `docs/art-reviews/sources/fern-cg-spring-pose-study-v1.webp` | 581470 | `e18df48957c0` |
| `docs/art-reviews/sources/town-desktop-candidate-v1.webp` | 629238 | `55daae532263` |
| `docs/art-reviews/sources/winechan-gothic-manor-full-pack/candidate-01.webp` | 157098 | `89b11fd01b68` |
| `docs/art-reviews/sources/winechan-gothic-manor-full-pack/candidate-02.webp` | 109326 | `a6f124ce0022` |
| `docs/art-reviews/sources/winechan-gothic-manor-full-pack/candidate-03.webp` | 135414 | `e587690236ce` |
| `docs/art-reviews/sources/winechan-gothic-manor-full-pack/candidate-04.webp` | 107348 | `5309f4341bb1` |
| `docs/art-reviews/sources/winechan-gothic-manor-full-pack/candidate-05.webp` | 155188 | `3e384235b220` |
| `docs/art-reviews/sources/winechan-gothic-manor-full-pack/candidate-06.webp` | 115722 | `425ebb53495b` |
| `docs/art-reviews/sources/winechan-gothic-manor-full-pack/candidate-07.webp` | 149518 | `862980b80b49` |
| `docs/art-reviews/sources/winechan-gothic-manor-full-pack/candidate-08.webp` | 180452 | `62a91efd77e7` |
| `docs/art-reviews/sources/winechan-gothic-manor-full-pack/full-index-01.webp` | 108752 | `746be238d19c` |
| `docs/art-reviews/sources/winechan-gothic-manor-full-pack/full-index-02.webp` | 109058 | `7c6f69829e88` |
| `docs/art-reviews/sources/winechan-gothic-manor-full-pack/full-index-03.webp` | 117502 | `10a6eb746136` |
| `docs/art-reviews/sources/winechan-gothic-manor-full-pack/full-index-04.webp` | 107732 | `43497ed2772b` |
| `docs/art-reviews/sources/winechan-gothic-manor-full-pack/full-index-05.webp` | 52246 | `c17a96fa1d0b` |
| `docs/art-reviews/sources/winechan-gothic-manor-full-pack/review-contact-sheet.webp` | 83548 | `a1c29cd41fb5` |
| `docs/art-reviews/sources/winechan-gothic-manor/publisher-preview-01.png` | 2714329 | `2c1dd75d1ed5` |
| `docs/art-reviews/sources/winechan-gothic-manor/publisher-preview-01.review.webp` | 78126 | `72e6dd77501d` |
| `docs/art-reviews/sources/winechan-gothic-manor/publisher-preview-02.png` | 2384795 | `c6a20afaaf63` |
| `docs/art-reviews/sources/winechan-gothic-manor/publisher-preview-02.review.webp` | 63028 | `ba7412d68fd1` |
| `docs/art-reviews/sources/winechan-gothic-manor/publisher-preview-03.png` | 1905558 | `c79fbe8db9e4` |
| `docs/art-reviews/sources/winechan-gothic-manor/publisher-preview-03.review.webp` | 46562 | `dc3539afbb03` |
| `docs/art-reviews/sources/winechan-vampire-living-room/publisher-preview-01.jpg` | 672316 | `eb84de1980be` |
| `docs/art-reviews/sources/winechan-vampire-living-room/publisher-preview-01.review.webp` | 52004 | `11ecd755ddd0` |
| `docs/art-reviews/sources/workshop-desktop-candidate-v2.webp` | 598416 | `5660e04024a0` |
| `docs/art-reviews/sources/yuesha-cg-eclipse-pose-study-v1.webp` | 526334 | `ee4d7faa8f82` |
| `docs/art-reviews/sources/yuesha-cg-eclipse-pose-study-v2.webp` | 513912 | `ca6fd2886d12` |
| `docs/art-reviews/sources/yuesha-cg-vow-pose-study-v1.webp` | 474174 | `22dd33b5b579` |
| `docs/art-reviews/yuesha-eclipse-pose-v1-v2-qa-2026-11-22.webp` | 353470 | `1c9efc2783a8` |
| `docs/design/2026-10-29-gothic-red-gold/layout-map.svg` | 4145 | `7d4a9dbecabe` |

## 6. 正式替换顺序与验收

1. 首先读取真实原画尺寸、解码、alpha、SHA-256，确定四位一致的新身份；月纱新黑发不能与现行银发不加区分混用。
2. CG 去除烘焙文字并完成同人审核，导出 WebP、更新 CG manifest/注册表；同步欢迎、首页及图鉴。不要在未批准时将 status 标为 production。
3. 私室背景与透明人物分层接入，重测物件热点；工坊、月光街横版择优，手机需独立构图；公寓优先保留真实六门研究并重制足够清晰的六门原画。
4. 实际页面截图、Quality 和 Pages 按最终 SHA 回读。迁移原画不等于正式玩家已看到新图。

今后新增素材先更新源图目录与机器清单；正式资源状态仍由相应生产 manifest 管理。所有清理保留替代关系和证据。

## R12.53 候选接入

候选分支通过脚本生成 15 份 WebP，并保留原始 PNG；实际输出、源/输出 SHA-256、裁切、原生像素及旧 blob 见 public/art/r12-53-transition-manifest.json（转换完成后生成）。当前主线尚未启用。参见 [R12.53](art-reviews/R12-53-CHARACTER-AND-COVER-TRANSITION-2026-11-24.md)。

## R12.54 实际输出回读

R12.53 候选已真实生成 15 WebP（5,376,498 B），原图与输出的机器可读 [转换清单](../public/art/r12-53-transition-manifest.json) 已存在。原 33 源图完整保留，候选输出不等同正式 CG 或已上线。旧目录统计是 R12.52 清理快照；候选新增 2 个大厅 WebP 路径，其余为稳定槽位替换。见 [R12.54 验收记录](art-reviews/R12-54-TRANSITION-ASSET-VERIFICATION-2026-11-24.md)。

## R12.55 现行引用与历史清单

旧 [2026-10-30 资源清单](design/2026-10-30-beauty-beasts/asset-manifest.json) 的六个现行封面/头像槽与 R12.53 实际转换清单同步，旧六条记录保存在 historicalProductionAssets。月纱现用 yuesha-avatar-v3.webp（候选分支新内容），而不是退役 yuesha/face.webp。资源完整性与 V4 横竖图检查继续保留。见 [R12.55](art-reviews/R12-55-TRANSITION-MANIFEST-RECONCILIATION-2026-11-24.md)，尚未合并。

## R12.58 发布回归

R12.55 Quality 320/320、桌面视觉与像素检查通过；完整玩法 186 通过/1 失败/3 跳过。旧大厅断言与 V4 实际原画不匹配，已同步精确尺寸、实际 URL 和手机居中构图，并前移至视觉作业，详见 [R12.58](art-reviews/R12-58-LOBBY-BROWSER-REGRESSION-2026-11-24.md)。未改变实际游戏图像与生产批准状态。

## R12.60 玩家可见的房间观景资源

V3.103.0 已成功部署（main 39138900，Pages 45367299176）；R12.57 八张真实房间图由原候选分支原 blob 迁入本候选，未重新编码。每个 `public/art/rooms/<id>/review/` 下 background-candidate.webp 与 standing-candidate.webp 仅在玩家观景或显式审稿使用；`r12-57-review-manifest.json` 是原始转换证据，生产房间 manifest 不变。现有概念剧情背景仍用于真实物件调查；正式 CG 0/5。见 [R12.60](design/R12-60-PLAYER-ROOM-SCENIC-MODE-2026-11-24.md)。

## R12.62 房间发布回归

PR #56 首轮构建因观景按钮字符串未闭合失败；已修复并保留全部验收，八图字节不变。详见 [R12.62](https://github.com/kunlong-luo/monster-apartment/blob/80eb69abb56c8a0a398e53ff27cdf513e76b695e/docs/design/R12-62-ROOM-SCENIC-BUILD-FIX-2026-11-24.md)。

## R12.61 工坊和月光街候选

4 张已入库横版原图按原生尺寸转换至 `public/art/world-scenes/{workshop,town}/review/`；机器证据由实际转换生成。没有独立手机稿，生产场景不变。详见 [R12.61](art-reviews/R12-61-WORKSHOP-TOWN-SOURCE-INTAKE-2026-11-24.md)。

## R12.62 工坊与街区实际输出

[转换作业](https://github.com/kunlong-luo/monster-apartment/actions/runs/45368254427) 已成功，四张 WebP 已在 5588ee89 实际入库（2,463,080 B）。PC 全景选工坊 V1，PC 月光街选 V2，直接复用 review 文件，不制造第二份重复 WebP。原机器、Pixi 精密建造和手机旧画仍保留。见 [R12.62](art-reviews/R12-62-WORLD-PC-TRANSITION-2026-11-24.md)。候选未合并，正式场景 manifest 不变。

## R12.64 主线同步

V3.104.0 私室观景 PR #56 已合并 main `d36b5aee`；同一候选 Quality、Desktop Visual Review、像素证据全部通过，完整玩法与新主线 Pages 尚待确认。世界场景 PR #57 基于此 main 整合，保持八个房间层与四张世界 WebP 原 blob 不变，两个完整性审计均保留。新候选 V3.105.0；不提前标为上线。见 [R12.64](engineering/R12-64-ROOM-RELEASE-WORLD-INTEGRATION-2026-11-24.md)。


## R12.67 重复路径核查（不自动删除）

V3.105.0 的 PC 新场景与四间观景已合并、Quality/Pages 通过；不改变原画生产批准状态。历史候选状态不覆盖当前版本。

| 重复路径 A | 重复路径 B | 字节 | 当前处置 |
| --- | --- | ---: | --- |
| `docs/art-reviews/sources/winechan-gothic-manor-full-pack/candidate-05.webp` | `public/art/room-review/yuesha-salon-candidate.webp` | 155188 | 来源证据/运行审稿，先核对授权与引用 |
| `public/art/beauty-beasts/characters/brook/cg-tide-candidate.webp` | `public/art/rooms/brook/review/standing-candidate.webp` | 821724 | 两份 manifest 独立角色槽，核对原图与转换，禁止直接删 |
| `public/art/beauty-beasts/characters/cinder/cg-ember-candidate.webp` | `public/art/rooms/cinder/review/standing-candidate.webp` | 593462 | 同上 |

重复路径潜在工作树空间 1,570,374 B；本轮未删除媒体。相同输出不证明原始来源、人物用途或授权一致。CG manifest 的 previewPath 和 R12.57 房间 manifest 的 output 分属独立审核契约；先检查实际原图及生成脚本、动态 URL、生产/回退、文档链接、测试再确定唯一引用。不可用简单文本搜索零命中判定无用。


## R12.70 · 同源站姿输出统一

泉泡、炽角的 R12.53 CG 过渡候选与 R12.57 站姿原图、source SHA-256、源 Git blob、输出 SHA-256、字节数均相同。现行 CG manifest/运行注册/转换清单/准入检查统一指向房间 review 下的 standing-candidate.webp；R12.53 生成脚本本身按 manifest.previewPath 输出，上传清单补齐共享路径。删除两个旧 CG 候选副本，保留原始 PNG、原候选旧路径/旧 blob 记录、其他五卡验证和独立 production CG 槽。实际工作树减少 1,415,186 B，不宣称 Git 历史同等缩小。历史报告中的原路径属于当时快照，可按 8f85a130 回读。

| 退役路径 | 唯一运行时路径 | 保留 Git blob |
| --- | --- | --- |
| `public/art/beauty-beasts/characters/brook/cg-tide-candidate.webp` | `public/art/rooms/brook/review/standing-candidate.webp` | `f6b7d13dcdffc8607b1f9e8ac6fd38518de46e97` |
| `public/art/beauty-beasts/characters/cinder/cg-ember-candidate.webp` | `public/art/rooms/cinder/review/standing-candidate.webp` | `867fb42c5d268eaa0f00001dcaec858b32ecb019` |

月纱会客室的来源证据与运行时审稿副本仍保留（155,188 B）；不能在未核对证据清单和授权链前删除。原图和批准状态均不改变，正式 CG 0/5。R12.70 Quality 三作业成功、321/321；浏览器与 Pages 另验。


## R12.71 · 防止重复资源回流

已查 [WineChan intake](art-reviews/sources/winechan-gothic-manor-full-pack/intake.json)，candidate-05.webp 对应 publisher ZIP 中 IMG_0268.png（1920×1080；humanReviewed=false；原图 SHA-256 33cb3f2658314e51f54de16b11bf74381ae522c39e8a8857d327117f26ac3d31）。保留文档证据和运行审稿的两条路径，不扩大许可或批准结论。新增 `pnpm audit:media-duplicates`：以 Git 跟踪媒体真实字节的 SHA-256 分组，唯一允许重复组必须匹配两个确切路径、155188 字节和 Git blob 3e384235b220f3e60502492cdd5fa850e6d43547；增加第三份或改动重复字节均阻断 Quality。当前仍为 144 媒体路径，不声称进一步删除。R12.71 [实际 Quality 日志](https://github.com/kunlong-luo/monster-apartment/actions/runs/45375389700/job/138380152391) 证实 144 个路径、唯一登记例外、0 组意外重复，测试通过。


## R12.72-C · S05/S06 显式研究预览

四份已登记独立 WebP 直接复用，PC 1672×941、手机 941×1672，完整路径见第 5 节及 R12-09 ledger。玩家从委托/仓库的场景预览入口进入现有研究模式，仍需显式选择仓库图，正常页面不请求研究图片。生产 manifest 0/3、原始 PNG/哈希与 144 媒体路径不变；不将未达原生门槛的研究图晋级。

## R12.74 · 历史索引归并

根 artwork 只有 2026-10-29 外部原画归档的 JSON 索引及说明，未包含原图。本轮将 JSON 原字节迁入 [legacy-2026-10-29-catalog.json](art-reviews/legacy-2026-10-29-catalog.json)，其中 `artwork/` 路径为历史归档内部路径，不是本仓库实际运行路径。旧说明见 [固定历史快照](https://github.com/kunlong-luo/monster-apartment/tree/782fc74fd6e597048a293cbf9777593447c76bb3/artwork)。实际源图仍由 art-sources/source-catalog.json 管理，运行 WebP 仍由 public 及对应 manifest 管理；144 个媒体路径不变。


R12.75：设备制作与锚点规范统一见 [WORKSHOP-ASSET-SPEC.md](design/WORKSHOP-ASSET-SPEC.md)。此次只迁移文档，不移动 144 个媒体路径及任何原始 PNG，不修改设备和场景审批状态。


R12.76：原 `v2/art/` 迁入 `engine/art/`，全部 16 个跟踪文件（含 manifest）路径变更但 Git blob 不变；目录表使用新路径。历史审批和源 PNG 不变。

## R12.90 · 资源目录与字节自动对账

基线 `be66775` 的完整 Git 树与第 5 节 144 条记录逐项匹配，缺失、额外、大小或 blob 前缀不一致均为 0；33 条新批源图清单的完整 Git blob 与字节也均一致。唯一相同 blob 仍是 R12.71 登记例外。以下为跟踪文件工作树字节合计，不等于下载流量、Git 历史体积或图片解码内存。

| 目录归属 | 媒体路径 | 字节 |
| --- | ---: | ---: |
| art-sources | 40 | 115372885 |
| docs | 29 | 11929723 |
| engine/art | 15 | 310778 |
| public/art | 56 | 19764765 |
| public/assets | 3 | 9161328 |
| public 其他 | 1 | 157466 |
| 合计 | 144 | 156696945 |

现有 `pnpm audit:media-duplicates` 增加第 5 节完整清单与实际文件字节对账及分目录统计；沿用原 Quality 步骤及现有测试入口，不另建库存文件或新依赖。三份 `public/assets/aistudio/` 历史设计参考 PNG 共 9161328 B，仍需核对实际 UI、测试、文档和动态引用后才能迁出 public；不按文件名推断无人使用。原始 PNG、研究稿、过渡和正式资源状态均不改变。此次未解码新图、未做全量动态引用审计或实际搬迁；新提交 CI 结果独立核查。

## R12.93 · 待入库新绘景（不计入实际库存）

R12.93 第一批（2026-11-25）实际生成 S02 六门中庭 PC 独立候选 v2，聊天原始 PNG 实测 1672×941 RGB、2528106 B、SHA-256 `c59fcb3fcf96faa0eb23a3051015090592c104412b8a049cfd0303287c0d384e`、本地计算 Git blob `bcb3d211792cce3613aa16e5d0475f0134b69639`（非已写入远端证明）。拟入库稳定路径 `art-sources/scenes/apartment/desktop-candidate-v2.png`，暂未传入 GitHub；本会话生成 PNG 可读，但当前连接的 Git blob 写入只接受 base64 文本，没有可用的大文件二进制直传桥接。禁止将拟定路径写成实际可用资源，禁止把未入库文件加入第 5 节库存或 manifest。原生尺寸低于 S02 ≥3296×1856 和目标 3840×2160，不执行插值超分晋级；手机独立原画尚未生成。现有两份已入仓六门研究图、六房索引、生产 review 状态、存档和 V3.109.0 均不变。

实际库存仍 144 路径；只有真实 Git blob 入库后才更新第 5 节与来源清单，不为计划路径创建空目录或占位图片。

## R12.96 · 装饰与入口海报路径迁移

R12.96：将 public/art/a05 与 public/art/feature-postcards 两组历史命名迁为 decorations 与 postcards；5 个媒体、2 个来源清单原 Git blob 不变。同步 3 个 React 消费者、海报回退 E2E、转换脚本和来源工作流，保留 A05 验收 ID、截图目录、旧历史 SHA、来源与审批。351 个代码/工具/测试文件、185 个 Markdown、19 个资源 JSON/CSV 已做相关路径与文件名专项扫描。未改变玩法、布局、图片字节及存档；43 公开媒体、141 全仓媒体不变。新提交 CI/Pages/视觉结果独立验证。

| 旧路径 | 新路径 | 原 Git blob 前缀 |
| --- | --- | --- |
| `public/art/a05/foreground-ornaments.svg` | `public/art/decorations/foreground-ornaments.svg` | `fbf4a3c67d88` |
| `public/art/a05/moonlight-tracery.svg` | `public/art/decorations/moonlight-tracery.svg` | `c5f2af6e18e6` |
| `public/art/a05/rose-petal.svg` | `public/art/decorations/rose-petal.svg` | `09f65722ff16` |
| `public/art/a05/source-manifest.json` | `public/art/decorations/source-manifest.json` | `a6a2291214b9` |
| `public/art/feature-postcards/gothic-workshop.webp` | `public/art/postcards/gothic-workshop.webp` | `34c4b7fdc29d` |
| `public/art/feature-postcards/moonlit-street.webp` | `public/art/postcards/moonlit-street.webp` | `e7b5404a42ca` |
| `public/art/feature-postcards/source-manifest.json` | `public/art/postcards/source-manifest.json` | `9ffdafeec97b` |

旧目录不保留副本；原路径见 [固定历史基线](https://github.com/kunlong-luo/monster-apartment/tree/03490ccca8197bb7a48a28edf6cf34b78c74ac9f/public/art)。其余角色、封面、大厅、世界地点和房间路径分批迁移，未宣称全部完成。

R12.97：将 public/art 顶层业务目录与现存根文件纳入现有 `pnpm audit:repository-layout` 门禁；旧 a05、feature-postcards、任意未登记顶层目录或根文件均失败。新用途必须同步更新资源目录、public/art 入口和门禁；现存角色、封面、房间、场景及回退路径不动。下一批优先核对正常 PC 场景 review 路径，未完成完整引用扫描前不迁移或删除；暂缓批量生成新美术。
