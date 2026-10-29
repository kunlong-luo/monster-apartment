# V3.9 · 收藏级私室美术：背景/人物分阶段准入

## 目标与真实边界

正式场景不仅要细腻，还必须保留可读的交互物件和足够的角色留白。与 V3.8 不同，manifest v2 拆分 `backgroundStatus` 和 `residentStatus`，允许一间房的高清背景先验收上线，而人物仍沿用独立的概念期展示层，反之亦然。未通过审核的层仍标记 concept，严禁直接把现有 SVG 当作收藏级 CG。

## 第一批交付顺序

1. 月纱会客室无人物室内绘景（建议 2560×1440、至少 1920×1080）和 390px / 1440px 截图。窗口、茶具、蜡封、账本均要在适当位置；右侧留人物空间，不将文字与 UI 烘焙入图。
2. 月纱角色四种透明姿态（idle、attentive、warm、guarded）须保持相同原点、画布、脚点、光照方向，并检测白边、手部结构和剪切边缘。
3. 泉泡铜管休息室 / 青枝叶影温室 / 炽角炉火修补间依次执行同样的背景和角色双轨审核。四间色彩、材质、陈设须有明显区分，但采用统一镜头高度。
4. 每张背景必须与 `room-stage-layout.ts` 中的 3 个场景物件对齐；每个姿态必须与 `room-performance.ts` 的状态切换对应。移动端热点不能溢出或覆盖底部对话。
5. 人工审核通过后，才更新对应房间的一项状态；只有背景与人物**均为 production**，`composition` 才允许从 `layered-concept` 升级为 `separated`。

## 四间房绘景差异

| 房间 | 场景主体与材质 | 推荐氛围 | 必须留在画面中的调查物件 |
| --- | --- | --- | --- |
| 月纱 · 契约会客室 | 紫金丝绒、哥特拱形月窗、古旧契约桌与木书架 | 冷月光配暖烛光；精致、神秘 | 月纹蜡封、香料茶杯、旧账簿 |
| 泉泡 · 铜管休息间 | 黄铜管路、蓝色水光、仪表与工具台 | 湿润蓝青色、点缀铜金 | 工具箱、压力表、小铜铃 |
| 青枝 · 叶影温室 | 月光玻璃、藤蔓与花架、植被层次 | 冷月光与绿色透射 | 花期手札、月光花、水脉图 |
| 炽角 · 炉火修补间 | 炉砖、金属齿轮、工具架与锻台 | 暖铜、炉光、低饱和阴影 | 锻锤、稳定器草图、旧物匣 |

## 资产契约

- `public/art/rooms/{id}/background.webp`，sRGB；不得包含人物、按钮、数字、台词、假热点或其他场景的合成层。
- `public/art/rooms/{id}/poses/{pose}.webp`，透明 RGBA；四姿态同一画布，脚点一致。眨眼、张嘴、动作循环**不等于**四姿态，未制作逐帧素材前不可宣传为动画帧。
- `public/art/rooms/{id}/provenance.json`，人工填写 `original`、`commercialUse`、`reviewer`、`reviewNotes`；背景须填写 `noBakedUI`、`noBakedCharacterInBackground`；人物须填写 `noBakedBackgroundInResident`、`sameFootAnchor`、`transparentEdgesReviewed`，检查通过时才设为 true。
- 生产背景必须先标定 `layout=reviewed`；请以浏览器实际裁切比例对每个热点做桌面和手机验收。只验证格式、宽高及 Alpha 标记不足以判断美术品质。

## 无回归约束

角色对话、情绪映射、调查线索、存档、工匠值守状态及经济系统不能因更换资源改变。CI 必须通过 `pnpm audit:room-art`、`pnpm typecheck`、`pnpm test`、`pnpm build` 和 Playwright 桌面/移动测试。所有资产质量必须如实标注概念/正式；不要在尚未完成绘景与透明帧之前承诺 CG 已经上线。
