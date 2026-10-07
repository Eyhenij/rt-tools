import { Code, ConnectError, type ServiceImpl } from '@connectrpc/connect';
import {
    type CmsPublicService,
    type ContentItem,
    type GetWebPageRequest,
    type ListPublishedContentItemsRequest,
} from '@rt-tools/cms-contract';

import { contractItemOf, contractRedirectOf, contractTagOf } from './cms-contract.function';
import type { IContentItemRecord, IRedirectRecord, ITagRecord } from './cms-records.model';
import type { ICmsSources } from './cms-sources.model';
import { isVisibleOnSite } from './content-item-rules.function';

/** The site service of the CMS: open to everyone, it never hands out a preview token. */
export function cmsPublicServiceImpl(sources: ICmsSources): ServiceImpl<typeof CmsPublicService> {
    const service: ServiceImpl<typeof CmsPublicService> = {
        /**
         * A site page by its address and locale. A draft opens only by its own token and an archived
         * page never; the refusal is the same as for an empty address.
         */
        getWebPage: async (request: GetWebPageRequest) => {
            const item: IContentItemRecord | null = await sources.itemBySlugOf(request.slug, request.locale);
            if (item === null || !isVisibleOnSite(item.status, item.previewToken, request.previewToken)) {
                throw new ConnectError('there is no page with this address in this locale', Code.NotFound);
            }
            return {
                item: await contractItemOf(item, sources.mediaFileOf, false),
                locales: await sources.publishedLocalesOf(item.slug),
            };
        },

        /** The published pages of a type in a site locale — for the lists and the site map. */
        listPublishedContentItems: async (request: ListPublishedContentItemsRequest) => {
            const records: IContentItemRecord[] = await sources.publishedItemsOf(request.contentTypeAdminSlug, request.locale);
            const items: ContentItem[] = [];
            for (const record of records) {
                items.push(await contractItemOf(record, sources.mediaFileOf, false));
            }
            return { items };
        },

        /** Every redirect: the site server compares the request path with them before rendering. */
        listPublicRedirects: async () => {
            const redirects: IRedirectRecord[] = await sources.allRedirects();
            return { redirects: redirects.map(contractRedirectOf) };
        },

        /** Every tag as a flat list with its parent: the site labels its sections with them. */
        listPublicTags: async () => {
            const tags: ITagRecord[] = await sources.tags();
            return { tags: tags.map(contractTagOf) };
        },
    };
    return service;
}
