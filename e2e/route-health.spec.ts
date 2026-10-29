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
        const selector=route.path==='/apartment/'?'.ga-backdrop':'.mw-gothic-scene';
        const background=await page.locator(selector).evaluate(el=>getComputedStyle(el).backgroundImage);
        expect(background,route.path+' painted background must resolve with Pages basePath')
          .toContain('lobby-hero');
        expect(background).not.toContain('../lobby-hero');
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

test('all seven destinations use one active dock, not duplicate scene menus',async({page})=>{
  test.setTimeout(150_000);
  const pages=[
    {path:'/',active:'大厅',test:'gothic-lobby'},
    {path:'/apartment/',active:'暗夜公寓',test:'gothic-apartment'},
    {path:'/workshop/',active:'工坊',test:'next-workshop-shell'},
    {path:'/characters/',active:'角色图鉴',test:'moonwork-world'},
    {path:'/orders/',active:'委托大厅',test:'moonwork-world'},
    {path:'/town/',active:'月光街',test:'moonwork-world'},
    {path:'/warehouse/',active:'魔法仓库',test:'moonwork-world'},
  ];
  for(const entry of pages){
    await page.goto(entry.path);
    await expect(page.getByTestId(entry.test)).toBeVisible({timeout:20000});
    const dock=page.getByRole('navigation',{name:entry.path==='/'?'主要游戏功能':
      entry.path==='/apartment/'?'公寓世界导航':'月光工坊世界'});
    await expect(dock.getByRole('link')).toHaveCount(7);
    await expect(dock.getByRole('link',{name:entry.active,exact:true})).toHaveAttribute('aria-current','page');
    if(entry.test==='moonwork-world'){
      await expect(page.getByTestId('game-page-purpose')).not.toBeEmpty();
      await expect(page.getByTestId('game-location')).toContainText('大厅 /');
    }
  }
  await expect(page.getByRole('navigation',{name:'快捷功能'})).toHaveCount(0);
});
