import {test,expect} from '@playwright/test';

test('mobile workshop machine states follow real staffing and supply',async({page})=>{
  test.setTimeout(90_000);
  await page.setViewportSize({width:390,height:844});
  await page.goto('/workshop/');
  const stage=page.getByTestId('v2-stage');
  const canvas=stage.locator('canvas');
  await expect(canvas).toBeVisible({timeout:25_000});
  await expect(stage).toHaveAttribute('data-machine-states',/5:idle;7:idle/);
  await expect(stage).toHaveAttribute('data-worker-art',/transparent/);

  await page.getByTestId('v2-worker-fern').click();
  const box=await canvas.boundingBox();
  expect(box).not.toBeNull();
  // On phones the Pixi stage uses a fixed 830x820 logical scene.
  await canvas.click({position:{
    x:(15+2*160+73)/830*box!.width,
    y:(225+160+73)/820*box!.height,
  }});
  await expect(stage).toHaveAttribute('data-machine-states',/7:blocked/);
  await expect(page.getByTestId('v2-status')).toContainText('已派往');

  // At 390px all controls remain above the bottom dock, not on top of it.
  const layout=await page.evaluate(()=>{
    const consoleBox=document.querySelector('#root .console')!.getBoundingClientRect();
    const dock=document.querySelector('[data-testid="v2-world-nav"]')!.getBoundingClientRect();
    const rail=document.querySelector('#root .middle')!.getBoundingClientRect();
    return {consoleBottom:consoleBox.bottom,dockTop:dock.top,
      railBottom:rail.bottom,consoleTop:consoleBox.top,
      consoleWidth:consoleBox.width,viewport:window.innerWidth};
  });
  expect(layout.consoleBottom).toBeLessThanOrEqual(layout.dockTop+2);
  expect(layout.railBottom).toBeLessThanOrEqual(layout.consoleTop+2);
  expect(layout.consoleWidth).toBeLessThan(layout.viewport);
});

test('world buttons and headings remain in their panels on a narrow phone',async({page})=>{
  test.setTimeout(90_000);
  await page.setViewportSize({width:320,height:700});
  await page.goto('/town/');
  await expect(page.getByTestId('moonlit-town-scene')).toBeVisible();
  const positions=await page.locator('.mw-town-portal').evaluateAll(anchors=>
    anchors.map(node=>{
      const rect=node.getBoundingClientRect();
      const title=node.querySelector('strong')!.getBoundingClientRect();
      return {left:rect.left,right:rect.right,titleLeft:title.left,titleRight:title.right};
    }));
  expect(positions).toHaveLength(3);
  for(const p of positions){
    expect(p.titleLeft).toBeGreaterThanOrEqual(p.left-2);
    expect(p.titleRight).toBeLessThanOrEqual(p.right+2);
    expect(p.right).toBeLessThanOrEqual(320);
  }
});
