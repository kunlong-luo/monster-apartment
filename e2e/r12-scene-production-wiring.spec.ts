import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';

type ArtArea='apartment'|'orders'|'warehouse';
const manifest=JSON.parse(readFileSync(
  new URL('../public/art/world-scenes/r12-scene-manifest.json',import.meta.url),
  'utf8',
)) as {scenes:Record<ArtArea,{status:string}>};

const cases=[
  {area:'apartment',route:'/apartment/',backdrop:'.ga-backdrop',hero:null},
  {area:'orders',route:'/orders/',backdrop:'.mw-gothic-scene',hero:'painted-order-hero'},
  {area:'warehouse',route:'/warehouse/',backdrop:'.mw-gothic-scene',hero:'painted-warehouse-hero'},
] as const;

test('R12 scene review candidates cannot leak into game; approved art uses responsive sources',async({page})=>{
  test.setTimeout(180_000);
  for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
    await page.setViewportSize(viewport);
    for(const entry of cases){
      const approved=manifest.scenes[entry.area].status==='production';
      await page.goto(entry.route,{waitUntil:'domcontentloaded'});
      const background=page.locator(entry.backdrop);
      await expect(background,entry.area+' source admission').toHaveAttribute(
        'data-r12-scene-art',approved?'production':'legacy',{timeout:20_000});
      const artImages=background.locator('img[data-r12-art-image]');
      if(!approved){
        await expect(artImages).toHaveCount(0);
        const image=await background.evaluate(element=>getComputedStyle(element).backgroundImage);
        expect(image).toContain('lobby-hero');
      }else{
        await expect(artImages).toHaveCount(2);
        const variant=viewport.width<=700?'mobile':'desktop';
        const target=background.locator('img[data-r12-art-image="'+variant+'"]');
        await expect(target).toBeVisible();
        await expect(target).toHaveAttribute('data-image-load','original',{timeout:20_000});
        await expect.poll(()=>target.evaluate((img:HTMLImageElement)=>img.naturalWidth),
          {timeout:20000,message:entry.area+' needs decoded original '+variant+' art'}).toBeGreaterThan(0);
      }
      if(entry.hero){
        const hero=page.getByTestId(entry.hero);
        await expect(hero).toBeVisible({timeout:20000});
        await expect(hero.locator('img[data-r12-hero-art]')).toHaveCount(approved?2:1);
        if(approved){
          const target=hero.locator('img[data-r12-hero-art="'+(viewport.width<=700?'mobile':'desktop')+'"]');
          await expect(target).toBeVisible();
          await expect.poll(()=>target.evaluate((img:HTMLImageElement)=>img.naturalWidth),
            {timeout:20000}).toBeGreaterThan(0);
          await expect(target).toHaveAttribute('data-image-load','original');
        }else await expect(hero.locator('img[data-r12-hero-art="legacy"]')).toBeVisible();
      }
    }
  }
});
