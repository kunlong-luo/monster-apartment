import { expect, test } from '@playwright/test';

async function hireInto(page: import('@playwright/test').Page, room: number, name: RegExp) {
  await page.getByRole('button', { name: new RegExp(`^${room} 号房`) }).click();
  await page.getByRole('button', { name }).click();
}

test('move a resident to an empty room, then cancel a move', async ({ page }) => {
  await page.goto('/');
  const move = page.getByRole('button', { name: '移动 / 交换租客' });

  await expect(move).toBeDisabled();
  await hireInto(page, 1, /史莱姆/);
  await hireInto(page, 2, /火精灵/);
  await expect(page.getByText('房间 1-2：蒸汽供能 +3 租金')).toBeVisible();

  await move.click();
  await expect(page.getByRole('button', { name: '取消搬家' })).toBeVisible();
  await page.getByRole('button', { name: /^6 号房/ }).click();

  await expect(page.getByRole('button', { name: '2 号房（空房）' })).toBeVisible();
  await expect(page.getByRole('button', { name: '6 号房（已入住）' })).toBeVisible();
  await expect(page.getByText('房间 1-2：蒸汽供能 +3 租金')).toHaveCount(0);

  await move.click();
  await page.getByRole('button', { name: '取消搬家' }).click();
  await expect(page.getByRole('button', { name: '6 号房（已入住）' })).toBeVisible();
});

test('swap two occupied rooms and update adjacency descriptions', async ({ page }) => {
  await page.goto('/');
  await hireInto(page, 1, /史莱姆/);
  await hireInto(page, 2, /火精灵/);
  await hireInto(page, 3, /石像鬼/);

  await expect(page.getByText('房间 1-2：蒸汽供能 +3 租金')).toBeVisible();
  await expect(page.getByText('房间 1-3：整洁石像 +2 租金')).toBeVisible();

  await page.getByRole('button', { name: /^2 号房/ }).click();
  await page.getByRole('button', { name: '移动 / 交换租客' }).click();
  await page.getByRole('button', { name: /^3 号房/ }).click();

  await expect(page.getByText('房间 1-2：整洁石像 +2 租金')).toBeVisible();
  await expect(page.getByText('房间 1-3：蒸汽供能 +3 租金')).toBeVisible();
});

test('move action is unavailable when a game ends', async ({ page }) => {
  await page.goto('/');
  await hireInto(page, 1, /史莱姆/);
  for (let i = 0; i < 5; i++) {
    await page.getByRole('button', { name: /结束今天/ }).click();
  }
  await expect(page.getByText('本局未达标')).toBeVisible();
  await expect(page.getByRole('button', { name: '移动 / 交换租客' })).toBeDisabled();
});
