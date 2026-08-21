import { BadRequestException, NotFoundException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';

import { PrismaService } from '@rt/message-bus-api/persistence/data-access';
import { IProposalFullRow, IProposalListRow } from '@rt/message-bus-api/proposals/data-access';
import { ECargoState, IPage } from '@rt/message-bus-common';

import { ProposalsReadController } from './proposals-read.controller';

/** Предложение в хранилище: дерево лежит внутри записи месяца, своей связи с деревом у него нет. */
interface IStoredProposal {
    readonly id: string;
    readonly text: string;
    readonly address: string;
    readonly resource: string;
    /** Значение колонки состояния — строкой, как его и отдаёт хранилище. */
    readonly state: string;
    readonly arrivedAt: Date;
    readonly record: { readonly month: string; readonly tree: { readonly slug: string; readonly name: string } };
}

const OWN: { slug: string; name: string } = { slug: 'own-tree', name: 'Своё дерево' };
const OTHER: { slug: string; name: string } = { slug: 'other-tree', name: 'Чужое дерево' };

/** Время приезда первого предложения. Час стоит в прошлом: часы машины не читаются. */
const FIRST_AT: Date = new Date('2026-08-02T09:00:00Z');

function selectOf(args: Record<string, unknown>): Record<string, unknown> {
    return (args['select'] ?? {}) as Record<string, unknown>;
}

/** Ровно те поля, что названы в `select`, — вложенные тоже. */
function projected(row: object, select: Record<string, unknown>): Record<string, unknown> {
    const taken: Record<string, unknown> = {};

    for (const field of Object.keys(select)) {
        const asked: unknown = select[field];
        const value: unknown = Reflect.get(row, field);

        if (asked === true) {
            taken[field] = value;
        } else if (typeof asked === 'object' && asked !== null && typeof value === 'object' && value !== null) {
            taken[field] = projected(value, (Reflect.get(asked, 'select') ?? {}) as Record<string, unknown>);
        }
    }

    return taken;
}

/**
 * Двойник хранилища.
 *
 * Отбор через запись месяца, порядок и набор полей он делает сам: спека обещает то, что приёмник
 * отдаёт человеку, а не форму запроса, которую он собрал.
 */
class PrismaDouble {
    readonly #rows: readonly IStoredProposal[];

    constructor(rows: readonly IStoredProposal[]) {
        this.#rows = rows;
    }

    public get proposal(): Record<string, (args: Record<string, unknown>) => Promise<unknown>> {
        return {
            count: async (args: Record<string, unknown>): Promise<unknown> => this.#picked(args).length,
            findMany: async (args: Record<string, unknown>): Promise<unknown> => this.#page(args),
            findUnique: async (args: Record<string, unknown>): Promise<unknown> => this.#one(args),
        };
    }

    /**
     * Отбор: дерево берётся через запись месяца, состояние лежит колонкой самого предложения.
     *
     * Пусто в `where` — все деревья и все состояния; названное складывается, а не заменяет.
     */
    #picked(args: Record<string, unknown>): IStoredProposal[] {
        const where: { record?: { tree: { slug: string } }; state?: string } = args['where'] ?? {};
        const slug: string | undefined = where.record?.tree.slug;
        const state: string | undefined = where.state;

        return this.#rows.filter(
            (row: IStoredProposal): boolean => (!slug || row.record.tree.slug === slug) && (!state || row.state === state)
        );
    }

    #page(args: Record<string, unknown>): Record<string, unknown>[] {
        const skip: number = Number(args['skip'] ?? 0);
        const take: number = Number(args['take'] ?? this.#rows.length);
        const sorted: IStoredProposal[] = [...this.#picked(args)].sort(
            (left: IStoredProposal, right: IStoredProposal): number => right.arrivedAt.getTime() - left.arrivedAt.getTime()
        );

        return sorted.slice(skip, skip + take).map((row: IStoredProposal): Record<string, unknown> => projected(row, selectOf(args)));
    }

    #one(args: Record<string, unknown>): Record<string, unknown> | null {
        const where: { id?: string } = args['where'] ?? {};
        const found: IStoredProposal | undefined = this.#rows.find((row: IStoredProposal): boolean => row.id === where.id);

        return found ? projected(found, selectOf(args)) : null;
    }
}

/** Хранилище: четыре предложения у двух деревьев, свежие — у чужого. */
function storage(): PrismaService {
    const rows: IStoredProposal[] = [
        {
            id: 'pr-1',
            text: 'дописать в правило строку о втором ключе порядка',
            address: 'пакет',
            resource: 'rules/testing.md',
            state: 'new',
            arrivedAt: FIRST_AT,
            record: { month: '2026-08', tree: OWN },
        },
        {
            id: 'pr-2',
            text: 'завести паттерн под списочный экран',
            address: 'дерево',
            resource: 'patterns/list-screen.md',
            // Взятое в разбор: иначе чтение, зашившее «новое», отвечало бы верно всегда.
            state: 'in_work',
            arrivedAt: new Date(FIRST_AT.getTime() + 60_000),
            record: { month: '2026-08', tree: OWN },
        },
        {
            id: 'pr-3',
            text: 'разнести закон о доступе и правило под него',
            address: 'компаньон',
            resource: 'laws/access.md',
            // Починенное: без третьего состояния отбор проверялся бы на двух словах из четырёх.
            state: 'fixed',
            arrivedAt: new Date(FIRST_AT.getTime() + 120_000),
            record: { month: '2026-08', tree: OTHER },
        },
        {
            id: 'pr-4',
            text: 'снять с правила строку, которую не исполняет ничто',
            address: 'пакет',
            resource: 'rules/doc-style.md',
            state: 'new',
            arrivedAt: new Date(FIRST_AT.getTime() + 180_000),
            record: { month: '2026-07', tree: OTHER },
        },
    ];

    return new PrismaDouble(rows) as unknown as PrismaService;
}

