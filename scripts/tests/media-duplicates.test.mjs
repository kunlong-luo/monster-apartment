import assert from 'node:assert/strict';
import test from 'node:test';
import {createHash} from 'node:crypto';
import {auditMediaDuplicates} from '../audit-media-duplicates.mjs';

test('exact duplicate bytes are rejected unless the precise path set and bytes are approved',()=>{
  const bytes=Buffer.from('same image');
  const entries=[{path:'public/a.webp',bytes},{path:'docs/b.webp',bytes},{path:'docs/unique.png',bytes:Buffer.from('unique')},{path:'docs/notes.md',bytes}];
  const exception={paths:['docs/b.webp','public/a.webp'],bytes:bytes.length,gitBlob:createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex')};
  const initial=auditMediaDuplicates(entries,[]);
  assert.equal(initial.mediaCount,3);
  assert.equal(initial.unexpected.length,1);
  assert.equal(auditMediaDuplicates(entries,[exception]).unexpected.length,0);
  assert.equal(auditMediaDuplicates([...entries,{path:'public/third.webp',bytes}],[exception]).unexpected.length,1);
  const changed=entries.map(row=>row.path.endsWith('.webp')?{...row,bytes:Buffer.from('changed')}:row);
  assert.equal(auditMediaDuplicates(changed,[exception]).unexpected.length,1);
});
