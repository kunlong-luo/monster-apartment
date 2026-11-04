# V3.71 · 工坊机械细节与正式四帧设备动画接入

**日期：2026-11-04。** 范围：月光工坊 `/workshop/` PC + 手机 PixiJS 8。基线为 V3.70 已成功的 Quality、Desktop Visual Review、Pages 发布。严格保留 15 格生产建造、三名成年工匠、自动产线、工单、存档与导航结构。

## 本轮实际落地

1. 新增 `v2/src/workshop-machine-actuators.ts`：水汽泵玻璃活塞、孢子温室双叶小机构、晶核熔炉铜制炉门与炉芯。它们挂载在真实设备贴图上、人物下方，`eventMode='none'`，无新按钮、无资源写入、不干扰点击。每个 Graphics 只在场景同步时创建，日常 ticker 只改变位置、角度、光效强度。
2. `v2/src/workshop-machine-presentation.ts`：独立、可单测的 `machineActuatorPose`。只有真实开工、生产、产出状态才能有微运动，未派工、缺料、系统或玩家要求降低动态效果时均冻结动作。
3. `v2/scripts/build.mjs`：正式审核清单的 `machine-animation` 现可与此前 512px 设备母图一同打包。只有 `status: ready`、严格匹配 `production/machines/{well,garden,kiln}/working.webp`、尺寸 `2048×512`、4 列 × 1 行的条目才进入包；无文件时 manifest 输出 `working: {}`，不会额外产生 404。
4. `v2/src/workshop-painted-art.ts`：按白名单下载获批工作态图集，校验实际尺寸，切分成四张共享同一 ImageSource 的 512×512 Pixi `Texture`。加载失败静默回退已审核过的静态母图／AVIF／raster，避免首次导航卡住。
5. `v2/src/workshop-lab-stage.ts`：当设备确实有工匠且供应链满足时，才以 `AnimatedSprite` 播放其正式四帧图集；缺料或未派工仍展示静态设备，**不能播放假的生产动画**。启用图集时不再叠加临时机械机构；系统偏好与玩家“降低动效”会立即暂停帧播放。
6. `tests/workshop-machine-presentation.vitest.test.ts`：断言所有工种在 idle/blocked 状态静止、降低动效后机械姿态冻结且三类设备运动彼此不同。`e2e/workshop-dock-clearance.spec.ts` 增加 PC / 手机挂载标识与零图集安全回退；CI Visual Review 监听机械模块。

## 正式原画仍须交付的部分

**本轮不将轻量机械 Graphics 当作高清 CG**。按照 `v2/art/asset-pack.v1.json` 交付并审核独立透明素材：

- `well / garden / kiln` 各自 `lv1 / lv2 / lv3.webp`（每张 512×512、透明底、固定 0.5/0.92 锚点），真实等级结构变化而非单纯换色。
- 每台 `working.webp`（2048×512，四帧 512×512，机体稳定不抖、不同部件运动）。物理部件和整体画法须与正式静态母图一致。
- 每个作品应有哥特式金属、透光材质与明确的形体层次，参考用户批准的工坊设计效果图，但绝不能将带 UI 或人物的概念截图裁切冒充正式资产。
- 先以 `status: review` 加入文件、在 1440×900 和 390×844 截图逐台审批、检查透明边缘与点击命中，再将已批准的单项改为 `ready`。此步骤未完成前，`machine-artwork-tier=review-avif` 是正确状态。

## 验收状态

CI 结果以对应 main SHA 的 Quality / Desktop Visual Review / Pages 工作流为准。任何测试失败都必须修复，不通过改低布局断言来规避。整个流程不依赖新的 UI 框架、不使用 Sparkles 图标、不回退旧 Dock。
