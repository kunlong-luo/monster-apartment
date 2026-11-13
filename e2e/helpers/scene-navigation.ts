import {expect} from '@playwright/test';
import type {Page} from '@playwright/test';

/** Same real compact navigation a player uses on every non-lobby page. */
export async function navigateScene(page:Page,href:string){
  const toggle=page.getByTestId('scene-navigation-toggle');
  await expect(toggle).toBeVisible();
  await toggle.click();
  const map=page.getByRole('navigation',{name:'游戏七个正式地点'});
  await expect(map.getByRole('link')).toHaveCount(7);
  await map.locator('[data-destination="'+href+'"]').click();
  // A click closes the navigation panel before Next has finished rendering the
  // destination. Wait for the actual new scene, not just the old panel closing.
  // This also handles slower CI route compilations without masking a bad link.
  if(href==='/'){
    await expect(page.getByTestId('gothic-lobby')).toBeVisible({timeout:25_000});
  }else{
    await expect(page.getByTestId('scene-navigation')).toHaveAttribute(
      'data-current-route',href,{timeout:25_000});
  }
  await expect(page.getByTestId('scene-navigation-panel')).toHaveCount(0);
}

export async function expectSceneNavigation(page:Page,href:string){
  await expect(page.getByTestId('scene-navigation')).toHaveAttribute('data-current-route',href);
  await expect(page.locator('.gothic-dock-bar')).toHaveCount(0);
  await expect(page.getByTestId('scene-navigation-toggle')).toBeVisible();
}
