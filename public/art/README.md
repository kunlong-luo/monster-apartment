# Web 美术资源入口（R12.98 PC 场景路径）

唯一完整资产清单、用途分类、清理条件及命名规则见 [美术资源总目录](../../docs/ART-RESOURCE-CATALOG.md)，尤其第 4.1 节和第 5 节。本页只说明目录职责，不维护第二份库存。当前游戏 V3.109.0；“运行中”不代表 production 人审通过。

| 路径（相对于本目录） | 用途与处理 |
| --- | --- |
| `decorations/` | 图鉴装饰与粒子，保留 |
| `beauty-beasts/characters/` | 头像、当前候选卡；离线动作研究已迁出 |
| `beauty-beasts/cover/` | 双端欢迎封面与故障回退，保留 |
| `postcards/` | 大厅两张地点入口海报，保留 |
| `lobby-hero-v4*.webp` | PC/手机大厅正常背景，保留 |
| `lobby-hero-v3.webp`、`lobby-hero-v2.webp` | 旧公寓/世界背景与 Pixi 回退链，保留 |
| `yuesha-*-v3.webp` | 当前注册头像、立绘和半身像，保留 |
| `rooms/` | 故事概念背景、正常观景背景与站姿、审稿清单，保留 |
| `room-review/` | 显式月纱研究预览仍有调用，保留 |
| `world-scenes/` | 地点正常背景、回退、显式交互审稿；两张 PC 过渡图已归入地点目录，未选研究稿已迁出 |

现有 43 张公开媒体；10 张离线研究已迁到 [文档研究图](../../docs/art-reviews/sources/)，3 张旧月纱肖像已退役。9 个 JSON 均为来源/审稿/准入记录或运行 manifest；2 个 Markdown 为本入口和私室准入说明。不要把研究或来源记录当成可随意删的图片。正常使用的 `review/` 图保留并记录角色，纯离线研究图只有完成引用迁移才移出 public；未入 Git 的新原画不在此目录创建占位文件。

源 PNG 放在 [art-sources](../../art-sources/)，历史审稿资料放在 [docs/art-reviews](../../docs/art-reviews/)，设备侧车贴图放在 [engine/art](../../engine/art/)。原 `public/art/README.md` 的 V2/V3、V3.79 身份及 V3.88–89 来源历史见 [固定历史版本](https://github.com/kunlong-luo/monster-apartment/blob/329cbdec70273a91f788f8de18689bdde4e7cac8/public/art/README.md)，不再将早期银发/黑发身份叙述当作现行资产事实。

R12.96：图鉴装饰与入口海报分别使用 decorations/ 与 postcards/，来源清单随目录原字节迁移。A05 是历史视觉验收编号，不再是运行资源目录名。

R12.97：将 public/art 顶层业务目录与现存根文件纳入现有 `pnpm audit:repository-layout` 门禁；旧 a05、feature-postcards、任意未登记顶层目录或根文件均失败。新用途必须同步更新资源目录、public/art 入口和门禁；现存角色、封面、房间、场景及回退路径不动。下一批优先核对正常 PC 场景 review 路径，未完成完整引用扫描前不迁移或删除；暂缓批量生成新美术。

R12.98：将正常 PC 工坊、月光街两张过渡 WebP 由各自 review/ 移入地点目录，命名 workshop-desktop-transition.webp、town-desktop-transition.webp；原 Git blob、原始 PNG、四候选 SHA-256、尺寸、review-only 状态及未选研究图不变。同步两处页面导入、两处真实浏览器断言、生成器、审核器及资源清单。旧路径不再保留副本；手机背景、故障回退、正式场景准入、存档不变。公开媒体仍 43、全仓 141；新提交 Quality、桌面浏览器及 Pages 须独立核验。暂缓批量新美术；下一批审查角色与欢迎封面目录。
