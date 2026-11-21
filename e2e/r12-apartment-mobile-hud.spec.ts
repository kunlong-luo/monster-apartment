import {expect,test} from '@playwright/test';
import {mkdirSync} from 'node:fs';

test('apartment status and controls remain reachable in 390px mobile viewport',async({page})=>{
  test.setTimeout(60_000);
  await page.setViewportSize({width:390,height:844});
  await page.goto('/apartment/',{waitUntil:'domcontentloaded'});
  const header=page.getByRole('banner',{name:'公寓资源与操作'});
  const label=header.getByTestId('game-location');
  const resources=header.getByLabel('公寓真实存档');
  const pause=header.getByRole('button',{name:'暂停公寓时间'});
  const journal=header.getByRole('button',{name:'公寓日志'});
  await expect(header).toBeVisible();
  await expect(label).toBeVisible();
  await expect(resources).toBeVisible();
  await expect(pause).toBeVisible();
  await expect(journal).toBeVisible();

  const parts=await header.locator(':scope > *').evaluateAll(children=>
    children.map(node=>{
      const r=node.getBoundingClientRect();
      return {left:r.left,top:r.top,right:r.right,bottom:r.bottom};
    }),
  );
  expect(parts).toHaveLength(3);
  // Row one is location + two icon buttons; all 4 resource values are below.
  expect(parts[1].top).toBeGreaterThanOrEqual(parts[0].bottom-2);
  expect(Math.abs(parts[0].top-parts[2].top)).toBeLessThan(10);
  for(const part of parts){
    expect(part.left).toBeGreaterThanOrEqual(-0.5);
    expect(part.right).toBeLessThanOrEqual(390.5);
  }
  const pills=await resources.locator(':scope > *').evaluateAll(nodes=>
    nodes.map(node=>{
      const r=node.getBoundingClientRect();
      return {left:r.left,right:r.right};
    }),
  );
  expect(pills).toHaveLength(4);
  for(const pill of pills){
    expect(pill.left).toBeGreaterThanOrEqual(-0.5);
    expect(pill.right).toBeLessThanOrEqual(390.5);
  }
  await expect(pause).toBeInViewport({ratio:1});
  await expect(journal).toBeInViewport({ratio:1});
  mkdirSync('visual-evidence/apartment',{recursive:true});
  await page.screenshot({path:'visual-evidence/apartment/mobile-390-hud.png',fullPage:false});

  // The same header must remain a one-row desktop HUD without a new dock.
  await page.setViewportSize({width:1440,height:900});
  const desktop=await header.locator(':scope > *').evaluateAll(children=>
    children.map(node=>node.getBoundingClientRect().top),
  );
  expect(Math.abs(desktop[0]-desktop[1])).toBeLessThan(10);
  expect(Math.abs(desktop[0]-desktop[2])).toBeLessThan(10);
  await page.screenshot({path:'visual-evidence/apartment/desktop-1440-hud.png',fullPage:false});
});
