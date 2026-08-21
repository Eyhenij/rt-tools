import { BadRequestException, Logger } from '@nestjs/common';
import { describe, expect, it, MockInstance, vi } from 'vitest';

import { ECargoStateDenial, ICargoStateResponse } from '@rt/message-bus-api/cargo-state/api';
import { ECargoState } from '@rt/message-bus-common';

import { CargoStateController } from './cargo-state.controller';
import { controllerWith, packet, PrismaDouble, requestOf, TREE } from './cargo-state.double';

describe('CargoStateController — версия выпуска', () => {
    it('SC-MB-193 — версия выпуска едет полем той же строки правки', async () => {
        const prisma: PrismaDouble = new PrismaDouble();
        prisma.postmortems.push({ treeId: TREE.id, key: 'a.md', state: ECargoState.Fixed, fixNote: 'статьёй правила' });

        const answer: ICargoStateResponse = await controllerWith(prisma).move(
            packet([{ kind: 'postmortem', key: 'a.md', state: 'released', releaseVersion: 'rt-agent-kit@0.10.1' }]),
            requestOf()
        );

        expect(prisma.postmortems[0].state).toBe(ECargoState.Released);
        expect(prisma.postmortems[0].releaseVersion).toBe('rt-agent-kit@0.10.1');
        expect(answer.changed).toBe(1);
        expect(answer.denied).toEqual([]);
    });

    it('SC-MB-194 — переход в выпуск без версии отбивает строку', async () => {
        const prisma: PrismaDouble = new PrismaDouble();
        prisma.postmortems.push({ treeId: TREE.id, key: 'a.md', state: ECargoState.Fixed, fixNote: 'статьёй правила' });

        const answer: ICargoStateResponse = await controllerWith(prisma).move(
            packet([{ kind: 'postmortem', key: 'a.md', state: 'released' }]),
            requestOf()
        );

        expect(prisma.postmortems[0].state).toBe(ECargoState.Fixed);
        expect(answer.changed).toBe(0);
        expect(answer.denied).toEqual([{ at: 0, kind: 'postmortem', key: 'a.md', denial: ECargoStateDenial.NoReleaseVersion }]);
    });

    it('SC-MB-195 — версия с другим переходом отбивает строку целиком', async () => {
        const prisma: PrismaDouble = new PrismaDouble();
        prisma.postmortems.push({ treeId: TREE.id, key: 'a.md', state: ECargoState.New });

        const answer: ICargoStateResponse = await controllerWith(prisma).move(
            packet([{ kind: 'postmortem', key: 'a.md', state: 'in_work', releaseVersion: 'rt-agent-kit@0.10.1' }]),
            requestOf()
        );

        expect(prisma.postmortems[0].state).toBe(ECargoState.New);
        expect(prisma.postmortems[0].releaseVersion).toBeUndefined();
        expect(answer.denied).toEqual([{ at: 0, kind: 'postmortem', key: 'a.md', denial: ECargoStateDenial.ExtraReleaseVersion }]);
    });

    it('SC-MB-196 — версия из одних пробелов отбивается как отсутствие версии', async () => {
        const prisma: PrismaDouble = new PrismaDouble();
        prisma.postmortems.push({ treeId: TREE.id, key: 'a.md', state: ECargoState.Fixed, fixNote: 'статьёй правила' });

        const answer: ICargoStateResponse = await controllerWith(prisma).move(
            packet([{ kind: 'postmortem', key: 'a.md', state: 'released', releaseVersion: '   ' }]),
            requestOf()
        );

        expect(answer.denied).toEqual([{ at: 0, kind: 'postmortem', key: 'a.md', denial: ECargoStateDenial.NoReleaseVersion }]);
    });

    it('SC-MB-197 — версия ложится обоим родам записей за один пакет', async () => {
        const prisma: PrismaDouble = new PrismaDouble();
        prisma.postmortems.push({ treeId: TREE.id, key: 'a.md', state: ECargoState.Fixed, fixNote: 'статьёй правила' });
        prisma.proposals.push({ treeId: TREE.id, key: 'ab12cd34', state: ECargoState.Fixed, fixNote: 'гардом' });

        const answer: ICargoStateResponse = await controllerWith(prisma).move(
            packet([
                { kind: 'postmortem', key: 'a.md', state: 'released', releaseVersion: 'rt-agent-kit@0.10.1' },
                { kind: 'proposal', key: 'ab12cd34', state: 'released', releaseVersion: 'rt-agent-kit@0.10.1' },
            ]),
            requestOf()
        );

        expect(prisma.postmortems[0].releaseVersion).toBe('rt-agent-kit@0.10.1');
        expect(prisma.proposals[0].releaseVersion).toBe('rt-agent-kit@0.10.1');
        expect(answer.changed).toBe(2);
    });

    it('SC-MB-198 — отбитая строка не пишет ни состояния, ни версии', async () => {
        const prisma: PrismaDouble = new PrismaDouble();
        prisma.postmortems.push({ treeId: TREE.id, key: 'a.md', state: ECargoState.New });

        await controllerWith(prisma).move(
            packet([{ kind: 'postmortem', key: 'a.md', state: 'released', releaseVersion: 'rt-agent-kit@0.10.1' }]),
            requestOf()
        );

        expect(prisma.postmortems[0].state).toBe(ECargoState.New);
        expect(prisma.postmortems[0].releaseVersion).toBeUndefined();
    });

    it('SC-MB-199 — второй приезд версии затирает прежнюю', async () => {
        const prisma: PrismaDouble = new PrismaDouble();
        prisma.postmortems.push({ treeId: TREE.id, key: 'a.md', state: ECargoState.Fixed, fixNote: 'статьёй правила' });
        const controller: CargoStateController = controllerWith(prisma);

        await controller.move(
            packet([{ kind: 'postmortem', key: 'a.md', state: 'released', releaseVersion: 'rt-agent-kit@0.10.0' }]),
            requestOf()
        );
        await controller.move(
            packet([{ kind: 'postmortem', key: 'a.md', state: 'released', releaseVersion: 'rt-agent-kit@0.10.1' }]),
            requestOf()
        );

        expect(prisma.postmortems[0].releaseVersion).toBe('rt-agent-kit@0.10.1');
    });

    it('SC-MB-200 — правка версии при том же состоянии переведённой не считается', async () => {
        const prisma: PrismaDouble = new PrismaDouble();
        prisma.proposals.push({ treeId: TREE.id, key: 'ab12cd34', state: ECargoState.Released, releaseVersion: 'rt-agent-kit@0.10.0' });

        const answer: ICargoStateResponse = await controllerWith(prisma).move(
            packet([{ kind: 'proposal', key: 'ab12cd34', state: 'released', releaseVersion: 'rt-agent-kit@0.10.1' }]),
            requestOf()
        );

        expect(prisma.proposals[0].releaseVersion).toBe('rt-agent-kit@0.10.1');
        expect(answer.changed).toBe(0);
        expect(answer.same).toBe(1);
        expect(answer.denied).toEqual([]);
    });

    it('SC-MB-203 — строка с текстом починки и версией разом отбивается', async () => {
        const prisma: PrismaDouble = new PrismaDouble();
        prisma.postmortems.push({ treeId: TREE.id, key: 'a.md', state: ECargoState.Fixed, fixNote: 'статьёй правила' });

        const answer: ICargoStateResponse = await controllerWith(prisma).move(
            packet([
                { kind: 'postmortem', key: 'a.md', state: 'released', fixNote: 'второй правкой', releaseVersion: 'rt-agent-kit@0.10.1' },
            ]),
            requestOf()
        );

        expect(prisma.postmortems[0].state).toBe(ECargoState.Fixed);
        expect(prisma.postmortems[0].releaseVersion).toBeUndefined();
        expect(answer.denied).toEqual([{ at: 0, kind: 'postmortem', key: 'a.md', denial: ECargoStateDenial.ExtraFixNote }]);
    });

    it('SC-MB-201 — версия длиннее предела отбивает запрос целиком', async () => {
        const prisma: PrismaDouble = new PrismaDouble();
        prisma.postmortems.push({ treeId: TREE.id, key: 'a.md', state: ECargoState.Fixed, fixNote: 'статьёй правила' });

        await expect(
            controllerWith(prisma).move(
                packet([{ kind: 'postmortem', key: 'a.md', state: 'released', releaseVersion: 'в'.repeat(101) }]),
                requestOf()
            )
        ).rejects.toBeInstanceOf(BadRequestException);
        expect(prisma.postmortems[0].state).toBe(ECargoState.Fixed);
    });

    it('SC-MB-204 — отбой по недостающей версии попадает в журнал приёмника', async () => {
        const prisma: PrismaDouble = new PrismaDouble();
        prisma.postmortems.push({ treeId: TREE.id, key: 'a.md', state: ECargoState.Fixed, fixNote: 'статьёй правила' });
        const written: unknown[][] = [];
        const warn: MockInstance = vi.spyOn(Logger.prototype, 'warn').mockImplementation((...tail: unknown[]): void => {
            written.push(tail);
        });

        try {
            await controllerWith(prisma).move(packet([{ kind: 'postmortem', key: 'a.md', state: 'released' }]), requestOf());
        } finally {
            warn.mockRestore();
        }

        expect(written).toHaveLength(1);
        expect(written[0][0]).toBe('intake.state.denied');
        expect(written[0][1]).toEqual({ tree: TREE.slug, kind: 'postmortem', denial: ECargoStateDenial.NoReleaseVersion });
    });
});
