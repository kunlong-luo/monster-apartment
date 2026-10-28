import {test,expect} from '@playwright/test';

test('four personal suites reveal one cross-character investigation without extra income',async({page})=>{
  await page.goto('/characters/');
  for(const item of [
    {id:'brook',name:'泉泡',first:'toolbox',second:'gauge'},
    {id:'fern',name:'青枝',first:'herbarium',second:'moonflower'},
    {id:'cinder',name:'炽角',first:'hammer',second:'blueprint'},
  ] as const){
    await page.getByTestId('visit-worker-room-'+item.id).click();
    const dialog=page.getByRole('dialog',{name:'拜访'+item.name+'的房间'});
    await expect(dialog).toBeVisible();
    await dialog.getByTestId('scene-object-'+item.first).click();
    await expect(page.getByTestId('scene-discovery')).toBeVisible();
    await dialog.getByTestId('scene-object-'+item.second).click();
    await dialog.getByRole('button',{name:'离开'+item.name+'的房间'}).click();
  }
  await page.getByRole('link',{name:/拜访月纱会客室/}).click();
  await expect(page.getByTestId('yuesha-private-room')).toBeVisible();
  await page.getByRole('button',{name:'月纹蜡封'}).click();
  await page.getByRole('button',{name:'旧账簿'}).click();
  await expect(page.getByTestId('yuesha-four-room-memory')).toContainText('四个人的房间');
  await page.goto('/characters/');
  await expect(page.getByTestId('room-memory-gallery')).toContainText('4 / 4');
  await expect(page.getByTestId('memory-card-contract')).toBeEnabled();
  await page.getByTestId('memory-card-contract').click();
  await expect(page.getByTestId('memory-card-detail')).toContainText('半月');
  await page.getByTestId('investigation-toggle').click();
  await expect(page.getByTestId('room-investigation-journal')).toContainText('4/4');
  await expect(page.getByTestId('investigation-conclusion')).toBeVisible();
  await page.reload();
  await page.getByTestId('investigation-toggle').click();
  await expect(page.getByTestId('investigation-conclusion')).toContainText('四个人的房间');
});
