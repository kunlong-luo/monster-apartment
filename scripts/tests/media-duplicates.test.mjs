import assert from 'node:assert/strict';
import test from 'node:test';
import {createHash} from 'node:crypto';
import {auditMediaDuplicates,auditMediaCatalog} from '../audit-media-duplicates.mjs';

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

test('catalog requires tracked paths, bytes and blob prefix exactly once',()=>{
  const bytes=Buffer.from('image');
  const entries=[{path:'public/art/a.webp',bytes},{path:'docs/b.png',bytes},{path:'docs/note.md',bytes}];
  const sha=createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex').slice(0,12);
  const tick=String.fromCharCode(96);
  const row=path=>'| '+tick+path+tick+' | '+bytes.length+' | '+tick+sha+tick+' |';
  const valid='## 5. Inventory\n\n### Public\n'+row('public/art/a.webp')+'\n\n### Evidence\n'+row('docs/b.png')+'\n\n## 6. History\n'+row('old.png');
  const report=auditMediaCatalog(entries,valid);
  assert.deepEqual(report.issues,[]);
  assert.equal(report.mediaCount,2);
  assert.equal(report.totalBytes,bytes.length*2);
  assert.deepEqual(report.groups['public/art'],{paths:1,bytes:bytes.length});
  assert(auditMediaCatalog(entries,valid.replace(row('docs/b.png'),'')).issues.some(s=>s.includes('Missing catalog path')));
  assert(auditMediaCatalog(entries,valid.replace(row('docs/b.png'),row('old.png'))).issues.some(s=>s.includes('not tracked media')));
  assert(auditMediaCatalog(entries,valid.replace(row('docs/b.png'),row('docs/b.png')+'\n'+row('docs/b.png'))).issues.some(s=>s.includes('Repeated')));
  assert(auditMediaCatalog(entries,valid.replace(sha,'000000000000')).issues.some(s=>s.includes('mismatch')));
  assert(auditMediaCatalog(entries,valid.replace(' | '+bytes.length+' |',' | 99 |')).issues.some(s=>s.includes('mismatch')));
  assert(auditMediaCatalog(entries,'## 6. History').issues.some(s=>s.includes('Missing catalog section')));
});
