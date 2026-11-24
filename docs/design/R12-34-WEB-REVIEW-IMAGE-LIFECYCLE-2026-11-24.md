# R12.34 · Web 本地原画审稿解码生命周期（2026-11-24）

> V3.99.0 · 审稿工具资源安全修复，非正式原画交付。基于 R12.33 主分支 `5b417e8580578088510ebc5ebc3b8d7e30f0a101`。此前 Quality [#45320432110](https://github.com/kunlong-luo/monster-apartment/actions/runs/45320432110) 与 Pages [#45320541142](https://github.com/kunlong-luo/monster-apartment/actions/runs/45320541142) 已成功；这不是本轮新代码的验收凭据。

## 问题与最小切片

R12.33 通过 URL 驱动的 key 重置审核组件；但源码审查发现 `chooseFile` 在创建 blob URL 后，直到异步 Image 解码成功、状态提交才进入旧 Effect 的清理范围。快速换图、改用仓库图、恢复场景或退出审稿可能发生旧解码晚到、未提交状态的 URL 无人释放。这里是由源码推导的竞争窗口，不声称已取得旧版浏览器失败截图。

- `src/components/game/r12-scene-painting.tsx`：以 PC / 手机独立 pending + active 所有权管理对象 URL；新选择取消同端旧 probe；成功才替换已接受的图，失败保留旧图；仓库研究图、恢复原场景、卸载清除两端 pending 和 active。取消时先清除回调与所有权再 revoke；固定仓库 URL 不会被 revoke。
- `e2e/r12-local-scene-preview.spec.ts`：用受控延迟的 Image probe 测试旧选择晚到、仓库图覆盖、恢复场景、退出/Back，并检查全部五个本地对象 URL 被释放。保留既有三场景 PC/手机截图与审稿隔离测试；不依赖固定睡眠。
- `src/core/game-release.ts` 和 `public/release.json`：同步 V3.99.0。未修改正式七路由、房间索引、玩家存档、抽卡、HUD 或正式资源 manifest。

## 验收与真实高清缺口

本轮新增定向测试已写入现有 Desktop Visual Review 工作流覆盖的 spec。提交前未能在本地执行 pnpm/Chromium；Quality、Desktop Visual Review、Pages 须按新提交实际核验，不预填通过。未进行新的人工视觉审核。

S02 六门仍为研究态：PC 1672×941 / 手机 941×1672。下一项优先用真实页面截图核对门体、六门索引及 HUD；四个视口 1440×900、1648×928 DPR2、390×844、390×550；正式原生 PC 3840×2160、独立手机 1080×1920，六门真实点击与具名人审后才可晋级。S01/S05/S06 与四位 G1 人物身份、五张正式 CG 仍未交付；不得通过插值、候选图换名或放宽审核来关闭 #16/#24。见 [R12.33](R12-33-WEB-REVIEW-QUERY-ISOLATION-2026-11-24.md)、[S02 门禁](../art-reviews/R12-06-S02-SIX-ROOM-ART-ACCEPTANCE.md)。
