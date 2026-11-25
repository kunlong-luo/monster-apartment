# 执行清单：补全角色 CG 并统一到 Gothic_Moonlit_Summoning_Screen 风格

> 此文件可直接复制给 AI 图像生成工具（如 chatgpt + 图像生成）执行。

## 1. 视觉参考
- 参考图：`public/assets/aistudio/Gothic_Moonlit_Summoning_Screen_8181b3a5.png`
- 风格：红黑金哥特月蚀、深酒红背景、金色镀金边框、烛光氛围、成熟女性主角、无 UI 文字、无按钮、无水印

## 2. 需生成的 4 张缺失图片

| 序号 | 角色 | 内部 ID | 目标文件路径 | 契约卡 | 提示词重点 |
|---|---|---|---|---|---|
| 1 | 泉泡 | brook | `public/art/characters/brook/cg-tide-candidate.webp` | brook-tide | 银色冷金波浪长发，蓝灰杏圆眼，心形脸，薄纱盔甲，皎月冷光，侧脸轻笑 |
| 2 | 青枝 | fern | `public/art/characters/fern/cg-spring-candidate.webp` | fern-spring | 赤铜红卷发，绿色猫眼，菱形脸，精灵耳，藤蔓礼服，抬手施法，荆棘花开 |
| 3 | 炽角 | cinder | `public/art/characters/cinder/cg-ember-candidate.webp` | cinder-ember | 深赤棕马尾，琥珀眼，方椭圆脸，左眉伤疤，锻造衣，金属角，锻炉热光 |
| 4 | 月纱（誓约） | yuesha | `public/art/characters/yuesha/cg-vow-candidate.webp` | yuesha-vow | 长黑发酒红冷光，红黑金蔷薇冠，鹅蛋脸，上挑眼，束腰礼服，红月王座 |

## 3. 通用生成要求（Negative + Positive）

**负面提示词：**
```
文字，UI，按钮，开始游戏，单抽，十连，概率，水印，签名，LOGO，子图，拼接，低分辨率，模糊，畸形手指，多指，肢体扭曲，同一张脸换色，幼态，卡通，写实照片，3D 渲染，塑料感，重复图案，毛玻璃，渐变色块，平铺仪表盘，闪光星，Sparkles，emoji
```

**正面前缀（每条提示词都加）：**
```
哥特月蚀风格，红黑金配色，深酒红背景，烛光点缀，金色镀金边框，哥特建筑剪影，红玫瑰，月光，成年女性，精致面容，不同脸型骨相，高级质感，电影式灯光，8K，无文字，无 UI，无按钮，透明背景或纯色背景，WebP 格式，1024x1536，竖构图
```

## 4. 生成后的前端验收（交给开发）

- [ ] 4 个文件放入对应 `public/art/characters/{id}/` 目录
- [ ] 文件命名严格为 `cg-{card-key}-candidate.webp`
- [ ] 分辨率 ≥ 1024×1536，WebP，透明或纯色背景
- [ ] 无画内文字、无 UI、无按钮、无水印
- [ ] 四人去发色后骨相可辨，无同脸换色
- [ ] 无手指/肢体畸形、无透明边缘瑕疵
- [ ] 更新 `cg-manifest.json`：将 4 条 `previewSha256` 从 `"PENDING"` 替换为实际 SHA-256
- [ ] 运行 `pnpm check:design` + TypeScript + Next 构建，无错误
- [ ] 1440×900、1648×928、390×844 三种视口真实浏览器截图验收

## 5. 代码端已就绪，无需改动

`src/components/summon/heroine-portrait-assets.ts` 中 `CARD_PREVIEW_PATHS` 已预留全部 5 张卡的路径，只需放入图片并更新 manifest 即可生效。

R12.99 第二批：将 beauty-beasts/characters/ 的 3 张头像、3 张候选 CG 原 Git blob 迁入 public/art/characters/<id>/，同时迁移 cg-manifest.json 并更新五卡正式/预览槽、运行注册、CG 审核/晋级/生成、源图映射、测试及现行 SOP。beauty-beasts/ 整个公开历史目录退役，门禁登记 characters 并拒绝旧目录回流。月纱根目录三张 V3 肖像仍留待 R12.101；泉泡/炽角继续共享 rooms 下站姿，不重建两张重复候选。五卡仍 portrait（0/5 production），现行原画、哈希、身份、抽卡、存档、回退不变。固定历史 SHA URL、历史清单与 legacyOutput 保留旧路径。43 公开媒体、141 全仓媒体不变；新 SHA 的 Quality、真实浏览器及 Pages 独立验收。暂缓批量新美术；下一阶段 R12.100 核查房间正常观景与显式研究图路径。
