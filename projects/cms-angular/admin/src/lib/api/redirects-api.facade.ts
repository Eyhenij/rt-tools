import { Injectable, inject } from '@angular/core';

import { type Observable, from } from 'rxjs';

import {
    CmsService as CmsContract,
    type DeleteRedirectResponse,
    type ListRedirectsResponse,
    type RedirectType,
    type SaveRedirectResponse,
} from '@rt-tools/cms-contract';
import { type Client, createClient } from '@connectrpc/connect';
import { CMS_TRANSPORT } from '@rt-tools/cms-angular';

/** The way out to the redirects contract. The facade knows only the contract and gives the answer as is. */
@Injectable({ providedIn: 'root' })
export class RedirectsApiFacade {
    readonly #client: Client<typeof CmsContract> = createClient(CmsContract, inject(CMS_TRANSPORT));

    public listRedirects(page: number, pageSize: number, search: string): Observable<ListRedirectsResponse> {
        return from(this.#client.listRedirects({ page, pageSize, search }));
    }

    /** An empty id creates a new redirect. */
    public saveRedirect(id: string, fromPath: string, to: string, type: RedirectType): Observable<SaveRedirectResponse> {
        return from(this.#client.saveRedirect({ from: fromPath, id, to, type }));
    }

    public deleteRedirect(redirectId: string): Observable<DeleteRedirectResponse> {
        return from(this.#client.deleteRedirect({ redirectId }));
    }
}
