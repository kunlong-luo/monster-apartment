# R12.0 · 图片清晰度与场景差异审计（源码/文件清单）

> 2026-11-14 基于 `main` `be3dc43c` 的 GitHub Tree、实际 TSX import、`public/art/README.md`、房间 manifest 与现有设计审查得出的**静态清单**，不是已经现场重新浏览七页并逐像素判定质量的报告。项目主观反馈是「多图模糊、场景太少」。因此本表用「待复查」而不是编造清晰度评分。

## 已核实的文件分布

Git Tree `GET /git/trees/main?recursive=1`（`truncated=false`）下，列为 PNG/WebP/AVIF/JPG/SVG 的文件共 **71** 个，但包含设计参考、概念图、SVG 装饰和原型，并非 71 张不同的正式场景。主要存放于：
- `public/art/`：26 个图像/SVG；**不等于 26 张正式可玩的独立场景**。
- `v2/art/`：15 个图像（含 9 张待审核的设备等级候选、5 张原型 AVIF、其他机器资源）。
- `docs/` 和 `.aistudio/` / `public/assets/aistudio/`：含设计参考；不能未经来源/授权审查当作正式贴图。

图片是否清晰必须比较原图内在细节与真实渲染，不依据字节大小直接下结论。下列「尺寸」取已有资源说明或 manifest；「大小」是 Git Tree 文件大小，与 decoded dimensions 不同。

| 优先 | 当前图/路径 | 已知尺寸、大小及用途 | 已确认风险 | 需验证/动作 |
| --- | --- | --- | --- | --- |
| P0 | `public/art/lobby-hero-v3.webp` | 1587×991，435400B，`gothic-lobby.tsx` 的 `fill sizes="100vw" unoptimized` | 不是原生 2560px PC 主绘景；高 DPR 与更大桌面可能扩大，用户已报告模糊 | 浏览器采样 DPR 1/2、边缘细节；制作更高质量不同构图 PC/手机候选 |
| P0 回退 | `public/art/lobby-hero-v2.webp` | 1030×645，209336B，主图失败回退 | 如果回退被当正常主视觉，模糊会更明显 | 记录 fallback 命中次数；仅真实加载失败时使用 |
| P0 | `v2/art/moon-workshop.avif` | Git Tree 2995B；被 `world-orders.tsx` 和 `world-warehouse.tsx` 同时全宽显示 | **已从源码确认两页重复同一工坊原型图**；字节小不单独证明失真 | 解码真实 `naturalWidth`，禁止继续充当委托大厅或仓库的最终环境 |
| P0 | `v2/art/kiln-art-review.avif` | 4402B，在仓库画面作为 180×180 小型插画 | 临时审稿切片不应被宣称正式原画 | 保留为临时辅助图，正式仓库背景独立替换 |
| P0 | `public/art/world-scenes/workshop-gothic-hall.webp` | 1920×1080，180542B；工坊 React/Pixi 环境 | 源图已是独立过渡厅堂，但不是有完整锻造机具的专属工作间 | PC/手机与 Pixi 贴图的实际采样、色带、锐度和机器人遮挡 |
| P1 | `public/art/world-scenes/town-moonlit-gate.webp` | 1920×1080，120894B；月光街环境 | 仅夜间大门，缺街区商铺与生活动线 | 不以 1920×1080 分辨率认定正式 CG；设计完整独立街景 |
| P1 | `public/art/feature-postcards/gothic-workshop.webp` | 960×320，59254B；大厅右侧功能横幅 | **只批准用作小幅入口海报**，不是 PC 全屏场景 | 保持在 320px 海报级显示，禁止页面放大复用 |
| P1 | `public/art/feature-postcards/moonlit-street.webp` | 960×320，34350B；大厅右侧街区横幅 | 同上 | 同上 |
| P1 | `public/art/yuesha-avatar-v3.webp` | 500×500，87422B；头像 | 不能当人物图鉴的大型全身 CG | 保留缩略图用途、对比具体显示面积 |
| P1 | `public/art/yuesha-portrait-v3.webp` | 700×830，178474B；角色与卡面过渡插画 | 大卡/超宽画面易露出裁切和无全身画稿的问题 | 核验脸部比例、像素倍率与审稿状态 |
| P1 | `public/art/yuesha-bust-v3.webp` | 930×910，251540B；对话半身像 | 是带环境背景的平面画，不是透明人物精灵 | 角色层生产需要独立透明 4 姿态素材，不通过 CSS 假装分层 |
| P1 | `public/art/beauty-beasts/characters/{brook,fern,cinder}/face.webp` | 三张各约 47–55 KB 的现有过渡肖像；原图尺寸须读取 | 具不同角色形象，但完整人物卡高清不足以由头像推定 | 分别追踪缩略图、画作、召唤、房间的实际显示像素 |
| P1 | `public/art/rooms/{yuesha,brook,fern,cinder}/concept-scene.svg` | 四张独立 1920×1080 概念背景，文件分别约 9–24 KB | **4/4 都仍是概念场景**：无经过审核的高清 WebP 背景和透明四姿态 | 严守 `manifest.json` 中 `backgroundStatus=concept` / `residentStatus=concept` |
| P2 | `v2/art/production/machines/{well,garden,kiln}/lv{1,2,3}.webp` | 9 张各约 29–37 KB，asset-pack 提供 512×512 画布 | 九张候选仍是 `review`，不是生产定稿 | 确认 Alpha、角色与地形碰撞、等级区分、人工审稿 |

