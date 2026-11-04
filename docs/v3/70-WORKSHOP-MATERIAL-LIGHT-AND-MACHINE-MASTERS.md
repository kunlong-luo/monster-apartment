# V3.70 · 工坊设备材质光效与正式高清原画接入

**日期：2026-11-04**  
**范围：** PC / 手机工坊 PixiJS 画布、独立设备贴图、资产审核。  
**基线：** V3.69 Quality、Desktop Visual Review、Pages 已通过；既有场景优先/详细调度、三名工匠、真实产线、自动生产与存档保持不变。

## 本轮代码改动

1. `v2/src/workshop-machine-materials.ts`：在当前机器原画前方增加极轻的 PixiJS 内部材质光——水汽泵的玻璃折射与液面、孢子温室的温室弧面与叶形轮廓、晶核熔炉的炉芯折光。该层处于人物下方、`eventMode='none'`，不会挤占点击热区；不会在 ticker 中重复创建或销毁图元。
2. `v2/src/workshop-machine-presentation.ts`：定义纯函数 `materialLight(phase, reducedMotion)`。未派工和缺料时不亮工作材质；减弱动态效果时保留微弱静态可读状态，但不播放几何运动。增强特效只由 startup/working/output 的真实阶段决定。
3. `v2/scripts/build.mjs`：从现有 `v2/art/asset-pack.v1.json` 的 `productionAssets` 中，仅将明确标记 `ready` 的机器 WebP 打入正式包，并生成 `machine-art-index.json`。没有获批图时生成一个**空索引**，而不是偷偷加载审查稿或连续发起 404。
4. `v2/src/workshop-painted-art.ts`：优先读取索引里 512px 或以上的单体贴图；冷加载失败则回到原 AVIF 预览/程序后备。贴图路径严格白名单为 `production/machines/{well,garden,kiln}/lv{1,2,3}.webp`。
5. `v2/src/workshop-lab-stage.ts`：按设备种类、等级直接放置获批的 512px WebP，**不再在正式母图上重复覆盖旧 AVIF**；同时加入浏览器可验证的 `data-machine-material-style` 和 `data-machine-artwork-tier`。
6. Quality 与 GitHub Pages 都检验生成的索引文件；视觉工作流监听这次新增的 Pixi material、build 与 asset manifest 文件。Vitest 验证材质响应真实设备状态和减少动态效果，Playwright 验证 PC / 手机新材质层与尚未获批的旧素材回退。

## 禁止将概念图冒充正式游戏贴图

本轮生成的带按钮、面板、人物的整屏概念画面只可用于**视觉方向讨论**，不能直接裁切成机器透明贴图，也不能烘焙到可交互舞台背景。独立的水汽泵、温室和熔炉资产仍须遵照已有 manifest 制作与验收，当前所有 `productionAssets` 仍为 `pending`；代码准备好接入并不意味着已经交付高清原画。

### 下一轮的正式设备资产验收

- 三台设备分别具有独立、非换色的轮廓，符合哥特庄园、深紫酒红与暗金配色；每件 512×512，透明背景，无字幕、UI 按钮、水印或人物肢体。
- 同一机器的 Lv.1/Lv.2/Lv.3 体现真实结构升级；工作态使用同一坐标的独立四帧素材（既有规范为 2048×512），避免动画帧跳位。
- 先在 1440×900、390×844 的 Pixi 原生场景内对比截图，检查透明边缘、人物遮挡、点击热区、首次加载和原有存档，再将对应 `status` 从 `pending` 切为 `ready`。
- 不引入旧版七按钮 Dock，不回退到宠物形象，不使用 Sparkles 图标，不改经济/概率/生产节拍。
