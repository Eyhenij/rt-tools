/**
 * Запись месяца: одна на пару «дерево — месяц». Нашлась — обновляется, не нашлась — заводится.
 *
 * Уникальность держит хранилище, а не проверка чтением: два прогона одного дерева приезжают
 * одновременно, и проверка их не развела бы. Проигравший гонку не отказывает, а обновляет
 * запись победителя — отказ на ожидаемом случае терял бы прогон.
 *
 * Запись заводится и предложениями, приехавшими раньше сводки: порядок запросов прогона
 * приёмник не назначает, а отказ «сводки ещё не было» превратил бы порядок в скрытое требование.
 */
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';
import { Prisma } from '@rt/message-bus-api/persistence/util';
import { IPage, IPageAsked, ITreeChoice, pageSkip, TCargoBody, TPageDirection } from '@rt/message-bus-common';

/** Чем кончилась запись: куда лёг груз и завела ли его эта операция. */
export interface IMonthRecordWritten {
    readonly id: string;
    readonly month: string;
    /** Запись месяца заведена этим запросом, а не обновлена. */
    readonly created: boolean;
}

/** Что знает о прогоне всякий род груза: чьё дерево, какой месяц, какой версией назвался. */
export interface IMonthRecordInput {
    readonly treeId: string;
    readonly month: string;
    readonly schema: string;
    readonly ranAt: Date;
}

/**
 * Была ли запись до этого прогона.
 *
 * Читается ДО записи: `upsert` не говорит, завёл он строку или обновил, а ответ приёмника
 * называет это дереву кодом. Цена — один лишний запрос на прогон; проигравший гонку прочитает
 * «не было» и ответит как заводящий, но запись при этом останется одна, и это ровно то, что
 * обещано.
 */
async function existedBefore(prisma: PrismaService, treeId: string, month: string): Promise<boolean> {
    const found: { id: string } | null = await prisma.monthRecord.findUnique({
        where: { treeId_month: { treeId, month } },
        select: { id: true },
    });

    return found !== null;
}

/**
 * Сводка последнего прогона замещает прежнюю целиком.
 *
 * Счётчики, снимок надстроек и невыбранное берутся из последнего прогона: отрезок сводки короче
 * месяца, окна прогонов перекрываются, и сложение завышало бы числа молча, а повтор после
 * обрыва связи — удваивал.
 */
export async function writeMonthSummary(
    prisma: PrismaService,
    input: IMonthRecordInput & { summary: TCargoBody }
): Promise<IMonthRecordWritten> {
    const existed: boolean = await existedBefore(prisma, input.treeId, input.month);
    // Приведение одно и стоит здесь, на границе с хранилищем: тело сводки приехало снаружи, и
    // формы у него нет никакой — колонка `jsonb` принимает его как есть, а тип генератора
    // описывает то же самое своими именами.
    const summary: Prisma.InputJsonObject = input.summary as Prisma.InputJsonObject;

    const record: { id: string } = await prisma.monthRecord.upsert({
        where: { treeId_month: { treeId: input.treeId, month: input.month } },
        create: {
            treeId: input.treeId,
            month: input.month,
            summary,
            schema: input.schema,
            ranAt: input.ranAt,
        },
        update: { summary, schema: input.schema, ranAt: input.ranAt },
        select: { id: true },
    });

    return { id: record.id, month: input.month, created: !existed };
}

/**
 * Запись месяца под груз, который сводкой не является.
 *
 * Сводку не трогает вовсе: предложение, приехавшее вторым прогоном, не должно стирать картину,
 * снятую первым. Время прогона при этом сдвигается — по нему видно, отчитывается ли дерево, а
 * отчитывается оно и предложениями тоже.
 */
export async function ensureMonthRecord(prisma: PrismaService, input: IMonthRecordInput): Promise<IMonthRecordWritten> {
    const existed: boolean = await existedBefore(prisma, input.treeId, input.month);

    const record: { id: string } = await prisma.monthRecord.upsert({
        where: { treeId_month: { treeId: input.treeId, month: input.month } },
        create: { treeId: input.treeId, month: input.month, schema: input.schema, ranAt: input.ranAt },
        update: { schema: input.schema, ranAt: input.ranAt },
        select: { id: true },
    });

    return { id: record.id, month: input.month, created: !existed };
}

/**
 * Строка списка записей месяца.
 *
 * Сводки целиком в ней нет: приёмник её не разбирает, и лежит она телом произвольной формы —
 * страница, несущая тела всех своих строк, растёт весом без предела. Наружу из неё выносится
 * одно число заходов: им человек отличает месяц с работой от месяца, где дерево только
 * отчиталось.
 */