## 首页菜单同源 CSS 审计

- 真正路由注册表：`src/components/moonwork/world-navigation.ts` 的 `CANONICAL_GAME_NAV`，完整七目的地；`src/components/game/gothic-hud.tsx` 中 `GothicDock` 当前将**所有七项直接渲染为底栏**。
- `src/components/game/gothic-lobby.tsx` 只在首页挂载该 Dock；其他页面通过 `GameSceneNavigation` 返回大厅/展开地点，不应重新建立第二套全站固定七项菜单。
- `gothic-lobby.css` 约 149–206 行含超宽桌面底栏和 mobile `!important` 规则；`gothic-reference-layout.css` 约 280–307 行含 PC `body .gothic-lobby` 高优先级重写。`gothic-hud.tsx` 也内联 Tailwind 样式。它们对同一 Dock 进行多处视觉定义，是重构时应收口的**具体维护风险**，但并不能仅靠源码证明某帧截图必然有 bug。
- 现有尺寸：`gothic-lobby.css` 中 PC 单项 `min-height:71px`、小屏 55px/极矮屏 48px，`gothic-reference-layout.css` 在特定 PC 断点覆盖为 62px；这解释为何导航常被感觉厚重且规则反复互相覆盖。R12 规范见 [首页导航重制](../design/R12-01-LOBBY-NAVIGATION-REDESIGN.md)。

## 必须执行的「真实图片诊断」协议

对七个正式路由和四间私室按视口记录：

1. **取证**：路由、版本 SHA、viewport、`devicePixelRatio`、图片 `currentSrc`、`naturalWidth/Height`、`getBoundingClientRect()`、`complete`、`decode()` 成败、是否命中 fallback、CSS `object-fit` 与 `object-position`。Pixi 同时记录实际 `canvas.width/height`、CSS 尺寸、renderer DPR/scale mode；不要误把对象数当显存字节数。
2. **定量**：以源图可用宽高和真实采样需求计算「预计有效放大比」，例如 `(CSS rendered width × DPR) / naturalWidth`，记录 cover 裁切；超 1 时优先检查该区域是否明显损失细节。注意 `cover` 还会按高度缩放、裁掉上下/左右，不能只用宽度一项下结论。
3. **定性**：在 1440×900、1648×928、390×844、390×550 的**真实截图**中标注脸部边缘、发丝、建筑纹理、焦点、色带、文字/交互是否可读。至少包括 DPR 1/2 对比；评审应保留原图和放大标注。
4. **分类**：`SRC_TOO_SMALL`（源图低采样）、`SRC_SOFT`（原画本身柔焦）、`ENCODING`（压缩色带）、`LAYOUT_CROP`、`GPU_SCALE`（Pixi 像素比）、`FALLBACK`、`NETWORK_LOAD`、`DUPLICATE_SCENE`、`PLACEHOLDER`。一个页面可有多个原因。
5. **修复证据**：变更前后相同 viewport 和状态的原始截图与图片来源/授权审查；代码回归同 SHA Quality / Desktop Visual / Gameplay Browser full / Pages，保留真实存档。不得把简单替换 CSS 渐变当高清原画交付。

## 原画交付与晋级门禁

每张候选须列明 `sceneId`、`filePath`、原始来源/授权、许可声明、`sourceSha256`、`outputSha256`、像素尺寸、色域/Alpha、类型（背景/前景/人物/宣传图）、PC/手机构图、文件大小与渲染测试。人工审查和代码审核**分开记录**；即使某个平台宣称 public domain 或 AI-assisted，也不等于本次具体资产已完成权利核验。

只读审计不能宣称用户「糊」感已经解决。真正完成定义：按图像类别交付经审核的独立高品质素材，用它们替换具体路由、完整运行且保留回退、裁切和旧档兼容。
