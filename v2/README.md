# 月光工坊 / Workshop V2 — technology reset

**Status: isolated development foundation, NOT the released game.**

The legacy **V0.10.0** game remains reachable and unchanged. V2 is a new project
inside this repository, not an attempt to reskin the old six-room simulation.

## Technical decision

- **PixiJS 8.21.0 / WebGL** owns the entire gameplay canvas, camera, actors,
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

## Asset quality gate

The Pixi renderer requires all entries below before it can mount:
`world/backdrop.webp`, `world/floor.webp`,
`machines/{mist-pump,spore-greenhouse,crystal-kiln}.png`,
`creatures/{brook,fern,cinder}/idle-{0..7}.png`.

A consistent visual bible, size/proportion rules, readable silhouettes, proper
sprite-sheet pose changes and composition on a real phone are prerequisites to
publishing V2. No SVG-to-PNG conversion shortcut.

The new folder can be typechecked separately after installing dependencies:
`cd v2 && npm install && npm run check`.
The existing CI is unchanged because the new visual art is not ready.
