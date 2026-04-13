/**
 * Serve a pasta dist/ com Content-Type correto (evita MIME vazio no Caddy estático).
 * Uso no EasyPanel: após `npm run build`, comando de start = `npm start` ou `node scripts/serve-dist.mjs`
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..', 'dist');
const port = Number(process.env.PORT || 3000, 10);
const host = process.env.HOST || '0.0.0.0';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
};

function safePath(base, pathname) {
  const decoded = decodeURIComponent(pathname.split('?')[0]);
  const joined = path.normalize(path.join(base, decoded));
  if (!joined.startsWith(base)) return null;
  return joined;
}

function sendFile(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Not found');
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

function sendSpa(res) {
  const indexPath = path.join(root, 'index.html');
  fs.readFile(indexPath, (err, html) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('dist/index.html missing');
    }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
  });
}

const indexHtml = path.join(root, 'index.html');
if (!fs.existsSync(indexHtml)) {
  console.error('[serve-dist] ERRO: dist/index.html não existe.');
  console.error('[serve-dist] Rode antes: npm run build');
  process.exit(1);
}

http
  .createServer((req, res) => {
    let pathname;
    try {
      pathname = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`).pathname;
    } catch {
      res.writeHead(400);
      return res.end();
    }

    if (pathname === '/') {
      return sendSpa(res);
    }

    const filePath = safePath(root, pathname.slice(1));
    if (!filePath) {
      res.writeHead(400);
      return res.end('Bad path');
    }

    fs.stat(filePath, (err, st) => {
      if (!err && st.isFile()) {
        return sendFile(res, filePath);
      }
      return sendSpa(res);
    });
  })
  .listen(port, host, () => {
    console.log(`[serve-dist] http://${host}:${port} → ${root}`);
  });
