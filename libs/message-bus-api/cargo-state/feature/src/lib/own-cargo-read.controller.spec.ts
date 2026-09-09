import { BadRequestException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';

import { IOwnCargoResponse } from '@rt/message-bus-api/cargo-state/api';
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';
import { ITreeBearingRequest, rememberTree } from '@rt/message-bus-api/trees/util';

import { OwnCargoReadController } from './own-cargo-read.controller';

/** Дерево запроса: его признак приходит из токена, а не из довода. */
const OWN: string = 'своё-дерево';
const FOREIGN: string = 'чужое-дерево';

/** Одна запись хранилища: колонки те же, что читает своя страница. */
interface IStored {
    readonly slug: string;
    readonly id: string;
    readonly file: string;
    readonly text: string;
    readonly state: string;
    readonly fixNote: string | null;
    readonly releaseVersion: string | null;
}

const STORED: readonly IStored[] = [
    {
        slug: OWN,
        id: 'p-1',
        file: '2026-08-12-своя.md',
        text: 'Текст своего разбора.',
        state: 'released',
        fixNote: 'статья правила о слоге',
        releaseVersion: '0.27.0',
    },
    { slug: OWN, id: 'p-2', file: '2026-08-13-вторая.md', text: 'Второй свой разбор.', state: 'new', fixNote: null, releaseVersion: null },
    { slug: FOREIGN, id: 'p-3', file: '2026-08-14-чужая.md', text: 'Чужой разбор.', state: 'new', fixNote: null, releaseVersion: null },
];

/**
 * Двойник хранилища: отбор по дереву он исполняет сам.
 *
 * Иначе проба зеленела бы на управлении, которое условие не поставило: строки пришли бы все, а
 * ответ выглядел бы отобранным.
 */
class PrismaDouble {
    public get postmortem(): Record<string, (args: Record<string, unknown>) => Promise<unknown>> {
        return {
            count: async (args: Record<string, unknown>): Promise<unknown> => this.#mine(args).length,
            findMany: async (args: Record<string, unknown>): Promise<unknown> =>
                this.#mine(args).map((row: IStored): Record<string, unknown> => ({
                    id: row.id,
                    file: row.file,
                    text: row.text,
                    state: row.state,
                    fixNote: row.fixNote,
                    releaseVersion: row.releaseVersion,
                    closedByPublisher: false,
                    arrivedAt: new Date('2026-08-12T10:00:00Z'),
                    updatedAt: new Date('2026-08-12T10:00:00Z'),
                    tree: { slug: row.slug, name: row.slug },
                })),
        };
    }

    public get proposal(): Record<string, (args: Record<string, unknown>) => Promise<unknown>> {
        return { count: async (): Promise<unknown> => 0, findMany: async (): Promise<unknown> => [] };
    }

    #mine(args: Record<string, unknown>): readonly IStored[] {
        const where: { tree?: { slug?: string } } = args['where'] ?? {};
        const slug: string = where.tree?.slug ?? '';

        return STORED.filter((row: IStored): boolean => row.slug === slug);
    }
}

function controller(): OwnCargoReadController {
    return new OwnCargoReadController(new PrismaDouble() as unknown as PrismaService);
}

/** Запрос с опознанным деревом: кладёт его тем же вызовом, каким кладёт проверка токена. */
function asked(slug: string = OWN): ITreeBearingRequest {
    const request: ITreeBearingRequest = {};

    rememberTree(request, { id: 'id-дерева', slug, name: slug });

    return request;
}

describe('OwnCargoReadController.mine', () => {
    it('SC-MB-318 — дерево читает свои записи по токену, и у каждой стоит состояние', async () => {
        const answered: IOwnCargoResponse = await controller().mine({ kind: 'postmortem' }, asked());

        expect(answered.rows.map((row): string => row.name)).toEqual(['2026-08-12-своя.md', '2026-08-13-вторая.md']);
        expect(answered.rows.every((row): boolean => Boolean(row.state))).toBe(true);
        expect(answered.total).toBe(2);
    });

    it('SC-MB-319 — записи соседа не уезжают по имени в запросе', async () => {
        const answered: IOwnCargoResponse = await controller().mine({ kind: 'postmortem', tree: FOREIGN }, asked());

        expect(answered.rows.map((row): string => row.name)).not.toContain('2026-08-14-чужая.md');
        expect(answered.rows).toHaveLength(2);
    });

    it('SC-MB-320 — у выпущенной записи ответ несёт починку и версию выпуска', async () => {
        const answered: IOwnCargoResponse = await controller().mine({ kind: 'postmortem' }, asked());

        expect(answered.rows[0]).toMatchObject({ fixNote: 'статья правила о слоге', releaseVersion: '0.27.0' });
        expect(answered.rows[1]).toMatchObject({ fixNote: null, releaseVersion: null });
    });

    it('SC-MB-322 — дерево без записей отвечает пустой страницей, а не отказом', async () => {
        const answered: IOwnCargoResponse = await controller().mine({ kind: 'postmortem' }, asked('дерево-без-груза'));

        expect(answered.rows).toEqual([]);
        expect(answered.total).toBe(0);
    });

    it('SC-MB-318 — неназванный род отбивается с именем параметра, а не подставляется молча', async () => {
        await expect(controller().mine({}, asked())).rejects.toBeInstanceOf(BadRequestException);
        await expect(controller().mine({}, asked())).rejects.toThrow('параметр kind');
    });
});
