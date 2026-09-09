/**
 * Чтение своих записей деревом: страница разборов вместе с текстом и починкой.
 *
 * Лежит рядом с общим чтением, а не в нём: файл общего чтения стоит у предела длины, и статья о
 * длине судит его целиком. Читает эту страницу не человек, а само дерево — по токену.
 */
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';
import { IPage, IPageAsked, pageSkip } from '@rt/message-bus-common';

import { IPostmortemFullRow, IPostmortemStored, postmortemListRowOf } from './postmortem.queries';

/** Что приносит запрос своей страницы: поля строки списка плюс текст и починка. */
type TOwnPostmortemStored = IPostmortemStored & { text: string; fixNote: string | null };

/**
 * Свои разборы дерева.
 *
 * Текст едет вместе со строкой: по нему запись сходится с пометкой надстройки на дереве, и вторым
 * запросом на каждую запись это стоило бы столько же, сколько сама страница. Отбор по дереву
 * ставит сам вызов, а не довод запроса: дерево берётся из токена.
 */
export async function readOwnPostmortems(prisma: PrismaService, slug: string, asked: IPageAsked): Promise<IPage<IPostmortemFullRow>> {
    const where: { tree: { slug: string } } = { tree: { slug } };
    const total: number = await prisma.postmortem.count({ where });
    const rows: TOwnPostmortemStored[] = await prisma.postmortem.findMany({
        where,
        select: {
            id: true,
            file: true,
            text: true,
            state: true,
            fixNote: true,
            releaseVersion: true,
            quarantineNote: true,
            closedByPublisher: true,
            arrivedAt: true,
            updatedAt: true,
            tree: { select: { slug: true, name: true } },
        },
        orderBy: [{ arrivedAt: 'desc' }, { id: 'desc' }],
        skip: pageSkip(asked),
        take: asked.size,
    });

    return {
        total,
        page: asked.page,
        size: asked.size,
        rows: rows.map((row: TOwnPostmortemStored): IPostmortemFullRow => ({
            ...postmortemListRowOf(row),
            text: row.text,
            fixNote: row.fixNote,
        })),
    };
}
