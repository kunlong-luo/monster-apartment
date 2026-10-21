# Bug / 反馈记录

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
