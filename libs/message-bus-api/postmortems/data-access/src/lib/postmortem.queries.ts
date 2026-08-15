/**
 * Разборы происшествий дерева: опознаются именем файла, приехавший повторно обновляет прежний.
 *
 * К записи месяца не крепятся: разбор правится на дереве после того, как уехал, и второй
 * экземпляр читался бы как второе происшествие. Исчезнувший на дереве у приёмника остаётся —
 * приёмник принимает, а не следит, и удаление по молчанию отправителя стёрло бы записи первого
 * же дерева, переставшего слать.
 */
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';
import { IPage, IPageAsked, ITreeChoice, pageSkip, TPageDirection } from '@rt/message-bus-common';

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
    const rows: IPostmortemListRow[] = await prisma.postmortem.findMany({
        where,
        select: { id: true, file: true, arrivedAt: true, updatedAt: true, tree: { select: { slug: true, name: true } } },
        orderBy: [orderOf(asked), { id: asked.dir }],
        skip: pageSkip(asked),
        take: asked.size,
    });

    return { rows, total, page: asked.page, size: asked.size };
}

/** Один разбор целиком. Пусто — записи с таким признаком нет, и это отдельный ответ, а не пустая панель. */
export async function readPostmortem(prisma: PrismaService, id: string): Promise<IPostmortemFullRow | null> {
    return prisma.postmortem.findUnique({
        where: { id },
        select: {
            id: true,
            file: true,
            text: true,
            arrivedAt: true,
            updatedAt: true,
            tree: { select: { slug: true, name: true } },
        },
    });
}

/**
 * Положить разборы дерева: каждый по своему имени файла заводится или обновляется.
 *
 * Все записи операции ложатся вместе или не ложатся вовсе, поэтому они идут одной сделкой:
 * упавший третий разбор оставил бы дерево в состоянии, которого не было ни до, ни после.
 * Одной командой это не выразить — обновление берёт текст каждой записи свой.
 *
 * Возвращает, сколько разборов положено.
 */
export async function writePostmortems(prisma: PrismaService, treeId: string, items: readonly IPostmortemRow[]): Promise<number> {
    if (items.length === 0) {
        return 0;
    }

    await prisma.$transaction(
        items.map((item: IPostmortemRow) =>
            prisma.postmortem.upsert({
                where: { treeId_file: { treeId, file: item.file } },
                create: { treeId, file: item.file, text: item.text },
                update: { text: item.text },
                select: { id: true },
            })
        )
    );

    return items.length;
}
