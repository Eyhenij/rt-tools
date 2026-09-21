/**
 * Откуда сайту позволено звать операции чата.
 *
 * Ключ сайта лежит в странице открыто, и одного его мало: списанный на чужую страницу, он писал
 * бы в чужую переписку. Адрес страницы приезжает заголовком `Origin`, и сверяется он со списком
 * сайта.
 *
 * Пустой список отказывает всему: сайт, у которого он не заполнен, ещё никуда не поставлен, а
 * «пусто значит любой» открыло бы его всей сети в минуту заведения.
 *
 * Решение отделено от запроса: считает чистая функция, а откуда взялись список и адрес — дело
 * того, кто её зовёт.
 */

/**
 * Адрес без хвостового слэша и в нижнем регистре.
 *
 * Браузер шлёт `Origin` без пути, но регистр имени узла он сохраняет как в ссылке, а список
 * сайта заполняет человек — и пишет в нём то со слэшем, то без. Обе стороны приводятся к одному
 * виду здесь: сравнение сырых строк отказывало бы по разнице, которой для сети не существует.
 */
function normalized(address: string): string {
    const trimmed: string = address.trim().toLowerCase();
    let end: number = trimmed.length;

    while (end > 0 && trimmed[end - 1] === '/') {
        end -= 1;
    }

    return trimmed.slice(0, end);
}

/**
 * Адрес страницы по двум заголовкам запроса.
 *
 * `Origin` браузер шлёт не всегда: на чтение со своего же адреса он его опускает вовсе — а
 * потребитель вправе держать сервис на том же адресе, что и страницу. Тогда адрес берётся из
 * `Referer`, у которого отрезается путь: список сайта хранит адреса, а не страницы.
 *
 * Ни тот, ни другой заголовок тайной не являются и подделываются кем угодно вне браузера —
 * список адресов говорит, куда сайт поставлен, а не запирает дверь; запирает её ключ сайта и
 * признак посетителя.
 */
export function pageOrigin(origin: string, referer: string): string {
    if (origin.trim()) {
        return origin;
    }

    try {
        return new URL(referer).origin;
    } catch {
        return '';
    }
}

/** Позволено ли звать операции сайта с этого адреса. */
export function originAllowed(origins: readonly string[], origin: string): boolean {
    const asked: string = normalized(origin);

    if (!asked) {
        return false;
    }

    return origins.some((allowed: string): boolean => normalized(allowed) === asked);
}

/** Способы обращения, на которые браузер получает позволение: чат открытых операций иных не знает. */
export const CHAT_CORS_METHODS: string = 'GET, POST, OPTIONS';

/** Заголовки, которые виджету позволено слать: тело он шлёт разобранным, и хватает одного. */
export const CHAT_CORS_HEADERS: string = 'content-type';

/** Сколько секунд браузер вправе помнить позволение и не спрашивать заново. */
export const CHAT_CORS_MAX_AGE: string = '600';

/**
 * Заголовки позволения для страницы чужого адреса.
 *
 * Браузер такую страницу к ответу не пускает, пока сервис не назвал её адрес. Называется именно
 * он, а не «любой»: позволение «любому» открыло бы операции площадки всякой странице сети, и
 * список адресов перестал бы значить что-либо.
 *
 * Адрес не из списков живых площадок не получает ни одного заголовка — и отказа тоже: ответ
 * уходит обычный, а до страницы его не доносит сам браузер.
 *
 * Предварительный запрос браузера отвечается тем же списком и добавляет к позволению способы
 * обращения и заголовки: позволенный заранее и отвергнутый потом выглядит для страницы поломкой
 * сервиса.
 */
export function chatCorsHeaders(origins: readonly string[], origin: string, beforehand: boolean): Readonly<Record<string, string>> | null {
    if (!originAllowed(origins, origin)) {
        return null;
    }

    const headers: Record<string, string> = { 'access-control-allow-origin': origin };

    if (beforehand) {
        headers['access-control-allow-methods'] = CHAT_CORS_METHODS;
        headers['access-control-allow-headers'] = CHAT_CORS_HEADERS;
        headers['access-control-max-age'] = CHAT_CORS_MAX_AGE;
    }

    return headers;
}
