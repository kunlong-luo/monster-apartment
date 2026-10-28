import {test,expect} from '@playwright/test';

test('four personal suites reveal one cross-character investigation without extra income',async({page})=>{
  await page.goto('/characters/');
  for(const item of [
    {id:'brook',name:'泉泡',first:'空掉的工具挂钩',second:'水汽压力表'},
    {id:'fern',name:'青枝',first:'花期手札',second:'窗边月光花'},
    {id:'cinder',name:'炽角',first:'旧锻锤',second:'稳定器草图'},
  ] as const){
    await page.getByTestId('visit-worker-room-'+item.id).click();
    const dialog=page.getByRole('dialog',{name:'拜访'+item.name+'的房间'});
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button',{name:item.first}).click();
    await expect(page.getByTestId('scene-discovery')).toBeVisible();
    await dialog.getByRole('button',{name:item.second}).click();
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
