import {expect,test} from '@playwright/test';
import {mkdirSync,writeFileSync} from 'node:fs';

/** R12.29: browser-measured full-bleed artwork pixel debt on Retina screens.
 * A passing regression gate means "no worse than the existing source",
 * NOT that R12.29 created or approved true-HD artwork.
 * See docs/art-reviews/R12-01-REAL-BROWSER-PIXEL-EVIDENCE.md. */
test.use({deviceScaleFactor:2,reducedMotion:'reduce'});

const profiles=[
  {name:'pc-1440-dpr2',width:1440,height:900,maxScale:2.2},
  {name:'pc-1648-dpr2',width:1648,height:928,maxScale:2.2},
  {name:'mobile-390-dpr2',width:390,height:844,maxScale:1.9},
  {name:'mobile-short-390-dpr2',width:390,height:550,maxScale:1.9},
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
        fit:style.objectFit,position:style.objectPosition,filter:style.filter,transform:style.transform,
        coverScale:Number(coverScale.toFixed(3)),
        underResolved:coverScale>1,
      };
    });
    // Persist measurements before quality assertions, so a changed asset or
    // failed budget leaves comparable evidence even if this test fails.
    const report={...measured,profile:profile.name,maxScale:profile.maxScale};
    mkdirSync('visual-evidence/lobby-dpr',{recursive:true});
    const reportPath='visual-evidence/lobby-dpr/'+profile.name+'.json';
    writeFileSync(reportPath,JSON.stringify(report,null,2)+'\n','utf8');
    await testInfo.attach('lobby-'+profile.name+'.json',{
      path:reportPath,contentType:'application/json',
    });
    await page.screenshot({path:'visual-evidence/lobby-dpr/'+profile.name+'.png',animations:'disabled'});
    console.info('[R12.92 Web hero pixel debt] '+JSON.stringify(report));
    expect(measured.dpr).toBe(2);
    const mobile=profile.name.startsWith('mobile');
    const minimum=mobile?{width:941,height:1672}:{width:1672,height:941};
    // Guard both axes and the device-specific source, allowing a genuine
    // native-resolution improvement without weakening the old floor.
    expect(measured.natural.width).toBeGreaterThanOrEqual(minimum.width);
    expect(measured.natural.height).toBeGreaterThanOrEqual(minimum.height);
    expect(measured.currentSrc).toMatch(mobile
      ?/\/lobby-hero-v4-mobile(?:\.[^/]+)?\.webp(?:\?|$)/
      :/\/lobby-hero-v4(?:\.[^/]+)?\.webp(?:\?|$)/);
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
  });
}
