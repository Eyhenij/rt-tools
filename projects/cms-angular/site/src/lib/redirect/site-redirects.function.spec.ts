import { create } from '@bufbuild/protobuf';
import { Code, ConnectError, ConnectRouter, createRouterTransport } from '@connectrpc/connect';

import {
    CmsPublicService,
    ListPublicRedirectsResponse,
    ListPublicRedirectsResponseSchema,
    RedirectType,
    TSiteRedirectsAnswer,
} from '@rt-tools/cms-contract';

import { cmsSiteRedirects } from './site-redirects.function';

describe('the redirects of the site server', () => {
    it('SC-CMS-75 — a request on a redirected path is answered by the CMS redirect with the query carried over', async () => {
        const response: ListPublicRedirectsResponse = create(ListPublicRedirectsResponseSchema, {
            redirects: [{ from: '/old', to: '/new', type: RedirectType.MOVED_PERMANENTLY }],
        });
        const redirectOf: TSiteRedirectsAnswer = cmsSiteRedirects(
            createRouterTransport(
                (router: ConnectRouter): void => void router.service(CmsPublicService, { listPublicRedirects: () => response })
            )
        );

        await expect(redirectOf('/old', 'a=1')).resolves.toEqual({ status: 301, location: '/new?a=1' });
        await expect(redirectOf('/other', '')).resolves.toBeNull();
    });

    it('SC-CMS-75 — without an answer from the CMS server the page is drawn as usual', async () => {
        const redirectOf: TSiteRedirectsAnswer = cmsSiteRedirects(
            createRouterTransport(
                (router: ConnectRouter): void =>
                    void router.service(CmsPublicService, {
                        listPublicRedirects: (): never => {
                            throw new ConnectError('refused', Code.Unavailable);
                        },
                    })
            )
        );

        await expect(redirectOf('/old', '')).resolves.toBeNull();
    });
});
