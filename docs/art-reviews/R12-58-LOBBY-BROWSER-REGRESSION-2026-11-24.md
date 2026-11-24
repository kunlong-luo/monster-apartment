# R12.58 · 新大厅真实浏览器旧断言修复

PR #55 候选 `0c851a65424d531cf70a3cf2195c85bcc802e792`：Quality 64/64 文件、320/320 测试通过，[Desktop Visual Review](https://github.com/kunlong-luo/monster-apartment/actions/runs/45363705243) 和 [R12 Art Pixel Evidence](https://github.com/kunlong-luo/monster-apartment/actions/runs/45363705223) 通过。完整 [Gameplay Browser Review](https://github.com/kunlong-luo/monster-apartment/actions/runs/45363705278) 186 通过、3 跳过、1 失败（14.8m）。唯一失败为 e2e/gothic-art-review.spec.ts:4 的 PC 大厅 naturalWidth 1587 旧断言，实际 1672；重试相同。其余玩法通过，不能把整轮记作全绿。

修复该用例：按 R12.53 已真实生成的 V4 原生 1672×941 / 941×1672，验证 PC 与手机 currentSrc、original 加载状态及独立手机居中构图；公寓旧图位置、玩家印章、减少动效、六房门点击与四张截图断言全部保留。将该定向用例前移到 Desktop Visual Review，保留截图在 visual-evidence/gothic-art；先保存欢迎图避免后续 Playwright 清空 test-results。既不跳过失败测试，也不将旧图重新写回。游戏运行代码与原画、正式资源字节不变，V3.103.0 候选不变。以新 SHA 的实际 CI 与发布为准。

并行 R12.57 分支已实际转换 8 个房间层文件，另行验证，不能混入此 PR 或干扰发布。正式 CG 仍 0/5。
