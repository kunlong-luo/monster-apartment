# 哥特 UI 升级与参考图对齐实施计划

根据您上传的参考图 `image_26a43a92.png` 以及确认的升级偏好，我们将保留完整的暗黑哥特美学风格，将全站与会客室界面的图标升级为**精美 SVG 镀金样式**，并将会客室/剧情交互界面全面升级为**包含顶栏导航、左侧角色侧栏、中央热点互动、右侧对话面板及底部三栏面板的完整高阶界面**。

---

## 1. 确认要点 (User Review Required)

- **视觉风格与图标**：使用 `lucide-react` SVG 图标，结合 CSS 金色滤镜与渐变镀层 (`gothic-gold-icon`)，替代原有纯文本/Unicode 符号。
- **界面架构对齐 (参考图标准)**：
  1. **顶栏 (Header)**：怪物公寓 Logo、主导航 (大厅/工坊/委托/图鉴/探索/设置)、多类型资源数额 (星币/蓝钻石/紫晶石) 及功能图标 (邮件/背包/菜单)。
  2. **左侧角色列表 (Character Roster)**：垂直头像框列表，显示角色名称、亲密度等级 Badge 以及未解锁状态。
  3. **中央会客室与热点 (Interactive Scene & Hotspots)**：包含“衣柜、梳妆台、玫瑰花、红茶、旧契约、月光窗、黑猫、床榻”等浮动镀金热点图标。
  4. **右侧互动对话面板 (Right Dialogue & Interaction Panel)**：包含角色名、亲密度心形徽章、经典台词、功能分类 Tab (对话/礼物/换装/剧情) 及具象化图标对话列表 (💬, ☕, 📖, 🔍, 💗)。
  5. **底部三栏控制台 (Bottom Dashboard)**：
     - **房间切换**：契约会客室、月光阳台、私人浴室、衣帽间。
     - **已收集记忆**：初遇之夜、月下的秘密、枕边的温度、未完的契约。
     - **亲密度与送礼**：Lv.15 亲密度进度条、礼盒插槽与“赠送礼物”按钮。

---

## 2. 拟修改文件与架构说明 (Proposed Changes)

### 核心数据模型 (`src/core/character-life.ts` & `src/lib/game/character-life-store.ts`)
- 扩展角色会客室数据结构：新增房间场景状态 (Rooms)、记忆 CG 收集 (Memories)、亲密度经验值 (Affection Progress) 及送礼互动机制。
- 确保新增数据字段与既有 V3.4 存档平滑兼容。

### UI 组件层
1. **`src/components/game/gothic-hud.tsx`**
   - 增加 SVG 镀金图标包装器，统一顶栏与各控制面板的图标渲染风格。
2. **`src/components/game/yuesha-private-room.tsx`**
   - 按照参考图 `image_26a43a92.png` 重新组装高保真会客室界面：
     - 顶栏资源与导航栏
     - 左侧角色选择器
     - 中央热点图层
     - 右侧对话/互动选项
     - 底部三栏式面板 (房间切换 / 记忆 CG / 亲密度送礼)
3. **`src/components/game/worker-private-room.tsx`**
   - 同步升级工匠 (泉泡、青枝、炽角) 的房间界面，保持统一的镀金 SVG 图标与三栏视觉体验。
4. **`src/components/game/gothic-polish.css` & `app/globals.css`**
   - 新增 SVG 镀金滤镜效果 (`.gothic-gold-icon`)、极细暗金边框与高斯模糊背景样式。

---

## 3. 验证计划 (Verification Plan)

### 自动化测试
1. **Vitest 单元测试**：运行 `npm test`，验证角色档案数据、记忆收集及亲密度算式正确。
2. **TypeScript & ESLint 检查**：运行 `npm run typecheck` 和 `npm run lint`，确保 0 报错/0 警告。
3. **应用编译**：运行 `compile_applet` 确认 Next.js 16 / App Router 构建通过。

### 手动与视觉验证
- 打开月纱会客室界面，检查顶栏导航、左侧角色列表、中央浮动热点、右侧对话列表以及底部三栏面板的呈现与交互。
