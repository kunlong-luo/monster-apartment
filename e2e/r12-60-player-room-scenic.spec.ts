import {expect,test} from '@playwright/test';
import {mkdirSync} from 'node:fs';

for(const profile of [{width:1440,height:900},{width:390,height:844}]){
  test('player room scenic art and unchanged lore '+profile.width,async({page})=>{
    test.setTimeout(120000);
    await page.setViewportSize(profile);
    await page.emulateMedia({reducedMotion:'reduce'});
    mkdirSync('visual-evidence/rooms-r12-60',{recursive:true});
    for(const id of ['yuesha','brook','fern','cinder'] as const){
      if(id==='yuesha')await page.goto('/apartment/?visit=yuesha');
      else{
        await page.goto('/characters/');
        await page.getByTestId('visit-worker-room-'+id).click();
      }
      const room=page.getByTestId(id==='yuesha'?'yuesha-private-room':'worker-private-room-'+id);
      await expect(room).toBeVisible();
      await expect(room.getByTestId('room-art-local-review')).toHaveCount(0);
      const backdrop=room.getByTestId('room-scene-backdrop');
      const actor=room.getByTestId('room-resident-layer');
      await expect(backdrop).toHaveAttribute('data-scenic-art','false');
      await expect(room.locator('[data-hotspot-layout="object-id"]')).toBeVisible();
      await expect.poll(()=>page.evaluate(id=>{
        const raw=localStorage.getItem('monster-apartment:character-life:v1');
        return raw?JSON.parse(raw).visited.includes(id):false;
      },id)).toBe(true);
      const before=await page.evaluate(()=>localStorage.getItem('monster-apartment:character-life:v1'));
      const toggle=room.getByTestId('room-scenic-toggle');
      await toggle.click();
      await expect(room).toHaveAttribute('data-room-view','scenic');
      await expect(backdrop).toHaveAttribute('data-scenic-art','true');
      await expect(backdrop).toHaveAttribute('data-local-preview','false');
      await expect(backdrop.locator('img')).toHaveAttribute('src',new RegExp(id+'/scenic/background[.]webp'));
      await expect.poll(()=>backdrop.locator('img').evaluate((img:HTMLImageElement)=>img.naturalWidth)).toBe(1672);
      await expect(backdrop.locator('img')).toHaveJSProperty('naturalHeight',941);
      await expect(actor).toHaveAttribute('data-scenic-art','true');
      await expect(actor).toHaveAttribute('data-review-performer','false');
      const standing=actor.getByTestId('room-portrait-frame').locator('img');
      await expect(standing).toHaveAttribute('src',new RegExp(id+'/scenic/standing[.]webp'));
      await expect.poll(()=>standing.evaluate((img:HTMLImageElement)=>img.naturalWidth)).toBe(1086);
      await expect(standing).toHaveJSProperty('naturalHeight',1448);
      await expect(room.getByTestId('room-story-rail')).toBeHidden();
      await expect(room.locator('[data-hotspot-layout="object-id"]')).toHaveCount(0);
      await expect(room.getByTestId('room-character-archive')).toBeHidden();
      await page.screenshot({path:'visual-evidence/rooms-r12-60/'+id+'-'+profile.width+'.png'});
      await toggle.click();
      await expect(room).toHaveAttribute('data-room-view','story');
      await expect(backdrop.locator('img')).toHaveAttribute('src',/concept-scene[.]svg$/);
      await expect(actor).toHaveAttribute('data-scenic-art','false');
      await expect(room.getByTestId('room-story-rail')).toBeVisible();
      await expect(room.locator('[data-hotspot-layout="object-id"]')).toBeVisible();
      expect(await page.evaluate(()=>localStorage.getItem('monster-apartment:character-life:v1'))).toBe(before);
    }
  });
}
