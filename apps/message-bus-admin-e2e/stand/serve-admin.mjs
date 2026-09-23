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
import { createHmac } from 'node:crypto';
import { createReadStream, existsSync, readFile, statSync } from 'node:fs';
import { createServer, request as httpRequest } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

import { ADMIN_PAGE_ORIGIN, ADMIN_PORT, API_PORT, CHAT, FOREIGN_PORT } from './stand.mjs';

const ROOT = fileURLToPath(new URL('../../..', import.meta.url));

/** Где лежит прод-сборка админки. */
const BROWSER_DIR = join(ROOT, 'dist/apps/message-bus-admin/browser');

/**
 * Виджет посетителя и страница, на которой он стоит.
 *
 * Страница отдаётся отсюда же, а не с чужого адреса: сайт чата принимает обращения только с
 * адресов своего списка, и страница, поднятая где-то ещё, получила бы отказ — то есть проверяла
 * бы не то. Ключ площадки приезжает в адресе страницы: сайтов у набора несколько, и проверяются
 * они одной страницей.
 */
const WIDGET_FILE = join(ROOT, 'dist/apps/chat-widget/widget.js');
const WIDGET_PAGE = fileURLToPath(new URL('./widget-page.html', import.meta.url));

/**
 * Встраиваемая страница переписок, её скрипт установки и админка потребителя.
 *
 * Страница отдаётся с адреса админки стенда: сайт чата принимает обращения с адресов своего
 * списка, и она стоит там же, откуда приехал скрипт. Админка потребителя — на чужом порту: ради
 * неё работа и затеяна, и для браузера это другой адрес.
 */
const TALKS_SCRIPT = join(ROOT, 'dist/apps/chat-talks-embed/talks.js');
const TALKS_DIR = join(ROOT, 'dist/apps/chat-talks-page/browser');
const TALKS_ADMIN_PAGE = fileURLToPath(new URL('./talks-admin-page.html', import.meta.url));

/** Путь, по которому у стенда лежит страница переписок. Тот же, что у скрипта установки умолчанием. */
const TALKS_PATH = '/talks/';

/** Адрес админки потребителя на чужом порту: на ней стоит встроенный раздел переписок. */
const EMBED_PAGE_PATH = '/embedded-talks';

/** Адрес точки потребителя, которая выдаёт подпись входа. */
const SIGN_PATH = '/internal/chat-sign';

/**
 * Страница чужого адреса: она поднимается своим портом, и для браузера это другой адрес.
 *
 * Так проверяется то, ради чего работа затеяна: страница потребителя стоит не там, где сервис, и
 * без позволения браузер её обращений к нему не доносит. Адрес сервиса подставляется при отдаче —
 * порт стенда задаётся окружением, и записанный в файл он разошёлся бы с ним молча.
 */
const FOREIGN_PAGE = fileURLToPath(new URL('./foreign-page.html', import.meta.url));

/**
 * Приложение площадки на стенде: сюда приёмник шлёт вызовы наружу, и отсюда их читает набор.
 *
 * Своё, а не чужой узел: набор проверяет, о чём говорит сервис, а не сеть между машинами. Вызовы
 * копятся списком, и прогон читает его тем же адресом обычным чтением.
 */
const HOOK_CALLS = [];

/** Заголовок, которым едет подпись вызова. Тот же, что называет слой утилит чата. */
const SIGNATURE_HEADER = 'x-rt-chat-signature';

/** Принять вызов наружу: тело и подпись кладутся списком, отвечается принятием. */
function takeHookCall(request, response) {
    let body = '';

    request.on('data', (chunk) => {
        body += chunk;
    });
    request.on('end', () => {
        HOOK_CALLS.push({ body, signature: request.headers[SIGNATURE_HEADER] ?? '' });
        response.writeHead(204).end();
    });
}

/** Отдать то, что приложению площадки уже сказали. */
function sendHookCalls(response) {
    response.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
    response.end(JSON.stringify(HOOK_CALLS));
}

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

/** Файл страницы переписок по адресу запроса; пусто — такого файла нет, и адрес ведёт в страницу. */
function talksFileOf(url) {
    const tail = normalize(decodeURIComponent(new URL(url, 'http://localhost').pathname.slice(TALKS_PATH.length)));
    const path = join(TALKS_DIR, tail);

    if (!path.startsWith(TALKS_DIR) || !existsSync(path) || !statSync(path).isFile()) {
        return '';
    }

    return path;
}

/**
 * Подпись входа: её считает сервер потребителя своей тайной площадки.
 *
 * Здесь она считается тем же приёмом, каким её ждёт сервис: ключ площадки и минута, склеенные
 * точкой. Тайна лежит на этой стороне и в страницу не попадает — образец ровно об этом.
 */
function sendSignature(response) {
    const at = Date.now();
    const signature = createHmac('sha256', CHAT.embed.secret).update(`${CHAT.embed.key}.${at}`).digest('hex');

    response.writeHead(200, { 'content-type': MEDIA['.json'] });
    response.end(JSON.stringify({ at, signature }));
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
    const url = request.url ?? '/';

    if (url.startsWith('/api')) {
        proxy(request, response);

        return;
    }

    if (url.startsWith(CHAT.hook.path)) {
        if (request.method === 'POST') {
            takeHookCall(request, response);
        } else {
            sendHookCalls(response);
        }

        return;
    }

    if (url === '/widget.js') {
        sendFile(response, WIDGET_FILE);

        return;
    }

    if (url.startsWith('/widget-page')) {
        sendFile(response, WIDGET_PAGE);

        return;
    }

    if (url === '/talks.js') {
        sendFile(response, TALKS_SCRIPT);

        return;
    }

    if (url.startsWith(TALKS_PATH)) {
        sendFile(response, talksFileOf(url) || join(TALKS_DIR, 'index.html'));

        return;
    }

    const file = fileOf(url);

    sendFile(response, file || join(BROWSER_DIR, 'index.html'));
}).listen(ADMIN_PORT, () => {
    process.stdout.write(`админка стенда поднята: порт ${ADMIN_PORT}\n`);
});

/**
 * Страница чужого адреса: свой сервер, свой порт и ничего, кроме одной страницы.
 *
 * Скрипт виджета она берёт у админки стенда, а не отсюда: виджет считает адресом сервиса тот, с
 * которого приехал сам скрипт, — и обращения уйдут на тот адрес, на который они и должны уйти.
 */
createServer((request, response) => {
    const path = (request.url ?? '/').split('?')[0];

    // Точка выдачи подписи: она стоит на стороне потребителя, и тайна площадки лежит здесь же.
    if (path === SIGN_PATH) {
        sendSignature(response);

        return;
    }

    // Кроме двух страниц, по этому адресу нет ничего: обращение виджета, ушедшее сюда вместо
    // сервиса, иначе получило бы страницу вместо ответа и выглядело бы не отказом, а пустотой.
    if (path !== '/' && path !== EMBED_PAGE_PATH) {
        response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
        response.end('на этом адресе стоят две страницы');

        return;
    }

    readFile(path === EMBED_PAGE_PATH ? TALKS_ADMIN_PAGE : FOREIGN_PAGE, 'utf8', (fault, page) => {
        if (fault) {
            response.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' });
            response.end('страницы чужого адреса нет на месте');

            return;
        }

        response.writeHead(200, { 'content-type': MEDIA['.html'] });
        response.end(page.replaceAll('__SERVICE__', ADMIN_PAGE_ORIGIN));
    });
}).listen(FOREIGN_PORT, () => {
    process.stdout.write(`страница чужого адреса поднята: порт ${FOREIGN_PORT}\n`);
});
