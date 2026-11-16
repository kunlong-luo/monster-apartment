import {expect,test} from '@playwright/test';

const sample=Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAAFklEQVR4nGMUicpjYGBgYmBgYGBgAAAKIADgurgZrAAAAABJRU5ErkJggg==',
  'base64',
);

test('R12 local art reviewer previews file bytes without publishing or persisting them',async({page})=>{
  test.setTimeout(60_000);
  await page.goto('/orders/?r12-art-review=1');
  const reviewer=page.getByTestId('r12-local-art-review');
  await expect(reviewer).toBeVisible();
  await expect(reviewer).toContainText('不会上传、保存或发布图片');
  const backdrop=page.getByTestId('moonwork-background');
  await expect(backdrop).toHaveAttribute('data-r12-scene-art','legacy');

  await page.getByTestId('r12-local-art-file').setInputFiles({
    name:'local-review.png',mimeType:'image/png',buffer:sample,
  });
  await expect(backdrop).toHaveAttribute('data-r12-scene-art','local-review');
  await expect(reviewer).toContainText('2×2');
  await expect(reviewer).toContainText('仅供构图预览');
  await expect.poll(()=>backdrop.evaluate(el=>getComputedStyle(el).backgroundImage))
    .toContain('blob:');
  // A transient local backdrop must not promote an image or duplicate R12 assets.
  await expect(backdrop.locator('img[data-r12-art-image]')).toHaveCount(0);

  await reviewer.getByRole('button',{name:'恢复原场景'}).click();
  await expect(backdrop).toHaveAttribute('data-r12-scene-art','legacy');
  await page.reload();
  await expect(reviewer).toBeVisible();
  await expect(backdrop).toHaveAttribute('data-r12-scene-art','legacy');
  await expect(reviewer).not.toContainText('local-review.png');

  await page.goto('/orders/');
  await expect(page.getByTestId('r12-local-art-review')).toHaveCount(0);
});

test('R12 opt-in reviewer is also available for apartment and warehouse',async({page})=>{
  for(const [route,id] of [
    ['/apartment/','.ga-backdrop'],
    ['/warehouse/','.mw-gothic-scene'],
  ] as const){
    await page.goto(route+'?r12-art-review=1');
    await expect(page.getByTestId('r12-local-art-review')).toBeVisible();
    await expect(page.locator(id)).toHaveAttribute('data-r12-scene-art','legacy');
  }
});
