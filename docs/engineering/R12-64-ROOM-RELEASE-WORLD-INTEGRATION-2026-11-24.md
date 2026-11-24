# R12.64 · 私室合并与世界场景主线同步

## 已核实
PR [#56](https://github.com/kunlong-luo/monster-apartment/pull/56) 候选 `1cf62ace4503a68f08bbb2855b0cc898d2944f84` 的 [Quality](https://github.com/kunlong-luo/monster-apartment/actions/runs/45368652906)、[Desktop Visual Review](https://github.com/kunlong-luo/monster-apartment/actions/runs/45368652612)（含四房间 PC/手机玩家观景、原审稿隔离、六门公寓）、[像素证据](https://github.com/kunlong-luo/monster-apartment/actions/runs/45368652701) 全部通过。按 AGENTS.md 风险分层合并为 main `d36b5aee99effac3850a0993e2b8c7718ae560ce`，V3.104.0。全量玩法 45368652700 尚在运行，Pages 需核实，不能宣称已上线。

PR [#57](https://github.com/kunlong-luo/monster-apartment/pull/57) 旧候选 `66525ce0a88f0a39b0ab1e7717d5df608c64d4e5` 的 Quality 45368869429、像素证据 45368869423 通过。Desktop Visual Review 45368869626 的四场景冒烟 24 passed / 1 failed：mobile town 用例误要求 href /workshop/，Next 返回 /workshop。现按实际 URL pathname 去除末尾斜线，校验目的路径并依次点击三个真实入口、检查实际导航、返回街区；不是放宽到任意链接或跳过测试。其他浏览器检查保留。

## 同步范围
本轮在 #57 构造真实双父合并提交，main 为第一父、原世界候选为第二父；保留已合并房间的运行代码、8 图、审稿和专项浏览器检查；迁入 #57 四图原 blob、场景代码及所有世界检查。Quality 同时保留房间与世界两项源图/哈希审计；合并文档索引、资源目录；版本 V3.105.0 候选。无新图、无概率/存档/经济改动。以同步后同一 SHA 的实际回归为准。

工坊三工序动效 R12.63 仍在独立分支，待 #57 验收后同步，不把未经复验的视觉效果混入该发布。正式 CG 人审仍 0/5；场景生产 manifest 不晋级。