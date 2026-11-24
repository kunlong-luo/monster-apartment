import {test,expect} from '@playwright/test';
import {assignWorker,moveMachine,placeMachine,runShift,newWorkshop} from '../engine/src/workshop-engine';
import {decideWorker,inspectCharacterRoom,newCharacterLife,visitCharacter} from '../src/core/character-life';

test('Moonsha private room preserves a meaningful first choice without changing apartment money',async({page})=>{
  await page.goto('/apartment/');
  await page.getByRole('button',{name:'与女主人月纱交流'}).click();
  await expect(page.getByRole('dialog',{name:'与月纱交谈'})).toContainText('幸福度');
  await page.getByTestId('visit-yuesha-room').click();
  await expect(page.getByTestId('yuesha-private-room')).toBeVisible();
  const chamber=page.getByRole('dialog',{name:'与月纱交谈'});
  const bounds=await chamber.boundingBox();
  expect(bounds?.width).toBeGreaterThan(1040);
  await expect(page.getByTestId('room-scene-backdrop')).toHaveAttribute('data-scene-id','yuesha');
  await expect(page.getByTestId('room-scene-backdrop')).toHaveAttribute('data-composition','layered-concept');
  await expect(page.getByTestId('room-scene-backdrop').locator('img')).toHaveAttribute('src',/yuesha\/concept-scene\.svg/);
  await expect(page.getByTestId('room-resident-layer')).toHaveAttribute('data-render-mode','separate');
  await expect(page.getByTestId('room-resident-embedded-yuesha')).toHaveCount(0);
  await expect(page.getByTestId('room-resident-present-yuesha')).toHaveCount(1);
  await page.screenshot({path:'test-results/room-yuesha-desktop.png'});
  await expect(page.getByTestId('life-profile-yuesha')).toContainText('谨慎而机敏');
  const before=await page.evaluate(()=>JSON.parse(localStorage.getItem('monster-apartment:cozy:v1')||'{}').coins);
  await page.getByTestId('yuesha-choice-transparent').click();
  await expect(page.getByTestId('yuesha-dialogue')).toContainText('账本摊开');
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('monster-apartment:cozy:v1')||'{}').coins)).toBe(before);
  await expect(page.getByTestId('room-topic-yuesha-contract')).toBeDisabled();
  await expect(page.getByTestId('yuesha-memory-progress')).toContainText('0 / 4');
  await expect(page.getByTestId('yuesha-memory-card-contract')).toBeDisabled();
  await expect(page.getByTestId('room-scene-focus')).toHaveCount(0);
  await page.getByRole('button',{name:'月纹蜡封'}).click();
  await expect(page.getByTestId('room-scene-focus')).toHaveAttribute('data-object-id','seal');
  await expect(page.getByTestId('room-scene-focus')).toHaveAttribute('data-focus-pose','guarded');
  await page.screenshot({path:'test-results/room-yuesha-inspection-desktop.png'});
  await expect(page.getByTestId('scene-discovery')).toContainText('月纹');
  await expect(page.getByTestId('yuesha-hotspot-text')).toContainText('月纹');
  await expect(page.getByTestId('room-resident-reaction')).toContainText('半月印纹');
  await page.getByRole('button',{name:'香料茶杯'}).click();
  await expect(page.getByTestId('room-scene-focus')).toHaveAttribute('data-focus-pose','warm');
  await page.getByRole('button',{name:'旧账簿'}).click();
  await expect(page.getByTestId('yuesha-room-easter-egg')).toContainText('真相');
  await expect(page.getByTestId('yuesha-memory-progress')).toContainText('4 / 4');
  await page.getByTestId('yuesha-memory-card-contract').click();
  await expect(page.getByTestId('yuesha-memory-secret')).toContainText('半月');
  await page.getByTestId('yuesha-memory-card-seal').click();
  await expect(page.getByTestId('room-scene-focus')).toHaveAttribute('data-object-id','seal');
  await expect(page.getByTestId('room-topic-yuesha-contract')).toBeEnabled();
  await page.getByTestId('room-topic-yuesha-contract').click();
  await expect(page.getByTestId('room-topic-response-yuesha')).toContainText('正在场景中演出');
  await expect(page.getByTestId('room-dialogue-theater')).toBeVisible();
  await page.getByTestId('room-theater-skip').click();
  await expect(page.getByTestId('room-theater-line')).toContainText('见证人');
  // R12.30: the room URL is the source of truth. Refresh restores the
  // private room directly; the conversation trigger behind it is blocked
  // intentionally by the modal, not a usable next step.
  await expect.poll(()=>new URL(page.url()).searchParams.get('visit')).toBe('yuesha');
  const loreBeforeReload=await page.evaluate(()=>localStorage.getItem('monster-apartment:character-life:v1'));
  expect(loreBeforeReload).not.toBeNull();
  await page.reload();
  await expect(page.getByTestId('yuesha-private-room')).toBeVisible();
  await expect(chamber).toBeVisible();
  await expect.poll(()=>new URL(page.url()).searchParams.get('visit')).toBe('yuesha');
  await expect(page.getByTestId('yuesha-dialogue')).toContainText('账本摊开');
  await expect(page.getByTestId('yuesha-choice-careful')).toHaveCount(0);
  await expect(page.getByTestId('yuesha-memory-progress')).toContainText('4 / 4');

  // Actually leave the room before using the in-world conversation trigger.
  // This exercises real modal dismissal, not force-clicking through it.
  await chamber.getByRole('button',{name:'关闭月纱对话'}).click();
  await expect(chamber).toHaveCount(0);
  await expect.poll(()=>new URL(page.url()).searchParams.has('visit')).toBe(false);
  await page.getByRole('button',{name:'与女主人月纱交流'}).click();
  await page.getByTestId('visit-yuesha-room').click();
  await expect(page.getByTestId('yuesha-private-room')).toBeVisible();
  await expect(page.getByTestId('yuesha-dialogue')).toContainText('账本摊开');
  await expect(page.getByTestId('yuesha-choice-careful')).toHaveCount(0);
  await expect(page.getByTestId('yuesha-memory-progress')).toContainText('4 / 4');
  // Check the saved decision/observations rather than byte equality: visits
  // may legitimately update other lore metadata on entering the room.
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('monster-apartment:character-life:v1')||'{}'));
  expect(saved.visited).toEqual(['yuesha']);
  expect(saved.decisions['yuesha-first-visit']).toBe('transparent');
});

