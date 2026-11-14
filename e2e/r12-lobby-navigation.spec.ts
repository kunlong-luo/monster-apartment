import {expect,test} from '@playwright/test';

test('R12 lobby world menu exposes every canonical place and restores keyboard focus',async({page})=>{
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/');
  const quick=page.getByRole('navigation',{name:'主要游戏功能'});
  const toggle=quick.getByRole('button',{name:'全部地点'});
  await expect(quick.getByRole('link')).toHaveCount(4);
  await expect(quick.getByRole('link',{name:'暗夜公寓'})).toBeVisible();
  await expect(quick.getByRole('link',{name:'工坊'})).toBeVisible();
  await expect(quick.getByRole('link',{name:'角色图鉴'})).toBeVisible();
  await expect(quick.getByRole('link',{name:'月光街'})).toBeVisible();
  await expect(page.getByTestId('lobby-world-menu')).toHaveCount(0);
  await toggle.focus();
  await page.keyboard.press('Enter');
  await expect(toggle).toHaveAttribute('aria-expanded','true');
  const world=page.getByRole('navigation',{name:'全部地点导航'});
  await expect(world.getByRole('link')).toHaveCount(7);
  const paths=await world.getByRole('link').evaluateAll(elements=>elements.map(el=>el.getAttribute('data-destination')));
  expect(paths).toEqual(['/', '/apartment/', '/workshop/', '/characters/', '/orders/', '/town/', '/warehouse/']);
  await expect(world.getByRole('link',{name:'大厅'})).toHaveAttribute('aria-current','page');
  await page.keyboard.press('Escape');
  await expect(world).toHaveCount(0);
  await expect(toggle).toBeFocused();
  await expect(toggle).toHaveAttribute('aria-expanded','false');
  await toggle.click();
  await world.getByRole('link',{name:'委托大厅'}).click();
  await expect(page).toHaveURL(/\/orders\/?$/);
  await expect(page.getByTestId('moonwork-world')).toBeVisible();
});

test('R12 mobile displays only three quick routes, keeps the full map and never scrolls sideways',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('/');
  const quick=page.getByRole('navigation',{name:'主要游戏功能'});
  await expect(quick.getByRole('link')).toHaveCount(3);
  const toggle=quick.getByRole('button',{name:'全部地点'});
  const hit=await toggle.boundingBox();
  expect(hit).not.toBeNull();
  expect(hit!.width).toBeGreaterThanOrEqual(44);
  expect(hit!.height).toBeGreaterThanOrEqual(44);
  await toggle.click();
  const menu=page.getByTestId('lobby-world-menu');
  await expect(menu.getByRole('link')).toHaveCount(7);
  const bounds=await menu.boundingBox();
  expect(bounds).not.toBeNull();
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  expect(bounds!.x+bounds!.width).toBeLessThanOrEqual(391);
  expect(bounds!.y).toBeGreaterThanOrEqual(0);
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
  expect(overflow).toBeLessThanOrEqual(2);
  await page.keyboard.press('Escape');
  await expect(menu).toHaveCount(0);
  await toggle.click();
  await menu.getByRole('link',{name:'魔法仓库'}).click();
  await expect(page).toHaveURL(/\/warehouse\/?$/);
});

test('R12 short mobile screens keep the world menu operable and reduced motion functional',async({page})=>{
  await page.setViewportSize({width:390,height:550});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/');
  const toggle=page.getByTestId('lobby-world-toggle');
  await toggle.click();
  await expect(page.getByTestId('lobby-world-menu').getByRole('link')).toHaveCount(7);
  await expect(toggle).toHaveAttribute('aria-expanded','true');
  await page.getByTestId('lobby-world-menu').getByRole('link',{name:'月光街'}).click();
  await expect(page).toHaveURL(/\/town\/?$/);
});
