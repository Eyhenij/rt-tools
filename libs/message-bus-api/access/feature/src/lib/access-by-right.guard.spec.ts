import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { describe, expect, it } from 'vitest';

import { OPERATION_ACCESS, OPERATION_RIGHT, TOperationAccess } from '@rt/message-bus-api/access/util';
import { TRight } from '@rt/message-bus-common';
import { IAccountBearingRequest, sessionTokenHash } from '@rt/message-bus-api/accounts/util';
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';
import { ITreeBearingRequest, treeTokenHash } from '@rt/message-bus-api/trees/util';
import { TREE_TOKEN_HEADER } from '@rt-tools/agent-kit/cargo';

import { AccessGuard } from './access.guard';

/**
 * Операция, закрытая правом. Стоит отдельным файлом от проверки трёх прежних видов: двойник
 * хранилища здесь отвечает ещё и о правах, и сведённый в один он читался бы вдвое дольше.
 *
 * Права меняются прямо в двойнике между вызовами — так проверяется, что они читаются на каждом
 * вызове, а не берутся из выданного входа.
 */

const RIGHT: TRight = 'postmortems:manage';
const OTHER_RIGHT: TRight = 'postmortems:read';

/** Входы: у каждого своя запись, чтобы права одной не задевали другую. */
const WITH_RIGHT: string = 'вход-с-правом';
const WITHOUT_RIGHT: string = 'вход-без-права';
const NO_ROLE: string = 'вход-без-роли';

interface IAccountRow {
    readonly id: string;
    role: { rights: string[] } | null;
    permissions: { right: string; granted: boolean }[];
}

/** Двойник хранилища: входы по хешу куки и права по опознавателю записи. */
class PrismaDouble {
    readonly #accounts: IAccountRow[];
    readonly #sessions: { hash: string; accountId: string }[];

    constructor(accounts: IAccountRow[], sessions: { hash: string; accountId: string }[]) {
        this.#accounts = accounts;
        this.#sessions = sessions;
    }

    /** Права записи правятся прямо здесь: проверка обязана прочитать их заново. */
    public grant(accountId: string, right: string, granted: boolean): void {
        const account: IAccountRow | undefined = this.#accounts.find((row: IAccountRow): boolean => row.id === accountId);

        account?.permissions.push({ right, granted });
    }

    public get treeToken(): { findFirst: () => Promise<unknown> } {
        return { findFirst: async (): Promise<unknown> => null };
    }

    public get session(): { findUnique: (args: Record<string, unknown>) => Promise<unknown> } {
        return {
            findUnique: async (args: Record<string, unknown>): Promise<unknown> => {
                const where: { hash?: string } = args['where'] ?? {};
                const found: { hash: string; accountId: string } | undefined = this.#sessions.find(
                    (row: { hash: string; accountId: string }): boolean => row.hash === where.hash
                );

                if (!found) {
                    return null;
                }

                return {
                    id: `session-${found.accountId}`,
                    expiresAt: new Date(Date.now() + 60 * 60 * 1000),
                    revokedAt: null,
                    account: { id: found.accountId, name: found.accountId, disabledAt: null },
                };
            },
        };
    }

    public get account(): { findUnique: (args: Record<string, unknown>) => Promise<unknown> } {
        return {
            findUnique: async (args: Record<string, unknown>): Promise<unknown> => {
                const where: { id?: string } = args['where'] ?? {};
                const found: IAccountRow | undefined = this.#accounts.find((row: IAccountRow): boolean => row.id === where.id);

                return found ? { role: found.role, permissions: found.permissions } : null;
            },
        };
    }
}

function storage(): PrismaDouble {
    return new PrismaDouble(
        [
            { id: 'с-правом', role: { rights: [RIGHT, OTHER_RIGHT] }, permissions: [] },
            { id: 'без-права', role: { rights: [OTHER_RIGHT] }, permissions: [] },
            { id: 'без-роли', role: null, permissions: [] },
        ],
        [
            { hash: sessionTokenHash(WITH_RIGHT), accountId: 'с-правом' },
            { hash: sessionTokenHash(WITHOUT_RIGHT), accountId: 'без-права' },
            { hash: sessionTokenHash(NO_ROLE), accountId: 'без-роли' },
        ]
    );
}

