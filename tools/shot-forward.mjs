/**
 * Пересылка порта из образа съёмки на машину.
 *
 * Браузер образа открывает страницу по `localhost`, а витрина отвечает на машине: каждое соединение
 * браузера открывает соединение к `host.docker.internal`. Оно изредка не открывается минуту: из 1400
 * загрузок историй одно ждало 68 секунд, а набор снимков падал. Поэтому у соединения есть предел, а
 * за ним повтор; открытое соединение предела не несёт — молчание страницы не обрыв.
 *
 * Функция уходит в образ текстом, поэтому берёт всё из доводов и ничего из модуля.
 */

/** Предел открытия соединения, миллисекунды. */
export const CONNECT_LIMIT = 3_000;

/** Сколько раз соединение открывается всего. */
export const CONNECT_TRIES = 5;

/** Пауза перед повтором, миллисекунды: отказ приходит сразу, и без неё все повторы уходят за миг. */
export const RETRY_PAUSE = 200;

/** Пересылает порт: слушает его внутри образа и отдаёт соединения машине. */
export function forwardPort(net, port, limit, tries, pause) {
    return net
        .createServer((page) => {
            let machine = null;
            page.on('error', () => page.destroy());
            page.on('close', () => machine && machine.destroy());

            const open = (left) => {
                const socket = net.connect(port, 'host.docker.internal');
                machine = socket;
                let over = false;
                const again = () => {
                    if (over) return;
                    over = true;
                    socket.destroy();
                    if (page.destroyed) return;
                    if (left <= 1) page.destroy();
                    else setTimeout(() => !page.destroyed && open(left - 1), pause);
                };
                socket.setTimeout(limit, again);
                socket.on('error', again);
                socket.once('connect', () => {
                    if (over) return;
                    over = true;
                    socket.setTimeout(0);
                    socket.on('error', () => page.destroy());
                    page.pipe(socket).pipe(page);
                });
            };
            open(tries);
        })
        .listen(port, '127.0.0.1');
}
