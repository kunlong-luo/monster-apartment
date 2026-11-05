# V3.75 — 设备高清 CG 候选、真实透明抠图与不可覆盖导入机制

更新于 2026-11-05。

## 当前美术进展和来源

已经基于本项目的专门九宫格设备素材板，分离水汽泵 / 孢子温室 / 晶核熔炉各 Lv.1、Lv.2、Lv.3，共九张 **512×512 RGBA WebP** 候选。每张有独立机器轮廓、镂空区域、独立等级机械形态和实际 Alpha 通道。素材板不是游戏场景截图；但是九张候选来自**一张生成的对照素材板**，不应误称九张分别绘制的正式 CG，亦不应将生成的标题、导航或工作标签误导入机器精灵。

精细度确实高于以前的离线 SVG 结构稿，但透明烟雾和底座仍有边缘伪影；**尚需检查和修图**。本轮素材包单独作为会话文件交付，不宣称已自动上传 GitHub 仓库。用户可在下载的候选包中检查原始素材板、逐张 WebP、对照图与 SHA-256 清单。

## 解决的原有构建风险

过去 `v2/scripts/prepare-machine-art.mjs` 每次构建都无条件覆盖 `art/production/machines/<craft>/lv<N>.webp`；`prepare-machine-working-art.mjs` 也无条件重造四帧图集。这会在引入正式原画后马上把 CG 覆盖成旧的扁平 SVG 图，或用旧活塞/炉火坐标覆盖真正新机体。

现在两条生成器都读取 `v2/art/asset-pack.v1.json`：

- **只有** `status: review`、且 `generatedFrom` 精确指向各自生成脚本时，才重绘程序临时结构稿。
- `review` / `ready` 的外部美术必须有实际对应文件；不允许生成器自行合成一个代替。
- 如果 Lv.2 静态 CG 已被外部导入，而四帧图集还声明使用旧生成器，构建直接给出清晰错误，不容许错位帧骗过审核。
- 新候选只有明确完成人工视觉审核后才能逐项升为 `ready`。普通玩家始终加载正式索引，`?machine-art=review` 才加载 review 索引。

## 九张透明 CG 的显式导入

新脚本 `v2/scripts/import-painted-machine-art.mjs` 是**本地维护者工具**，不在正式浏览器或 CI 发布过程中自动执行。它接受一个包含 `well-lv1.webp` 等九张 WebP 的目录；兼容候选包中 `production-candidates/` 目录结构。

```bash
cd v2
node scripts/import-painted-machine-art.mjs /absolute/path/to/unzipped-candidates
npm run audit:art
npm run build
```

九张候选必须全部通过审核后才会修改文件：真实 WebP、512×512、真实透明、边缘留白、没有整张白纸背景、满足最小字节数。导入会在清单中记录内容 SHA-256、将九张独立机器图标记为 `review` 和 `generatedFrom: curated-cg-import`，**不会自动升为正式 CG**。Lv.2 工作动画一律降为 `pending`，直到以对应的新机体重新绘制四帧；不能再播放原本扁平机体的动画。

`v2/scripts/audit-art.mjs` 在原来头信息、固定画布、图集尺寸与四帧差异审核的基础上，增加了实际像素 Alpha 统计与外边界截断检查，对导入候选再对照 SHA-256 防止静默覆盖。

## 后续美术验收步骤

1. 用 `/workshop/?machine-art=review` 的「设备原画检查」查看所有等级原尺寸的深色棋盘背景。重点清理烟雾白边、底座锯齿、虚假投影残影和被剪掉的管路。
2. 在真实 PC / 手机上比较与哥特大厅的色彩、视角、层次、角色遮挡和边界。必须在远景地块中清晰辨认三台独立机械，且 Lv.3 不得被 Lv.2 动画降级。
3. 为**每台新机体**绘制匹配的四帧 2048×512 图集（透明、同锚点、机壳不跳、状态真正工作才动）；恢复待审核的 `machine-animation` 记录。
4. 通过人工美术批准与完整 Quality、Desktop Visual Review、GitHub Pages 后才能将对应 `status` 标记为 `ready`。

遵守：主分支实施、现有最新稳定依赖、PixiJS / Next.js / TS、PC 优先并兼顾手机、不要 Sparkles 图标、无重复 Dock、绝不修改存档和生产经济以实现纯美术效果。
