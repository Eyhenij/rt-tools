/**
 * Решения скрипта установки, вынесенные из разметки: они проверяются вызовом, а не поднятой страницей.
 *
 * Адрес сервиса, адрес рамки, чужое сообщение и ответ сервера потребителя — всё это скрипт решает до
 * того, как что-то нарисовать. Оставшись внутри элемента, каждое из них проверялось бы только
 * поднятым браузером.
 */
import { CHAT_PAGE_SIGNATURE_ASKED, CHAT_PAGE_SIGNATURE_KIND, IChatPageSignature } from '@rt/message-bus-common';

/** Где у сервиса лежит страница переписок. Потребитель вправе назвать другой путь признаком тега. */
export const TALKS_PAGE_PATH: string = '/talks/';

/** Чем установка представляется сервису: площадка, адрес сервиса, путь страницы и точка подписи. */
export interface ITalksEmbed {
    readonly site: string;
    readonly service: string;
    /** Путь страницы переписок у сервиса. */
    readonly page: string;
    /** Адрес точки потребителя, которая выдаёт подпись. Тайна площадки лежит за ней, на сервере. */
    readonly signUrl: string;
}

/** Признаки тега, как они приехали из разметки. */
export interface ITalksEmbedAttrs {
    readonly site: string;
    readonly service: string;
    readonly page: string;
    readonly signUrl: string;
}

/** Значение без окружающих пробелов. Пустое считается неназванным. */
function named(value: string | null): string {
    return (value ?? '').trim();
}

/**
 * Адрес сервиса.
 *
 * Названный признаком тега — он и берётся: площадка вправе держать сервис на своём поддомене. Не
 * названный — берётся оттуда, откуда приехал сам скрипт: админка потребителя стоит на чужом узле, и
 * своего адреса у сервиса там взять больше неоткуда.
 */
export function talksEmbedService(asked: string, scriptSrc: string): string {
    const said: string = named(asked);

    if (said) {
        return said.endsWith('/') ? said.slice(0, said.length - 1) : said;
    }

    try {
        return new URL(scriptSrc).origin;
    } catch {
        return '';
    }
}

/**
 * Разбор признаков тега.
 *
 * Ключ площадки и точка выдачи подписи обязательны: без первого нечего открывать, без второй нечем
 * назваться. Ключ лежит в чужой странице открыто, и прав, кроме операций площадки с позволенных ею
 * адресов, он не даёт; тайна остаётся за точкой выдачи, на сервере потребителя.
 */
export function talksEmbedOf(attrs: ITalksEmbedAttrs, scriptSrc: string): ITalksEmbed | null {
    const site: string = named(attrs.site);
    const signUrl: string = named(attrs.signUrl);
    const service: string = talksEmbedService(attrs.service, scriptSrc);

    if (!site || !signUrl || !service) {
        return null;
    }

    return { site, service, signUrl, page: named(attrs.page) || TALKS_PAGE_PATH };
}

/**
 * Адрес рамки.
 *
 * Ключ площадки и адрес встроившей админки едут адресом: рамка о встроившей её странице иначе не
 * знает ничего, а сверять сообщения ей надо с ней одной. Подпись адресом не едет: она — тайна на
 * пять минут, а адрес виден и в журналах прокси, и в истории браузера.
 */
export function talksEmbedFrameSrc(embed: ITalksEmbed, host: string): string {
    const params: URLSearchParams = new URLSearchParams({ site: embed.site, host });

    return `${embed.service}${embed.page}?${params.toString()}`;
}

/** Просит ли рамка свежую подпись. Чужое сообщение отбивается словом и ключом площадки. */
export function talksEmbedAsksSignature(data: unknown, site: string): boolean {
    if (typeof data !== 'object' || data === null) {
        return false;
    }

    const fields: Record<string, unknown> = data as Record<string, unknown>;

    return fields['kind'] === CHAT_PAGE_SIGNATURE_ASKED && fields['site'] === site;
}

/**
 * Ответ сервера потребителя как подпись.
 *
 * Поля проверяются здесь, а не в рамке: сервер потребителя пишет он сам, и его ошибка иначе доедет
 * до страницы отказом входа — то есть покажется поломкой сервиса.
 */
export function talksEmbedSignatureOf(body: unknown, site: string): IChatPageSignature | null {
    if (typeof body !== 'object' || body === null) {
        return null;
    }

    const fields: Record<string, unknown> = body as Record<string, unknown>;
    const at: unknown = fields['at'];
    const signature: unknown = fields['signature'];

    if (!Number.isSafeInteger(at) || typeof signature !== 'string' || !signature.trim()) {
        return null;
    }

    return { site, at: at as number, signature: signature.trim() };
}

/** Сообщение с подписью: то самое, которого ждёт рамка. */
export function talksEmbedSignatureMessage(signature: IChatPageSignature): Record<string, unknown> {
    return { kind: CHAT_PAGE_SIGNATURE_KIND, site: signature.site, at: signature.at, signature: signature.signature };
}
