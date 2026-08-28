import { describe, expect, it } from 'vitest';

import { PrismaService } from '@rt/message-bus-api/persistence/data-access';

import { IProposalListRow, readProposals } from './proposal.queries';
import { readProposalVersions } from './proposal.queries';

/** Версии, лежащие у предложений: числовые вперемешку с нечисловой. Пустых здесь нет — их отсеивает запрос. */
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

    public get proposal(): Record<string, (args: Record<string, unknown>) => Promise<unknown>> {
        return {
            findMany: async (args: Record<string, unknown>): Promise<unknown> => {
                this.asked = args;

                return STORED.map((releaseVersion: string): { releaseVersion: string | null } => ({ releaseVersion }));
            },
        };
    }
}

describe('readProposalVersions', () => {
    it('SC-MB-240 — встретившиеся версии отдаются номерами по возрастанию, нечисловая — в конце', async () => {
        const double: PrismaDouble = new PrismaDouble();

        expect(await readProposalVersions(double as unknown as PrismaService)).toEqual(['0.9.0', '0.10.0', 'hotfix-3']);
    });

    it('SC-MB-240 — запрос просит хранилище отсеять пустые и свести повторы', async () => {
        const double: PrismaDouble = new PrismaDouble();

        await readProposalVersions(double as unknown as PrismaService);

        expect(double.asked).toMatchObject({ where: { releaseVersion: { not: null } }, distinct: ['releaseVersion'] });
    });
});

/**
 * Двойник для чтения страницы: одна таблица, отдающая одну строку и запоминающая запрос.
 *
 * Запомненный запрос проверяется наравне с ответом: поле, которого запрос не просил, хранилище не
 * отдаёт вовсе — а перевод строки, собранный из готового объекта, был бы зелен и тогда.
 */
class PageDouble {
    public asked: Record<string, unknown> | null = null;

    public get proposal(): Record<string, (args: Record<string, unknown>) => Promise<unknown>> {
        return {
            count: async (): Promise<number> => 1,
            findMany: async (args: Record<string, unknown>): Promise<unknown> => {
                this.asked = args;

                return [
                    {
                        id: 'p-1',
                        resource: 'rules/git-workflow',
                        address: 'статья о череде заявок',
                        state: 'released',
                        releaseVersion: 'rt-agent-kit@0.17.0',
                        closedByPublisher: true,
                        arrivedAt: new Date('2026-08-01T00:00:00.000Z'),
                        record: { tree: { slug: 'neighbour', name: 'Соседнее дерево' } },
                    },
                ];
            },
        };
    }
}

describe('readProposals', () => {
    it('SC-MB-273 — строка списка несёт признак того, что запись закрыл издатель', async () => {
        const double: PageDouble = new PageDouble();

        const page: { rows: readonly IProposalListRow[] } = await readProposals(
            double as unknown as PrismaService,
            {
                page: 1,
                size: 20,
                sort: 'arrivedAt',
                dir: 'desc',
            } as Parameters<typeof readProposals>[1]
        );

        expect(page.rows[0].closedByPublisher).toBe(true);
        expect((double.asked?.['select'] as Record<string, boolean>)['closedByPublisher']).toBe(true);
    });
});
