import {build} from 'esbuild';
import {mkdir,copyFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
await mkdir(resolve(root,'dist/assets'),{recursive:true});
await build({
  entryPoints:[resolve(root,'src/main.ts')],
  outfile:resolve(root,'dist/assets/workshop.js'),
  bundle:true,minify:true,format:'esm',target:'es2022',
  sourcemap:false,logLevel:'info',
});
await copyFile(resolve(root,'src/workshop.css'),resolve(root,'dist/assets/workshop.css'));
await copyFile(
  resolve(root,'node_modules/@fontsource/noto-sans-sc/files/noto-sans-sc-chinese-simplified-400-normal.woff2'),
  resolve(root,'dist/assets/noto-sans-sc.woff2'),
);
await copyFile(resolve(root,'art/moon-workshop.avif'),resolve(root,'dist/assets/moon-workshop.avif'));
await copyFile(resolve(root,'art/moonveil-portrait.avif'),resolve(root,'dist/assets/moonveil-portrait.avif'));
await copyFile(resolve(root,'index.html'),resolve(root,'dist/index.html'));
