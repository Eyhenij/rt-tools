/**
 * Разборы происшествий дерева: опознаются именем файла, приехавший повторно обновляет прежний.
 *
 * К записи месяца не крепятся: разбор правится на дереве после того, как уехал, и второй
 * экземпляр читался бы как второе происшествие. Исчезнувший на дереве у приёмника остаётся —
 * приёмник принимает, а не следит, и удаление по молчанию отправителя стёрло бы записи первого
 * же дерева, переставшего слать.
 */
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';
import { IPostmortemArrivalUpdate, postmortemArrivalUpdate } from '@rt/message-bus-api/postmortems/util';
import {
    cargoStateMove,
    cargoStateOf,
    cargoStateWrites,
    ECargoState,
    ECargoStateMove,
    ICargoStateAsk,
    ICargoStateOutcome,
    IPage,
    IPageAsked,
    ITreeChoice,
    pageSkip,
    TPageDirection,
} from '@rt/message-bus-common';

/** Один разбор, каким он ложится в хранилище. */
export interface IPostmortemRow {
    readonly file: string;
    readonly text: string;
}

/**
 * Строка списка разборов.
 *
 * Текста разбора в ней нет: разбор приезжает целиком, и страница, несущая тексты всех своих
 * строк, растёт весом без предела. Текст отдаёт чтение одной записи.
 */
export interface IPostmortemListRow {
    readonly id: string;
    readonly tree: ITreeChoice;
    readonly file: string;
    /** На каком шаге разбора стоит запись: пустым это поле не приезжает никогда. */
    readonly state: ECargoState;
    readonly arrivedAt: Date;
    readonly updatedAt: Date;
}

/** Разбор целиком — то, что показывает панель подробностей. */
export interface IPostmortemFullRow extends IPostmortemListRow {
    readonly text: string;
}

/** Первая ступень порядка. Вторая — всегда идентификатор записи, и её ставит сам запрос. */
type TPostmortemOrder =
    | { readonly arrivedAt: TPageDirection }
    | { readonly updatedAt: TPageDirection }
    | { readonly file: TPageDirection }
    | { readonly tree: { readonly name: TPageDirection } };

/** Порядок по названному полю. Дерево упорядочивается именем: признак человеку ни о чём не говорит. */
function orderOf(asked: IPageAsked): TPostmortemOrder {
    switch (asked.sort) {
        case 'updatedAt':
            return { updatedAt: asked.dir };
        case 'file':
            return { file: asked.dir };
        case 'tree':
            return { tree: { name: asked.dir } };
        default:
            return { arrivedAt: asked.dir };
    }
}

/** Отбор по дереву. Пусто — груз всех деревьев: учётная запись принадлежит службе, а не дереву. */
function whereOf(asked: IPageAsked): { tree?: { slug: string } } {
    return asked.tree ? { tree: { slug: asked.tree } } : {};
}

/**
 * Строка списка из того, что отдало хранилище.
 *
 * Состояние приезжает значением колонки и переводится в набор общей либы: набор объявлен дважды —
 * хранилищем и общей либой, — и читающая сторона знает только второй.
 */
function listRowOf(row: {
    id: string;
    file: string;
    state: string;
    arrivedAt: Date;
    updatedAt: Date;
    tree: ITreeChoice;
}): IPostmortemListRow {
    return {
        id: row.id,
        tree: row.tree,
        file: row.file,
        state: cargoStateOf(row.state),
        arrivedAt: row.arrivedAt,
        updatedAt: row.updatedAt,
    };
}

/**
 * Страница разборов.
 *
 * Общее число берётся вторым запросом, а не одной сделкой со строками: список, укоротившийся
 * между ними, — обычное дело, и ради снимка, который всё равно устареет к отрисовке, сделка
 * держала бы соединение дольше самого чтения.
 *
 * Порядок идёт двумя ступенями: разборы одного прогона приезжают с одним временем, и без второго
 * ключа одна и та же запись видна на двух страницах подряд, а соседняя не видна ни на одной.
 */
export async function readPostmortems(prisma: PrismaService, asked: IPageAsked): Promise<IPage<IPostmortemListRow>> {
    const where: { tree?: { slug: string } } = whereOf(asked);
    const total: number = await prisma.postmortem.count({ where });
    const rows: {
        id: string;
        file: string;
        state: string;
        arrivedAt: Date;
        updatedAt: Date;
        tree: ITreeChoice;
    }[] = await prisma.postmortem.findMany({
        where,
        select: { id: true, file: true, state: true, arrivedAt: true, updatedAt: true, tree: { select: { slug: true, name: true } } },
        orderBy: [orderOf(asked), { id: asked.dir }],
        skip: pageSkip(asked),
        take: asked.size,
    });

    return { rows: rows.map(listRowOf), page: asked.page, size: asked.size, total };
}

