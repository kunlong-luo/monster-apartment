/** Original, reproducible 2D equipment paintings authored for Monster Apartment.
 * SVG is an offline drawing source only; Pixi receives transparent 512px WebP.
 * These are review candidates, not approved final cinematic CG. */
import sharp from 'sharp';
import {mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

function circle(x,y,r,fill,stroke='',sw=1){return `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" ${stroke?`stroke="${stroke}" stroke-width="${sw}"`:''}/>`}

function ellipse(x,y,rx,ry,fill,stroke='',sw=1){return `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}" ${stroke?`stroke="${stroke}" stroke-width="${sw}"`:''}/>`}

function path(d,fill='none',stroke='',w=1){return `<path d="${d}" fill="${fill}" ${stroke?`stroke="${stroke}" stroke-width="${w}"`:''} stroke-linecap="round" stroke-linejoin="round"/>`}

function rect(x,y,w,h,rx,fill,stroke='',sw=1){return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" ${stroke?`stroke="${stroke}" stroke-width="${sw}"`:''}/>`}

function group(body,transform){return `<g transform="${transform}">${body}</g>`}

function accents(positions,fill='#f9d68d',radius=2.4){return positions.map(([x,y])=>circle(x,y,radius,fill,'#362235',1)).join('')}

function pipe(d,w=16){return path(d,'none','#140e1d',w+8)+path(d,'none','url(#brass)',w)+path(d,'none','#ffdfaa',Math.max(1.5,w*.15))}

function rivetBand(x,y,w,h,n=8){let content=rect(x,y,w,h,5,'url(#brass)','#291a2d',2)+rect(x+3,y+3,w-6,2,1,'#fff0c4');for(let i=0;i<n;i++){const a=(i+.5)/n;content+=circle(x+4+a*(w-8),y+h*.55,2.6,'#4e3441','#ffe9ae',.9)}return content}

function jewel(x,y,s,c='blue'){return group(path(`M 0 ${-s} L ${s*.62} ${-s*.2} L ${s*.42} ${s*.75} L 0 ${s} L ${-s*.65} ${s*.2} Z`,`url(#${c})`,'#ffe2b1',2)+path(`M 0 ${-s} L ${s*.12} 0 L 0 ${s} Z`,'#fff6e6')+path(`M ${s*.12} 0 L ${s*.62} ${-s*.2} L ${s*.42} ${s*.75}`,'none','#f5d8ba',1.5),`translate(${x} ${y})`)}

function defs(){return `<defs>
<linearGradient id="brass" x1="0" y1=".05" x2="1" y2=".9" gradientUnits="objectBoundingBox"><stop stop-color="#341b35"/><stop offset=".1" stop-color="#e4b46c"/><stop offset=".23" stop-color="#ffe2a5"/><stop offset=".42" stop-color="#97704d"/><stop offset=".65" stop-color="#54354a"/><stop offset=".86" stop-color="#be8859"/><stop offset="1" stop-color="#f2c47d"/></linearGradient>
<linearGradient id="steel" x1="0" y1="0" x2="1" y2=".8"><stop stop-color="#1b223d"/><stop offset=".21" stop-color="#566684"/><stop offset=".5" stop-color="#292b45"/><stop offset=".84" stop-color="#121a31"/><stop offset="1" stop-color="#68728d"/></linearGradient>
<linearGradient id="amethyst" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#121328"/><stop offset=".42" stop-color="#543552"/><stop offset=".76" stop-color="#24182c"/><stop offset="1" stop-color="#7c5174"/></linearGradient>
<linearGradient id="blue" x1="0" y1="0" x2=".95" y2="1"><stop stop-color="#e4fdff"/><stop offset=".13" stop-color="#a3ecff"/><stop offset=".31" stop-color="#1d78b4"/><stop offset=".62" stop-color="#165084"/><stop offset=".84" stop-color="#59dded"/><stop offset="1" stop-color="#122f69"/></linearGradient>
<linearGradient id="green" x1="0" y1="0" x2=".9" y2="1"><stop stop-color="#eefdc6"/><stop offset=".17" stop-color="#9bcc91"/><stop offset=".48" stop-color="#31735d"/><stop offset=".75" stop-color="#234c56"/><stop offset="1" stop-color="#91dc8d"/></linearGradient>
<linearGradient id="ember" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff3b1"/><stop offset=".2" stop-color="#ffc971"/><stop offset=".51" stop-color="#ff7048"/><stop offset=".74" stop-color="#a63c3d"/><stop offset="1" stop-color="#321c3a"/></linearGradient>
<radialGradient id="auraBlue"><stop stop-color="#a9f5ff" stop-opacity=".72"/><stop offset=".42" stop-color="#48b8fa" stop-opacity=".37"/><stop offset="1" stop-color="#43aaff" stop-opacity="0"/></radialGradient>
<radialGradient id="auraGreen"><stop stop-color="#e4ffc3" stop-opacity=".62"/><stop offset=".52" stop-color="#75e3a3" stop-opacity=".27"/><stop offset="1" stop-color="#75caa0" stop-opacity="0"/></radialGradient>
<radialGradient id="auraFire"><stop stop-color="#fff1a1" stop-opacity=".8"/><stop offset=".3" stop-color="#ff9149" stop-opacity=".45"/><stop offset="1" stop-color="#ff7247" stop-opacity="0"/></radialGradient>
<radialGradient id="shade"><stop stop-color="#1e1324" stop-opacity="0"/><stop offset="1" stop-color="#060816" stop-opacity=".68"/></radialGradient>
</defs>`}

function commonBase(craft,level){
const hue=craft==='well'?'#6edff5':craft==='garden'?'#c5f2ab':'#ffcb85';
let s=ellipse(258,454,180,23,'#080b1b');
s+=ellipse(258,438,170,22,'url(#amethyst)','#d0a36a',5);
s+=path('M 92 433 L 126 404 L 388 404 L 424 433 L 408 454 L 104 454 Z','url(#steel)','#120e20',9);
s+=path('M 111 433 L 400 433','none','#f1cc8d',3);
s+=rivetBand(133,422,252,19,12);
s+=path('M 115 448 L 402 448','none','#5f4259',2);
for(let i=0;i<9;i++)s+=ellipse(130+i*31,440,2,1.3,'#ffddac');
if(level>=2){s+=rect(138,450,240,14,7,'url(#brass)','#271827',3);s+=accents([[155,456],[175,456],[337,456],[357,456]],hue,2.5)}
if(level>=3){s+=jewel(259,447,11,craft==='garden'?'green':craft==='well'?'blue':'ember')+path('M 121 454 l-9 -13 15 -11 M 390 454 l9 -13 -15 -11','none','#f4cf83',4)}
return s;
}

function well(level){
let s='';
s+=pipe('M 160 335 C 110 318 98 295 99 257 L 99 199 Q 99 181 119 181 L 149 181',15);
s+=pipe('M 349 308 L 385 308 Q 407 308 407 286 L 407 238 Q 407 224 388 224 L 364 224',14);
if(level>1)s+=pipe('M 343 182 L 393 182 Q 411 182 411 163 L 411 135',12);
s+=path('M 165 382 L 154 214 Q 155 179 183 177 L 330 177 Q 354 179 356 217 L 347 382 Z','url(#steel)','#1a1529',11);
s+=path('M 171 235 Q 160 193 196 191 L 316 191 Q 349 194 342 234 L 334 362 Q 259 393 179 363 Z','url(#blue)','#f2c98d',7);
s+=ellipse(258,263,101,171,'url(#auraBlue)');
s+=path('M 184 294 Q 253 273 328 292 L 333 356 Q 261 379 183 355 Z','#4aaed6');
s+=path('M 184 294 Q 253 273 328 292','none','#d6fdff',5);
for(let i=0;i<16+level*7;i++){const x=201+(i*37)%115,y=198+(i*53)%134,r=2+(i%5);s+=circle(x,y,r,i%3?'#84eeff':'#d5ffff','#e7fbff',.8)}
s+=path('M 202 218 Q 194 267 203 341','none','#fff8dc',6);
s+=path('M 212 227 Q 203 277 213 341','none','#c9f8ff',2);
s+=path('M 308 206 Q 332 259 307 350','none','#baf4ff',3);
s+=path('M 156 209 Q 161 173 193 166 L 322 166 Q 349 173 360 209 L 360 228 L 155 228 Z','url(#brass)','#251427',7);
s+=rivetBand(167,218,180,17,9);
s+=path('M 151 381 Q 258 396 361 381 L 368 408 Q 261 423 146 407 Z','url(#brass)','#302038',7);
s+=pipe('M 257 171 L 257 88',22);
s+=path('M 237 122 L 277 122 L 269 81 L 244 81 Z','url(#steel)','#eec18c',5);
s+=ellipse(257,122,34,12,'url(#brass)','#31243b',4);
s+=ellipse(257,75,19,9,'url(#brass)','#291c2b',3);
s+=path('M 257 64 L 257 36 M 245 48 L 257 29 L 269 48','none','#fad795',7);
s+=jewel(257,30,11,'blue');
s+=pipe('M 119 335 L 86 335 L 86 377',12);
s+=ellipse(100,340,45,45,'url(#steel)','#d7ac6b',6);
for(let i=0;i<8;i++){let a=i*Math.PI/4;s+=path(`M ${100+12*Math.cos(a)} ${340+12*Math.sin(a)} L ${100+34*Math.cos(a)} ${340+34*Math.sin(a)}`,'none','#c99b66',6)}
s+=circle(100,340,15,'url(#brass)','#f6cc8e',3)+circle(100,340,6,'#201c2c','#f8d29a',2);
s+=rivetBand(151,360,210,16,12);
if(level>=2){s+=ellipse(388,244,30,30,'url(#steel)','#e3b877',5)+ellipse(388,244,23,23,'#11243d','#f8d68c',3);s+=path('M 387 242 L 402 230','none','#e6bc78',3);s+=accents([[388,221],[366,244],[409,245],[388,269]],'#faf2d5',2)}
if(level>=3){s+=pipe('M 139 192 L 138 132 Q 138 99 176 103',11);s+=jewel(174,99,13,'blue');s+=path('M 157 389 L 143 407 L 156 425 M 354 388 L 370 407 L 357 423','none','#f5c67e',7)}
return s+commonBase('well',level);
}

function leaves(x,y,a,r,color='#71b683'){
return group(path(`M 0 0 C ${-r*.8} ${-r*.8} ${-r*.15} ${-r*1.6} ${r*.4} ${-r*1.7} Q ${r*.8} ${-r*.4} 0 0 Z`,color,'#d5eab0',1.8)+path(`M 0 0 L ${r*.35} ${-r*1.5}`,'none','#eaffc1',1.5),`translate(${x} ${y}) rotate(${a})`)
}

function garden(level){
let s='';
s+=pipe('M 110 389 L 110 331 Q 110 311 136 311 L 156 311',10);
s+=pipe('M 400 388 L 400 322 Q 400 308 372 308',10);
s+=path('M 140 355 L 146 193 Q 160 96 256 84 Q 359 99 372 193 L 379 361 Z','url(#steel)','#1b152b',10);
s+=path('M 154 352 L 163 195 Q 181 110 257 106 Q 330 112 352 195 L 363 352 Z','url(#green)','#e8cd91',6);
s+=ellipse(256,255,141,156,'url(#auraGreen)');
s+=path('M 164 202 Q 176 123 256 111 Q 336 125 351 205 L 352 353 L 164 353 Z','url(#shade)');
s+=path('M 255 109 L 255 350 M 170 209 L 351 209 M 175 289 L 342 289','none','#dbb87a',7);
s+=path('M 156 226 Q 189 183 255 179 Q 326 180 363 230 M 159 283 Q 201 246 255 242 Q 317 245 360 285','none','#bda06a',4);
s+=path('M 166 346 Q 175 153 256 122 Q 336 149 354 346','none','#f8e3ad',2);
s+=path('M 183 174 Q 214 128 247 122','none','#f2ffe1',6);
s+=path('M 209 152 Q 186 208 187 277','none','#e8ffe9',3);
s+=path('M 259 359 Q 252 279 248 241 Q 243 206 222 182 M 259 335 Q 294 297 301 244 M 242 318 Q 206 274 198 238','none','#4a795a',8);
for(let i=0;i<9+level*4;i++){const x=193+(i*43)%126,y=290+(i*29)%69,r=11+(i%5)*2;let a=(i*59)%340;s+=leaves(x,y,a,r,i%2?'#70b987':'#b5d686')}
for(let i=0;i<8+level*4;i++){const x=190+(i*43)%126,y=176+(i*57)%160,r=2+i%3;s+=circle(x,y,r,i%2?'#d5fc8e':'#f3ffda');s+=ellipse(x,y,12,12,'url(#auraGreen)')}
s+=path('M 139 348 L 376 348 L 389 397 Q 256 422 124 398 Z','url(#amethyst)','#e4bb80',8);
s+=path('M 135 375 Q 251 401 385 375','none','#f5d7a2',6);
s+=rivetBand(134,396,245,19,12);
s+=path('M 256 80 L 256 52 M 237 86 L 238 68 Q 257 51 274 67 L 275 86','none','#e7be79',8);
s+=jewel(256,48,14,'green');
s+=path('M 140 215 Q 104 191 90 218 Q 111 257 152 244 M 365 215 Q 403 193 426 227 Q 397 262 367 247','url(#green)','#cfb178',5);
s+=path('M 146 219 Q 123 226 117 239 M 368 221 Q 395 234 402 239','none','#eefbd2',3);
if(level>=2){s+=rect(95,297,63,48,9,'url(#brass)','#29182c',4)+rect(357,298,63,48,9,'url(#brass)','#29182c',4);s+=jewel(125,320,13,'green')+jewel(388,320,13,'green')}
if(level>=3){s+=path('M 170 165 L 158 120 L 188 140 M 342 165 L 354 120 L 324 140','none','#f9d397',8);s+=jewel(161,115,9,'green')+jewel(349,115,9,'green');s+=path('M 208 90 Q 254 70 302 90','none','#d9aa68',6)}
return s+commonBase('garden',level);
}

function kiln(level){
let s='';
s+=pipe('M 187 341 L 135 341 Q 115 338 115 312 L 115 251',16);
s+=pipe('M 353 345 L 401 345 Q 427 339 427 301 L 427 233',15);
s+=path('M 211 174 L 213 80 Q 256 58 300 80 L 301 177','url(#steel)','#f0bf7f',8);
s+=rect(221,47,71,48,7,'url(#brass)','#231b31',6);
s+=ellipse(256,46,45,12,'url(#brass)','#23152b',4);
s+=path('M 244 43 L 256 20 L 268 43','none','#f8d696',8);
s+=path('M 147 385 L 147 196 Q 154 132 211 121 L 304 121 Q 372 145 373 204 L 377 393 Z','url(#amethyst)','#c69d71',10);
s+=path('M 154 216 Q 164 137 253 135 Q 345 137 367 218','none','#fff0ad',5);
s+=path('M 166 242 L 348 242 M 171 278 L 356 278 M 168 315 L 349 315 M 176 355 L 341 355','none','#846072',3);
s+=ellipse(260,287,105,129,'url(#auraFire)');
s+=path('M 189 358 L 185 258 Q 192 188 258 168 Q 329 189 332 259 L 326 367 Z','#23162b','#ffcd7f',10);
s+=path('M 202 355 L 199 260 Q 200 207 258 189 Q 318 210 319 264 L 312 357 Z','url(#ember)','#ffc97f',5);
s+=ellipse(256,283,85,83,'url(#auraFire)');
for(let i=0;i<7+level*2;i++){let x=221+(i*31)%80,y=294+(i*19)%49,r=6+i%3*4;s+=path(`M ${x} ${y+20} Q ${x-r} ${y+2} ${x} ${y-13} Q ${x+r} ${y} ${x} ${y+20}`,'#ffba6a','#ffe8b0',1.1)}
s+=jewel(257,290,42,'ember')+jewel(237,330,17,'ember')+jewel(278,330,19,'ember');
s+=path('M 190 364 L 332 364 L 351 389 L 160 389 Z','url(#brass)','#251a2e',6);
s+=rivetBand(173,373,160,19,9);
s+=ellipse(252,132,67,18,'url(#brass)','#211827',5);
s+=path('M 260 130 L 260 94 M 233 102 L 253 83 L 274 103','none','#d7a86e',6);
s+=jewel(256,95,15,'ember');
s+=circle(169,250,21,'url(#steel)','#f2cf8c',5)+circle(343,249,21,'url(#steel)','#f2cf8c',5);
s+=circle(170,252,8,'url(#brass)')+circle(343,252,8,'url(#brass)');
for(let i=0;i<8;i++)s+=circle(173+i*24,152,3,'#ffe0a3','#3c2434',1.5);
if(level>=2){s+=pipe('M 138 286 L 95 286 L 95 216',11)+pipe('M 378 280 L 412 280 L 412 183',11);s+=rect(382,154,61,26,5,'url(#brass)','#26182a',5);s+=jewel(110,231,11,'ember')}
if(level>=3){s+=path('M 166 176 L 141 151 L 155 112 L 187 148 M 351 177 L 374 151 L 360 112 L 331 148','url(#brass)','#291b30',4);s+=jewel(153,116,13,'ember')+jewel(363,116,13,'ember');s+=rivetBand(178,399,160,15,8)}
return s+commonBase('kiln',level);
}

function artwork(craft,level){const content=craft==='well'?well(level):craft==='garden'?garden(level):kiln(level);return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">${defs()}<g stroke-linejoin="round" stroke-linecap="round">${content}</g></svg>`}

async function prepare(){
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
for(const craft of ['well','garden','kiln'])for(const level of [1,2,3]){
const filename=resolve(root,'art/production/machines',craft,`lv${level}.webp`);
await mkdir(dirname(filename),{recursive:true});
const input=Buffer.from(artwork(craft,level));
const {width,height}=await sharp(input).metadata();
if(width!==512||height!==512)throw Error('Invalid source dimensions: '+craft+' Lv.'+level);
await sharp(input,{density:144}).resize(512,512).webp({quality:92,effort:3,alphaQuality:100}).toFile(filename);
console.log('[machine-art] '+craft+' Lv.'+level);
}}

await prepare();
