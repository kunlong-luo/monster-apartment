# R12.30 · PC Web 画质审稿标准与月纱房间深链一致性（2026-11-24）

> **已提交 Web 运行代码、真实审稿 UI、定向 Playwright 测试与 CI 接入。** 本轮将 PC 原图预览标准改为 **原生 3840×2160**，并修复公寓月纱私室只在组件初始挂载时读取 `?visit=yuesha` 的路由状态错误。**没有生成、上传或替换正式高清图片。** 本轮后续 Quality、Desktop Visual Review、Gameplay Browser Review 与 Pages 结果以各自同 SHA 实际流水线为准，不能凭文档或提交成功宣告正式上线。

关联 [R12.29 PC/手机 DPR2 取证](R12-29-WEB-DPR2-IMAGE-REGRESSION-AND-HERO-REBUILD-2026-11-24.md)、[R12.26 私人房间路由](R12-26-WEB-CHARACTER-ROOM-DEEPLINKS-2026-11-24.md)、[#24 图片模糊](https://github.com/kunlong-luo/monster-apartment/issues/24)、[#16 独立场景](https://github.com/kunlong-luo/monster-apartment/issues/16)、[#25 页面导航](https://github.com/kunlong-luo/monster-apartment/issues/25)。

## 一、核对完成的上一轮 Web 基线

R12.29 最新主分支 `56233a6adc9d5b8eecac8a683af9879500d83ebc`：
- [Quality #45314046256](https://github.com/kunlong-luo/monster-apartment/actions/runs/45314046256) **通过**；
- [GitHub Pages #45314214844](https://github.com/kunlong-luo/monster-apartment/actions/runs/45314214844) **部署成功**；
- [Desktop Visual Review #45313925280](https://github.com/kunlong-luo/monster-apartment/actions/runs/45313925280) **通过**，在较早的 `ff5b702` 代码 SHA 上通过新加入的 PC 1648×928、手机 390×844 DPR2 大厅背景防退化检查；因为后续提交主要为文档，不应把较早 SHA 伪写成最新 SHA；
- [Gameplay Browser Review #45313905553](https://github.com/kunlong-luo/monster-apartment/actions/runs/45313905553) **核对时仍在运行**；不预填最终通过。

结论：旧大厅 `lobby-hero-v3.webp` 在 PC DPR2 上仍需约 2.08× 像素采样，**Pixel Budget 测试通过表示没有退化，不表示原画已高清**。

## 二、真实修复 ①：本地场景原画审稿器与 PC Retina 规格统一

### 问题

`src/components/game/r12-scene-painting.tsx` 已有明确的 `?r12-art-review=1` 研究预览开关，允许在公寓、委托、仓库中分别选择 PC 和手机本地原图，且**不会上传或写入游戏存档**。但它仍按旧规格 `PC 2560×1440` 评价“是否达到最低尺寸”，低于 R12.29 给出的一组 PC 1648×928 DPR2 艺术制作目标，容易使研究稿得到过早的绿色反馈。

### 本轮改动

- PC 审稿预期更新为 **原生 3840×2160**；手机继续要求**独立竖构图原生 1080×1920**。切换屏幕会显示当前使用的尺寸门槛。
- `data-testid="r12-local-pixel-gate"`、`data-required-resolution` 和 `data-pixel-pass` 公开实际检查结果，供浏览器测试与审核人员核验；不足尺寸时明确提示“**禁止插值放大晋级**”。
- `e2e/r12-local-scene-preview.spec.ts` 用真实本地 PNG 上传/手机源切换验证门槛从 `3840x2160` 改为 `1080x1920`；保留不上传、切换后对象 URL 与失败回退、清除预览及普通玩家不可见等既有测试。

**特别说明：** `3840×2160` 是本轮审稿器的原生艺术交付目标，留有构图与高密屏裁切余量。正式图片的**准入条件**仍独立由 `scripts/audit-r12-scene-art.mjs` 执行：必须真实持有 Git 中的 PNG 原图、源/输出 SHA、`coverUpsampleProfiles` 无高密屏上采样、独立手机构图、PC/手机热点位置与人工来源/商业权利签署。该脚本现有绝对尺寸下限和有效 DPR2 尺寸校验与审稿器目标不同；不能因预览“尺寸达标”就自动修改 `r12-scene-manifest.json` 为 production。

## 三、真实修复 ②：公寓月纱私室直接跟随 URL

### 根因

在 `src/components/game/gothic-apartment.tsx` 中，`window.location.search` 仅在 `useEffect(...,[])` 时读取一次，之后用 `witchOpen`、`witchRoom` 两份局部状态控制视图。这和早前图鉴修复的泉泡／青枝／炽角问题类似：同路由 SPA 导航后可能**地址已经变成 `?visit=yuesha`，却未打开私室**；浏览器 Back 或返回对话还可能留下过时 URL。

### 本轮实现

| 代码/测试文件 | 实际修改 | 不变的边界 |
| --- | --- | --- |
| `src/components/game/gothic-apartment.tsx` | 使用 Next.js `useSearchParams` 将 `witchRoom` 派生为 `visit=yuesha`；`witchOpen` 由当前私室路由或手动打开的 `talkOpen` 决定，不再读取一次 URL 并把结果复制进局部状态。拜访、返回对话和关闭对话分别调用 `router.push` 或 `router.replace`；**保留其他已存在的查询参数**，包括显式研发审核开关。 | 公寓经营与计时、星币和住客存档、月纱私室原有话题和热点不变；无新增正式路由 |
| `app/apartment/page.tsx` | 与 `/characters/` 相同，提供 `Suspense` 轻量加载占位，让 Next App Router 下的 `useSearchParams` 保持静态导出兼容。 | 不替换场景美术 |
| `e2e/gothic-apartment.spec.ts` | 1440×900 PC 浏览器检验直接访问 `?visit=yuesha`、原生 History API 切换、在对话中进入私室、Back 返回对话、关闭，以及 `roomArtReview=1` 参数在进入/离开时仍保留。 | 不放宽既有跨标签页存档和损坏存档回归 |
| `.github/workflows/desktop-visual-review.yml` | 新增上述**定向**浏览器场景，同时继续运行 R12.29 的大厅 DPR2 浏览器检查和 R12 原画审稿隔离测试。 | 不额外强制全量 E2E 作为发布前置条件 |
| `src/core/game-release.ts` / `public/release.json` | 同步升级 **V3.95.0**，让已部署的用户可以识别此轮 Web 版本。 | 沿用现有更新提醒机制 |

**交互预期：** `/apartment/?visit=yuesha`（含分享/刷新/站内切换）始终展示月纱真实私室。手动打开的普通交谈即使浏览器 Back 返回公寓，也可以继续显示对话；关闭后 URL 删除 `visit`，但不删除开发者**显式**启用的 `roomArtReview=1`。正常玩家默认看不到研究图片审核工具。

## 四、PC Web 真实高清美术欠账（不可用代码“完成”）

| 资产 | 当前现场 | 下一张原生画作与验收要求 |
| --- | --- | --- |
| S01 首页大厅 | `lobby-hero-v3.webp` 为 1587×991；PC 1648×928 DPR2 约 2.08× 上采样 | 独立 3840×2160 哥特大厅原画，中央月纱角色身份不变，左右角落 HUD 安全区、无烘焙文字或按钮；独立 1080×1920 手机画稿 |
| S02 公寓走廊 | 仍沿用大厅背景；已有 1672×941、941×1672 的**未批准研究稿**，不是生产资源 | 独立建筑走廊透视、6 个可辨识房门与房门热点安全区；桌面和手机真正原生双构图、人工审核、真实原图/输出哈希后再允许 production |
| S05 / S06 委托与仓库 | 目前没有通过生产签署的各自场景画；部分小横幅历史上为 360×228，PC DPR2 会糊 | 分别绘制相互独立、角色和场景相匹配的原生大画幅；不继续使用旧大厅换色 |
| G1 角色身份 + 五张 CG | 独立研究肖像存在会话 ZIP，但**未实际入库/未签署**；五卡生产 status 仍全是 `portrait` | 先完成四人身份与版权签署及入 GitHub，再按冻结人脸、不同姿态/服装/武器生产五张原生全身 CG |

## 五、验收与后续阶段

1. **先核实本轮最新 SHA 的 Quality、Desktop Visual Review、Gameplay Browser Review、Pages**；如果 TypeScript、静态导出或新 PC 私室浏览器用例失败，先修复后报告。
2. **艺术生产下一步**：新建 S01 PC 3840×2160 原生绘景和手机 1080×1920 独立构图（保留原始 PNG、SHA、可商用来源、审稿结论），提交为 `review`，在真人尺寸、视觉与场景交互审核前不覆盖当前游戏。随后 S02 公寓独立走廊。
3. **独立稳定性债务**：旧 Gameplay Browser Review 曾有两条跨标签页公寓存档测试重试后通过；此轮没有改并发存档事务，也不能宣布竞争问题彻底消失。

**发布事实边界：** 本轮已有真实 Web 功能修复与审稿流程优化；仍**没有新的高清原画进入正式游戏**。保留 #24/#16 开放，不伪造 G1 审批或 Pages 上线状态。
