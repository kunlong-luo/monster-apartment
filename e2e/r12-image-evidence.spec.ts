import {expect,test} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';

/**
 * R12 #24: gather pixel and image-loading evidence, not a visual quality pass.
 * This test intentionally NEVER marks source art as approved based on pixels.
 * Original PNG screenshots and JSON are uploaded by r12-art-evidence.yml.
 */
const routes=[
  {path:'/',slug:'lobby',root:'gothic-lobby'},
  {path:'/apartment/',slug:'apartment',root:'gothic-apartment'},
  {path:'/workshop/',slug:'workshop',root:'v2-stage'},
  {path:'/characters/',slug:'characters',root:'moonwork-world'},
  {path:'/orders/',slug:'orders',root:'moonwork-world'},
  {path:'/town/',slug:'town',root:'moonwork-world'},
  {path:'/warehouse/',slug:'warehouse',root:'moonwork-world'},
] as const;

const profiles=[
  {name:'pc-1440-dpr1',width:1440,height:900,dpr:1},
  {name:'pc-1648-dpr2',width:1648,height:928,dpr:2},
  {name:'phone-390-dpr2',width:390,height:844,dpr:2},
  {name:'phone-short-390-dpr2',width:390,height:550,dpr:2},
] as const;

const screenshotRoutes=new Set(['lobby','apartment','orders','warehouse']);
const evidenceDir='visual-evidence/r12';

