import { describe, expect, it } from 'vitest';

import { PrismaService } from '@rt/message-bus-api/persistence/data-access';

import { readPostmortemVersions } from './postmortem.queries';

/** Версии, лежащие у разборов: числовые вперемешку с нечисловой. Пустых здесь нет — их отсеивает запрос. */
const STORED: readonly string[] = ['0.10.0', 'hotfix-3', '0.9.0'];

/**
 * Двойник хранилища: одна таблица, запоминающая, чем её спросили.
 *
 * Запомненный запрос проверяется наравне с ответом: собрать значения без повторов и без пустых —
 * работа хранилища, и двойник, отдающий готовое, доказывал бы её и тогда, когда запрос об этом не
 * просит вовсе.
 */
class PrismaDouble {
    public asked: Record<string, unknown> | null = null;

    public get postmortem(): Record<string, (args: Record<string, unknown>) => Promise<unknown>> {
        return {
            findMany: async (args: Record<string, unknown>): Promise<unknown> => {
                this.asked = args;

                return STORED.map((releaseVersion: string): { releaseVersion: string | null } => ({ releaseVersion }));
            },
        };
    }
}

describe('readPostmortemVersions', () => {
    it('SC-MB-240 — встретившиеся версии отдаются номерами по возрастанию, нечисловая — в конце', async () => {
        const double: PrismaDouble = new PrismaDouble();

        expect(await readPostmortemVersions(double as unknown as PrismaService)).toEqual(['0.9.0', '0.10.0', 'hotfix-3']);
    });

    it('SC-MB-240 — запрос просит хранилище отсеять пустые и свести повторы', async () => {
        const double: PrismaDouble = new PrismaDouble();

        await readPostmortemVersions(double as unknown as PrismaService);

        expect(double.asked).toMatchObject({ where: { releaseVersion: { not: null } }, distinct: ['releaseVersion'] });
    });
});
