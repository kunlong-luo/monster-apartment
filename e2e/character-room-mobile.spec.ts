import {test,expect} from '@playwright/test';
import type {Page} from '@playwright/test';

/** Synthetic environment-only bitmap for preview tests; never production artwork. */
async function reviewBackgroundCandidate(page:Page){
  const base64=await page.evaluate(async()=>{
    const canvas=document.createElement('canvas');
    canvas.width=1920;canvas.height=1080;
    const ctx=canvas.getContext('2d');
    if(!ctx)throw Error('Canvas missing');
    const gradient=ctx.createLinearGradient(0,0,1920,1080);
    gradient.addColorStop(0,'#35204f');
    gradient.addColorStop(1,'#98715b');
    ctx.fillStyle=gradient;
    ctx.fillRect(0,0,1920,1080);
    const blob=await new Promise<Blob>((resolve,reject)=>
      canvas.toBlob(file=>file?resolve(file):reject(Error('WebP export failed')),'image/webp',.88));
    const bytes=new Uint8Array(await blob.arrayBuffer());
    let raw='';for(const byte of bytes)raw+=String.fromCharCode(byte);
    return btoa(raw);
  });
  return {name:'review-only-room.webp',mimeType:'image/webp',buffer:Buffer.from(base64,'base64')};
}


test('mobile personal suites keep hotspots inside the scene and close naturally',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('/characters/');
  for(const room of [
    {id:'brook',name:'泉泡',first:'toolbox'},
    {id:'fern',name:'青枝',first:'herbarium'},
    {id:'cinder',name:'炽角',first:'hammer'},
  ] as const){
    await page.getByTestId('visit-worker-room-'+room.id).click();
    const dialog=page.getByRole('dialog',{name:'拜访'+room.name+'的房间'});
    await expect(dialog).toBeVisible();
    await expect(dialog.getByTestId('room-scene-backdrop').locator('img'))
      .toHaveAttribute('src',new RegExp(room.id+'/concept-scene\\.svg'));
    await page.screenshot({path:'test-results/room-'+room.id+'-mobile.png'});
    const scene=page.getByLabel(room.name+'的房间概念场景');
    const sceneBox=await scene.boundingBox();
    const hotspot=page.getByTestId('scene-object-'+room.first);
    const hotBox=await hotspot.boundingBox();
    expect(sceneBox).not.toBeNull();
    expect(hotBox).not.toBeNull();
    if(!sceneBox||!hotBox)throw Error('Scene or hotspot has no interactive geometry');
    expect(hotBox.x).toBeGreaterThanOrEqual(sceneBox.x);
    expect(hotBox.y).toBeGreaterThanOrEqual(sceneBox.y);
    expect(hotBox.x+hotBox.width).toBeLessThanOrEqual(sceneBox.x+sceneBox.width+1);
    expect(hotBox.y+hotBox.height).toBeLessThanOrEqual(sceneBox.y+sceneBox.height+1);
    await expect(hotspot).toHaveAttribute('data-marker-layout','compact');
    expect(hotBox.width).toBeGreaterThanOrEqual(43.99);
    expect(hotBox.height).toBeGreaterThanOrEqual(43.99);
    expect(hotBox.width).toBeLessThanOrEqual(45);
    await hotspot.click();
    await expect(hotspot).toHaveAttribute('aria-pressed','true');
    await expect(page.getByTestId('room-scene-focus')).toHaveAttribute('data-object-id',room.first);
    await expect(page.getByTestId('scene-discovery')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
  }
});

