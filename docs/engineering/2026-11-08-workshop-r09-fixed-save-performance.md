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

## 首轮真实基准对观测口径的修正
- 首次 CI 运行成功完成 0/2/15 台设备对照，报告显示 32/85/435 个 Pixi display objects，且 12 次单地块刷新后对象数回归原值；对应的工坊更新回调 p95 分别约 0.1/0.1/0.3 ms。
- 首份报告的帧间隔在三组场景中均为 **100ms**。追踪后确认数据使用了 `ticker.deltaMS`，它受 Pixi `minFPS` 的最大时间步长钳制，无法如实表示低帧率下的实际帧间隔。现已切换为未经裁剪的 `ticker.elapsedMS`，与 Pixi 官方文档的原始时间定义一致。此前 100ms 数字只用于定位测量错误，不用于性能结论。
- 新基准将 JS heap 后 GC 的检查点扩展到 0/12/48 次地块更新，识别首次缓存预热与继续增长的趋势。浏览器 JS 堆仍无法代表 WebGL 纹理占用，且单轮数据不能判定泄漏。

## R09.3 · 真实 V8 Heap Snapshot 对象归因（2026-11-08）
- 固定密集存档（15 设备、3 工匠）在采样完成后及第 12 / 48 次单地块重建后保存 **3 份 V8 Heap Snapshot**，仅在隔离的 CI 合成存档中执行，不对玩家采集数据。
- Chrome CDP `HeapProfiler.takeHeapSnapshot` 把原始快照按 `*.heapsnapshot.gz` 压缩并上传到 Actions Artifact，30 天内可下载解压，在 Chrome DevTools Memory 中检查 retaining path。
- `e2e/helpers/workshop-heap-census.ts` 按 V8 snapshot node metadata 动态解析类名/类型、数量和 shallow bytes，输出各检查点的类统计及增长最多的对象类型。**浅表大小不等于保留大小**，也不覆盖纹理显存。
- 只对 **密集固定场景**执行原始堆快照，避免对常规浏览器视觉检查和实际玩家游戏产生额外运行成本；原有 0/2/15 设备帧间隔基准及 48 次局部重建断言仍保持。
- 该阶段首先定位缓存及对象保留者，不冒然 destroy 共享 texture；下一步结合类统计及 retaining path 再定向移除实际泄漏引用。

## R09.3 两次独立 Chrome 堆快照实测（2026-11-08）
- [首次可用的堆快照运行](https://github.com/kunlong-luo/monster-apartment/actions/runs/42442682858) 与 [修正 JSON 后的复测](https://github.com/kunlong-luo/monster-apartment/actions/runs/42442891486) 均已 **success**。后者还强制将生成的报告重新读取并用 `JSON.parse` 验证。
- 复测的固定 15 台设备场景：0 / 12 / 48 次重绘时，V8 snapshot 节点数约为 **436,969 / 451,708 / 477,992**；V8 节点浅表大小分别约为 **30.70 / 32.28 / 33.80 MB**。这些不是 Chrome 进程 RSS 或 GPU 显存。
- 复测中 12 → 48 次最主要的三个增长类别：`array:(object elements)` **+2,828 / +605,768 bytes**，`code:system / InstructionStream` **+124 / +242,048 bytes**，`native:system / JSArrayBufferData` **+36 / +138,456 bytes**。首次运行也呈现高度接近的分布。
- 同轮显示对象数未增长：0 / 2 / 15 台机器对应 **32 / 85 / 435** 个 Pixi 场景节点，12/48 次等级切换后的节点数恢复基线，且 **没有完整场景重绘**。因此目前的主要问题不是应用层 DisplayObject 列表无限累积。
- 不能据此断言 Pixi Text/Graphics 纹理泄漏。V8 指令流增长可能涉及 JIT/代码缓存，而 `(object elements)` 与 ArrayBuffer 仅是内存类别，必须沿 Chrome DevTools Memory 的 **retaining path** 查找实际对象所有者。
- [复测工作流](https://github.com/kunlong-luo/monster-apartment/actions/runs/42442891486) 包含 `workshop-r09-performance` 工件，含 `workshop-dense-{0,12,48}.heapsnapshot.gz`、`workshop-dense-heap-census.json` 与性能基准 JSON/Markdown。原始快照仅包含 CI 合成存档，不含真实用户数据，工件保留 30 天。
- **下一轮 R09.4 优先级**：先比对 12 → 48 新增对象的引用链与根节点；重点核查 Pixi 文本缓存、Graphics 对象、BaseTexture/TextureSource 与渲染器内部缓冲区。只有确认已不再使用、且未被其他场景共享的资源，才调整生命周期销毁规则，避免首屏贴图丢失。
