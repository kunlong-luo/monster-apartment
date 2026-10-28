# 月光工坊 Local-first 数据与动效规范

## 单一数据流

- React HUD / 月光街 / 委托 / 图鉴 / 仓库通过 `useMoonworkState` (Zustand 5) 读取同一份工坊数据。
- `v2/src/main.ts` 保留 PixiJS 的画布交互与现有 save key：`monster-apartment:workshop-v2-lab`。跨 bundle 以 `moonwork:v2-update` 事件同步；不向 UI 库暴露或复制游戏引擎。
- `v2/src/workshop-engine.ts`、`workshop-production.ts` 是唯一生产、升级、费用、交付规则；界面只展示结果。
- `src/lib/moonwork/world-store.ts` 的 `reduceWorldAction` 是其它场景交易的公共命令入口。
- `src/lib/moonwork/world-database.ts` 用 Dexie 4 持续覆盖同一个 IndexedDB 存档快照。恢复时仅当旧 `localStorage` key **完全不存在**才读取 IndexedDB：旧数据优先，异常旧存档绝不静默覆盖。
- IndexedDB 不可用时保留现有同步存档行为；这不是多设备云同步，也不承诺在存储被用户彻底清除之后可恢复。

## 视觉与资产

- `workshop-machine-status.ts` 用正式生产规则对 **下一班**进行无副作用预测：idle (待派工)、blocked (实际物料瓶颈)、working (能生产)。机器的光效与连接流动按状态显示，不能靠随机播放代替产线逻辑。
- 工人目前采用 3x 内部分辨率的透明 Canvas/Pixi 位图帧，解决锯齿但**仍非最终精细立绘**。高分辨率手绘透明 WebP 素材放入 `v2/art/production/workers/{brook,fern,cinder}.webp`，不含场景/文字、不拼入 UI。
- 单张透明素材不等于真实逐帧人物动作；帧动画需求应进一步提交 8 帧 idle / work / carry 图集，保证服饰、五官一致。
- 通过 `v2/scripts/build.mjs` 将存在的透明资产复制到侧载 `dist/assets/workers`，Pixi 将优先加载，失败保持可玩。
- 角色图鉴所用的旧三联图低清晰度问题只有替换真正的高清原画才能彻底解决，不应通过浏览器锐化谎称恢复原始细节。

## 发布前验证

`pnpm install --frozen-lockfile`、`pnpm typecheck`、`pnpm lint`、`pnpm test`、`npm --prefix v2 run typecheck`、`pnpm e2e`。
手机 320/390px、平板 820px、桌面 1280/1920px 检查主按钮可点、状态显示真实、路线跳转不丢档，键盘与减少动画模式正常。
