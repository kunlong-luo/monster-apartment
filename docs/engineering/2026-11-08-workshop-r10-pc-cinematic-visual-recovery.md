# R10 · PC 工坊全景的设备视觉回收与交互精修

日期：2026-11-08。范围：桌面端默认 1440×900 及其他满足 `min-width:1100px, min-height:730px` 的生产全景。游戏机制、15 格 Pixi 热区、存档与页面路由不变。

## 实际视觉问题与原因

对照最后一轮 [Desktop Visual Review](https://github.com/kunlong-luo/monster-apartment/actions/runs/42444729014) 中的 `visual-evidence/workshop/desktop-workshop-scene-1440.png` 和 `desktop-workshop-stage-priority-v390.png`：

1. 默认普通游戏的主设备来自低清晰度 legacy AVIF；原 CSS 的水汽泵 1.90 倍、温室 1.60 倍、熔炉 1.70 倍放大将压缩痕迹直接铺到舞台上，明显失去原设计稿的精致度。当前审核候选并未标记 `ready`，不应悄悄切换为正式美术。
2. 整台机器实际是一个按钮，原 CSS 在选中和 hover 时给全设备区渲染大面积边框及背景，视觉上变成三张大型网站卡片而不是庄园里的物件。
3. 设备与地面的空间关系较弱：底部缺少与水汽／植物／熔核一致的材质光影提示。

## 本轮修改

- **只对默认旧素材控制放大**：水汽泵 1.28、温室 1.18、熔炉 1.25，最大图片渲染容器宽度 400px；显式原画审核模式仍然保留较大的 512px 候选预览空间。
- 交互仍是原有全尺寸语义化 `button`，但取消整块卡片式 hover/selected 背景，改为局部地面光斑、细窄的材质选中线与铭牌亮度提升；键盘 `:focus-visible` 的明确虚线轮廓继续保留，不能牺牲无障碍操作。
- 光斑没有额外 DOM、Pixi 图形或运行时事件，复用每个 craft 的色彩变量，避免新增粒子和 WebGL 负担。
- 增加定向 Playwright 视觉证据，检查三个默认设备缩放上限、透明卡片边框、地面光影、选中态提示和上下文操作仍可用，输出未选中和选中两张 1440px 浏览器截图。
- 未审核的机器美术仍明确保留 review 状态；这些 CSS 改善不能替代下一轮真正的 512px 透明设备绘画和等级差异生产。

## 退出条件

以同一 main SHA 的 Quality、Desktop Visual Review（含新桌面截图）及 GitHub Pages 为准。由于仅编辑了生产全景的 CSS 和浏览器测试，不改 V2 WebGL 渲染器、堆快照基准或存档。
