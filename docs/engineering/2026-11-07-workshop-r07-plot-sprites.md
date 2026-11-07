# R07.2 · PixiJS 单地块 Sprite 容器增量更新（2026-11-07）

承接 [R06 / R07 第一阶段](./2026-11-07-workshop-r06-r07-first-pass.md)。继续在 `main` 上落实，不改玩家存档及经济参数。

## 改动
- `v2/src/workshop-stage-diff.ts` 现在提供 `workshopStagePlotPatch`，区分 **库存文字变化** 与 **设备显示对象变化**。会预先比较真实供料轨迹、未派工时仍可见的静态输送管道、引导文本、日结、委托与访客状态。
- `v2/src/workshop-lab-stage.ts` 为 15 个地块各保留独立的 `Container`。只有发生真实视觉变化的地块清空子对象并重画；其余地块的机体、工匠、动画实例与特效保持原对象。
- 局部销毁前，从 `actors`、`paintedActors`、`machineAnimations`、`machineArt`、`machineEffects`、`deviceEffects`、`materialEffects`、`actuatorEffects` 运行时池移除当前地块的引用并停止其动画。避免下一帧 tick 已销毁的 Sprite。
- 保留 R07.1 的库存文字原地刷新，新增 `data-plot-revisions` 与 `data-last-patched-plots`，用于浏览器精确断言哪个地块被重建。
- 移动端顶部工匠状态属于**全局角色行**：有工匠上下岗时使用完整重绘，避免角色行信息滞后；单台设备升级、库存变动仍走局部更新。

## 回退条件与不变项
- 管道连接、生产流、引导目标、剧情访客、日结和订单变化都保留整场景重画，避免旧管线、错误奖励动画和错位教程。
- 地块的固定点按命中层 `plotHits` 和地板底座 `foundation` 始终不销毁；设备图像、人员位置、特效材质、动画帧序和暂停规则未更改。
- 新增纯逻辑单测：单机升级、独立建造、改变闲置物理管线、库存与设备同时变化；浏览器回归测试在 1440px 和 390px 分别验证只有目标 plot Revision 增加，以及移动端工匠行的保守完整重绘。
- **范围限制**：这仍不是整套 Pixi scene graph 模块化，更不是新贴图；需要后续独立的场景生命周期/纹理显存测量，才能宣称大规模生产稳定性提升。现有 Quality、Desktop Visual Review 与 Pages 的结果必须按本次 SHA 逐项核对。

