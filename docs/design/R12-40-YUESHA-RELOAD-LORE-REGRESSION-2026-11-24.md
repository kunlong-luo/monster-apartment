# R12.40 · 月纱私室刷新恢复与剧情持久化回归（2026-11-24）

基线 `2cf539f3ecdc37011d01109024863d42713a6a76` / V3.101.0。只修正过时 E2E 合同，未修改运行时代码、版本、游戏存档结构或美术资源。

## 真实失败证据

[R12.36 全量 Gameplay Browser Review](https://github.com/kunlong-luo/monster-apartment/actions/runs/45322294982)（`9e4077cc`）结果 **186 passed / 3 skipped / 1 failed**。唯一失败为 [character-life.spec.ts 首个用例](https://github.com/kunlong-luo/monster-apartment/actions/runs/45322294982/job/138203578089)。日志指出 `与女主人月纱交流` 按钮被已经显示的 `yuesha-room-stage` 模态遮挡，30s 超时，两次尝试均失败。

R12.30 已规定 `/apartment/?visit=yuesha` 是私室唯一 URL 身份，刷新应恢复私室。读 `gothic-apartment.tsx` 可见 `witchOpen=talkOpen||visitingYuesha`，关闭通过 router.replace 移除 visit，保留其他参数。旧用例在私室里完成剧情后 reload，仍要求点击背景女主人，再点击拜访。该路径与现行合同冲突。模态阻止背景交互是正确行为；不改模态层级、不使用 force。

## 定向改动

`e2e/character-life.spec.ts` 首个用例：
- 刷新前确认 URL 中 visit=yuesha 与实际剧情存档存在；
- 刷新后直接断言私室/对话可见，URL 仍保留 visit，原选择与四条记忆保留；
- 真实点击关闭月纱对话，等待对话卸载与 URL 移除 visit，再从背景女主人进入会客室；
- 再次确认剧情选择、记忆与原始末尾持久化断言。保留星币不变、场景分层、热点、剧情动画、彩蛋与原截图，不删除测试或扩大超时。没有修改其它人物、概率或生产逻辑。

## 发布及证据

R12.39 的 [Quality](https://github.com/kunlong-luo/monster-apartment/actions/runs/45323424448) 和 [Pages](https://github.com/kunlong-luo/monster-apartment/actions/runs/45323530143) 已成功。R12.36 [Desktop Visual Review](https://github.com/kunlong-luo/monster-apartment/actions/runs/45322294938) 最终为 cancelled，不能作为六门专项通过证明。R12.40 新测试会触发 Gameplay Browser Review；本环境未运行本地 Chromium，不预报通过。下一轮取得新完整回归及六门定向验收，再推进正式 HUD/原画。#16/#24 仍开放，G1/CG 未晋级。
