import {build} from 'esbuild';
import {mkdir,copyFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
await mkdir(resolve(root,'dist/assets'),{recursive:true});
// Next.js owns /workshop/ route; the sidecar IIFE only mounts on request.
await build({
  entryPoints:[resolve(root,'src/runtime.ts')],
  outfile:resolve(root,'dist/assets/workshop-runtime.js'),
  bundle:true,minify:true,format:'iife',globalName:'MoonworkRuntime',
  target:'es2022',logLevel:'info',
});
// Independent Pixi overlay for the Gothic App Router scenes.
await build({
  entryPoints:[resolve(root,'src/gothic-atmosphere.ts')],
  outfile:resolve(root,'dist/assets/gothic-atmosphere.js'),
  bundle:true,minify:true,format:'iife',globalName:'GothicAtmosphereRuntime',
  target:'es2022',logLevel:'info',
});
await copyFile(
  resolve(root,'node_modules/@fontsource/noto-sans-sc/files/noto-sans-sc-chinese-simplified-400-normal.woff2'),
  resolve(root,'dist/assets/noto-sans-sc.woff2'),
);
await copyFile(resolve(root,'../public/art/lobby-hero-v3.webp'),
  resolve(root,'dist/assets/lobby-hero-v3.webp'));
await copyFile(resolve(root,'../public/art/yuesha-avatar-v3.webp'),
  resolve(root,'dist/assets/yuesha-avatar-v3.webp'));
await copyFile(resolve(root,'../public/art/lobby-hero-v2.webp'),
  resolve(root,'dist/assets/lobby-hero-v2.webp'));
await copyFile(resolve(root,'art/moon-workshop.avif'),resolve(root,'dist/assets/moon-workshop.avif'));
await copyFile(resolve(root,'art/moonveil-portrait.avif'),resolve(root,'dist/assets/moonveil-portrait.avif'));
await copyFile(resolve(root,'art/worker-triptych.avif'),resolve(root,'dist/assets/worker-triptych.avif'));
await copyFile(resolve(root,'art/moonstone-floor.avif'),resolve(root,'dist/assets/moonstone-floor.avif'));
await copyFile(resolve(root,'art/kiln-art-review.avif'),resolve(root,'dist/assets/kiln-art-review.avif'));
await copyFile(resolve(root,'art/well-art-review.avif'),resolve(root,'dist/assets/well-art-review.avif'));
await copyFile(resolve(root,'art/garden-art-review.avif'),resolve(root,'dist/assets/garden-art-review.avif'));
