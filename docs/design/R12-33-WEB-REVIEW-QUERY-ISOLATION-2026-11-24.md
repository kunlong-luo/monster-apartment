# R12.33 · PC Web 研究场景审核退出、返回与正式画面隔离（2026-11-24）

> **本轮已提交真实 Web 运行时代码、静态路由包装和 Playwright 回归；前端版本为 V3.98.0。** 修复 R12.32 已接入六张独立 PC／手机研究图之后暴露的**同页 URL 审核状态同步缺口**。本轮没有生产、上传或批准 4K 原画，也不修改 S02/S05/S06 的 `status:'review'`、玩家存档或角色 CG。构建与浏览器是否通过，应按最终 `main` SHA 逐项核实。

关联：[R12.32 六张真实研究场景预览](R12-32-IN-GAME-RESEARCH-SCENE-PREVIEW-2026-11-24.md) · [R12.31 生产素材按设备单图加载](R12-31-WEB-RESPONSIVE-SCENE-ASSET-LOADING-2026-11-24.md) · [#16 独立场景](https://github.com/kunlong-luo/monster-apartment/issues/16) · [#24 模糊图片](https://github.com/kunlong-luo/monster-apartment/issues/24) · [#25 导航状态](https://github.com/kunlong-luo/monster-apartment/issues/25)。

## 一、先核实上一轮 R12.32

对 R12.32 功能提交 `d5751e338cb1222f8bd7384e90b68f51898c8757` 的 [Desktop Visual Review #45318761236](https://github.com/kunlong-luo/monster-apartment/actions/runs/45318761236) **success**：包括 `e2e/r12-local-scene-preview.spec.ts` 三个区域 PC/手机研究图实际解码、截图与隔离验证，四场景桌面 smoke、A05 角色展示和其他视觉步骤。

上一轮最终主分支 `641fa4ffe434e31d0274553ccb31e53720630601` 的 [Quality #45319090615](https://github.com/kunlong-luo/monster-apartment/actions/runs/45319090615) **success**、[Pages #45319193228](https://github.com/kunlong-luo/monster-apartment/actions/runs/45319193228) **success**，UI 版本 V3.97.0。全量 Gameplay Browser Review [#45318888147](https://github.com/kunlong-luo/monster-apartment/actions/runs/45318888147) 核查时尚未给出整条最终通过结果，**不得把 Quality / Pages 成功写成玩法 E2E 已全通过**。

这些证据是 R12.32 的基线，并非 R12.33 最终代码的自动背书。

## 二、问题根因

原来 `src/components/game/r12-scene-painting.tsx`：

- 用 `useSyncExternalStore(noSubscription,readReviewQuery,serverReviewQuery)` 读取 `window.location.search` 中的 `r12-art-review=1`，但 `noSubscription` 不监听任何 history 或 Next router 更新。**硬刷新能正确显示/隐藏**，同路由 `pushState`、Back、Forward 却不保证重算该值。
- 即使研发人员通过 SPA 导航把 URL 改回 `/orders/`，已选中的 `desktopPreview`、`mobilePreview` 仍保留在本地状态中，旧研究图可能继续覆盖正式页面；该时序没有被 R12.32 的硬导航测试覆盖。
- `R12SceneHeroPainting` 通过 `r12:local-art-change` 接收委托/仓库场景预览；退出审核时还必须通知 Hero 恢复未批准场景的原来占位状态。
- S02 公寓已经有 `Suspense`，但 `/orders/` 和 `/warehouse/` 原本直接渲染 `MoonworkWorld`；改用 `useSearchParams` 后，需要 App Router 静态导出兼容的 Suspense 边界。

**重要：** `r12-art-review=1` 是公开的、显式选择的**研究工具功能开关**，并非用户鉴权或机密开关。隔离目标是防止生产页面意外展示/继续加载未批准的研究图，不能把它解释为保密或服务端权限验证。

## 三、R12.33 已提交的 Web 修改

| 文件 | 实际修改 | 验收准则 |
| --- | --- | --- |
| `src/components/game/r12-scene-painting.tsx` | 从 Next `useSearchParams` 派生当前 `reviewMode`，去掉不订阅变更的原生 URL snapshot；当审核关闭时 **在渲染阶段使 `preview=null`**，不再输出研究图与“未批准”水印；`useEffect` 清除 PC/手机研究预览与消息。 | 同路由取消审核参数之后立即恢复正常画面；再通过 Back 加回参数也不会擅自恢复旧图片。已创建的 `blob:` URL 仍仅在本地文件被替换/删除/卸载时 revoke，研究 WebP 固定站内 URL 不执行 revoke。 |
| `app/orders/page.tsx`、`app/warehouse/page.tsx` | 增加 `Suspense` 包裹客户端 `MoonworkWorld`，提供短暂的深色画面占位以支持 `useSearchParams` 下 Next.js static export。 | 仍是原有 7 条真实路由，没有新增页面；不会增加底部导航或旧 Web dashboard。 |
| `e2e/r12-local-scene-preview.spec.ts` | 新增 **不刷新页面**的完整场景：在 `/orders/?r12-art-review=1` 一键预览，直接 History API `pushState(null,'','/orders/')`，检查研究面板消失、背景恢复 `legacy`、图片和 Hero 消失、水印消失；再 Back 返回审核 URL 时只恢复工具、不恢复研究图。 | 特别使用 `pushState(null,...)`，避免直接沿用 Next 私有 history state 导致 useSearchParams 未同步。保留已有三场景 PC 1440×900、移动 390×844 研究图 6 截图/尺寸与无存档验证。 |
| `src/core/game-release.ts`、`public/release.json` | 两处版本标识同步更新为 **V3.98.0**。 | 只代表 Web 交互/审核隔离升级，不代表新高清场景晋级。 |

审查分为四条独立规则：

1. **正常玩家**访问 `/orders/`、`/warehouse/`、`/apartment/`：无本地研发审稿 UI；任何未批准的六张 WebP 都不应被请求，不出现其水印。
2. **显式审稿**：初次进入 `?r12-art-review=1` 只显示工具，不自动请求研究图；**点击**后 PC/手机分别按真实 1672×941 / 941×1672 的文件渲染。
3. **退出审稿/SPA 历史**：同页移除审核参数后，研究画作与 S05/S06 Hero 全部撤销；后退重新开启时不保留上次临时研究图，需再次明确点击。
4. **正式资源晋级**：图片的天然尺寸、独立构图、SHA、来源与人工签署继续由独立准入脚本保护；不会因为审稿状态重新进入而改变 `r12-scene-manifest.json`，三场景依旧 `review`。

## 四、画质生产与布局仍欠账

- **S01 首页真实全屏画作**：`lobby-hero-v3.webp` 原生仅 **1587×991**，历史 1648×928 / DPR2 采样约 **2.08×**。需要真正独立原生 PC **3840×2160**、手机 **1080×1920** 画作，并保留月纱既定身份；研究图绝不是修好此问题的证据。
- **S02 公寓六门走廊**：已在 GitHub 真实存在独立研究 PC 1672×941 + 手机 941×1672，已支持一键游戏预览；六扇门热点与正式 HUD 对位、人类视觉审核和正式原生双构图仍待完成。
- **S05 委托、S06 仓库**：研究稿有独立的建筑和配色、各有横/竖图；原生分辨率低于生产门槛，尚未进入生产 manifest，不能直接给玩家使用。
- **人物 G1 和五张正式 CG**：研究候选与正式生产原画区分不变，四人身份签署仍 **0/4**，生产五卡 **0/5**。

## 五、发布与下一步

本轮最终 `main` 的 Quality、Pages、Desktop Visual Review、Gameplay Browser Review 均应分开核对 SHA、status 与 conclusion。**未运行、仍进行中、取消或对应较早 SHA** 时均不能报告整条成功。最新同路由 URL 状态回归必须至少在真实浏览器执行通过，才能将 R12.33 交互问题标记为已复验。

下一步 PC Web 重点回到美术实体：以 S02 六门场景真实页面截图为依据，逐一审查门面、可点击区域、左侧 HUD/移动折叠菜单是否遮挡，并进入**原创原生 4K 与独立手机竖版原画的真实生成、来源/版权记录、二进制上传、测试与审核**，而不是继续用 CSS 缩放研究图。完成前 #16/#24 保持开放。

**结论：** 本轮解决审核 UI 和站内网址一致性，是未来正式原画审查流程的可靠性修复；不会宣称原生高清原画已经交付。
