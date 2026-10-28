# 跨页面导航菜单统一化实施计划

根据您的选择，我们将对全站非大厅页面 (`/town/`, `/orders/`, `/characters/`, `/warehouse/`, `/workshop/`, `/apartment/`) 的底部菜单栏进行尺寸、间距、字号与高亮样式的**高度统一**，一律采用规范的 **`GothicDock` 悬浮底栏**，并使用标准的哥特符码（`♜` 公寓、`♟` 角色、`❦` 委托、`⚜` 探索、`♧` 仓库）。

---

## 1. 确认要点 (User Review Required)

- **统一底栏形态**：全站所有非大厅场景的底栏统一使用 `GothicDock` 组件（具备一致的暗金磨砂底座、居中排列、按钮固定尺寸、渐变边框与悬浮微光）。
- **统一导航符码与标签**：
  - `♜` 公寓 (`/apartment/`)
  - `♟` 角色 (`/characters/`)
  - `❦` 委托 (`/orders/`)
  - `⚜` 探索 (`/town/`)
  - `♧` 仓库 (`/warehouse/`)
- **当前页高亮机制**：通过 `activeHref` 属性精确高亮当前页面对应的菜单按钮，高亮项具备金光边框与内发光，其他按钮保持统一的半透明哥特质感。
- **响应式排版**：在移动端与桌面端保持一致的触控尺寸 (Min 44px) 与防误触间距。

---

## 2. 拟修改文件与架构说明 (Proposed Changes)

### 导航配置与组件优化
1. **`src/components/moonwork/world-navigation.ts`**
   - 确认并导出统一的标准菜单项列表 `WORLD_NAV`：
     ```ts
     export const WORLD_NAV = [
       { id: 'apartment', label: '公寓', full: '经营住客与房间', glyph: '♜', href: '/apartment/' },
       { id: 'characters', label: '角色', full: '角色与工匠图鉴', glyph: '♟', href: '/characters/' },
       { id: 'orders', label: '委托', full: '契约与特别委托', glyph: '❦', href: '/orders/' },
       { id: 'town', label: '探索', full: '月光街', glyph: '⚜', href: '/town/' },
       { id: 'warehouse', label: '仓库', full: '魔法仓库与物料', glyph: '♧', href: '/warehouse/' },
     ] as const;
     ```

2. **`src/components/game/gothic-hud.tsx` (`GothicDock`)**
   - 统一 `GothicDock` 的按钮样式类名，设置统一的 `min-w-[56px]`, `h-[48px]`, `text-[11px]` 及图标字号 `text-[18px]`。
   - 确保 `data-tooltip` 悬浮提示框与高亮态同步。

3. **路由组件引用更新**
   - **`src/components/moonwork/world-ui.tsx`**：为世界路由 (`/town/`, `/orders/`, `/characters/`, `/warehouse/`) 应用包含公寓链接的全新 `WORLD_NAV` Dock。
   - **`src/components/moonwork/workshop-client.tsx`**：工坊页面底栏使用完全一致的 `GothicDock` 按钮与属性。
   - **`src/components/game/gothic-apartment.tsx`**：公寓页面底栏接入同等规格的 `GothicDock` 快捷菜单。

4. **样式规范 (`app/globals.css` / `src/components/game/gothic-polish.css`)**
   - 统一 `.gothic-dock__item` 的尺寸、padding、gap、边框弧度与 hover/focus 状态，消除不同页面间微小的外边距或按钮错位。

---

## 3. 验证计划 (Verification Plan)

### 自动化测试
1. **Vitest 单元测试**：运行 `npm test`，确保 `WORLD_NAV` 定义与 `typescript-tailwind-migration` 校验全部通过。
2. **TypeScript & ESLint 检查**：运行 `npm run typecheck` 和 `npm run lint`，保证 0 报错/0 警告。
3. **构建验证**：运行 `compile_applet` 确保全站打包静态编译成功。

### 页面核对
- 逐个校验 `/apartment/`, `/workshop/`, `/town/`, `/orders/`, `/characters/`, `/warehouse/` 页面，确认底栏菜单按钮尺寸、图标符码、字号、间距与当前页高亮完全一致。
