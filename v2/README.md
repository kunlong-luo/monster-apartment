# 月光工坊 / Workshop V2 — technology reset

**Status: playable GAMEPLAY LAB (greybox), not the final visual release.**\n\nOpen /workshop/ to try the isolated prototype after CI succeeds; original / still hosts frozen V1. The lab deliberately uses simple Pixi drawing primitives as TEMPORARY technical proxies. This is not the promised painted creature sprite art.

The legacy **V0.10.0** game remains reachable and unchanged. V2 is a new project
inside this repository, not an attempt to reskin the old six-room simulation.

## V2.1 water pump and greenhouse detail review

The mist pump and spore greenhouse now have independent original-painted
alpha detail overlays, composited above their original functional base sprites.
The overlays fade before reaching the workers, preventing baked-in characters
from duplicating active staff on the game board. They carry no hit areas,
cannot alter construction/production logic and retain a codec-safe fallback.
All three machine images remain review-grade and none count as approved
Lv1-Lv3 art or hand-animated working sprites.

## V2.1 crystal kiln original painted review

A standalone alpha-channel AVIF reference cutout (`art/kiln-art-review.avif`)
now replaces the kiln-only procedural bitmap when AVIF is supported. This is
**a review prototype, not an approved production asset**: it was extracted
from a generated concept image, retains some ambient lighting, and has no
true independently authored flame/forge working frames. The game keeps kiln
collision geometry, worker assignments, upgrading and shared inventory
completely separate from its visual texture. The old bitmap safely loads if
AVIF is unsupported. The manifest explicitly marks this as a prototype, not
any of the 17 final machine/character sprites.

## V2.1 formal art production pack (specification, not shipped art)

The next production target is documented in
[正式美术资产包 v1](docs/ART-ASSET-PACK-V1.md). The machine tiers for
water pump, greenhouse and kiln, plus Moonveil's full and half portraits and
idle/talk/trade motion atlases, have exact filenames, frame sizes, anchors,
acceptance criteria, and intended rendering layers in
[`art/asset-pack.v1.json`](art/asset-pack.v1.json).

Run `npm --prefix v2 run audit:art` to distinguish shipped low-resolution
prototypes from missing production art. The audit fails on missing runtime
assets or falsely marked ready art, but **does not fail** solely because
the final artwork remains pending. Formal visual acceptance still requires
real desktop/mobile screenshots and frame-by-frame review.

## V2.3 — quick real-world scene navigation

An accessible collapsible in-game **场景** portal is now present in the
workshop header, leading to town, orders, worker roster and warehouse.
It navigates through the Next router on the main workshop page and
falls back to ordinary relative links in the standalone safety route.
Unlike a permanent toolbar it leaves the one-screen stage height
unchanged. These are functional pages using the same real validated
save; browser tests cover direct portal navigation and return.

## V2.3 — Next owns the interactive workshop URL

`/workshop/` is now a real Next.js App Router destination. Its client
component mounts the **existing PixiJS renderer and V2 deterministic game**
as a separately bundled browser runtime, destroys WebGL and listeners on
client route navigation, and keeps the same V2 storage key.

The tracked `v2/index.html` remains the source of game control markup.
At build time the Next Server Component extracts its `<main>` element;
the client lifecycle loads `workshop-runtime.js` and styles beside the
Next route. In local development the existing V2 asset server on port 3901
serves runtime/assets to Next on port 3000 with CORS. Pages is same-origin.

`/workshop-lab/` keeps the independent old entry during transition.
This is a **runtime bridge**, not a fully unified NPM package yet.
Pages deployment must preserve Next `out/workshop/index.html` and copy
only V2 assets there. Both modes use identical rules and the V2 save.

## V2.2 first multi-route world

- Next.js App Router routes: `/town/`, `/orders/`, `/characters/`,
  `/warehouse/`; all read the **unchanged V2 localStorage save**.
- `/workshop/` keeps the real PixiJS 15-plot production stage for now.
  A visible link in its header opens the new town hub.
