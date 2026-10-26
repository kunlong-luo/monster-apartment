import {build} from 'esbuild';
import {mkdir,copyFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
await mkdir(resolve(root,'dist/assets'),{recursive:true});
await build({
  entryPoints:[resolve(root,'src/standalone.ts')],
  outfile:resolve(root,'dist/assets/workshop.js'),
  bundle:true,minify:true,format:'esm',target:'es2022',
  sourcemap:false,logLevel:'info',
});
// Next.js owns /workshop/ route; the sidecar IIFE only mounts on request.
await build({
  entryPoints:[resolve(root,'src/runtime.ts')],
  outfile:resolve(root,'dist/assets/workshop-runtime.js'),
  bundle:true,minify:true,format:'iife',globalName:'MoonworkRuntime',
  target:'es2022',logLevel:'info',
});
await copyFile(resolve(root,'src/workshop.css'),resolve(root,'dist/assets/workshop.css'));
await copyFile(
  resolve(root,'node_modules/@fontsource/noto-sans-sc/files/noto-sans-sc-chinese-simplified-400-normal.woff2'),
  resolve(root,'dist/assets/noto-sans-sc.woff2'),
);
await copyFile(resolve(root,'art/moon-workshop.avif'),resolve(root,'dist/assets/moon-workshop.avif'));
await copyFile(resolve(root,'art/moonveil-portrait.avif'),resolve(root,'dist/assets/moonveil-portrait.avif'));
await copyFile(resolve(root,'art/worker-triptych.avif'),resolve(root,'dist/assets/worker-triptych.avif'));
await copyFile(resolve(root,'art/moonstone-floor.avif'),resolve(root,'dist/assets/moonstone-floor.avif'));
await copyFile(resolve(root,'art/kiln-art-review.avif'),resolve(root,'dist/assets/kiln-art-review.avif'));
await copyFile(resolve(root,'art/well-art-review.avif'),resolve(root,'dist/assets/well-art-review.avif'));
await copyFile(resolve(root,'art/garden-art-review.avif'),resolve(root,'dist/assets/garden-art-review.avif'));
await copyFile(resolve(root,'index.html'),resolve(root,'dist/index.html'));
