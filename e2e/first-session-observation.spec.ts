import {expect,test} from '@playwright/test';

test('unlisted R11.3 observer route exports one anonymous participant without a backend',async({page})=>{
  await page.goto('/research/first-session/');
  await expect(page.getByTestId('r113-observation-form')).toBeVisible();
  await expect(page.getByTestId('scene-navigation')).toHaveCount(0);
  await expect(page.getByText('不会上传或持久化观察记录')).toBeVisible();
  await page.getByTestId('research-participant-id').fill('T01');
  await page.getByLabel('设备',{exact:true}).selectOption('mobile');
  await page.getByTestId('research-entered_workshop').selectOption('true');
  await page.getByTestId('research-enabled_auto_production_without_help').selectOption('true');
  await page.getByTestId('research-would-replay').selectOption('unsure');
  await page.getByRole('button',{name:'生成单人 CSV'}).click();
  const csv=await page.getByTestId('research-csv-preview').inputValue();
  const lines=csv.split('\r\n');
  expect(lines).toHaveLength(3);
  expect(lines[0]).toBe('participant_id,device,viewport,browser,session_minutes,'+
    'entered_workshop,assigned_worker_without_help,enabled_auto_production_without_help,'+
    'enabled_auto_delivery_without_help,completed_first_order,order_time_available_minutes,'+
    'major_blocker,needed_hint,hint_timestamp_minutes,would_replay,replay_reason,notes');
  expect(lines[1]).toContain('"T01","mobile"');
  expect(lines[1]).toContain('"unsure"');
  const downloadPromise=page.waitForEvent('download');
  await page.getByTestId('research-download-csv').click();
  const download=await downloadPromise;
  expect(download.suggestedFilename()).toBe('monster-apartment-r113-T01.csv');

  // No anonymous record is persisted in localStorage; reload starts empty.
  expect(await page.evaluate(()=>localStorage.getItem('r113-first-session'))).toBeNull();
  await page.reload();
  await expect(page.getByTestId('research-participant-id')).toHaveValue('');
  await expect(page.getByTestId('research-csv-preview')).toHaveCount(0);
});

test('research observer distinguishes unobserved from false on mobile',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('/research/first-session/');
  await expect(page.getByTestId('r113-observation-form')).toBeVisible();
  await page.getByTestId('research-participant-id').fill('T02');
  await page.getByLabel('设备',{exact:true}).selectOption('PC');
  await page.getByTestId('research-enabled_auto_delivery_without_help').selectOption('false');
  await page.getByTestId('research-would-replay').selectOption('no');
  await page.getByRole('button',{name:'生成单人 CSV'}).click();
  const preview=await page.getByTestId('research-csv-preview').inputValue();
  expect(preview).toContain('"false"');
  expect(preview).toContain('"no"');
  expect(preview).toContain('"T02"');
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});
