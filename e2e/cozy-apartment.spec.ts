import { test, expect } from '@playwright/test';

test('first-time player builds a bath, welcomes Dewdrop, and furnishes it',async({page})=>{
  const errors:string[]=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/');
  await expect(page.getByRole('heading',{name:'灵核公寓'})).toBeVisible();
  for(let n=0;n<6;n++)await expect(page.getByTestId('cozy-room-'+n)).toBeVisible();
  await expect(page.getByTestId('cozy-actor-seedling')).toBeVisible();
  await expect(page.getByTestId('open-night-raid')).toHaveCount(0);
  await expect(page.getByTestId('living-stat-heat')).toHaveCount(0);
  await expect(page.getByTestId('cozy-coins')).toHaveText('105');
  await page.getByTestId('cozy-room-2').click();
  await expect(page.getByTestId('cozy-build-bath')).toBeVisible();
  await page.getByTestId('cozy-build-bath').click();
  await expect(page.getByTestId('cozy-coins')).toHaveText('71');
  await expect(page.getByTestId('cozy-room-2')).toContainText('水汽浴室');
  await page.getByTestId('cozy-welcome-dewdrop').click();
  await expect(page.getByTestId('cozy-room-2')).toContainText('露珠灵');
  await expect(page.getByTestId('cozy-occupancy')).toContainText('2');
  await page.getByTestId('cozy-decor-books').click();
  await expect(page.getByTestId('cozy-coins')).toHaveText('59');
  await expect(page.getByTestId('cozy-room-2')).toContainText('露珠灵');
  await expect(page.getByTestId('cozy-story')).toContainText('故事书');
  await page.getByTestId('cozy-pause').click();
  await expect(page.getByTestId('cozy-pause')).toHaveAttribute('aria-pressed','true');
  await page.reload();
  await expect(page.getByTestId('cozy-room-2')).toContainText('露珠灵');
  await expect(page.getByTestId('cozy-coins')).toHaveText('59');
  expect(errors).toEqual([]);
});

test('phone shows the whole three-story building without document scroll',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/');
  await expect(page.getByRole('heading',{name:'灵核公寓'})).toBeVisible();
  await expect(page.getByTestId('cozy-room-4')).toBeVisible();
  await page.getByTestId('cozy-room-5').click();
  await expect(page.getByTestId('cozy-build-greenhouse')).toBeVisible();
  await page.getByTestId('cozy-build-greenhouse').click();
  await expect(page.getByTestId('cozy-room-5')).toContainText('屋顶花房');
  const dims=await page.evaluate(()=>({
    vertical:document.documentElement.scrollHeight-innerHeight,
    horizontal:document.documentElement.scrollWidth-innerWidth,
  }));
  expect(dims.vertical).toBeLessThanOrEqual(1);
  expect(dims.horizontal).toBeLessThanOrEqual(1);
  await page.getByRole('button',{name:'Change language'}).click();
  await expect(page.getByRole('heading',{name:'Spirit Residence'})).toBeVisible();
});

test('daily rent and a new resident offer are visible in the same building',async({page})=>{
  await page.goto('/');
  await expect.poll(()=>page.evaluate(()=>!!localStorage.getItem('monster-apartment:cozy:v1'))).toBe(true);
  await page.evaluate(()=>{
    const key='monster-apartment:cozy:v1';
    const state=JSON.parse(localStorage.getItem(key)!);
    state.tick=11;
    localStorage.setItem(key,JSON.stringify(state));
  });
  await page.reload();
  await expect(page.getByTestId('cozy-applicant-fern-hare')).toBeVisible({timeout:6500});
  await expect(page.getByTestId('cozy-story')).toContainText('蕨尾兔');
  const cash=Number(await page.getByTestId('cozy-coins').textContent());
  expect(cash).toBeGreaterThan(105);
  await page.getByTestId('cozy-room-5').click();
  await page.getByTestId('cozy-build-greenhouse').click();
  await page.getByTestId('cozy-welcome-fern-hare').click();
  await expect(page.getByTestId('cozy-occupancy')).toContainText('2');
  await expect(page.getByTestId('cozy-actor-fern-hare')).toBeVisible();
});

