import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import ts from 'typescript';

const source = /\.(?:[cm]?[jt]s|[jt]sx)$/;
const supported = /\.(?:[cm]?[jt]s|[jt]sx|css)$/;
const ignored = new Set(['node_modules','.next','out','dist','coverage','test-results','playwright-report','.git']);
const slash = value => value.split(path.sep).join('/');
const isRelative = specifier => specifier.startsWith('.') || specifier.startsWith('@/');

function walk(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory,{withFileTypes:true}).flatMap(entry => {
    const file = path.join(directory,entry.name);
    if (entry.isDirectory()) return ignored.has(entry.name) ? [] : walk(file);
    return entry.isFile() && supported.test(entry.name) ? [file] : [];
  });
}

function moduleReferences(file, content) {
  const ast = ts.createSourceFile(file,content,ts.ScriptTarget.Latest,true);
  const imports = [];
  const unknown = [];
  const add = (node,kind) => {
    if (node && ts.isStringLiteralLike(node)) imports.push({specifier:node.text,kind});
    else unknown.push({kind,line:ast.getLineAndCharacterOfPosition(node?.getStart(ast) ?? 0).line+1});
  };
  function visit(node) {
    if ((ts.isImportDeclaration(node)||ts.isExportDeclaration(node)) && node.moduleSpecifier) {
      add(node.moduleSpecifier, node.isTypeOnly||node.importClause?.isTypeOnly ? 'type' : 'static');
    } else if(ts.isImportEqualsDeclaration(node)&&ts.isExternalModuleReference(node.moduleReference)){
      add(node.moduleReference.expression,'require');
    } else if(ts.isImportTypeNode(node)&&ts.isLiteralTypeNode(node.argument)){
      add(node.argument.literal,'type');
    } else if(ts.isCallExpression(node)){
      const expr=node.expression;
      if(expr.kind===ts.SyntaxKind.ImportKeyword) add(node.arguments[0],'dynamic');
      else if(ts.isIdentifier(expr)&&expr.text==='require') add(node.arguments[0],'require');
      else if(ts.isPropertyAccessExpression(expr)&&ts.isIdentifier(expr.expression)&&expr.expression.text==='require'&&expr.name.text==='resolve') add(node.arguments[0],'require-resolve');
      else if(ts.isPropertyAccessExpression(expr)&&expr.name.text==='glob') unknown.push({kind:'possible glob',line:ast.getLineAndCharacterOfPosition(node.getStart(ast)).line+1});
    }
    ts.forEachChild(node,visit);
  }
  visit(ast);
  for(const item of ast.referencedFiles) imports.push({specifier:item.fileName,kind:'reference'});
  return {imports,unknown};
}

