/**
 * Запросы о вызовах наружу: завести запись отправки и записать её исход.
 *
 * Запись заводится до попытки, а не после: вызов, который не ушёл вовсе, и вызов, отбитый
 * принимающей стороной, иначе выглядят одинаково — оба никак.
 *
 * Минута приезжает доводом, а не читается часами внутри: спека проверяет исход вызовом.
 */
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';

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
