# 月纱「月蚀」候选身份修复 · 2026-11-21

> 状态：**仅 QA 候选，未通过人工美术审核，也不是正式 CG**。本次只替换候选图，正式 `status` 继续为 `portrait`。

## 修复原因

旧 `public/art/beauty-beasts/characters/yuesha/cg-eclipse-candidate.webp` 描绘黑发、双角的人物，与项目锁定的**银白长发、赤瞳、黑金蔷薇王冠、酒红黑蕾丝礼服**的 V3 月纱不一致。原文件仍可从 Git 历史和旧 Blob `837affd9f7255fd30603e79c80c204ea1cdb046e` 查阅，本次不将其作为游戏中的现行月纱候选。

身份审核依据：`public/art/yuesha-portrait-v3.webp`；正式审批应继续交叉比对头像 `public/art/yuesha-avatar-v3.webp`，不得直接把旧的黑发带角 `characters/yuesha/face.webp` 当作基准。

## 本次 WebP 候选

| 属性 | 值 |
| --- | --- |
| 路径 | `public/art/beauty-beasts/characters/yuesha/cg-eclipse-candidate.webp` |
| 生成方式 | OpenAI 图像生成，独立单幅绘景，2026-11-21 |
| 原始 PNG / WebP 像素 | 1086 × 1448 / 1086 × 1448 |
| WebP 大小 | 420468 bytes |
| SHA-256 | `c82a0226df6b4f78bcf821dd86a385f8446ecf1319e7aecb3b895d20ea1d69c1` |
| Git Blob SHA-1 | `89e29f811e6eb41874c4c8f2419ebd2a1e797362` |
| 视觉主题 | 银发、红瞳、蔷薇王冠、血月、酒红黑金哥特宫殿 |
| 画布原生尺寸 >=1536×2048 | **否** |
| 是否有人审阅正式构图 / 身份 | **否** |
| 生产入库及正式卡面 | **否** |

该图保留人物全身及鞋部，环境和人物在单张原画中完成，未嵌入游戏按钮、品阶、卡片文字。**仍须审查面部五官、耳形、手指、窄卡裁切和不同设备上的表现**，不能仅凭描述判断已经合格。

## 审核门槛未放松

- 本次更新 `cg-manifest.json` 的 **`previewSha256`**，只为使已选中的候选预览校验通过；`status: portrait` 和 `previewPath` 不变。
- 当前 `scripts/audit-character-cg.mjs` 的预览门槛为原生至少 960×1280；本候选符合预览所需像素，但仍低于 `inspectCharacterCg` 正式晋级门槛 1536×2048。
- 若要正式晋级，需要重新创作原生达到目标像素的全身 CG，经 `pnpm art:cg:review`、三种真实浏览器视口 1440×900 / 1648×928 / 390×844 检查、版权与真人审核记录、`pnpm art:cg:promote` 和 CI，不能将软件放大当作原生分辨率。
- 未修改抽卡概率、存档逻辑和其他四张卡的美术文件。
