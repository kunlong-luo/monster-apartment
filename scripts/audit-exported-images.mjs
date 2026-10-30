/** Static-export image URL audit for /monster-apartment GitHub Pages.
 * Scan SSR HTML: images must resolve to actual emitted files, not the
 * site's domain root or the Next.js /_next/image server endpoint.
 * A separate browser regression covers dynamically hydrated images.
 */
import {readFileSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';

const BASE='/monster-apartment/';
const root=resolve('out');
const routes=['index.html','apartment/index.html','town/index.html',
  'orders/index.html','characters/index.html','warehouse/index.html','workshop/index.html'];
let checked=0;
const failed=[];
for(const route of routes){
  const htmlFile=resolve(root,route);
  if(!existsSync(htmlFile))throw Error('Missing exported route: '+route);
  const html=readFileSync(htmlFile,'utf8');
  // Never attempt to parse the inline serialized RSC payload as HTML.
  // Restrict inspection to real HTML img/source/preload tags.
  for(const tag of html.matchAll(/<(?:img|source|link)\b[^>]*>/gi)){
    const element=tag[0];
    const isImage= /^<(img|source)\b/i.test(element) ||
      (/^<link\b/i.test(element)&&/\bas=["']image["']/i.test(element));
    if(!isImage)continue;
    const attr=/\b(src|srcset|href)\s*=\s*["']([^"']+)["']/gi;
    for(const field of element.matchAll(attr)){
      const attrName=field[1].toLowerCase();
      if(attrName==='href'&&!/^<link/i.test(element))continue;
      if(attrName==='srcset'&&!/^<source/i.test(element))continue;
      const candidates=attrName==='srcset'?field[2].split(',').map(s=>s.trim().split(/\s+/)[0]):[field[2]];
      for(const candidate of candidates){
        const raw=candidate.replaceAll('&amp;','&');
        if(!raw||/^(?:data:|blob:|https?:\/\/)/.test(raw))continue;
        checked++;
        if(!raw.startsWith(BASE)){
          failed.push(route+': image URL is outside Pages basePath: '+raw);
          continue;
        }
        if(raw.startsWith(BASE+'_next/image?')){
          failed.push(route+': requires unavailable Next image optimizer: '+raw);
          continue;
        }
        const pathname=decodeURIComponent(raw.split(/[?#]/)[0]);
        const relative=pathname.slice(BASE.length);
        if(relative.includes('..')||relative.startsWith('/')){
          failed.push(route+': unsafe image URL '+raw);
          continue;
        }
        if(!existsSync(resolve(root,relative))){
          failed.push(route+': image file is missing: '+raw);
        }
      }
    }
  }
}
if(checked===0)failed.push('No image URLs were found in exported HTML');
if(failed.length){
  for(const issue of failed)console.error('IMAGE AUDIT FAIL:',issue);
  process.exitCode=1;
}else{
  console.log('Pages image audit: '+checked+' emitted image URLs resolve under '+BASE+' across '+routes.length+' routes.');
}
