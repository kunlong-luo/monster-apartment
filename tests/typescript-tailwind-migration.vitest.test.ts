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
    expect(css.length).toBeLessThan(5000);
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
    expect(lobby).toContain("import lobbyHero from '../../../public/art/lobby-hero-v3.webp'");
    expect(lobby).toContain('data-testid="gothic-lobby-painting-image"');
    expect(lobby).toContain('unoptimized');
    expect(lobby).not.toContain('./lobby-hero.webp'+")");
    expect(polish).toContain('.gothic-lobby__painting{transform:none;filter:none}');
    expect(polish).not.toContain('scale(1.028)');
  });
  it('ships real lossily-compressed WebP paintings at usable resolutions',()=>{
    const scenes=[
      {file:'public/art/lobby-hero-v3.webp',minWidth:1550,minHeight:980,minBytes:300000},
      {file:'public/art/yuesha-portrait-v3.webp',minWidth:680,minHeight:800,minBytes:140000},
      {file:'public/art/yuesha-bust-v3.webp',minWidth:900,minHeight:880,minBytes:200000},
      {file:'public/art/yuesha-avatar-v3.webp',minWidth:490,minHeight:490,minBytes:70000},
    ];
    for(const art of scenes){
      const data=readFileSync(join(root,art.file));
      expect(data.toString('ascii',0,4),art.file).toBe('RIFF');
      expect(data.toString('ascii',8,12),art.file).toBe('WEBP');
      expect(data.toString('ascii',12,16),art.file).toBe('VP8 ');
      const start=data.indexOf(Buffer.from([0x9d,0x01,0x2a]),20);
      expect(start,art.file).toBeGreaterThanOrEqual(0);
      const width=data.readUInt16LE(start+3)&0x3fff;
      const height=data.readUInt16LE(start+5)&0x3fff;
      expect(width,art.file).toBeGreaterThanOrEqual(art.minWidth);
      expect(height,art.file).toBeGreaterThanOrEqual(art.minHeight);
      expect(data.byteLength,art.file).toBeGreaterThan(art.minBytes);
    }
    const lobby=read('src/components/game/gothic-lobby.tsx');
    const apartment=read('src/components/game/gothic-apartment.tsx');
    const world=read('src/components/moonwork/world-ui.tsx');
    const workshop=read('src/components/moonwork/workshop-client.tsx');
    expect(lobby).toContain('yuesha-avatar-v3.webp');
    expect(apartment).toContain('yuesha-bust-v3.webp');
    expect(world).toContain('lobby-hero-v3.webp');
    expect(workshop).not.toContain('url(../lobby-hero.webp)');
    expect(workshop).toContain('moonveilPortrait.src');
    const stage=read('v2/src/workshop-lab-stage.ts');
    const loader=read('v2/src/workshop-painted-art.ts');
    expect(loader).toContain("loadPaintedTexture(assetBase,'yuesha-avatar-v3.webp')");
    expect(loader).toContain("new URL('./assets/'+filename,assetBase)");
    expect(loader).toContain("url.searchParams.set('retry',String(attempt))");
    expect(stage).toContain("'painted-medallion'");
    expect(stage).toContain('portrait.mask=mask');
  });
  it('keeps the painted scene sharp and renders only independent animated lighting',()=>{
    const lobby=read('src/components/game/gothic-lobby.tsx');
    const apartment=read('src/components/game/gothic-apartment.tsx');
    const polish=read('src/components/game/gothic-polish.css');
    const lighting=read('src/components/game/gothic-scene-illumination.tsx');
    const atmosphere=read('src/components/game/gothic-atmosphere.tsx');
    expect(lobby).toContain('<GothicSceneIllumination variant="lobby"');
    expect(apartment).toContain('<GothicSceneIllumination variant="apartment"');
    expect(lighting).toContain("import {motion} from 'motion/react'");
    expect(lighting).toContain('useSyncExternalStore(');
    expect(lighting).toContain("media.addEventListener('change',callback)");
    expect(lighting).toContain("data-motion={still?'still':'ambient'}");
    expect(polish).toContain('pointer-events:none;');
    expect(polish).toContain('.ga-backdrop{transform:none;filter:none}');
    expect(polish).not.toContain('scale(1.017)');
    expect(polish).toContain('.gothic-scene-illumination__moonshaft');
    expect(atmosphere).toContain('if(disposed||!el.isConnected)return;');
  });
  it('uses cancelled-navigation-safe events and no duplicate menu links',()=>{
    const transition=read('src/components/game/gothic-route-transition.tsx');
    const lobby=read('src/components/game/gothic-lobby.tsx');
    expect(transition).toContain("document.addEventListener('click',clicked);");
    expect(transition).not.toContain("document.addEventListener('click',clicked,true)");
    expect(transition).not.toContain("addEventListener('popstate',depart)");
    expect(lobby).toContain('data-testid="gothic-main-quest-progress"');
    expect(lobby).toContain('aria-valuenow={Math.min(orderStock,orderTarget)}');
    expect(lobby).not.toContain("label:'委托大厅',description:'契约与交付'");
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
    // Commission room keeps only actionable destinations, not a second
    // global-navigation copy of "返回工坊".
    expect(orders).toContain('<WorkshopLink>前往工坊调整产线</WorkshopLink>');
    expect(orders).toContain('className={WORLD_LINK_CLASS} href="/warehouse/"');
    expect(orders).not.toContain('>返回工坊 ↗</Link>');
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
  it('reuses Pixi ground tiles and pauses worker animation with game motion setting',()=>{
    const scene=read('v2/src/workshop-lab-stage.ts');
    const loader=read('v2/src/workshop-painted-art.ts');
    const builder=read('v2/scripts/build.mjs');
    expect(scene).toContain('const floorTiles:Sprite[]=[];');
    expect(scene).toContain("element.dataset.foundationTiles=String(floorTiles.length)");
    expect(scene).toContain('const tile=floorTiles[i];');
    expect(scene).toContain("element.dataset.motionState=allowed?'running':'paused'");
    expect(scene).toContain("document.addEventListener('visibilitychange',updateMotion)");
    expect(scene).toContain("document.removeEventListener('visibilitychange',updateMotion)");
    expect(scene).toContain("window.addEventListener(motionEvent,updateMotion)");
    expect(scene).toContain("window.removeEventListener(motionEvent,updateMotion)");
    // Scene art must not silently regress to the lobby image on the workshop.
    // The existing lobby painting remains only a cold-load fallback.
    expect(loader).toContain("loadPaintedTexture(assetBase,'workshop-gothic-hall.webp')");
    expect(loader).toContain("backdropSource='world-hall-2k'");
    expect(loader).toContain("loadPaintedTexture(assetBase,'lobby-hero-v3.webp',1)");
    expect(loader).toContain("new URL('./assets/'+filename,assetBase)");
    expect(builder).toContain("'../public/art/world-scenes/workshop-gothic-hall.webp'");
    expect(builder).toContain("'../public/art/lobby-hero-v3.webp'");
  });
  it('communicates selected plots and tools with a typed runtime callback',()=>{
    const runtime=read('v2/src/main.ts');
    const client=read('src/components/moonwork/workshop-client.tsx');
    const bridge=read('v2/src/workshop-runtime-contract.ts');
    expect(bridge).toContain('export type WorkshopSelectionSnapshot');
    expect(bridge).toContain('export type WorkshopSelectionListener');
    expect(runtime).toContain('onSelectionChange?.({');
    expect(client).toContain('mountWorkshopGame(root, base, onSelectionChange)');
    // Selection now lives in a typed Zustand state module instead of a
    // duplicated React component-local snapshot.
    const state=read('src/lib/moonwork/world-state.ts');
    expect(state).toContain('WorkshopSelectionSnapshot');
    expect(client).toContain('useMoonworkState(state=>state.selection)');
    expect(runtime).not.toContain('moonwork:controls-change');
    expect(client).not.toContain('moonwork:controls-change');
    for(const field of ['chosenWorker','chosenMachine','movingFrom','selectedPlot']){
      expect(runtime).not.toContain('root.dataset.'+field);
      expect(client).not.toContain('root.dataset.'+field);
    }
  });
});
