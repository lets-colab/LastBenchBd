import http from 'node:http';
import {createReadStream,readFileSync,statSync} from 'node:fs';
import {resolve,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(fileURLToPath(new URL('./site/',import.meta.url)));
const args=process.argv.slice(2);const port=Number(args[args.indexOf('--port')+1]||4173);
const types={'.html':'text/html; charset=utf-8','.js':'application/javascript','.mjs':'application/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.woff2':'font/woff2','.svg':'image/svg+xml','.mp4':'video/mp4'};
http.createServer((req,res)=>{
 if(req.url==='/__static'){res.writeHead(200,{'content-type':'text/html; charset=utf-8'}).end(readFileSync(resolve(root,'index.html'),'utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,''));return;}
 if(req.url.startsWith('/__mobile')){const w=Math.max(320,Math.min(600,Number(new URL(req.url,'http://preview').searchParams.get('width'))||390));res.writeHead(200,{'content-type':'text/html'}).end('<html><head><title>LastBench mobile verification</title></head><body style="margin:0;background:#333;display:grid;place-items:center;min-height:100vh"><iframe title="Mobile viewport" src="/" width="'+w+'" height="844" style="border:0"></iframe></body></html>');return;}
 if(req.url.startsWith('/app')){res.writeHead(302,{location:'https://lastbenchbd.com'+req.url}).end();return;}
 let url;try{url=decodeURIComponent(new URL(req.url,'http://preview').pathname);}catch{res.writeHead(400).end();return;}
 let file=resolve(root,'.'+url);
 if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403).end();return;}
 try{if(statSync(file).isDirectory())file=resolve(file,'index.html');statSync(file);}catch{res.writeHead(404,{'content-type':'text/plain'}).end('This destination belongs to the existing application. Open it on lastbenchbd.com.');return;}
 res.writeHead(200,{'content-type':types[extname(file)]||'application/octet-stream','cache-control':'no-store'});createReadStream(file).pipe(res);
}).listen(port,'0.0.0.0',()=>console.log('Cinematic landing preview ready on '+port));

