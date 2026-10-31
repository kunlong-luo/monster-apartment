# Impeccable：项目级接入与设计审查

采用官方源代码 **Apache-2.0**，参考 <https://impeccable.style/tutorials/getting-started/>。
当前固定版本：`pbakaus/impeccable@df3a4abe7d0840d5f60324812c432e00b66a4e75`（技能文件报告 v4.8.0）。使用 Git 子模块，不作为 Next.js 运行时依赖，不改变锁文件/打包大小。

## 安装状态

- 仓库已添加 `vendor/impeccable` Git 子模块，固定到上述提交。
- `.agents/skills/impeccable` 是指向官方 `vendor/impeccable/.agents/skills/impeccable` 的 Git 符号链接。**Clone 后需要初始化子模块，链接才会生效。**
- `PRODUCT.md`、`DESIGN.md` 是根据既有项目事实与用户确认的视觉基线建立的上下文文件；不代表独立运行过官方 `/impeccable init`、`document` 或自动审查引擎。
- 自动设计 Hook 需要开发工具主动信任；此提交**没有擅自启用 Hooks**，也不增加每次发版的 E2E 门槛。

## 开发者使用

```bash
git clone --recurse-submodules https://github.com/kunlong-luo/monster-apartment.git
# 已 clone 的工作副本：
git submodule update --init --recursive
# 或者采用官方 CLI 项目级安装：
npx impeccable install
```

使用 Codex 时运行 `$impeccable critique`、`$impeccable polish`、`$impeccable audit`；其他支持工具用 `/impeccable`。如果技能未在工具里识别，检查符号链接与子模块初始化后重新加载编辑器/编码工具。官方 CLI `impeccable link --source=vendor/impeccable --providers=...` 也可替代手工链接。
如需可选的自动检查，先阅读官方 Hooks 文档，确认许可权限和执行命令，再在实际工作电脑/受信任代理中启用；不要在普通 Pages 流水线里直接运行远端脚本。

## 每一轮视觉升级的顺序

1. 核对目标页面的`PRODUCT.md`、`DESIGN.md`与用户参考图，划清 Experience（展示）/Operate（操作）边界。
2. `critique`：找出信息重复、图片裁切、字太小、低对比、无意义按钮、导航干扰的具体位置。
3. `polish`：只调整一个已有页面或区域，复用 Tailwind v4、Motion、Lucide；优先组件源头，不追加全局旧 CSS 补丁。
4. `audit`：检查键盘焦点、对比度、减少动效、图片加载、三种视口。
5. 运行 `pnpm check:design`，再正常 Quality；涉及实际观感则执行 Desktop Visual Review 并保存截图。
6. 只有通过 Pages 部署后报告“上线”。新 CG 必须另行制作并通过正式美术资产审核。

## 不得混淆的界限

Impeccable 是开发代理的设计能力，不是游戏美术引擎。它不能替代四间正式房间绘景、五张人物 3:4 全身原画，也不能一键把 2D 角色模型变成专业游戏 CG。
