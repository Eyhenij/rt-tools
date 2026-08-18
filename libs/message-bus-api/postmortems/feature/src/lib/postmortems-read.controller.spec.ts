import { BadRequestException, NotFoundException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';

import { PrismaService } from '@rt/message-bus-api/persistence/data-access';
import { IPostmortemFullRow, IPostmortemListRow } from '@rt/message-bus-api/postmortems/data-access';
import { IPage, PAGE_SIZE_DEFAULT, PAGE_SIZE_MAX } from '@rt/message-bus-common';

import { PostmortemsReadController } from './postmortems-read.controller';

/** Разбор в хранилище: то же, что в схеме, — двойник ничего не досочиняет. */
interface IStoredPostmortem {
    readonly id: string;
    readonly file: string;
    readonly text: string;
    readonly arrivedAt: Date;
    readonly updatedAt: Date;
    readonly tree: { readonly slug: string; readonly name: string };
}

/** Сколько разборов лежит у каждого из двух деревьев. */
const OWN_COUNT: number = 15;
const OTHER_COUNT: number = 10;

/** Время, с которого разборы расставлены по минуте. Час стоит в прошлом: часы машины не читаются. */
const FIRST_AT: Date = new Date('2026-08-01T10:00:00Z');

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

function keyOf(row: IStoredPostmortem, field: string): string | number {
    switch (field) {
        case 'tree':
            return row.tree.name;
        case 'file':
            return row.file;
        case 'updatedAt':
            return row.updatedAt.getTime();
        case 'id':
            return row.id;
        default:
            return row.arrivedAt.getTime();
    }
}

/** Сравнение по ступеням порядка: первая ступень решает, вторая разводит равных. */
function compare(left: IStoredPostmortem, right: IStoredPostmortem, steps: readonly Record<string, unknown>[]): number {
    for (const step of steps) {
        const field: string = Object.keys(step)[0];
        const asked: unknown = step[field];
        const named: unknown = typeof asked === 'string' ? asked : Reflect.get(asked as object, 'name');
        const dir: number = named === 'asc' ? 1 : -1;
        const at: string | number = keyOf(left, field);
        const to: string | number = keyOf(right, field);
        const decided: number = dir * (at < to ? -1 : at > to ? 1 : 0);

        if (decided !== 0) {
            return decided;
        }
    }

    return 0;
}

/**
 * Двойник хранилища.
 *
 * Отбор, порядок, отрезок страницы и набор полей он делает сам: спека обещает то, что приёмник
 * отдаёт человеку, а не форму запроса, которую он собрал. Особенно набор полей — утверждение
 * «текста разбора в строке списка нет» доказывает что-то только тогда, когда двойник честно
 * отдаёт ровно запрошенное.
 */
class PrismaDouble {
    readonly #rows: readonly IStoredPostmortem[];

    constructor(rows: readonly IStoredPostmortem[]) {
        this.#rows = rows;
    }

    public get postmortem(): Record<string, (args: Record<string, unknown>) => Promise<unknown>> {
        return {
            count: async (args: Record<string, unknown>): Promise<unknown> => this.#picked(args).length,
            findMany: async (args: Record<string, unknown>): Promise<unknown> => this.#page(args),
            findUnique: async (args: Record<string, unknown>): Promise<unknown> => this.#one(args),
        };
    }

    /** Отбор по дереву: пусто в `where` — все деревья. */
    #picked(args: Record<string, unknown>): IStoredPostmortem[] {
        const where: { tree?: { slug: string } } = args['where'] ?? {};
        const slug: string | undefined = where.tree?.slug;

        return this.#rows.filter((row: IStoredPostmortem): boolean => !slug || row.tree.slug === slug);
    }

    #page(args: Record<string, unknown>): Record<string, unknown>[] {
        const steps: Record<string, unknown>[] = (args['orderBy'] ?? []) as Record<string, unknown>[];
        const skip: number = Number(args['skip'] ?? 0);
        const take: number = Number(args['take'] ?? this.#rows.length);
        const sorted: IStoredPostmortem[] = [...this.#picked(args)].sort((left: IStoredPostmortem, right: IStoredPostmortem): number =>
            compare(left, right, steps)
        );

        return sorted.slice(skip, skip + take).map((row: IStoredPostmortem): Record<string, unknown> => projected(row, selectOf(args)));
    }

    #one(args: Record<string, unknown>): Record<string, unknown> | null {
        const where: { id?: string } = args['where'] ?? {};
        const found: IStoredPostmortem | undefined = this.#rows.find((row: IStoredPostmortem): boolean => row.id === where.id);

        return found ? projected(found, selectOf(args)) : null;
    }
}

/**
 * Хранилище: двадцать пять разборов у двух деревьев.
 *
 * Первые два приехали в одну и ту же минуту — на них проверяется, что порядок разводится вторым
 * ключом. Остальные расставлены по минуте вперёд.
 */
