import {test,expect} from '@playwright/test';

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
  await page.getByTestId('room-theater-close').click();
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
  await page.getByTestId('room-art-local-file').setInputFiles('public/art/yuesha-bust-v3.webp');
  await expect(page.getByTestId('room-scene-backdrop')).toHaveAttribute('data-local-preview','true');
  await page.getByTestId('room-art-review-toggle').click();
  await expect(page.getByTestId('room-art-review-toggle')).toHaveAttribute('aria-expanded','false');
  // These 44px hit boxes collide after a 16:9 crop to a 315px-high stage.
  await expect(page.getByTestId('room-offscreen-toggle')).toContainText('更多调查物件');
  await expect(page.getByTestId('scene-object-tea')).toHaveCount(0);
  await page.getByTestId('room-offscreen-toggle').click();
  await expect(page.getByTestId('scene-object-tea')).toHaveAttribute('data-marker-layout','offscreen');
  await page.getByTestId('scene-object-tea').click();
  await expect(page.getByTestId('room-scene-focus')).toHaveAttribute('data-object-id','tea');
  await expect(page.getByTestId('scene-discovery')).toContainText('桂皮');
});
