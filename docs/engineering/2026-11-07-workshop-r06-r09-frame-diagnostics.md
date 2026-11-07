# R06 · 控制台样式去重 / R09 · Pixi 帧间隔与回调耗时（2026-11-07）

## 发布基线
- `718438e` 在 Quality、Desktop Visual Review、GitHub Pages 均通过；本轮保持设备经济、贴图、存档事务与 PC/手机布局尺寸不变。

## R06 选择器合并
- `gothic-workshop.css` 将 @media(max-width:900px) 的控制台高度 token、按钮排布和间距定义合入同一个断点。移除其中被基础属性覆盖的重复 `bottom`、后段重复 `gap`。
- `.console .console-panel` 的 `grid-row:1` 并入首次定义；不再作为第二次同选择器追加规则。
- 保留不同断点下有意义的 `display`、工匠列表排列与桌面场景高度；这些是*预期响应式差异*，并非重复错误。

## R09：可验证、限额且不影响每帧绘制的性能诊断
- 新增独立领域工具 `v2/src/workshop-frame-metrics.ts`：128 个样本上限、每 4 次 ticker 更新采样一次，每 32 个样本发布一次 p50/p95 数值。采用固定窗口覆写，避免长会话数组增长。
- Pixi 在 `data-frame-samples` / `data-frame-window` / `data-frame-interval-p50-ms` / `data-frame-interval-p95-ms` / `data-frame-update-p95-ms` / `data-frame-update-max-ms` 暴露读数，方便开发调试及浏览器回归；没有发送遥测或写入玩家存档。
- `frameInterval` 是 Pixi ticker 观测的**帧间隔**（包括浏览器/系统调度），`frameUpdate` 仅计时当前工坊 ticker 回调，既不是整个 JS 帧开销也不包含 GPU 提交与实际渲染时间；**不由这组指标声称游戏 FPS 提升**。
- 隐藏的全景模式会停止 Pixi ticker，不持续计算或更新指标。低运动偏好下仍可测到维持基础 Pixi 的刷新开销。
- 单元测试覆盖百分位、最大容量、无效值；浏览器测试验证只在动态网格累计样本、回到全景后冻结读数。沿用前轮设备 Lv.1/Lv.2 的对象数恢复回归。

## 后续
- 如需真实 GPU / 帧率对比，应在独立性能基准中使用 Chrome Performance trace 和 WebGL 指标，比较相同设备、固定模拟存档、同一浏览器/硬件，不应在 CI 虚拟机上设绝对 p95 时间门槛。
