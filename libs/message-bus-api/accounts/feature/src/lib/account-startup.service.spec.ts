import { Logger } from '@nestjs/common';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { PrismaService } from '@rt/message-bus-api/persistence/data-access';

import { AccountStartupService } from './account-startup.service';

/** Двойник хранилища: считает записи и больше ничего — подъёму службы нужно ровно это число. */
function storage(counted: number): PrismaService {
    return { account: { count: async (): Promise<number> => counted } } as unknown as PrismaService;
}

/**
 * Журнал приёмника: строки уходят логгером каркаса, и спека читает их с его прототипа. Своего
 * выхода у подъёма нет — заводить его ради спеки значило бы проверять не то, что работает.
 */
function journal(): string[] {
    const written: string[] = [];

    vi.spyOn(Logger.prototype, 'warn').mockImplementation((message: unknown): void => {
        written.push(String(message));
    });

    return written;
}

afterEach((): void => {
    vi.restoreAllMocks();
});

describe('AccountStartupService', () => {
    it('SC-MB-61, SC-MB-389 — пустое хранилище оставляет в журнале строку о том, что записей нет и чем заводится первая', async () => {
        const written: string[] = journal();

        await new AccountStartupService(storage(0)).onApplicationBootstrap();

        expect(written).toHaveLength(1);
        expect(written[0]).toContain('учётных записей нет ни одной');
        expect(written[0]).toContain('экраном первичной настройки');
        expect(written[0]).not.toContain('account:add');
    });

    it('SC-MB-61 — при заведённой записи служба о них молчит', async () => {
        const written: string[] = journal();

        await new AccountStartupService(storage(1)).onApplicationBootstrap();

        expect(written).toEqual([]);
    });
});
