import { computed, inject, Injectable, Signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ChatApiService } from '@rt/message-bus-admin/chat/api';
import { chatSendAnswered, chatSentMessage, IChat } from '@rt/message-bus-admin/chat/util';
import { IReadFault } from '@rt/message-bus-admin/common/core/util';
import { IPage } from '@rt/message-bus-common';
import { BASE_INITIAL_STATE, BaseAsyncStoreService, IStateBase } from '@rt-tools/store';
import { catchError, concatMap, EMPTY, Observable, Subject, switchMap, tap } from 'rxjs';

/** Что знает лента: выбранный разговор, его сообщения и чем кончилось чтение. */
export interface IChatFeedState extends IStateBase.Async {
    readonly talkId: string;
    readonly messages: readonly IChat.Message.State[];
    readonly fault: IReadFault | null;
}

/** Сообщения шины стора: по ним экран узнаёт, что лента прочитана. */
export type TChatFeedMessage = 'feed-read';

/** Отправка ответа: в какой разговор, какой текст и каким признаком он показан до ответа сервиса. */
interface ISending {
    readonly talkId: string;
    readonly text: string;
    readonly sentId: string;
}

const INITIAL_STATE: IChatFeedState = { ...BASE_INITIAL_STATE.ASYNC, talkId: '', messages: [], fault: null };

/**
 * Лента выбранного разговора и отправка ответа.
 *
 * Отправленная реплика встаёт в ленту сразу, до ответа сервиса: оператор отвечает нескольким
 * разговорам подряд, и поле, которое ждёт сервис, читается как потерянная реплика. Ответ сервиса
 * её подтверждает или помечает отбитой — отбитую из ленты не убирают, иначе набранный текст
 * пропадает.
 *
 * Чтение ленты идёт `switchMap`: человек открывает соседний разговор, не дождавшись первого.
 * Отправка — `concatMap`: две реплики подряд должны уйти в том порядке, в каком их набрали.
 */
@Injectable({ providedIn: 'root' })
export class ChatFeedStore extends BaseAsyncStoreService<IChatFeedState, TChatFeedMessage> {
    readonly #api: ChatApiService = inject(ChatApiService);
    readonly #readSource: Subject<string> = new Subject<string>();
    readonly #sendSource: Subject<ISending> = new Subject<ISending>();

    #issued: number = 0;

    public readonly talkId: Signal<string> = computed(() => this.store().talkId);
    public readonly messages: Signal<readonly IChat.Message.State[]> = computed(() => this.store().messages);
    public readonly fault: Signal<IReadFault | null> = computed(() => this.store().fault);

    constructor() {
        super(INITIAL_STATE);

        this.#readSource
            .pipe(
                tap((talkId: string): void => {
                    this.patchState((state: IChatFeedState) => ({ ...state, talkId, messages: [], fault: null }));
                    this.startLoading();
                }),
                switchMap((talkId: string): Observable<IPage<IChat.Message.State>> =>
                    this.#api.feed(talkId, { page: 1, size: 100, since: '' }).pipe(
                        tap((page: IPage<IChat.Message.State>): void => {
                            this.patchState((state: IChatFeedState) => ({ ...state, messages: page.rows }));
                            this.setLoadingSuccess();
                            this.dispatch({ type: 'feed-read' });
                        }),
                        catchError((fault: IReadFault): Observable<never> => {
                            this.#refuse(fault);

                            return EMPTY;
                        })
                    )
                ),
                takeUntilDestroyed()
            )
            .subscribe();

        this.#sendSource
            .pipe(
                concatMap((sending: ISending): Observable<IChat.Message.State> =>
                    this.#api.answer(sending.talkId, sending.text).pipe(
                        tap((taken: IChat.Message.State): void => this.#answered(sending.sentId, taken)),
                        catchError((): Observable<never> => {
                            this.#answered(sending.sentId, null);

                            return EMPTY;
                        })
                    )
                ),
                takeUntilDestroyed()
            )
            .subscribe();
    }

    /** Прочитать ленту разговора с начала. */
    public read(talkId: string): void {
        this.#readSource.next(talkId);
    }

    /** Ответить посетителю. Реплика видна сразу, признак у неё свой, временный. */
    public send(talkId: string, text: string, at: string): void {
        this.#issued += 1;

        const sentId: string = `свой-${this.#issued}`;

        this.patchState((state: IChatFeedState) => ({ ...state, messages: [...state.messages, chatSentMessage(sentId, text, at)] }));
        this.#sendSource.next({ talkId, text, sentId });
    }

    /** Пришедшая из потока реплика: она встаёт в ленту открытого разговора и больше ничего. */
    public arrived(message: IChat.Message.State): void {
        this.patchState((state: IChatFeedState) => ({ ...state, messages: [...state.messages, message] }));
    }

    /** Ответ сервиса об отправленной реплике: принята или отбита. */
    #answered(sentId: string, taken: IChat.Message.State | null): void {
        this.patchState((state: IChatFeedState) => ({ ...state, messages: chatSendAnswered(state.messages, sentId, taken) }));
    }

    /** Отказ чтения в состояние: человек видит его на месте ленты. */
    #refuse(fault: IReadFault): void {
        this.patchState((state: IChatFeedState) => ({ ...state, messages: [], fault }));
        this.setLoadingFailureVoid(fault, { showNotification: false });
    }
}
