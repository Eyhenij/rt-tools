import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { asReadFault, asSpokenFault, READ_TIMEOUT_MS } from '@rt/message-bus-admin/common/core/api';
import { INVITES_PATH } from '@rt/message-bus-admin/invites/util';
import { ITreeInviteIssued } from '@rt/message-bus-common';
import { catchError, Observable, timeout } from 'rxjs';

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
            .pipe(timeout(READ_TIMEOUT_MS), catchError(asSpokenFault));
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
