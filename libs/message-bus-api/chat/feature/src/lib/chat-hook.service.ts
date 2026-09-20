/**
 * Отправитель вызовов наружу: кто говорит приложению площадки о том, что случилось в чате.
 *
 * Дорога наружу у сервиса одна, и она здесь. Сам человека сервис не будит: ни почты, ни
 * мессенджера у него нет — приложение площадки решает, чем поднять оператора.
 *
 * Отправка не держит ответ посетителю: зовущая сторона отправку не ждёт, а исход её читается из
 * записи, а не из успеха вызова. Успех вызова говорит только то, что запрос ушёл.
 */
import { Injectable, Logger } from '@nestjs/common';

import {
    IChatHookCallRow,
    markHookCallDone,
    markHookCallFailed,
    recordHookCall,
    TChatHookKind,
} from '@rt/message-bus-api/chat/data-access';
import {
    CHAT_HOOK_ATTEMPTS,
    CHAT_HOOK_RETRY_MS,
    CHAT_HOOK_SIGNATURE_HEADER,
    chatHookReady,
    chatHookSignature,
    IChatHookSite,
} from '@rt/message-bus-api/chat/util';
import { PrismaService } from '@rt/message-bus-api/persistence/data-access';

/** Площадка, какой её знает отправитель: чем звать и чем подписывать. */
export interface IChatHookTarget extends IChatHookSite {
    readonly id: string;
    readonly key: string;
}

/** Что уходит в вызове сверх рода события и площадки. */
export interface IChatHookEvent {
    readonly conversationId: string;
    /** Поля события: реплика, сторона, минута — каждое событие своё. */
    readonly fields: Readonly<Record<string, unknown>>;
}

/** Чем отправитель зовёт чужой узел. Доводом — чтобы спека проверяла исход вызовом. */
export type TChatHookSend = (url: string, body: string, signature: string) => Promise<number>;

/** Исход отправки: ушло или нет, сколько попыток стоило и чем кончилась последняя. */
export interface IChatHookOutcome {
    readonly delivered: boolean;
    readonly attempts: number;
    readonly status: number | null;
    readonly fault: string;
}

/** Площадка вызовов не получает: адреса нет или он не подписан — отправлять нечего. */
const SILENT: IChatHookOutcome = { delivered: false, attempts: 0, status: null, fault: '' };

/** Ответ принимающей стороны считается принятым по коду ответа, а не по тому, что он пришёл. */
function taken(status: number): boolean {
    return status >= 200 && status < 300;
}

/** Отправка чужому узлу запросом. Его же подменяет спека: сети в ней нет. */
async function overNetwork(url: string, body: string, signature: string): Promise<number> {
    const answer: Response = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json', [CHAT_HOOK_SIGNATURE_HEADER]: signature },
        body,
    });

    return answer.status;
}

/** Ожидание между попытками. Спека зовёт с нулём и не ждёт ничего. */
async function waitMs(ms: number): Promise<void> {
    if (ms <= 0) {
        return;
    }

    await new Promise<void>((done: () => void): void => {
        setTimeout(done, ms);
    });
}

@Injectable()
export class ChatHookService {
    readonly #prisma: PrismaService;
    readonly #log: Logger = new Logger(ChatHookService.name);

    constructor(prisma: PrismaService) {
        this.#prisma = prisma;
    }

    /**
     * Сказать приложению площадки о событии.
     *
     * Площадка без адреса или без тайны молчит: это её законное состояние, а не поломка. Запись
     * отправки заводится до первой попытки — иначе вызов, который не ушёл, не отличить от
     * вызова, которого не было.
     */
    public async say(
        site: IChatHookTarget,
        kind: TChatHookKind,
        event: IChatHookEvent,
        at: Date,
        send: TChatHookSend = overNetwork,
        retryMs: number = CHAT_HOOK_RETRY_MS
    ): Promise<IChatHookOutcome> {
        if (!chatHookReady(site)) {
            return SILENT;
        }

        const body: string = JSON.stringify({
            kind,
            site: site.key,
            conversationId: event.conversationId,
            at: at.toISOString(),
            ...event.fields,
        });
        const signature: string = chatHookSignature(site.hookSecret, body);
        const call: IChatHookCallRow = await recordHookCall(this.#prisma, site.id, event.conversationId, kind, body, at);

        return this.#push(call.id, site, body, signature, send, retryMs);
    }

    /**
     * Попытки одной отправки.
     *
     * Повтор ограничен пределом сервиса: без предела адрес лежащего приложения держится вечно.
     * Отказ принимающей стороны и молчание сети разведены — код ответа или причина словами.
     */
    async #push(
        id: string,
        site: IChatHookTarget,
        body: string,
        signature: string,
        send: TChatHookSend,
        retryMs: number
    ): Promise<IChatHookOutcome> {
        let status: number | null = null;
        let fault: string = '';

        for (let attempt: number = 1; attempt <= CHAT_HOOK_ATTEMPTS; attempt += 1) {
            try {
                status = await send(site.hookUrl, body, signature);
                fault = '';

                if (taken(status)) {
                    await markHookCallDone(this.#prisma, id, attempt, status, new Date());

                    return { delivered: true, attempts: attempt, status, fault };
                }
            } catch (thrown: unknown) {
                status = null;
                fault = thrown instanceof Error ? thrown.message : String(thrown);
            }

            await markHookCallFailed(this.#prisma, id, attempt, status, fault);

            if (attempt < CHAT_HOOK_ATTEMPTS) {
                await waitMs(retryMs);
            }
        }

        this.#log.warn({ call: id, site: site.key, status, fault });

        return { delivered: false, attempts: CHAT_HOOK_ATTEMPTS, status, fault };
    }
}
