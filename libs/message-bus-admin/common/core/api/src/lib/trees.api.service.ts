import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ITreeChoice } from '@rt/message-bus-common';
import { catchError, Observable, timeout } from 'rxjs';

import { asReadFault, READ_TIMEOUT_MS } from './admin-read.api';

/**
 * Деревья для отбора: имена, которыми человек их узнаёт, и признаки, которыми сужается список.
 *
 * Своего раздела у деревьев нет — они живут отбором в тулбаре каждого списка. Поэтому обращение
 * лежит в общем слое, а не в домене: домен под предмет заводят там, где у предмета есть экран.
 */
@Injectable({ providedIn: 'root' })
export class TreesApiService {
    readonly #http: HttpClient = inject(HttpClient);

    public choices(): Observable<readonly ITreeChoice[]> {
        return this.#http
            .get<readonly ITreeChoice[]>('/api/trees', { withCredentials: true })
            .pipe(timeout(READ_TIMEOUT_MS), catchError(asReadFault));
    }
}
