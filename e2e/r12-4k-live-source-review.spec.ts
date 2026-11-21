import {expect,test} from '@playwright/test';
import {createHash} from 'node:crypto';
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';

/** Only the review-only licensed-art workflow sets these paths.
 * Never import these images in the game or mutate production manifests.
 */
const sourceDir=process.env.R12_SOURCE_REVIEW_DIR;
const screenshotDir=process.env.R12_LIVE_SCREENSHOT_DIR;
const scenes=[
  {id:'S02-apartment',route:'/apartment/',backdrop:'.ga-backdrop',
    source:'S02-apartment-foyer.webp',description:'Victorian foyer review only'},
  {id:'S05-orders',route:'/orders/',backdrop:'.mw-gothic-scene',
    source:'S05-orders-library.webp',description:'Archive/library review only'},
] as const;
const viewports=[
  {id:'pc-1440',width:1440,height:900,dpr:1},
  {id:'pc-1648-dpr2',width:1648,height:928,dpr:2},
  {id:'phone-390-crop-only',width:390,height:844,dpr:2},
] as const;

test('R12 original 4K source rendered inside actual PC and mobile game UI',async({browser})=>{
  test.skip(!sourceDir||!screenshotDir,'only runs in licensed real-source art-review workflow');
  test.setTimeout(240_000);
  const inputDir=sourceDir!;
  const evidenceDir=screenshotDir!;
  mkdirSync(evidenceDir,{recursive:true});

  const baseURL='http://127.0.0.1:3000';
  const evidence=[];
  for(const scene of scenes){
    const original=join(inputDir,scene.source);
    const bytes=readFileSync(original);
    const sourceSHA256=createHash('sha256').update(bytes).digest('hex');
    expect(bytes.byteLength).toBeGreaterThan(20_000);

    for(const v of viewports){
      // Real DPR contexts rather than relabelling CSS viewport tests as DPR2.
      const context=await browser.newContext({
        baseURL,viewport:{width:v.width,height:v.height},
        deviceScaleFactor:v.dpr,
        reducedMotion:'reduce',
        storageState:{cookies:[],origins:[{origin:baseURL,localStorage:[
          {name:'monster-apartment:welcome-entered:v1',value:'1'},
        ]}]},
      });
      try{
        const page=await context.newPage();
        await page.goto(scene.route+'?r12-art-review=1',{waitUntil:'domcontentloaded'});
        expect(await page.evaluate(()=>window.devicePixelRatio)).toBe(v.dpr);
        const review=page.getByTestId('r12-local-art-review');
        await expect(review).toBeVisible({timeout:30_000});
        const backdrop=page.locator(scene.backdrop);
        await expect(backdrop).toHaveAttribute('data-r12-scene-art','legacy');
        await page.getByTestId('r12-local-art-file').setInputFiles(original);
        await expect(backdrop).toHaveAttribute('data-r12-scene-art','local-review');
        const originalImage=backdrop.locator('img[data-r12-art-image="local-review"]');
        await expect(originalImage).toBeVisible({timeout:30_000});
        await expect(originalImage).toHaveAttribute('data-image-load','original',{timeout:30_000});
        const natural=await originalImage.evaluate(img=>({
          width:(img as HTMLImageElement).naturalWidth,
          height:(img as HTMLImageElement).naturalHeight,
          complete:(img as HTMLImageElement).complete,
        }));
        expect(natural).toEqual({width:3840,height:2160,complete:true});
        expect(await originalImage.getAttribute('src')).toContain('blob:');

        if(v.width<=700){
          await expect(review).toContainText('不得作为手机美术验收');
          await review.screenshot({
            path:join(evidenceDir,scene.id+'-phone-review-warning.png'),
          });
        }
        // The screenshot of the game excludes the developer-only uploader.
        // The full HUD, room controls and actual production layout stay visible.
        const reviewStyle=await page.addStyleTag({
          content:'[data-testid="r12-local-art-review"],nextjs-portal{visibility:hidden!important}',
        });
        const screenshotName=scene.id+'-'+v.id+'-game-ui.png';
        await page.screenshot({
          path:join(evidenceDir,screenshotName),fullPage:false,animations:'disabled',
        });
        await reviewStyle.evaluate(el=>{el.parentNode?.removeChild(el);});
        evidence.push({
          scene:scene.id,description:scene.description,sourceFile:scene.source,
          sha256:sourceSHA256,sourcePixels:[natural.width,natural.height],
          viewport:[v.width,v.height],dpr:v.dpr,
          effectiveCoverScale:Number(Math.max(
            v.width*v.dpr/natural.width,v.height*v.dpr/natural.height).toFixed(3)),
          screenshot:screenshotName,
          kind:v.width<=700?'desktop-source-mobile-crop-NOT-approved':'desktop-native-review',
          artworkApproved:false,rightsFullyReviewed:false,
        });
      }finally{
        await context.close();
      }
    }
  }
  writeFileSync(join(evidenceDir,'r12-live-review-evidence.json'),
    JSON.stringify({
      purpose:'Real DPR1/DPR2 Chromium captures of review-only 4K images within the game UI',
      productionAssetsChanged:false,artApproved:false,
      mobileOriginalAvailable:false,
      license:'Ebbasuke Gloomy Mansion Background Pack 4K (CC BY 4.0, attribution required)',
      source:'https://ebbasuke.itch.io/gloomy-mansion-background-pack',
      evidence,
    },null,2)+'\n');
});