test('residents can be rehomed with a visible happiness and rent forecast',async({page})=>{
  const runtimeErrors:string[]=[];
  page.on('pageerror',error=>runtimeErrors.push(error.message));
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/');
  await page.getByTestId('cozy-pause').click();
  await page.getByTestId('cozy-room-2').click();
  await page.getByTestId('cozy-build-bath').click();
  await page.getByTestId('cozy-welcome-dewdrop').click();
  const rent=await page.getByTestId('cozy-rent').textContent();
  await page.getByTestId('cozy-room-4').click();
  await page.getByTestId('cozy-relocate').click();
  await expect(page.getByTestId('cozy-relocate')).toHaveAttribute('aria-pressed','true');
  const preview=page.getByTestId('cozy-move-preview-2');
  await expect(preview).toBeVisible();
  await expect(preview).toContainText('搬迁后');
  await page.getByTestId('cozy-room-2').click();
  await expect(page.getByTestId('cozy-room-2')).toContainText('芽核');
  await expect(page.getByTestId('cozy-room-4')).toContainText('露珠灵');
  expect(await page.getByTestId('cozy-rent').textContent()).not.toBe(rent);
  await expect(page.getByTestId('cozy-story')).toContainText('交换');
  await page.reload();
  await expect(page.getByTestId('cozy-room-2')).toContainText('芽核');
  await expect(page.getByTestId('cozy-room-4')).toContainText('露珠灵');
  expect(runtimeErrors).toEqual([]);
});

test('dragging a resident changes homes and preserves their furniture',async({page})=>{
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/');
  await page.getByTestId('cozy-pause').click();
  await page.getByTestId('cozy-room-5').click();
  await page.getByTestId('cozy-build-nest').click();
  await page.getByTestId('cozy-room-4').dragTo(page.getByTestId('cozy-room-5'));
  await expect(page.getByTestId('cozy-room-5')).toContainText('芽核');
  await expect(page.getByTestId('cozy-room-4')).not.toContainText('芽核');
  await expect(page.getByTestId('cozy-occupancy')).toContainText('1');
});

test('residents visibly visit nearby neighbors during the day',async({page})=>{
  await page.goto('/');
  await page.getByTestId('cozy-pause').click();
  await page.getByTestId('cozy-room-2').click();
  await page.getByTestId('cozy-build-bath').click();
  await page.getByTestId('cozy-welcome-dewdrop').click();
  await page.evaluate(()=>{
    const key='monster-apartment:cozy:v1';
    const save=JSON.parse(localStorage.getItem(key)!);
    save.tick=7;
    localStorage.setItem(key,JSON.stringify(save));
  });
  await page.reload();
  await expect(page.getByTestId('cozy-visit-dewdrop')).toBeVisible({timeout:4000});
  await expect(page.getByTestId('cozy-stair-route-dewdrop')).toBeVisible();
  await expect(page.getByTestId('cozy-stairwell')).toHaveAttribute('data-active-visits','1');
  await expect(page.getByTestId('cozy-social-pulse')).toContainText('露珠灵');
  await expect(page.getByTestId('cozy-away-dewdrop')).toContainText('串门');
  await expect(page.getByTestId('cozy-room-2')).toContainText('露珠灵');
  await expect(page.getByTestId('cozy-room-4')).toContainText('芽核');
});

test('rooms use cohesive layered vector dioramas rather than emoji furniture or portrait cards',async({page})=>{
  await page.setViewportSize({width:1440,height:900});
  const pageErrors:string[]=[];
  page.on('pageerror',err=>pageErrors.push(err.message));
  await page.goto('/');
  await expect.poll(()=>page.evaluate(()=>!!localStorage.getItem('monster-apartment:cozy:v1'))).toBe(true);
  // This is an art-gallery fixture, not an altered player opening economy.
  await page.evaluate(()=>{
    const key='monster-apartment:cozy:v1';
    const save=JSON.parse(localStorage.getItem(key)!);
    save.coins=220;
    localStorage.setItem(key,JSON.stringify(save));
  });
  await page.reload();
  await page.getByTestId('cozy-pause').click();
  const original=page.getByTestId('cozy-room-4');
  await expect(original.getByTestId('cozy-art-nest')).toBeVisible();
  await expect(original.getByTestId('cozy-spirit-seedling')).toBeVisible();
  await expect(original.locator('.cozy-furniture-main')).toHaveCount(0);
  // No portrait background, rarity badge, or decorative emoji in the room.
  await expect(original.locator('.cozy-character > rect')).toHaveCount(0);
  for(const [index,kind] of [[0,'bath'],[1,'workshop'],[2,'greenhouse']] as const){
    await page.getByTestId('cozy-room-'+index).click();
    await page.getByTestId('cozy-build-'+kind).click();
    await expect(page.getByTestId('cozy-room-'+index).getByTestId('cozy-art-'+kind)).toBeVisible();
  }
  await expect(page.locator('.cozy-roof-sign')).toBeVisible();
  await expect(page.locator('.cozy-street-backdrop')).toBeVisible();
  await expect(page.locator('.cozy-street-backdrop .cozy-street-window').first()).toBeAttached();
  await expect(page.locator('.cozy-bath-steam').first()).toBeVisible();
  await page.screenshot({path:'test-results/cozy-desktop.png'});
  expect(pageErrors).toEqual([]);
});

