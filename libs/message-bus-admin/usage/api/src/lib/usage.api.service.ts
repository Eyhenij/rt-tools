import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { asReadFault, READ_TIMEOUT_MS } from '@rt/message-bus-admin/common/core/api';
import {
    IUsage,
    USAGE_DIGEST_SEGMENT,
    USAGE_PATH,
    USAGE_SESSIONS_SEGMENT,
    UsageDigestMapper,
    UsageSessionMapper,
} from '@rt/message-bus-admin/usage/util';
import { IUsageDigest, IUsageSessionRow } from '@rt/message-bus-common';
import { catchError, map, Observable, timeout } from 'rxjs';

/** Чем сужены сессии: дерево и период — те же, какими читана таблица. Пустой период подставляет приёмник. */
export interface IUsageSessionsAsked {
    readonly tree: string;
    readonly from: string;
    readonly to: string;
}

/**
 * Обращение к операциям чтения использования.
 *
 * Таблицей скилов заведует общая основа стора — она знает адрес и просит страницу сама. Здесь
 * остаются сессии одного скила: их читает панель, и список идёт целиком — у скила за период их
 * сотни самое большее, и страницы им не нужно. И сводка периода: она меняется только с периодом,
 * и читается своей операцией, а не вместе с каждой страницей.
 *
 * Предел ожидания и разбор отказа — те же, что у страницы: общий слой отдаёт их готовыми, а
 * своего способа спросить у раздела нет.
 */
@Injectable({ providedIn: 'root' })
export class UsageApiService {
    readonly #http: HttpClient = inject(HttpClient);
    readonly #mapper: UsageSessionMapper = new UsageSessionMapper();
    readonly #digestMapper: UsageDigestMapper = new UsageDigestMapper();

    /** Сводка периода: дни, роды, два списка скилов. Сужение — то же, каким читана таблица. */
    public digest(asked: IUsageSessionsAsked): Observable<IUsage.Digest.State> {
        return this.#http
            .get<IUsageDigest>(`${USAGE_PATH}/${USAGE_DIGEST_SEGMENT}`, { params: this.#params(asked), withCredentials: true })
            .pipe(
                timeout(READ_TIMEOUT_MS),
                catchError(asReadFault),
                map((digest: IUsageDigest): IUsage.Digest.State => this.#digestMapper.mapFrom(digest))
            );
    }

    /** Сессии одного скила за период: свежий день первым, как их отдаёт приёмник. */
    public sessions(skill: string, asked: IUsageSessionsAsked): Observable<readonly IUsage.Session.State[]> {
        return this.#http
            .get<readonly IUsageSessionRow[]>(`${USAGE_PATH}/${encodeURIComponent(skill)}/${USAGE_SESSIONS_SEGMENT}`, {
                params: this.#params(asked),
                withCredentials: true,
            })
            .pipe(
                timeout(READ_TIMEOUT_MS),
                catchError(asReadFault),
                map((rows: readonly IUsageSessionRow[]): readonly IUsage.Session.State[] =>
                    rows.map((row: IUsageSessionRow): IUsage.Session.State => this.#mapper.mapFrom(row))
                )
            );
    }

    /** Дерево и период запросом; полупустой период не уходит — его подставит приёмник. */
    #params(asked: IUsageSessionsAsked): HttpParams {
        const params: HttpParams = new HttpParams().set('tree', asked.tree);

        return asked.from !== '' && asked.to !== '' ? params.set('from', asked.from).set('to', asked.to) : params;
    }
}
