# PROJECT KNOWLEDGE BASE

**Generated:** 2026-10-21
**Commit:** cafc32e (V0.1.1 baseline; working tree = V0.2.0 Next.js migration)
**Branch:** feat/nextjs → main

## OVERVIEW
Six-room / four-tenant / five-day management prototype. Next.js 16 App Router + React 19 + Tailwind 4 + Zustand 5; the floor plan renders in Phaser 4 through a client-only adapter. Every rule lives in one pure TS module.

## STRUCTURE
```
.
├── app/                       # App Router: layout + one route, no API routes
├── src/core/engine.ts         # ALL rules; zero framework imports
├── src/store/                 # Zustand adapter over engine results
├── src/game/                  # Phaser scene + typed event bus (not React)
├── src/components/apartment/  # server→client boundary (ssr:false)
├── src/components/game/       # screens/panels; compose ui/*
├── src/components/ui/         # hand-rolled primitives (no 3rd-party UI lib)
├── e2e/ tests/                # 6 Playwright + 9 engine tests
└── docs/ management/          # spec, stack, changelog, task CSV
```

## WHERE TO LOOK
| Task | Location | Notes |
|---|---|---|
| Change a rule / price / target | `src/core/engine.ts` | only source of truth; pure, immutable |
| Add a store action | `src/store/game-store.ts` | wraps an engine fn, applies `{state, error}` |
| Canvas visual / click mapping | `src/game/apartment-scene.ts` | `updateBoard()` clears and redraws everything |
| React⇄Phaser messaging | `src/game/events.ts` | typed bus: `room-picked`, `scene-ready` |
| Lazy-load boundary | `src/components/apartment/apartment-view.tsx` | `next/dynamic({ ssr:false })` |
| New panel / button | `src/components/game/*` + `ui/*` | never raw styled HTML |
| Design tokens | `app/globals.css` `@theme` | no tailwind.config.js exists |
| Stack / pins / risks | `docs/TECH_STACK_PAGEVELA.md` | authoritative version matrix |
| Task state | `management/TASKS.csv` | P0xx rows |

## CODE MAP
| Symbol | Location | Role |
|---|---|---|
| `TENANTS` | engine.ts:52 | slime / ember / ghost / golem: price, rent, color, icon, description |
| `TENANT_IDS` | engine.ts:59 | canonical iteration order |
| `ROOM_COUNT` `LAST_DAY` `TARGET_COINS` `TARGET_SATISFACTION` `UPKEEP_PER_ROOM` | engine.ts:60-64 | 6 / 5 / 135 / 55 / 3 |
| `newGame` | engine.ts:66 | 35 coins, day 1, six empty rooms |
| `adjacency` | engine.ts:81 | 7 undirected pairs on the 2×4 floor plan |
| `synergyDetails` | engine.ts:92 | adjacency + tenant-mix bonuses |
| `hire` | engine.ts:109 | rejects occupied / unaffordable, deducts price |
| `moveOrSwap` | engine.ts:130 | into empty room or swap two tenants |
| `nightlyEvent` | engine.ts:148 | deterministic `switch (day)`, no RNG |
| `advanceDay` | engine.ts:160 | rent − upkeep ± synergy/event; win/lose on day 5 |
| `useGameStore` | game-store.ts:25 | `state, selected, moveSource, error, help` + 7 actions |
| `apartmentEvents` | events.ts:29 | typed `on` / `off` / `emit` |
| `ApartmentScene` | apartment-scene.ts:18 | `KEY='ApartmentScene'`, `updateBoard(state, selected, moveSource)` |

## CONVENTIONS
- Every engine fn returns `GameOutcome`; never mutate the input state. Error paths return the **same** state reference — `engine.vitest.test.ts` locks this with `toBe`.
- Deps must be exact `x.y.z` (`check:stable-deps`) → install with `pnpm add --save-exact`.
- pnpm only (`packageManager: pnpm@12.13.0`, engines node >=24 <25); npm/npx create a parallel lockfile that CI ignores.
- TypeScript pinned 6.0.3: typescript-eslint does not support TS 7 yet.
- Strict + `noUnusedLocals` + `noUnusedParameters`; `@/*` → `src/*`; `allowImportingTsExtensions` (both engine test formats rely on it).
- Tailwind 4 theme lives only in `app/globals.css` `@theme`: `ink-950/900/800/700`, `line`, `line-strong`, `mint-300/400/500`, `gold-200/300`, `mist-300/400/500`, `danger-300`, `radius-panel`.
- `components/game/*` compose `components/ui/*`; no raw styled `<button>` / `<section>`.
- Comments only for non-obvious constraints (Turbopack `serverExternalPackages`, canvas `!important`, `ssr:false` sizing, stateless scene). No restating code.
- Server Components: `app/*` only. Anything using hooks, the store, Phaser, or `apartmentEvents` needs `'use client'`.

