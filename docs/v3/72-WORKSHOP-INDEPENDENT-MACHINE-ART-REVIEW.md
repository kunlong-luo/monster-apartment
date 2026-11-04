# V3.72 · 三台独立设备的九级结构稿与安全预览

**日期：2026-11-04。** 本轮承接 V3.71 成功的 Quality / Desktop Visual Review / Pages 正式基线。重点是独立机器画质，而不是叠加更多 SVG/CSS/Pixi 几何特效。

## 做出的真实工作

- 依照工坊固定 512×512 透明画布，为水汽泵、孢子温室、晶核熔炉各制作三张 **Lv.1/Lv.2/Lv.3** 结构候选稿。不同设备有独立轮廓：水汽泵有玻璃储液罐、活塞与调压阀；温室有哥特玻璃穹顶、植物与月光导管；晶核熔炉有紫黑炉体、黄铜火膛与晶簇。升级增加真实部件而不是只换颜色。
- 统一可重现的源代码：`v2/scripts/prepare-machine-art.mjs`。使用独立的离线 SVG 绘画描述 + 固定版本 `sharp@0.35.5` 在构建阶段输出 512×512 透明 WebP；**游戏运行时只请求 WebP，不渲染 SVG 元素**。当前仍属结构美术候选，离正式电影级 CG 有距离，不能在文档里宣称已完成最终原画。
- `v2/art/asset-pack.v1.json` 只把九个单体设备的 `status` 由 `pending` 改为 `review`，四帧工作态图集和其他独立角色 CG 仍 `pending`。不得将这批候选自动认定为正式 `ready`。
- `v2/scripts/audit-art.mjs`：构建前验证 review / ready 图像实际存在、满足原有最小字节数、尺寸精确且为含 Alpha 的 WebP；禁止将 UI 截图裁切成机器贴图。
- `v2/scripts/build.mjs`：打包时把候选文件放在独立的 `review/machines/{kind}/lv{level}.webp`，与现有 `production/machines/...` 完全分开，并在 `machine-art-index.json` 里显式声明。没有获准的正式素材依然维持老游戏画面。
- `v2/src/workshop-painted-art.ts`：玩家访问工坊并携带明确 URL 参数 `machine-art=review` 时，才使用 review 索引加载 WebP；普通访问只使用 `production` 索引、继续展示稳定的旧审核贴图。只加载严格列举的九个路径；解码失败继续回退，不能无限请求。
- `e2e/workshop-dock-clearance.spec.ts`：真实 PC 1440×900 和手机 390×844 打开预览、核对机器绘制与正常页面回退、存档不变，截图分别存到 `visual-evidence/workshop/desktop-machine-art-review-1440.png` / `mobile-machine-art-review-390.png`。无新增按钮、无改变自动生产、委托和路由。

## 评审入口

- **正式稳定工坊**：https://kunlong-luo.github.io/monster-apartment/workshop/
- **候选设备真实场景预览**：https://kunlong-luo.github.io/monster-apartment/workshop/?machine-art=review
- **评分方式**：比较机体轮廓、透明背景边缘、三档等级结构、人体遮挡、与哥特大厅 CG 的艺术一致性。不能因为 CI 通过就假装审美已经获得用户批准。

## 后续判定

本轮候选若仍然偏图标化，应继续打磨材质、透视、磨损、笔触与结构，而不是立即改为 `ready`。正式交付仍应包含每台设备的 512×512 透明 CG 和匹配的 2048×512 四帧机械工作态图集。通过人工视觉审核并完成许可证明后，才逐项升为 `ready`，让正常页面自动优先使用正式 WebP。

**开发约束**：坚持主分支、成熟稳定库、可复用组件、明确路由、PC 与手机同等验收；禁用 Sparkles 图标。保留已有 Pixi 生产状态、单一存档与动画设置。
