import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ECargoKind } from '@rt/message-bus-common';
import { catchError, Observable, timeout } from 'rxjs';

import { asReadFault, READ_TIMEOUT_MS } from './admin-read.api';

/** Адрес операции: версии обоих родов груза отдаёт одна, а род называет параметр. */
const CARGO_VERSIONS_PATH: string = '/api/cargo/versions';

/**
 * Версии выпуска для отбора: те, что встретились в записях раздела.
 *
 * Своего раздела у версий нет — они живут отбором в тулбаре списка, поэтому обращение лежит в
 * общем слое, а не в домене: домен под предмет заводят там, где у предмета есть экран.
 *
 * Род груза обязателен: наборы у разборов и у предложений разные, и версия, встретившаяся у
 * одних, у других в отборе стоять не должна.
 */
@Injectable({ providedIn: 'root' })
export class CargoVersionsApiService {
    readonly #http: HttpClient = inject(HttpClient);

    public versions(kind: ECargoKind): Observable<readonly string[]> {
        return this.#http
            .get<readonly string[]>(CARGO_VERSIONS_PATH, { params: new HttpParams().set('kind', kind), withCredentials: true })
            .pipe(timeout(READ_TIMEOUT_MS), catchError(asReadFault));
    }
}
