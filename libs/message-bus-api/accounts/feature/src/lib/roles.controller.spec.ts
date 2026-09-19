import 'reflect-metadata';

import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';

import { OPERATION_ACCESS, OPERATION_RIGHT } from '@rt/message-bus-api/access/util';
import { ERefusal, IPage, IRefusalBody, IRoleView } from '@rt/message-bus-common';

import { RolesController } from './roles.controller';
import { IRolesStorage, IStoredRole, signedInAs, rolesStorage } from './roles-storage.harness';

describe('RolesController', (): void => {
    it('SC-MB-382 — все операции над ролями закрыты правом на роли, а не правом на правку людей', (): void => {
        ['page', 'one', 'create', 'replace', 'remove'].forEach((method: string): void => {
            const handler: unknown = Reflect.get(RolesController.prototype, method);

            expect(Reflect.getMetadata(OPERATION_ACCESS, handler)).toBe('permission');
            expect(Reflect.getMetadata(OPERATION_RIGHT, handler)).toBe('roles:manage');
        });
    });

    it('SC-MB-371 — страница ролей несёт ключ, имя, права и число людей у каждой', async (): Promise<void> => {
        const { prisma }: IRolesStorage = rolesStorage();

        const page: IPage<IRoleView> = await new RolesController(prisma).page({});

        expect(page.total).toBe(2);
        expect(page.rows.map((row: IRoleView): string => row.key)).toEqual(['owner', 'watcher']);
        expect(page.rows[0]).toEqual({
            key: 'owner',
            name: 'Владелец',
            rights: ['postmortems:read', 'accounts:read', 'accounts:manage', 'roles:manage'],
            people: 1,
        });
    });

    it('SC-MB-373 — заведение кладёт роль с ключом из имени и отвечает ею без людей', async (): Promise<void> => {
        const { prisma, roles }: IRolesStorage = rolesStorage();

        const role: IRoleView = await new RolesController(prisma).create({ name: ' Чтец ', rights: ['postmortems:read'] });

        expect(role).toEqual({ key: 'чтец', name: 'Чтец', rights: ['postmortems:read'], people: 0 });
        expect(roles).toHaveLength(3);
    });

    it('SC-MB-375 — занятое имя отбивается по приведённому виду, и прежняя роль цела', async (): Promise<void> => {
        const { prisma, roles }: IRolesStorage = rolesStorage();
        const controller: RolesController = new RolesController(prisma);

        await expect(controller.create({ name: 'ВЛАДЕЛЕЦ', rights: [] })).rejects.toThrow(ConflictException);
        await expect(controller.replace('watcher', { name: 'владелец', rights: [] }, signedInAs('a1', 'Ольга'))).rejects.toThrow(
            ConflictException
        );
        expect(roles).toHaveLength(2);
        expect(roles[1].name).toBe('Наблюдатель');
    });

    it('SC-MB-374 — правка сменяет имя и права, ключ остаётся; своё имя при переименовании не занято', async (): Promise<void> => {
        const { prisma, roles }: IRolesStorage = rolesStorage();

        const role: IRoleView = await new RolesController(prisma).replace(
            'watcher',
            { name: 'Наблюдатель', rights: ['usage:read'] },
            signedInAs('a1', 'Ольга')
        );

        expect(role).toEqual({ key: 'watcher', name: 'Наблюдатель', rights: ['usage:read'], people: 1 });
        expect(roles[1].rights).toEqual(['usage:read']);
    });

    it('SC-MB-380 — пустое имя и право не из набора отбиваются до записи', async (): Promise<void> => {
        const { prisma, roles }: IRolesStorage = rolesStorage();
        const controller: RolesController = new RolesController(prisma);

        await expect(controller.create({ name: '', rights: [] })).rejects.toThrow(BadRequestException);
        await expect(controller.create({ name: 'Чтец', rights: ['cargo:fly'] })).rejects.toThrow(/cargo:fly/);
        await expect(controller.replace('owner', { name: 'Владелец', rights: ['x'] }, signedInAs('a1', 'Ольга'))).rejects.toThrow(
            BadRequestException
        );
        expect(roles).toHaveLength(2);
        expect(roles[0].rights).toContain('roles:manage');
    });

    it('SC-MB-408 — отклонённое обращение отвечает кодом набора и прежним кодом ответа', async (): Promise<void> => {
        const { prisma }: IRolesStorage = rolesStorage();
        const controller: RolesController = new RolesController(prisma);
        const refused: unknown = await controller.create({ name: 'Владелец', rights: [] }).catch((error: unknown): unknown => error);

        expect(refused).toBeInstanceOf(ConflictException);

        const thrown: ConflictException = refused as ConflictException;
        const body: IRefusalBody = thrown.getResponse() as IRefusalBody;

        expect(thrown.getStatus()).toBe(409);
        expect(body.code).toBe(ERefusal.RoleNameTaken);
        expect(body.params).toEqual({ name: 'Владелец' });
        // Предложение для дерева тело несёт рядом с кодом, а не вместо него
        expect(body.message).toContain('Владелец');
    });

    it('SC-MB-379 — своя роль без права на роли не записывается, а чужая с тем же составом правится', async (): Promise<void> => {
        const { prisma, roles }: IRolesStorage = rolesStorage();
        const controller: RolesController = new RolesController(prisma);

        await expect(
            controller.replace('owner', { name: 'Владелец', rights: ['accounts:read'] }, signedInAs('a1', 'Ольга'))
        ).rejects.toThrow(/без права на роли/);
        expect(roles[0].rights).toContain('roles:manage');

        // Та же правка от Бориса, который владельцем не является, проходит: запирается не он
        await controller.replace('owner', { name: 'Владелец', rights: ['accounts:read'] }, signedInAs('a2', 'Борис'));
        expect(roles[0].rights).toEqual(['accounts:read']);
    });

    it('SC-MB-376 — роль, которую держат, не удаляется с числом людей, а пустую удаление убирает', async (): Promise<void> => {
        const { prisma, roles }: IRolesStorage = rolesStorage();
        const controller: RolesController = new RolesController(prisma);

        await expect(controller.remove('owner')).rejects.toThrow(/держат записи: 1/);
        expect(roles.map((role: IStoredRole): string => role.key)).toContain('owner');

        await controller.create({ name: 'Лишняя', rights: [] });
        await controller.remove('лишняя');
        expect(roles.map((role: IStoredRole): string => role.key)).not.toContain('лишняя');
    });

    it('SC-MB-376 — незнакомый ключ отвечает «не найдено» на чтении, правке и удалении', async (): Promise<void> => {
        const { prisma }: IRolesStorage = rolesStorage();
        const controller: RolesController = new RolesController(prisma);

        await expect(controller.one('nobody')).rejects.toThrow(NotFoundException);
        await expect(controller.replace('nobody', { name: 'Кто-то', rights: [] }, signedInAs('a1', 'Ольга'))).rejects.toThrow(
            NotFoundException
        );
        await expect(controller.remove('nobody')).rejects.toThrow(NotFoundException);
    });
});
