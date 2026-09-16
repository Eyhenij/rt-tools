/**
 * Выдача входа: заведение сессии, кука и ответ о вошедшем.
 *
 * Лежит отдельно от операции входа потому, что вход выдают две операции — вход по паре и
 * заведение первой записи. Две выдачи, написанные порознь, разошлись бы молча: одна читала бы
 * срок из окружения, другая — нет, и кука одной не подходила бы проверке доступа другой.
 */
import { createSession, findAccountRights, IAccountRights } from '@rt/message-bus-api/accounts/data-access';
import { issueSessionToken, SESSION_COOKIE, sessionExpiry, sessionTokenHash, sessionTtlMs } from '@rt/message-bus-api/accounts/util';
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';
import { rightsOf } from '@rt/message-bus-common';

/** Ответ о том, кто вошёл. Ни пароля, ни значения входа в нём нет и быть не может. */
export interface ISessionAnswer {
    readonly name: string;
    /**
     * Права вошедшего целиком: набор его роли, сложенный с точечными правками.
     *
     * Ответом, а не выводом на стороне админки: складывать права второй раз значило бы завести
     * вторую копию сложения, и разошлась бы она молча — экран показывал бы раздел, который
     * приёмник отбивает.
     */
    readonly rights: readonly string[];
}

/** Куда каркас кладёт куку. Тип свой, а не привезённый: операциям нужны две операции из него. */
export interface ICookieBearingResponse {
    cookie(name: string, value: string, options: Record<string, unknown>): unknown;
    clearCookie(name: string, options: Record<string, unknown>): unknown;
}

/** Запись, которой выдаётся вход: признак и имя, как его показывают. */
export interface ISignedInAccount {
    readonly id: string;
    readonly name: string;
}

/**
 * Как выдаётся кука входа.
 *
 * `httpOnly` — скрипт страницы её не читает. `sameSite: 'strict'` — браузер не посылает её по
 * переходу с чужой страницы, и подделывать запрос оттуда нечем. `secure` — она не уходит по
 * открытому HTTP; на своей машине приёмник поднимается без сертификата, поэтому признак
 * читается из окружения, а не зашит.
 */
export function cookieOptions(maxAgeMs: number): Record<string, unknown> {
    return {
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env['SESSION_COOKIE_SECURE'] !== 'false',
        path: '/',
        maxAge: maxAgeMs,
    };
}

/**
 * Права записи одной строкой ответа.
 *
 * Читаются при каждом ответе, а не запоминаются во входе: тем же приёмом их читает проверка
 * доступа, и второй источник разошёлся бы с ней на первой же правке роли.
 *
 * Записи нет — прав нет: отвечать отказом здесь нечего, вход уже опознан проверкой.
 */
export async function rightsAnswerOf(prisma: PrismaService, accountId: string): Promise<readonly string[]> {
    const rights: IAccountRights | null = await findAccountRights(prisma, accountId);

    return rights ? [...rightsOf(rights.roleRights, rights.edits)] : [];
}

/** Завести вход записи, положить куку и ответить о вошедшем. */
export async function issueSignIn(
    prisma: PrismaService,
    response: ICookieBearingResponse,
    account: ISignedInAccount,
    at: Date
): Promise<ISessionAnswer> {
    const ttl: number = sessionTtlMs(process.env['SESSION_TTL_MS']);
    const token: string = issueSessionToken();

    await createSession(prisma, { accountId: account.id, hash: sessionTokenHash(token), expiresAt: sessionExpiry(at, ttl), at });
    response.cookie(SESSION_COOKIE, token, cookieOptions(ttl));

    return { name: account.name, rights: await rightsAnswerOf(prisma, account.id) };
}
