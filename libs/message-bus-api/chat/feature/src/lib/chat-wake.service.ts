/**
 * Будильник переписок: кто замечает, что на разговор никто не ответил.
 *
 * Расписания в приёмнике нет, и заводить его ради одного обхода дороже, чем обойти самому: служба
 * смотрит переписки раз в минуту, пока приложение поднято. Условленное время площадок названо
 * минутами, и обход реже назвал бы опоздание позже, чем его считает площадка.
 *
 * Решение, пора ли будить, принимает чистая проверка слоя утилит: второй такой же ответ внутри
 * службы разошёлся бы с первым молча.
 */
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

import { IChatWakeRow, markTalkWoken, talksToWake } from '@rt/message-bus-api/chat/data-access';
import { CHAT_WAKE_BATCH, CHAT_WAKE_SWEEP_MS, chatWaitedMinutes, chatWakeDue, IChatWakeTalk } from '@rt/message-bus-api/chat/util';
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';
import { CHAT_SIDE_VISITOR } from '@rt/message-bus-common';

import { ChatHookService, IChatHookTarget, TChatHookSend } from './chat-hook.service';

@Injectable()
export class ChatWakeService implements OnModuleInit, OnModuleDestroy {
    readonly #prisma: PrismaService;
    readonly #hooks: ChatHookService;
    readonly #log: Logger = new Logger(ChatWakeService.name);
    #timer: NodeJS.Timeout | null = null;

    constructor(prisma: PrismaService, hooks: ChatHookService) {
        this.#prisma = prisma;
        this.#hooks = hooks;
    }

    /**
     * Обход заводится вместе с приложением и отпускает узел: таймер не держит процесс открытым,
     * и остановка приложения его не ждёт.
     */
    public onModuleInit(): void {
        this.#timer = setInterval((): void => {
            void this.sweep();
        }, CHAT_WAKE_SWEEP_MS);
        this.#timer.unref();
    }

    public onModuleDestroy(): void {
        if (this.#timer) {
            clearInterval(this.#timer);
            this.#timer = null;
        }
    }

    /**
     * Один обход: кого будить сейчас.
     *
     * Минута приезжает доводом, а не читается часами внутри: спека проверяет обход вызовом, а не
     * ожиданием условленного времени. Возвращает, сколько переписок разбудили.
     *
     * Минута будильника ставится и тогда, когда вызов не ушёл: иначе лежащее приложение получало
     * бы тот же вызов каждую минуту, а исход отправки и без того виден её записью.
     */
    public async sweep(at: Date = new Date(), send?: TChatHookSend, retryMs?: number): Promise<number> {
        const rows: IChatWakeRow[] = await talksToWake(this.#prisma, CHAT_WAKE_BATCH);
        let woken: number = 0;

        for (const row of rows) {
            const talk: IChatWakeTalk = {
                answerWithin: row.site.answerWithin,
                lastMessageAt: row.lastMessageAt,
                lastSideIsVisitor: row.lastSide === CHAT_SIDE_VISITOR,
                wokeAt: row.wokeAt,
                hours: { from: row.site.answerFrom, to: row.site.answerTo, timeZone: row.site.timeZone },
            };

            if (!chatWakeDue(talk, at)) {
                continue;
            }

            const target: IChatHookTarget = {
                id: row.site.id,
                key: row.site.key,
                hookUrl: row.site.hookUrl,
                hookSecret: row.site.hookSecret,
            };

            await this.#hooks.say(
                target,
                'unanswered',
                { conversationId: row.id, fields: { waitedMinutes: chatWaitedMinutes(talk, at) } },
                at,
                send,
                retryMs
            );
            await markTalkWoken(this.#prisma, row.id, at);
            woken += 1;
        }

        if (woken > 0) {
            this.#log.log({ event: 'chat-wake', woken });
        }

        return woken;
    }
}
