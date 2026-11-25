# Web 美术资源入口（R12.94 用途核查）

唯一完整资产清单、用途分类、清理条件及命名规则见 [美术资源总目录](../../docs/ART-RESOURCE-CATALOG.md)，尤其第 4.1 节和第 5 节。本页只说明目录职责，不维护第二份库存。当前游戏 V3.109.0；“运行中”不代表 production 人审通过。

| 路径（相对于本目录） | 用途与处理 |
| --- | --- |
| `a05/` | 图鉴装饰与粒子，保留 |
| `beauty-beasts/characters/` | 头像、当前候选卡、动作研究；按总目录分类，不整体删除 |
| `beauty-beasts/cover/` | 双端欢迎封面与故障回退，保留 |
| `feature-postcards/` | 大厅两张地点入口海报，保留 |
| `lobby-hero-v4*.webp` | PC/手机大厅正常背景，保留 |
| `lobby-hero-v3.webp`、`lobby-hero-v2.webp` | 旧公寓/世界背景与 Pixi 回退链，保留 |
| `yuesha-*-v3.webp` | 当前注册头像、立绘和半身像，保留 |
| `yuesha-*-v2.webp` | 退役候选，完成全引用核查后删除或以 Git 历史追溯 |
| `rooms/` | 故事概念背景、正常观景背景与站姿、审稿清单，保留 |
| `room-review/` | 显式月纱研究预览仍有调用，保留 |
| `world-scenes/` | 地点正常背景、回退、显式交互审稿与未选研究稿，分别管理 |

9 个 JSON 均为来源/审稿/准入记录或运行 manifest；2 个 Markdown 为本入口和私室准入说明。不要把研究或来源记录当成可随意删的图片。正常使用的 `review/` 图保留并记录角色，纯离线研究图只有完成引用迁移才移出 public；未入 Git 的新原画不在此目录创建占位文件。

源 PNG 放在 [art-sources](../../art-sources/)，历史审稿资料放在 [docs/art-reviews](../../docs/art-reviews/)，设备侧车贴图放在 [engine/art](../../engine/art/)。原 `public/art/README.md` 的 V2/V3、V3.79 身份及 V3.88–89 来源历史见 [固定历史版本](https://github.com/kunlong-luo/monster-apartment/blob/329cbdec70273a91f788f8de18689bdde4e7cac8/public/art/README.md)，不再将早期银发/黑发身份叙述当作现行资产事实。
