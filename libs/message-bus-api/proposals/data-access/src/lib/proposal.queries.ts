/**
 * Предложения к записи месяца: копятся, а не замещаются.
 *
 * Сводка отвечает на вопрос «как дела сейчас», предложения — «что случилось за месяц». Дерево
 * при этом шлёт файл предложений целиком, и без отбора уже приехавшего каждый прогон заводил бы
 * копии всего накопленного.
 *
 * Отбор держит уникальность пары «дерево — признак», а не проверка чтением: два прогона
 * приезжают одновременно, и прочитанное первым устареет раньше, чем он допишет своё.
 */
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';
import { proposalDigest } from '@rt/message-bus-api/proposals/util';
import { IPage, IPageAsked, ITreeChoice, pageSkip, TPageDirection } from '@rt/message-bus-common';

/** Одно предложение, каким оно ложится в хранилище. */
export interface IProposalRow {
    readonly text: string;
    readonly address: string;
    readonly resource: string;
}

/**
 * Строка списка предложений.
 *
 * Текста предложения в ней нет: он отдаётся чтением одной записи. Дерево приезжает через запись
 * месяца — предложение крепится к ней, а не к дереву напрямую.
 */
export interface IProposalListRow {
    readonly id: string;
    readonly tree: ITreeChoice;
    readonly resource: string;
    readonly address: string;
    readonly arrivedAt: Date;
}

/** Предложение целиком — то, что показывает панель подробностей. */
export interface IProposalFullRow extends IProposalListRow {
    readonly text: string;
    /** Месяц записи, к которой предложение приехало: в строке списка его нет. */
    readonly month: string;
}

/** Первая ступень порядка. Вторая — всегда идентификатор записи, и её ставит сам запрос. */
type TProposalOrder =
    | { readonly arrivedAt: TPageDirection }
    | { readonly resource: TPageDirection }
    | { readonly address: TPageDirection }
    | { readonly record: { readonly tree: { readonly name: TPageDirection } } };

/** Порядок по названному полю. Дерево упорядочивается именем: признак человеку ни о чём не говорит. */
function orderOf(asked: IPageAsked): TProposalOrder {
    switch (asked.sort) {
        case 'resource':
            return { resource: asked.dir };
        case 'address':
            return { address: asked.dir };
        case 'tree':
            return { record: { tree: { name: asked.dir } } };
        default:
            return { arrivedAt: asked.dir };
    }
}

/** Отбор по дереву идёт через запись месяца: своей связи с деревом у предложения нет. */
function whereOf(asked: IPageAsked): { record?: { tree: { slug: string } } } {
    return asked.tree ? { record: { tree: { slug: asked.tree } } } : {};
}

/** Строка списка из того, что отдало хранилище: дерево лежит внутри записи месяца. */
function listRowOf(row: {
    id: string;
    resource: string;
    address: string;
    arrivedAt: Date;
    record: { tree: ITreeChoice };
}): IProposalListRow {
    return { id: row.id, tree: row.record.tree, resource: row.resource, address: row.address, arrivedAt: row.arrivedAt };
}

/**
 * Страница предложений.
 *
 * Общее число берётся вторым запросом, а не одной сделкой со строками: список, укоротившийся
 * между ними, — обычное дело, и ради снимка, который всё равно устареет к отрисовке, сделка
 * держала бы соединение дольше самого чтения.
 *
 * Порядок идёт двумя ступенями: предложения одного прогона приезжают с одним временем, и без
 * второго ключа одна и та же запись видна на двух страницах подряд, а соседняя не видна ни на
 * одной.
 */
export async function readProposals(prisma: PrismaService, asked: IPageAsked): Promise<IPage<IProposalListRow>> {
    const where: { record?: { tree: { slug: string } } } = whereOf(asked);
    const total: number = await prisma.proposal.count({ where });
    const rows: {
        id: string;
        resource: string;
        address: string;
        arrivedAt: Date;
        record: { tree: ITreeChoice };
    }[] = await prisma.proposal.findMany({
        where,
        select: {
            id: true,
            resource: true,
            address: true,
            arrivedAt: true,
            record: { select: { tree: { select: { slug: true, name: true } } } },
        },
        orderBy: [orderOf(asked), { id: asked.dir }],
        skip: pageSkip(asked),
        take: asked.size,
    });

    return { rows: rows.map(listRowOf), page: asked.page, size: asked.size, total };
}

/** Одно предложение целиком. Пусто — записи с таким признаком нет, и это отдельный ответ, а не пустая панель. */
export async function readProposal(prisma: PrismaService, id: string): Promise<IProposalFullRow | null> {
    const found: {
        id: string;
        text: string;
        resource: string;
        address: string;
        arrivedAt: Date;
        record: { month: string; tree: ITreeChoice };
    } | null = await prisma.proposal.findUnique({
        where: { id },
        select: {
            id: true,
            text: true,
            resource: true,
            address: true,
            arrivedAt: true,
            record: { select: { month: true, tree: { select: { slug: true, name: true } } } },
        },
    });

    return found ? { ...listRowOf(found), text: found.text, month: found.record.month } : null;
}

/** Чем кончилась вставка: сколько записей легло и сколько приехало повторно. */
export interface IProposalsWritten {
    readonly added: number;
    readonly known: number;
}

/**
 * Дописать к записи месяца те предложения, которых у дерева ещё не было.
 *
 * Все записи одной операции ложатся вместе: пять предложений, из которых упало третье, оставили
 * бы запись месяца в состоянии, которого не было ни до, ни после. Держится это одной командой
 * вставки — не пятью подряд.
 *
 * Уже приехавшее отбирается по паре «дерево — признак», а не по паре «запись месяца — текст»:
 * повтор приезжает в любом месяце, и граница месяца от него не защищает.
 */
export async function addProposals(
    prisma: PrismaService,
    recordId: string,
    treeId: string,
    items: readonly IProposalRow[]
): Promise<IProposalsWritten> {
    if (items.length === 0) {
        return { added: 0, known: 0 };
    }

    const written: { count: number } = await prisma.proposal.createMany({
        data: items.map((item: IProposalRow) => ({
            recordId,
            treeId,
            text: item.text,
            digest: proposalDigest(item.text),
            address: item.address,
            resource: item.resource,
        })),
        // Уже приехавшее пропускается, а не отбивает вставку: дерево шлёт файл целиком, и
        // повтор здесь — это правило, а не промах отправителя
        skipDuplicates: true,
    });

    return { added: written.count, known: items.length - written.count };
}