function storage(): PrismaService {
    const rows: IStoredPostmortem[] = [];

    for (let at: number = 0; at < OWN_COUNT + OTHER_COUNT; at += 1) {
        const own: boolean = at < OWN_COUNT;
        // Первые два разбора приехали одновременно: у них одно и то же время приезда.
        const minutes: number = at === 0 ? 0 : at - 1;

        rows.push({
            id: `pm-${String(at).padStart(2, '0')}`,
            file: `docs/postmortems/промах-${at}.md`,
            text: `текст разбора номер ${at}`,
            arrivedAt: new Date(FIRST_AT.getTime() + minutes * 60_000),
            updatedAt: new Date(FIRST_AT.getTime() + minutes * 60_000),
            tree: own ? { slug: 'own-tree', name: 'Своё дерево' } : { slug: 'other-tree', name: 'Чужое дерево' },
        });
    }

    return new PrismaDouble(rows) as unknown as PrismaService;
}

function controller(): PostmortemsReadController {
    return new PostmortemsReadController(storage());
}

/** Все страницы подряд одним размером: так видно, кто виден дважды и кто не виден ни разу. */
async function sweep(size: number): Promise<string[]> {
    const seen: string[] = [];
    const read: PostmortemsReadController = controller();
    const pages: number = Math.ceil((OWN_COUNT + OTHER_COUNT) / size);

    for (let page: number = 1; page <= pages; page += 1) {
        const answered: IPage<IPostmortemListRow> = await read.page({ page: String(page), size: String(size) });

        seen.push(...answered.rows.map((row: IPostmortemListRow): string => row.id));
    }

    return seen;
}

describe('PostmortemsReadController.page', () => {
    it('SC-MB-62 — страница без размера несёт умолчание и общее число записей', async () => {
        const answered: IPage<IPostmortemListRow> = await controller().page({});

        expect(answered.rows).toHaveLength(PAGE_SIZE_DEFAULT);
        expect(answered).toMatchObject({ page: 1, size: PAGE_SIZE_DEFAULT, total: OWN_COUNT + OTHER_COUNT });
    });

    it('SC-MB-62 — размер выше предела отвечает пределом и тем же общим числом', async () => {
        const answered: IPage<IPostmortemListRow> = await controller().page({ size: '100000' });

        expect(answered.size).toBe(PAGE_SIZE_MAX);
        expect(answered.rows).toHaveLength(OWN_COUNT + OTHER_COUNT);
        expect(answered.total).toBe(OWN_COUNT + OTHER_COUNT);
    });

    it('SC-MB-63 — страница за пределом списка пуста, несёт общее число и отказом не является', async () => {
        const answered: IPage<IPostmortemListRow> = await controller().page({ page: '50', size: '10' });

        expect(answered.rows).toEqual([]);
        expect(answered.total).toBe(OWN_COUNT + OTHER_COUNT);
    });

    it('SC-MB-64 — неразобранный номер страницы отбивается с именем параметра и границами', async () => {
        await expect(controller().page({ page: 'вторая' })).rejects.toBeInstanceOf(BadRequestException);
        await expect(controller().page({ page: 'вторая' })).rejects.toThrow('параметр page ожидается целым числом от 1');
    });

    it('SC-MB-64 — незнакомое поле порядка отбивается перечислением знакомых', async () => {
        await expect(controller().page({ sort: 'вес' })).rejects.toThrow('параметр sort ожидается одним из');
    });

    it('SC-MB-65 — записи с равным временем приезда видны ровно на одной странице каждая', async () => {
        const seen: string[] = await sweep(3);

        expect(seen).toHaveLength(OWN_COUNT + OTHER_COUNT);
        expect(new Set(seen).size).toBe(OWN_COUNT + OTHER_COUNT);
    });

    it('SC-MB-65 — порядок по умолчанию ставит свежие сверху', async () => {
        const answered: IPage<IPostmortemListRow> = await controller().page({ size: '3' });
        const times: number[] = answered.rows.map((row: IPostmortemListRow): number => row.arrivedAt.getTime());

        expect(times).toEqual([...times].sort((left: number, right: number): number => right - left));
    });

    it('SC-MB-68 — отбор по признаку дерева сужает и строки, и общее число', async () => {
        const answered: IPage<IPostmortemListRow> = await controller().page({ tree: 'other-tree' });

        expect(answered.total).toBe(OTHER_COUNT);
        expect(answered.rows.every((row: IPostmortemListRow): boolean => row.tree.slug === 'other-tree')).toBe(true);
    });

    it('SC-MB-68 — строка списка называет дерево именем, а не одним признаком', async () => {
        const answered: IPage<IPostmortemListRow> = await controller().page({ size: '1' });

        expect(answered.rows[0].tree).toEqual({ slug: 'other-tree', name: 'Чужое дерево' });
    });

    it('SC-MB-53 — строка списка несёт свойства разбора, а текста его не несёт', async () => {
        const answered: IPage<IPostmortemListRow> = await controller().page({ size: '1' });

        expect(answered.rows[0]).toHaveProperty('file');
        expect(answered.rows[0]).not.toHaveProperty('text');
    });
});

describe('PostmortemsReadController.one', () => {
    it('SC-MB-52 — чтение одной записи несёт текст разбора целиком', async () => {
        const found: IPostmortemFullRow = await controller().one('pm-03');

        expect(found).toMatchObject({ id: 'pm-03', text: 'текст разбора номер 3' });
    });

    it('SC-MB-71 — записи, которой нет, отвечает отказ, а не пустая запись', async () => {
        await expect(controller().one('pm-нет-такого')).rejects.toBeInstanceOf(NotFoundException);
    });
});