test('mobile Moonsha visit still supports scenic inspection and return',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('/apartment/');
  await page.getByRole('button',{name:'与女主人月纱交流'}).click();
  await page.getByTestId('visit-yuesha-room').click();
  await expect(page.getByTestId('yuesha-private-room')).toBeVisible();
  await expect(page.getByTestId('room-scene-backdrop')).toBeVisible();
  await expect(page.getByTestId('room-scene-backdrop')).toHaveAttribute('data-composition','layered-concept');
  await expect(page.getByTestId('room-resident-layer')).toHaveAttribute('data-render-mode','separate');
  await expect(page.getByTestId('room-resident-present-yuesha')).toHaveCount(1);
  await page.screenshot({path:'test-results/room-yuesha-mobile.png'});
  await expect(page.getByTestId('scene-object-seal')).toHaveAttribute('data-marker-layout','compact');
  await page.getByTestId('scene-object-seal').click();
  await expect(page.getByTestId('room-scene-focus')).toHaveAttribute('data-object-id','seal');
  await page.screenshot({path:'test-results/room-yuesha-inspection-mobile.png'});
  await expect(page.getByTestId('scene-discovery')).toContainText('月纹');
  await expect(page.getByTestId('yuesha-memory-progress')).toContainText('1 / 4');
  await expect(page.getByTestId('yuesha-memory-card-ledger')).toBeDisabled();
  await page.getByTestId('yuesha-memory-card-seal').click();
  await expect(page.getByTestId('room-scene-focus')).toHaveAttribute('data-object-id','seal');
  await page.getByRole('button',{name:/返回月纱对话/}).click();
  await expect(page.getByTestId('yuesha-private-room')).toHaveCount(0);
});


test('mobile cinematic performance scrolls into view and exits without closing the room',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('/apartment/');
  await page.getByRole('button',{name:'与女主人月纱交流'}).click();
  await page.getByTestId('visit-yuesha-room').click();
  await page.getByTestId('room-topic-yuesha-moon').click();
  await expect(page.getByTestId('room-dialogue-theater')).toBeInViewport();
  await expect(page.getByTestId('room-dialogue-theater')).toHaveAttribute('data-beat-pose','attentive');
  await expect(page.getByTestId('room-resident-layer')).toHaveAttribute('data-pose','attentive');
  await expect(page.getByTestId('room-story-light')).toHaveAttribute('data-story-light','attentive');
  await page.getByTestId('room-theater-skip').click();
  await expect(page.getByTestId('room-dialogue-theater')).toHaveAttribute('data-beat-pose','warm');
  await expect(page.getByTestId('room-resident-layer')).toHaveAttribute('data-pose','warm');
  await expect(page.getByTestId('room-story-light')).toHaveAttribute('data-story-light','warm');
  await page.getByTestId('room-theater-close').click();
  await expect(page.getByTestId('room-resident-layer')).toHaveAttribute('data-pose','idle');
  await expect(page.getByTestId('room-story-light')).toHaveAttribute('data-story-light','ambient');
  await expect(page.getByTestId('yuesha-private-room')).toBeVisible();
  await expect(page.getByTestId('room-dialogue-theater')).toHaveCount(0);
});

test('optional in-game HD review only uses an ephemeral local preview',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('/apartment/');
  await page.getByRole('button',{name:'与女主人月纱交流'}).click();
  await page.getByTestId('visit-yuesha-room').click();
  await expect(page.getByTestId('room-art-local-file')).toHaveCount(0);

  await page.goto('/apartment/?roomArtReview=1');
  await page.getByRole('button',{name:'与女主人月纱交流'}).click();
  await page.getByTestId('visit-yuesha-room').click();
  await expect(page.getByTestId('room-art-local-review')).toBeVisible();
  await expect(page.getByTestId('room-art-review-toggle')).toHaveAttribute('aria-expanded','false');
  await page.getByTestId('room-art-review-toggle').click();
  await expect(page.getByTestId('room-art-review-toggle')).toHaveAttribute('aria-expanded','true');
  const backdrop=page.getByTestId('room-scene-backdrop');
  await expect(backdrop).toHaveAttribute('data-local-preview','false');
  await page.getByTestId('room-art-local-file').setInputFiles('public/art/yuesha-bust-v3.webp');
  await expect(page.getByTestId('room-art-local-review').getByRole('alert')).toContainText('背景候选须至少');
  await expect(backdrop).toHaveAttribute('data-local-preview','false');
  await page.getByTestId('room-art-local-file').setInputFiles(await reviewBackgroundCandidate(page));
  await expect(backdrop).toHaveAttribute('data-local-preview','true');
  await expect(backdrop.locator('img')).toHaveAttribute('src',/^blob:/);
  await expect(page.getByTestId('room-resident-layer')).toHaveAttribute('data-render-mode','separate');
  await page.getByTestId('room-art-local-reset').click();
  await expect(backdrop).toHaveAttribute('data-local-preview','false');
  await expect(backdrop.locator('img')).toHaveAttribute('src',/concept-scene[.]svg$/);
});

