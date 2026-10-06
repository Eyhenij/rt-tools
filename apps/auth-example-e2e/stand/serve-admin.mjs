/**
 * The server of the example admin on the stand: the production build and `/api` sent on to the
 * example server.
 *
 * The dev server builds the application differently from what a person gets, so the stand serves
 * the production build itself. The admin and the server meet on one address, as behind the proxy of
 * a real admin: the token goes only to `/api` of the page's own address.
 *
 * Every path that is not a file of the build is answered by the page of the application: a route
 * is opened by a direct link, and Keycloak returns the person to such a link.
 */
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer, request as httpRequest } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

import { ADMIN_PORT, API_PORT } from './stand.mjs';

const BROWSER_DIR = fileURLToPath(new URL('../../../dist/apps/auth-example-admin/browser', import.meta.url));

const TYPES = Object.freeze({
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.json': 'application/json',
    '.woff2': 'font/woff2',
});

function sendFile(response, path) {
    response.writeHead(200, { 'content-type': TYPES[extname(path)] ?? 'application/octet-stream' });
    createReadStream(path).pipe(response);
}

function proxyApi(request, response) {
    const upstream = httpRequest(
        { host: 'localhost', port: API_PORT, path: request.url, method: request.method, headers: request.headers },
        (answer) => {
            response.writeHead(answer.statusCode ?? 502, answer.headers);
            answer.pipe(response);
        }
    );
    upstream.on('error', () => {
        response.writeHead(502);
        response.end();
    });
    request.pipe(upstream);
}

createServer((request, response) => {
    const path = new URL(request.url ?? '/', 'http://stand').pathname;
    if (path.startsWith('/api/')) {
        proxyApi(request, response);
        return;
    }
    const file = join(BROWSER_DIR, normalize(path).replace(/^(\.\.[/\\])+/, ''));
    if (file.startsWith(BROWSER_DIR) && existsSync(file) && statSync(file).isFile()) {
        sendFile(response, file);
        return;
    }
    sendFile(response, join(BROWSER_DIR, 'index.html'));
}).listen(ADMIN_PORT);
