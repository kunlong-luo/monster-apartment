# R05 · V2 工坊跨标签存档事务统一（2026-11-07）

承接 [R05 架构审查](./2026-11-07-workshop-and-architecture-followup-audit.md)。

## 统一读写
- `v2/src/workshop-save-transaction.ts` 集中维护 V2 存档键、变更事件、原有 Web Lock 名称、结构校验、CAS 写入以及排他读-变换-写事务。
- `workshop-auto-runtime` 的自动生产时钟、开启/暂停均使用 `transactWorkshopSave`；后台 tick 使用 `ifAvailable`，没有额外生产排队。
- 月光街、委托、仓库 `Action` 改为异步事务；只有真实写入才发事件，锁等待时禁用重复点击。
- Pixi `main.ts` 在处理地块触摸和 React 动作前申请同一锁；获取锁后**重新读存档**，再按现有 engine 计算并调用 `writeWorkshopSnapshot`；重置也不再跳过锁。
- 首次恢复/初始化同样获得此锁，避免多个页面和备份恢复同时覆盖原始存档。损坏的旧 V2 原始内容始终保留。
- Web Locks 不可用时拒绝写入；不能以普通 localStorage 比较冒充跨标签原子提交。

## 验收与边界
- 新增同日并发采购、手动日结与市场交易并发、自动生产与交易并发、损坏存档、quota 失败、无锁及写入冲突测试；既有六组世界操作改为异步真实事务测试。
- 不改 `version:2`、时间戳、Pixi 机器模型、生产周期、收入、市场价格、委托结算、Dexie 备份格式。
- GitHub Pages 服务端旧部署锁问题独立追踪：[Issue #6](https://github.com/kunlong-luo/monster-apartment/issues/6)。本文件不代表 CI 与线上部署已通过；以对应 SHA 工作流结果为准。
