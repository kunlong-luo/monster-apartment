import {test,expect} from '@playwright/test';

const LAB='http://127.0.0.1:3901/';
const CLICK=(canvas:{click:(options:{position:{x:number;y:number}})=>Promise<void>},
  box:{width:number;height:number},index:number)=>
  canvas.click({position:{x:(131+(index%5)*160+73)/1050*box.width,
    y:(104+Math.floor(index/5)*160+73)/645*box.height}});

test('PixiJS factory produces cores only after the player connects the chain and staffs it',async({page})=>{
  const errors:string[]=[];
  page.on('pageerror',err=>errors.push(err.message));
  await page.goto(LAB);
  const canvas=page.getByTestId('v2-stage').locator('canvas');
  await expect(canvas).toBeVisible({timeout:12000});
  await expect(page.getByTestId('v2-stage')).toHaveAttribute('data-renderer','pixi-webgl-bitmap');
  await expect(page.getByTestId('v2-stage')).toHaveAttribute('data-worker-frames','8');
  await expect(page.getByTestId('v2-coins')).toHaveText('100');
  await page.getByTestId('v2-shift').click();
  await expect(page.getByTestId('v2-output')).toHaveText('0');
  await expect(page.getByTestId('v2-diagnosis')).toContainText('还没炼出晶核');
  const bounds=await canvas.boundingBox();
  expect(bounds).toBeTruthy();
  const tap=(index:number)=>CLICK(canvas,bounds!,index);
  await tap(7);
  await page.getByTestId('v2-move').click();
  await tap(6);
  await expect(page.getByTestId('v2-status')).toContainText('机器已搬动');
  await page.getByTestId('v2-build-kiln').click();
  await tap(7);
  await expect(page.getByTestId('v2-coins')).toHaveText('62');
  await page.getByTestId('v2-worker-brook').click();
  await tap(5);
  await page.getByTestId('v2-worker-fern').click();
  await tap(6);
  await page.getByTestId('v2-worker-cinder').click();
  await tap(7);
  await page.getByTestId('v2-shift').click();
  await expect(page.getByTestId('v2-output')).toHaveText('2');
  await expect(page.getByTestId('v2-stock')).toHaveText('2');
  await page.screenshot({path:'test-results/workshop-v2-sprites-desktop.png',fullPage:true});
  for(let i=0;i<3;i++)await page.getByTestId('v2-shift').click();
  await expect(page.getByTestId('v2-completed')).toHaveText('1');
  await expect(page.getByTestId('v2-failed')).toHaveText('0');
  await expect(page.getByTestId('v2-coins')).toHaveText('132');
  await page.reload();
  await expect(page.getByTestId('v2-completed')).toHaveText('1');
  expect(errors).toEqual([]);
});

test('a disconnected workshop misses its contract with an honest production explanation',async({page})=>{
  await page.goto(LAB);
  await page.getByTestId('v2-worker-brook').click();
  const canvas=page.getByTestId('v2-stage').locator('canvas');
  await expect(canvas).toBeVisible({timeout:12000});
  const bounds=await canvas.boundingBox();
  const tap=(index:number)=>CLICK(canvas,bounds!,index);
  await tap(5);
  await page.getByTestId('v2-worker-fern').click();
  await tap(7);
  await page.getByTestId('v2-shift').click();
  await expect(page.getByTestId('v2-diagnosis')).toContainText('温室缺水');
  expect(Number(await page.getByTestId('v2-water').textContent())).toBeGreaterThan(0);
  for(let i=0;i<4;i++)await page.getByTestId('v2-shift').click();
  await expect(page.getByTestId('v2-failed')).toHaveText('1');
  await expect(page.getByTestId('v2-coins')).toHaveText('85');
});

test('mobile keeps the same PixiJS game stage visible with no page-length scrolling',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto(LAB);
  await expect(page.getByTestId('v2-stage').locator('canvas')).toBeVisible({timeout:12000});
  await expect(page.getByTestId('v2-stage')).toHaveAttribute('data-worker-frames','8');
  await expect(page.getByTestId('v2-build-well')).toBeVisible();
  await expect(page.getByTestId('v2-worker-fern')).toBeVisible();
  await expect(page.getByTestId('v2-shift')).toBeVisible();
  const dims=await page.evaluate(()=>({
    x:document.documentElement.scrollWidth-innerWidth,
    y:document.documentElement.scrollHeight-innerHeight,
  }));
  expect(dims.x).toBeLessThanOrEqual(1);
  expect(dims.y).toBeLessThanOrEqual(1);
  await page.screenshot({path:'test-results/workshop-v2-mobile.png',fullPage:true});
});
