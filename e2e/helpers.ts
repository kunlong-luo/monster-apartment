import type { Page } from '@playwright/test';

export async function placeStarter(page: Page, room = 1) {
  if (room !== 1) await page.getByRole('button', { name: new RegExp('^' + room + ' 号房') }).click();
  await page.getByRole('button', { name: '芽核 入住选中房间' }).click();
}

export async function seedSpirits(page: Page, residents: Array<string | null>) {
  const rooms = Array.from({ length: 6 }, (_, index) => residents[index] ?? null);
  const owned: Record<string, { level: number; xp: number; shards: number; evolution: number }> = {};
  for (const id of ['seedling', ...rooms.filter((id): id is string => id !== null)]) {
    owned[id] = { level: 1, xp: 0, shards: 0, evolution: 0 };
  }
  await page.addInitScript((fixture) => {
    localStorage.setItem('monster-apartment:save:v1', JSON.stringify({
      version: 1,
      locale: 'zh', tutorialActive: false, tutorialStep: 0,
      state: {
        day: 1, coins: 35, satisfaction: 70, rooms: fixture.rooms,
        policy: 'steady', nightDecision: 'none', history: [], over: false,
        outcome: null, notice: '灵核已就位。', log: ['第 1 天：灵核公寓开张，初始资金 35 金币。'],
      },
      collection: {
        tickets: 10, essence: 0, pity: { sr: 0, ssr: 0, ur: 0 },
        totalPulls: 0, recent: [], owned: fixture.owned, equipped: fixture.rooms,
      },
    }));
  }, { rooms, owned });
}