- Orders can accept a real moon witch commission; warehouse can buy a real
  core. Both invoke `v2/src/workshop-engine.ts` rather than duplicated
  economic calculations. V1 data is untouched.
- These are four useful destinations and one live workshop, not yet a freely
  explorable town. Full PixiJS-to-Next component migration is a later phase.
- GitHub Pages is same-origin for all routes and V2 localStorage. Development
  servers on ports 3000 and 3901 are **different origins**; only the
  deployment or a unified-origin preview exercises seamless navigation.
- [Full routing contract](docs/ROUTING-V2.2.md).

## Technical decision

- **PixiJS 8.22.0 / WebGL** owns the entire gameplay canvas, camera, actors,
  scene graph, animation and hit areas. WebGPU is not the baseline because its
  browser support is less consistent.
- **Texture atlases (PNG / WebP)** for all game objects. Each character requires
  an 8-frame hand-painted idle cycle and eventually walk/work/response states;
  *no SVG runtime character mesh, no DOM character movement, no generated
  lookalike rectangles disguised as finished visuals*.
- **TypeScript rules** are renderer-agnostic (`src/workshop-engine.ts`).
- **Next.js** will remain an external website shell **after** the new vertical
  slice is playable. No new Next route is exposed until asset quality passes.
- **Preserve legacy saves** by not sharing the V1 key or schema.

## New playable premise

A compact, connected workshop. Players arrange machines and assign creatures
by useful skills to fulfill orders under deadlines. The first loop is:

Mist pump → water → Spore greenhouse → fibers → Crystal kiln → cores → order.

Production only flows through **orthogonally adjacent machines**. Workers have
different specialties. A wrong placement produces nothing, while the right
machine and worker doubles throughput. Day 5 brings a concrete order deadline,
not another +happiness click.

This is an intentionally narrow *test of whether the mechanics are fun*.
The existing pet-raising/roommate happiness and commission loops will **not**
be imported into V2. Fail early on the core loop before adding buildings.

## Readable Chinese game text

The V2 standalone bundle self-hosts the SIL OFL-licensed Noto Sans SC 400
Chinese subset via Fontsource rather than depending on operating-system
Chinese fonts or a third-party CDN. PixiJS waits for the font before drawing
Chinese stage text. This fixes missing-glyph boxes on Linux and in automated
screenshots. The font is a runtime asset, not a user download artifact.

## 成年女性角色阵容与造型规范（新增）

已确定的美术方向：**年轻、优雅、性感的原创奇幻成人女性**。将以三位 **21—24 岁**的年轻成年角色为主，保留 **28 岁月纱**为成熟型代表。设计突出露肩、露背、露腰、开衩剪裁、精致配饰及不同职业的辨识度，不直接照搬成人影像或真实人物。幼态/宠物化怪物保持非性化。

完整四人资料、逐帧精灵规格、服装边界、经营互动和验收门槛见 **[成年女性角色美术规范](docs/adult-character-art-direction.md)**。当前实际代码仅完成月纱的过渡版立绘与高级订单，其余三位是明确标注的待开发目标，尚未假称已经上线。

## V2.1 textured interactive workshop masonry

Plot textures now use an independent painted moonstone floor sample
(`art/moonstone-floor.avif`) rather than uniform hand-programmed gray squares.
Each plot still remains its own PixiJS hit target; floor textures are rotated
per plot for less obvious repetition, with the previous floor retained as a
codec fallback. The painterly floor is an intermediate material swatch, not
the final seamless structural environment atlas.

## V2.1 first independent character portrait

The witch commission card uses a dedicated original-painted portrait
(`art/moonveil-portrait.avif`) rather than an enlarged canvas drawing.
Its image is a real responsive HTML asset, independent of the animated
scene actor and the contract mechanics. Compact mobile layouts omit the
thumbnail to protect the single-screen controls. This is a painted cameo,
not a finished fully animated witch sprite sheet.

## V2.1 first painted architecture asset

