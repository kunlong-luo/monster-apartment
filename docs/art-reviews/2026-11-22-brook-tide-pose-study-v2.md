# 泉泡·潮汐身份修订 v2 · 单人动作研究稿（未批准）

> 2026-11-22：**仅 pose-study / research-only**。此次把泉泡旧版的尖精灵耳与饱和蓝发修正为既有头像要求的蓝色毛绒兽耳、银白浅蓝发，并保留独立踏浪与三叉戟动作；没有使用拼版裁切，也没有改游戏运行时预览或正式卡面。

| 字段 | 当前 v2 |
| --- | --- |
| 角色卡位 | `brook-tide` |
| 新研究稿路径 | `public/art/beauty-beasts/characters/brook/cg-tide-pose-study-v2.webp` |
| 原始 PNG / WebP 原生尺寸 | 1086×1448 / 1086×1448 |
| 导出格式 | WebP quality 93，563050 B |
| WebP SHA-256 | `dbb1e0d09c09bb948ea0bedbf474dfeda25ffdb13060a42db063c6b55279dacb` |
| WebP Git Blob SHA-1 | `8a9f98b31eab9e9376291132642292c9399d150a` |
| 原始 PNG SHA-256 | `714536fa0ac82b5f07f223bdc7756b535b19f109e7d9b770376035ca6d5ceabf` |
| 旧研究稿 | `brook/cg-tide-pose-study-v1.webp`；仍在 Git 历史与研究目录，无覆盖 |
| 来源 | OpenAI 图像生成，2026-11-22 |
| 美术/授权人工审核 | **尚未签署** |
| 生产状态 | `portrait`，**未晋级** |

## 与锁定头像相比的修订

1. **耳型**：旧踏浪图把泉泡变成长尖精灵耳；v2 的两只蓝色毛绒兽耳长在头顶，并带白色内耳，与 `public/art/beauty-beasts/characters/brook/face.webp` 的核心识别锚点更接近。
2. **发色**：旧图饱和蓝发过重；v2 使用偏银白浅蓝长发与柔和蓝色渐层。
3. **动态剪影**：延续单腿踏浪、S 形转体、三叉戟与水环；区别于月纱持镰/坐姿、青枝侧拉藤弓和炽角低重心锁链镰。
4. **服装与场景**：珍珠白蓝系多层水纱、水晶宝石与月夜潮汐宫殿；保留水属性视觉身份，不复制其他角色礼服或甲胄。

## 仍未通过，不能直接替换卡面

- 源图只有 **1086×1448**，低于正式 CG 最少原生 **1536×2048**；插值放大不算通过。
- 头顶兽耳与三叉戟顶部接近画幅上缘；仍需 3:4 contain、窄卡 cover 以及三种浏览器视口（1440×900、1648×928、390×844）的安全边距审查。
- 原角色的**颧骨/眼距/鼻梁/口唇**一致性，以及握戟手指、脚与水的接触、膝盖透视尚未由真人对照签字。
- 尚无权利确认/正式 reviewer 签字。此资源不得进入 `cg-tide.webp` 或改 `cg-manifest.json` 的 `status`；现有 `cg-tide-candidate.webp` 暂保留，避免未经批准直接改变线上美术。

## 审核材料

- 全五卡动作与面部对照：`docs/art-reviews/pose-differentiation-five-cards-brook-v2-2026-11-22.webp`（1526×912；SHA-256 `64c3469e8ace7b450b3066e30cffaa49ab96c6f1a9f98cca6f8d5e26cbd1ce00`）。
- 历史 v1 对比：`docs/art-reviews/2026-11-21-brook-tide-pose-study.md`。
- 后续仍需正式原生高分辨率重绘、画面人审、三视口截图及权利签署方能进入 production。
