import {test,expect} from '@playwright/test';

test('shared cinematic palette reaches apartment, workshop and commission screens',async({page})=>{
  test.setTimeout(120_000);
  await page.setViewportSize({width:390,height:844});
  await page.goto('/apartment/');
  await expect(page.getByTestId('gothic-apartment')).toHaveClass(/ga--red-gold/);
  await expect(page.getByRole('navigation',{name:'公寓世界导航'}).getByRole('link')).toHaveCount(7);
  await expect(page.getByTestId('ga-room-2')).toBeVisible();
  await page.getByTestId('ga-room-2').click();
  await expect(page.getByTestId('ga-room-drawer')).toBeVisible();
  await page.goto('/orders/');
  await expect(page.getByTestId('moonwork-world')).toHaveAttribute('data-area','orders');
  await expect(page.locator('.mw-main--red-gold')).toBeVisible();
  await expect(page.getByRole('navigation',{name:'月光工坊世界'}).getByRole('link')).toHaveCount(7);
  await expect(page.getByTestId('world-cores')).toHaveText('0');
  await page.goto('/workshop/');
  await expect(page.getByTestId('v2-stage').locator('canvas')).toBeVisible({timeout:30_000});
  await expect(page.getByTestId('next-workshop-shell')).toHaveClass(/gothic-workshop-shell--red-gold/);
  await expect(page.getByTestId('v2-world-nav').getByRole('link')).toHaveCount(7);
  await expect(page.getByTestId('v2-shift')).toBeVisible();
  const spill=await page.evaluate(()=>({
    horizontal:document.documentElement.scrollWidth-innerWidth,
    vertical:document.documentElement.scrollHeight-innerHeight,
  }));
  expect(spill.horizontal).toBeLessThanOrEqual(2);
  expect(spill.vertical).toBeLessThanOrEqual(2);
});

test('real market inventory and red-gold navigation stay readable at 320px',async({page})=>{
  await page.setViewportSize({width:320,height:700});
  await page.goto('/town/');
  const dock=page.getByRole('navigation',{name:'月光工坊世界'});
  await expect(dock.getByRole('link')).toHaveCount(7);
  await expect(dock.getByRole('link',{name:'月光街',exact:true})).toHaveAttribute('aria-current','page');
  await expect(page.getByTestId('moonlit-market')).toBeVisible();
  await expect(page.getByTestId('world-coins')).not.toBeEmpty();
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
  expect(overflow).toBeLessThanOrEqual(2);
});
