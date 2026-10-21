import { expect, test } from '@playwright/test';

async function hireInto(page: import('@playwright/test').Page, room: number, tenant: RegExp) {
  await page.getByRole('button', { name: new RegExp(`^${room} 号房`) }).click();
  await page.getByRole('button', { name: tenant }).click();
}

async function settleDays(page: import('@playwright/test').Page, days: number) {
  for (let i = 0; i < days; i++) {
    await page.getByRole('button', { name: /结束今天/ }).click();
  }
}

test('a full five-day optimal layout wins', async ({ page }) => {
  await page.goto('/');
  await hireInto(page, 2, /史莱姆/);
  await hireInto(page, 3, /史莱姆/);
  await hireInto(page, 4, /火精灵/);
  await hireInto(page, 5, /火精灵/);
  await hireInto(page, 6, /史莱姆/);

  await expect(page.getByText('◈ 1')).toBeVisible();
  await settleDays(page, 5);

  await expect(page.getByText('🎉 经营成功')).toBeVisible();
  await expect(page.getByRole('button', { name: /结束今天/ })).toBeDisabled();
});

test('an under-built apartment loses after five days', async ({ page }) => {
  await page.goto('/');
  await hireInto(page, 1, /史莱姆/);
  await settleDays(page, 5);

  await expect(page.getByText('本局未达标')).toBeVisible();
});
