import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ROLES_PATH } from '@rt/message-bus-admin/accounts/util';
import { asSpokenFault, READ_TIMEOUT_MS, readOne, readPage } from '@rt/message-bus-admin/common/core/api';
import { IAdminListQuery, listQueryOf } from '@rt/message-bus-admin/common/core/util';
import { IPage, IRoleInput, IRoleView, PAGE_SIZE_MAX, ROLE_SORTABLE } from '@rt/message-bus-common';
import { catchError, map, Observable, timeout } from 'rxjs';

/**
 * Обращение к операциям над ролями.
 *
 * Страницей заведует общая основа стора — она знает адрес и просит страницу сама. Здесь остаются
 * одна роль для панели, три правки и список ролей целиком для выбора роли человеку.
 *
 * Правки отвечают ролью после правки и отбрасывают отказ со словом приёмника: занятое имя, роль,
 * которую держат, самозапирание — про действие человека, и панель показывает их как есть.
 * Предел ожидания и куки берутся у общего слоя. `withCredentials` обязателен: на своей машине
 * админка поднимается своим портом, и без него браузер не пошлёт куку приёмнику вовсе.
 */
@Injectable({ providedIn: 'root' })
export class RolesApiService {
    readonly #http: HttpClient = inject(HttpClient);

    /** Одна роль по ключу: её читает панель, открытая по адресу. */
    public one(key: string): Observable<IRoleView> {
        return readOne<IRoleView>(this.#http, ROLES_PATH, key);
    }

    /**
     * Все роли разом — для выбора роли человеку.
     *
     * Просится первой страницей предельного размера: ролей у приёмника единицы, и второй страницы
     * не бывает. Выборка собирается тем же разбором, что у списка, — из пустого адреса.
     */
    public all(): Observable<readonly IRoleView[]> {
        const query: IAdminListQuery = { ...listQueryOf({}, ROLE_SORTABLE), size: PAGE_SIZE_MAX, dir: 'asc' };

        return readPage<IRoleView>(this.#http, ROLES_PATH, query).pipe(map((page: IPage<IRoleView>): readonly IRoleView[] => page.rows));
    }

    /** Завести роль по имени и правам. */
    public create(role: IRoleInput): Observable<IRoleView> {
        return this.#http
            .post<IRoleView>(ROLES_PATH, role, { withCredentials: true })
            .pipe(timeout(READ_TIMEOUT_MS), catchError(asSpokenFault));
    }

    /** Сменить имя и права роли по её ключу. */
    public replace(key: string, role: IRoleInput): Observable<IRoleView> {
        return this.#http
            .put<IRoleView>(`${ROLES_PATH}/${encodeURIComponent(key)}`, role, { withCredentials: true })
            .pipe(timeout(READ_TIMEOUT_MS), catchError(asSpokenFault));
    }

    /** Удалить роль по ключу. Ответа нет: показывать после удаления нечего. */
    public remove(key: string): Observable<void> {
        return this.#http
            .delete<void>(`${ROLES_PATH}/${encodeURIComponent(key)}`, { withCredentials: true })
            .pipe(timeout(READ_TIMEOUT_MS), catchError(asSpokenFault));
    }
}
