# R12.10 · 审稿图片真正写入 Git 仓库（2026-11-22）

> 本次已完成 **Git binary 真实入库**，不再是聊天 ZIP 或仅写文档。三张 PNG、三张 WebP 和一张 JPEG 联系表均存于仓库对应的审稿目录，拥有独立 Git blob SHA。审稿状态均为 research-review，productionApproved=false。

## 本次文件与真实 Git blob

| 文件 | 原生大小 | Git blob SHA |
| --- | --- | --- |
| `art-sources/review/2026-11-22/orders-desktop-v1.png` | 1672×941 | `4f5968cc72af4465d610f3eff98fc4c324b8d127` |
| `public/art/world-scenes/review/2026-11-22/orders-desktop-v1.webp` | 1672×941 | `61122e427bcd43eed9e7bce87e21df14f209b6b0` |
| `art-sources/review/2026-11-22/orders-mobile-v1.png` | 941×1672 | `0c1bf9901e493c849acfe6cdb75329e00690a696` |
| `public/art/world-scenes/review/2026-11-22/orders-mobile-v1.webp` | 941×1672 | `d21372731b9a6a20b881a9afa3e1f584cee194c5` |
| `art-sources/review/2026-11-22/fern-spring-bow-v1.png` | 1086×1448 | `2309293fe10fe1788ab8d4c8edeeaf7bca7fd482` |
| `public/art/beauty-beasts/characters/fern/review/cg-spring-bow-v1.webp` | 1086×1448 | `ace0a5dcb21ddffdf8a669880eb0ed21c4223121` |
| `docs/art-reviews/R12-09-ART-CONTACT-SHEET-REVIEW-ONLY.jpg` | 联系表，仅审稿 | `da82adeccbac39cd94ea3a0b8d515b70af675762` |

代码与审核清单：
- `docs/art-reviews/R12-09-REVIEW-ASSETS-2026-11-22.json`：**availableInGit=true / productionApproved=false**，保留原生 PNG 和 WebP 字节数、SHA-256 和像素。
- `scripts/verify-r12-review-assets.mjs`：二进制头、文件字节长度、像素和 SHA-256 强制校验；`pnpm audit:r12-review-art` 已纳入 Quality。
- `docs/art-reviews/R12-07-ASSET-REBUILD-BACKLOG.csv`：三条任务调整为 **REVIEW_ASSETS_IN_MAIN_PENDING_PRODUCTION_QA**。

**禁止误读**：这些文件进入 `public/.../review` 不等于运行时已经使用。S05 桌面/手机均低于正式场景原生像素标准；青枝拉弓 CG 已达原生尺寸要求但身份、握弓、遮挡、艺术/版权人工审核、游戏内真实视口验证仍未完成。任何在 `cg-manifest.json` 或 `r12-scene-manifest.json` 的 production 晋级仍需要独立签审，不能靠本提交触发。

**制作流程修复**：通过临时中转文件将 ChatGPT 生成的原图二进制实际上传成 Git blobs，再核对 Git blob SHA 并在一次原子 commit 内落入已规划路径。后续每张新图必须真实入库后才在文档里写“已在 Git”，临时中转文件不属于项目交付物。
