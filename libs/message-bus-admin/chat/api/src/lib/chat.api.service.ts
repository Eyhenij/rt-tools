/**
 * Обращения к операциям чата приёмника.
 *
 * Список переписок и лента разговора читаются страницами, ответ оператора уходит своей операцией,
 * состояние разговора меняется ею же. Предел ожидания и разбор отказа берутся готовыми у общего
 * слоя: своего способа спросить у раздела нет, и второй разошёлся бы с первым молча.
 *
 * Сужение по сайту едет своим полем запроса, а не отбором после чтения: отсев после чтения
 * оставляет соседский разговор в общем счёте строк.
 */
import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { asReadFault, asSpokenFault, READ_TIMEOUT_MS } from '@rt/message-bus-admin/common/core/api';
import { ChatMessageMapper, ChatTalkMapper, IChat } from '@rt/message-bus-admin/chat/util';
import {
    CHAT_MESSAGES_SEGMENT,
    CHAT_PATH,
    CHAT_STATE_SEGMENT,
    EChatTalkState,
    IChatMessageRow,
    IChatTalkRow,
    IPage,
} from '@rt/message-bus-common';
import { catchError, map, Observable, timeout } from 'rxjs';

/** Чем сужен список переписок: страница, сайт и состояние разговора. Пустое поле не сужает. */
export interface IChatTalksAsked {
    readonly page: number;
    readonly size: number;
    /** Признак сайта. Пусто — все сайты оператора. */
    readonly site: string;
    /** Состояние разговора. Пусто — оба состояния. */
    readonly state: string;
}

/** Чем сужена лента: страница и минута, с которой добирается пропущенное. */
export interface IChatFeedAsked {
    readonly page: number;
    readonly size: number;
    /** Минута последней реплики, которая у экрана есть. Пусто — разговор читается целиком. */
    readonly since: string;
}

@Injectable({ providedIn: 'root' })
export class ChatApiService {
    readonly #http: HttpClient = inject(HttpClient);
    readonly #talks: ChatTalkMapper = new ChatTalkMapper();
    readonly #messages: ChatMessageMapper = new ChatMessageMapper();

    /** Страница переписок оператора: свежий разговор первым, как их отдаёт приёмник. */
    public talks(asked: IChatTalksAsked): Observable<IPage<IChat.Talk.State>> {
        return this.#http.get<IPage<IChatTalkRow>>(CHAT_PATH, { params: this.#talksParams(asked), withCredentials: true }).pipe(
            timeout(READ_TIMEOUT_MS),
            catchError(asReadFault),
            map((page: IPage<IChatTalkRow>): IPage<IChat.Talk.State> => ({
                ...page,
                rows: page.rows.map((row: IChatTalkRow): IChat.Talk.State => this.#talks.mapFrom(row)),
            }))
        );
    }

    /** Страница сообщений одного разговора: старые первыми, разговор читается с начала. */
    public feed(talkId: string, asked: IChatFeedAsked): Observable<IPage<IChat.Message.State>> {
        return this.#http
            .get<IPage<IChatMessageRow>>(this.#talkPath(talkId, CHAT_MESSAGES_SEGMENT), {
                params: this.#feedParams(asked),
                withCredentials: true,
            })
            .pipe(
                timeout(READ_TIMEOUT_MS),
                catchError(asReadFault),
                map((page: IPage<IChatMessageRow>): IPage<IChat.Message.State> => ({
                    ...page,
                    rows: page.rows.map((row: IChatMessageRow): IChat.Message.State => this.#messages.mapFrom(row)),
                }))
            );
    }

    /** Ответ оператора посетителю. Отбитый отказ приезжает словом приёмника, а не кодом ответа. */
    public answer(talkId: string, text: string): Observable<IChat.Message.State> {
        return this.#http.post<IChatMessageRow>(this.#talkPath(talkId, CHAT_MESSAGES_SEGMENT), { text }, { withCredentials: true }).pipe(
            timeout(READ_TIMEOUT_MS),
            catchError(asSpokenFault),
            map((row: IChatMessageRow): IChat.Message.State => this.#messages.mapFrom(row))
        );
    }

    /** Смена состояния разговора: закрыть его или открыть снова. */
    public state(talkId: string, state: EChatTalkState): Observable<EChatTalkState> {
        return this.#http.post<{ state: string }>(this.#talkPath(talkId, CHAT_STATE_SEGMENT), { state }, { withCredentials: true }).pipe(
            timeout(READ_TIMEOUT_MS),
            catchError(asSpokenFault),
            map((answer: { state: string }): EChatTalkState =>
                answer.state === EChatTalkState.Closed ? EChatTalkState.Closed : EChatTalkState.Live
            )
        );
    }

    /** Адрес одного разговора с хвостом операции. */
    #talkPath(talkId: string, segment: string): string {
        return `${CHAT_PATH}/${encodeURIComponent(talkId)}/${segment}`;
    }

    /** Страница, сайт и состояние запросом. Пустое поле не уходит вовсе: приёмник сужает названным. */
    #talksParams(asked: IChatTalksAsked): HttpParams {
        let params: HttpParams = new HttpParams().set('page', asked.page).set('size', asked.size);

        if (asked.site !== '') {
            params = params.set('site', asked.site);
        }

        if (asked.state !== '') {
            params = params.set('state', asked.state);
        }

        return params;
    }

    /** Страница и минута добора запросом. */
    #feedParams(asked: IChatFeedAsked): HttpParams {
        const params: HttpParams = new HttpParams().set('page', asked.page).set('size', asked.size);

        return asked.since === '' ? params : params.set('since', asked.since);
    }
}
