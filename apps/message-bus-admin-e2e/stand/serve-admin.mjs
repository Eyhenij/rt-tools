/**
 * Раздача админки стенда: прод-сборка и проксирование `/api` приёмнику.
 *
 * Дев-сервер сюда не годится: он собирает приложение иначе, чем то, что увидит человек, и
 * проверять на нём — значит проверять не ту сборку. Своя раздача нужна потому, что прод-сборку
 * админки и приёмник надо свести на один адрес: браузер шлёт вход кукой своего адреса, и
 * запросы, ушедшие на другой порт, приезжают к приёмнику без входа.
 *
 * Всё, кроме файлов сборки и `/api`, отдаётся страницей приложения: адрес раздела открывается
 * прямой ссылкой, и раздача, ответившая на него отказом, показала бы приёмник неповинным в
 * поломке, которой нет.
 */
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer, request as httpRequest } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

import { ADMIN_PORT, API_PORT } from './stand.mjs';

const ROOT = fileURLToPath(new URL('../../..', import.meta.url));

/** Где лежит прод-сборка админки. */
const BROWSER_DIR = join(ROOT, 'dist/apps/message-bus-admin/browser');

/** Чем назваться в заголовке ответа: браузер не показывает шрифты и стили без верного рода. */
const MEDIA = Object.freeze({
    '.css': 'text/css; charset=utf-8',
    '.html': 'text/html; charset=utf-8',
    '.ico': 'image/x-icon',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.woff2': 'font/woff2',
});

/** Файл сборки по адресу запроса; пусто — такого файла нет, и адрес ведёт в приложение. */
function fileOf(url) {
    const path = join(BROWSER_DIR, normalize(decodeURIComponent(new URL(url, 'http://localhost').pathname)));

    if (!path.startsWith(BROWSER_DIR) || !existsSync(path) || !statSync(path).isFile()) {
        return '';
    }

    return path;
}

/** Отдача файла с объявленным родом. */
function sendFile(response, path) {
    response.writeHead(200, { 'content-type': MEDIA[extname(path)] ?? 'application/octet-stream' });
    createReadStream(path).pipe(response);
}

/**
 * Проброс запроса приёмнику.
 *
 * Заголовки идут как пришли — вместе с кукой входа: она и есть то, чем браузер представляется
 * приёмнику, и потерянная по дороге, она превратила бы каждый ответ в отказ без входа.
 */
function proxy(request, response) {
    const outgoing = httpRequest(
        {
            host: 'localhost',
            port: API_PORT,
            path: request.url,
            method: request.method,
            headers: { ...request.headers, host: `localhost:${API_PORT}` },
        },
        (answer) => {
            response.writeHead(answer.statusCode ?? 502, answer.headers);
            answer.pipe(response);
        }
    );

    outgoing.on('error', () => {
        response.writeHead(502, { 'content-type': 'text/plain; charset=utf-8' });
        response.end('приёмник стенда не отвечает');
    });

    request.pipe(outgoing);
}

createServer((request, response) => {
    if ((request.url ?? '').startsWith('/api')) {
        proxy(request, response);

        return;
    }

    const file = fileOf(request.url ?? '/');

    sendFile(response, file || join(BROWSER_DIR, 'index.html'));
}).listen(ADMIN_PORT, () => {
    process.stdout.write(`админка стенда поднята: порт ${ADMIN_PORT}\n`);
});
