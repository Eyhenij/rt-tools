import { CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { describe, expect, it } from 'vitest';

import { ICaller } from '@rt-tools/auth-contract';
import { AuthGuard, KeycloakTokenVerifier } from '@rt-tools/auth-server';
import { PublicOperation, RequiresRight, SessionOperation, TreeOperation } from '@rt/message-bus-api/access/util';
import { TRight } from '@rt/message-bus-common';
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';
import { ITreeBearingRequest, TREE_OF_REQUEST, treeTokenHash } from '@rt/message-bus-api/trees/util';
import { TREE_TOKEN_HEADER } from '@rt-tools/agent-kit/cargo';

import { AccessGuard } from './access.guard';

/**
 * Обе проверки приёмника вместе, как они стоят в приложении: проверка модуля входа и проверка
 * приёмника. Запрос проходит, только если согласны обе, поэтому сценарий судится по паре, а не
 * по одной из них.
 *
 * Подпись токена здесь не проверяется — её проверяет набор самого модуля входа. Двойник
 * проверяющего отвечает вызывающим по строке заголовка, как ответил бы настоящий на годный токен.
 */

/** Токены дерева: годный и отозванный — оба одного и того же дерева. */
const TOKEN: string = 'токен-своего-дерева';
const REVOKED_TOKEN: string = 'токен-отозванный';

const TREE: { id: string; slug: string; name: string } = { id: 'id-1', slug: 'own-tree', name: 'Своё дерево' };

const RIGHT: TRight = 'postmortems:manage';
const OTHER_RIGHT: TRight = 'postmortems:read';

/** Заголовки токенов людей: с правом, без него и без единой роли клиента. */
const WITH_RIGHT: string = 'Bearer with.right.token';
const WITHOUT_RIGHT: string = 'Bearer without.right.token';
const NO_ROLE: string = 'Bearer no.role.token';

function caller(subject: string, permissions: readonly TRight[]): ICaller {
    return { subject, email: `${subject}@example.com`, emailVerified: true, name: subject, permissions: new Set(permissions) };
}

/** Двойник проверяющего: годные токены и вызывающие по ним. Остальное он не принимает. */
class VerifierDouble {
    readonly #callers: Map<string, ICaller> = new Map([
        [WITH_RIGHT, caller('с-правом', [RIGHT, OTHER_RIGHT])],
        [WITHOUT_RIGHT, caller('без-права', [OTHER_RIGHT])],
        [NO_ROLE, caller('без-роли', [])],
    ]);

    /** Новый токен того же человека: роли в нём — те, что Keycloak выдал на этот раз. */
    public reissue(header: string, permissions: readonly TRight[]): void {
        const known: ICaller | undefined = this.#callers.get(header);

        if (known) {
            this.#callers.set(header, caller(known.subject, permissions));
        }
    }

    public async callerOf(authorization: string | null | undefined): Promise<ICaller | null> {
        return this.#callers.get(authorization ?? '') ?? null;
    }
}

interface ITokenRow {
    readonly hash: string;
    readonly revokedAt: Date | null;
    readonly tree: { id: string; slug: string; name: string };
}

/**
 * Двойник хранилища: отбор по хешу он делает сам. Проверять собранный `where` вместо строк
 * значило бы проверять форму запроса, а сценарий обещает исход проверки.
 */
class PrismaDouble {
    readonly #tokens: ITokenRow[] = [
        { hash: treeTokenHash(TOKEN), revokedAt: null, tree: TREE },
        { hash: treeTokenHash(REVOKED_TOKEN), revokedAt: new Date('2026-08-01T00:00:00Z'), tree: TREE },
    ];

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
}

/** Операции каждого вида доступа, объявленные теми же метками, что и в приложении. */
class Operations {
    @PublicOperation()
    public open(): void {
        return undefined;
    }

    @TreeOperation()
    public intake(): void {
        return undefined;
    }

    @SessionOperation()
    public read(): void {
        return undefined;
    }

    @RequiresRight(RIGHT)
    public manage(): void {
        return undefined;
    }

    public undeclared(): void {
        return undefined;
    }
}

type TOperation = keyof Operations;

type TRequest = ITreeBearingRequest & { headers: Record<string, string | string[] | undefined> };

function requestWith(headers: Record<string, string | string[] | undefined> = {}): TRequest {
    return { headers };
}

function contextOf(operation: TOperation, request: TRequest): ExecutionContext {
    return {
        switchToHttp: () => ({ getRequest: () => request }),
        getHandler: () => Operations.prototype[operation],
        getClass: () => Operations,
    } as unknown as ExecutionContext;
}

function accessGuard(): AccessGuard {
    return new AccessGuard(new PrismaDouble() as unknown as PrismaService, new Reflector());
}

/** Пара проверок, как в приложении: сначала модуль входа, затем приёмник. */
class Guards {
    public readonly verifier: VerifierDouble = new VerifierDouble();
    readonly #guards: readonly CanActivate[] = [new AuthGuard(this.verifier as unknown as KeycloakTokenVerifier), accessGuard()];

    public async pass(operation: TOperation, request: TRequest): Promise<boolean> {
        for (const guard of this.#guards) {
            await guard.canActivate(contextOf(operation, request));
        }

        return true;
    }
}

