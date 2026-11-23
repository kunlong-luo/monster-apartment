# R12.12 · S06 晶核仓库独立手机原画入库（review）

> 2026-11-23 · 对应 [R12.7 台账](R12-07-ASSET-REBUILD-BACKLOG.csv) 的 **ART-S06-M**。这是游戏 `/warehouse/` 的**独立生成竖屏背景**，不是裁切横版仓库图；原始 PNG 和 WebP 的**真实 Git 二进制已提交**到项目审稿目录。本记录不是生产 CG 的签审单。

## 可核对的实物

| 项目 | 实测与仓库位置 |
| --- | --- |
| 原始 PNG | [warehouse-mobile-v1.png](../../art-sources/review/2026-11-23/warehouse-mobile-v1.png)，**941×1672**，2,889,158 bytes |
| 浏览器预览 WebP | [warehouse-mobile-v1.webp](../../public/art/world-scenes/review/2026-11-23/warehouse-mobile-v1.webp)，**941×1672**，419,522 bytes |
| 原图 SHA-256 | `2261ffccb6021b7065ddd95abb722ecd7fbd29b185ce3a3cda191f6aa39df6b9` |
| WebP SHA-256 | `c9d00ff314c86aa6c600ae1c55f2c36c723a2b9c86286b71f44a349fd22f8e7c` |
| Git PNG blob | `b6ccb601c29e6de49e2c5bb111c8d27a30fe41d4` |
| Git WebP blob | `3e5173ddb694da83274b71043b8be91a5c018449` |
| 规范最低原生尺寸 | **1080×1920**，本稿 **未达到**。禁止以插值放大伪装原生 |
| 美术状态 | `research-review`；human review=false / rights review=false / DPR real browser review=false |
| 游戏生产入口 | 仍为 `public/art/world-scenes/r12/warehouse-mobile.webp`（未创建或晋级） |
| 游戏逻辑 | 没有修改已有仓库业务、库存、热点或存档 |

## 当前可保留的设计

远处蓝月花窗与高大书柜形成仓储空间纵深；主体使用**晶核货架、月光轨道吊车、晶核运输车和右侧机械萃取罐**；黄铜结构、青紫水晶与冷蓝光区别于红色委托所。这是具备仓储功能的独立竖屏环境，避免重复使用旧大厅图，也不在画内烘焙 UI、按钮或游戏数值。

## 明确不能晋级的事项

- 原生 941×1672 小于既有 S06 生产门槛 1080×1920。WebP 虽可高质量解码，**不能代替原生大尺寸画稿**；后续需新绘或具备真实新细节的原生导出。
- 还未完成品牌/项目角色风格一致性、原始生成/商用许可与具名人审，也没有 390×844 / 390×550 DPR2 的**真实游戏页面截图**；无人工批准即不应更改 `r12-scene-manifest.json` 的 `warehouse.status`。
- 手机实际订单/库存 HUD 和晶核运输热点区域尚未实机交互验证；不得宣称这张图目前玩家已经在 `/warehouse/` 看见。
- [旧版独立桌面画稿](R12-11-WAREHOUSE-DESKTOP-REVIEW-2026-11-22.md) 也仍为 1672×941 review，等待原生更高分辨率。

## 可复现的入库验证

`docs/art-reviews/R12-09-REVIEW-ASSETS-2026-11-22.json` 加入 `ART-S06-M` 的完整源图/导出图文件长度、真实 PNG/WebP 像素与 SHA-256，`pnpm audit:r12-review-art` 应随 Quality 检查这两张实际二进制文件。所有资源维持 `productionApproved=false`。下一轮有机会补 S06 原生高清时，请另建 v2 候选，不覆盖本稿的 source 或捏造人工审批。

## 生产顺序

先借此组做双端画面差异对照和交互热点复核；若正式项目要解决高 DPI 模糊，应重新制作满足真实原生像素门槛的**PC 和手机双图**，交由美术审核后再依 R12 机制逐一批准。继续按 [全站重制清单](R12-07-ASSET-REBUILD-AUDIT-2026-11-22.md) 推进 S02 六门中庭和其余高优先级角色。
