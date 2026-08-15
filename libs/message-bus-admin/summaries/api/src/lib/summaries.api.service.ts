import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { readOne } from '@rt/message-bus-admin/common/core/api';
import { IMonthRecord, MonthRecordMapper, SUMMARIES_PATH } from '@rt/message-bus-admin/summaries/util';
import { map, Observable } from 'rxjs';

/**
 * Обращение к операциям чтения записей месяца.
 *
 * Списком заведует общая основа стора — она знает адрес и просит страницу сама. Здесь остаётся
 * одна запись: её читает панель подробностей, и переводится ответ тем же маппером, каким
 * переводится строка списка.
 */
@Injectable({ providedIn: 'root' })
export class SummariesApiService {
    readonly #http: HttpClient = inject(HttpClient);
    readonly #mapper: MonthRecordMapper = new MonthRecordMapper();

    /** Одна запись месяца целиком. Записи, которой нет, приёмник отвечает отказом рода «нет записи». */
    public one(id: string): Observable<IMonthRecord.State> {
        return readOne<IMonthRecord.Api>(this.#http, SUMMARIES_PATH, id).pipe(
            map((row: IMonthRecord.Api): IMonthRecord.State => this.#mapper.mapFrom(row))
        );
    }
}
