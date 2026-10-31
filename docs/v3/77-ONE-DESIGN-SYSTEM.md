# V3.77 · 《怪物公寓》设计系统正式合一

目标：全站七个可玩页面统一颜色、金属质感、导航、字体、间距、焦点态，不把不同人物和房间绘景换成同一张背景。

## 发现的根因
原项目同时存在三组相互冲突的语义色板：
- `app/globals.css` 的 Tailwind Gothic 颜色（明亮金色与红紫色）。
- `gothic-red-gold.css` 的 `--moon-ui-*` 根级颜色。
- V3.76 `gothic-premium-tokens.css` 仅存在于大厅、召唤页的局部根选择器，其他页面无法继承。

## 实际统一（非追加覆盖层）
1. **只有一个源头**：`app/layout.tsx` 全局导入 `gothic-premium-tokens.css`；`:root` 定义 `--craft-*` 包括颜色、阴影、表面、圆角和字体。
2. **Tailwind 与兼容层**：`--color-gothic-*` 全部改为引用 `--craft-*`。旧 `--moon-ui-*` 变为 `--craft-*` 的别名，`gothic-red-gold.css` 删除原先重复根级定义；不破坏仍在使用旧变量的组件。
3. **公共组件合一**：`gothic-hud.tsx` 中七项导航、资源胶囊、上下文按钮、提示和 Modal 不再各自写死亮红渐变/金边；分别使用 `gothic-dock__link`、`gothic-resource-pill`、`gothic-action-button`、`gothic-tooltip`、`gothic-modal__surface` 等公共语义类。
4. **七场景改造**：公寓房间/工坊/月光街场景公共控制样式改用统一古铜色细边、低饱和深酒红选中态、暖象牙文字与哑光深色背景。旧工坊设计中的 77 处标准金/白/暗色值现引用 token，不触碰 Pixi 舞台绘图和状态逻辑。
5. **重复导入移除**：大厅、召唤和弹窗不再独立引入另一个本地色板，避免后续出现“只改了一页”。
6. **防回归**：`pnpm check:design` 检查统一色板依赖、公共 HUD 禁止硬编码 HEX、Tailwind 别名和 Sparkles/WandSparkles 禁止规则。
7. **浏览器检查**：1440×900 下七个正式路由核对 `--craft-brass`、`--craft-ivory`、`--moon-ui-text` 的真实 computed style，保存七页截图，并延续已有桌面 HUD/工坊/房间/抽卡与手机专项检查。

## 保留的独特性
- 人物脸型、服装与房间美术不是“共用组件”，不能用全局滤镜统一。
- SSR 品阶、危险提示与不同属性和角色拥有语义色，不强制全部变酒红。
- 保留七条正式路由、存档迁移、概率、保底、自动派工与生产、交谈、动画和无障碍流程。
- **尚未交付正式月纱横卧原画**；设计系统统一不等于已与参考效果图一比一。

## 发布门槛
Quality、Desktop Visual Review 与 Pages 按现有轻量方式验收。设计系统变更必须在主分支部署后，再由真实浏览器截图确认。