test('transparent portrait review rejects baked CG and previews alpha-only frames without saving',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('/apartment/?roomArtReview=1');
  await page.getByRole('button',{name:'与女主人月纱交流'}).click();
  await page.getByTestId('visit-yuesha-room').click();
  await page.getByTestId('room-art-review-toggle').click();
  await expect(page.getByTestId('room-pose-review')).toBeVisible();
  await expect(page.getByTestId('room-resident-layer')).toHaveAttribute('data-local-pose-preview','false');
  await page.getByTestId('room-pose-upload-idle').setInputFiles('public/art/yuesha-bust-v3.webp');
  await expect(page.getByTestId('room-pose-review-error')).toBeVisible();
  await expect(page.getByTestId('room-resident-layer')).toHaveAttribute('data-local-pose-preview','false');

  const base64=await page.evaluate(async()=>{
    const canvas=document.createElement('canvas');
    canvas.width=1024;canvas.height=1024;
    const ctx=canvas.getContext('2d');
    if(!ctx)throw Error('No canvas available');
    ctx.fillStyle='#cfa6eb';
    ctx.beginPath();ctx.ellipse(512,520,225,355,0,0,Math.PI*2);ctx.fill();
    const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(x=>x?resolve(x):reject(Error('WebP export failed')),'image/webp',.88));
    const bytes=new Uint8Array(await blob.arrayBuffer());
    let binary='';for(const byte of bytes)binary+=String.fromCharCode(byte);
    return btoa(binary);
  });
  await page.getByTestId('room-pose-upload-idle').setInputFiles({
    name:'idle.webp',mimeType:'image/webp',buffer:Buffer.from(base64,'base64'),
  });
  await expect(page.getByTestId('room-resident-layer')).toHaveAttribute('data-local-pose-preview','true');
  await expect(page.getByTestId('room-resident-present-yuesha').locator('img'))
    .toHaveAttribute('src',/^blob:/);
  const retiringUrl=await page.getByTestId('room-resident-present-yuesha').locator('img').getAttribute('src');
  expect(retiringUrl).toMatch(/^blob:/);
  await page.getByTestId('room-pose-upload-idle').setInputFiles({
    name:'idle.webp',mimeType:'image/webp',buffer:Buffer.from(base64,'base64'),
  });
  // The same art uploaded as a different pose is not four distinct poses.
  await page.getByTestId('room-pose-upload-attentive').setInputFiles({
    name:'attentive.webp',mimeType:'image/webp',buffer:Buffer.from(base64,'base64'),
  });
  await expect(page.getByTestId('room-pose-review-error')).toContainText('几乎相同');
  await expect(page.getByTestId('room-pose-review')).toContainText('1/4');
  await expect(page.getByTestId('room-resident-layer')).toHaveAttribute('data-pose','idle');
  // Exiting old frame remains alive throughout its 240ms fade.
  expect(await page.evaluate(async url=>{if(!url)return false;try{return (await fetch(url)).ok;}catch{return false;}},retiringUrl)).toBe(true);
  await page.waitForTimeout(600);
  expect(await page.evaluate(async url=>{if(!url)return false;try{return (await fetch(url)).ok;}catch{return false;}},retiringUrl)).toBe(false);
  await page.getByTestId('room-pose-reset').click();
  await expect(page.getByTestId('room-resident-layer')).toHaveAttribute('data-local-pose-preview','false');
  await expect(page.getByTestId('room-pose-review')).toContainText('0/4');
});

