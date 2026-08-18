import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { describe, expect, it } from 'vitest';

import { OPERATION_ACCESS, TOperationAccess } from '@rt/message-bus-api/access/util';
import { ACCOUNT_OF_REQUEST, IAccountBearingRequest, sessionTokenHash } from '@rt/message-bus-api/accounts/util';
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';
import { ITreeBearingRequest, TREE_OF_REQUEST, treeTokenHash } from '@rt/message-bus-api/trees/util';
import { TREE_TOKEN_HEADER } from '@rt-tools/agent-kit/cargo';

import { AccessGuard } from './access.guard';

/** Токены дерева: годный и отозванный — оба одного и того же дерева. */
const TOKEN: string = 'токен-своего-дерева';
const REVOKED_TOKEN: string = 'токен-отозванный';

/** Входы человека: живой, просроченный, оборванный и вход отключённой записи. */
const SESSION: string = 'вход-живой';
const EXPIRED_SESSION: string = 'вход-просроченный';
const REVOKED_SESSION: string = 'вход-оборванный';
const DISABLED_SESSION: string = 'вход-отключённой-записи';

const TREE: { id: string; slug: string; name: string } = { id: 'id-1', slug: 'own-tree', name: 'Своё дерево' };

interface ITokenRow {
    readonly hash: string;
    readonly revokedAt: Date | null;
    readonly tree: { id: string; slug: string; name: string };
}

interface ISessionRow {
    readonly hash: string;
    readonly id: string;
    readonly expiresAt: Date;
    readonly revokedAt: Date | null;
    readonly account: { id: string; name: string; disabledAt: Date | null };
}

/**
 * Двойник хранилища: отбор по хешу он делает сам. Проверять собранный `where` вместо строк
 * значило бы проверять форму запроса, а сценарий обещает исход проверки.
 */
class PrismaDouble {
    readonly #tokens: ITokenRow[];
    readonly #sessions: ISessionRow[];

    constructor(tokens: ITokenRow[], sessions: ISessionRow[]) {
        this.#tokens = tokens;
        this.#sessions = sessions;
    }

    public get treeToken(): { findFirst: (args: Record<string, unknown>) => Promise<unknown> } {
        return {
            findFirst: async (args: Record<string, unknown>): Promise<unknown> => {
                const where: { hash?: string; revokedAt?: Date | null } = args['where'] ?? {};
                const found: ITokenRow | undefined = this.#tokens.find(
                    (row: ITokenRow): boolean => row.hash === where.hash && row.revokedAt === where.revokedAt
                );

                return found ? { tree: found.tree } : null;
            },
        };
    }

    public get session(): { findUnique: (args: Record<string, unknown>) => Promise<unknown> } {
        return {
            findUnique: async (args: Record<string, unknown>): Promise<unknown> => {
                const where: { hash?: string } = args['where'] ?? {};
                const found: ISessionRow | undefined = this.#sessions.find((row: ISessionRow): boolean => row.hash === where.hash);

                if (!found) {
                    return null;
                }

                return { id: found.id, expiresAt: found.expiresAt, revokedAt: found.revokedAt, account: found.account };
            },
        };
    }
}

/** Хранилище: одно дерево с двумя токенами и четыре входа в разных состояниях. */
function storage(): PrismaService {
    const account: { id: string; name: string; disabledAt: Date | null } = {
        id: 'account-1',
        name: 'Владелец',
        disabledAt: null,
    };
    const ahead: Date = new Date(Date.now() + 60 * 60 * 1000);
    const behind: Date = new Date(Date.now() - 60 * 60 * 1000);

    return new PrismaDouble(
        [
            { hash: treeTokenHash(TOKEN), revokedAt: null, tree: TREE },
            { hash: treeTokenHash(REVOKED_TOKEN), revokedAt: new Date('2026-08-01T00:00:00Z'), tree: TREE },
        ],
        [
            { hash: sessionTokenHash(SESSION), id: 'session-1', expiresAt: ahead, revokedAt: null, account },
            { hash: sessionTokenHash(EXPIRED_SESSION), id: 'session-2', expiresAt: behind, revokedAt: null, account },
            { hash: sessionTokenHash(REVOKED_SESSION), id: 'session-3', expiresAt: ahead, revokedAt: behind, account },
            {
                hash: sessionTokenHash(DISABLED_SESSION),
                id: 'session-4',
                expiresAt: ahead,
                revokedAt: null,
                account: { id: 'account-2', name: 'Отключённый', disabledAt: behind },
            },
        ]
    ) as unknown as PrismaService;
}

/** Запрос — то, что проверка от него читает: заголовки и куки. */
type TRequest = ITreeBearingRequest & IAccountBearingRequest & { headers: Record<string, string | string[] | undefined> };

