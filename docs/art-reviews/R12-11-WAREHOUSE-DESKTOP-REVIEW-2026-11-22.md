# R12.11 · S06 晶核仓库独立桌面绘景 · 已入 Git 审稿目录

> 日期：2026-11-22。对应全站美术重制任务 **ART-S06-D**；不是线上正式场景。这次明确**将真实 PNG 和 WebP 二进制直接提交**到 GitHub 项目的 review 路径，与前几轮“只有附件、未入库”的问题不同。

## 新图与实际像素

| 项目 | 实测 |
| --- | --- |
| 游戏位置 | `/warehouse/` · S06 |
| 内容 | 蓝紫月光仓储空间；独立晶核货架、封装箱、黄铜起重轨道、吊钩货箱、运输车、盘点桌与门廊 |
| 原始 PNG | [仓库真实原图](../../art-sources/review/2026-11-22/warehouse-desktop-v1.png) · **1672×941** |
| WebP 审稿 | [仓库浏览器预览](../../public/art/world-scenes/review/2026-11-22/warehouse-desktop-v1.webp) · **1672×941**, 387,164 bytes |
| PNG SHA-256 | `6a2f5a55beedd77549b3d81963c642c00450014ef965571163cabb71413375a1` |
| WebP SHA-256 | `23f4fb92db8d9fcd7294b356c526ab975d37f6878b773861ea574db107d5abf4` |
| PNG Git blob SHA | `fe8be9159795d02c6317cb34ad60017256058d7c` |
| WebP Git blob SHA | `2c823339e8b32e0f3367386cca6c1066f6233e56` |
| 真实 Git 入库 | **已入库（review 目录），可从 GitHub 直接打开** |
| 生产入库 | **未晋级**；场景原生尺寸低于 2560×1440，human review、rights review、真实浏览器/高 DPR 验收未完成 |
| 手机独立场景 | **未交付**。生成尝试出现了带虚构数据的 UI 海报，已拒绝，不入库 |

仓库资源 JSON [R12.9 shared review manifest](R12-09-REVIEW-ASSETS-2026-11-22.json) 已新增 `ART-S06-D`，包含真实 PNG 和 WebP 字节长度、像素及 SHA-256。新素材会与现有 S05 和青枝候选一起接受 `pnpm audit:r12-review-art`，不修改线上场景路径 `public/art/world-scenes/r12/warehouse-desktop.webp` 或正式场景 manifest。

## 方向和下一步

本图有真实仓储逻辑：上层重型储物架、下层晶核货柜、吊装机和盘点台，以冷蓝月光、紫色晶核与黄铜结构同 S05 红月契约大厅区分。这是**原画构图样本**，美术师应继续校正左右面板的内容安全区、仓库交易/盘点操作焦点以及移动版独立视野。

未满足的主要门槛：原生大图 2560×1440+；移动端独立 1080×1920+；人工版权/美术审查；实际 `1440×900`、`1648×928 DPR2`、`390×844` 等游戏页面截图。审核全部完成之前不允许人工把 `r12-scene-manifest.json` 的 warehouse status 标成 production，也不能承诺玩家已经看到新图。

后续可从**原生高清**制作目标开始（而非把本张 1672×941 插值放大），优先做 S06 独立手机版，再按 P0 队列推进 S02 六门公寓中庭。