test('illustrated room architecture and characters stay visible on a narrow phone',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/');
  await expect(page.getByTestId('cozy-room-4').getByTestId('cozy-art-nest')).toBeVisible();
  await expect(page.getByTestId('cozy-spirit-seedling')).toBeVisible();
  await expect(page.locator('.cozy-building')).toBeVisible();
  await expect(page.locator('.cozy-street-backdrop')).toBeVisible();
  await expect(page.locator('.cozy-street-cloud').first()).toHaveCSS('animation-name','none');
  await page.screenshot({path:'test-results/cozy-mobile.png'});
  const overflows=await page.evaluate(()=>({
    horizontal:document.documentElement.scrollWidth-innerWidth,
    vertical:document.documentElement.scrollHeight-innerHeight,
  }));
  expect(overflows.horizontal).toBeLessThanOrEqual(1);
  expect(overflows.vertical).toBeLessThanOrEqual(1);
});

test('Phaser light pass and room foreground preserve real room interaction',async({page})=>{
  const errors:string[]=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/');
  const home=page.getByTestId('cozy-room-4');
  await expect(home.getByTestId('cozy-foreground-nest')).toBeVisible();
  await expect(home.getByTestId('cozy-spirit-seedling')).toBeVisible();
  await expect(home.locator('.cozy-spirit-feet')).toHaveCount(1);
  await expect(home.locator('.cozy-sleep-eyes, .cozy-spirit-eye-blink')).toBeVisible();
  const atmosphere=page.getByTestId('cozy-phaser-atmosphere');
  await expect(atmosphere).toBeVisible();
  await expect(atmosphere.locator('canvas')).toBeVisible({timeout:15000});
  await expect(atmosphere).toHaveCSS('pointer-events','none');
  await expect(home.getByTestId('cozy-foreground-nest')).toHaveCSS('pointer-events','none');
  await page.getByTestId('cozy-room-2').click();
  await page.getByTestId('cozy-build-bath').click();
  await expect(page.getByTestId('cozy-room-2').getByTestId('cozy-foreground-bath')).toBeVisible();
  await page.getByTestId('cozy-welcome-dewdrop').click();
  await expect(page.getByTestId('cozy-actor-dewdrop')).toBeVisible();
  expect(errors).toEqual([]);
});

test('new staged animation obeys reduced-motion on mobile',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/');
  const bedroom=page.getByTestId('cozy-room-4');
  await expect(bedroom.locator('.cozy-spirit-appendages')).toHaveCSS('animation-name','none');
  await expect(bedroom.getByTestId('cozy-foreground-nest')).toBeVisible();
  await expect(page.getByTestId('cozy-phaser-atmosphere').locator('canvas')).toBeVisible({timeout:15000});
  await page.getByTestId('cozy-room-5').click();
  await expect(page.getByTestId('cozy-build-nest')).toBeVisible();
  const overflow=await page.evaluate(()=>({
    x:document.documentElement.scrollWidth-innerWidth,
    y:document.documentElement.scrollHeight-innerHeight,
  }));
  expect(overflow.x).toBeLessThanOrEqual(1);
  expect(overflow.y).toBeLessThanOrEqual(1);
});

test('construction, resident arrival and furnishing animate only real room changes',async({page})=>{
  await page.goto('/');
  await page.getByTestId('cozy-pause').click();
  const room=page.getByTestId('cozy-room-2');
  await expect(page.locator('.cozy-room-moment')).toHaveCount(0);
  await room.click();
  await page.getByTestId('cozy-build-bath').click();
  await expect(room.getByTestId('cozy-moment-build')).toBeAttached();
  await page.getByTestId('cozy-welcome-dewdrop').click();
  await expect(room.getByTestId('cozy-moment-welcome')).toBeAttached();
  await page.getByTestId('cozy-decor-books').click();
  await expect(room.getByTestId('cozy-moment-furnish')).toBeAttached();
  await page.getByRole('button',{name:'重新开始'}).click();
  await expect(page.locator('.cozy-room-moment')).toHaveCount(0);
  await expect(page.getByTestId('cozy-coins')).toHaveText('105');
});

test('weather and clock art direction is save-compatible and accessible',async({page})=>{
  await page.goto('/');
  await expect.poll(()=>page.evaluate(()=>
    localStorage.getItem('monster-apartment:cozy:v1')!==null)).toBe(true);
  await page.evaluate(()=>{
    const key='monster-apartment:cozy:v1';
    const state=JSON.parse(localStorage.getItem(key)!);
    state.tick=24; // day 3: rain, dawn
    localStorage.setItem(key,JSON.stringify(state));
  });
  await page.reload();
  const stage=page.getByTestId('cozy-apartment');
  await expect(stage).toHaveAttribute('data-world-weather','rain');
  await expect(stage).toHaveAttribute('data-world-light','dawn');
  await expect(page.locator('.cozy-weather')).toBeAttached();
  await page.emulateMedia({reducedMotion:'reduce'});
  await expect(page.locator('.cozy-weather')).toHaveCSS('animation-name','none');
});

