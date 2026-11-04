# V3.73 · 三台设备四帧工作态动画审核稿

**日期：2026-11-04。范围：** 工坊主分支、PixiJS、PC 1440×900 / 手机 390×844。

## 本轮实际交付

1. `v2/scripts/prepare-machine-working-art.mjs` 使用项目已有的固定版本 Sharp，在九张独立结构审查图生成完毕后，以各自 **Lv.2 静态贴图为固定机壳**合成 4 帧 512×512，打成 2048×512 透明 WebP。不同设备的动画内容不同：水汽泵为内部水位/活塞/气泡，孢子温室为植物叶片与孢子浮游，晶核熔炉为炉火和晶核光强。机壳、底座、画布、脚底锚点不变。
2. 清单 `v2/art/asset-pack.v1.json` 将三条 `machine-animation` 从 `pending` 转为 **`review`**，明确 `level: 2`；九张 Lv.1/2/3 静态结构图继续保留 `review`。**这 12 件均不冒充最终绘画 CG 或已通过美术验收的正式资产**。
3. `v2/scripts/build.mjs` 使独立构建入口先生成静态图与四帧图集，只复制审核中的图集到隔离的 `review/machines/{well,garden,kiln}/working.webp`，通过 `machine-art-index.json.reviewWorking` 暴露。正式 `production` 目录/索引保持独立。
4. `v2/src/workshop-painted-art.ts` 仅在明确 URL 参数 `machine-art=review` 时尝试加载 3 份图集，验证 2048×512 且按四张 512×512 裁切；首次网络或解码失败静默回退既有贴图。普通访问不会请求新审核图集。
5. `v2/src/workshop-lab-stage.ts` 只对**真正可生产**且当前等级**恰好 Lv.2**的机器使用四帧工作态；Lv.1 与 Lv.3 不用 Lv.2 图集冒充高级机型，保留各自正确图像及原机械微动；对系统降低动态效果或玩家关闭动效，动画立即暂停。生产/存档状态原封不动。
6. `v2/scripts/audit-art.mjs` 继续审核全部 WebP 文件头、尺寸、实际 Alpha 和最小大小，并额外校验各图集四帧不完全相同。
7. Playwright 在实际工坊 PC + 手机、正常与预览链接验证三条可生产链，检查动画实例、减少动效模式、存档完全不变以及从预览切回普通模式。截图保存在 `visual-evidence/workshop`。

## 预览与设计判断

正式：https://kunlong-luo.github.io/monster-apartment/workshop/

审核：https://kunlong-luo.github.io/monster-apartment/workshop/?machine-art=review

本轮解决的是**可审核的独立运动素材和正确运行机制**。目前结构图仍偏清晰的矢量风格、缺少最终高端手绘 CG 的复杂材料、笔触及光影。因此下一阶段需以审美为主导，制作真正的哥特庄园透明 CG 与匹配的动画帧，先看真实舞台截图，不可仅因为代码和 CI 通过就把审查图升为 `ready`。

坚持原始 PC 参考布局、完整场景优先、小型交互控件、不用 Sparkles 图标、不引入重复 Dock、不重写游戏经济。