test('compact-height local art preview keeps overlapping prop accessible without blocking the room',async({page})=>{
  await page.setViewportSize({width:390,height:550});
  await page.goto('/apartment/?roomArtReview=1');
  await page.getByRole('button',{name:'与女主人月纱交流'}).click();
  await page.getByTestId('visit-yuesha-room').click();
  await page.getByTestId('room-art-review-toggle').click();
  await page.getByTestId('room-art-local-file').setInputFiles(await reviewBackgroundCandidate(page));
  await expect(page.getByTestId('room-scene-backdrop')).toHaveAttribute('data-local-preview','true');
  await page.getByTestId('room-art-review-toggle').click();
  await expect(page.getByTestId('room-art-review-toggle')).toHaveAttribute('aria-expanded','false');
  // Enlarging the painted stage can change an inaccessible marker from
  // "overlap" to "offscreen"; both retain a 44px accessible fallback.
  await expect(page.getByTestId('room-offscreen-toggle'))
    .toContainText(/更多调查物件|画面外物件/);
  if(await page.getByTestId('scene-object-tea').count()===0)
    await page.getByTestId('room-offscreen-toggle').click();
  await expect(page.getByTestId('scene-object-tea')).toBeVisible();
  await page.getByTestId('scene-object-tea').click();
  await expect(page.getByTestId('room-scene-focus')).toHaveAttribute('data-object-id','tea');
  await expect(page.getByTestId('scene-discovery')).toContainText('桂皮');
});

test('all three worker rooms can review local background and reject nontransparent CG without publishing',async({page})=>{
  test.setTimeout(90_000);
  await page.setViewportSize({width:390,height:844});
  await page.goto('/characters/?roomArtReview=1');
  for(const id of ['brook','fern','cinder'] as const){
    await page.getByTestId('visit-worker-room-'+id).click();
    const room=page.getByTestId('worker-private-room-'+id);
    const review=room.getByTestId('room-art-local-review');
    await expect(review).toHaveAttribute('data-review-room',id);
    const backdrop=room.getByTestId('room-scene-backdrop');
    await expect(backdrop).toHaveAttribute('data-local-preview','false');
    await review.getByTestId('room-art-review-toggle').click();
    await expect(review.getByText(/概念版调查热点坐标/)).toBeVisible();
    await review.getByTestId('room-art-local-file').setInputFiles(await reviewBackgroundCandidate(page));
    await expect(backdrop).toHaveAttribute('data-local-preview','true');
    await expect(backdrop.locator('img')).toHaveAttribute('src',/^blob:/);
    await review.getByTestId('room-pose-upload-idle').setInputFiles('public/art/yuesha-bust-v3.webp');
    await expect(review.getByTestId('room-pose-review-error')).toBeVisible();
    await review.getByTestId('room-art-local-reset').click();
    await expect(backdrop).toHaveAttribute('data-local-preview','false');
    await expect(backdrop.locator('img')).toHaveAttribute('src',/concept-scene[.]svg$/);
    await page.getByRole('button',{name:'离开'+({brook:'泉泡',fern:'青枝',cinder:'炽角'} as const)[id]+'的房间'}).click();
    await expect(room).toHaveCount(0);
  }
  await expect(page.getByTestId('painted-worker-gallery')).toBeVisible();
});