test('R12 art evidence: image decode dimensions, cover scaling and actual canvas pixels',async({browser},testInfo)=>{
  test.setTimeout(480_000);
  await mkdir(evidenceDir,{recursive:true});
  const baseURL=String(testInfo.project.use.baseURL ?? 'http://127.0.0.1:3000');
  const origin=new URL(baseURL).origin;
  const report:{
    schemaVersion:number;
    note:string;
    observedAt:string;
    samples:unknown[];
  }={
    schemaVersion:1,
    note:'Diagnostics only; effective scale > 1 is an inspection flag, not proof of visible blur or rights approval.',
    observedAt:new Date().toISOString(),
    samples:[],
  };

  try{
    for(const profile of profiles){
      const context=await browser.newContext({
        viewport:{width:profile.width,height:profile.height},
        deviceScaleFactor:profile.dpr,
        reducedMotion:'reduce',
        storageState:{
          cookies:[],
          origins:[{origin,localStorage:[{
            name:'monster-apartment:welcome-entered:v1',value:'1',
          }]}],
        },
      });
      const page=await context.newPage();
      try{
        for(const route of routes){
          const response=await page.goto(new URL(route.path,baseURL).href,{waitUntil:'domcontentloaded'});
          expect(response?.status(),route.path+' HTTP').toBe(200);
          await expect(page.getByTestId(route.root),route.path+' visible game root')
            .toBeVisible({timeout:25000});
          if(route.slug==='workshop'){
            await expect(page.getByTestId('v2-stage').locator('canvas')).toBeVisible({timeout:25000});
          }
          await page.waitForTimeout(300);

          const observed=await page.evaluate(async()=>{
            const dpr=window.devicePixelRatio;
            const viewport={width:innerWidth,height:innerHeight};
            const rectInfo=(rect:DOMRect)=>({
              x:Math.round(rect.x),y:Math.round(rect.y),
              width:Math.round(rect.width),height:Math.round(rect.height),
            });
            const scale=(width:number,height:number,naturalWidth:number,naturalHeight:number)=>{
              if(!naturalWidth || !naturalHeight)return null;
              return Math.round(Math.max(width/naturalWidth,height/naturalHeight)*dpr*100)/100;
            };
            const images=Array.from(document.images).map(img=>{
              const rect=img.getBoundingClientRect();
              const style=getComputedStyle(img);
              return {
                src:img.currentSrc || img.src,
                alt:img.alt,
                complete:img.complete,
                decoded:img.complete && img.naturalWidth>0 && img.naturalHeight>0,
                natural:{width:img.naturalWidth,height:img.naturalHeight},
                rendered:rectInfo(rect),
                objectFit:style.objectFit,
                objectPosition:style.objectPosition,
                effectiveCoverScale:style.objectFit==='cover'
                  ?scale(rect.width,rect.height,img.naturalWidth,img.naturalHeight):null,
              };
            }).filter(item=>item.rendered.width>=100 && item.rendered.height>=90);

            const backgrounds=Array.from(document.querySelectorAll<HTMLElement>('*'))
              .map(el=>{
                const rect=el.getBoundingClientRect();
                if(rect.width<140 || rect.height<100)return null;
                const css=getComputedStyle(el);
                const match=css.backgroundImage.match(/url\(["']?(.+?)["']?\)/);
                if(!match)return null;
                return {
                  element:el.tagName.toLowerCase(),
                  className:String(el.className).slice(0,180),
                  src:new URL(match[1],location.href).href,
                  rendered:rectInfo(rect),
                  backgroundSize:css.backgroundSize,
                  backgroundPosition:css.backgroundPosition,
                };
              }).filter((item):item is NonNullable<typeof item>=>item!==null)
              .slice(0,20);

            const backgroundSources=await Promise.all(backgrounds.map(async item=>{
              const probe=new Image();
              const outcome=await Promise.race([
                new Promise<'loaded'|'error'>(resolve=>{
                  probe.onload=()=>resolve('loaded');
                  probe.onerror=()=>resolve('error');
                  probe.src=item.src;
                }),
                new Promise<'timeout'>(resolve=>setTimeout(()=>resolve('timeout'),4000)),
              ]);
              return {
                ...item,status:outcome,
                natural:{width:probe.naturalWidth,height:probe.naturalHeight},
                effectiveCoverScale:item.backgroundSize==='cover'
                  ?scale(item.rendered.width,item.rendered.height,probe.naturalWidth,probe.naturalHeight):null,
              };
            }));

            const canvases=Array.from(document.querySelectorAll('canvas')).map(canvas=>{
              const rect=canvas.getBoundingClientRect();
              return {
                actual:{width:canvas.width,height:canvas.height},
                css:rectInfo(rect),
                pixelsPerCssPixel:{
                  x:rect.width>0?Math.round(canvas.width/rect.width*100)/100:null,
                  y:rect.height>0?Math.round(canvas.height/rect.height*100)/100:null,
                },
              };
            });
            return {url:location.href,viewport,dpr,images,backgrounds:backgroundSources,canvases};
          });

          const flags=[
            ...observed.images.filter(img=>!img.decoded || (img.effectiveCoverScale??0)>1.15)
              .map(img=>({kind:'img',src:img.src,decoded:img.decoded,scale:img.effectiveCoverScale})),
            ...observed.backgrounds.filter(bg=>bg.status!=='loaded' || (bg.effectiveCoverScale??0)>1.15)
              .map(bg=>({kind:'background',src:bg.src,status:bg.status,scale:bg.effectiveCoverScale})),
          ];
          report.samples.push({route:route.path,profile:profile.name,...observed,flags});
          if(screenshotRoutes.has(route.slug)){
            await page.screenshot({
              path:evidenceDir+'/'+profile.name+'-'+route.slug+'.png',
              animations:'disabled',timeout:30000,
            });
          }
          console.log('[R12 image evidence] '+profile.name+' '+route.path+
            ' images='+observed.images.length+
            ' backgrounds='+observed.backgrounds.length+
            ' canvases='+observed.canvases.length+
            ' inspection-flags='+flags.length);
        }
      }finally{
        await context.close();
      }
    }
  }finally{
    const reportPath=evidenceDir+'/report.json';
    await writeFile(reportPath,JSON.stringify(report,null,2)+'\n','utf8');
    await testInfo.attach('r12-image-evidence.json',{path:reportPath,contentType:'application/json'});
  }
});
