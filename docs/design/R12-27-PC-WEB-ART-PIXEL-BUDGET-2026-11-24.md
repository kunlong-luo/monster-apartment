# R12.27 · PC Web 图鉴清晰度：移除重复放大，按 DPR2 校验原生像素（2026-11-24）

> **真实提交：** 修复的是 PC Web 已经在使用的**角色图鉴 CSS 与浏览器验收**，并更新发布标识为 **V3.93.0**。本轮没有重新绘制或接入新的 PNG/WebP，也没有批准任何角色正式 CG。Quality、Desktop Visual Review 与 Pages 必须针对最终 `main` SHA 分别核实；提交时不预设已经上线。延续 [R12.26 Web 路由修复](R12-26-WEB-CHARACTER-ROOM-DEEPLINKS-2026-11-24.md) 和 [真实像素审计](../art-reviews/R12-01-REAL-BROWSER-PIXEL-EVIDENCE.md)。

## 一、可复核的问题与根因

在 `src/components/moonwork/character-gallery-scene.css` 中，人物图鉴右侧**神话月纱详情图**使用 `object-fit:cover` 将 3:4 候选画裁入浅横幅，之后还施加 `transform:scale(2.05)`，相当于在一次必要的裁切之外再放大两倍以上。此举同时浪费原生像素、裁掉更多画面，并导致高 DPR 屏幕近景柔软；这是已确定的**实现层二次放大**，不是原画质量已经提升的证据。

所有五张人物卡在鼠标悬停时还对画作执行 `transform:scale(1.02)`，因此即使 3:4 候选图已按正常尺寸渲染，也会产生额外的图像重采样。与之不同，卡片整体轻微抬起、边框变亮、光晕强调不需要放大画像素，因此可以保留。

**不应误删：** `.cg-card__ambient-art` 的 `filter:blur(20px)` 是低不透明度、处于人物背后的装饰性环境氛围层，而不是真正的角色主画作；本轮没有把环境雾化误认成主头像故障。主画作 `.cg-card__image` 与 `.cg-detail__hero-img` 均不使用模糊滤镜。

## 二、实际代码与测试

| 路径 | 真实修改 | 保留 |
| --- | --- | --- |
| `src/components/moonwork/character-gallery-scene.css` | 移除 `.cg-detail__hero--mythic .cg-detail__hero-img` 的 **2.05×** transform，使用原有 `object-fit:cover` 完成适度近景；移除 `.cg-card__select:hover .cg-card__image` 的 **1.02×** 二次放大及多余的图像 transform 过渡 | PC 人物资料横幅、角色真实图、五张候选卡、选中描边、卡片抬升和移动端既有布局 |
| `e2e/a05-character-gallery-layout.spec.ts` | 在 PC 图鉴真实加载五张候选后，断言月纱横幅图片的计算 `transform === none`，再按 **DPR2** 计算封面裁切的有效采样倍率不得高于 **1.0**；鼠标悬停卡片后断言主画作 `transform === none`，并在 CI 日志输出横幅真实 `naturalWidth × naturalHeight` 和采样倍率 | 原有 A05 主图、详情选中、0/5 CG 晋级约束、浏览器截图、手机操作回归；截图前移走鼠标，避免 hover 改变已批准参考布局 |
| `src/core/game-release.ts` 与 `public/release.json` | 将本轮客户端和静态发布标识一致更新为 **V3.93.0**；沿用已有更新通知机制 | 无新依赖、无第八条路由、不自动重载玩家存档 |

### 浏览器 DPR2 检验的真实含义

对 `object-fit:cover` 的图，按源图像素 `naturalWidth × naturalHeight` 和当前 `img.getBoundingClientRect()` 估算：

```text
effectiveSourceSampleRatio =
  2 × max(displayedCssWidth / naturalWidth,
          displayedCssHeight / naturalHeight)
```

本轮针对**神话月纱详情图**设置 `ratio <= 1.0` 以及 `computed transform: none` 的双重门槛，既防止高 DPR 需插值，也防止 CSS 对原画做超预算放大。它只验证特定 PC 详情图在本测试的裁切模式下的有效像素预算，并**不意味着任何图片主观上就一定清晰、没有编码模糊、商用权完整或适合做正式全身 CG**。

## 三、明确仍未解决的高清素材债务

