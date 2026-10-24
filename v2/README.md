# 月光工坊 / Workshop V2 — technology reset

**Status: playable GAMEPLAY LAB (greybox), not the final visual release.**\n\nOpen /workshop/ to try the isolated prototype after CI succeeds; original / still hosts frozen V1. The lab deliberately uses simple Pixi drawing primitives as TEMPORARY technical proxies. This is not the promised painted creature sprite art.

The legacy **V0.10.0** game remains reachable and unchanged. V2 is a new project
inside this repository, not an attempt to reskin the old six-room simulation.

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

## V2 visual iteration 0.2 — authored raster sprites and motion

The original technical greybox has been upgraded to **GPU texture-backed raster
sprites**. A reusable Canvas2D bitmap painter prepares each machine, a
textured floor, an illustrated dusk backdrop, and **eight independently
defined frames for each of three creature workers**, with species-specific
silhouettes (water courier, leafy gardener, horned ember smith). PixiJS now
hosts AnimatedSprite workers and Sprite machines. Connected staffed machines
visibly exchange moving colored resource motes. The mobile game board no longer
floats in an oversized blank flex panel.

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
