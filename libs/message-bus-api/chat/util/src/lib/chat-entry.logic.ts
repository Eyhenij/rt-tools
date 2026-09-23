/**
 * Вход встраиваемой страницы переписок: чем потребитель называет себя и что сервис выдаёт взамен.
 *
 * У людей админки потребителя нет и не будет учётной записи приёмника: у чата своё пространство и
 * свои операторы. Поэтому пускает их сам потребитель — подписью по ключу сайта, а сервис проверяет
 * подпись и выдаёт признак страницы на время.
 *
 * Тайна подписи — та же `hookSecret`, которой сервис подписывает вызовы наружу: она уже лежит у
 * приложения потребителя на сервере и заведена ровно для того, чтобы отличать сервис от
 * постороннего. Вторая тайна значила бы два секрета в одном приложении и два места, где их теряют.
 */
import { createHmac, timingSafeEqual } from 'node:crypto';

/** Допуск минуты подписи: насколько её время может отстоять от времени узла. */
export const CHAT_ENTRY_SIGNATURE_SPREAD_MS: number = 5 * 60 * 1000;

/** Сколько живёт признак страницы. Короче рабочего дня: вкладка закрыта — вход кончился. */
export const CHAT_ENTRY_SIGN_LIFETIME_MS: number = 30 * 60 * 1000;

/** Разделитель тела признака и его подписи. */
const SIGN_SEPARATOR: string = '.';

/** Разобранный признак страницы: чей он и до какой минуты годен. */
export interface IChatEntrySign {
    readonly siteId: string;
    readonly expiresAt: number;
}

/** Сравнение постоянным временем: по времени обычного сравнения подпись подбирается побайтно. */
function sameSecretly(own: string, said: string): boolean {
    const left: Buffer = Buffer.from(own, 'utf8');
    const right: Buffer = Buffer.from(said, 'utf8');

    return left.length === right.length && timingSafeEqual(left, right);
}

/**
 * Подпись входа: ключ сайта и минута, склеенные разделителем.
 *
 * Минута входит в подпись, иначе однажды взятая у сервера потребителя подпись открывает переписки
 * столько, сколько живёт тайна.
 */
export function chatEntrySignature(secret: string, key: string, madeAt: number): string {
    return createHmac('sha256', secret).update(`${key}${SIGN_SEPARATOR}${madeAt}`).digest('hex');
}

/** Сходится ли подпись входа. */
export function chatEntrySignatureFits(secret: string, key: string, madeAt: number, signature: string): boolean {
    return sameSecretly(chatEntrySignature(secret, key, madeAt), signature);
}

/** Уложилась ли минута подписи в допуск вокруг времени узла — в обе стороны: часы расходятся. */
export function chatEntryMinuteFits(madeAt: number, now: number): boolean {
    return Math.abs(now - madeAt) <= CHAT_ENTRY_SIGNATURE_SPREAD_MS;
}

/**
 * Признак страницы: тело и подпись через разделитель. Тело несёт сайт и минуту конца — по нему
 * сервис знает, чьи переписки читать, не спрашивая ключ второй раз.
 */
export function chatEntrySignMake(secret: string, siteId: string, now: number): string {
    const expiresAt: number = now + CHAT_ENTRY_SIGN_LIFETIME_MS;
    const body: string = Buffer.from(`${siteId}${SIGN_SEPARATOR}${expiresAt}`, 'utf8').toString('base64url');
    const signature: string = createHmac('sha256', secret).update(body).digest('hex');

    return `${body}${SIGN_SEPARATOR}${signature}`;
}

/**
 * Разбор признака страницы без проверки подписи: он говорит только, чей признак и до какой минуты.
 *
 * Подпись проверяется отдельно и позже — тайна лежит у сайта, а сайт находится по тому самому
 * номеру, который отсюда и берётся.
 */
export function chatEntrySignRead(sign: string): IChatEntrySign | null {
    const parts: string[] = sign.split(SIGN_SEPARATOR);

    if (parts.length !== 2 || !parts[0] || !parts[1]) {
        return null;
    }

    const body: string = Buffer.from(parts[0], 'base64url').toString('utf8');
    const cut: number = body.lastIndexOf(SIGN_SEPARATOR);

    if (cut <= 0) {
        return null;
    }

    const siteId: string = body.slice(0, cut);
    const expiresAt: number = Number(body.slice(cut + 1));

    if (!siteId || !Number.isSafeInteger(expiresAt)) {
        return null;
    }

    return { siteId, expiresAt };
}

/** Сходится ли подпись признака страницы с тайной сайта. */
export function chatEntrySignFits(secret: string, sign: string): boolean {
    const parts: string[] = sign.split(SIGN_SEPARATOR);

    if (parts.length !== 2 || !parts[0] || !parts[1]) {
        return false;
    }

    return sameSecretly(createHmac('sha256', secret).update(parts[0]).digest('hex'), parts[1]);
}

/** Истёк ли признак страницы. Равная минута считается истёкшей: край принадлежит отказу. */
export function chatEntrySignExpired(sign: IChatEntrySign, now: number): boolean {
    return sign.expiresAt <= now;
}
