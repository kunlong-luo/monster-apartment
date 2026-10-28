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
    await hotspot.click();
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
  await page.getByTestId('scene-object-seal').click();
  await expect(page.getByTestId('scene-discovery')).toContainText('月纹');
  await page.getByRole('button',{name:/返回月纱对话/}).click();
  await expect(page.getByTestId('yuesha-private-room')).toHaveCount(0);
});
