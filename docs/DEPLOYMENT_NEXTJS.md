# Web 试玩部署方案（V0.2.1）

## 目标与边界

正式工程保持 **Next.js 16 + Phaser 4 + React 19**。本游戏目前不使用 API routes、Server Actions 或服务端存档，故可用 Next.js 静态导出免费部署 GitHub Pages。现有 Node/Next 本地开发和 `pnpm start` 不受影响。

- 默认：`pnpm dev`（http://127.0.0.1:3000）；`pnpm build && pnpm start`（Next.js 常规生产方式）。
- 静态部署：设置 `NEXT_STATIC_EXPORT=1` 后执行 `pnpm build`，构建产物为 `out/`。
- 静态构建配置在 `next.config.ts`，使用 `output: 'export'` + `basePath: '/monster-apartment'` + `trailingSlash: true`。此路径仅适用于当前 GitHub Pages 仓库站点。
- 游戏画面必须维持客户端动态加载，不能在 Server Component 中初始化 Phaser。
- **限制：** GitHub Pages 无服务器运行时；将来账户、排行榜、支付、云存档等功能需要独立后端或迁移托管方案。

## 首次发布（仓库维护者操作）

1. 先将 V0.2.1 Pull Request 的检查修复到全部通过，再审核并合并到 `main`。
2. 在 GitHub 仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。如仓库或组织策略限制 Pages，请先检查相应权限。
3. `Quality` 工作流在 `main` 推送成功后，将由 `.github/workflows/deploy-pages.yml` 触发构建与部署；首次亦可手动运行。
4. 查看 **Actions → Deploy GitHub Pages** 的构建日志及环境 URL。部署成功后预计站点入口为 `https://kunlong-luo.github.io/monster-apartment/`。
5. 用桌面和手机浏览器检查房间点击、招募、搬家/交换、完整五日结算、重新开始；确认浏览器控制台和网络请求无 404/JS 报错。

## 本地预检

```bash
pnpm install --frozen-lockfile
pnpm typecheck
pnpm lint
pnpm test:rules
pnpm test
pnpm e2e
NEXT_STATIC_EXPORT=1 pnpm build
test -f out/index.html
```

如果本地使用当前 Next 构建模式预览静态站点，应以静态 HTTP 服务托管 `out/`，而不是对静态导出执行 `pnpm start`。当使用 `basePath='/monster-apartment'` 时，静态文件应挂载到对应子路径；直接对根路径 `out/` 使用简单服务器可能造成资源 404。

## 额外测试门槛

- 每个 PR 的 `Quality` 会独立执行常规 Next.js 构建与 `static-export` 构建。
- 生产演示部署需 `Quality` 的 main 分支 push 检查全部成功，部署使用对应 head SHA。
- 当前仅测试 Chromium 的 Playwright E2E；真实 iOS Safari、Firefox 和不同设备尚未作为质量门禁。
- 部署成功只说明 Web 游戏可访问，不代表通过海外平台审核或产生广告收入。

## 参考

- https://nextjs.org/docs/app/guides/static-exports
- https://nextjs.org/docs/app/api-reference/config/next-config-js/basePath
- https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