An **original real bitmap** (`art/moon-workshop.avif`) now supplies the
moonlit window, workshop timber and lamp-lit distant architecture.
Unlike a flattened game screenshot it contains no UI or fake control labels.
It is loaded independently of the physically clickable tiles, machines,
characters and resource animation. The build copies the binary AVIF to the
served assets directory and browsers lacking support use the old skyline.

This is a first painterly scenery integration, *not finished game artwork*.
Machine, floor and worker sprites are still programmatic placeholders. The
small proof-of-concept AVIF should eventually be replaced by a high-resolution
environment atlas with separate foreground occlusion and lighting layers.

## V2.1 in-world production responses

Each real production shift now emits short-lived PixiJS feedback above the
producing kiln, and contract delivery or failure surfaces directly inside the
same stage. Guest commission completion has a distinct reward response.
These visual effects live on a separate layer, are capped to six simultaneous
items, fade after 1.5 seconds and never alter the deterministic game state.
Reloading a save or choosing a toolbar action does not replay rewards.
This is interaction polish, not a substitute for final authored character art.

## V2.1 stage continuity

PixiJS stage sync now skips scene rebuilds when the immutable world snapshot
and selected plot have not changed. Choosing/cancelling worker and machine
toolbar options only updates accessible DOM controls; it no longer destroys
all GPU sprites, restarts animated characters and resets the scene each click.
Actual construction, shift outcomes and plot-selection changes still redraw.
A browser regression checks this behavior without changing game saves.

## V2.1 first gameplay pass — consequential risk and honest forecasts

The optional witch commission now requires seven extra cores beyond the
post-delivery warehouse stock. The starter line makes only six before the
deadline, so accepting without improving production loses 20 coins. A Lv.2
kiln costs 60 coins and can produce enough for the 135-coin guest reward.

A second strategic response is available in the patron card: buy a
single *physical* core from a wholesale visitor for 42 coins. Procurement
reduces cash and increases the very same inventory as production; it does
not mint free rewards. One import covers the guest order but risks the next
regular order, while two imports or a permanent kiln upgrade protect both.
The contextual import option disappears when the forecast shows both
contracts are safe, so it adds no unrelated permanent button.

The contract panel forecasts delivered inventory and possible shortage using
the **same deterministic rules as actual shifts**. These are what-if estimates,
not guaranteed payouts: changing equipment and workers updates the forecast.
Ignoring the optional commission remains penalty-free. Existing V2 saves remain
separate from V1; formal hand-painted art is still a separate milestone.

## V2 iteration 0.4 — machines that improve and a finishable goal

The full product development plan is tracked in
[GAME-ROADMAP.md](docs/GAME-ROADMAP.md). Current V2 has a first real
progression loop instead of infinitely adding wait/earn buttons:

- Deliver one real order to earn **Lv.2 machine upgrade access**. Choose a
  physical machine on the stage; its upgrade appears contextually in the
  existing selection strip, with its exact coin price and unlock reason.
- Deliver three orders to unlock **Lv.3**, earn 70 development coins and
  reach the Star Artisan workshop rank. Five orders complete the finite
  **Moonlight Master Workshop** target and grant another 160 coins.
- Upgraded pumps and greenhouses gain +1 material per level/shift; upgraded
  furnaces gain +1 core per level/shift but must still have adjacent spores.
  The improved machinery visibly glows and grows and retains its level when
  relocated. Existing V2 saves with no machine level remain Lv.1.
- After the campaign target is met, free-play keeps working and milestones
  never pay out twice; incomplete/deadlocked lines can be rebuilt.

This is gameplay progression, **not** the final art pipeline. More industry
routes, seamless scene animations, sound and fully artist-made sprites remain
in the milestone backlog.

## V2 iteration 0.3 — adult visitor with meaningful orders

**月纱 / Moonveil**, an explicitly adult **28-year-old** witch merchant, visits
only when the player successfully fulfills the first normal factory order.
Her moonlit costume is deliberately more mature (off-shoulder dress,
exposed waist, slit skirt, jewellery, gloves), with elegant, non-explicit
fantasy styling. The small, petlike original workshop workers remain
completely non-sexualized.