/** Один разбор целиком. Пусто — записи с таким признаком нет, и это отдельный ответ, а не пустая панель. */
export async function readPostmortem(prisma: PrismaService, id: string): Promise<IPostmortemFullRow | null> {
    const found: {
        id: string;
        file: string;
        text: string;
        state: string;
        arrivedAt: Date;
        updatedAt: Date;
        tree: ITreeChoice;
    } | null = await prisma.postmortem.findUnique({
        where: { id },
        select: {
            id: true,
            file: true,
            text: true,
            state: true,
            arrivedAt: true,
            updatedAt: true,
            tree: { select: { slug: true, name: true } },
        },
    });

    return found ? { ...listRowOf(found), text: found.text } : null;
}

/**
 * Тексты разборов, которые уже лежат: по ним решается, сбрасывать ли состояние.
 *
 * Читаются одним запросом на весь груз, а не по запросу на запись: прогон дерева везёт разборы
 * десятками, и запрос на каждый стоил бы столько же, сколько сама запись.
 */
async function storedTexts(prisma: PrismaService, treeId: string, items: readonly IPostmortemRow[]): Promise<Map<string, string>> {
    const rows: { file: string; text: string }[] = await prisma.postmortem.findMany({
        where: { treeId, file: { in: items.map((item: IPostmortemRow): string => item.file) } },
        select: { file: true, text: true },
    });

    return new Map(rows.map((row: { file: string; text: string }): [string, string] => [row.file, row.text]));
}

/**
 * Положить разборы дерева: каждый по своему имени файла заводится или обновляется.
 *
 * Все записи операции ложатся вместе или не ложатся вовсе, поэтому они идут одной сделкой:
 * упавший третий разбор оставил бы дерево в состоянии, которого не было ни до, ни после.
 * Одной командой это не выразить — обновление берёт текст каждой записи свой.
 *
 * Лежащие тексты читаются до сделки, потому что решение о сбросе состояния берёт оба текста
 * сразу, а команда обновления прежнего не видит. Два прогона одного дерева, разошедшиеся между
 * чтением и записью, дадут лишний сброс либо пропустят его: цена такой пары — одно состояние, а
 * не связность хранилища, и ради неё чтение с записью в одну сделку не сводятся.
 *
 * Возвращает, сколько разборов положено.
 */
export async function writePostmortems(prisma: PrismaService, treeId: string, items: readonly IPostmortemRow[]): Promise<number> {
    if (items.length === 0) {
        return 0;
    }

    const stored: Map<string, string> = await storedTexts(prisma, treeId, items);

    await prisma.$transaction(
        items.map((item: IPostmortemRow) => {
            const arrival: IPostmortemArrivalUpdate = postmortemArrivalUpdate(stored.get(item.file), item.text);

            return prisma.postmortem.upsert({
                where: { treeId_file: { treeId, file: item.file } },
                create: { treeId, file: item.file, text: item.text },
                update: arrival,
                select: { id: true },
            });
        })
    );

    return items.length;
}

/**
 * Перевести разборы дерева в названные состояния.
 *
 * Прежнее состояние читается из хранилища, а не берётся из запроса: между чтением дерева и его
 * правкой стоит сеть, и присланное прежнее состояние успевает устареть. Читается оно одним
 * запросом на весь пакет — дерево разбирает груз пачкой, и запрос на строку стоил бы столько
 * же, сколько сам разбор.
 *
 * Ложатся только разрешённые переходы, и все вместе: строка, отбитая порядком переходов, до
 * сделки не доходит вовсе. Исход возвращается по каждой строке — ответ дерева и строка журнала
 * собираются из него, а не считаются заново.
 */
export async function movePostmortemStates(
    prisma: PrismaService,
    treeId: string,
    asked: readonly ICargoStateAsk[]
): Promise<ICargoStateOutcome[]> {
    if (asked.length === 0) {
        return [];
    }

    const rows: { file: string; state: string }[] = await prisma.postmortem.findMany({
        where: { treeId, file: { in: asked.map((one: ICargoStateAsk): string => one.key) } },
        select: { file: true, state: true },
    });
    const stored: Map<string, ECargoState> = new Map(
        rows.map((row: { file: string; state: string }): [string, ECargoState] => [row.file, cargoStateOf(row.state)])
    );
    const judged: { ask: ICargoStateAsk; outcome: ICargoStateOutcome }[] = asked.map((ask: ICargoStateAsk) => {
        const was: ECargoState | undefined = stored.get(ask.key);
        const move: ECargoStateMove | null = was === undefined ? null : cargoStateMove(was, ask.state);

        return { ask, outcome: { key: ask.key, move } };
    });
    const written: ICargoStateAsk[] = judged
        .filter((one: { ask: ICargoStateAsk; outcome: ICargoStateOutcome }): boolean => cargoStateWrites(one.outcome.move, one.ask.fixNote))
        .map((one: { ask: ICargoStateAsk }): ICargoStateAsk => one.ask);

    if (written.length > 0) {
        await prisma.$transaction(
            written.map((ask: ICargoStateAsk) =>
                prisma.postmortem.update({
                    where: { treeId_file: { treeId, file: ask.key } },
                    data: ask.fixNote === null ? { state: ask.state } : { state: ask.state, fixNote: ask.fixNote },
                    select: { id: true },
                })
            )
        );
    }

    return judged.map((one: { outcome: ICargoStateOutcome }): ICargoStateOutcome => one.outcome);
}
