import { inject, Injectable } from '@angular/core';

import { map, Observable } from 'rxjs';

import { contractRedirectTypeOf, ERedirectType, ListRedirectsResponse, Redirect } from '@rt-tools/cms-contract';
import { IRedirectList, IRedirectListRow } from '@rt-tools/cms-angular';

import { IListQuery } from '../list/list-query.model';
import { redirectRowOf, required } from './cms-contract-mapping.function';
import { RedirectsApiFacade } from './redirects-api.facade';

/** The redirects in the CMS notions. The contract type does not go past this class. */
@Injectable({ providedIn: 'root' })
export class RedirectsApiService {
    readonly #facade: RedirectsApiFacade = inject(RedirectsApiFacade);

    public redirects(query: IListQuery): Observable<IRedirectList> {
        return this.#facade.listRedirects(query.pageNumber, query.pageSize, query.search).pipe(
            map((answer: ListRedirectsResponse) => {
                const list: IRedirectList = { redirects: answer.redirects.map(redirectRowOf), total: answer.total };
                return list;
            })
        );
    }

    public save(id: string, fromPath: string, to: string, type: ERedirectType): Observable<IRedirectListRow> {
        return this.#facade
            .saveRedirect(id, fromPath, to, contractRedirectTypeOf(type))
            .pipe(map((answer: { redirect?: Redirect }) => redirectRowOf(required(answer.redirect, 'the redirect'))));
    }

    public remove(redirectId: string): Observable<void> {
        return this.#facade.deleteRedirect(redirectId).pipe(map((): void => undefined));
    }
}
