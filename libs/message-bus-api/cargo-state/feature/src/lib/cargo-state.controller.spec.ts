import { BadRequestException, Logger } from '@nestjs/common';
import { describe, expect, it, MockInstance, vi } from 'vitest';

import { OPERATION_ACCESS, TOperationAccess } from '@rt/message-bus-api/access/util';
import { ECargoStateDenial, ICargoStateResponse } from '@rt/message-bus-api/cargo-state/api';
import { ECargoState } from '@rt/message-bus-common';

import { CargoStateController } from './cargo-state.controller';

import { controllerWith, NEIGHBOUR, packet, PrismaDouble, requestOf, TREE } from './cargo-state.double';

describe('CargoStateController', () => {
    it('SC-MB-172 — дерево переводит свою запись в следующее состояние', async () => {
        const prisma: PrismaDouble = new PrismaDouble();
        prisma.postmortems.push({ treeId: TREE.id, key: 'a.md', state: ECargoState.New });

        const answer: ICargoStateResponse = await controllerWith(prisma).move(
            packet([{ kind: 'postmortem', key: 'a.md', state: 'in_work' }]),
            requestOf()
        );

        expect(prisma.postmortems[0].state).toBe(ECargoState.InWork);
        expect(answer).toEqual({ tree: TREE.slug, changed: 1, same: 0, denied: [] });
    });

    it('SC-MB-173 — пакет правит записи обоих родов за один запрос', async () => {
        const prisma: PrismaDouble = new PrismaDouble();
        prisma.postmortems.push({ treeId: TREE.id, key: 'a.md', state: ECargoState.New });
        prisma.proposals.push({ treeId: TREE.id, key: 'digest-1', state: ECargoState.New });

        const answer: ICargoStateResponse = await controllerWith(prisma).move(
            packet([
                { kind: 'postmortem', key: 'a.md', state: 'in_work' },
                { kind: 'proposal', key: 'digest-1', state: 'in_work' },
            ]),
            requestOf()
        );

        expect(prisma.postmortems[0].state).toBe(ECargoState.InWork);
        expect(prisma.proposals[0].state).toBe(ECargoState.InWork);
        expect(answer.changed).toBe(2);
        expect(answer.denied).toEqual([]);
    });

    it('SC-MB-175 — прыжок через шаг отбивает строку, а не пакет', async () => {
        const prisma: PrismaDouble = new PrismaDouble();
        prisma.postmortems.push({ treeId: TREE.id, key: 'a.md', state: ECargoState.New });
        prisma.postmortems.push({ treeId: TREE.id, key: 'b.md', state: ECargoState.New });

        const answer: ICargoStateResponse = await controllerWith(prisma).move(
            packet([
                { kind: 'postmortem', key: 'a.md', state: 'in_work' },
                { kind: 'postmortem', key: 'b.md', state: 'released', releaseVersion: 'rt-agent-kit@0.10.1' },
            ]),
            requestOf()
        );

        expect(prisma.postmortems[0].state).toBe(ECargoState.InWork);
        expect(prisma.postmortems[1].state).toBe(ECargoState.New);
        expect(answer.changed).toBe(1);
        expect(answer.denied).toEqual([{ at: 1, kind: 'postmortem', key: 'b.md', denial: ECargoStateDenial.Forbidden }]);
    });

    it('SC-MB-176 — правка в то же состояние считается своим числом и не отбивается', async () => {
        const prisma: PrismaDouble = new PrismaDouble();
        prisma.postmortems.push({ treeId: TREE.id, key: 'a.md', state: ECargoState.InWork });

        const answer: ICargoStateResponse = await controllerWith(prisma).move(
            packet([{ kind: 'postmortem', key: 'a.md', state: 'in_work' }]),
            requestOf()
        );

        expect(answer).toEqual({ tree: TREE.slug, changed: 0, same: 1, denied: [] });
    });

    it('SC-MB-177 — запись другого дерева отвечает так же, как ненайденная', async () => {
        const prisma: PrismaDouble = new PrismaDouble();
        prisma.postmortems.push({ treeId: NEIGHBOUR.id, key: 'a.md', state: ECargoState.New });

        const answer: ICargoStateResponse = await controllerWith(prisma).move(
            packet([{ kind: 'postmortem', key: 'a.md', state: 'in_work' }]),
            requestOf()
        );

        expect(prisma.postmortems[0].state).toBe(ECargoState.New);
        expect(answer.changed).toBe(0);
        expect(answer.denied).toEqual([{ at: 0, kind: 'postmortem', key: 'a.md', denial: ECargoStateDenial.Missing }]);
    });

    it('SC-MB-179 — незнакомое состояние отбивает запрос целиком и хранилища не касается', async () => {
        const prisma: PrismaDouble = new PrismaDouble();
        prisma.postmortems.push({ treeId: TREE.id, key: 'a.md', state: ECargoState.New });

        await expect(
            controllerWith(prisma).move(
                packet([
                    { kind: 'postmortem', key: 'a.md', state: 'in_work' },
                    { kind: 'postmortem', key: 'b.md', state: 'разобрано наполовину' },
                ]),
                requestOf()
            )
        ).rejects.toBeInstanceOf(BadRequestException);
        expect(prisma.postmortems[0].state).toBe(ECargoState.New);
    });

    it('SC-MB-179 — пустой пакет отбивается по форме', async () => {
        await expect(controllerWith(new PrismaDouble()).move(packet([]), requestOf())).rejects.toBeInstanceOf(BadRequestException);
    });

    it('SC-MB-181 — текст починки едет полем той же строки правки', async () => {
        const prisma: PrismaDouble = new PrismaDouble();
        prisma.postmortems.push({ treeId: TREE.id, key: 'a.md', state: ECargoState.InWork });

        const answer: ICargoStateResponse = await controllerWith(prisma).move(
            packet([{ kind: 'postmortem', key: 'a.md', state: 'fixed', fixNote: 'статьёй правила о выемке путей' }]),
            requestOf()
        );

        expect(prisma.postmortems[0].state).toBe(ECargoState.Fixed);
        expect(prisma.postmortems[0].fixNote).toBe('статьёй правила о выемке путей');
        expect(answer).toEqual({ tree: TREE.slug, changed: 1, same: 0, denied: [] });
    });

    it('SC-MB-182 — переход в «починено и не выпущено» без текста отбивает строку', async () => {
        const prisma: PrismaDouble = new PrismaDouble();
        prisma.postmortems.push({ treeId: TREE.id, key: 'a.md', state: ECargoState.InWork });

        const answer: ICargoStateResponse = await controllerWith(prisma).move(
            packet([{ kind: 'postmortem', key: 'a.md', state: 'fixed' }]),
            requestOf()
        );

        expect(prisma.postmortems[0].state).toBe(ECargoState.InWork);
        expect(prisma.postmortems[0].fixNote).toBeUndefined();
        expect(answer.changed).toBe(0);
        expect(answer.denied).toEqual([{ at: 0, kind: 'postmortem', key: 'a.md', denial: ECargoStateDenial.NoFixNote }]);
    });

    it('SC-MB-183 — текст с другим переходом отбивает строку целиком', async () => {
        const prisma: PrismaDouble = new PrismaDouble();
        prisma.postmortems.push({ treeId: TREE.id, key: 'a.md', state: ECargoState.New });

        const answer: ICargoStateResponse = await controllerWith(prisma).move(
            packet([{ kind: 'postmortem', key: 'a.md', state: 'in_work', fixNote: 'статьёй правила' }]),
            requestOf()
        );

        expect(prisma.postmortems[0].state).toBe(ECargoState.New);
        expect(prisma.postmortems[0].fixNote).toBeUndefined();
        expect(answer.denied).toEqual([{ at: 0, kind: 'postmortem', key: 'a.md', denial: ECargoStateDenial.ExtraFixNote }]);
    });

    it('SC-MB-184 — текст из одних пробелов отбивается как отсутствие текста', async () => {
        const prisma: PrismaDouble = new PrismaDouble();
        prisma.proposals.push({ treeId: TREE.id, key: 'digest-1', state: ECargoState.InWork });

        const answer: ICargoStateResponse = await controllerWith(prisma).move(
            packet([{ kind: 'proposal', key: 'digest-1', state: 'fixed', fixNote: '   ' }]),
            requestOf()
        );

        expect(prisma.proposals[0].state).toBe(ECargoState.InWork);
        expect(answer.denied).toEqual([{ at: 0, kind: 'proposal', key: 'digest-1', denial: ECargoStateDenial.NoFixNote }]);
    });

    it('SC-MB-185 — текст ложится обоим родам записей за один пакет', async () => {
        const prisma: PrismaDouble = new PrismaDouble();
        prisma.postmortems.push({ treeId: TREE.id, key: 'a.md', state: ECargoState.InWork });
        prisma.proposals.push({ treeId: TREE.id, key: 'digest-1', state: ECargoState.InWork });

        const answer: ICargoStateResponse = await controllerWith(prisma).move(
            packet([
                { kind: 'postmortem', key: 'a.md', state: 'fixed', fixNote: 'гардом' },
                { kind: 'proposal', key: 'digest-1', state: 'fixed', fixNote: 'проверкой' },
            ]),
            requestOf()
        );

        expect(prisma.postmortems[0].fixNote).toBe('гардом');
        expect(prisma.proposals[0].fixNote).toBe('проверкой');
        expect(answer.changed).toBe(2);
        expect(answer.denied).toEqual([]);
    });

    it('SC-MB-186 — отбитая строка не пишет ни состояния, ни текста', async () => {
        const prisma: PrismaDouble = new PrismaDouble();
        prisma.postmortems.push({ treeId: TREE.id, key: 'a.md', state: ECargoState.New });

        const answer: ICargoStateResponse = await controllerWith(prisma).move(
            packet([{ kind: 'postmortem', key: 'a.md', state: 'released', fixNote: 'статьёй правила' }]),
            requestOf()
        );

        expect(prisma.postmortems[0].state).toBe(ECargoState.New);
        expect(prisma.postmortems[0].fixNote).toBeUndefined();
        expect(answer.changed).toBe(0);
        expect(answer.denied).toHaveLength(1);
    });

    it('SC-MB-187 — второй приезд текста затирает прежний', async () => {
        const prisma: PrismaDouble = new PrismaDouble();
        prisma.postmortems.push({ treeId: TREE.id, key: 'a.md', state: ECargoState.InWork });
        const controller: CargoStateController = controllerWith(prisma);

        await controller.move(packet([{ kind: 'postmortem', key: 'a.md', state: 'fixed', fixNote: 'первой правкой' }]), requestOf());
        await controller.move(packet([{ kind: 'postmortem', key: 'a.md', state: 'fixed', fixNote: 'второй правкой' }]), requestOf());

        expect(prisma.postmortems[0].fixNote).toBe('второй правкой');
    });

    it('SC-MB-181 — переход после починки текста не трогает', async () => {
        const prisma: PrismaDouble = new PrismaDouble();
        prisma.postmortems.push({ treeId: TREE.id, key: 'a.md', state: ECargoState.Fixed, fixNote: 'статьёй правила' });

        await controllerWith(prisma).move(
            packet([{ kind: 'postmortem', key: 'a.md', state: 'released', releaseVersion: 'rt-agent-kit@0.10.1' }]),
            requestOf()
        );

        expect(prisma.postmortems[0].state).toBe(ECargoState.Released);
        expect(prisma.postmortems[0].fixNote).toBe('статьёй правила');
    });

    it('SC-MB-179 — текст починки не строкой отбивает запрос целиком', async () => {
        const prisma: PrismaDouble = new PrismaDouble();
        prisma.postmortems.push({ treeId: TREE.id, key: 'a.md', state: ECargoState.InWork });

        await expect(
            controllerWith(prisma).move(packet([{ kind: 'postmortem', key: 'a.md', state: 'fixed', fixNote: 17 }]), requestOf())
        ).rejects.toBeInstanceOf(BadRequestException);
        expect(prisma.postmortems[0].state).toBe(ECargoState.InWork);
    });

    it('SC-MB-178 — правка объявлена операцией дерева: без токена её отбивает страж входа', () => {
        const access: TOperationAccess | undefined = Reflect.getMetadata(OPERATION_ACCESS, CargoStateController.prototype.move);

        expect(access).toBe('tree');
    });

    it('SC-MB-180 — отбитая строка попадает в журнал приёмника без токена и текста записи', async () => {
        const prisma: PrismaDouble = new PrismaDouble();
        prisma.postmortems.push({ treeId: NEIGHBOUR.id, key: 'a.md', state: ECargoState.New });
        const written: unknown[][] = [];
        const warn: MockInstance = vi.spyOn(Logger.prototype, 'warn').mockImplementation((...tail: unknown[]): void => {
            written.push(tail);
        });

        try {
            await controllerWith(prisma).move(packet([{ kind: 'postmortem', key: 'a.md', state: 'in_work' }]), requestOf());
        } finally {
            warn.mockRestore();
        }

        expect(written).toHaveLength(1);
        expect(written[0][0]).toBe('intake.state.denied');
        expect(written[0][1]).toEqual({ tree: TREE.slug, kind: 'postmortem', denial: ECargoStateDenial.Missing });
        // Отрицательное утверждение идёт в паре с положительным: сперва строка найдена, и только
        // потом сказано, чего в ней нет
        expect(JSON.stringify(written[0])).not.toContain('a.md');
    });

    it('SC-MB-192 — отбой по недостающему тексту попадает в журнал приёмника', async () => {
        const prisma: PrismaDouble = new PrismaDouble();
        prisma.postmortems.push({ treeId: TREE.id, key: 'a.md', state: ECargoState.InWork });
        const written: unknown[][] = [];
        const warn: MockInstance = vi.spyOn(Logger.prototype, 'warn').mockImplementation((...tail: unknown[]): void => {
            written.push(tail);
        });

        try {
            await controllerWith(prisma).move(packet([{ kind: 'postmortem', key: 'a.md', state: 'fixed' }]), requestOf());
        } finally {
            warn.mockRestore();
        }

        expect(written).toHaveLength(1);
        expect(written[0][0]).toBe('intake.state.denied');
        expect(written[0][1]).toEqual({ tree: TREE.slug, kind: 'postmortem', denial: ECargoStateDenial.NoFixNote });
    });
});