test('character gallery can open the same room; corrupt lore save is not silently overwritten',async({page})=>{
  await page.goto('/characters/');
  await page.getByRole('button',{name:/选择泉泡/}).click();
  await page.getByRole('tab',{name:'详情'}).click();
  await expect(page.getByTestId('life-profile-brook')).toBeVisible();
  await page.getByTestId('life-expand-brook').click();
  await expect(page.getByTestId('life-profile-brook')).toContainText('耐力');
  await page.getByRole('button',{name:/选择月纱 · 神话/}).click();
  await page.getByRole('link',{name:'进入房间'}).click();
  await expect(page.getByTestId('yuesha-private-room')).toBeVisible();
  await page.goto('/apartment/');
  await page.evaluate(()=>localStorage.setItem('monster-apartment:character-life:v1','{damaged'));
  await page.reload();
  await page.getByRole('button',{name:'与女主人月纱交流'}).click();
  await page.getByTestId('visit-yuesha-room').click();
  await expect(page.getByTestId('character-life-error')).toContainText('存档损坏');
  expect(await page.evaluate(()=>localStorage.getItem('monster-apartment:character-life:v1'))).toBe('{damaged');
});

test('Brook, Fern and Cinder have unique rooms and persisted personal choices',async({page})=>{
  await page.goto('/characters/');
  for(const person of [
    {id:'brook',name:'泉泡',objects:['toolbox','gauge'],secret:'扳手'},
    {id:'fern',name:'青枝',objects:['herbarium','moonflower'],secret:'水脉图'},
    {id:'cinder',name:'炽角',objects:['hammer','blueprint'],secret:'旧熔炉'},
  ] as const){
    await page.getByTestId('visit-worker-room-'+person.id).click();
    const dialog=page.getByRole('dialog',{name:'拜访'+person.name+'的房间'});
    await expect(dialog).toBeVisible();
    await expect(page.getByTestId('worker-private-room-'+person.id)).toContainText(person.name);
    await expect(page.getByTestId('room-scene-backdrop')).toHaveAttribute('data-composition','layered-concept');
    await expect(page.getByTestId('room-resident-layer')).toHaveAttribute('data-render-mode','separate');
    await page.screenshot({path:'test-results/room-'+person.id+'-desktop.png'});
    await dialog.getByTestId('scene-object-'+person.objects[0]).click();
    await expect(page.getByTestId('room-scene-focus')).toHaveAttribute('data-object-id',person.objects[0]);
    await dialog.getByTestId('scene-object-'+person.objects[1]).click();
    await expect(page.getByTestId('worker-room-secret-'+person.id)).toContainText(person.secret);
    await page.getByTestId('worker-room-choice-'+person.id+'-care').click();
    await expect(page.getByTestId('worker-room-choice-'+person.id+'-practice')).toHaveCount(0);
    await dialog.getByRole('button',{name:'离开'+person.name+'的房间'}).click();
    await expect(dialog).toHaveCount(0);
  }
  await page.reload();
  await page.getByTestId('visit-worker-room-brook').click();
  await expect(page.getByTestId('worker-room-dialogue-brook')).toContainText('先坐一会儿');
  await expect(page.getByTestId('worker-room-secret-brook')).toContainText('扳手');
  const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('monster-apartment:character-life:v1')||'{}'));
  expect(stored.visited).toEqual(['brook','fern','cinder']);
  expect(stored.workerDecisions).toEqual({brook:'care',fern:'care',cinder:'care'});
  expect(stored.observations.brook).toEqual(['toolbox','gauge']);
});