export interface IMonthRecordListRow {
    readonly id: string;
    readonly tree: ITreeChoice;
    readonly month: string;
    /** Заходов за месяц. Пусто — сводки в этом месяце ещё не было: запись завёл другой род груза. */
    readonly sessions: number | null;
    readonly schema: string;
    readonly ranAt: Date;
}

/** Запись месяца целиком — то, что показывает панель подробностей. */
export interface IMonthRecordFullRow extends IMonthRecordListRow {
    /** Сводка последнего прогона как приехала. Пусто — сводки в этом месяце ещё не было. */
    readonly summary: unknown;
}

/** Первая ступень порядка. Вторая — всегда идентификатор записи, и её ставит сам запрос. */
type TMonthRecordOrder =
    { readonly ranAt: TPageDirection } | { readonly month: TPageDirection } | { readonly tree: { readonly name: TPageDirection } };

/** Порядок по названному полю. Дерево упорядочивается именем: признак человеку ни о чём не говорит. */
function orderOf(asked: IPageAsked): TMonthRecordOrder {
    switch (asked.sort) {
        case 'month':
            return { month: asked.dir };
        case 'tree':
            return { tree: { name: asked.dir } };
        default:
            return { ranAt: asked.dir };
    }
}

/** Отбор по дереву. Пусто — груз всех деревьев: учётная запись принадлежит службе, а не дереву. */
function whereOf(asked: IPageAsked): { tree?: { slug: string } } {
    return asked.tree ? { tree: { slug: asked.tree } } : {};
}

/**
 * Число заходов из тела сводки.
 *
 * Тело приехало снаружи и формы не имеет никакой: поле читается формой, а не приведением, и
 * всё, что читается не числом, отвечает пустотой — колонка списка, показавшая чужую строку
 * числом, врала бы молча.
 */
function sessionsOf(summary: unknown): number | null {
    if (typeof summary !== 'object' || summary === null) {
        return null;
    }

    const counted: unknown = Reflect.get(summary, 'sessions');

    return typeof counted === 'number' ? counted : null;
}

/** Строка списка из того, что отдало хранилище: тело сводки сюда не проходит, только число заходов. */
function listRowOf(row: {
    id: string;
    month: string;
    schema: string;
    ranAt: Date;
    summary: unknown;
    tree: ITreeChoice;
}): IMonthRecordListRow {
    return { id: row.id, tree: row.tree, month: row.month, sessions: sessionsOf(row.summary), schema: row.schema, ranAt: row.ranAt };
}

/**
 * Страница записей месяца.
 *
 * Тело сводки хранилище отдаёт, а ответ — нет: колонка со счётчиками лежит внутри тела, и взять
 * её, не прочитав тела, нечем. Читается оно ровно по странице — двадцать записей, а не весь
 * список, — и наружу из него уходит одно число.
 *
 * Общее число берётся вторым запросом, а не одной сделкой со строками: список, укоротившийся
 * между ними, — обычное дело, и ради снимка, который всё равно устареет к отрисовке, сделка
 * держала бы соединение дольше самого чтения.
 */
export async function readMonthRecords(prisma: PrismaService, asked: IPageAsked): Promise<IPage<IMonthRecordListRow>> {
    const where: { tree?: { slug: string } } = whereOf(asked);
    const total: number = await prisma.monthRecord.count({ where });
    const rows: { id: string; month: string; schema: string; ranAt: Date; summary: unknown; tree: ITreeChoice }[] =
        await prisma.monthRecord.findMany({
            where,
            select: {
                id: true,
                month: true,
                schema: true,
                ranAt: true,
                summary: true,
                tree: { select: { slug: true, name: true } },
            },
            orderBy: [orderOf(asked), { id: asked.dir }],
            skip: pageSkip(asked),
            take: asked.size,
        });

    return { rows: rows.map(listRowOf), total, page: asked.page, size: asked.size };
}

/** Одна запись месяца целиком. Пусто — записи с таким признаком нет, и это отдельный ответ, а не пустая панель. */
export async function readMonthRecord(prisma: PrismaService, id: string): Promise<IMonthRecordFullRow | null> {
    const found: { id: string; month: string; schema: string; ranAt: Date; summary: unknown; tree: ITreeChoice } | null =
        await prisma.monthRecord.findUnique({
            where: { id },
            select: {
                id: true,
                month: true,
                schema: true,
                ranAt: true,
                summary: true,
                tree: { select: { slug: true, name: true } },
            },
        });

    return found ? { ...listRowOf(found), summary: found.summary } : null;
}
