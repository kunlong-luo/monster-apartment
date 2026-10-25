# 《月光工坊》V2.2 — 多路由与单一存档

## 当前路线与能力

| 路由 | 技术 | 真正能做的事情 |
|---|---|---|
| `/town/` | Next.js App Router | 查看当日资金、工坊等级、设备数量和区域入口 |
| `/workshop/` | 独立 PixiJS 8 | 搬迁设备、派工、生产、交付及升级 |
| `/orders/` | Next.js App Router | 查看普通/特殊委托，调用引擎接受月纱订单 |
| `/characters/` | Next.js App Router | 工人专长、实际岗位及月纱是否到访 |
| `/warehouse/` | Next.js App Router | 真实水汽、孢子、晶核库存；月纱在场时付费采购 |

## 单一业务引擎

所有页面只依赖已有 `v2/src/workshop-engine.ts` 规则，存档 Key 始终为
`monster-apartment:workshop-v2-lab`，版本号仍为 `2`。
Next 客户端使用 `src/lib/moonwork/world-store.ts` 验证读写；
无效/缺失存档不会自动重建，防止覆盖真正的游戏。
Next 写入只有实际接单和采购；普通生产由 PixiJS 处理。
V1 旧存档保持不变。

## GitHub Pages 构建流程

Next `output:export` 静态输出 App Router 页面；成功 CI 后，
Pages Workflow 保留额外的独立 V2 构建和复制：
`out/workshop/assets/workshop.js`。
Next 内部 Link 由 basePath 自动映射到 `/monster-apartment`；
工坊与 Next 页用相对的 `../town/` 和 `../workshop/` 相连。
CI 必须断言四个新静态页面与工坊资源同时存在。

## 本地开发限制与后续迁移

Next 开发端口 3000，独立 Pixi 开发端口 3901，属于不同
localStorage Origin。本地 E2E 各自测试，生产 GitHub Pages 同源，
可以共享仓库与委托。未来再把 Pixi canvas 迁入 Next 的
客户端路由，届时必须验证 WebGL 挂载/卸载、资源 URL、状态恢复、
生产效率与热更新，才能删除独立静态工坊。
主城自由走动与 NPC 剧情**不是当前已实现功能**。
