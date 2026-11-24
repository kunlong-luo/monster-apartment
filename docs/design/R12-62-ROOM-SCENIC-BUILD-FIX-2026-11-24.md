# R12.62 · 私室观景候选构建修复

PR #56 的首个候选 `0bfe40eec4a416e63cd094da6822fcb15f976880` 出现真实编译错误：room-scenic-view-toggle.tsx 的单引号字符串跨行未闭合。Quality [45368077567](https://github.com/kunlong-luo/monster-apartment/actions/runs/45368077567) 的 typecheck/static-export 失败，Pixi 构建通过；图片取证 [45368077354](https://github.com/kunlong-luo/monster-apartment/actions/runs/45368077354) 因 /apartment/ HTTP 500 失败，桌面导航因共享组件无法编译也失败。本次改为合法的字符串数组 join，保留全部 Tailwind 类和响应式行为；修正手机测试名称使之与已有断言一致，不移除任何测试。未修改游戏结算、资源文件或存档。待新 SHA 的 Quality 和定向视觉验收，不声称修复已通过或上线。

独立工坊/月光街转换 [45368254427](https://github.com/kunlong-luo/monster-apartment/actions/runs/45368254427) 已成功；四张真实 WebP 在另一候选分支 5588ee89，不混入房间发布。