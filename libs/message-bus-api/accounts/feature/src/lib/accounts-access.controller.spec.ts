import 'reflect-metadata';

import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';

import { OPERATION_ACCESS, OPERATION_RIGHT } from '@rt/message-bus-api/access/util';
import { IPersonAccessView } from '@rt/message-bus-common';

import { AccountsAccessController } from './accounts-access.controller';
import { IRolesStorage, IStoredEdit, requestOf, rolesStorage } from './roles-storage.harness';

describe('AccountsAccessController', (): void => {
    it('SC-MB-382 — чтение и замена доступа закрыты правом на роли', (): void => {
        ['read', 'replace'].forEach((method: string): void => {
            const handler: unknown = Reflect.get(AccountsAccessController.prototype, method);

            expect(Reflect.getMetadata(OPERATION_ACCESS, handler)).toBe('permission');
            expect(Reflect.getMetadata(OPERATION_RIGHT, handler)).toBe('roles:manage');
        });
    });

    it('SC-MB-377 — доступ несёт роль, правки и права, которые из них выходят; запись без роли — пусто и ничего', async (): Promise<void> => {
        const { prisma }: IRolesStorage = rolesStorage();
        const controller: AccountsAccessController = new AccountsAccessController(prisma);

        // Борис: роль даёт чтение разборов и использование, правки снимают использование и дают приглашения
        expect(await controller.read('борис')).toEqual({
            name: 'Борис',
            role: 'watcher',
            edits: [
                { right: 'usage:read', granted: false },
                { right: 'invites:read', granted: true },
            ],
            rights: ['postmortems:read', 'invites:read'],
        });
        expect(await controller.read('Вера')).toEqual({ name: 'Вера', role: null, edits: [], rights: [] });
    });

    it('SC-MB-381 — замена кладёт новую роль и ровно названные правки, прежние уходят', async (): Promise<void> => {
        const { prisma, accounts, edits }: IRolesStorage = rolesStorage();

        const view: IPersonAccessView = await new AccountsAccessController(prisma).replace(
            'Борис',
            { role: 'owner', edits: [{ right: 'accounts:manage', granted: false }] },
            requestOf('a1', 'Ольга')
        );

        expect(accounts[1].roleId).toBe('r-owner');
        expect(edits.filter((edit: IStoredEdit): boolean => edit.accountId === 'a2')).toEqual([
            { accountId: 'a2', right: 'accounts:manage', granted: false },
        ]);
        expect(view.rights).toEqual(['postmortems:read', 'accounts:read', 'roles:manage']);
    });

    it('SC-MB-381 — пустая роль снимает роль с записи, и права выходят из одних правок', async (): Promise<void> => {
        const { prisma, accounts }: IRolesStorage = rolesStorage();

        const view: IPersonAccessView = await new AccountsAccessController(prisma).replace(
            'Борис',
            { role: null, edits: [{ right: 'usage:read', granted: true }] },
            requestOf('a1', 'Ольга')
        );

        expect(accounts[1].roleId).toBeNull();
        expect(view).toEqual({ name: 'Борис', role: null, edits: [{ right: 'usage:read', granted: true }], rights: ['usage:read'] });
    });

    it('SC-MB-379 — своя запись без права на роли не записывается ни ролью, ни правкой', async (): Promise<void> => {
        const { prisma, accounts, edits }: IRolesStorage = rolesStorage();
        const controller: AccountsAccessController = new AccountsAccessController(prisma);

        await expect(controller.replace('Ольга', { role: 'watcher', edits: [] }, requestOf('a1', 'Ольга'))).rejects.toThrow(
            /без права на роли/
        );
        await expect(
            controller.replace('Ольга', { role: 'owner', edits: [{ right: 'roles:manage', granted: false }] }, requestOf('a1', 'Ольга'))
        ).rejects.toThrow(ConflictException);
        expect(accounts[0].roleId).toBe('r-owner');
        expect(edits.filter((edit: IStoredEdit): boolean => edit.accountId === 'a1')).toHaveLength(0);

        // Своя запись с правом, данным правкой поверх роли без него, — проходит
        await controller.replace('Ольга', { role: 'watcher', edits: [{ right: 'roles:manage', granted: true }] }, requestOf('a1', 'Ольга'));
        expect(accounts[0].roleId).toBe('r-watcher');
    });

    it('SC-MB-380 — право не из набора и правка без признака отбиваются до записи', async (): Promise<void> => {
        const { prisma, edits }: IRolesStorage = rolesStorage();
        const controller: AccountsAccessController = new AccountsAccessController(prisma);

        await expect(
            controller.replace('Борис', { role: null, edits: [{ right: 'x', granted: true }] }, requestOf('a1', 'Ольга'))
        ).rejects.toThrow(BadRequestException);
        await expect(
            controller.replace('Борис', { role: null, edits: [{ right: 'usage:read' }] }, requestOf('a1', 'Ольга'))
        ).rejects.toThrow(BadRequestException);
        expect(edits).toHaveLength(2);
    });

    it('SC-MB-376 — незнакомое имя и незнакомая роль отвечают «не найдено»', async (): Promise<void> => {
        const { prisma }: IRolesStorage = rolesStorage();
        const controller: AccountsAccessController = new AccountsAccessController(prisma);

        await expect(controller.read('Никто')).rejects.toThrow(NotFoundException);
        await expect(controller.replace('Борис', { role: 'nobody', edits: [] }, requestOf('a1', 'Ольга'))).rejects.toThrow(
            NotFoundException
        );
    });
});