describe('AccessGuard', (): void => {
    it('SC-MB-4 — запрос без токена дерева отбивается', async (): Promise<void> => {
        await expect(new Guards().pass('intake', requestWith())).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('SC-MB-4 — годный токен пропускает запрос и кладёт в него опознанное дерево', async (): Promise<void> => {
        const request: TRequest = requestWith({ [TREE_TOKEN_HEADER]: TOKEN });

        await expect(new Guards().pass('intake', request)).resolves.toBe(true);
        expect(request[TREE_OF_REQUEST]).toEqual(TREE);
    });

    it('SC-MB-4 — два токена в одном запросе токеном не считаются', async (): Promise<void> => {
        const request: TRequest = requestWith({ [TREE_TOKEN_HEADER]: [TOKEN, REVOKED_TOKEN] });

        await expect(new Guards().pass('intake', request)).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('SC-MB-5 — отозванный токен перестаёт приниматься, и отказ не называет, какой именно', async (): Promise<void> => {
        const request: TRequest = requestWith({ [TREE_TOKEN_HEADER]: REVOKED_TOKEN });

        await expect(new Guards().pass('intake', request)).rejects.toThrow('токен не принят');
    });

    it('SC-MB-5 — незаведённый токен отвечает тем же отказом, что и отозванный', async (): Promise<void> => {
        const request: TRequest = requestWith({ [TREE_TOKEN_HEADER]: 'чужой-токен' });

        await expect(new Guards().pass('intake', request)).rejects.toThrow('токен не принят');
    });

    it('SC-MB-17 — операция, объявленная открытой, проходит без токена и без входа', async (): Promise<void> => {
        await expect(new Guards().pass('open', requestWith())).resolves.toBe(true);
    });

    it('SC-MB-36 — операция чтения груза без токена отбивается', async (): Promise<void> => {
        await expect(new Guards().pass('read', requestWith())).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('SC-MB-36 — годный токен человека операцию чтения открывает', async (): Promise<void> => {
        await expect(new Guards().pass('read', requestWith({ authorization: NO_ROLE }))).resolves.toBe(true);
    });

    it('SC-MB-36 — непринятый токен отвечает тем же отказом, что и отсутствующий', async (): Promise<void> => {
        const request: TRequest = requestWith({ authorization: 'Bearer foreign.client.token' });

        await expect(new Guards().pass('read', request)).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('SC-MB-39 — токен дерева операцию чтения груза не открывает', async (): Promise<void> => {
        const request: TRequest = requestWith({ [TREE_TOKEN_HEADER]: TOKEN });

        await expect(new Guards().pass('read', request)).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('SC-MB-40 — токен человека приёма груза не открывает', async (): Promise<void> => {
        const request: TRequest = requestWith({ authorization: WITH_RIGHT });

        await expect(new Guards().pass('intake', request)).rejects.toThrow('операция требует токен дерева');
    });

    it('SC-MB-79 — операция, не объявившая доступа, не отвечает никому', async (): Promise<void> => {
        const request: TRequest = requestWith({ [TREE_TOKEN_HEADER]: TOKEN, authorization: WITH_RIGHT });

        await expect(new Guards().pass('undeclared', request)).rejects.toBeInstanceOf(UnauthorizedException);
        await expect(accessGuard().canActivate(contextOf('undeclared', request))).rejects.toThrow('операция доступа не объявила');
    });
});

describe('AccessGuard: операция, закрытая правом', (): void => {
    it('SC-MB-287 — вошедший с правом операцию открывает', async (): Promise<void> => {
        await expect(new Guards().pass('manage', requestWith({ authorization: WITH_RIGHT }))).resolves.toBe(true);
    });

    it('SC-MB-288 — вошедший без права отбивается отказом о праве, а не об отсутствии входа', async (): Promise<void> => {
        const request: TRequest = requestWith({ authorization: WITHOUT_RIGHT });

        await expect(new Guards().pass('manage', request)).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('SC-MB-288 — не представившийся отбивается другим отказом, чем вошедший без права', async (): Promise<void> => {
        await expect(new Guards().pass('manage', requestWith())).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('SC-MB-289 — отказ не называет ни права, ни набора прав вошедшего', async (): Promise<void> => {
        const request: TRequest = requestWith({ authorization: WITHOUT_RIGHT });

        await expect(new Guards().pass('manage', request)).rejects.toThrow(
            expect.objectContaining({ message: expect.not.stringContaining(RIGHT) })
        );
    });

    it('SC-MB-293 — человек без ролей клиента операцию не открывает', async (): Promise<void> => {
        await expect(new Guards().pass('manage', requestWith({ authorization: NO_ROLE }))).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('SC-MB-294 — снятое право действует со следующим токеном', async (): Promise<void> => {
        const guards: Guards = new Guards();

        await expect(guards.pass('manage', requestWith({ authorization: WITH_RIGHT }))).resolves.toBe(true);

        guards.verifier.reissue(WITH_RIGHT, [OTHER_RIGHT]);

        await expect(guards.pass('manage', requestWith({ authorization: WITH_RIGHT }))).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('SC-MB-295 — годный токен дерева операцию, закрытую правом, не открывает', async (): Promise<void> => {
        const request: TRequest = requestWith({ [TREE_TOKEN_HEADER]: TOKEN });

        await expect(new Guards().pass('manage', request)).rejects.toBeInstanceOf(UnauthorizedException);
    });
});
