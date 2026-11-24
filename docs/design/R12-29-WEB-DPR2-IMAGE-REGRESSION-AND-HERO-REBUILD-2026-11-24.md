# R12.29 · PC Web 图鉴定位纠错与大厅 DPR2 真像素检查（2026-11-24）

> **已修改真实仓库测试与 Desktop Visual Review 工作流；未生成、上传或替换新的大厅高清原图。** 首页与公寓的独立原生绘景仍是生产阶段 P0。本文将 Quality / 浏览器测试 / 人工画质审核 / Pages 明确区分，不把「构建成功」称为「美术完成」。

承接 [R12.27 图鉴 DPR2](R12-27-PC-WEB-ART-PIXEL-BUDGET-2026-11-24.md) · [R12.28 Web 深链验收](R12-28-WEB-ROOM-REVIEW-DEEPLINK-AND-REGRESSION-2026-11-24.md) · [2026-11-14 全路由像素证据](../art-reviews/R12-01-REAL-BROWSER-PIXEL-EVIDENCE.md)。关联 [Issue #24 模糊图片](https://github.com/kunlong-luo/monster-apartment/issues/24)、[Issue #16 独立场景](https://github.com/kunlong-luo/monster-apartment/issues/16)。

## 1. R12.28 最终真实回归

最终同 SHA `3817ac6577a5a317ca7001bbde6487e02f38c4c3`：
- [Quality #45311008744](https://github.com/kunlong-luo/monster-apartment/actions/runs/45311008744) **通过**；
- [Pages #45311102872](https://github.com/kunlong-luo/monster-apartment/actions/runs/45311102872) **部署成功**；
- [Gameplay Browser Review #45311008693](https://github.com/kunlong-luo/monster-apartment/actions/runs/45311008693) **失败**：**177 passed / 1 failed / 2 flaky / 3 skipped**。不能因发布成功而隐去失败的浏览器验收。

**唯一持续失败：** `e2e/a05-character-gallery-layout.spec.ts` 第 119 行定位 `gallery.locator('.cg-detail__hero--mythic .cg-detail__hero-img')`。`gallery` 是左侧五张人物卡的 `data-testid=painted-worker-gallery` 容器，神话月纱详情图位于它的**兄弟元素** `.cg-detail` 内；定位器必然匹配 0 个节点，不能证明画质异常。此处已改为 `page.locator('.cg-detail__hero--mythic .cg-detail__hero-img')`，保留 `transform:none` 和 **DPR2 coverScale ≤1** 的双重断言，没有恢复 2.05× CSS 放大。

**另外两项 flaky（重试后通过）**：`e2e/gothic-apartment.spec.ts` 的「双标签页并发建房不得丢更新」和「一个标签页写入损坏存档后其他标签页显示恢复提示」。记录为 **跨标签页一致性稳定性债务**；本轮未修改存档/锁/广播协议，也未声称该问题被修好。真实 Playwright 失败产物见上述运行附件，可在下一轮专项核对窗口竞争、存档事件监听与事务串行时序，不能简单把超时调长遮掩竞争问题。

## 2. 本轮真实代码交付

| 位置 | 已提交修改 | 作用与边界 |
| --- | --- | --- |
| `e2e/a05-character-gallery-layout.spec.ts` | 修正右侧详情图的 DOM 查找范围，从左卡容器改为页面真实 `.cg-detail`，其它 DPR2、五候选图、像素/比例等断言保持不变 | 纠正错误的浏览器测试，不虚报新原画已变清楚 |
| `e2e/r12-web-lobby-dpr-budget.spec.ts` | 新增 **真实 Chromium DPR2** 的 PC 1648×928 / 手机 390×844 大厅背景采样检查，要求背景加载成功、`object-fit:cover`、没有模糊滤镜或额外 transform，真实原图像素总数不低于旧版 1587×991；PC 采样倍率 ≤2.2、手机 ≤1.9；将 **自然像素、CSS 显示尺寸、DPR、有效倍率、是否像素不足** 输出日志与 JSON，并保留两张真实截图 | **防回退基准，不等于「达到高清」**。目前 2.2/1.9 仍允许旧图的实际 2.08/1.70 倍采样；新原生高清源图应该使倍率降至 ≤1 |
| `.github/workflows/desktop-visual-review.yml` | 将新 DPR2 测试接到 PC 浏览器工作流，截图保存到 `visual-evidence/lobby-dpr/`，统一纳入既有截图归档 | CI / Pages 是不同门禁，不改变真实玩家功能与存档 |

**本次没有修改运行时主图** `public/art/lobby-hero-v3.webp`，没有把 CSS 模糊滤镜当作高清技术，没有更换原有四位角色的 canon 头像，也没有更改五卡 `cg-manifest.json`。

## 3. PC/手机原生高清素材的正式规格（下一批艺术生产）

之前部分文档的「PC 2560×1440 以上」只能作为普通设备交付的参考，**不能保证** 1648×928、DPR2 的物理像素 ≥1。要在这个指定设备档位做到有效采样比 ≤1，推荐以下独立原生构图：

| 素材 | 目标原生输出 | 技术推导与验收 |
| --- | --- | --- |
| 首页大厅 PC 全景 | **3840×2160** 原生绘制、单独构图，无界面字/按钮烘焙 | 1648×928、DPR2：`2×max(1648/3840,928/2160)≈0.86`；必须真实原生细节，不接受 1587×991 单纯插值放大 |
| 首页大厅手机版 | **1080×1920** 独立竖构图，预留 390×844 的中央人物脸与角落 HUD 安全区 | 390×844、DPR2：`2×max(390/1080,844/1920)≈0.88`；不能从 PC 横版强裁，也不能遮挡主菜单 |
| 公寓公共空间 PC / 手机 | 与大厅**不同的建筑与透视**，桌面 3840×2160、手机 1080×1920，各自原生绘制 | 要有多层走廊、四间独立私室入口线索和真实物件/热点安全区；不能继续用大厅沙发图更换色调 |
| 神话月纱和四位角色 | 角色身份（骨相/五官/头饰）经 G1 冻结后，再按五张不同动作 CG 的至少 1086×1448 原生交付 | 3:4 候选不是正式生产 CG；真正高 DPR 的细节裁切可能需要独立更高规格脸部近景图；**不允许 CSS 2.05× 放大** |

**正式接入门槛**：原始未插值源图、生产授权/来源、SHA-256 与图片头尺寸、面部一致性与风格审核、独立构图审查、1440×900 + 1648×928 DPR2 + 390×844 + 390×550 真实浏览器截图与 UI 安全区、加载失败回退、Quality + Desktop Visual Review + Gameplay Browser Review + Pages。测试上的采样比 ≤1 是**像素充分**，不等于作品审美或商业权利自动批准。

## 4. 诚实的当前状态

| 任务 | 本轮状态 |
| --- | --- |
| 图鉴 R12.27 错误 DOM 定位 | 已提交修复，需最新浏览器回归确认 |
| 全屏大厅 PC/手机 DPR2 防退化测试 | 已提交新 E2E 与工作流，需最新 CI 运行确认 |
| 当前 `lobby-hero-v3.webp` 独立原生高清重绘 | **未交付**，历史实测 1587×991，在 PC DPR2 约 2.08× |
| 公寓独立走廊原生高清画作 | **未交付**，不得让大厅/公寓同场景假装独立 |
| 四人 G1 研究原画 GitHub 实际入库 | **未完成**，原研究稿仍在会话 ZIP |
| 四位 G1 身份正式签署 | **0/4** |
| PC/手机正式新版封面 | **0/2** |
| 五张完整人物正式 CG | **0/5**；正式状态不变 |

**下一步优先级**：先让当前图鉴与大厅 DPR2 实测通过，再投入首页 PC/手机独立原生绘景、真正上传仓库并验证原始文件，然后是公寓走廊、人物身份及五卡 CG。对两项公寓多标签页 flaky 另开稳定性专项，禁止用美术改动覆盖它们。
