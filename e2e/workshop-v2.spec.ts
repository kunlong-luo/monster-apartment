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
  const canvas=page.getByTestId('v2-stage').locator('canvas');
  const box=await canvas.boundingBox();
  expect(box).toBeTruthy();
  expect(box!.height).toBeGreaterThan(340); // no more postage-stamp landscape stage
  // A real Pixi pointer action on the portrait stage must still select plots.
  await page.getByTestId('v2-build-kiln').click();
  await canvas.click({position:{
    x:(15+3*160+73)/830*box!.width,
    y:(225+1*160+73)/820*box!.height,
  }});
  await expect(page.getByTestId('v2-coins')).toHaveText('62');
  const dims=await page.evaluate(()=>({
    x:document.documentElement.scrollWidth-innerWidth,
    y:document.documentElement.scrollHeight-innerHeight,
  }));
  expect(dims.x).toBeLessThanOrEqual(1);
  expect(dims.y).toBeLessThanOrEqual(1);
  await page.screenshot({path:'test-results/workshop-v2-mobile.png',fullPage:true});
});

test('adult moon witch is earned through regular production and offers a real competing contract',async({page})=>{
  const errors:string[]=[];page.on('pageerror',err=>errors.push(err.message));
  await page.goto(LAB);
  const canvas=page.getByTestId('v2-stage').locator('canvas');
  await expect(canvas).toBeVisible({timeout:12000});
  const bounds=await canvas.boundingBox();expect(bounds).toBeTruthy();
  const tap=(index:number)=>CLICK(canvas,bounds!,index);
  await tap(7);
  await page.getByTestId('v2-move').click();await tap(6);
  await page.getByTestId('v2-build-kiln').click();await tap(7);
  await page.getByTestId('v2-worker-brook').click();await tap(5);
  await page.getByTestId('v2-worker-fern').click();await tap(6);
  await page.getByTestId('v2-worker-cinder').click();await tap(7);
  await expect(page.getByTestId('v2-patron-card')).toBeHidden();
  for(let i=0;i<5;i++)await page.getByTestId('v2-shift').click();
  await expect(page.getByTestId('v2-completed')).toHaveText('1');
  await expect(page.getByTestId('v2-patron-card')).toBeVisible();
  await expect(page.getByTestId('v2-patron-card')).toHaveAttribute('data-status','offered');
  await expect(page.getByTestId('v2-stage')).toHaveAttribute('data-patron-frames','8');
  await expect(page.getByTestId('v2-patron-dialogue')).toContainText('你的工坊真有本事');
  await expect(page.getByTestId('v2-patron-progress')).toHaveText('8/13');
  await page.getByTestId('v2-patron-accept').click();
  await expect(page.getByTestId('v2-patron-card')).toHaveAttribute('data-status','active');
  for(let i=0;i<3;i++)await page.getByTestId('v2-shift').click();
  await expect(page.getByTestId('v2-patron-card')).toHaveAttribute('data-status','completed');
  await expect(page.getByTestId('v2-coins')).toHaveText('267');
  await expect(page.getByTestId('v2-stock')).toHaveText('1');
  await expect(page.getByTestId('v2-patron-accept')).toBeHidden();
  await page.getByTestId('v2-shift').click();
  await expect(page.getByTestId('v2-completed')).toHaveText('2');
  await expect(page.getByTestId('v2-coins')).toHaveText('362');
  await page.reload();
  await expect(page.getByTestId('v2-patron-card')).toHaveAttribute('data-status','completed');
  expect(errors).toEqual([]);
});
test('adult guest invitation remains readable on portrait phone and is optional',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto(LAB);
  await expect(page.getByTestId('v2-stage').locator('canvas')).toBeVisible();
  await page.evaluate(()=>{
    const key='monster-apartment:workshop-v2-lab';
    const save=JSON.parse(localStorage.getItem(key)??'null')??{
      version:2,day:1,coins:100,tiles:Array(15).fill(null),
      warehouse:{core:0},order:{due:5,cores:2,reward:70},last:null,
      completed:0,failed:0};
    save.day=6;save.completed=1;save.coins=132;save.warehouse.core=8;
    save.order={due:9,cores:3,reward:95};
    save.patron={status:'offered',due:8,cores:13,reward:135};
    localStorage.setItem(key,JSON.stringify(save));
  });
  await page.reload();
  await expect(page.getByTestId('v2-patron-card')).toBeVisible();
  await expect(page.getByTestId('v2-stage')).toHaveAttribute('data-patron-visible','true');
  await expect(page.getByTestId('v2-patron-dialogue')).toContainText('月光落下之前');
  await expect(page.getByTestId('v2-patron-accept')).toBeVisible();
  const dimensions=await page.evaluate(()=>({
    x:document.documentElement.scrollWidth-innerWidth,
    y:document.documentElement.scrollHeight-innerHeight,
  }));
  expect(dimensions.x).toBeLessThanOrEqual(1);
  expect(dimensions.y).toBeLessThanOrEqual(1);
  await page.screenshot({path:'test-results/workshop-v2-patron-mobile.png',fullPage:true});
});
