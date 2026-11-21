# 《怪物公寓》角色 CG 候选验收记录 · 2026-11-21

> **状态：四张候选 WebP 已提交到 GitHub `main`，但仍未获人工美术批准，未满足原生 1536×2048 正式门槛，也未启用生产卡面。**

本次补全四种不同人物设定的独立 3:4 全身候选，不采用多角色拼图裁切。四张候选原生尺寸均为 **1086×1448**，低于 `CHARACTER-CG-ART-DIRECTION.md` 的 **1536×2048 原生像素**最低要求；即使软件放大到更大尺寸，也不能改变其原生创作规格。

| 卡位 | 待同步的候选目标文件 | 原生尺寸 | WebP 大小 | SHA-256 |
| --- | --- | --- | --- | --- |
| `yuesha-vow` | `public/art/beauty-beasts/characters/yuesha/cg-vow-candidate.webp` | 1086×1448 | 400180 B | `cc7ebbe9a66ffc2a92b7c5addb9a4a0638ccb9c3c146e777aaa89fca7afbb7aa` |
| `brook-tide` | `public/art/beauty-beasts/characters/brook/cg-tide-candidate.webp` | 1086×1448 | 523470 B | `d16b47a1d16ef6bb2af26f30bd05157d1b2299e1125dfdd0d92e4fa7845546e8` |
| `fern-spring` | `public/art/beauty-beasts/characters/fern/cg-spring-candidate.webp` | 1086×1448 | 506680 B | `78986c9e58d58a92eb1945011f38bcc183a5f0b890d16528ce1019c7902e37c9` |
| `cinder-ember` | `public/art/beauty-beasts/characters/cinder/cg-ember-candidate.webp` | 1086×1448 | 477194 B | `de43bfc55a389805191b352d730f0ac983ae6d9c940b95edb9b9ca85e2c5ba3b` |

## 身份和原画约束

- **月纱**：银白长发、赤瞳、黑金玫瑰王冠与酒红黑蕾丝礼服，哥特式誓约礼堂；旧 `cg-eclipse-candidate.webp` 使用了与锁定的银发 V3 月纱不同的黑发身份，仍需重绘，不可据旧候选自动晋级。
- **泉泡**：银蓝长发、兽耳、水晶珍珠与月下潮汐宫殿。
- **青枝**：金发、绿瞳、花冠与藤蔓环绕的春日温室。
- **炽角**：红发、魔角、黑金盔甲与熔火工坊。

## 验收及下一步

1. **候选二进制文件已同步**：四张 WebP 于 [5304201595af](https://github.com/kunlong-luo/monster-apartment/commit/5304201595afb3ead5f8b0d0c3d7a7c6ff10654b) 提交至指定 GitHub 路径。Git Blob SHA-1 与本地原图一致，提交后分别核查大小与 Blob SHA；上表记录的是独立的 SHA-256。此步骤仅为候选素材入库，**并非正式美术晋级**。
2. 不以普通放大伪装原生高像素：重新创作真正达到最低 1536×2048 的独立全身 CG；保留正确身份与足部边界。
3. 逐张运行 `pnpm art:cg:review`，核对人物、透明/非透明背景适配、指尖/面部、窄卡裁切和三种真实视口（1440×900、1648×928、390×844）。
4. 人工确认来源/使用许可和上述画面后，签署审核记录，调用 `pnpm art:cg:promote`；然后运行 `pnpm check:design && pnpm test && pnpm build` 并检查发布。
5. **在以上步骤完成前，不修改 `cg-manifest.json` 的 `status: portrait`，不改正式卡面映射、不修改旧月蚀候选文件。**

本次生成素材来自 OpenAI 图像生成，日期 2026-11-21；图片从 PNG 导出为 WebP，未提高其原生尺寸。四张候选已在 `main` 入库，但人工美术审核、授权确认、生产卡位晋级和上线验证仍未完成。
