import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { asReadFault, READ_TIMEOUT_MS } from '@rt/message-bus-admin/common/core/api';
import { IInviteFault, inviteFaultOf, INVITES_PATH } from '@rt/message-bus-admin/invites/util';
import { ITreeInviteIssued } from '@rt/message-bus-common';
import { catchError, Observable, throwError, timeout } from 'rxjs';

/**
 * Отказ выдачи в то, что покажет панель.
 *
 * Разбор кода и тела — чистая функция раздела; здесь остаётся достать из ответа каркаса код и
 * тело. Обрыв связи и вышедший срок ожидания кода не несут вовсе — им ставится ноль, тот же,
 * каким каркас отвечает на недошедший запрос.
 */
function asIssueFault(error: unknown): Observable<never> {
    const response: HttpErrorResponse | null = error instanceof HttpErrorResponse ? error : null;

    return throwError((): IInviteFault => inviteFaultOf(response?.status ?? 0, response?.error ?? null));
}

/**
 * Обращение к операциям над приглашениями.
 *
 * Списком заведует общая основа стора — она знает адрес и просит страницу сама. Здесь остаются
 * две правки, которые админка делает над записями приёмника: выдача приглашения и его отзыв.
 *
 * Предел ожидания, куки и разбор отказа берутся у общего слоя, а не пишутся заново: свои они
 * разошлись бы с чтением — одному действию достался бы повтор по сроку, другому вечное
 * ожидание. `withCredentials` обязателен: на своей машине админка поднимается своим портом, и
 * без него браузер не пошлёт куку приёмнику вовсе.
 */
@Injectable({ providedIn: 'root' })
export class InvitesApiService {
    readonly #http: HttpClient = inject(HttpClient);

    /**
     * Выдать приглашение на названное имя.
     *
     * Ответ читается весь: код приезжает им одним, и второго места, где его взять, нет. Отсюда и
     * разница с отзывом — там ответ не нужен вовсе.
     */
    public issue(name: string): Observable<ITreeInviteIssued> {
        return this.#http
            .post<ITreeInviteIssued>(INVITES_PATH, { name }, { withCredentials: true })
            .pipe(timeout(READ_TIMEOUT_MS), catchError(asIssueFault));
    }

    /**
     * Отозвать приглашение по имени будущего дерева.
     *
     * Ответ не читается: список после отзыва перечитывается целиком — за время, пока человек
     * смотрел на экран, приглашение могли и погасить, и состояние соседних строк тоже могло
     * стать другим.
     */
    public revoke(name: string): Observable<unknown> {
        return this.#http
            .delete(`${INVITES_PATH}/${encodeURIComponent(name)}`, { withCredentials: true })
            .pipe(timeout(READ_TIMEOUT_MS), catchError(asReadFault));
    }
}
