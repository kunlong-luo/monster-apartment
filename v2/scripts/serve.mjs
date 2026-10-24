import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,dirname,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../dist');
const port=Number(process.env.PORT||3901);
const mime={'.js':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.webp':'image/webp'};
createServer(async(req,res)=>{
  const uri=decodeURI((req.url||'/').split('?')[0]);
  const target=resolve(root,'.'+(uri==='/'?'/index.html':uri));
  if(!target.startsWith(root+sep)&&target!==root){
    res.writeHead(403);res.end('Forbidden');return;
  }
  try {
    const data=await readFile(target);
    res.writeHead(200,{'Content-Type':mime[extname(target)]||'application/octet-stream',
      'Cache-Control':'no-cache'});
    res.end(data);
  }catch {res.writeHead(404);res.end('Not found');}
}).listen(port,'127.0.0.1',()=>console.info('V2 gameplay lab at http://127.0.0.1:'+port));
