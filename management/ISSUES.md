# Bug / 反馈记录（历史与现行入口）

> **历史快照警示（2026-11-22）**：下列 `ENV-001`、`UX-001`、`UX-002` 是 V0.1 时期的记录，尤其“刷新无存档”不代表目前的 Next.js + 双存档版本仍然没有保存能力。**后续活跃缺陷请优先在 [GitHub Issues](https://github.com/kunlong-luo/monster-apartment/issues) 建单，并与 [当前缺口台账](../docs/engineering/GAP-REGISTER-2026-11-22.md) 同步**。保留旧记录供历史追溯。

## 新缺陷最小模板

`标题/优先级：P0/P1/P2`；`影响路由/版本/SHA`；`PC/手机浏览器与 DPR`；`复现步骤、实际/预期、截图或日志`；`根因及受影响素材/模块`；`验收用例、修复 SHA、部署或人审证据`；`TODO/DOING/BLOCKED/DONE`。

## V0.1 原始问题（历史，状态不代表今天）

填写模板：

```text
ID: BUG-001
版本: V0.1.0
环境: Pop!_OS + Chromium/Firefox
操作步骤: 1) ... 2) ...
实际结果: ...
预期结果: ...
优先级: P0/P1/P2
状态: TODO/DOING/BLOCKED/DONE
```

## 当前已知问题

- ENV-001：在交付环境中 npm registry 无法访问，因此 `npm install` / `npm run build` 尚未验证。优先级 P1，状态 BLOCKED（待本地网络环境验收）。
- UX-001：v0.1 无本地存档，刷新会丢失进度。这是已经公开说明的功能限制，优先级 P2，状态 TODO。
- UX-002：英语界面与触控专项适配待开发。优先级 P2，状态 TODO。
