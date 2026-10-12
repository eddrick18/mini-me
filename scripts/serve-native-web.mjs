import http from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve('dist');
const host=process.env.MINI_ME_PREVIEW_HOST??'127.0.0.1';
const port=Number(process.env.MINI_ME_PREVIEW_PORT??4180);
const mime={'.html':'text/html','.js':'text/javascript','.json':'application/json','.png':'image/png','.css':'text/css','.ico':'image/x-icon','.wav':'audio/wav'};
http.createServer(async(req,res)=>{try{const requested=decodeURIComponent(new URL(req.url,'http://localhost').pathname);let file=path.resolve(root,'.'+requested);if(!file.startsWith(root+path.sep)&&file!==root){res.writeHead(403);res.end();return;}if(requested==='/'||requested.endsWith('/'))file=path.join(file,'index.html');res.setHeader('Content-Type',mime[path.extname(file)]??'application/octet-stream');res.setHeader('Cache-Control','no-store');res.end(await readFile(file));}catch{res.writeHead(404);res.end('Not found');}}).listen(port,host,()=>console.log(`Mini Me browser preview: http://${host}:${port}`));
