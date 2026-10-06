import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { IRecordLine } from './records.logic';

/** The address of the records on the example server, behind the proxy of the admin. */
const RECORDS_URL: string = '/api/records';

/** The calls of the records page. The token is put on them by the interceptor of the entry module. */
@Injectable({ providedIn: 'root' })
export class RecordsApiService {
    readonly #http: HttpClient = inject(HttpClient);

    public list(): Observable<IRecordLine[]> {
        return this.#http.get<IRecordLine[]>(RECORDS_URL);
    }

    public create(title: string): Observable<IRecordLine> {
        return this.#http.post<IRecordLine>(RECORDS_URL, { title });
    }
}
