# R06 · 工坊 CSS 高度收敛与 R07 渲染对象计数（2026-11-07）

## 基线
- 上轮 `df6f493` 的 Quality、Desktop Visual Review 和 Pages 均已成功；原有页面、美术与交互尺寸作为本阶段回归基线。
- 操作栏只在 `workshop-controls.tsx` 以 `console gothic-console-3col` 挂载，不需要为旧版无三栏样式维护多个高度与 bottom 回退值。

## R06 · 清除真实死规则
- `gothic-workshop.css` 的 `.middle` 只在基础规则设置一次 `bottom`；统一采用 `--workshop-console-height`、`--workshop-scene-nav-clearance`、`--workshop-stage-gap`，所有现有断点共享同一计算。
- `.console.gothic-console-3col` 只在一处设置高度与主要网格行；保留 PC scene/expanded 和手机 610px 不同的变量值，而不是给不同断点追加独立数字。
- 移除 1250/860/640/360px 旧 `.console` 网格与 `.middle` 高度覆盖；保留它们**仍在使用**的工具栏、角色、面板等样式。
- 修复 611–640px 的旧 `max-height:182px` 与新 `--workshop-console-height:clamp(270px,40dvh,345px)` 冲突：控制台不再被裁剪到 182px，画布预留高度与真实控制台一致。PC 1440px 的 64px scene 操作栏仍不变。

## R07 · 可验证的对象指标
- 在 Pixi `stage` 每次完整/局部同步后记录 `data-scene-object-count`（活跃 Pixi display objects，包含舞台容器）；`data-scene-animated-count`（被引用的动画实例数）、`data-scene-effect-count`（机体特效/材质/传动层的引用数）和 `data-scene-plot-container-count`（地块容器数）。
- 指标是一次渲染后的 *存活对象数量*，不是 GPU 显存、draw call、FPS 或真实 frame time。每次自动帧不遍历对象树，避免为观测引入持续开销。
- 浏览器重复把一个设备从 Lv.1 升到 Lv.2 再复原，并验证回到原等级时对象数、动画引用数、特效引用数恢复基线，同时其他地块不重绘。基础 Pixi 结构和 V2 save、Web Locks、自动生产经济规则均不变。

## 验收
- Quality 的 TS/Vitest/静态导出、Desktop Visual Review 对真实 1440px/390px 工坊、GitHub Pages 同 SHA 发布均需分别核验；单元通过或发布工作流完成不替代渲染/页面回归。
- 后续再清理重复**选择器**和评估长会话的实际帧时间与纹理显存。此阶段不声称 FPS 提升百分比。
