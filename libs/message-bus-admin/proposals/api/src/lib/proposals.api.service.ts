import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { readOne } from '@rt/message-bus-admin/common/core/api';
import { IProposal, ProposalMapper, PROPOSALS_PATH } from '@rt/message-bus-admin/proposals/util';
import { map, Observable } from 'rxjs';

/**
 * Обращение к операциям чтения предложений.
 *
 * Списком заведует общая основа стора — она знает адрес и просит страницу сама. Здесь остаётся
 * одна запись: её читает панель подробностей, и переводится ответ тем же маппером, каким
 * переводится строка списка.
 */
@Injectable({ providedIn: 'root' })
export class ProposalsApiService {
    readonly #http: HttpClient = inject(HttpClient);
    readonly #mapper: ProposalMapper = new ProposalMapper();

    /** Одно предложение целиком. Записи, которой нет, приёмник отвечает отказом рода «нет записи». */
    public one(id: string): Observable<IProposal.State> {
        return readOne<IProposal.Api>(this.#http, PROPOSALS_PATH, id).pipe(
            map((row: IProposal.Api): IProposal.State => this.#mapper.mapFrom(row))
        );
    }
}
