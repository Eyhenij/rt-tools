/**
 * Запросы о вызовах наружу: завести запись отправки и записать её исход.
 *
 * Запись заводится до попытки, а не после: вызов, который не ушёл вовсе, и вызов, отбитый
 * принимающей стороной, иначе выглядят одинаково — оба никак.
 *
 * Минута приезжает доводом, а не читается часами внутри: спека проверяет исход вызовом.
 */
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';

import { IChatSiteRow, SITE_FIELDS } from './chat.queries';

/** Переписка, как её отдаёт хранилище будильнику: сторона последней реплики приходит списком. */
interface IStoredWakeRow {
    readonly id: string;
    readonly lastMessageAt: Date;
    readonly wokeAt: Date | null;
    readonly site: IChatSiteRow;
    readonly messages: readonly { readonly side: string }[];
}

/** Род события, уходящего наружу. Те же три слова, что и в хранилище. */
export type TChatHookKind = 'remark' | 'closing' | 'unanswered';

/** Заведённая запись отправки: по ней записывается исход попыток. */
export interface IChatHookCallRow {
    readonly id: string;
    readonly attempts: number;
}

/** Завести запись отправки: что уходит, о какой переписке и по какой площадке. */
export async function recordHookCall(
    prisma: PrismaService,
    site: string,
    conversation: string,
    kind: TChatHookKind,
    body: string,
    at: Date
): Promise<IChatHookCallRow> {
    return prisma.chatHookCall.create({
        data: { kind, body, siteId: site, conversationId: conversation, createdAt: at },
        select: { id: true, attempts: true },
    });
}

/** Записать принятый вызов: сколько попыток стоило и каким кодом ответили. */
export async function markHookCallDone(prisma: PrismaService, id: string, attempts: number, status: number, at: Date): Promise<void> {
    await prisma.chatHookCall.update({
        where: { id },
        data: { attempts, lastStatus: status, lastFault: '', deliveredAt: at },
    });
}

/**
 * Записать неудачную попытку: код ответа или причину словами, когда ответа не было вовсе.
 *
 * Принятой отправка от этого не становится: минута приёма остаётся пустой, и по ней видно, что
 * приложение вызов так и не взяло.
 */
export async function markHookCallFailed(
    prisma: PrismaService,
    id: string,
    attempts: number,
    status: number | null,
    fault: string
): Promise<void> {
    await prisma.chatHookCall.update({
        where: { id },
        data: { attempts, lastStatus: status, lastFault: fault },
    });
}

/** Переписка, которую смотрит будильник: чем её разбудить и что о ней уже известно. */
export interface IChatWakeRow {
    readonly id: string;
    readonly lastMessageAt: Date;
    readonly wokeAt: Date | null;
    readonly site: IChatSiteRow;
    /** Сторона последней реплики: по ней видно, ответил ли уже оператор. */
    readonly lastSide: string;
}

/**
 * Живые переписки площадок, у которых будильник включён.
 *
 * Решение, пора ли будить, здесь не принимается: его принимает чистая проверка слоя утилит, и
 * второй такой же ответ внутри запроса разошёлся бы с первым молча. Запрос только сужает круг —
 * площадка без условленного времени сюда не попадает вовсе.
 */
export async function talksToWake(prisma: PrismaService, limit: number): Promise<IChatWakeRow[]> {
    const rows: IStoredWakeRow[] = await prisma.chatConversation.findMany({
        where: { state: 'live', site: { answerWithin: { gt: 0 } } },
        orderBy: { lastMessageAt: 'asc' },
        take: limit,
        select: {
            id: true,
            lastMessageAt: true,
            wokeAt: true,
            site: { select: SITE_FIELDS },
            messages: { orderBy: { takenAt: 'desc' }, take: 1, select: { side: true } },
        },
    });

    return rows.map((row: IStoredWakeRow): IChatWakeRow => ({
        id: row.id,
        lastMessageAt: row.lastMessageAt,
        wokeAt: row.wokeAt,
        site: row.site,
        lastSide: row.messages[0]?.side ?? '',
    }));
}

/** Записать минуту, которой переписка разбудила оператора: второй раз по ней уже не будят. */
export async function markTalkWoken(prisma: PrismaService, id: string, at: Date): Promise<void> {
    await prisma.chatConversation.update({ where: { id }, data: { wokeAt: at } });
}
