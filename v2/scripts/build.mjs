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
await copyFile(resolve(root,'index.html'),resolve(root,'dist/index.html'));
