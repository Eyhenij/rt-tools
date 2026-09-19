import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { PEOPLE_PATH, PERSON_ACCESS_ROUTE, PERSON_PASSWORD_ROUTE } from '@rt/message-bus-admin/accounts/util';
import { asSpokenFault, READ_TIMEOUT_MS } from '@rt/message-bus-admin/common/core/api';
import { IPersonAccessInput, IPersonAccessView, IPersonView } from '@rt/message-bus-common';
import { catchError, Observable, timeout } from 'rxjs';

/** Последний сегмент адреса отключения: `accounts/<имя>/disable`. */
const DISABLE_SEGMENT: string = 'disable';

/**
 * Обращение к правкам над людьми.
 *
 * Списком заведует общая основа стора — она знает адрес и просит страницу сама. Здесь остаются
 * три правки, которые админка делает над записями приёмника, — заведение, новый пароль и
 * отключение, — и доступ записи: чтение для панели прав и замена роли с правками целиком.
 *
 * Все три отвечают строкой списка после правки и все три отбрасывают отказ со словом приёмника:
 * занятое имя, пустой пароль и своя запись — про действие человека, и панель показывает их как
 * есть. Предел ожидания и куки берутся у общего слоя: свои разошлись бы с чтением.
 * `withCredentials` обязателен: на своей машине админка поднимается своим портом, и без него
 * браузер не пошлёт куку приёмнику вовсе.
 */
@Injectable({ providedIn: 'root' })
export class PeopleApiService {
    readonly #http: HttpClient = inject(HttpClient);

    /** Завести запись по имени и первому паролю. */
    public create(name: string, password: string): Observable<IPersonView> {
        return this.#http
            .post<IPersonView>(PEOPLE_PATH, { name, password }, { withCredentials: true })
            .pipe(timeout(READ_TIMEOUT_MS), catchError(asSpokenFault));
    }

    /** Сменить пароль записи по её имени. */
    public replacePassword(name: string, password: string): Observable<IPersonView> {
        return this.#http
            .post<IPersonView>(
                `${PEOPLE_PATH}/${encodeURIComponent(name)}/${PERSON_PASSWORD_ROUTE}`,
                { password },
                { withCredentials: true }
            )
            .pipe(timeout(READ_TIMEOUT_MS), catchError(asSpokenFault));
    }

    /** Отключить запись по её имени. Тела нет: отключение ничего не спрашивает. */
    public disable(name: string): Observable<IPersonView> {
        return this.#http
            .post<IPersonView>(`${PEOPLE_PATH}/${encodeURIComponent(name)}/${DISABLE_SEGMENT}`, null, { withCredentials: true })
            .pipe(timeout(READ_TIMEOUT_MS), catchError(asSpokenFault));
    }

    /** Доступ записи по имени: роль, правки и права, которые из них выходят. */
    public access(name: string): Observable<IPersonAccessView> {
        return this.#http
            .get<IPersonAccessView>(`${PEOPLE_PATH}/${encodeURIComponent(name)}/${PERSON_ACCESS_ROUTE}`, { withCredentials: true })
            .pipe(timeout(READ_TIMEOUT_MS), catchError(asSpokenFault));
    }

    /** Заменить доступ записи целиком: роль и все правки. */
    public replaceAccess(name: string, input: IPersonAccessInput): Observable<IPersonAccessView> {
        return this.#http
            .put<IPersonAccessView>(`${PEOPLE_PATH}/${encodeURIComponent(name)}/${PERSON_ACCESS_ROUTE}`, input, { withCredentials: true })
            .pipe(timeout(READ_TIMEOUT_MS), catchError(asSpokenFault));
    }
}
