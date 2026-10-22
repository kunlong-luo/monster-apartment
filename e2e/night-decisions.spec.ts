import { test, expect } from '@playwright/test';
import { placeStarter } from './helpers';

test('five-night spirit decisions persist then reset after settlement', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await placeStarter(page);
  const options=page.getByRole('group',{name:'今晚的事件应对'});
  const profit=options.getByRole('button',{name:/卖夜间通行券/});
  await profit.click();
  await expect(profit).toHaveAttribute('aria-pressed','true');
  await expect(page.getByTestId('balance-forecast')).toContainText('今晚满意度预测');
  await page.reload();
  await expect(options.getByRole('button',{name:/卖夜间通行券/})).toHaveAttribute('aria-pressed','true');
  await page.getByRole('button',{name:'结束今天'}).click();
  await expect(page.locator('.game-log')).toContainText('夜间抉择 profit');
  await expect(options.getByRole('button',{name:/顺其自然/})).toHaveAttribute('aria-pressed','true');
  expect(await page.evaluate(() => document.documentElement.scrollHeight-innerHeight)).toBeLessThanOrEqual(1);
});
test('English mobile events work with reduced motion', async ({ page }) => {
  await page.setViewportSize({width:390,height:844});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/');
  await page.getByRole('combobox',{name:'语言'}).selectOption('en');
  await page.getByRole('button',{name:'Place Seedcore in selected room'}).click();
  await page.getByRole('tab',{name:'Manage'}).click();
  const choices=page.getByRole('group',{name:'Tonight event decision'});
  await choices.getByRole('button',{name:/Extra patrol/}).click();
  await page.getByRole('button',{name:'End day'}).click();
  const animation=await page.locator('.game-settlement-reveal').evaluate(el=>getComputedStyle(el).animationName);
  expect(animation).toBe('none');
  await page.getByRole('tab',{name:'Journal'}).click();
  await expect(page.locator('.game-log')).toContainText('Night decision Care');
});