The visitor is not a cosmetic overlay: her **optional time-sensitive premium
order** demands five more cores than the warehouse holds at the time she
appears. Accepting it competes with the normal order for the exact same
inventory. Finish by the deadline and earn 135 coins; miss it and lose
20 coins. Ignore the offer and it simply expires. No romance-click currency
or meaningless gift buttons.

Her own 8-frame Canvas2D raster portrait is an original *transitional*
character asset, integrated as a PixiJS AnimatedSprite on both desktop
and mobile stages. A compact order section appears on the existing
contract panel. Game state keeps the optional `patron` value in V2 saves;
previous V2 saves lacking it remain valid. V1 saves are completely separate.

This is a **character-and-gameplay integration pass**, not the full
hand-painted final art. Next visual milestone is commissioned cohesive
sprite sheets with mature character expressions and real hand-drawn actions.

## V2 visual iteration 0.2 — authored raster sprites and motion

The original technical greybox has been upgraded to **GPU texture-backed raster
sprites**. A reusable Canvas2D bitmap painter prepares each machine, a
textured floor, an illustrated dusk backdrop, and **eight independently
defined frames for each of three creature workers**, with species-specific
silhouettes (water courier, leafy gardener, horned ember smith). PixiJS now
hosts AnimatedSprite workers and Sprite machines. Connected staffed machines
visibly exchange moving colored resource motes. Mobile renders a taller portrait composition with larger plots and three\nanimated worker portraits so the board no longer floats in oversized blank\nspace. Mobile plots remain the same logical 5-column production grid; material\nadjacency never changes between devices.

This is an **intermediate raster art pass**. The frames are programmatically
painted with gradients, line work and procedural texture; they are not the
commissioned, fully art-directed sprite sheets from the concept art, nor
high-end animation. The separate `src/pixi-stage.ts` still documents the
external asset atlas contract for a final artist-produced replacement.

Verification includes strict PixiJS typecheck/build, browser click-to-produce
end-to-end tests, and desktop/mobile visual screenshots. Gameplay rules and
the saved V2 state have not changed. The original V1 apartment remains
untouched.

## Play the factory laboratory

Run `cd v2 && npm install && npm run dev` to launch the standalone WebGL lab
at http://127.0.0.1:3901/ . In the laboratory:

1. Select the existing greenhouse (plot 08) and move it next to the pump (plot 06).
2. Build a kiln in the newly emptied spot (plot 08).
3. Assign Brook to the pump, Fern to the greenhouse, Cinder to the kiln.
4. Press **Start shift**. Water flows to the greenhouse; two spores flow into
   the kiln, producing two cores. Meet the timed contract and earn capital.
5. Try a broken layout or the wrong worker to see the concrete bottleneck and
   missed deadline. Reset to try again.

The board itself is PixiJS/WebGL and pointer-interactive. The surrounding
operation console uses semantic DOM controls for input accessibility. V2 uses
its own `monster-apartment:workshop-v2-lab` localStorage key.

The lab is a **playability experiment**, not an approved visual overhaul:
the temporary shapes are clearly marked and must be replaced by approved
painted sprites before any official V2 release.

## Asset quality gate

The Pixi renderer requires all entries below before it can mount:
`world/backdrop.webp`, `world/floor.webp`,
`machines/{mist-pump,spore-greenhouse,crystal-kiln}.png`,
`creatures/{brook,fern,cinder}/idle-{0..7}.png`.

A consistent visual bible, size/proportion rules, readable silhouettes, proper
sprite-sheet pose changes and composition on a real phone are prerequisites to
publishing V2. No SVG-to-PNG conversion shortcut.

V2 typecheck, static bundling and browser smoke tests are tracked separately\nfrom the frozen original game. The greybox preview can ship to its own\n/workshop/ path, but never replaces the original home page.
