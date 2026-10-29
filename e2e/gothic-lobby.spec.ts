import {test,expect} from '@playwright/test';

test('lobby fills the viewport and keeps meaningful controls at screen edges',async({page})=>{
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/');
  await expect(page.getByTestId('gothic-lobby')).toBeVisible();
  await expect(page.getByRole('navigation',{name:'主要游戏功能'}).getByRole('link')).toHaveCount(7);
  await expect(page.getByRole('navigation',{name:'快捷功能'})).toHaveCount(0);
  await expect(page.getByTestId('lobby-coins')).toHaveText('100');
  // Lobby uses the compact HUD; ordinary destinations remain fully labeled.
  const dockLinks=page.getByRole('navigation',{name:'主要游戏功能'}).getByRole('link');
  const dockSize=await dockLinks.first().evaluate(el=>el.getBoundingClientRect().width);
  expect(dockSize).toBeGreaterThan(70);
  expect(dockSize).toBeLessThan(280);
  await expect(page.getByTestId('gothic-eclipse-feature')).toBeVisible();
  await expect(page.getByTestId('gothic-commission-status')).toContainText('待交付');
  await expect(page.getByTestId('gothic-character-room')).toHaveAttribute('href',/visit=yuesha/);
  const size=await page.evaluate(()=>({
    width:document.documentElement.scrollWidth-innerWidth,
    height:document.documentElement.scrollHeight-innerHeight,
  }));
  expect(size.width).toBeLessThanOrEqual(1);
  expect(size.height).toBeLessThanOrEqual(1);
  await page.getByRole('button',{name:'与月纱交谈'}).click();
  await expect(page.getByRole('dialog',{name:'与月纱交谈'})).toBeVisible();
  await page.getByRole('button',{name:'关闭面板'}).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByRole('navigation',{name:'主要游戏功能'})
    .getByRole('link',{name:/公寓/}).click();
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
  await page.getByRole('button',{name:'与月纱交谈'}).click();
  await page.getByRole('button',{name:'接受月纱的特别委托'}).click();
  await expect(page.getByRole('status')).toContainText('契约已经成立');
  await page.getByRole('button',{name:'关闭面板'}).click();
  await page.getByRole('navigation',{name:'主要游戏功能'})
    .getByRole('link',{name:'工坊'}).click();
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

test('information modal traps focus without a duplicated route menu',async({page})=>{
  await page.goto('/');
  const trigger=page.getByRole('button',{name:'委托消息'});
  await trigger.click();
  const dialog=page.getByRole('dialog',{name:'委托消息'});
  await expect(dialog).toBeVisible();
  await expect(dialog).toBeFocused();
  await expect(dialog.getByRole('link')).toHaveCount(1);
  await page.keyboard.press('Shift+Tab');
  await expect(dialog.getByRole('link',{name:/管理委托/})).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(dialog.getByRole('button',{name:'关闭面板'})).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test('motion preference survives routes and suppresses Pixi particles',async({page})=>{
  await page.goto('/');
  const motion=page.getByRole('button',{name:'切换动态特效'});
  await motion.click();
  await expect(motion).toHaveAttribute('aria-pressed','true');
  await expect.poll(()=>page.evaluate(()=>
    localStorage.getItem('monster-apartment:gothic-motion-reduced'))).toBe('1');
  await page.getByRole('navigation',{name:'主要游戏功能'})
    .getByRole('link',{name:/公寓/}).click();
  await expect(page.getByTestId('gothic-pixi-atmosphere').locator('canvas')).toHaveCount(0);
  await expect(page.getByTestId('gothic-apartment')).toHaveClass(/ga--still/);
  await page.getByRole('navigation',{name:'公寓世界导航'}).getByRole('link',{name:'大厅',exact:true}).click();
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
  await page.getByRole('navigation',{name:'主要游戏功能'}).getByRole('link',{name:'工坊'}).click();
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
  await expect(page.getByTestId('gothic-scene-illumination')).toBeAttached();
  await page.getByRole('navigation',{name:'主要游戏功能'})
    .getByRole('link',{name:/公寓/}).click();
  await expect(page.getByTestId('gothic-apartment')).toBeVisible();
  await page.getByRole('navigation',{name:'公寓世界导航'})
    .getByRole('link',{name:'大厅',exact:true}).click();
  await expect(page.getByTestId('gothic-lobby')).toBeVisible();
  await expect(painting).toHaveJSProperty('naturalWidth',original.width);
});

test('scene links transition safely with reduced motion and keep full-size imagery',async({page})=>{
  test.setTimeout(90_000);
  await page.setViewportSize({width:1280,height:800});
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.goto('/');
  const curtain=page.getByTestId('gothic-route-transition');
  await expect(curtain).toHaveAttribute('data-phase','idle');
  await expect(curtain).toHaveCSS('pointer-events','none');
  const lobby=page.getByTestId('gothic-lobby-painting-image');
  await lobby.evaluate((img:HTMLImageElement)=>img.decode());
  await page.getByRole('navigation',{name:'主要游戏功能'})
    .getByRole('link',{name:/公寓/}).click();
  await expect(page.getByTestId('gothic-apartment')).toBeVisible();
  await expect(page.getByTestId('gothic-scene-illumination')).toHaveAttribute('data-variant','apartment');
  await expect(curtain).toHaveAttribute('data-phase','idle',{timeout:5000});
  const background=await page.locator('.ga-backdrop').evaluate(el=>getComputedStyle(el).backgroundImage);
  expect(background).toContain('lobby-hero');
  expect(background).not.toContain('../lobby-hero');
  await page.getByRole('navigation',{name:'公寓世界导航'})
    .getByRole('link',{name:'大厅',exact:true}).click();
  await expect(page.getByTestId('gothic-lobby')).toBeVisible();
  await expect(lobby).toHaveJSProperty('complete',true);
  await page.getByRole('button',{name:'切换动态特效'}).click();
  await expect(page.getByRole('button',{name:'切换动态特效'})).toHaveAttribute('aria-pressed','true');
  await page.getByRole('navigation',{name:'主要游戏功能'})
    .getByRole('link',{name:/公寓/}).click();
  await expect(page.getByTestId('gothic-apartment')).toBeVisible();
  await expect(curtain).toHaveAttribute('data-phase','idle');
  await expect(curtain).toHaveCSS('opacity','0');
});

test('workshop provides a direct and safe return to the main lobby',async({page})=>{
  test.setTimeout(90_000);
  await page.goto('/workshop/');
  await expect(page.getByTestId('v2-stage').locator('canvas')).toBeVisible({timeout:30000});
  await page.getByRole('navigation',{name:'月光工坊世界'}).getByRole('link',{name:'大厅',exact:true}).click();
  await expect(page.getByTestId('gothic-lobby')).toBeVisible();
  const image=page.getByTestId('gothic-lobby-painting-image');
  await expect(image).toHaveJSProperty('complete',true);
  expect(await image.evaluate((img:HTMLImageElement)=>img.naturalWidth)).toBeGreaterThan(0);
});

// The overlay must not play when another handler prevents a link navigation.
test('cancelled links do not dim the scene or navigate',async({page})=>{
  await page.goto('/');
  // Ensure React has hydrated before injecting a test-only link.
  await page.getByRole('button',{name:'委托消息'}).click();
  await expect(page.getByRole('dialog',{name:'委托消息'})).toBeVisible();
  await page.getByRole('button',{name:'关闭面板'}).click();
  const result=await page.evaluate(()=>{
    const anchor=document.createElement('a');
    anchor.href='/workshop/';
    anchor.textContent='被取消的导航';
    anchor.addEventListener('click',event=>event.preventDefault());
    document.querySelector('main')!.appendChild(anchor);
    const allowed=anchor.dispatchEvent(new MouseEvent('click',{
      bubbles:true,cancelable:true,button:0,
    }));
    const phase=document.querySelector<HTMLElement>('[data-testid="gothic-route-transition"]')
      ?.dataset.phase;
    anchor.remove();
    return {allowed,phase,pathname:window.location.pathname};
  });
  expect(result.allowed).toBe(false);
  expect(result.phase).toBe('idle');
  expect(result.pathname).toBe('/');
});

test('main quest reflects saved stock and presents readable progress',async({page})=>{
  await page.goto('/');
  const quest=page.getByTestId('gothic-main-quest');
  const progress=page.getByTestId('gothic-main-quest-progress');
  await expect(quest).toBeVisible();
  const min=Number(await progress.getAttribute('aria-valuemin'));
  const max=Number(await progress.getAttribute('aria-valuemax'));
  const now=Number(await progress.getAttribute('aria-valuenow'));
  expect(min).toBe(0);
  expect(max).toBeGreaterThan(0);
  expect(now).toBeGreaterThanOrEqual(0);
  expect(now).toBeLessThanOrEqual(max);
  await expect(quest).toHaveAttribute('href',/workshop/);
  await quest.click();
  await expect(page).toHaveURL(/\/workshop\/?$/);
});

test('hidden tabs suspend candle animation and resume when visible again',async({page})=>{
  await page.goto('/');
  const lighting=page.getByTestId('gothic-scene-illumination');
  await expect(lighting).toHaveAttribute('data-motion','ambient');
  await page.evaluate(()=>{
    Object.defineProperty(document,'visibilityState',{configurable:true,get:()=> 'hidden'});
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(lighting).toHaveAttribute('data-motion','still');
  await page.evaluate(()=>{
    Reflect.deleteProperty(document,'visibilityState');
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(lighting).toHaveAttribute('data-motion','ambient');
});