function controller(): ProposalsReadController {
    return new ProposalsReadController(storage());
}

describe('ProposalsReadController.page', () => {
    it('SC-MB-62 — страница несёт строки и общее число записей', async () => {
        const answered: IPage<IProposalListRow> = await controller().page({ size: '2' });

        expect(answered.rows).toHaveLength(2);
        expect(answered).toMatchObject({ page: 1, size: 2, total: 4 });
    });

    it('SC-MB-64 — неразобранный размер страницы отбивается с именем параметра и границами', async () => {
        await expect(controller().page({ size: 'много' })).rejects.toBeInstanceOf(BadRequestException);
        await expect(controller().page({ size: 'много' })).rejects.toThrow('параметр size ожидается целым числом от 1 до');
    });

    it('SC-MB-68 — отбор по признаку дерева идёт через запись месяца и сужает общее число', async () => {
        const answered: IPage<IProposalListRow> = await controller().page({ tree: 'other-tree' });

        expect(answered.total).toBe(2);
        expect(answered.rows.every((row: IProposalListRow): boolean => row.tree.slug === 'other-tree')).toBe(true);
    });

    it('SC-MB-68 — строка списка называет дерево именем, а не одним признаком', async () => {
        const answered: IPage<IProposalListRow> = await controller().page({ size: '1' });

        expect(answered.rows[0].tree).toEqual(OTHER);
    });

    it('SC-MB-53 — строка списка несёт ресурс и адрес, а текста предложения не несёт', async () => {
        const answered: IPage<IProposalListRow> = await controller().page({ size: '1' });

        expect(answered.rows[0]).toMatchObject({ resource: 'rules/doc-style.md', address: 'пакет' });
        expect(answered.rows[0]).not.toHaveProperty('text');
    });

    it('SC-MB-167 — предложение, с которым ничего не делали, читается строкой списка как новое', async () => {
        const answered: IPage<IProposalListRow> = await controller().page({ size: '1' });

        expect(answered.rows[0].state).toBe(ECargoState.New);
    });

    it('SC-MB-168 — состояние есть у каждой строки страницы, и пустого нет ни у одной', async () => {
        const answered: IPage<IProposalListRow> = await controller().page({});
        const states: ECargoState[] = answered.rows.map((row: IProposalListRow): ECargoState => row.state);

        expect(states).toHaveLength(4);
        expect(states.every((state: ECargoState): boolean => Object.values(ECargoState).includes(state))).toBe(true);
    });

    it('SC-MB-223 — отбор по состоянию сужает и строки, и общее число', async () => {
        const answered: IPage<IProposalListRow> = await controller().page({ state: 'fixed' });

        expect(answered.rows.map((row: IProposalListRow): string => row.id)).toEqual(['pr-3']);
        expect(answered.total).toBe(1);
    });

    it('SC-MB-224 — пустой параметр состояния список не сужает', async () => {
        expect((await controller().page({ state: '' })).total).toBe(4);
    });

    it('SC-MB-225 — состояние и дерево сужают список вместе, а не по очереди', async () => {
        const answered: IPage<IProposalListRow> = await controller().page({ state: 'new', tree: 'own-tree' });

        expect(answered.rows.map((row: IProposalListRow): string => row.id)).toEqual(['pr-1']);
        expect(answered.total).toBe(1);
    });

    it('SC-MB-232 — слово вне набора состояний отбивается с именем параметра', async () => {
        await expect(controller().page({ state: 'разобрано-наполовину' })).rejects.toBeInstanceOf(BadRequestException);
        await expect(controller().page({ state: 'разобрано-наполовину' })).rejects.toThrow('параметр state');
    });

    it('строка списка несёт то состояние, в котором запись лежит, а не одно на всех', async () => {
        const answered: IPage<IProposalListRow> = await controller().page({});
        const inWork: IProposalListRow[] = answered.rows.filter((row: IProposalListRow): boolean => row.state === ECargoState.InWork);

        expect(inWork.map((row: IProposalListRow): string => row.id)).toEqual(['pr-2']);
    });
});

describe('ProposalsReadController.one', () => {
    it('SC-MB-52 — чтение одной записи несёт текст предложения и месяц его записи', async () => {
        const found: IProposalFullRow = await controller().one('pr-1');

        expect(found).toMatchObject({
            id: 'pr-1',
            text: 'дописать в правило строку о втором ключе порядка',
            month: '2026-08',
            tree: OWN,
        });
    });

    it('SC-MB-71 — записи, которой нет, отвечает отказ, а не пустая запись', async () => {
        await expect(controller().one('pr-нет-такого')).rejects.toBeInstanceOf(NotFoundException);
    });
});
