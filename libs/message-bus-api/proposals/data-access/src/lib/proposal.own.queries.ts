/**
 * Чтение своих записей деревом: страница предложений вместе с текстом и починкой.
 *
 * Лежит рядом с общим чтением, а не в нём: файл общего чтения стоит у предела длины, и статья о
 * длине судит его целиком. Читает эту страницу не человек, а само дерево — по токену.
 */
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';
import { IPage, IPageAsked, ITreeChoice, pageSkip } from '@rt/message-bus-common';

import { IProposalFullRow, IProposalStored, listRowOf } from './proposal.queries';

/** Что приносит запрос своей страницы: поля строки списка плюс текст, починка и запись месяца. */
type TOwnProposalStored = IProposalStored & { text: string; fixNote: string | null; record: { tree: ITreeChoice; month: string } };

/**
 * Свои предложения дерева.
 *
 * Текст едет вместе со строкой: по нему запись сходится с пометкой надстройки на дереве, и вторым
 * запросом на каждую запись это стоило бы столько же, сколько сама страница. Отбор по дереву
 * ставит сам вызов, а не довод запроса: дерево берётся из токена.
 */
export async function readOwnProposals(prisma: PrismaService, slug: string, asked: IPageAsked): Promise<IPage<IProposalFullRow>> {
    const where: { record: { tree: { slug: string } } } = { record: { tree: { slug } } };
    const total: number = await prisma.proposal.count({ where });
    const rows: TOwnProposalStored[] = await prisma.proposal.findMany({
        where,
        select: {
            id: true,
            resource: true,
            address: true,
            text: true,
            state: true,
            fixNote: true,
            releaseVersion: true,
            closedByPublisher: true,
            arrivedAt: true,
            record: { select: { month: true, tree: { select: { slug: true, name: true } } } },
        },
        orderBy: [{ arrivedAt: 'desc' }, { id: 'desc' }],
        skip: pageSkip(asked),
        take: asked.size,
    });

    return {
        total,
        page: asked.page,
        size: asked.size,
        rows: rows.map((row: TOwnProposalStored): IProposalFullRow => ({
            ...listRowOf(row),
            text: row.text,
            month: row.record.month,
            fixNote: row.fixNote,
        })),
    };
}
