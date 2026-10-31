# V3.73 · 固定版本 Impeccable 设计技能 + 召唤卡第一次设计复审

本轮不是 P3 高分辨率全身人物 CG 的美术交付，**五张独立全身 CG 仍缺失**；本轮完成设计治理基线，并在现有抽卡展示区落地真实的小范围视觉改动。

## 集成
- 官方 Impeccable Git 子模块 `vendor/impeccable`，提交锁定 `df3a4abe7d0840d5f60324812c432e00b66a4e75`；`.agents/skills/impeccable` 指向官方真实 Skill 文件，不是复制缩减的伪技能。
- 用 `PRODUCT.md` 保存已确定的玩家、场景、玩法和技术不变量；用 `DESIGN.md` 规范酒红、黑紫、细金、中文衬线、布局尺寸、卡面、大厅/工坊职责。格式参考 Impeccable 官方 PRODUCT 与 DESIGN schema。
- `AGENTS.md` 持久化设计流程；`docs/IMPECCABLE.md` 记录开发者子模块初始化与可选 Hooks 启用步骤，不擅自运行不受信任脚本。
- 新增 `pnpm check:design` 并加入常规 Quality，自动拒绝召唤组件里新增 `Sparkles` icon，防止下轮退化。
- 只改开发者工作流，不把 Impeccable 作为 Next.js 运行时依赖，玩家包体积不增加。

## 召唤结果页面的真实改善
- 角色大卡**删掉“全身卡面 CG 制作中”开发字样**，改用符合世界观又不虚构全身 CG 的“契约典藏 · 人物肖像”。文档与 `data-portrait-kind` 仍记录真实素材只允许为独立肖像。
- 结果标题仅保留主要中文标题，取消冗余英文眉题；说明文字从 11px 提升到 12px，减少小字堆叠。
- 卡边由多重塑料金属光晕改为有方向的深阴影与一层低强度稀有度辉光，重点仍是脸部；主体与暗色铭牌比例微调，增加人物可用空间。
- 使用现有 `--moon-ui-*` 品牌 token 控制色彩，不另加一套不受控的组件私有色。
- 保留十连自动翻面、SSR 停留、暂停回看、90 抽保底、概率、人物图、资源扣除和存档。

## 验收
- Quality 需通过新增设计检查、类型检查、Lint、Vitest 和 Next 静态构建。
- Desktop Visual Review 需验证抽卡大卡中文文案、真实图片 naturalWidth、PC 1440×900 结果及十连 SSR 截图。
- 只在 GitHub Pages 发布成功后宣布上线。官方 Impeccable Hook **尚未在用户编码工具中启用**，不能宣称 Hook 已运行或全站设计检查均通过。

## 全站图标复查
项目正式游戏组件里另发现两个遗留星光图标：大厅「动态特效」的 `WandSparkles`，房间调查详情的 `Sparkles`。分别改为 `Orbit` 和 `ScrollText`，并将 `check:design` 扩展为递归检查**整个 `src/components` 的 TSX**，不再只扫描召唤页。
