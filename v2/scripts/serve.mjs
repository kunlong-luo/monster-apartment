import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,dirname,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../dist');
const port=Number(process.env.V2_PORT||3901);
const mime={'.js':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.webp':'image/webp','.avif':'image/avif','.woff2':'font/woff2'};
createServer(async(req,res)=>{
  const uri=decodeURI((req.url||'/').split('?')[0]);
  // Asset server only. The latest Next.js workshop owns the UI.
  if(uri==='/'){res.writeHead(200,{'Content-Type':'text/plain; charset=utf-8'});
    res.end('Pixi assets ready');return;}
  const target=resolve(root,'.'+uri);
  if(!target.startsWith(root+sep)&&target!==root){
    res.writeHead(403);res.end('Forbidden');return;
  }
  try {
    const data=await readFile(target);
    res.writeHead(200,{'Content-Type':mime[extname(target)]||'application/octet-stream',
      'Cache-Control':'no-cache','Access-Control-Allow-Origin':'*'});
    res.end(data);
  }catch {res.writeHead(404);res.end('Not found');}
}).listen(port,'127.0.0.1',()=>console.info('Pixi assets at http://127.0.0.1:'+port));
