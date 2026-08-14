import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { describe, expect, it } from 'vitest';

import { PrismaService } from '@rt/message-bus-api/persistence/data-access';
import { ITreeBearingRequest, TREE_OF_REQUEST, treeTokenHash } from '@rt/message-bus-api/trees/util';
import { TREE_TOKEN_HEADER } from '@rt-tools/agent-kit/cargo';

import { PUBLIC_OPERATION } from './public.decorator';
import { TreeTokenGuard } from './tree-token.guard';

/** Токен годного дерева и хеш, который лежал бы в хранилище. */
const TOKEN: string = 'токен-своего-дерева';
const REVOKED_TOKEN: string = 'токен-отозванный';

interface ITokenRow {
    readonly hash: string;
    readonly revokedAt: Date | null;
    readonly tree: { id: string; slug: string; name: string };
}

/**
 * Двойник хранилища: отбор по хешу и по пометке отзыва он делает сам. Проверять собранный
 * `where` вместо строк значило бы проверять форму запроса, а сценарий обещает исход приёма.
 */
class PrismaDouble {
    readonly #tokens: ITokenRow[];

    constructor(tokens: ITokenRow[]) {
        this.#tokens = tokens;
    }

    public get treeToken(): { findFirst: (args: Record<string, unknown>) => Promise<unknown> } {
        return {
            findFirst: async (args: Record<string, unknown>): Promise<unknown> => {
                const where: { hash?: string; revokedAt?: Date | null } = (args['where'] ?? {}) as {
                    hash?: string;
                    revokedAt?: Date | null;
                };
                const found: ITokenRow | undefined = this.#tokens.find(
                    (row: ITokenRow): boolean => row.hash === where.hash && row.revokedAt === where.revokedAt
                );

                return found ? { tree: found.tree } : null;
            },
        };
    }
}

/** Хранилище с годным токеном одного дерева и отозванным токеном того же дерева. */
function storage(): PrismaService {
    const tree: { id: string; slug: string; name: string } = { id: 'id-1', slug: 'own-tree', name: 'Своё дерево' };

    return new PrismaDouble([
        { hash: treeTokenHash(TOKEN), revokedAt: null, tree },
        { hash: treeTokenHash(REVOKED_TOKEN), revokedAt: new Date('2026-08-01T00:00:00Z'), tree },
    ]) as unknown as PrismaService;
}

/** Запрос с заголовками — то, что проверка от него читает. */
function requestWith(headers: Record<string, string | string[] | undefined>): ITreeBearingRequest {
    return { headers } as ITreeBearingRequest & { headers: Record<string, string | string[] | undefined> };
}

function contextOf(request: ITreeBearingRequest): ExecutionContext {
    return {
        switchToHttp: () => ({ getRequest: () => request }),
        getHandler: () => (): void => undefined,
        getClass: () => class {},
    } as unknown as ExecutionContext;
}

/** Отражатель, отвечающий на вопрос «открыта ли операция» одним и тем же ответом. */
function reflector(isPublic: boolean): Reflector {
    return { getAllAndOverride: (key: string): boolean | undefined => (key === PUBLIC_OPERATION ? isPublic : undefined) } as Reflector;
}

function guardWith(isPublic: boolean = false): TreeTokenGuard {
    return new TreeTokenGuard(storage(), reflector(isPublic));
}

describe('TreeTokenGuard', () => {
    it('SC-MB-4 — запрос без токена дерева отбивается', async () => {
        const rejection: unknown = await guardWith()
            .canActivate(contextOf(requestWith({})))
            .catch((error: unknown): unknown => error);

        expect(rejection).toBeInstanceOf(UnauthorizedException);
        expect((rejection as UnauthorizedException).message).toBe('операция требует токен дерева');
    });

    it('SC-MB-5 — отозванный токен перестаёт приниматься, и отказ не называет, какой именно', async () => {
        const rejection: unknown = await guardWith()
            .canActivate(contextOf(requestWith({ [TREE_TOKEN_HEADER]: REVOKED_TOKEN })))
            .catch((error: unknown): unknown => error);

        expect(rejection).toBeInstanceOf(UnauthorizedException);
        expect((rejection as UnauthorizedException).message).toBe('токен не принят');
    });

    it('SC-MB-5 — незаведённый токен отвечает тем же отказом, что и отозванный', async () => {
        const rejection: unknown = await guardWith()
            .canActivate(contextOf(requestWith({ [TREE_TOKEN_HEADER]: 'токен-которого-нет' })))
            .catch((error: unknown): unknown => error);

        expect((rejection as UnauthorizedException).message).toBe('токен не принят');
    });

    it('SC-MB-4 — годный токен пропускает запрос и кладёт в него опознанное дерево', async () => {
        const request: ITreeBearingRequest = requestWith({ [TREE_TOKEN_HEADER]: TOKEN });

        await expect(guardWith().canActivate(contextOf(request))).resolves.toBe(true);
        expect(request[TREE_OF_REQUEST]).toEqual({ id: 'id-1', slug: 'own-tree', name: 'Своё дерево' });
    });

    it('SC-MB-4 — два токена в одном запросе токеном не считаются', async () => {
        const rejection: unknown = await guardWith()
            .canActivate(contextOf(requestWith({ [TREE_TOKEN_HEADER]: [TOKEN, REVOKED_TOKEN] })))
            .catch((error: unknown): unknown => error);

        expect((rejection as UnauthorizedException).message).toBe('операция требует токен дерева');
    });

    it('SC-MB-17 — операция, объявленная открытой, проходит без токена', async () => {
        await expect(guardWith(true).canActivate(contextOf(requestWith({})))).resolves.toBe(true);
    });
});
