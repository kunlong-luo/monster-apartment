# V3.74 · 大厅信息减法与手机视口（Impeccable layout + polish）

本轮仅升级已确认的黑紫、酒红与细金全屏哥特首页，没有改变场景原图或游戏功能入口。

## 真实的视觉问题与改动
- 1440×900 实际截图原来左侧三张面板：主线生产进度、召唤首契约、独立的委托消息。第三张委托卡大面积重复主线晶核库存信息，遮挡白发女主与桌前画面。将它移至**右上角真正可点击的信件小控制**，左侧只保留两张主线/人物卡。
- 新信件按钮仍读取 `Math.max(0,orderTarget-orderStock)` 的真实存档库存，显示“待交付 N 枚”，打开原有委托消息 Modal 并可继续前往管理委托。原 `data-testid=gothic-commission-status`、`aria-label=委托消息` 保留，不破坏旧交互/键盘焦点。
- 顶栏已在玩家资料显示第 N 天，因此删去重复的“生产日”资源胶囊，保留星币与晶核；节省横向空间。
- 把“✧”“✦”“❯”等易出现平台字形差异的 UI 装饰字符换成 Lucide `ScrollText`、`Crown`、`ChevronRight`；品牌装饰换为 `MoonStar`。**没有引入 Sparkles 家族图标。**
- 桌面主线侧栏最大宽度从约 345px 收窄为约 317px，减轻画面遮挡；最重要的契约召唤仍保持高权重入口，不在中央新增另一层工具面板。
- 继续使用 Next.js 16、React 19、Tailwind v4、现有 Gothic CSS 和成熟 Lucide。没有增加运行时依赖、路由或存档迁移。

## 验收
- Quality: TypeScript、Lint、Vitest、Pixi 与 Next 导出、项目级 `check:design`。
- Desktop Visual Review: 新增两张卡 + 顶部委托小按钮的数目/间距断言；`lobby-hero-v3.webp` 真实加载断言；新增 390×844 移动端快照、消息弹窗可用、页面不溢出、侧栏不压底部导航检查。
- 页面入口 `/`，版号 V3.74。仅在真实 CI/Pages 成功后报告已上线。
