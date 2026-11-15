import http from 'node:http';
import {readFile} from 'node:fs/promises';
const allowed = {'/':'index.html','/index.html':'index.html','/app.js':'app.js','/model.mjs':'model.mjs','/style.css':'style.css'};
const types={html:'text/html; charset=utf-8',js:'text/javascript; charset=utf-8',mjs:'text/javascript; charset=utf-8',css:'text/css; charset=utf-8'};
const server=http.createServer(async(req,res)=>{
  const file=allowed[new URL(req.url,'http://localhost').pathname];
  if(!file){res.writeHead(404);res.end('Not found');return;}
  try{const body=await readFile(new URL(file,import.meta.url));res.writeHead(200,{'Content-Type':types[file.split('.').pop()],'X-Content-Type-Options':'nosniff'});res.end(body);}
  catch{res.writeHead(500);res.end('Unable to read app file');}
});
server.listen(Number(process.env.PORT)||4173,'127.0.0.1',()=>console.log(`Ghostboard: http://127.0.0.1:${server.address().port}`));
