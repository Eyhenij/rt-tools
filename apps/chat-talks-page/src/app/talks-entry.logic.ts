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
 * Решения здесь чистые: разбор адреса и разбор сообщения. Кто их зовёт и куда кладёт ответ — дело
 * самой страницы, и проверяются они вызовом.
 */

/** Чем страница представляется сервису: ключ площадки и адрес самого сервиса. */
export interface IChatPageEntry {
    readonly site: string;
    readonly service: string;
}

/** Подпись потребителя: ключ площадки, минута и сам знак. */
export interface IChatPageSignature {
    readonly site: string;
    readonly at: number;
    readonly signature: string;
}

/** Слово сообщения с подписью: по нему страница отличает своё сообщение от чужого. */
export const CHAT_PAGE_SIGNATURE_KIND: string = 'rt-chat-signature';

/** Слово сообщения-просьбы: им страница просит у встроившего свежую подпись. */
export const CHAT_PAGE_SIGNATURE_ASKED: string = 'rt-chat-signature-asked';

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
 */
export function chatPageEntryOf(search: string, own: string = ''): IChatPageEntry | null {
    const params: URLSearchParams = new URLSearchParams(search);
    const site: string = asked(params, 'site');

    if (!site) {
        return null;
    }

    return { site, service: asked(params, 'service') || own };
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
