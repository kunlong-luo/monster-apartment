import {describe,it,expect} from 'vitest';
import {readFileSync,readdirSync} from 'node:fs';
import {join,extname} from 'node:path';

const root=process.cwd();
const read=(path:string)=>readFileSync(join(root,path),'utf8');
function scripts(dir:string):string[]{
  return readdirSync(join(root,dir),{withFileTypes:true}).flatMap(entry=>{
    const path=join(dir,entry.name);
    return entry.isDirectory()?scripts(path):[path];
  });
}

describe('game runtime TypeScript + Tailwind v4 migration boundaries',()=>{
  it('allows only TypeScript runtime code, with JavaScript build scripts excluded',()=>{
    const project=JSON.parse(read('tsconfig.json')) as {
      compilerOptions:{strict:boolean;allowJs:boolean}
    };
    expect(project.compilerOptions.strict).toBe(true);
    expect(project.compilerOptions.allowJs).toBe(false);
    for(const dir of ['app','src','v2/src']){
      const legacy=scripts(dir).filter(path=>['.js','.jsx','.mjs'].includes(extname(path)));
      expect(legacy,dir+' must contain only TS/TSX runtime code').toEqual([]);
    }
  });
  it('keeps Tailwind v4 as the only active global design system',()=>{
    const css=read('app/globals.css');
    expect(css).toContain('@import "tailwindcss"');
    expect(css).toContain('@theme');
    expect(css).not.toContain('.cozy-room');
    expect(css).not.toContain('.game-shell');
    expect(css.length).toBeLessThan(3000);
    const rootLayout=read('app/layout.tsx');
    expect(rootLayout).toContain("import './globals.css'");
    expect(rootLayout).not.toContain('legacy-game.css');
    expect(rootLayout).not.toContain('world.css');
    expect(rootLayout).not.toContain('gothic-workshop.css');
  });
  it('types the static WebP lobby painting without route-relative URLs',()=>{
    const lobby=read('src/components/game/gothic-lobby.tsx');
    const declaration=read('src/types/next-static-webp.d.ts');
    const polish=read('src/components/game/gothic-polish.css');
    expect(declaration).toContain("declare module '*.webp'");
    expect(lobby).toContain("import lobbyHero from '../../../public/lobby-hero.webp'");
    expect(lobby).toContain('data-testid="gothic-lobby-painting-image"');
    expect(lobby).toContain('unoptimized');
    expect(lobby).not.toContain('./lobby-hero.webp'+")");
    expect(polish).toContain('.gothic-lobby__painting{transform:none;filter:none}');
    expect(polish).not.toContain('scale(1.028)');
  });
  it('keeps the painted scene sharp and renders only independent animated lighting',()=>{
    const lobby=read('src/components/game/gothic-lobby.tsx');
    const apartment=read('src/components/game/gothic-apartment.tsx');
    const polish=read('src/components/game/gothic-polish.css');
    const lighting=read('src/components/game/gothic-scene-illumination.tsx');
    const atmosphere=read('src/components/game/gothic-atmosphere.tsx');
    expect(lobby).toContain('<GothicSceneIllumination variant="lobby"');
    expect(apartment).toContain('<GothicSceneIllumination variant="apartment"');
    expect(lighting).toContain("import {motion,useReducedMotion} from 'motion/react'");
    expect(lighting).toContain("data-motion={still?'still':'ambient'}");
    expect(polish).toContain('pointer-events:none;');
    expect(polish).toContain('.ga-backdrop{transform:none;filter:none}');
    expect(polish).not.toContain('scale(1.017)');
    expect(polish).toContain('.gothic-scene-illumination__moonshaft');
    expect(atmosphere).toContain('if(disposed||!el.isConnected)return;');
  });
  it('has one current UI, no retired game routes or standalone HTML',()=>{
    for(const route of ['classic','legacy','survival']){
      expect(()=>read('app/'+route+'/page.tsx')).toThrow();
    }
    for(const removed of ['src/styles/legacy-game.css','v2/index.html',
      'v2/src/workshop.css','src/components/game/game-screen.tsx']){
      expect(()=>read(removed)).toThrow();
    }
    expect(read('src/components/moonwork/world-ui.tsx')).toContain("import './world.css'");
    expect(read('src/components/moonwork/workshop-client.tsx')).toContain("import '@/components/game/gothic-workshop.css'");
  });
  it('keeps inventory and world-action layout in Tailwind, not stale CSS classes',()=>{
    const warehouse=read('src/components/moonwork/world-warehouse.tsx');
    const primitives=read('src/components/moonwork/world-primitives.tsx');
    const orders=read('src/components/moonwork/world-orders.tsx');
    const css=read('src/components/moonwork/world.css');
    const overrides=read('src/components/game/gothic-world.css');
    expect(warehouse).toContain('<WarehouseStockLine');
    expect(warehouse).toContain('flex items-center justify-between gap-3 border-b');
    expect(primitives).toContain('className="block text-xs text-[#c7f0b8]"');
    expect(orders).toContain('className="flex flex-wrap items-center gap-2"');
    for(const selector of ['.mw-stock','.mw-message','.mw-context-links']){
      expect(css).not.toContain(selector);
    }
    expect(overrides).not.toContain('.mw-stock');
  });
  it('styles world entry links with shared Tailwind utilities, not legacy selectors',()=>{
    const characters=read('src/components/moonwork/world-characters.tsx');
    const orders=read('src/components/moonwork/world-orders.tsx');
    const warehouse=read('src/components/moonwork/world-warehouse.tsx');
    const sceneCSS=read('src/components/moonwork/world.css');
    const overrides=read('src/components/game/gothic-world.css');
    expect(characters).toContain("className={WORLD_LINK_CLASS+' mt-auto");
    expect(orders).toContain("className={WORLD_LINK_CLASS+' shrink-0'}");
    expect(warehouse).toContain("className={WORLD_LINK_CLASS+' shrink-0'}");
    for(const selector of ['.mw-worker-action','.mw-hero-shortcut','.mw-action-button']){
      expect(sceneCSS).not.toContain(selector);
      expect(overrides).not.toContain(selector);
    }
    expect(overrides).not.toContain('.mw-tile');
    expect(overrides).not.toContain('.mw-button');
    expect(overrides).not.toContain('.mw-link');
  });
  it('renders workshop controls only in React, without a parallel HTML toolbar',()=>{
    const runtime=read('v2/src/main.ts');
    const client=read('src/components/moonwork/workshop-client.tsx');
    const controls=read('src/components/moonwork/workshop-controls.tsx');
    expect(runtime).not.toContain('innerHTML');
    expect(runtime).not.toContain("$('catalog')");
    expect(runtime).not.toContain("$('actions')");
    expect(runtime).not.toContain("$('coins')");
    expect(runtime).toContain("root.dataset.reactControls!=='true'");
    expect(client).toContain('<WorkshopControls');
    expect(controls).toContain('data-testid="v2-shift"');
    expect(controls).toContain('data-testid={\'v2-worker-\' + id}');
    expect(controls).toContain('data-testid={\'v2-build-\' + id}');
  });
  it('routes every React factory control through an explicit typed command bridge',()=>{
    const runtime=read('v2/src/main.ts');
    const bridge=read('v2/src/workshop-runtime-contract.ts');
    const client=read('src/components/moonwork/workshop-client.tsx');
    const controls=read('src/components/moonwork/workshop-controls.tsx');
    const stage=read('src/components/moonwork/workshop-stage-container.tsx');
    const patron=read('src/components/moonwork/workshop-contract-panel.tsx');
    expect(bridge).toContain('export type WorkshopAction=');
    expect(bridge).toContain('export type WorkshopRuntimeController=');
    expect(runtime).toContain('function dispatch(action:WorkshopAction)');
    expect(runtime).not.toContain('onRootClick');
    expect(runtime).not.toContain("root.addEventListener('click'");
    expect(runtime).not.toContain("origin.closest");
    expect(client).toContain('gameController.current?.dispatch(action)');
    expect(client).toContain("onAction({type:'reset'})");
    expect(controls).toContain("onAction({type:'shift'})");
    expect(controls).toContain("onAction({type:'toggle-move'})");
    expect(controls).toContain("type:'choose-worker',worker:id");
    expect(controls).toContain("type:'choose-machine',machine:id");
    expect(stage).toContain("onAction({type:'salvage'})");
    expect(stage).toContain("onAction({type:'upgrade'})");
    expect(patron).toContain("onAction({type:'accept-patron'})");
    expect(patron).toContain("onAction({type:'import-patron-core'})");
  });
  it('communicates selected plots and tools with a typed runtime callback',()=>{
    const runtime=read('v2/src/main.ts');
    const client=read('src/components/moonwork/workshop-client.tsx');
    const bridge=read('v2/src/workshop-runtime-contract.ts');
    expect(bridge).toContain('export type WorkshopSelectionSnapshot');
    expect(bridge).toContain('export type WorkshopSelectionListener');
    expect(runtime).toContain('onSelectionChange?.({');
    expect(client).toContain('mountWorkshopGame(root, base, onSelectionChange)');
    expect(client).toContain('WorkshopSelectionSnapshot');
    expect(runtime).not.toContain('moonwork:controls-change');
    expect(client).not.toContain('moonwork:controls-change');
    for(const field of ['chosenWorker','chosenMachine','movingFrom','selectedPlot']){
      expect(runtime).not.toContain('root.dataset.'+field);
      expect(client).not.toContain('root.dataset.'+field);
    }
  });
});
