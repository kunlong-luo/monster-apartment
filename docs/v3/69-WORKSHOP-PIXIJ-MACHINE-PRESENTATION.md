# V3.69 · 工坊设备视觉表现：真实生产驱动的 PixiJS 动效

**范围**：正式 `/workshop/`、PixiJS 设备画布、PC 1440×900 / 手机 390×844。  
**原则**：美术与状态表现可以升级，游戏经济与存档结构绝不因此改变；使用已稳定的 PixiJS 8，不另建 HTML 覆盖层或添加新的底栏。

## 现状与 critique

- 先前单台设备只有四枚几何粒子和一圈发光环，水汽泵、温室、熔炉主要靠粒子颜色区分；缺少更精细的形状、光晕和节奏。
- 生产管路在相邻地块之间按数组顺序绘制粒子。虽然相邻关系是真实的，但动画的方向有时会与物料运输方向相反，且不能保证这条具体连接正被下一班实际消耗。
- 设备原有已审核的 AVIF 缩略图和工坊背景保留；它们不是本次新绘制的正式高清设备 CG，不应在验收中冒充新的美术资产。

## Polish（已写入源码，CI 状态单独验收）

1. `v2/src/workshop-machine-effects.ts`：每台设备复用一个无交互 Pixi 容器、双光环、柔光层和 7 枚不同形状的粒子。水汽泵有带高光的透明水泡；孢子温室用细叶形漂浮孢子；晶核熔炉用尖锐的暖色火星。对象创建在场景同步时完成，ticker 只修改位置、透明度、缩放和旋转，不每帧重建 Graphics。
2. `v2/src/workshop-machine-presentation.ts`：把 `idle / blocked / startup / working / output` 映射到可单测的动效强度。停工或缺料绝不出现产出粒子；关闭动效时停止粒子且保留低亮静态状态提示，阻塞警告继续可读。
3. `v2/src/workshop-lab-stage.ts`：保留真实机器和管线贴图；动态能量流只显示 `projectMachineProduction()` 预测将发生的消耗，从实际供应机器向接收设备移动，而不是按地块编号任意流动。
4. `e2e/workshop-dock-clearance.spec.ts`：新增一个真正布置并派工的完整产线存档，验证路线为水汽泵 06→温室 07→熔炉 08（内部索引 5→6→7）、动效状态、不会被绘制修改的存档，以及禁止动效后的静态状态。保留 PC 与手机的老布局断言，并截取 `visual-evidence/workshop/desktop-workshop-working-effects-1440.png` 供人工审核。
5. 新增 `tests/workshop-machine-presentation.vitest.test.ts` 验证减弱动效、真实消耗条件和逆索引管路方向。更新 Desktop Visual Review 的触发路径：以后修改 Pixi 设备效果也会自动触发浏览器视觉审查。

## 验收门槛与遗留

- 必须通过 Quality（含 Vitest、TypeScript、Pixi 独立编译）、Desktop Visual Review、GitHub Pages 部署，且截图中不能出现设备/人物遮挡或未加载图片。
- 不把新增粒子数宣称为新机器原画；正式高清水汽泵 / 温室 / 熔炉 CG，需要单独素材制作、审查尺寸与透明边缘、再替换真实素材。
- 后续再评估设备动态部件贴图（液位、叶片、熔炉炉膛）、轻量 Pixi Shader 与机器开工/缺料过渡。不要在本轮引入不必要的特效库，也不要使用 Sparkles 图标。
