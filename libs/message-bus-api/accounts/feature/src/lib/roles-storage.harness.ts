/**
 * Двойник хранилища для спек ролей и доступа: роли, записи и точечные правки в памяти.
 *
 * Правки он исполняет сам, и по ним судится исход: спека смотрит не на то, что контроллер послал
 * хранилищу, а на то, что в нём лежит после. Ничего сверх схемы двойник не досочиняет.
 */
import { IPermissionEdit } from '@rt/message-bus-common';

import { ACCOUNT_OF_REQUEST, IAccountBearingRequest } from '@rt/message-bus-api/accounts/util';
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';

/** Роль в хранилище. */
export interface IStoredRole {
    readonly id: string;
    readonly key: string;
    name: string;
    rights: string[];
}

/** Запись в хранилище: только то, что читают роли и доступ. */
export interface IStoredAccount {
    readonly id: string;
    readonly name: string;
    readonly nameKey: string;
    roleId: string | null;
}

/** Точечная правка в хранилище. */
export interface IStoredEdit {
    readonly accountId: string;
    readonly right: string;
    readonly granted: boolean;
}

/** Двойник целиком: таблицы наружу, чтобы спека судила по ним. */
export interface IRolesStorage {
    readonly prisma: PrismaService;
    readonly roles: IStoredRole[];
    readonly accounts: IStoredAccount[];
    readonly edits: IStoredEdit[];
}

/** Как таблица ролей отвечает на выборку с вложенным счётом записей. */
interface IRoleAnswer {
    readonly id: string;
    readonly key: string;
    readonly name: string;
    readonly rights: string[];
    readonly _count: { readonly accounts: number };
}

/** Как таблица записей отвечает на выборку доступа. */
interface IAccessAnswer {
    readonly id: string;
    readonly name: string;
    readonly role: { readonly key: string; readonly rights: string[] } | null;
    readonly permissions: IPermissionEdit[];
}

/** Двойник: две роли, три записи, две правки. Ольга — владелец с правом на роли. */
export function rolesStorage(): IRolesStorage {
    const roles: IStoredRole[] = [
        { id: 'r-owner', key: 'owner', name: 'Владелец', rights: ['postmortems:read', 'accounts:read', 'accounts:manage', 'roles:manage'] },
        { id: 'r-watcher', key: 'watcher', name: 'Наблюдатель', rights: ['postmortems:read', 'usage:read'] },
    ];
    const accounts: IStoredAccount[] = [
        { id: 'a1', name: 'Ольга', nameKey: 'ольга', roleId: 'r-owner' },
        { id: 'a2', name: 'Борис', nameKey: 'борис', roleId: 'r-watcher' },
        { id: 'a3', name: 'Вера', nameKey: 'вера', roleId: null },
    ];
    const edits: IStoredEdit[] = [
        { accountId: 'a2', right: 'usage:read', granted: false },
        { accountId: 'a2', right: 'invites:read', granted: true },
    ];

    const roleAnswer: (role: IStoredRole) => IRoleAnswer = (role: IStoredRole): IRoleAnswer => ({
        ...role,
        _count: { accounts: accounts.filter((account: IStoredAccount): boolean => account.roleId === role.id).length },
    });
    const roleBy: (where: { key?: string; id?: string }) => IStoredRole | null = (where: {
        key?: string;
        id?: string;
    }): IStoredRole | null =>
        roles.find((role: IStoredRole): boolean => (where.key !== undefined ? role.key === where.key : role.id === where.id)) ?? null;
    const accessAnswer: (account: IStoredAccount) => IAccessAnswer = (account: IStoredAccount): IAccessAnswer => {
        const role: IStoredRole | null = account.roleId === null ? null : roleBy({ id: account.roleId });

        return {
            id: account.id,
            name: account.name,
            role: role ? { key: role.key, rights: role.rights } : null,
            permissions: edits
                .filter((edit: IStoredEdit): boolean => edit.accountId === account.id)
                .map((edit: IStoredEdit): IPermissionEdit => ({ right: edit.right, granted: edit.granted })),
        };
    };

    const role: object = {
        count: async (): Promise<number> => roles.length,
        findMany: async (): Promise<IRoleAnswer[]> =>
            [...roles].sort((a: IStoredRole, b: IStoredRole): number => a.name.localeCompare(b.name)).map(roleAnswer),
        findUnique: async ({ where }: { where: { key: string } }): Promise<IRoleAnswer | null> => {
            const found: IStoredRole | null = roleBy(where);

            return found ? roleAnswer(found) : null;
        },
        create: async ({ data }: { data: { key: string; name: string; rights: string[] } }): Promise<void> => {
            roles.push({ id: `r-${roles.length + 1}`, ...data });
        },
        update: async ({ where, data }: { where: { key: string }; data: { name: string; rights: string[] } }): Promise<void> => {
            Object.assign(roleBy(where) as IStoredRole, data);
        },
        delete: async ({ where }: { where: { key: string } }): Promise<void> => {
            roles.splice(roles.indexOf(roleBy(where) as IStoredRole), 1);
        },
    };
    const account: object = {
        findUnique: async ({ where }: { where: { id?: string; nameKey?: string } }): Promise<IAccessAnswer | null> => {
            const found: IStoredAccount | undefined = accounts.find((one: IStoredAccount): boolean =>
                where.id !== undefined ? one.id === where.id : one.nameKey === where.nameKey
            );

            return found ? accessAnswer(found) : null;
        },
        update: async ({ where, data }: { where: { id: string }; data: { roleId: string | null } }): Promise<void> => {
            (accounts.find((one: IStoredAccount): boolean => one.id === where.id) as IStoredAccount).roleId = data.roleId;
        },
    };
    const accountPermission: object = {
        deleteMany: async ({ where }: { where: { accountId: string } }): Promise<void> => {
            for (let at: number = edits.length - 1; at >= 0; at -= 1) {
                if (edits[at].accountId === where.accountId) {
                    edits.splice(at, 1);
                }
            }
        },
        createMany: async ({ data }: { data: IStoredEdit[] }): Promise<void> => {
            edits.push(...data);
        },
    };
    const transaction: (steps: Promise<unknown>[]) => Promise<unknown[]> = async (steps: Promise<unknown>[]): Promise<unknown[]> =>
        Promise.all(steps);
    // Двойник несёт только таблицы, которые зовут контроллеры; честного типа клиента у него нет,
    // а поднимать клиент целиком ради спеки нечем
    // eslint-disable-next-line no-restricted-syntax -- двойник хранилища, а не клиент
    const prisma: PrismaService = { role, account, accountPermission, $transaction: transaction } as unknown as PrismaService;

    return { prisma, roles, accounts, edits };
}

/** Запрос, в который проверка входа положила вошедшего. */
export function signedInAs(id: string, name: string): IAccountBearingRequest {
    return { [ACCOUNT_OF_REQUEST]: { id, name, sessionId: 's1' } };
}