type TRequest = ITreeBearingRequest & IAccountBearingRequest & { headers: Record<string, string | string[] | undefined> };

function requestWith(headers: Record<string, string | string[] | undefined> = {}, session?: string): TRequest {
    return { headers: session ? { ...headers, cookie: `message_bus_session=${session}` } : headers };
}

function contextOf(request: TRequest): ExecutionContext {
    return {
        switchToHttp: () => ({ getRequest: () => request }),
        getHandler: () => (): void => undefined,
        getClass: () => class {},
    } as unknown as ExecutionContext;
}

/** Отражатель отвечает на оба ключа: вид доступа и само право. */
function reflector(access: TOperationAccess | undefined, right: TRight | undefined): Reflector {
    return {
        getAllAndOverride: (key: string): unknown => {
            if (key === OPERATION_ACCESS) {
                return access;
            }

            return key === OPERATION_RIGHT ? right : undefined;
        },
    } as Reflector;
}

function guardWith(double: PrismaDouble): AccessGuard {
    return new AccessGuard(double as unknown as PrismaService, reflector('permission', RIGHT));
}

/** Объявление без названного права: значение по умолчанию здесь запретно — оно и есть предмет. */
function guardWithoutRight(double: PrismaDouble): AccessGuard {
    return new AccessGuard(double as unknown as PrismaService, reflector('permission', undefined));
}

describe('AccessGuard: операция, закрытая правом', (): void => {
    it('SC-MB-287 — вошедший с правом операцию открывает', async (): Promise<void> => {
        const guard: AccessGuard = guardWith(storage());

        await expect(guard.canActivate(contextOf(requestWith({}, WITH_RIGHT)))).resolves.toBe(true);
    });

    it('SC-MB-288 — вошедший без права отбивается отказом о праве, а не об отсутствии входа', async (): Promise<void> => {
        const guard: AccessGuard = guardWith(storage());

        await expect(guard.canActivate(contextOf(requestWith({}, WITHOUT_RIGHT)))).rejects.toThrow(ForbiddenException);
    });

    it('SC-MB-288 — не представившийся отбивается другим отказом, чем вошедший без права', async (): Promise<void> => {
        const guard: AccessGuard = guardWith(storage());

        await expect(guard.canActivate(contextOf(requestWith()))).rejects.toThrow(UnauthorizedException);
    });

    it('SC-MB-289 — отказ не называет ни права, ни набора прав записи', async (): Promise<void> => {
        const guard: AccessGuard = guardWith(storage());

        await expect(guard.canActivate(contextOf(requestWith({}, WITHOUT_RIGHT)))).rejects.toThrow(
            expect.objectContaining({ message: expect.not.stringContaining(RIGHT) })
        );
    });

    it('SC-MB-293 — запись без роли операцию не открывает', async (): Promise<void> => {
        const guard: AccessGuard = guardWith(storage());

        await expect(guard.canActivate(contextOf(requestWith({}, NO_ROLE)))).rejects.toThrow(ForbiddenException);
    });

    it('SC-MB-294 — снятое право действует на следующем вызове, а не на следующем входе', async (): Promise<void> => {
        const double: PrismaDouble = storage();
        const guard: AccessGuard = guardWith(double);
        const request: TRequest = requestWith({}, WITH_RIGHT);

        await expect(guard.canActivate(contextOf(request))).resolves.toBe(true);

        double.grant('с-правом', RIGHT, false);

        await expect(guard.canActivate(contextOf(request))).rejects.toThrow(ForbiddenException);
    });

    it('SC-MB-295 — годный токен дерева операцию, закрытую правом, не открывает', async (): Promise<void> => {
        const guard: AccessGuard = guardWith(storage());

        await expect(guard.canActivate(contextOf(requestWith({ [TREE_TOKEN_HEADER]: treeTokenHash('токен') })))).rejects.toThrow(
            UnauthorizedException
        );
    });

    it('объявление без названного права никого не пускает', async (): Promise<void> => {
        // Вид доступа объявлен, право рядом не написано: это дефект приложения, и открывать
        // операцию по недописанному объявлению — та самая дыра, от которой защищает умолчание.
        const guard: AccessGuard = guardWithoutRight(storage());

        await expect(guard.canActivate(contextOf(requestWith({}, WITH_RIGHT)))).rejects.toThrow(UnauthorizedException);
    });
});
