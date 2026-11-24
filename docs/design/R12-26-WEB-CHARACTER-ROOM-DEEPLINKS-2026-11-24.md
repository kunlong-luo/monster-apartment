# R12.26 · PC Web 角色图鉴与私人房间深链一致性（2026-11-24）

> **本轮真实修改了 Web 运行代码、增加定向 Playwright 回归，并接入 Desktop Visual Review。** R12.26 最新提交的 Quality、真实浏览器和 Pages 发布必须以同一 SHA 核实；**不得因文本/代码提交而宣称玩家已看到**。本轮不生成新的美术资产、不修改角色身份签署、抽卡概率、经营存档和七条正式路由。接续 [R12.25 Web 首屏和世界地图](R12-25-WEB-FIRST-LOBBY-LOAD-AND-NAVIGATION-2026-11-24.md)。

## 1. 上一轮发布验收已闭环

仓库 `main` 基线 `5286f164028c9430bb8ff37519a284d5bdd7a640`：
- [Quality 通过](https://github.com/kunlong-luo/monster-apartment/actions/runs/45304946061)；
- [GitHub Pages 部署成功](https://github.com/kunlong-luo/monster-apartment/actions/runs/45305589633)；
- [Desktop Visual Review 通过](https://github.com/kunlong-luo/monster-apartment/actions/runs/45304442958)，对应 UI 代码提交 `007cd7787659ebb76317101049c66a1c32695f21`；之后的版本号/文档提交未改变主场景布局，但不要把视觉审核的 SHA 偷换成最终 main 的 SHA。

因此 V3.91.0 **已部署**；本轮工作继续以 Web 页面的真实玩家操作为优先，而不是只刷新美术文档。

## 2. 定位的真实根因

玩家从大厅、召唤收藏或分享网址打开 `/characters/?visit=brook|fern|cinder`，会进入已有私人房间。但旧 `CharacterGalleryScene` 使用 `useEffect(..., [])`，只在**首次挂载**时读取一次 `window.location.search`，再把访客人物复制进本地 `visiting` 状态。

**故障场景**：图鉴组件已经挂载时，页面内路由/History API/浏览器后退改变了 `?visit=brook` 为 `?visit=fern`（或删除查询参数），组件可能继续显示**上一位住客的房间**，地址栏与内容不一致。先前路由父组件 `CharactersSceneRouter` 已正确使用 `useSearchParams`，但它没有把最新目标传给图鉴，导致状态出现两份真值。

## 3. 本轮已提交的修复

| 文件 | 真实修改 | 不变的约束 |
| --- | --- | --- |
| `src/components/moonwork/characters-scene-router.tsx` | 统一由 Next.js `useSearchParams` 校验 `brook / fern / cinder` 三个有效住客，作为 `routeVisitor` 传给图鉴；含有效私人房间查询参数时优先显示 Gallery，而非旧召唤 Hash 子场景 | `/characters/` 保持唯一正式路由，非法 `visit` 不打开陌生人物 |
| `src/components/moonwork/character-gallery-scene.tsx` | 删除首次 mount 的地址读取与重复 `visiting` 状态；`routeVisitor` 即当前房间身份；图鉴「拜访房间」通过 Next router `push('/characters/?visit=id')` 建立可分享入口，关闭通过 `replace('/characters/')` 统一返回；`WorkerPrivateRoom` 以 `key={visiting}` 切换角色，避免旧房间临时交互状态残留 | 不触碰 `WorkerPrivateRoom` 中的真实剧情、存档、装备/工坊状态；没有增加第八条路由 |
| `e2e/character-collection.spec.ts` | 新增 PC 1440×900 浏览器测试：打开泉泡 → 同页切到青枝 → 浏览器 Back → 离开泉泡 → 再进入炽角，逐次检查 `URL` 与 `worker-private-room-*` 是同一人物 | 保留已有召唤/收藏/存档回归 |
| `.github/workflows/desktop-visual-review.yml` | 将这条 PC 房间深链测试加入现有**定向**浏览器验收步骤，不增加每天的全量 E2E 前置硬门槛 | 质量门禁与 Pages 规则保持不变 |

本轮优先解决「地址栏说青枝，画面却还显示泉泡」的真实用户可见错误，而不是扩大 CSS 覆盖或加入更多侧边按钮。

## 4. 验收标准与取证

- **PC 1440×900 / 1648×928**：从 `/characters/` 点泉泡、青枝、炽角快捷房间；模态显示的 `worker-private-room-* ` 与 `?visit=` 一致；同页更换参数后上一位房间消失；浏览器 Back 恢复之前的人物；关闭房间删除 `visit` 且图鉴仍可操作。
- **召唤收藏**：从 `/characters/#summon-screen` → 已收录契约 → `?visit=brook`，应打开泉泡真实私室并可返回；不改变卡池掉率、存档/背包奖励。
- **Pages 子路径**：Next Link/router 必须正确保留 `/monster-apartment` basePath，不能手动拼出根域名错误 URL，也不能清掉已有其它正式游戏数据。
- **手机回归**：390×844 保留小型地图与正常房间阅读；不能为 PC 修复恢复底部七按钮。
- **检查层级**：GitHub `Quality`（tsc、lint、设计、单测、静态导出）、`Desktop Visual Review` 新定向浏览器、Pages 部署、必要时页面实测分开记录。任何未取得结果的项须标记等待，不应写「已通过」。

## 5. 版本与后续 Web 优先事项

R12.26 对应 UI 发布候选 **V3.92.0**，和 `public/release.json` 必须一致。新的版本号是让玩家能通过欢迎页/大厅确认已刷新，**并不证明代码或美术达标**。

下一阶段重点：
1. **P0 首页 / 图鉴真实图片清晰度**：依 [Issue #24](https://github.com/kunlong-luo/monster-apartment/issues/24) 比较 `naturalWidth/Height`、DPR2 与 CSS `object-fit:cover` 的放大系数，检查失败回退和 PC/手机浏览器截图；低分辨率源图必须新画而不是 CSS 放大。
2. **P0 七页跨路由体验**：PC 优先确认大厅、工坊、委托、图鉴/抽卡、公寓、仓库、月光街之间的真实导航，修复返回/历史/遮挡的具体失败用例。
3. **美术门禁**：G1 四人独立研究稿仍在 ZIP（未正式上传 GitHub）、身份人审 0/4、正式双端封面 0/2、五张全身 CG 0/5；禁止拿研究脸提前覆盖玩家已认可的头像。资源真正提交审核后再接入 Web。

**结论：** 本轮针对 PC Web 角色房间的可见性与深链行为做了真正代码修复，并增加回归；以最新 SHA 的 CI 与 Pages 输出决定「已上线」状态。

## 6. 实际浏览器回归的首轮失败与修正（2026-11-24）

- 第一轮针对性 Desktop Visual Review [#45306430867](https://github.com/kunlong-luo/monster-apartment/actions/runs/45306430867)：**3 项相关测试通过，新增的 1 项失败**，断言位于 `e2e/character-collection.spec.ts` 的「同页面切到青枝」步骤；其时地址栏已经变为 `?visit=fern`，但浏览器未显示 `worker-private-room-fern`。本轮没有掩盖这次失败，也没有删除断言。
- 复核 Next.js 官方 `next/src/client/components/app-router.tsx` 和 [Next 导航说明](https://nextjs.org/docs/app/getting-started/linking-and-navigating)：**外部** `window.history.pushState(null, '', '?visit=fern')` 可通知 App Router 的 `useSearchParams`；但原测试传入 `window.history.state`，里面含 Next 专用 `__NA` 标记，框架会刻意跳过外部同步，从而出现「URL 变了，React 路由状态不变」的假模拟。玩家真实按钮已调用 `router.push`，并不会传这个专用内部对象。
- 已修改测试为官方约定的 `pushState(null, '', '?visit=fern')`，并将原因写进测试注释。原有完整断言**全部保留**：仍需检验同路由 Brook→Fern、浏览器 Back、关闭房间及后续进入 Cinder。
- **状态区分**：首轮 3/4 通过与 1 个测试调用方式错误已确认；修正后的 Desktop Visual Review 必须另取成功证据，不能把 TypeScript/Pages 已通过冒充该浏览器测试已通过。此次修正属于**测试接入正确性**，不改变 V3.92.0 的玩家功能或 CG 审核状态。