export function auditComponentUsage(root) {
  const config=ts.readConfigFile(path.join(root,'tsconfig.json'),ts.sys.readFile);
  if(config.error) throw new Error(ts.flattenDiagnosticMessageText(config.error.messageText,'\n'));
  const options=ts.parseJsonConfigFileContent(config.config,ts.sys,root).options;
  const names=['app','src','tests','e2e','scripts','engine/src','engine/scripts'];
  const files=[...new Set(names.flatMap(name=>walk(path.join(root,name))))].sort();
  const toRel=file=>slash(path.relative(root,file));
  const indexed=new Set(files.map(file=>path.resolve(file)));
  const edges=new Map(files.map(file=>[file,new Set()]));
  const unresolved=[];
  const unknown=[];
  const literalRefs=new Map();
  const incoming=new Map(files.map(file=>[file,new Set()]));
  function resolve(specifier,from){
    if(specifier.endsWith('.css')){
      const candidate=specifier.startsWith('@/')?path.resolve(root,'src',specifier.slice(2)):path.resolve(path.dirname(from),specifier);
      if(indexed.has(candidate))return candidate;
    }
    const resolved=ts.resolveModuleName(specifier,from,options,ts.sys).resolvedModule?.resolvedFileName;
    return resolved&&indexed.has(path.resolve(resolved))?path.resolve(resolved):null;
  }
  for(const file of files){
    const content=fs.readFileSync(file,'utf8');
    // Separate literal file-path dependencies (e.g. readFileSync in tests)
    // from module imports. These are review evidence, not app reachability.
    for(const match of content.matchAll(/src\/components\/[\w./-]+\.(?:tsx?|css)\b/g)){
      const target=path.resolve(root,match[0]);
      if(target===file)continue;
      if(!literalRefs.has(target))literalRefs.set(target,new Set());
      literalRefs.get(target).add(toRel(file));
    }
    const parsed=source.test(file)?moduleReferences(file,content):{
      imports:[...content.matchAll(/@import\s+(?:url\(\s*)?["']([^"']+)["']/g)].map(m=>({specifier:m[1],kind:'css'})),
      unknown:[]
    };
    for(const item of parsed.unknown)unknown.push({file:toRel(file),...item});
    for(const item of parsed.imports){
      const target=resolve(item.specifier,file);
      if(target){edges.get(file).add(target);incoming.get(target).add(file);}
      else if(isRelative(item.specifier)&&(!path.extname(item.specifier)||supported.test(item.specifier)))unresolved.push({file:toRel(file),...item});
    }
  }
  function reachable(roots){
    const found=new Set(), pending=[...roots];
    while(pending.length){
      const file=pending.pop();
      if(found.has(file))continue;
      found.add(file);
      for(const target of edges.get(file)??[])pending.push(target);
    }
    return found;
  }
  // Conservative: all app modules are roots, including framework conventions and research.
  const appRoots=files.filter(file=>toRel(file).startsWith('app/'));
  const auxiliaryRoots=files.filter(file=>/^(tests|e2e|scripts|engine)\//.test(toRel(file)));
  const appReach=reachable(appRoots);
  const auxReach=reachable(auxiliaryRoots);
  const candidates=files.filter(file=>toRel(file).startsWith('src/components/')&&!file.endsWith('.d.ts'));
  const components=candidates.map(file=>({
    path:toRel(file),
    status:appReach.has(file)?'app-reachable':auxReach.has(file)?'auxiliary-only':'review-unreachable',
    incoming:[...incoming.get(file)].map(toRel).sort(),
    literalReferences:[...(literalRefs.get(file)??[])].sort()
  }));
  const missingLiteralPaths=[...literalRefs].filter(([file])=>!indexed.has(file)).map(([file,refs])=>({path:toRel(file),references:[...refs].sort()}));
  return {scannedFiles:files.length,appRoots:appRoots.map(toRel),components,unresolved,unknown,missingLiteralPaths};
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
  const result=auditComponentUsage(root);
  if(process.argv.includes('--json')) console.log(JSON.stringify(result,null,2));
  else {
    console.log('Component import audit (advisory, never auto-delete)');
    console.log('Scanned files:',result.scannedFiles,'app roots:',result.appRoots.length,'components and styles:',result.components.length);
    for(const status of ['app-reachable','auxiliary-only','review-unreachable']){
      const rows=result.components.filter(row=>row.status===status);
      console.log(status+': '+rows.length);
      if(status!=='app-reachable')for(const row of rows)console.log('  '+row.path+' <- '+(row.incoming.join(', ')||'(no indexed incoming edge)')+'; literal file references: '+(row.literalReferences.join(', ')||'none'));
    }
    console.log('Unresolved local references:',result.unresolved.length,'nonliteral imports / possible globs:',result.unknown.length);
    for(const item of result.missingLiteralPaths)console.log('  missing literal path (review, including deliberate absence tests)',item.path,item.references.join(', '));
    for(const item of result.unresolved)console.log('  unresolved',item.file,item.specifier);
    for(const item of result.unknown)console.log('  dynamic',item.file+':'+item.line,item.kind);
  }
}
