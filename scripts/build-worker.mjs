// Builds the single-file bundle and wraps it in a Cloudflare Worker module.
// Output: dist-worker/worker.js (serves the app at every path; the app uses hash routing).
import { execSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

execSync('npx vite build', { stdio: 'inherit', env: { ...process.env, SINGLE_FILE: '1' } });
const html = readFileSync('dist-single/index.html', 'utf8');
mkdirSync('dist-worker', { recursive: true });
const worker = `const HTML = ${JSON.stringify(html)};
const HEADERS = {
  'content-type': 'text/html; charset=utf-8',
  'cache-control': 'public, max-age=300',
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'strict-origin-when-cross-origin',
};
export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === '/robots.txt') return new Response('User-agent: *\\nAllow: /\\n', { headers: { 'content-type': 'text/plain' } });
    return new Response(request.method === 'HEAD' ? null : HTML, { headers: HEADERS });
  },
};
`;
writeFileSync('dist-worker/worker.js', worker);
console.log(`dist-worker/worker.js ${(worker.length / 1024).toFixed(0)} KiB`);