test('on-duty worker stays away in gameplay while local art review may inspect a temporary actor',async({page})=>{
  test.setTimeout(90_000);
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/workshop/');
  await expect(page.getByTestId('v2-stage').locator('canvas')).toBeVisible({timeout:30_000});
  await page.getByTestId('workshop-auto-assign').click();
  await expect.poll(()=>page.evaluate(()=>{
    const saved=localStorage.getItem('monster-apartment:workshop-v2-lab');
    return saved?JSON.parse(saved).tiles[5]?.worker:null;
  })).toBe('brook');
  await page.setViewportSize({width:390,height:844});
  await page.goto('/characters/?roomArtReview=1');
  await page.getByTestId('visit-worker-room-brook').click();
  const room=page.getByTestId('worker-private-room-brook');
  const layer=room.getByTestId('room-resident-layer');
  await expect(layer).toHaveAttribute('data-render-mode','away');
  await expect(layer).toHaveAttribute('data-review-performer','false');
  const review=room.getByTestId('room-art-local-review');
  await review.getByTestId('room-art-review-toggle').click();
  const base64=await page.evaluate(async()=>{
    const canvas=document.createElement('canvas');
    canvas.width=1024;canvas.height=1024;
    const ctx=canvas.getContext('2d');
    if(!ctx)throw Error('No 2D context');
    ctx.fillStyle='#dfbcf1';
    ctx.beginPath();ctx.ellipse(512,520,230,345,0,0,Math.PI*2);ctx.fill();
    // A perfect ellipse has a long bounding edge and correctly fails the
    // existing portrait crop test. Add two tiny silhouette details.
    ctx.fillRect(233,498,65,32);ctx.fillRect(728,498,65,32);
    const blob=await new Promise<Blob>((resolve,reject)=>
      canvas.toBlob(file=>file?resolve(file):reject(Error('WebP export failed')),'image/webp',.9));
    const bytes=new Uint8Array(await blob.arrayBuffer());
    let result='';for(const byte of bytes)result+=String.fromCharCode(byte);
    return btoa(result);
  });
  await review.getByTestId('room-pose-upload-idle').setInputFiles({
    name:'idle.webp',mimeType:'image/webp',buffer:Buffer.from(base64,'base64'),
  });
  await expect(review.getByTestId('room-pose-review')).toContainText('1/4');
  await expect(review.getByTestId('room-pose-review-error')).toHaveCount(0);
  await expect(layer).toHaveAttribute('data-render-mode','separate');
  await expect(layer).toHaveAttribute('data-review-performer','true');
  await expect(room.getByTestId('room-resident-present-brook')).toBeVisible();
  await expect(room.getByTestId('worker-room-dialogue-brook')).toContainText('目前无人应答');
  await review.getByTestId('room-pose-reset').click();
  await expect(layer).toHaveAttribute('data-render-mode','away');
  await expect(layer).toHaveAttribute('data-review-performer','false');
  await expect(room.getByTestId('room-resident-away-brook')).toBeVisible();
});

test('production art preview remains hidden in regular worker rooms',async({page})=>{
  await page.goto('/characters/');
  await page.getByTestId('visit-worker-room-fern').click();
  const room=page.getByTestId('worker-private-room-fern');
  await expect(room.getByTestId('room-art-local-review')).toHaveCount(0);
  await expect(room.getByTestId('room-scene-backdrop')).toHaveAttribute('data-art-quality','concept');
  await expect(room.getByTestId('room-resident-layer')).toHaveAttribute('data-art-quality','concept');
});
 
test('reduced-motion story lighting stays still while dialogue completes in one scene',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.setViewportSize({width:390,height:844});
  await page.goto('/apartment/');
  await page.getByRole('button',{name:'与女主人月纱交流'}).click();
  await page.getByTestId('visit-yuesha-room').click();
  await page.getByTestId('room-topic-yuesha-moon').click();
  const light=page.getByTestId('room-story-light');
  await expect(light).toHaveAttribute('data-motion','still');
  await expect(light).toHaveAttribute('data-story-light','warm');
  await expect(page.getByTestId('room-dialogue-theater')).toHaveAttribute('data-state','finished');
  await expect(page.getByTestId('room-theater-skip')).toHaveCount(0);
  expect(await light.locator('.private-room__story-light--warm').evaluate(el=>
    getComputedStyle(el).transitionDuration)).toBe('0s');
  await page.getByTestId('room-theater-close').click();
  await expect(light).toHaveAttribute('data-story-light','ambient');
});

