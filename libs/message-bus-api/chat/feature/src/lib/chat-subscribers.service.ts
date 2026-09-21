/**
 * Подписчики потока событий: кто сейчас читает и кому уходит пришедшая реплика.
 *
 * Живут в памяти поднятого приёмника, и это решение договорённости: приложение поднято одним
 * процессом, а общая шина стоила бы второй службы там, где расходы держат как можно ниже. Отсюда
 * же и обрыв: оборвавшуюся подписку служба не хранит — экран открывает её заново и добирает
 * пропущенное чтением, которое уже есть.
 *
 * Кому событие доходит, решает чистая проверка слоя утилит: второй такой же ответ внутри службы
 * разошёлся бы с первым молча.
 */
import { Injectable } from '@nestjs/common';
import { interval, map, merge, Observable, Subscriber } from 'rxjs';

import { IChatMessageEvent } from '@rt/message-bus-api/chat/api';
import { CHAT_BEAT_MS, eventReaches, IChatEventAddress, IChatSubscription } from '@rt/message-bus-api/chat/util';

/** Кадр потока: событие с репликой или сердцебиение, у которого тела нет. */
export interface IChatFrame {
    readonly data: IChatMessageEvent | string;
    readonly type?: string;
}

/** Кадр сердцебиения: он говорит только то, что соединение живо. */
const BEAT: IChatFrame = { type: 'beat', data: '' };

/** Открытая подписка: чем она закрыта и куда ей писать. */
interface IOpenStream {
    readonly subscription: IChatSubscription;
    readonly push: (frame: IChatFrame) => void;
}

@Injectable()
export class ChatSubscribersService {
    readonly #open: Map<number, IOpenStream> = new Map<number, IOpenStream>();
    #issued: number = 0;

    /** Сколько подписок открыто сейчас. Закрытая уходит отсюда, и писать в неё уже некуда. */
    public get openCount(): number {
        return this.#open.size;
    }

    /**
     * Открыть поток для одной подписки.
     *
     * Частота сердцебиения приезжает доводом, а не читается часами внутри: спека проверяет его
     * вызовом, а не ожиданием полминуты.
     */
    public stream(subscription: IChatSubscription, beatMs: number = CHAT_BEAT_MS): Observable<IChatFrame> {
        const events: Observable<IChatFrame> = new Observable<IChatFrame>((watcher: Subscriber<IChatFrame>): (() => void) => {
            this.#issued += 1;

            const id: number = this.#issued;

            this.#open.set(id, { subscription, push: (frame: IChatFrame): void => watcher.next(frame) });

            return (): void => {
                this.#open.delete(id);
            };
        });

        return merge(events, interval(beatMs).pipe(map((): IChatFrame => BEAT)));
    }

    /** Разнести пришедшую реплику по тем подпискам, до которых она доходит. */
    public send(address: IChatEventAddress, event: IChatMessageEvent): void {
        for (const open of this.#open.values()) {
            if (eventReaches(open.subscription, address)) {
                open.push({ data: event });
            }
        }
    }
}