test('the three floors share a central stairwell and become lived-in as tenants arrive',async({page})=>{
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/');
  await page.getByTestId('cozy-pause').click();
  const spine=page.getByTestId('cozy-stairwell');
  await expect(spine).toBeVisible();
  await expect(spine.locator('.cozy-stair-landing')).toHaveCount(3);
  await expect(spine.locator('.cozy-stair-landing.is-lit')).toHaveCount(1);
  await expect(page.locator('.cozy-room-door')).toHaveCount(1);
  const before=await spine.boundingBox();
  expect(before).not.toBeNull();
  expect(before!.height).toBeGreaterThan(200);
  expect(before!.width).toBeGreaterThan(25);
  await page.getByTestId('cozy-room-2').click();
  await page.getByTestId('cozy-build-bath').click();
  await expect(page.locator('.cozy-room-door')).toHaveCount(2);
  await page.getByTestId('cozy-welcome-dewdrop').click();
  await expect(spine.locator('.cozy-stair-landing.is-lit')).toHaveCount(2);
  await page.reload();
  await expect(page.getByTestId('cozy-stairwell')
    .locator('.cozy-stair-landing.is-lit')).toHaveCount(2);
});

test('stairwell retains room buttons and single-screen layout on a 390px phone',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/');
  const spine=page.getByTestId('cozy-stairwell');
  await expect(spine).toBeVisible();
  await expect(spine).toHaveCSS('grid-column-start','2');
  for(let index=0;index<6;index++){
    const room=page.getByTestId('cozy-room-'+index);
    await expect(room).toBeVisible();
    await expect(room).toHaveAttribute('aria-label',/.+/);
  }
  await expect(spine).toHaveCSS('pointer-events','none');
  await page.getByTestId('cozy-room-5').click();
  await expect(page.getByTestId('cozy-build-greenhouse')).toBeVisible();
  const metrics=await page.evaluate(()=>({
    x:document.documentElement.scrollWidth-innerWidth,
    y:document.documentElement.scrollHeight-innerHeight,
  }));
  expect(metrics.x).toBeLessThanOrEqual(1);
  expect(metrics.y).toBeLessThanOrEqual(1);
});

test('vacant rooms are six distinct restorative cutaways, not repeated placeholder buttons',async({page})=>{
  await page.setViewportSize({width:1440,height:900});
  const errors:string[]=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/');
  await page.getByTestId('cozy-pause').click();
  for(const index of [0,1,2,3,5]){
    const room=page.getByTestId('cozy-room-'+index);
    await expect(room.getByTestId('cozy-vacant-art-'+index)).toBeVisible();
    await expect(room.locator('.cozy-vacant-relic')).toBeVisible();
    await expect(room.locator('.cozy-empty-structure')).toHaveCount(0);
    await expect(room.getByText('修缮房间')).toBeVisible();
  }
  await expect(page.getByTestId('cozy-room-4').getByTestId('cozy-art-nest')).toBeVisible();
  await expect(page.getByTestId('cozy-room-4').locator('.cozy-room-patina.is-nest')).toBeAttached();
  await page.getByTestId('cozy-room-2').click();
  await page.getByTestId('cozy-build-workshop').click();
  await expect(page.getByTestId('cozy-room-2').getByTestId('cozy-vacant-art-2')).toHaveCount(0);
  await expect(page.getByTestId('cozy-room-2').locator('.cozy-room-patina.is-workshop')).toBeAttached();
  await page.reload();
  await expect(page.getByTestId('cozy-room-2').locator('.cozy-room-patina.is-workshop')).toBeAttached();
  expect(errors).toEqual([]);
});

test('the larger resident and restored room are visible on mobile without extra scroll',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/');
  const scene=page.getByTestId('cozy-room-4');
  await expect(scene.locator('.cozy-room-patina.is-nest')).toBeAttached();
  await expect(page.getByTestId('cozy-room-0').getByTestId('cozy-vacant-art-0')).toBeVisible();
  const character=scene.locator('.cozy-actor .cozy-character');
  await expect(character).toBeVisible();
  const width=await character.evaluate(node=>node.getBoundingClientRect().width);
  expect(width).toBeGreaterThanOrEqual(42);
  await expect(page.locator('.cozy-patina-pollen').first()).toHaveCount(0);
  await page.getByTestId('cozy-room-5').click();
  await expect(page.getByTestId('cozy-build-greenhouse')).toBeVisible();
  const metrics=await page.evaluate(()=>({
    x:document.documentElement.scrollWidth-innerWidth,
    y:document.documentElement.scrollHeight-innerHeight,
  }));
  expect(metrics.x).toBeLessThanOrEqual(1);
  expect(metrics.y).toBeLessThanOrEqual(1);
});
