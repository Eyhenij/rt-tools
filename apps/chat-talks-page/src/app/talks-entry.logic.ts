/**
 * Чем страница переписок называет себя и откуда берёт подпись потребителя.
 *
 * Страница живёт в рамке на странице чужой админки. Ключ площадки и адрес сервиса приезжают адресом
 * рамки: ключ и так лежит в коде страницы потребителя открыто, и прав, кроме операций площадки с
 * позволенных ею адресов, он не даёт.
 *
 * Подпись адресом не едет. Она — тайна на пять минут, а адрес виден и в журналах прокси, и в истории
 * браузера: страница просит её сообщением у того, кто её встроил, и тем же сообщением получает
 * новую, когда признак истёк.
 *
 * Решения здесь чистые: разбор адреса, разбор сообщения и слова отказа. Кто их зовёт и куда кладёт
 * ответ — дело самой страницы, и проверяются они вызовом.
 */
import { CHAT_PAGE_SIGNATURE_KIND, ERefusal, IChatPageSignature, IRefusal, refusalOf } from '@rt/message-bus-common';

/** Чем страница представляется сервису: ключ площадки, адрес сервиса и адрес встроившей её админки. */
export interface IChatPageEntry {
    readonly site: string;
    readonly service: string;
    /** Адрес админки потребителя: с ним и только с ним страница обменивается сообщениями. */
    readonly host: string;
}

/** Значение признака адреса без окружающих пробелов. Пустое считается неназванным. */
function asked(params: URLSearchParams, name: string): string {
    return (params.get(name) ?? '').trim();
}

/**
 * Разбор адреса рамки.
 *
 * Адрес сервиса называется отдельно: потребитель вправе держать сервис на своём поддомене, и тогда
 * он не совпадает с тем, откуда приехала страница. Не назван — обращения идут туда же, откуда
 * страница приехала, и это её собственный адрес.
 *
 * Адрес встроившей админки обязателен: с ним страница сверяет пришедшее сообщение и ему же шлёт
 * просьбу о подписи. Без него сообщением с подписью прикинулась бы любая страница, открывшая рамку.
 */
export function chatPageEntryOf(search: string, own: string = ''): IChatPageEntry | null {
    const params: URLSearchParams = new URLSearchParams(search);
    const site: string = asked(params, 'site');
    const host: string = asked(params, 'host');

    if (!site || !host) {
        return null;
    }

    return { site, host, service: asked(params, 'service') || own };
}

/**
 * Разбор сообщения с подписью.
 *
 * Чужое сообщение отбивается тремя признаками: словом, ключом площадки и видом полей. Ключ сверяется
 * с тем, с которым страницу встроили: сообщение с чужим ключом открыло бы переписки чужой площадки,
 * будь у пославшего её тайна.
 */
export function chatPageSignatureOf(data: unknown, site: string): IChatPageSignature | null {
    if (typeof data !== 'object' || data === null) {
        return null;
    }

    const fields: Record<string, unknown> = data as Record<string, unknown>;

    if (fields['kind'] !== CHAT_PAGE_SIGNATURE_KIND || fields['site'] !== site) {
        return null;
    }

    const at: unknown = fields['at'];
    const signature: unknown = fields['signature'];

    if (!Number.isSafeInteger(at) || typeof signature !== 'string' || !signature.trim()) {
        return null;
    }

    return { site, at: at as number, signature: signature.trim() };
}

/** Где стоит вход страницы: идёт, открыт или отбит. */
export enum ETalksEntry {
    Going = 'going',
    Opened = 'opened',
    Refused = 'refused',
}

/**
 * Слова отказа для человека.
 *
 * Набор полон по кодам входа: код, которому нет слова, показал бы человеку служебное имя. Чужой и
 * неизвестный код отвечают общей строкой — страница не знает, что случилось, и говорит ровно это.
 */
const ENTRY_NOT_OPENED: string = 'Страница переписок не открылась';

const ENTRY_WORDS: Readonly<Record<string, string>> = {
    [ERefusal.ChatEntryRejected]: ENTRY_NOT_OPENED,
    [ERefusal.ChatEntryStale]: ENTRY_NOT_OPENED,
    [ERefusal.ChatEntryExpired]: 'Вход устарел, обновите страницу',
    [ERefusal.ChatSiteKeyEmpty]: ENTRY_NOT_OPENED,
    [ERefusal.ChatOriginRejected]: ENTRY_NOT_OPENED,
};

/** Слова отказа входа: человек читает их, а не служебное имя кода. */
export function chatPageRefusalWords(body: unknown): string {
    const refusal: IRefusal | null = refusalOf(body);

    return (refusal && ENTRY_WORDS[refusal.code]) || ENTRY_NOT_OPENED;
}

/**
 * Нужна ли странице новая подпись.
 *
 * Истёкший признак — единственный отказ, который лечится сам: страница просит у встроившего свежую
 * подпись и меняет её на новый признак, ни о чём не спрашивая человека. Остальные отказы человеку и
 * показываются: новая подпись их не исправит.
 */
export function chatPageNeedsSignature(body: unknown): boolean {
    return refusalOf(body)?.code === ERefusal.ChatEntryExpired;
}
