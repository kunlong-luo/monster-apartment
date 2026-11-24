# R12.36 · 六门点击遮挡与直接审稿网址 hydration 修复（2026-11-24）

> V3.101.0 · 回归修复；不新增生产美术。基线 `871a455b666976c4b3771d54f16c36e81f90f192`（R12.35）。

## 失败证据（不是猜测）

- [R12.35 Quality](https://github.com/kunlong-luo/monster-apartment/actions/runs/45321472619) 与 [Pages](https://github.com/kunlong-luo/monster-apartment/actions/runs/45321574239) 成功。
- [Desktop Visual Review](https://github.com/kunlong-luo/monster-apartment/actions/runs/45321472511) 失败，实际 [job 日志](https://github.com/kunlong-luo/monster-apartment/actions/runs/45321472511/job/138200909339) 在场景审稿 spec 报 **5 passed / 1 failed**。六门测试在普通 `door.click()` 反复遇到 `<section class="ga-lower">…</section> intercepts pointer events`，最终 120 秒超时。后续视觉步骤跳过，不应把整个工作流标绿。
- 相同日志还反复出现 `R12SceneBackdropView: document is not defined`，随后 React switched to client rendering because server rendering errored。直接带查询参数访问 Next 页面时，Client Component 仍可能参与服务端初始渲染；原先条件仅判断 reviewMode，直接访问 document.body 不安全。

## 本轮修复及验收

| 修改 | 目标 |
| --- | --- |
| `gothic-apartment.css` | 仅在显式六门检查且故事卡存在时移除整个 ga-lower 空命中层；选中房门后真实抽屉重新参与布局、可点击；退出还原正常 HUD。不是全局 pointer-events:none。 |
| `r12-scene-painting.tsx` | 复用 useSyncExternalStore 的 server/client hydration snapshot 模式，初始服务端及水合渲染不创建 portal，水合后才读 document.body；URL 仍控制审核模式。审稿面板限制到可用视口高度并内部滚动。 |
| `e2e/r12-local-scene-preview.spec.ts` | 三个审稿直达页监控 hydration/document 错误；原四视口、24 次真实门位点击、存档不变与截图测试继续保留。增加故事容器隐藏/抽屉可见/关闭和退出恢复断言、普通 Playwright trial 及真实点击 5 秒超时；不使用 force、dispatchEvent 代替真实点击或延长测试掩盖遮挡。 |
| 版本标识 | V3.101.0，两处同步。 |

**本轮本地未运行 pnpm/Chromium；新 SHA 的 Quality / Desktop Visual Review / Gameplay / Pages 需独立核验。** 上轮五项通过不能替代此轮结果。

## 后续唯一优先项

先验证六门真实点击回归通过，再推进 S02 正式 HUD 避让及原生 PC 3840×2160、独立手机 1080×1920 新原画。研究图仍为 1672×941 / 941×1672，不能晋级。四位角色身份和五张 CG 的正式审批状态、存档、七路由、经营规则均不变。#16/#24 保持开放。
