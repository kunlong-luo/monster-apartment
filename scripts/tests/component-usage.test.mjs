import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {auditComponentUsage} from '../audit-component-usage.mjs';

test('distinguishes app, auxiliary and unreachable modules without deleting files', t=>{
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'component-usage-'));
  t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
  function write(file,content){
    const name=path.join(root,file);
    fs.mkdirSync(path.dirname(name),{recursive:true});
    fs.writeFileSync(name,content);
  }
  write('tsconfig.json',JSON.stringify({compilerOptions:{module:'ESNext',moduleResolution:'Bundler',jsx:'react-jsx',paths:{'@/*':['./src/*']}}}));
  write('app/page.tsx',"import '@/components/a'; import('@/components/lazy'); import type { Shape } from '@/components/types'; const p = './variable'; import(p);");
  write('src/components/a.tsx',"export { B } from './b'; import './style.css';");
  write('src/components/b.tsx','export const B = 1;');
  write('src/components/lazy.tsx','export const lazy = 1;');
  write('src/components/types.ts','export type Shape = string;');
  write('src/components/style.css','@import "./nested.css";');
  write('src/components/nested.css','.thing { color: red }');
  write('src/components/test-only.tsx','export const demo = 1;');
  write('tests/example.test.ts',"import '../src/components/test-only';");
  write('src/components/orphan.tsx',"import './orphan-child';");
  write('src/components/orphan-child.tsx','export const child = 1;');
  write('tests/file-reader.test.ts',"const name='src/components/orphan.tsx'; const missing='src/components/retired.tsx';");
  write('app/layout.tsx',"import '@/components/missing';");
  const result=auditComponentUsage(root);
  const status=Object.fromEntries(result.components.map(row=>[path.basename(row.path),row.status]));
  for(const name of ['a.tsx','b.tsx','lazy.tsx','types.ts','style.css','nested.css'])assert.equal(status[name],'app-reachable',name);
  assert.equal(status['test-only.tsx'],'auxiliary-only');
  assert.equal(status['orphan.tsx'],'review-unreachable');
  assert.equal(status['orphan-child.tsx'],'review-unreachable');
  assert.deepEqual(result.components.find(row=>row.path==='src/components/orphan.tsx').literalReferences,['tests/file-reader.test.ts']);
  assert.deepEqual(result.missingLiteralPaths,[{path:'src/components/retired.tsx',references:['tests/file-reader.test.ts']}]);
  assert.ok(result.unknown.some(row=>row.kind==='dynamic'));
  assert.ok(result.unresolved.some(row=>row.specifier==='@/components/missing'));
  assert.ok(fs.existsSync(path.join(root,'src/components/orphan.tsx')));
});
