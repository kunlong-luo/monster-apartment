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
});
