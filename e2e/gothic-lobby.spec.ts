import {test,expect} from '@playwright/test';

test('lobby fills the viewport and keeps meaningful controls at screen edges',async({page})=>{
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/');
  await expect(page.getByTestId('gothic-lobby')).toBeVisible();
  await expect(page.getByRole('navigation',{name:'主要游戏功能'}).getByRole('link')).toHaveCount(5);
  await expect(page.getByRole('navigation',{name:'快捷功能'}).getByRole('link')).toHaveCount(3);
  await expect(page.getByTestId('lobby-coins')).toHaveText('100');
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
  await expect(page.getByRole('heading',{name:'灵核公寓'})).toBeVisible();
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
