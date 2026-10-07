import { Client, Transport, createClient } from '@connectrpc/connect';

import {
    CmsPublicService,
    ISiteRedirect,
    ListPublicRedirectsResponse,
    SITE_REDIRECTS_TTL_MS,
    TSiteRedirectsAnswer,
    cachedSiteRedirects,
    redirectTypeOfContract,
} from '@rt-tools/cms-contract';

/**
 * The redirects of the site server, read from the public CMS output and held for `ttlMs`. The site
 * server answers a request by them before drawing the page; the path is matched without the query,
 * and the query is carried over. The CMS server did not answer — the former list stays.
 */
export function cmsSiteRedirects(transport: Transport, ttlMs: number = SITE_REDIRECTS_TTL_MS): TSiteRedirectsAnswer {
    const client: Client<typeof CmsPublicService> = createClient(CmsPublicService, transport);

    return cachedSiteRedirects(async (): Promise<readonly ISiteRedirect[]> => {
        const response: ListPublicRedirectsResponse = await client.listPublicRedirects({});

        return response.redirects.map((redirect: ListPublicRedirectsResponse['redirects'][number]): ISiteRedirect => ({
            from: redirect.from,
            to: redirect.to,
            type: redirectTypeOfContract(redirect.type),
        }));
    }, ttlMs);
}
