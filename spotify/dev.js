// Local dev server: `npm run dev` then open http://localhost:3000/track/<id>
// Mirrors what Vercel does (static /public first, everything else -> api/index.js).
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { Readable } from 'node:stream';
import { GET, HEAD } from './api/index.js';

const PORT = Number(process.env.PORT) || 3000;
const PUBLIC = path.join(import.meta.dirname, 'public');

http
  .createServer(async (req, res) => {
    console.log(req.method, req.url);
    try {
      const pathname = new URL(req.url, `http://localhost:${PORT}`).pathname;
      if (pathname === '/' || pathname === '/index.html') {
        res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
        res.end(await readFile(path.join(PUBLIC, 'index.html')));
        return;
      }
      const request = new Request(`http://localhost:${PORT}${req.url}`, {
        method: req.method,
        headers: req.headers,
      });
      const out = await (req.method === 'HEAD' ? HEAD(request) : GET(request));
      res.writeHead(out.status, Object.fromEntries(out.headers));
      if (out.body) Readable.fromWeb(out.body).pipe(res);
      else res.end();
    } catch (err) {
      console.error(err);
      res.writeHead(500);
      res.end(String(err));
    }
  })
  .listen(PORT, () => console.log(`open.fishpog.lol dev -> http://localhost:${PORT}`));