test('assigned worker is not duplicated in their private room',async({page})=>{
  const world=assignWorker(newWorkshop(),'brook',5);
  await page.addInitScript(seed=>{
    if(!localStorage.getItem('monster-apartment:workshop-v2-lab'))
      localStorage.setItem('monster-apartment:workshop-v2-lab',seed);
  },JSON.stringify(world));
  await page.goto('/characters/');
  await expect(page.getByTestId('worker-card-brook')).toBeVisible();
  await page.getByTestId('visit-worker-room-brook').click();
  await expect(page.getByTestId('room-resident-away-brook')).toBeVisible();
  await expect(page.getByTestId('room-resident-present-brook')).toHaveCount(0);
  await expect(page.getByTestId('worker-room-choice-brook-care')).toHaveCount(0);
  await page.getByTestId('room-scenic-toggle').click();
  await expect(page.getByTestId('room-scene-backdrop')).toHaveAttribute('data-scenic-art','true');
  await expect(page.getByTestId('room-resident-away-brook')).toBeVisible();
  await expect(page.getByTestId('room-resident-present-brook')).toHaveCount(0);
  await page.getByTestId('room-scenic-toggle').click();
  await page.getByRole('button',{name:'空掉的工具挂钩'}).click();
  await expect(page.getByTestId('scene-discovery')).toContainText('扳手');
});


test('cinematic conversation auto-advances, can skip, and never rewrites lore decisions',async({page})=>{
  await page.goto('/apartment/');
  await page.getByRole('button',{name:'与女主人月纱交流'}).click();
  await page.getByTestId('visit-yuesha-room').click();
  await expect(page.getByTestId('room-resident-layer')).toHaveAttribute('data-pose','idle');
  await page.getByTestId('scene-object-tea').click();
  await expect(page.getByTestId('room-resident-layer')).toHaveAttribute('data-pose','warm');
  const before=await page.evaluate(()=>localStorage.getItem('monster-apartment:character-life:v1'));
  await page.getByTestId('room-topic-yuesha-tea').click();
  await expect(page.getByTestId('room-dialogue-theater')).toBeVisible();
  await expect(page.getByTestId('room-theater-line')).toContainText('桂皮');
  await expect(page.getByTestId('room-dialogue-theater')).toHaveAttribute('data-state','playing');
  await page.getByTestId('room-theater-skip').click();
  await expect(page.getByTestId('room-dialogue-theater')).toHaveAttribute('data-state','finished');
  await expect(page.getByTestId('room-theater-line')).toContainText('人也是');
  await page.getByTestId('room-theater-close').click();
  await expect(page.getByTestId('room-dialogue-theater')).toHaveCount(0);
  await expect(page.getByTestId('room-resident-layer')).toHaveAttribute('data-pose','idle');
  expect(await page.evaluate(()=>localStorage.getItem('monster-apartment:character-life:v1'))).toBe(before);
});

