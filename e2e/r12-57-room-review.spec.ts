import {expect,test} from '@playwright/test';
import {mkdirSync} from 'node:fs';

for(const profile of [{width:1440,height:900},{width:390,height:844}]){
  test('new room layers remain opt-in and reset cleanly '+profile.width,async({page})=>{
    test.setTimeout(120000);
    await page.setViewportSize(profile);
    await page.emulateMedia({reducedMotion:'reduce'});
    mkdirSync('visual-evidence/rooms-r12-57',{recursive:true});
    for(const id of ['yuesha','brook','fern','cinder'] as const){
      if(id==='yuesha'){
        await page.goto('/apartment/?roomArtReview=1');
        await page.getByRole('button',{name:'与女主人月纱交流'}).click();
        await page.getByTestId('visit-yuesha-room').click();
      }else{
        await page.goto('/characters/?roomArtReview=1');
        await page.getByTestId('visit-worker-room-'+id).click();
      }
      const back=page.getByTestId('room-scene-backdrop');
      const resident=page.getByTestId('room-resident-layer');
      await expect(back).toHaveAttribute('data-local-preview','false');
      await page.getByTestId('room-art-review-toggle').click();
      await page.getByTestId('room-art-r12-57-pair').click();
      await expect(back).toHaveAttribute('data-local-preview','true');
      const img=back.locator('img');
      await expect(img).toHaveAttribute('src',new RegExp(id+'/review/background-candidate[.]webp'));
      await expect.poll(()=>img.evaluate((el:HTMLImageElement)=>el.naturalWidth)).toBe(1672);
      await expect(img).toHaveJSProperty('naturalHeight',941);
      const actor=resident.getByTestId('room-portrait-frame').locator('img');
      await expect(actor).toHaveAttribute('src',new RegExp(id+'/review/standing-candidate[.]webp'));
      await expect.poll(()=>actor.evaluate((el:HTMLImageElement)=>el.naturalWidth)).toBe(1086);
      await expect(actor).toHaveJSProperty('naturalHeight',1448);
      await expect(page.getByTestId('room-art-r12-57-status')).toBeVisible();
      await expect(page.getByTestId('room-art-composite-export')).toHaveCount(0);
      await expect(page.locator('[data-testid^="scene-object-"]')).toHaveCount(0);
      await page.getByTestId('room-art-review-toggle').click();
      await back.screenshot({path:'visual-evidence/rooms-r12-57/'+id+'-'+profile.width+'-background.png'});
      await page.screenshot({path:'visual-evidence/rooms-r12-57/'+id+'-'+profile.width+'.png'});
      await page.getByTestId('room-art-review-toggle').click();
      await page.getByTestId('room-art-local-reset').click();
      await expect(back).toHaveAttribute('data-local-preview','false');
      await expect(resident).toHaveAttribute('data-local-pose-preview','false');
      await expect(img).toHaveAttribute('src',/concept-scene[.]svg$/);
    }
  });
}