test('worker room uses its own cinematic light palette without blocking prop hotspots',async({page})=>{
  test.setTimeout(90_000);
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.setViewportSize({width:390,height:844});
  await page.goto('/characters/');
  await page.getByTestId('visit-worker-room-fern').click();
  const room=page.getByTestId('worker-private-room-fern');
  await room.getByTestId('room-topic-fern-plant').click();
  await expect(room.getByTestId('room-dialogue-theater')).toBeVisible();
  await expect(room.getByTestId('room-story-light')).toHaveAttribute('data-story-light','warm');
  await room.getByTestId('room-theater-close').click();
  await expect(room.getByTestId('room-story-light')).toHaveAttribute('data-story-light','ambient');
  // The same physical prop may live in the accessible overflow menu when
  // the narrow stage crop makes its 44px hotspot overlap another.
  if(await room.getByTestId('scene-object-herbarium').count()===0)
    await room.getByTestId('room-offscreen-toggle').click();
  await expect(room.getByTestId('scene-object-herbarium')).toBeVisible();
});

test('reference-aligned private suite keeps the full painting dominant with a quiet right rail',async({page})=>{
  test.setTimeout(90_000);
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/characters/');
  await page.getByTestId('visit-worker-room-fern').click();
  const room=page.getByTestId('worker-private-room-fern');
  await expect(room).toHaveAttribute('data-room-layout','scenic-left-rail-right');
  const stage=room.getByTestId('worker-room-stage');
  const rail=room.getByTestId('room-story-rail');
  const stageRect=await stage.boundingBox(),railRect=await rail.boundingBox();
  expect(stageRect&&railRect).toBeTruthy();
  if(!stageRect||!railRect)throw Error('Scene grid did not render');
  expect(stageRect.width/railRect.width).toBeGreaterThan(1.9);
  expect(stageRect.height).toBeGreaterThan(550);
  await expect(room.getByTestId('room-character-archive')).not.toHaveAttribute('open','');
  await room.getByTestId('room-character-archive').locator('summary').click();
  await expect(room.getByTestId('room-character-archive')).toHaveAttribute('open','');
  await room.getByTestId('room-topic-fern-plant').click();
  await expect(room.getByTestId('room-topic-response-fern')).toContainText('正在场景中演出');
  await expect(room.getByTestId('room-topic-response-fern')).not.toContainText('植物不会说话');
  await room.getByTestId('room-theater-close').click();
  await expect(room.getByTestId('room-topic-response-fern')).toContainText('植物不会说话');
});

test('narrow suite keeps the scenic room first and never overflows horizontally',async({page})=>{
  test.setTimeout(90_000);
  await page.setViewportSize({width:390,height:844});
  await page.goto('/characters/');
  await page.getByTestId('visit-worker-room-cinder').click();
  const room=page.getByTestId('worker-private-room-cinder');
  await expect(room.getByTestId('worker-room-stage')).toBeVisible();
  await expect(room.getByTestId('room-story-rail')).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth))
    .toBeLessThanOrEqual(390);
  const stage=await room.getByTestId('worker-room-stage').boundingBox();
  const rail=await room.getByTestId('room-story-rail').boundingBox();
  expect(stage&&rail).toBeTruthy();
  if(!stage||!rail)throw Error('Missing scenic stage or rail');
  expect(stage.y).toBeLessThan(rail.y);
  expect(stage.height).toBeGreaterThanOrEqual(380);
});
