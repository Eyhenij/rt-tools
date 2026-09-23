/**
 * Обращения встраиваемой страницы к операциям сервиса.
 *
 * Операции те же по смыслу, что читает панель оператора, а закрыты иначе: не входом человека, а
 * признаком страницы, и адреса у них свои. Признак едет полем запроса у чтений и полем тела у
 * записей — тем же приёмом, каким у виджета едет признак посетителя.
 *
 * Разбор ответа берётся готовым у раздела чата: второй перевод строки списка и реплики разошёлся бы
 * с первым молча — и показался бы репликой, вставшей в ленту не той стороной. Предел ожидания и
 * разбор отказа берутся у общего слоя, там же, где их берут все обращения дерева.
 */
import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ChatMessageMapper, ChatTalkMapper, IChat } from '@rt/message-bus-admin/chat/util';
import { asReadFault, asSpokenFault, READ_TIMEOUT_MS } from '@rt/message-bus-admin/common/core/api';
import {
    CHAT_EMBEDDED_PATH,
    CHAT_MESSAGES_SEGMENT,
    CHAT_STATE_SEGMENT,
    EChatTalkState,
    IChatMessageRow,
    IChatTalkRow,
    IPage,
} from '@rt/message-bus-common';
import { catchError, map, Observable, timeout } from 'rxjs';

/** Чем сужен список переписок: признак страницы, страница списка и состояние разговора. */
export interface ITalksAsked {
    readonly sign: string;
    readonly page: number;
    readonly size: number;
    /** Состояние разговора. Пусто — оба состояния. */
    readonly state: string;
}

/** Чем сужена лента: признак страницы и страница ленты. */
export interface ITalksFeedAsked {
    readonly sign: string;
    readonly page: number;
    readonly size: number;
}

@Injectable({ providedIn: 'root' })
export class TalksApiService {
    readonly #http: HttpClient = inject(HttpClient);
    readonly #talks: ChatTalkMapper = new ChatTalkMapper();
    readonly #messages: ChatMessageMapper = new ChatMessageMapper();
    #service: string = '';

    /** Адрес сервиса: он приезжает адресом рамки, и до его чтения обращаться некуда. */
    public at(service: string): void {
        this.#service = service;
    }

    /** Страница переписок своего сайта: свежий разговор первым. */
    public talks(asked: ITalksAsked): Observable<IPage<IChat.Talk.State>> {
        let params: HttpParams = new HttpParams().set('sign', asked.sign).set('page', asked.page).set('size', asked.size);

        if (asked.state !== '') {
            params = params.set('state', asked.state);
        }

        return this.#http.get<IPage<IChatTalkRow>>(this.#path(), { params }).pipe(
            timeout(READ_TIMEOUT_MS),
            catchError(asReadFault),
            map((page: IPage<IChatTalkRow>): IPage<IChat.Talk.State> => ({
                ...page,
                rows: page.rows.map((row: IChatTalkRow): IChat.Talk.State => this.#talks.mapFrom(row)),
            }))
        );
    }

    /** Страница сообщений одного разговора: старые первыми, разговор читается с начала. */
    public feed(talkId: string, asked: ITalksFeedAsked): Observable<IPage<IChat.Message.State>> {
        const params: HttpParams = new HttpParams().set('sign', asked.sign).set('page', asked.page).set('size', asked.size);

        return this.#http.get<IPage<IChatMessageRow>>(this.#talkPath(talkId, CHAT_MESSAGES_SEGMENT), { params }).pipe(
            timeout(READ_TIMEOUT_MS),
            catchError(asReadFault),
            map((page: IPage<IChatMessageRow>): IPage<IChat.Message.State> => ({
                ...page,
                rows: page.rows.map((row: IChatMessageRow): IChat.Message.State => this.#messages.mapFrom(row)),
            }))
        );
    }

    /** Ответ человека потребителя посетителю. */
    public answer(talkId: string, sign: string, text: string): Observable<IChat.Message.State> {
        return this.#http.post<IChatMessageRow>(this.#talkPath(talkId, CHAT_MESSAGES_SEGMENT), { sign, text }).pipe(
            timeout(READ_TIMEOUT_MS),
            catchError(asSpokenFault),
            map((row: IChatMessageRow): IChat.Message.State => this.#messages.mapFrom(row))
        );
    }

    /** Смена состояния разговора: закрыть его или открыть снова. */
    public state(talkId: string, sign: string, state: EChatTalkState): Observable<EChatTalkState> {
        return this.#http.post<{ state: string }>(this.#talkPath(talkId, CHAT_STATE_SEGMENT), { sign, state }).pipe(
            timeout(READ_TIMEOUT_MS),
            catchError(asSpokenFault),
            map((answer: { state: string }): EChatTalkState =>
                answer.state === EChatTalkState.Closed ? EChatTalkState.Closed : EChatTalkState.Live
            )
        );
    }

    /** Адрес операций страницы. */
    #path(): string {
        return `${this.#service}${CHAT_EMBEDDED_PATH}`;
    }

    /** Адрес одного разговора с хвостом операции. */
    #talkPath(talkId: string, segment: string): string {
        return `${this.#path()}/${encodeURIComponent(talkId)}/${segment}`;
    }
}
