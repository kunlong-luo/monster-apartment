import {expect,test} from '@playwright/test';
import {mkdirSync} from 'node:fs';

/** R12.29: browser-measured full-bleed artwork pixel debt on Retina screens.
 * A passing regression gate means "no worse than the existing source",
 * NOT that R12.29 created or approved true-HD artwork.
 * See docs/art-reviews/R12-01-REAL-BROWSER-PIXEL-EVIDENCE.md. */
test.use({deviceScaleFactor:2,reducedMotion:'reduce'});

const profiles=[
  {name:'pc-1648-dpr2',width:1648,height:928,maxScale:2.2},
  {name:'mobile-390-dpr2',width:390,height:844,maxScale:1.9},
] as const;

for(const profile of profiles){
  test('Web lobby native-pixel budget · '+profile.name,async({page},testInfo)=>{
    test.setTimeout(60_000);
    await page.setViewportSize({width:profile.width,height:profile.height});
    await page.goto('/');
    await expect(page.getByTestId('gothic-lobby')).toBeVisible();
    const hero=page.getByTestId('gothic-lobby-painting-image');
    await expect(hero).toHaveAttribute('data-image-load','original');
    await expect.poll(()=>hero.evaluate(node=>{
      const img=node as HTMLImageElement;
      return img.complete&&img.naturalWidth>0&&img.naturalHeight>0;
    }),{timeout:25000}).toBe(true);
    const measured=await hero.evaluate(node=>{
      const img=node as HTMLImageElement;
      const style=getComputedStyle(img);
      const box=img.getBoundingClientRect();
      const coverScale=window.devicePixelRatio*Math.max(
        box.width/img.naturalWidth,box.height/img.naturalHeight,
      );
      return {
        currentSrc:img.currentSrc,
        dpr:window.devicePixelRatio,
        viewport:{width:innerWidth,height:innerHeight},
        natural:{width:img.naturalWidth,height:img.naturalHeight},
        displayed:{width:box.width,height:box.height},
        fit:style.objectFit,filter:style.filter,transform:style.transform,
        coverScale:Number(coverScale.toFixed(3)),
        underResolved:coverScale>1,
      };
    });
    expect(measured.dpr).toBe(2);
    expect(measured.fit).toBe('cover');
    expect(measured.filter).toBe('none');
    expect(measured.transform).toBe('none');
    expect(measured.displayed.width).toBeGreaterThanOrEqual(profile.width-1);
    expect(measured.displayed.height).toBeGreaterThanOrEqual(profile.height-1);
    // Prevent silent replacement with an even smaller source, while allowing
    // new verified desktop/mobile artwork to improve the source dimensions.
    expect(measured.natural.width*measured.natural.height)
      .toBeGreaterThanOrEqual(1587*991);
    expect(measured.coverScale).toBeLessThanOrEqual(profile.maxScale);
    console.info('[R12.29 Web hero pixel debt] '+JSON.stringify(measured));
    mkdirSync('visual-evidence/lobby-dpr',{recursive:true});
    await page.screenshot({path:'visual-evidence/lobby-dpr/'+profile.name+'.png',
      animations:'disabled'});
    await testInfo.attach('lobby-'+profile.name+'.json',{
      body:Buffer.from(JSON.stringify(measured,null,2)+'\n'),
      contentType:'application/json',
    });
  });
}
