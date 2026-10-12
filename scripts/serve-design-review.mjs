import {createServer} from 'node:http';
import {readFileSync} from 'node:fs';
createServer((req,res)=>{if(req.url!=='/'&&!req.url.startsWith('/?')){res.writeHead(404);res.end('Not found');return;}const html=readFileSync(new URL('../design-review/index.html',import.meta.url));res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});res.end(html);}).listen(4173,'127.0.0.1',()=>console.log('Design review: http://127.0.0.1:4173'));