/** Вход приезжает кукой в заголовке — тем же способом, каким его несёт браузер. */
function requestWith(headers: Record<string, string | string[] | undefined> = {}, session?: string): TRequest {
    const carried: Record<string, string | string[] | undefined> = session
        ? { ...headers, cookie: `other=1; message_bus_session=${session}` }
        : headers;

    return { headers: carried };
}

function contextOf(request: TRequest): ExecutionContext {
    return {
        switchToHttp: () => ({ getRequest: () => request }),
        getHandler: () => (): void => undefined,
        getClass: () => class {},
    } as unknown as ExecutionContext;
}

/** Отражатель, отвечающий на вопрос об объявлении доступа одним и тем же ответом. */
function reflector(access: TOperationAccess | undefined): Reflector {
    return {
        getAllAndOverride: (key: string): TOperationAccess | undefined => (key === OPERATION_ACCESS ? access : undefined),
    } as Reflector;
}

function guardWith(access: TOperationAccess | undefined): AccessGuard {
    return new AccessGuard(storage(), reflector(access));
}

describe('AccessGuard', () => {
    it('SC-MB-4 — запрос без токена дерева отбивается', async () => {
        await expect(guardWith('tree').canActivate(contextOf(requestWith()))).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('SC-MB-4 — годный токен пропускает запрос и кладёт в него опознанное дерево', async () => {
        const request: TRequest = requestWith({ [TREE_TOKEN_HEADER]: TOKEN });

        await expect(guardWith('tree').canActivate(contextOf(request))).resolves.toBe(true);
        expect(request[TREE_OF_REQUEST]).toEqual(TREE);
    });

    it('SC-MB-4 — два токена в одном запросе токеном не считаются', async () => {
        const request: TRequest = requestWith({ [TREE_TOKEN_HEADER]: [TOKEN, REVOKED_TOKEN] });

        await expect(guardWith('tree').canActivate(contextOf(request))).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('SC-MB-5 — отозванный токен перестаёт приниматься, и отказ не называет, какой именно', async () => {
        const request: TRequest = requestWith({ [TREE_TOKEN_HEADER]: REVOKED_TOKEN });

        await expect(guardWith('tree').canActivate(contextOf(request))).rejects.toThrow('токен не принят');
    });

    it('SC-MB-5 — незаведённый токен отвечает тем же отказом, что и отозванный', async () => {
        const request: TRequest = requestWith({ [TREE_TOKEN_HEADER]: 'чужой-токен' });

        await expect(guardWith('tree').canActivate(contextOf(request))).rejects.toThrow('токен не принят');
    });

    it('SC-MB-17 — операция, объявленная открытой, проходит без токена и без входа', async () => {
        await expect(guardWith('public').canActivate(contextOf(requestWith()))).resolves.toBe(true);
    });

    it('SC-MB-36 — операция чтения груза без входа отбивается', async () => {
        await expect(guardWith('session').canActivate(contextOf(requestWith()))).rejects.toThrow('операция требует входа');
    });

    it('SC-MB-36 — живой вход пропускает запрос и кладёт в него вошедшего', async () => {
        const request: TRequest = requestWith({}, SESSION);

        await expect(guardWith('session').canActivate(contextOf(request))).resolves.toBe(true);
        expect(request[ACCOUNT_OF_REQUEST]).toEqual({ id: 'account-1', name: 'Владелец', sessionId: 'session-1' });
    });

    it('SC-MB-37 — просроченный вход перестаёт приниматься', async () => {
        const request: TRequest = requestWith({}, EXPIRED_SESSION);

        await expect(guardWith('session').canActivate(contextOf(request))).rejects.toThrow('операция требует входа');
    });

    it('SC-MB-38 — оборванный выходом вход не принимается', async () => {
        const request: TRequest = requestWith({}, REVOKED_SESSION);

        await expect(guardWith('session').canActivate(contextOf(request))).rejects.toThrow('операция требует входа');
    });

    it('SC-MB-58 — вход отключённой записи не принимается', async () => {
        const request: TRequest = requestWith({}, DISABLED_SESSION);

        await expect(guardWith('session').canActivate(contextOf(request))).rejects.toThrow('операция требует входа');
    });

    it('SC-MB-39 — токен дерева операцию чтения груза не открывает', async () => {
        const request: TRequest = requestWith({ [TREE_TOKEN_HEADER]: TOKEN });

        await expect(guardWith('session').canActivate(contextOf(request))).rejects.toThrow('операция требует входа');
    });

    it('SC-MB-40 — вход человека приёма груза не открывает', async () => {
        const request: TRequest = requestWith({}, SESSION);

        await expect(guardWith('tree').canActivate(contextOf(request))).rejects.toThrow('операция требует токен дерева');
    });

    it('SC-MB-79 — операция, не объявившая доступа, не отвечает никому', async () => {
        const request: TRequest = requestWith({ [TREE_TOKEN_HEADER]: TOKEN }, SESSION);

        await expect(guardWith(undefined).canActivate(contextOf(request))).rejects.toThrow('операция доступа не объявила');
    });
});
