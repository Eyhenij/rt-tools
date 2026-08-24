import { BadRequestException, NotFoundException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';

import { PrismaService } from '@rt/message-bus-api/persistence/data-access';
import { IPostmortemFullRow, IPostmortemListRow } from '@rt/message-bus-api/postmortems/data-access';
import { ECargoState, IPage, PAGE_SIZE_DEFAULT, PAGE_SIZE_MAX } from '@rt/message-bus-common';

import { PostmortemsReadController } from './postmortems-read.controller';

/** Разбор в хранилище: то же, что в схеме, — двойник ничего не досочиняет. */
interface IStoredPostmortem {
    readonly id: string;
    readonly file: string;
    readonly text: string;
    /** Значение колонки состояния — строкой, как его и отдаёт хранилище. */
    readonly state: string;
    /** Версия выпуска. Пусто у записи, которую никто не выпускал, — а таких в хранилище большинство. */
    readonly releaseVersion: string | null;
    readonly arrivedAt: Date;
    readonly updatedAt: Date;
    readonly tree: { readonly slug: string; readonly name: string };
}

/** Сколько разборов лежит у каждого из двух деревьев. */
const OWN_COUNT: number = 15;
const OTHER_COUNT: number = 10;

/** Время, с которого разборы расставлены по минуте. Час стоит в прошлом: часы машины не читаются. */
const FIRST_AT: Date = new Date('2026-08-01T10:00:00Z');

/** Каждый пятый разбор взят в работу: иначе чтение, зашившее «новое», отвечало бы верно всегда. */
const IN_WORK_EVERY: number = 5;

/**
 * Починенные и выпущенные расставлены своими шагами.
 *
 * Три числа взаимно простые на длине хранилища, поэтому ни одна запись не попадает под два шага
 * сразу: состояние у записи одно, и наложение сделало бы фикстуру неоднозначной.
 */
const FIXED_EVERY: number = 7;
const RELEASED_EVERY: number = 11;

/**
 * Порядок значений колонки набора — тот, каким они объявлены в схеме хранилища.
 *
 * Написан здесь строкой, а не выведен из перечисления общей либы: хранилище упорядочивает набор
 * по своему объявлению, и спека проверяет именно его, а не копию рядом.
 */
const STATE_RANK: readonly string[] = ['new', 'in_work', 'fixed', 'released'];

/** Состояние записи по её номеру: шаги не пересекаются, поэтому порядок проверок значения не имеет. */
function stateAt(at: number): string {
    if (at === 0) {
        return 'new';
    }

    if (at % IN_WORK_EVERY === 0) {
        return 'in_work';
    }

    if (at % FIXED_EVERY === 0) {
        return 'fixed';
    }

    return at % RELEASED_EVERY === 0 ? 'released' : 'new';
}

/**
 * Версия выпуска по номеру записи: она есть только у выпущенных, как и в самом хранилище.
 *
 * Версии стоят в обратном порядке номеров нарочно: `0.9.0` лежит ниже `0.10.0` и по времени
 * приезда, и по признаку записи, — поэтому порядок по номерам версии отличим от обоих.
 */
function versionAt(at: number): string | null {
    if (stateAt(at) !== 'released') {
        return null;
    }

    return at === RELEASED_EVERY ? '0.10.0' : '0.9.0';
}

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
        case 'state':
            return STATE_RANK.indexOf(row.state);
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

    /**
     * Отбор: пусто в `where` — все деревья, все состояния и все версии, названное складывается.
     *
     * Версия сверяется вместе с пустотой: `null` в запросе — это отбор «без версии», а не снятый
     * отбор, и двойник, читающий пустоту как «всё равно», отвечал бы на него целым списком.
     * Перечень признаков стоит рядом с ними: им берётся страница в порядке по версии.
     */
    #picked(args: Record<string, unknown>): IStoredPostmortem[] {
        const where: { tree?: { slug: string }; state?: string; releaseVersion?: string | null; id?: { in: string[] } } =
            args['where'] ?? {};
        const slug: string | undefined = where.tree?.slug;
        const state: string | undefined = where.state;
        const version: string | null | undefined = where.releaseVersion;
        const ids: string[] | undefined = where.id?.in;

        return this.#rows.filter(
            (row: IStoredPostmortem): boolean =>
                (!slug || row.tree.slug === slug) &&
                (!state || row.state === state) &&
                (version === undefined || row.releaseVersion === version) &&
                (ids === undefined || ids.includes(row.id))
        );
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
            // Лежащие записи несут значение умолчания, а сдвинутые деревом — своё: так их и
            // отдаёт хранилище.
            state: stateAt(at),
            releaseVersion: versionAt(at),
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

    it('SC-MB-167 — разбор, с которым ничего не делали, читается строкой списка как новый', async () => {
        const answered: IPage<IPostmortemListRow> = await controller().page({ size: '1' });

        expect(answered.rows[0].state).toBe(ECargoState.New);
    });

    it('SC-MB-168 — состояние есть у каждой строки страницы, и пустого нет ни у одной', async () => {
        const answered: IPage<IPostmortemListRow> = await controller().page({ size: String(PAGE_SIZE_MAX) });
        const states: ECargoState[] = answered.rows.map((row: IPostmortemListRow): ECargoState => row.state);

        expect(states).toHaveLength(OWN_COUNT + OTHER_COUNT);
        expect(states.every((state: ECargoState): boolean => Object.values(ECargoState).includes(state))).toBe(true);
    });

    it('SC-MB-223 — отбор по состоянию сужает и строки, и общее число', async () => {
        const answered: IPage<IPostmortemListRow> = await controller().page({ state: 'in_work', size: String(PAGE_SIZE_MAX) });

        expect(answered.rows.map((row: IPostmortemListRow): string => row.id)).toEqual(['pm-20', 'pm-15', 'pm-10', 'pm-05']);
        expect(answered.total).toBe(4);
    });

    it('SC-MB-224 — пустой параметр состояния список не сужает', async () => {
        const answered: IPage<IPostmortemListRow> = await controller().page({ state: '', size: String(PAGE_SIZE_MAX) });

        expect(answered.total).toBe(OWN_COUNT + OTHER_COUNT);
    });

    it('SC-MB-225 — состояние и дерево сужают список вместе, а не по очереди', async () => {
        const answered: IPage<IPostmortemListRow> = await controller().page({
            state: 'in_work',
            tree: 'own-tree',
            size: String(PAGE_SIZE_MAX),
        });

        // У своего дерева лежат номера с нулевого по четырнадцатый: взятых в работу там двое.
        expect(answered.rows.map((row: IPostmortemListRow): string => row.id)).toEqual(['pm-10', 'pm-05']);
        expect(answered.total).toBe(2);
    });

    it('SC-MB-231 — порядок по состоянию идёт шагами разбора, а не алфавитом', async () => {
        const answered: IPage<IPostmortemListRow> = await controller().page({
            sort: 'state',
            dir: 'asc',
            size: String(PAGE_SIZE_MAX),
        });
        const seen: ECargoState[] = [];

        for (const row of answered.rows) {
            if (seen[seen.length - 1] !== row.state) {
                seen.push(row.state);
            }
        }

        expect(seen).toEqual([ECargoState.New, ECargoState.InWork, ECargoState.Fixed, ECargoState.Released]);
    });

    it('SC-MB-232 — слово вне набора состояний отбивается с именем параметра', async () => {
        await expect(controller().page({ state: 'починен-наверное' })).rejects.toBeInstanceOf(BadRequestException);
        await expect(controller().page({ state: 'починен-наверное' })).rejects.toThrow('параметр state');
    });

    it('SC-MB-237 — строка списка несёт версию выпуска: столбцу есть что показать', async () => {
        const answered: IPage<IPostmortemListRow> = await controller().page({ state: 'released', size: String(PAGE_SIZE_MAX) });

        expect(answered.rows.map((row: IPostmortemListRow): string | null => row.releaseVersion)).toEqual(['0.9.0', '0.10.0']);
    });

    it('SC-MB-238 — у записи, которую никто не выпускал, версия пуста, а не подставлена словом', async () => {
        const answered: IPage<IPostmortemListRow> = await controller().page({ state: 'new', size: '1' });

        expect(answered.rows[0]).toHaveProperty('releaseVersion');
        expect(answered.rows[0].releaseVersion).toBeNull();
    });

    it('SC-MB-241 — отбор по версии сужает и строки, и общее число', async () => {
        const answered: IPage<IPostmortemListRow> = await controller().page({ version: '0.10.0', size: String(PAGE_SIZE_MAX) });

        expect(answered.rows.map((row: IPostmortemListRow): string => row.id)).toEqual(['pm-11']);
        expect(answered.total).toBe(1);
    });

    it('SC-MB-242 — пустой параметр версии список не сужает', async () => {
        expect((await controller().page({ version: '', size: String(PAGE_SIZE_MAX) })).total).toBe(OWN_COUNT + OTHER_COUNT);
    });

    it('SC-MB-243 — «без версии» сужает список до записей, которых никто не выпускал', async () => {
        const answered: IPage<IPostmortemListRow> = await controller().page({ version: 'none', size: String(PAGE_SIZE_MAX) });

        expect(answered.total).toBe(OWN_COUNT + OTHER_COUNT - 2);
        expect(answered.rows.every((row: IPostmortemListRow): boolean => row.releaseVersion === null)).toBe(true);
    });

    it('SC-MB-244 — версия, состояние и дерево сужают список втроём, а не по очереди', async () => {
        const answered: IPage<IPostmortemListRow> = await controller().page({
            version: '0.9.0',
            state: 'released',
            tree: 'other-tree',
            size: String(PAGE_SIZE_MAX),
        });

        // Двадцать вторая запись лежит у чужого дерева: своему принадлежат первые пятнадцать.
        expect(answered.rows.map((row: IPostmortemListRow): string => row.id)).toEqual(['pm-22']);
        expect((await controller().page({ version: '0.9.0', tree: 'own-tree' })).total).toBe(0);
    });

    it('SC-MB-247 — версия, которой нет ни у одной записи, отдаёт пустую страницу, а не отказ', async () => {
        const answered: IPage<IPostmortemListRow> = await controller().page({ version: '9.9.9' });

        expect(answered.rows).toEqual([]);
        expect(answered.total).toBe(0);
    });

    it('SC-MB-249, SC-MB-251 — порядок по версии идёт номерами, а записи без версии стоят последними', async () => {
        const answered: IPage<IPostmortemListRow> = await controller().page({
            sort: 'releaseVersion',
            dir: 'asc',
            size: String(PAGE_SIZE_MAX),
        });
        const seen: (string | null)[] = answered.rows.map((row: IPostmortemListRow): string | null => row.releaseVersion);

        expect(seen.slice(0, 2)).toEqual(['0.9.0', '0.10.0']);
        expect(seen.slice(2).every((version: string | null): boolean => version === null)).toBe(true);
    });

    it('SC-MB-251 — убывание по версии ставит записи без версии первыми, а не последними', async () => {
        const answered: IPage<IPostmortemListRow> = await controller().page({
            sort: 'releaseVersion',
            dir: 'desc',
            size: String(PAGE_SIZE_MAX),
        });
        const seen: (string | null)[] = answered.rows.map((row: IPostmortemListRow): string | null => row.releaseVersion);

        expect(seen[0]).toBeNull();
        expect(seen.slice(-2)).toEqual(['0.10.0', '0.9.0']);
    });

    it('SC-MB-249 — страница в порядке по версии несёт ровно свой отрезок списка', async () => {
        const answered: IPage<IPostmortemListRow> = await controller().page({ sort: 'releaseVersion', dir: 'asc', size: '2' });

        expect(answered.rows.map((row: IPostmortemListRow): string => row.id)).toEqual(['pm-22', 'pm-11']);
        expect(answered.total).toBe(OWN_COUNT + OTHER_COUNT);
    });

    it('строка списка несёт то состояние, в котором запись лежит, а не одно на всех', async () => {
        const answered: IPage<IPostmortemListRow> = await controller().page({ size: String(PAGE_SIZE_MAX) });
        const inWork: IPostmortemListRow[] = answered.rows.filter((row: IPostmortemListRow): boolean => row.state === ECargoState.InWork);

        // Порядок по умолчанию ставит свежие сверху, поэтому имена идут от старшего номера.
        expect(inWork.map((row: IPostmortemListRow): string => row.id)).toEqual(['pm-20', 'pm-15', 'pm-10', 'pm-05']);
    });
});

describe('PostmortemsReadController.one', () => {
    it('SC-MB-52 — чтение одной записи несёт текст разбора целиком', async () => {
        const found: IPostmortemFullRow = await controller().one('pm-03');

        expect(found).toMatchObject({ id: 'pm-03', text: 'текст разбора номер 3' });
    });

    it('SC-MB-167 — чтение одной записи несёт то же состояние, что и строка списка', async () => {
        expect((await controller().one('pm-03')).state).toBe(ECargoState.New);
        expect((await controller().one('pm-05')).state).toBe(ECargoState.InWork);
    });

    it('SC-MB-71 — записи, которой нет, отвечает отказ, а не пустая запись', async () => {
        await expect(controller().one('pm-нет-такого')).rejects.toBeInstanceOf(NotFoundException);
    });
});
