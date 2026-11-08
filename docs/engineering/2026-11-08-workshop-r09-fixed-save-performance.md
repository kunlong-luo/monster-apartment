# R09 · 固定存档工坊性能对照 + 地块生命周期模块化

日期：2026-11-08 · 范围：PixiJS 工坊，可回滚，不修改经济或存档 schema。

## 为什么要做
`data-scene-object-count` 和 `data-frame-interval-p95-ms` 只能揭示正在运行的场景，不构成可比较的基准。前几轮优化验证了角色/机器不被重复创建，但未比较不同设备密度、JS 堆和帧时间。本轮把性能测量独立于普通桌面视觉 CI，避免给用户交互测试设置不稳定的绝对性能阈值。

## 测量方案
- `v2/src/workshop-benchmark-fixtures.ts` 提供 3 个确定性的合法 V2 存档：**空场景 0 台**、**新手 2 台（与 `newWorkshop()` 一致）**、**15 台设备并有 3 位工匠**。
- `e2e/workshop-performance-baseline.spec.ts` 在 Chrome 的 1440×900 网格视图中为每个存档等待 32 次抽样（每 4 个 Pixi ticker 帧抽一次），输出帧间隔 p50/p95、工坊 JS ticker 回调 p95/最大值、Pixi 对象/特效/动画对象数。
- 在 2/15 台设备场景连续执行 6 次设备升级↔恢复（合计 12 次地块局部重绘），检查返回原状时对象数不变。利用 Chromium CDP 尽可能在 GC 前后采集页面 JS heap used；若接口不可用标记为 `null`。这个 JS 堆不是显存，也不是精确内存泄漏结论。
- **不设置绝对时间门禁**：GitHub Actions 共享硬件、首屏资源和浏览器调度会使数字波动。报告用 `R09_PERF_RECORD` 打印到工作流日志，另外保留 `visual-evidence/performance/workshop-r09-baseline.json` 与 Markdown 表格为 30 天 Actions Artifact。

## 架构变化
- `v2/src/workshop-plot-lifecycle.ts` 接管单地块 Sprite、动画引用、特效引用的完整注销和 children 销毁。共享的 Pixi textures 仍由原有资源系统持有，不在单格清理时破坏。
- `v2/src/workshop-lab-stage.ts` 继续保持渲染和事务职责不变，但由独立模块处理资源生命周期；不更改工作中机器的视觉状态、绘制顺序、15 格 hit targets 或手机相机。
- 用纯逻辑单测检查固定存档可重复、结构有效且工匠分配不重复。

## 后续
在相同设备及浏览器上运行多轮相同快照，比对 p95 与 heap 增量；如需 GPU 指标、WebGL texture 存储、draw calls 或性能 trace，须另外加 Chrome tracing/真实硬件运行，不可从 `Performance.getMetrics` 的 JS 堆推导。后续 R07 应优先剥离全局管线、访客和粒子层，避免继续扩大工坊主渲染文件。
