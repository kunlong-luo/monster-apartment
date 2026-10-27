import {test,expect} from '@playwright/test';

test('lobby fills the viewport and keeps meaningful controls at screen edges',async({page})=>{
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/');
  await expect(page.getByTestId('gothic-lobby')).toBeVisible();
  await expect(page.getByRole('navigation',{name:'主要游戏功能'}).getByRole('link')).toHaveCount(5);
  await expect(page.getByRole('navigation',{name:'快捷功能'}).getByRole('link')).toHaveCount(3);
  await expect(page.getByTestId('lobby-coins')).toHaveText('100');
  // Lobby uses the compact HUD; ordinary destinations remain fully labeled.
  const dockLinks=page.getByRole('navigation',{name:'主要游戏功能'}).getByRole('link');
  const dockSize=await dockLinks.first().evaluate(el=>el.getBoundingClientRect().width);
  expect(dockSize).toBeLessThanOrEqual(64);
  const size=await page.evaluate(()=>({
    width:document.documentElement.scrollWidth-innerWidth,
    height:document.documentElement.scrollHeight-innerHeight,
  }));
  expect(size.width).toBeLessThanOrEqual(1);
  expect(size.height).toBeLessThanOrEqual(1);
  await page.getByRole('button',{name:'与月纱互动'}).click();
  await expect(page.getByRole('dialog',{name:'与月纱交谈'})).toBeVisible();
  await page.getByRole('button',{name:'关闭面板'}).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByRole('navigation',{name:'主要游戏功能'})
    .getByRole('link',{name:/公寓 ·/}).click();
  await expect(page).toHaveURL(/\/apartment\/?$/);
  await expect(page.getByTestId('gothic-apartment')).toBeVisible();
  await expect(page.getByTestId('ga-room-2')).toBeVisible();
});

test('lobby reflects a real shared workshop save without inventing currency',async({page})=>{
  await page.addInitScript(()=>{
    const key='monster-apartment:workshop-v2-lab';
    const tiles=Array.from({length:15},()=>null);
    localStorage.setItem(key,JSON.stringify({
      version:2,day:7,coins:243,tiles,warehouse:{core:3},
      order:{due:8,cores:6,reward:99},last:null,completed:1,failed:0,
      patron:{status:'offered',due:8,cores:7,reward:135}
    }));
  });
  await page.goto('/');
  await expect(page.getByTestId('lobby-coins')).toHaveText('243');
  await expect(page.getByTestId('lobby-cores')).toHaveText('3');
  await page.getByRole('button',{name:'与月纱互动'}).click();
  await page.getByRole('button',{name:'接受月纱的特别委托'}).click();
  await expect(page.getByRole('status')).toContainText('契约已经成立');
  await page.getByRole('button',{name:'关闭面板'}).click();
  await page.getByRole('button',{name:'全部功能'}).click();
  await expect(page.getByRole('dialog',{name:'所有功能'})).toBeVisible();
  await page.getByRole('dialog',{name:'所有功能'}).getByRole('link',{name:/晶核工坊/}).click();
  await expect(page).toHaveURL(/\/workshop\/?$/);
});

test('small screens fit the lobby without page scroll',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('/');
  await expect(page.getByRole('navigation',{name:'主要游戏功能'})).toBeVisible();
  const overflow=await page.evaluate(()=>({
    x:document.documentElement.scrollWidth-innerWidth,
    y:document.documentElement.scrollHeight-innerHeight
  }));
  expect(overflow.x).toBeLessThanOrEqual(1);
  expect(overflow.y).toBeLessThanOrEqual(1);
});

test('Tailwind modal traps focus and returns focus when dismissed',async({page})=>{
  await page.goto('/');
  const menu=page.getByRole('button',{name:'全部功能'});
  await menu.click();
  const dialog=page.getByRole('dialog',{name:'所有功能'});
  await expect(dialog).toBeVisible();
  await expect(dialog).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(dialog.getByRole('link',{name:/委托大厅/})).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(dialog.getByRole('button',{name:'关闭面板'})).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(menu).toBeFocused();
});

test('motion preference survives routes and suppresses Pixi particles',async({page})=>{
  await page.goto('/');
  const motion=page.getByRole('button',{name:'切换动态特效'});
  await motion.click();
  await expect(motion).toHaveAttribute('aria-pressed','true');
  await expect.poll(()=>page.evaluate(()=>
    localStorage.getItem('monster-apartment:gothic-motion-reduced'))).toBe('1');
  await page.getByRole('navigation',{name:'主要游戏功能'})
    .getByRole('link',{name:/公寓 ·/}).click();
  await expect(page.getByTestId('gothic-pixi-atmosphere').locator('canvas')).toHaveCount(0);
  await expect(page.getByTestId('gothic-apartment')).toHaveClass(/ga--still/);
  await page.getByRole('navigation',{name:'公寓世界导航'}).getByRole('link',{name:'大厅'}).click();
  await expect(page.getByRole('button',{name:'切换动态特效'})).toHaveAttribute('aria-pressed','true');
});

// Regression: Next client navigation sometimes omits a trailing slash.
// A relative ./lobby-hero.webp incorrectly resolves outside the Pages
// basePath after returning, exposing the tiny blurred Pixi art fallback.
test('returning from workshop retains the sharp full-resolution lobby painting',async({page})=>{
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/');
  const painting=page.getByTestId('gothic-lobby-painting-image');
  await expect(painting).toBeVisible();
  const original=await painting.evaluate(async(image:HTMLImageElement)=>{
    await image.decode();
    return {src:image.currentSrc,width:image.naturalWidth,height:image.naturalHeight};
  });
  expect(original.width).toBeGreaterThan(0);
  expect(original.height).toBeGreaterThan(0);
  expect(original.src).toContain('lobby-hero');
  await page.getByRole('navigation',{name:'快捷功能'}).getByRole('link',{name:'工坊'}).click();
  await expect(page).toHaveURL(/\/workshop\/?$/);
  await expect(page.getByTestId('v2-stage')).toBeVisible();
  // The workshop dock leads to world areas; browser Back also restores the
  // previous lobby. The apartment has a dedicated 返回大厅 navigation link.
  await page.goBack();
  await expect(page.getByTestId('gothic-lobby')).toBeVisible();
  const returned=await painting.evaluate(async(image:HTMLImageElement)=>{
    await image.decode();
    return {src:image.currentSrc,width:image.naturalWidth,height:image.naturalHeight,
      transform:getComputedStyle(image.parentElement!).transform};
  });
  expect(returned.src).toBe(original.src);
  expect(returned.width).toBe(original.width);
  expect(returned.height).toBe(original.height);
  expect(returned.transform).toBe('none');
  await page.getByRole('navigation',{name:'主要游戏功能'})
    .getByRole('link',{name:/公寓 ·/}).click();
  await expect(page.getByTestId('gothic-apartment')).toBeVisible();
  await page.getByRole('navigation',{name:'公寓世界导航'})
    .getByRole('link',{name:'大厅'}).click();
  await expect(page.getByTestId('gothic-lobby')).toBeVisible();
  await expect(painting).toHaveJSProperty('naturalWidth',original.width);
});
