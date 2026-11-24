# R12.55 · 过渡版历史清单同步与发布回归

PR #55, 旧候选 SHA `4df5b02551e30f413d28bd694dbd35012ebb6b24`。Quality [45363070671](https://github.com/kunlong-luo/monster-apartment/actions/runs/45363070671) static-export、pixi-v2-scaffold 成功；checks 的设计、房间、研究图、typecheck、lint 已完成，Vitest 317 passed / 3 failed (64 files)。三处真实失败：旧 2026-10-30 cover manifest 203790 B vs 新 526046 B；旧大厅静态 import 仍断言 V3；新版 930×910 半身图 151936 B vs 旧阈值 >200000 B。此前新增的 33 原图 / 15 输出完整性测试通过。

本轮由已完成的 R12.53 转换清单导出当前六个 cover/identity 槽位元数据（实际源路径、SHA-256、尺寸、大小）；历史六条记录完整保存在 historicalProductionAssets，不把旧月纱 face.webp 当成现行头像。测试继续检查真实文件、哈希、尺寸、与转换清单的关系和四头像独立性。大厅检查覆盖 V4 PC/mobile 与保留的 V3，半身图保留合理防空文件大小阈值并提高实际尺寸门槛到 930×910；精确哈希与原始裁切尺寸由 R12.54 检查，文件大小不能单独代表视觉清晰度。无新图或生产 CG 审批。

旧 SHA 的 [R12 Art Pixel Evidence](https://github.com/kunlong-luo/monster-apartment/actions/runs/45363070575) 已通过；[Desktop Visual Review](https://github.com/kunlong-luo/monster-apartment/actions/runs/45363070740) 独立六门作业通过，欢迎、导航、私室深链及移动 HUD 步骤通过，整体尚未完成；Gameplay [45363070478](https://github.com/kunlong-luo/monster-apartment/actions/runs/45363070478) 仍运行。更新后以新 SHA 重跑结果为准；不提前合并或声称上线。V3.103.0 候选不变，经济、存档、概率及游戏资源字节不变。
