import { test, expect } from '@playwright/test';

const seedGrowthSave = (progress: { id: string; level: number; shards: number; evolution: number }, essence = 100) => {
  const resident = progress.id;
  return {
    version: 1, locale: 'zh', tutorialActive: false, tutorialStep: 0,
    state: {
      day: 1, coins: 35, satisfaction: 70,
      rooms: [resident, null, null, null, null, null],
      policy: 'steady', nightDecision: 'none', history: [],
      over: false, outcome: null,
      notice: '灵核已就位。', log: ['第 1 天：灵核公寓开张，初始资金 35 金币。'],
    },
    collection: {
      tickets: 10, essence, totalPulls: 0, pity: { sr: 0, ssr: 0, ur: 0 },
      recent: [], equipped: [resident, null, null, null, null, null],
      owned: {
        seedling: { level: 1, xp: 0, shards: 0, evolution: 0 },
        [resident]: { level: progress.level, xp: 0,
          shards: progress.shards, evolution: progress.evolution },
      },
    },
  };
};

test('fragment awakening persists and remains visible in the codex', async ({ page }) => {
  const initial = seedGrowthSave({ id: 'seedling', level: 1, shards: 20, evolution: 0 });
  await page.addInitScript(data => {
    const key = 'monster-apartment:save:v1';
    if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(data));
  }, initial);
  await page.goto('/legacy');
  await page.getByTestId('open-spirit-portal').click();
  const portal = page.getByTestId('spirit-portal');
  await portal.getByRole('tab', { name: '图鉴养成' }).click();
  await portal.getByRole('button', { name: '芽核 · 查看详情' }).click();
  await expect(page.getByTestId('spirit-stars')).toContainText('0/5');
  await page.getByTestId('awaken-spirit').click();
  await expect(page.getByTestId('spirit-stars')).toContainText('1/5');
  await expect(page.getByTestId('spirit-profile')).toContainText('碎片 0');
  await page.reload();
  await page.getByTestId('open-spirit-portal').click();
  await portal.getByRole('tab', { name: '图鉴养成' }).click();
  await portal.getByRole('button', { name: '芽核 · 查看详情' }).click();
  await expect(page.getByTestId('spirit-stars')).toContainText('1/5');
  expect(await page.evaluate(() => document.documentElement.scrollHeight - innerHeight)).toBeLessThanOrEqual(1);
});

test('mythic final evolution offers meaningful exclusive paths', async ({ page }) => {
  const initial = seedGrowthSave({ id: 'aurora-whale', level: 20, shards: 0, evolution: 1 });
  await page.addInitScript(data => {
    const key = 'monster-apartment:save:v1';
    if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(data));
  }, initial);
  await page.goto('/legacy');
  await page.getByTestId('open-spirit-portal').click();
  const portal = page.getByTestId('spirit-portal');
  await portal.getByRole('tab', { name: '图鉴养成' }).click();
  await portal.getByRole('button', { name: '极昼鲸 · 查看详情' }).click();
  const choices = page.getByTestId('mythic-paths');
  await expect(choices.getByRole('button')).toHaveCount(2);
  await choices.getByRole('button', { name: /繁荣进化/ }).click();
  await expect(page.getByTestId('spirit-profile')).toContainText('繁荣进化：每夜 +6 金币');
  await expect(choices).toHaveCount(0);
  await page.reload();
  await page.getByTestId('open-spirit-portal').click();
  await portal.getByRole('tab', { name: '图鉴养成' }).click();
  await portal.getByRole('button', { name: '极昼鲸 · 查看详情' }).click();
  await expect(page.getByTestId('spirit-profile')).toContainText('繁荣进化：每夜 +6 金币');
});
