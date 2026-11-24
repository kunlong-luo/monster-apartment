# R12.42 · 仓库晶核需求与采购反馈（2026-11-24）

基线 `05e8fa1baef6cefcd943956a67447cbe87fff22b` / V3.101.0。拟发布 V3.102.0。玩家入口 /warehouse/，不新增路由或菜单。

## 问题与实现

旧仓库仅列库存与采购价格，玩家需要往返委托页才能判断两个订单的合计缺口。禁止采购时也只有笼统提示。当前改动在原库存/采购面板内显示普通未到期订单需求、已接受且未到期的月纱需求、现有库存的即时合计缺口、未接受邀请的独立说明；点击既有委托路由可查看交期。数字来自同一真实 WorkshopState，不预留库存、不改变订单优先级。此即时缺口不包含未来生产，和预测明确分开。

采购资格复用纯函数 importPatronCore(s)，与交易引擎使用同一条件，涵盖余额、访客、有效期及库存安全上限。显示采购后余额与库存，未解锁/过期/余额不足/上限分别提示。复用 forecastPatronCommission 对当前排班的生产日推演（未接受时明确假设接受），以及纯采购后的推演；不保证自动生产实际结果。真实交易仍经 Action / commitWorldAction 的锁定存档事务，渲染不写入存档。不修改价格、概率、存档或经济引擎。

## 验收

扩展 e2e/moonwork-routes.spec.ts 既有真实跨路由测试：新玩家无采购入口并获得解锁说明；种子库存 8、普通订单 3、月纱已接受 15，缺口 10；采购后库存 9、余额 90、缺口 9；刷新保留；再采购两次后库存 11、余额 6、缺口 7，提示差 36 星币且无采购按钮。保留后续角色派工检查。新版本标识两处同步。需要新提交 Quality、真实浏览器回归和 PC/手机检查，不以源码代替实机验收。

## 交付策略

主线 R12.41 [Quality](https://github.com/kunlong-luo/monster-apartment/actions/runs/45323940051) 已通过；[Desktop Visual Review](https://github.com/kunlong-luo/monster-apartment/actions/runs/45323940048) 两个独立作业仍在运行；R12.40 [Gameplay](https://github.com/kunlong-luo/monster-apartment/actions/runs/45323781827) 尚未结束。此次用短期分支和 PR，不取消主线正在运行的回归。合并及 Pages 部署前不能宣称已上线。

本轮未生成/晋级新美术。正式场景与 G1/CG 仍是独立未完成项目，#16/#24 保持开放。
