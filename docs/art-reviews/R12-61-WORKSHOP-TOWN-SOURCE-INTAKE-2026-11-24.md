# R12.61 · 工坊与月光街原画接入准备

基线 V3.103.0 main `39138900aa5fce15cb252e76c421e0cdb962b50b` 已通过 Quality 45367162750 / Pages 45367299176。V3.104.0 房间观景提交 0bfe40eec4a416e63cd094da6822fcb15f976880 已恢复为 PR [#56](https://github.com/kunlong-luo/monster-apartment/pull/56)，正在验收；本分支独立自 main，不修改 PR #56 或正式游戏。

## 实际原图（全部为横版）

四份 PNG 已在 R12.53 完成真实解码，来源与 Git blob/SHA-256 由 source-catalog 和 r12-53-transition-manifest 双重记录。本次保留原图、不插值、不伪装为独立手机稿，生成四份同像素 WebP 待实际目视选择。

| 地点 | 源文件 | 实际尺寸 |
| --- | --- | --- |
| 工坊 | art-sources/scenes/workshop/desktop-candidate-v1.png | 1672×941 |
| 工坊 | art-sources/scenes/workshop/desktop-candidate-v2.png | 1670×941 |
| 月光街 | art-sources/scenes/town/desktop-candidate-v1.png | 1672×941 |
| 月光街 | art-sources/scenes/town/desktop-candidate-v2.png | 1671×941 |

输出在 public/art/world-scenes/{workshop,town}/review/，统一 desktop-candidate-v1/v2.webp；机器清单 r12-61-workshop-town-review.json 记录原始像素、哈希、文件大小及候选状态。Pillow 实际解码原始 PNG 与输出 WebP 并校验原像素不变。转换工作流只写候选分支。当前未确认实际输出或目视优胜方案，不声称上线或晋级。

## 工坊代码实际架构与替换范围

- WorkshopClient 外层世界背景、WorkshopCinematicStage PC 三主设备全景、Pixi loadWorkshopPaintedArt 均使用 workshop-gothic-hall.webp，不能只替换一个 CSS 背景就宣称整个工坊重制。
- 1100×730 以上才默认进入全景；建设、派工、移动以及手机仍用 15 格精密 Pixi 棋盘。必须保持真实机器点击、选中地块、排班、库存、生产投影与材质回退。原生背景存在预绘设备时不得将它们伪装成可操作机器。
- 先从转换结果中目视选择空间更开阔、真实设备更少遮挡的一张；在真实 PC 画面检查三主设备、生产状态及选中面板。之后同步外层和 Pixi 路径及回退证据，保留原布局和生命周期，不用 CSS 插值冒充 4K。
- 月光街由 WorldTown 的 ReliableImage 加载背景，三入口是独立真实链接、不是建筑像素热点。选择正确街区画作并测试三个路由、居民交易；不把旧点击坐标套给新建筑。
- 当前没有独立手机工坊或街景原画。旧手机背景/棋盘仍保留。正式高分辨率、权利、人审门禁不变；先走可回退的过渡视觉，正式晋级另行记录。

后续以实际 WebP 输出及截图决定择优和正式接入，不删除两份候选中尚未选择的原图。
