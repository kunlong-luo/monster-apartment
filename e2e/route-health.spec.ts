import {test,expect} from '@playwright/test';

/**
 * Fast, actionable release gate: distinguish a broken route/hydration from a
 * Pixi gameplay assertion. Every production page must boot before the longer
 * economic flows run. Log the actual HTTP and visible error state on failure.
 */
test('seven production routes boot with interactive game surfaces',async({page})=>{
  test.setTimeout(120_000);
  const pageErrors:string[]=[];
  page.on('pageerror',error=>pageErrors.push(error.message));
  const routes=[
    {path:'/',testId:'gothic-lobby'},
    {path:'/apartment/',testId:'gothic-apartment'},
    {path:'/town/',testId:'moonwork-world'},
    {path:'/orders/',testId:'moonwork-world'},
    {path:'/characters/',testId:'moonwork-world'},
    {path:'/warehouse/',testId:'moonwork-world'},
    {path:'/workshop/',testId:'v2-stage'},
  ] as const;
  for(const route of routes){
    const errorsBefore=pageErrors.length;
    const response=await page.goto(route.path,{waitUntil:'domcontentloaded'});
    try{
      expect(response?.status(),route.path+' HTTP response').toBe(200);
      await expect(page.getByTestId(route.testId),route.path+' game UI').toBeVisible({timeout:15_000});
      if(route.path==='/workshop/'){
        await expect(page.getByTestId('v2-stage').locator('canvas')).toBeVisible({timeout:25_000});
      }
      expect(pageErrors.slice(errorsBefore),route.path+' client errors').toEqual([]);
      if(['/apartment/','/town/','/orders/','/characters/','/warehouse/'].includes(route.path)){
        const selector=route.path==='/apartment/'?'.ga-backdrop':
          route.path==='/characters/'?'.cg-scene__background':'.mw-gothic-scene';
        const expected=route.path==='/characters/'?'workshop-gothic-hall':
          route.path==='/town/'?'town-moonlit-gate':'lobby-hero';
        const background=await page.locator(selector).evaluate(el=>getComputedStyle(el).backgroundImage);
        expect(background,route.path+' painted background must resolve with Pages basePath')
          .toContain(expected);
        expect(background).not.toContain('../'+expected);
      }
    }catch(error){
      const body=await page.locator('body').innerText().catch(()=>'<unavailable>');
      console.error('ROUTE BOOT DIAGNOSTIC',JSON.stringify({
        path:route.path,status:response?.status(),url:page.url(),
        body:body.slice(0,900),pageErrors:pageErrors.slice(errorsBefore),
      }));
      throw error;
    }
  }
});

test('lobby owns compact routes and a seven-place map; others share one optional map',async({page})=>{
  test.setTimeout(150_000);
  const pages=[
    {path:'/',test:'gothic-lobby'},
    {path:'/apartment/',test:'gothic-apartment'},
    {path:'/workshop/',test:'next-workshop-shell'},
    {path:'/characters/',test:'moonwork-world'},
    {path:'/orders/',test:'moonwork-world'},
    {path:'/town/',test:'moonwork-world'},
    {path:'/warehouse/',test:'moonwork-world'},
  ] as const;
  for(const entry of pages){
    await page.goto(entry.path);
    await expect(page.getByTestId(entry.test)).toBeVisible({timeout:20000});
    if(entry.path==='/'){
      await expect(page.getByRole('navigation',{name:'主要游戏功能'}).getByRole('link'))
        .toHaveCount(4);
      await expect(page.getByTestId('scene-navigation')).toHaveCount(0);
    }else{
      await expect(page.locator('.gothic-dock-bar')).toHaveCount(0);
      await expect(page.getByTestId('scene-navigation')).toHaveAttribute('data-current-route',entry.path);
      await expect(page.getByTestId('scene-return-lobby')).toHaveAttribute('href','/');
      await expect(page.getByTestId('scene-navigation-panel')).toHaveCount(0);
      await page.getByRole('button',{name:'展开世界导航'}).click();
      const map=page.getByRole('navigation',{name:'游戏七个正式地点'});
      await expect(map.getByRole('link')).toHaveCount(7);
      await expect(map.locator('[aria-current="page"]')).toHaveAttribute('data-destination',entry.path);
      await page.keyboard.press('Escape');
      await expect(page.getByTestId('scene-navigation-panel')).toHaveCount(0);
    }
    if(entry.test==='moonwork-world' && entry.path!=='/characters/'){
      await expect(page.getByTestId('game-page-purpose')).not.toBeEmpty();
      await expect(page.getByTestId('game-location')).toContainText('大厅 /');
    }
  }
  await expect(page.getByRole('navigation',{name:'快捷功能'})).toHaveCount(0);
});