## ANTI-PATTERNS (THIS PROJECT)
- `src/core/engine.ts` importing React / Zustand / Phaser / DOM — it must stay runner-agnostic (node:test, vitest, browser).
- Phaser or `next/dynamic({ ssr:false })` called from a Server Component → build error.
- Duplicating game state inside the Phaser scene; the scene only renders what `updateBoard` receives.
- Re-implementing rules in components or the store; `public/playable.html` is frozen V0.1 and must not gain new logic.
- Non-exact dependency ranges (`^`, `~`, `workspace:`, `npm:` aliases, prereleases).
- `next/font/google` (fetches at build time).
- Raw hex / arbitrary colors in components — use the `@theme` tokens.
- Editing e2e-visible strings without updating `e2e/*.spec.ts` (see UNIQUE STYLES).
- Reintroducing the deleted V0.1 duplicates: `src/style.css`, `src/store/useGameStore.ts`, `src/game/ApartmentScene.ts`.

## UNIQUE STYLES
- Coin `◈ N`; tenant counter `N / 6`; day `DAY N/5`; settlement `第 N 天结算`; room a11y name `N 号房` with `aria-pressed`; win `🎉 经营成功`; lose `本局未达标`; end-day `结束今天` (disabled when `over`); page title `怪物租客公寓` (exact match).
- Playwright strict mode: every string above must resolve to exactly one element.

## COMMANDS
```bash
pnpm dev                 # 127.0.0.1:3000 (also Playwright webServer)
pnpm check:stable-deps && pnpm typecheck && pnpm lint
pnpm test:rules          # node --test tests/engine.test.mjs (6)
pnpm test                # vitest tests/engine.vitest.test.ts (3)
pnpm build && pnpm e2e   # 6 Playwright specs, chromium only
```

## NOTES
- Two engine test files, disjoint runners: `engine.test.mjs` runs on Node 24 type-stripping (imports `../src/core/engine.ts`); `engine.vitest.test.ts` runs on vitest (extensionless import). Neither runner loads the other file.
- `lint` covers `app src next.config.ts playwright.config.ts vitest.config.ts` — **not** `tests/` or `e2e/`.
- Balance baseline `[null,slime,slime,ember,ember,slime]` → 232 coins / 63 satisfaction → win. Changing price, rent, synergy, or targets without re-baselining breaks `playthrough.spec.ts` (asserts `◈ 1` remainder).
- Turbopack cold start is slower than Vite: `webServer.timeout` is 120s, CI retries 2.
- `public/playable.html` is the frozen V0.1.1 artifact; its `./engine.js` JSDoc references are intentional drift.
- `main` holds the V0.1.1 baseline (tag `v0.1.1-baseline`, commit cafc32e) for visual/perf comparison.
- `test:rules` needs Node ≥24 for `--experimental-strip-types`; re-run before upgrading Node.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## V0.2.2 implementation notes (PR #2)
- GameScreen gates interaction behind store.hydrated while restoring localStorage; do not read it during SSR.
- src/lib/save-game.ts validates a versioned save for current-browser persistence only. GameScreen attaches a Zustand subscription after restoration.
- src/lib/i18n.ts translates UI, tenant names, night-event text and history without changing core engine rules.
- New-player tutorial state is in src/store/game-store.ts; skip/replay and progress persist locally.
- e2e/features.spec.ts covers refresh restoration, bilingual controls and tutorial; CI uses preinstalled Chrome via PLAYWRIGHT_USE_SYSTEM_CHROME=1 because Chromium CDN TLS failed on runner.
- V0.2.2 CI baseline: Node rules 6, Vitest 6, Playwright 12; Next regular and static exports both build.
