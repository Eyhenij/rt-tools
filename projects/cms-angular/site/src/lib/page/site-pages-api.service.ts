import { Injectable, StateKey, TransferState, inject, makeStateKey } from '@angular/core';

import { Client, createClient } from '@connectrpc/connect';

import { PlatformService } from '@rt-tools/core';
import { CmsPublicService, GetWebPageResponse, ListPublicTagsResponse, ListPublishedContentItemsResponse } from '@rt-tools/cms-contract';
import { CMS_SITE_ADDRESS, CMS_TRANSPORT, ISiteAddress } from '@rt-tools/cms-angular';

import { ICmsSitePage, sitePageOf, siteTagOf } from './site-page.function';

/** A page for its screen: the page itself and the languages its address is published in. */
export interface ICmsStoredPage {
    readonly page: ICmsSitePage.State;
    readonly locales: readonly string[];
}

/**
 * The site pages from the public CMS output. The site server draws the page, and what it read
 * travels to the browser with the page: the browser does not ask the CMS a second time and does not
 * flicker the content when the page comes alive. The CMS server did not answer — the list is empty,
 * and a page counts as missing.
 */
@Injectable({ providedIn: 'root' })
export class SitePagesApiService {
    readonly #client: Client<typeof CmsPublicService> = createClient(CmsPublicService, inject(CMS_TRANSPORT));
    readonly #site: ISiteAddress = inject(CMS_SITE_ADDRESS);
    readonly #transferState: TransferState = inject(TransferState);
    readonly #onServer: boolean = !inject(PlatformService).isPlatformBrowser;

    /** The published pages of one content type, named by its admin slug, in one language. */
    public published(contentType: string, locale: string): Promise<readonly ICmsSitePage.State[]> {
        return this.#carried(`cms-published-${contentType}-${locale}`, async (): Promise<readonly ICmsSitePage.State[]> => {
            try {
                const response: ListPublishedContentItemsResponse = await this.#client.listPublishedContentItems({
                    locale,
                    contentTypeAdminSlug: contentType,
                });

                return response.items.map((item: ListPublishedContentItemsResponse['items'][number]): ICmsSitePage.State =>
                    sitePageOf(item, this.#site.sectionRoot)
                );
            } catch {
                return [];
            }
        });
    }

    /**
     * A page by its address. A draft by a preview token is not put into the transfer cache: the
     * browser reads it itself, and the draft does not settle in the page markup.
     */
    public page(slug: string, locale: string, previewToken: string = ''): Promise<ICmsStoredPage | null> {
        const read: () => Promise<ICmsStoredPage | null> = async (): Promise<ICmsStoredPage | null> => {
            try {
                const response: GetWebPageResponse = await this.#client.getWebPage({ slug, locale, previewToken });
                if (response.item === undefined) {
                    return null;
                }
                const stored: ICmsStoredPage = { page: sitePageOf(response.item, this.#site.sectionRoot), locales: response.locales };

                return stored;
            } catch {
                return null;
            }
        };

        return previewToken === '' ? this.#carried(`cms-page-${locale}-${slug}`, read) : read();
    }

    public tags(): Promise<readonly ICmsSitePage.Tag[]> {
        return this.#carried('cms-tags', async (): Promise<readonly ICmsSitePage.Tag[]> => {
            try {
                const response: ListPublicTagsResponse = await this.#client.listPublicTags({});

                return response.tags.map(siteTagOf);
            } catch {
                return [];
            }
        });
    }

    /**
     * The server puts what it read into the page, the browser takes it from there once: the next
     * move to the same page asks the CMS again — the page could have been unpublished.
     */
    async #carried<T>(name: string, read: () => Promise<T>): Promise<T> {
        const key: StateKey<{ value: T } | null> = makeStateKey<{ value: T } | null>(name);
        const carried: { value: T } | null = this.#onServer ? null : this.#transferState.get(key, null);
        if (carried !== null) {
            this.#transferState.remove(key);

            return carried.value;
        }
        const value: T = await read();
        if (this.#onServer) {
            this.#transferState.set(key, { value });
        }

        return value;
    }
}
