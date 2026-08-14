import { ServiceUnavailableException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { describe, expect, it } from 'vitest';

import { PrismaService } from '@rt/message-bus-api/persistence/data-access';

import { HealthController } from './health.controller';

/** Двойник клиента хранилища: живой Postgres спеке не нужен — она про ответ пробы, а не про базу. */
function moduleWith(alive: boolean): Promise<TestingModule> {
    return Test.createTestingModule({
        controllers: [HealthController],
        providers: [{ provide: PrismaService, useValue: { isAlive: (): Promise<boolean> => Promise.resolve(alive) } }],
    }).compile();
}

describe('проба живости', () => {
    it('SC-MB-17 — отвечает без токена дерева, когда хранилище отвечает', async () => {
        const module: TestingModule = await moduleWith(true);

        await expect(module.get(HealthController).check()).resolves.toEqual({ status: 'ok' });
    });

    it('SC-MB-18 — в ответе нет ни редакции, ни имён составных частей', async () => {
        const module: TestingModule = await moduleWith(true);
        const answer: { status: string } = await module.get(HealthController).check();

        expect(Object.keys(answer)).toEqual(['status']);
    });

    it('SC-MB-29 — молчит, пока хранилище не отвечает', async () => {
        const module: TestingModule = await moduleWith(false);

        await expect(module.get(HealthController).check()).rejects.toBeInstanceOf(ServiceUnavailableException);
    });
});
