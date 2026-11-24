# R12.44 · 主线发布基线与 PC HUD 真实证据（2026-11-24）

基线 `05e8fa1baef6cefcd943956a67447cbe87fff22b`，正式版本 V3.101.0。此次只回读证据、更新主线文档，不改变运行时代码、不取消仍执行的关键回归，也不新增第三个功能分支。

## 主线 R12.41

同 SHA [Quality](https://github.com/kunlong-luo/monster-apartment/actions/runs/45323940051)、[Desktop Visual Review](https://github.com/kunlong-luo/monster-apartment/actions/runs/45323940048)、[GitHub Pages](https://github.com/kunlong-luo/monster-apartment/actions/runs/45324041746) 均成功。独立研究场景与综合桌面作业分别通过。截图附件实际存在：[研究场景](https://github.com/kunlong-luo/monster-apartment/actions/runs/45323940048/artifacts/14888926370)、[综合桌面](https://github.com/kunlong-luo/monster-apartment/actions/runs/45323940048/artifacts/14889331007)。R12.40 的 [完整玩法回归](https://github.com/kunlong-luo/monster-apartment/actions/runs/45323781827) 核查时仍在运行，不写成已通过。

## 两个候选 PR

| 候选 | Quality | 专项及综合视觉 | 完整玩法 | 合并 |
| --- | --- | --- | --- | --- |
| [#53 仓库经营 V3.102.0](https://github.com/kunlong-luo/monster-apartment/pull/53)，`75555b3b370d493c7db1e9851b0a2df4f051427b` | [通过](https://github.com/kunlong-luo/monster-apartment/actions/runs/45324187991) | [运行中](https://github.com/kunlong-luo/monster-apartment/actions/runs/45324187928)，[像素证据](https://github.com/kunlong-luo/monster-apartment/actions/runs/45324187860) 仍运行 | [运行中](https://github.com/kunlong-luo/monster-apartment/actions/runs/45324187914) | open，mergeable:true，未合并 |
| [#54 PC HUD 共存](https://github.com/kunlong-luo/monster-apartment/pull/54)，`92f64aeab4974eff6eac6839682272da2bc38679` | [通过](https://github.com/kunlong-luo/monster-apartment/actions/runs/45324512908) | 独立场景 **7 passed (1.1m)**；[综合仍运行](https://github.com/kunlong-luo/monster-apartment/actions/runs/45324512905) | [运行中](https://github.com/kunlong-luo/monster-apartment/actions/runs/45324512896) | open，mergeable:true，未合并 |

## #54 已获得的证据

直接读取 [scene-art-review job 138210758462](https://github.com/kunlong-luo/monster-apartment/actions/runs/45324512905/job/138210758462) 日志，确认 `Running 7 tests using 1 worker`、`7 passed (1.1m)`，作业成功。新用例覆盖 1440×900 与 1648×928 DPR2 的 HUD 共存、六门各六次真实点击、房间列表、日志、月纱对话、存档一致性及缩窄后的隔离模式；既有六项用例亦通过。独立截图包 [r12-scene-art-review](https://github.com/kunlong-luo/monster-apartment/actions/runs/45324512905/artifacts/14888947289) 已成功上传，日志显示 28,503,331 字节，API 显示未过期。本轮未解包目视检查截图，不代替人工审美签署。

## 收口顺序

1. 不再开新功能 PR。先取得 #53 完整玩法与其余验收结果，若失败按真实日志修复；通过后合并并确认相应 main Quality / Pages。
2. #54 与 #53 均修改文档索引顶部，合并前核对两者记录共存，不覆盖任一阶段；保留 #53 V3.102.0 版本号。确认最新基线后的相关浏览器证据再合并。分支仅在实际合并后清理。
3. PC HUD 研究通过不是生产原画批准。S02 手机 HUD 共存尚未实施；G1 原包与四位正式身份、五张正式 CG、六张正式场景仍待交付；#16/#24 保持开放。下一批聚焦实际原画，不以更多工程文档代替资产。

以上均为本轮查询快照，未完成的工作流按后续实际状态更新；不声称后台自动合并。
