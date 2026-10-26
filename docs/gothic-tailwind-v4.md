# Gothic 2D UI — Tailwind CSS v4 convention

The Next.js app already uses Tailwind CSS 4.3.3 and `@tailwindcss/postcss`. **Use Tailwind v4**, not `twin.macro` (a different CSS-in-JS macro). Prefer class utilities to expanding the legacy CSS.

## Ownership

| Layer | Technology | Rules |
| --- | --- | --- |
| UI structure | Next.js / React and Tailwind v4 | Responsive positioning, spacing, buttons, panels, borders, interactions, typographic hierarchy |
| UI tokens | `app/globals.css` `@theme` | Gothic colors, sizing tokens, dark gold contrast |
| Dynamic stage | PixiJS / WebGL | Animated 2D scenes, character sprites, effects and compositing |
| Atmospheric CSS | Small, scoped styles | Complex masks, gradients, reduced-motion keyframes where appropriate |
| Game state | Existing `cozy-engine` / `workshop-engine` | Gameplay updates; UI must not invent balances or save states |

## Shared primitives

Use `src/components/game/gothic-hud.tsx`:

- `GothicDock` for edge-aligned navigation.
- `GothicIconButton` for HUD actions with accessible names/pressed state.
- `GothicResourcePill` for real state totals.
- `GothicActionButton` for contextual room actions.

Use the CSS-first `@theme` custom utility tokens, such as `text-gothic-gold` and `border-gothic-brass/65`. Keep complete literal Tailwind class strings in source for static detection. Do not concatenate class fragments like `'text-'+color`.

## Migration boundaries

1. Migrate feature by feature. Remove old CSS selectors when no longer referenced; avoid adding another overriding style sheet.
2. Leave Pixi's `canvas` rendering to the game renderer; Tailwind is not an animation engine.
3. Preserve existing public routes, local-storage keys, simulation rules, and accessibility labels.
4. Validate desktop/mobile, touch, keyboard navigation and reduced-motion behavior.
5. Check `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`, and Playwright before claiming the change has shipped.

**Next:** fully delete unused legacy selectors after capturing before/after screenshots, and migrate secondary menus/dialogs to the same primitives. This keeps the project moving toward a single UI language without needlessly rewriting the game logic.
