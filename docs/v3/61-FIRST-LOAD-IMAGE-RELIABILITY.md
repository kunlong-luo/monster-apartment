# V3.61 · 首次进入图片可靠性与 Pages 子路径

## 找到的问题
1. `next.config.ts` 的静态导出未统一禁用服务端 `/_next/image` 优化器。GitHub Pages 不运行 Next 图片服务。
2. 月纱技能试玩角色头像还在使用根路径 `/art/yuesha-avatar-v3.webp`，而真实站点位于 `/monster-apartment/`；召唤卡后备图亦仍来自 catalog 的 `/art/...`。
3. 欢迎页四张头像和召唤中央人物的部分图片使用默认延迟加载；手机 `picture` 桌面图 preload 会与手机图抢带宽。

## 处理
- 静态导出全局 `images.unoptimized=true`，开发和独立服务器保持原行为。
- 技能试玩改用编译期 WebP 静态导入；卡片后备路径调用 `siteAssetUrl()` 幂等加 basePath。
- 欢迎封面采用与媒体查询匹配的两份 preload，实际主图 `loading=eager/fetchPriority=high`；欢迎页四位住客头像、召唤中央人物和展示卡首屏加载不再依赖滚动触发。
- 单测覆盖 basePath 与重复添加前缀；Playwright 检查首次空存档浏览器的所有欢迎页头像真实解码，以及召唤首页主卡解码。
- CI 在 Pages 静态导出后执行资源输出路径审计（下方说明）。

## 影响范围
不改七条路由、存档键、抽卡概率或原始图像文件。不把图像请求失败简单用渐变/SVG遮盖。上线依然以 Quality 和 GitHub Pages 同 SHA 都通过为准。

## 构建与发布新硬门槛
`scripts/audit-exported-images.mjs` 读取七条路由静态导出 HTML 中的 `img`、`source`、`link as=image`，拒绝无 basePath 的本地图片、需要 `/_next/image` 后端的优化请求和未实际输出的图片文件。Quality 静态导出任务与 Pages 正式发布任务都必须通过。动态客户端图片仍由 Playwright 检查真实解码。

## Pixi 工坊首次贴图修复
`v2/src/workshop-painted-art.ts` 的首次 WebP/AVIF 加载现在对高清背景、地板、月纱头像和三种机器效果最多尝试两次；第二次请求带短暂 retry 参数以绕过缓存的失败响应。旧 WebP 和 AVIF 兜底沿用；仅最后仍失败时降级到可玩程序场景。修改不触及工坊存档、Pixi 交互或派工经济。E2E 已有 `data-backdrop-source=high-res-webp` 检查，CI 新增七页静态图片路径审计。

## 工坊脚本和字形首访恢复
- `workshop-client.tsx` 中只因首次网络加载失败的 Pixi runtime 脚本将自动重试一次，重试请求附加 query 参数以避开失败缓存；仍失败才显示错误，绝不自动触碰、清空任何存档。
- `workshop-lab-stage.ts` 字体预加载首次失败后尝试一次；仍不可用时使用已有系统字形回退继续绘制工坊，而不是直接中断画布挂载。