以下数据来自 2026-11-14 的真实浏览器 Pixel Evidence，供本轮作**基线对照**；本轮没有重新量出这些值，因此不得当作新的采样结果：

| Web 页面 | 历史原图/实测 | 未解决问题 | 必须采用的修复 |
| --- | --- | --- | --- |
| `/` 首页大厅与部分公寓背景 | `lobby-hero-v3.webp` **1587×991**；1648×928、DPR2 有效采样约 **2.08×** | 主绘景原生像素不足，且公寓不应与大厅重复同一场景 | 独立 PC 原生高清场景（参考 **2560×1440 以上**）、单独手机竖版构图，确认画面与人物视觉身份 |
| `/characters/` 方形过渡头像 | 部分旧 `face.webp` 为 **512×512**；此前在 1648×928 大卡的有效采样可达 **2.98×** | 方图不应承担长画幅全身人物插画；大幅裁切导致糊脸/变形 | 完成经审核的独立竖版 CG；候选画与原头像必须区分 |
| 旧委托 / 仓库横幅 | 历史 `moon-workshop.avif` **360×228**，DPR2 最高约 **3.68×** | 重复场景/小图大型拉伸问题属于另一独立画稿任务 | S05/S06 独立无字绘景、原生尺寸和人审通过后再接入 |

目前月纱、泉泡、青枝、炽角四人的 G1 独立研究源图虽已存在于会话 ZIP，但**新二进制源图尚未真正同步到仓库**，G1 人工身份签署 **0/4**；PC/手机两张正式封面 **0/2**，五张正式全身角色 CG **0/5**。这轮 CSS 纠偏不能代替上述美术生产。

## 四、发布与后续 Web 优先验收

- **本轮代码提交已完成**，接下来必须核实当前最终 SHA 的 **Quality**（TypeScript、Lint、A05 设计约束与 Next 静态导出）、**Desktop Visual Review**（A05 1648×928 主图、DPR2 与 hover 断言、1440×900/390×844 截图）以及 **Pages** 成功；截图和 CI 不代表人工美术批准。
- 如果画面因移除多余 zoom 显得人物略小，首先评估**本来就设置的 object-fit 裁切**和艺术构图，不能把 `scale(2.05)` 加回去换取“近景大脸”；需要真正独立脸部近景时优先采用同身份、审核过的高分辨率局部原画。
- 后续 P0：为首页及公寓替换真正独立高分辨率 PC/移动端场景；P0：真实 DPR2 测量与记录图鉴卡、召唤结果和私人房间的主图缩放；P1：解决委托/仓库小图重复、加载回退和场景缺少真正独立绘景的欠账。
- 关联 [Issue #24 图片模糊](https://github.com/kunlong-luo/monster-apartment/issues/24)、[Issue #16 独立场景](https://github.com/kunlong-luo/monster-apartment/issues/16)。二者的**美术生产问题不得因这轮实现层修复而关闭**。

**交付边界：** 本轮修正真实 Web 视觉渲染和像素预算回归，但没有生成/上传更大的新原图。是否可见于线上，严格以最新 SHA 的 Pages 成功记录为准。

## 五、首次 Desktop Visual Review 的旧断言与复验动作

- [桌面视觉首轮 #45308414727](https://github.com/kunlong-luo/monster-apartment/actions/runs/45308414727) **失败**于 `e2e/a05-character-gallery-layout.spec.ts:59`。该用例原来强制 `mythicZoom > 1.9`，对应被本轮去除的旧 `scale(2.05)`，浏览器实际返回 `1`。本次日志中先前的其他四场景测试 **24/24 通过**；A05 其它三个测试 **3/3 通过**。这是**旧测试仍要求错误放大**，不是新版本必须重新放大图片的证据。
- 已修订旧断言为 `computed transform: none`，继续保留人物艺术来源必须是 `cg-eclipse-candidate.webp`、`object-position:50% 0%`、详情横幅位置不溢出、五卡/原图尺寸及新增 DPR2 预算。**没有**降低新像素保护阈值；新增验证仍是 `effective ratio <=1.0`。
- 修订提交 `7444601463bc803b275a101c0abc914bfe5a69a6`。必须用此后同一代码的 Desktop Visual Review 复验；此前 V3.93.0 的 Quality 和 Pages 通过是发布证据，**不等于首轮失败的视觉工作流已通过**。该状态应记录，不能在报告中删去首次失败史。
