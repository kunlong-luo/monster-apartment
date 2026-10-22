import { expect, test } from '@playwright/test';

test.describe('mobile viewport', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('lays out without horizontal overflow and keeps controls reachable', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('怪物租客公寓', { exact: true })).toBeVisible();

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);

    await page.getByRole('tab', { name: '房间' }).click();
    for (let room = 1; room <= 6; room++) {
      await expect(page.getByRole('button', { name: new RegExp(`^${room} 号房`) })).toBeVisible();
    }
  });
});

test('rooms can be chosen and tenants hired with the keyboard only', async ({ page }) => {
  await page.goto('/');
  const room = page.getByRole('button', { name: /^3 号房/ });
  await room.focus();
  await page.keyboard.press('Enter');
  await expect(room).toHaveAttribute('aria-pressed', 'true');

  const slime = page.getByRole('button', { name: /史莱姆/ });
  await slime.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByText('◈ 29')).toBeVisible();
});
