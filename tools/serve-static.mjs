#!/usr/bin/env node
/**
 * Раздача собранной витрины файлами.
 *
 * Отдельным процессом, а не внутри проверки кадров: та ждёт съёмку синхронно, и раздача в том же
 * процессе не отвечала бы всё время съёмки — соединение открыто, ответа нет. Найдено измерением:
 * браузер стоял на первом же запросе, пока проверка ждала его самого.
 *
 * Своего сервера разработки у съёмки нет намеренно. Он держит со страницей живую связь и из
 * образа гонял её по кругу перезагрузок — сорок пять за двенадцать секунд; внедрённый прогонщиком
 * сценарий не переживал ни одну, и ни одна история не доходила до кадра. У сборки такой связи нет,
 * и человеку показывают её же.
 *
 *   node tools/serve-static.mjs <каталог> <порт>
 */
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';

/** Чем назван файл по его расширению. Витрина просит эти и не просит других. */
const FILE_KINDS = {
    '.css': 'text/css',
    '.html': 'text/html; charset=utf-8',
    '.ico': 'image/x-icon',
    '.jpg': 'image/jpeg',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.map': 'application/json',
    '.mjs': 'text/javascript',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.ttf': 'font/ttf',
    '.txt': 'text/plain; charset=utf-8',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
};

const [directory, port] = process.argv.slice(2);

if (!directory || !port) {
    process.stderr.write('serve-static: нужны каталог и порт\n');
    process.exit(1);
}

const ROOT = resolve(directory);

createServer((request, response) => {
    const asked = new URL(request.url ?? '/', 'http://localhost').pathname;
    const path = resolve(join(ROOT, normalize(decodeURIComponent(asked))));
    const file = existsSync(path) && statSync(path).isDirectory() ? join(path, 'index.html') : path;

    if (!path.startsWith(ROOT) || !existsSync(file)) {
        response.writeHead(404).end();

        return;
    }

    response.writeHead(200, { 'content-type': FILE_KINDS[extname(file)] ?? 'application/octet-stream' });
    createReadStream(file).pipe(response);
    /*
     * Слушается всё, а не только петля: браузер съёмки живёт в образе, и петля там своя. Машину
     * он зовёт её сетевым именем, и на петле она ему не отвечает вовсе.
     */
}).listen(Number(port), '0.0.0.0', () => process.stdout.write(`раздача ${ROOT} на порту ${port}\n`));