test('reduced-motion setting presents complete conversation immediately',async({page})=>{
  await page.goto('/apartment/');
  await page.evaluate(()=>localStorage.setItem('monster-apartment:gothic-motion-reduced','1'));
  await page.reload();
  await page.getByRole('button',{name:'与女主人月纱交流'}).click();
  await page.getByTestId('visit-yuesha-room').click();
  await page.getByTestId('room-topic-yuesha-moon').click();
  await expect(page.getByTestId('room-dialogue-theater')).toHaveAttribute('data-state','finished');
  await expect(page.getByTestId('room-theater-skip')).toHaveCount(0);
  await expect(page.getByTestId('room-theater-line')).toContainText('今晚');
  await page.getByTestId('room-theater-close').click();
});

test('real delivered order unlocks a persistent worker story in the private room without altering workshop resources',async({page})=>{
  let world=moveMachine(newWorkshop(),7,6);
  world=placeMachine(world,7,'kiln');
  world=assignWorker(world,'brook',5);
  world=assignWorker(world,'fern',6);
  world=assignWorker(world,'cinder',7);
  for(let i=0;i<12&&world.completed<1;i++)world=runShift(world);
  expect(world.completed).toBe(1);

  let lore=decideWorker(visitCharacter(newCharacterLife(),'brook'),'brook','practice');
  lore=inspectCharacterRoom(lore,'brook','toolbox');
  lore=inspectCharacterRoom(lore,'brook','gauge');
  await page.addInitScript(({workshop,character})=>{
    if(!localStorage.getItem('monster-apartment:workshop-v2-lab'))
      localStorage.setItem('monster-apartment:workshop-v2-lab',workshop);
    if(!localStorage.getItem('monster-apartment:character-life:v1'))
      localStorage.setItem('monster-apartment:character-life:v1',character);
  },{workshop:JSON.stringify(world),character:JSON.stringify(lore)});
  await page.goto('/characters/');
  await page.getByTestId('visit-worker-room-brook').click();
  await expect(page.getByTestId('room-resident-away-brook')).toBeVisible();
  await expect(page.getByTestId('worker-story-progress-brook')).toContainText('0 / 2');
  await expect(page.getByTestId('worker-story-collect-brook')).toBeVisible();
  await page.getByTestId('worker-story-collect-brook').click();
  await expect(page.getByTestId('worker-story-progress-brook')).toContainText('1 / 2');
  await expect(page.getByTestId('worker-story-memory-brook')).toContainText('夜铃后的回声');
  const stored=await page.evaluate(()=>({
    workshop:localStorage.getItem('monster-apartment:workshop-v2-lab'),
    lore:JSON.parse(localStorage.getItem('monster-apartment:character-life:v1')||'{}'),
  }));
  expect(stored.workshop).toBe(JSON.stringify(world));
  expect(stored.lore.workerChapters).toEqual({brook:1});
  await page.reload();
  // Since R12.26 the private suite is a canonical deep link. Reloading
  // /characters/?visit=brook restores Brook's room automatically; a second
  // click would target the obscured gallery behind the already-open modal.
  await expect(page).toHaveURL(/\/characters\/?\?visit=brook$/);
  await expect(page.getByTestId('worker-private-room-brook')).toBeVisible();
  await expect(page.getByTestId('worker-story-progress-brook')).toContainText('1 / 2');
  await expect(page.getByTestId('worker-story-memory-brook')).toBeVisible();
  await expect(page.getByTestId('worker-story-collect-brook')).toHaveCount(0);
});
