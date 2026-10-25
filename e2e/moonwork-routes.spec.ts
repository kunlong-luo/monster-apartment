import {test,expect} from '@playwright/test';

test('V2.2 world has five reachable destinations without inventing a save',async({page})=>{
  await page.goto('/town/');
  await expect(page.getByTestId('moonwork-world')).toHaveAttribute('data-area','town');
  await expect(page.getByText('尚无可用的 V2 工坊存档')).toBeVisible();
  await expect(page.getByRole('link',{name:'进入工坊开始经营'}))
    .toHaveAttribute('href','../workshop/');
  await page.getByRole('link',{name:'委托大厅'}).click();
  await expect(page).toHaveURL(/\/orders\/?$/);
  await expect(page.getByTestId('moonwork-world')).toHaveAttribute('data-area','orders');
  await page.getByRole('link',{name:'角色图鉴'}).click();
  await expect(page.getByTestId('moonwork-world')).toHaveAttribute('data-area','characters');
  await page.getByRole('link',{name:'魔法仓库'}).click();
  await expect(page.getByTestId('moonwork-world')).toHaveAttribute('data-area','warehouse');
});
test('orders and warehouse transact the same real localStorage save',async({page})=>{
  const sample={
    version:2,day:6,coins:132,
    tiles:Array.from({length:15},(_,i)=>
      i===5?{craft:'well',worker:'brook',stored:5}:
      i===6?{craft:'garden',worker:'fern',stored:0}:
      i===7?{craft:'kiln',worker:'cinder',stored:0}:null),
    warehouse:{core:8},order:{due:9,cores:3,reward:95},last:null,
    completed:1,failed:0,
    patron:{status:'offered',due:8,cores:15,reward:135}
  };
  await page.addInitScript(world=>localStorage.setItem(
    'monster-apartment:workshop-v2-lab',JSON.stringify(world)),sample);
  await page.goto('/orders/');
  await expect(page.getByTestId('world-coins')).toHaveText('132');
  await page.getByRole('button',{name:'接受月纱委托'}).click();
  await expect(page.getByText('当前状态：进行中')).toBeVisible();
  await page.getByRole('link',{name:'魔法仓库'}).click();
  await expect(page.getByTestId('world-cores')).toHaveText('8');
  await page.getByRole('button',{name:'付费采购 +1 晶核'}).click();
  await expect(page.getByTestId('world-cores')).toHaveText('9');
  await expect(page.getByTestId('world-coins')).toHaveText('90');
  await page.reload();
  await expect(page.getByTestId('world-cores')).toHaveText('9');
  await page.getByRole('link',{name:'角色图鉴'}).click();
  await expect(page.getByText(/正在 06 号工位/)).toBeVisible();
});
