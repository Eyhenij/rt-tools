import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { readOne } from '@rt/message-bus-admin/common/core/api';
import { IPostmortem, PostmortemMapper, POSTMORTEMS_PATH } from '@rt/message-bus-admin/postmortems/util';
import { map, Observable } from 'rxjs';

/**
 * Обращение к операциям чтения разборов.
 *
 * Списком заведует общая основа стора — она знает адрес и просит страницу сама. Здесь остаётся
 * одна запись: её читает панель подробностей, и переводится ответ тем же маппером, каким
 * переводится строка списка.
 */
@Injectable({ providedIn: 'root' })
export class PostmortemsApiService {
    readonly #http: HttpClient = inject(HttpClient);
    readonly #mapper: PostmortemMapper = new PostmortemMapper();

    /** Один разбор целиком. Записи, которой нет, приёмник отвечает отказом рода «нет записи». */
    public one(id: string): Observable<IPostmortem.State> {
        return readOne<IPostmortem.Api>(this.#http, POSTMORTEMS_PATH, id).pipe(
            map((row: IPostmortem.Api): IPostmortem.State => this.#mapper.mapFrom(row))
        );
    }
}
