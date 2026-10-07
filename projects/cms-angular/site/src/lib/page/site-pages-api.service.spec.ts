import { TransferState, makeStateKey } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { create } from '@bufbuild/protobuf';
import { Code, ConnectError, ConnectRouter, ServiceImpl, createRouterTransport } from '@connectrpc/connect';

import { PlatformService } from '@rt-tools/core';
import { CmsPublicService, ContentItemSchema, TagSchema } from '@rt-tools/cms-contract';
import { CMS_SITE_ADDRESS, CMS_TRANSPORT } from '@rt-tools/cms-angular';

import { ICmsSitePage } from './site-page.function';
import { ICmsStoredPage, SitePagesApiService } from './site-pages-api.service';

type TPublicServer = Partial<ServiceImpl<typeof CmsPublicService>>;

/** Raises the site client against a public server double, on the server side or in the browser. */
function sitePages(server: TPublicServer, onServer: boolean): SitePagesApiService {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
        providers: [
            {
                provide: CMS_TRANSPORT,
                useValue: createRouterTransport((router: ConnectRouter): void => void router.service(CmsPublicService, server)),
            },
            { provide: CMS_SITE_ADDRESS, useValue: { baseUrl: 'https://example.org', sectionRoot: '/blog' } },
            { provide: PlatformService, useValue: { isPlatformBrowser: !onServer } },
        ],
    });

    return TestBed.inject(SitePagesApiService);
}

const ITEM: ReturnType<typeof create<typeof ContentItemSchema>> = create(ContentItemSchema, {
    id: 'i1',
    locale: 'en',
    mainFields: { slug: 'pine', title: 'Pine' },
});

function refused(): never {
    throw new ConnectError('refused', Code.Unavailable);
}

describe('the site pages client', () => {
    it('SC-CMS-73 — the server reads a page and puts it into the page state for the browser', async () => {
        const client: SitePagesApiService = sitePages({ getWebPage: () => ({ item: ITEM, locales: ['en', 'ru'] }) }, true);

        const stored: ICmsStoredPage | null = await client.page('pine', 'en');

        expect(stored?.page.path).toBe('/blog/pine');
        expect(stored?.locales).toEqual(['en', 'ru']);
        expect(TestBed.inject(TransferState).hasKey(makeStateKey('cms-page-en-pine'))).toBe(true);
    });

    it('SC-CMS-73 — the browser takes the carried page once and asks the server the next time', async () => {
        let calls: number = 0;
        const client: SitePagesApiService = sitePages(
            {
                getWebPage: () => {
                    calls += 1;

                    return { item: ITEM, locales: ['en'] };
                },
            },
            false
        );
        const carried: ICmsStoredPage = { page: { slug: 'carried' } as never, locales: ['en'] };
        TestBed.inject(TransferState).set(makeStateKey('cms-page-en-pine'), { value: carried });

        expect((await client.page('pine', 'en'))?.page.slug).toBe('carried');
        expect(calls).toBe(0);
        expect((await client.page('pine', 'en'))?.page.slug).toBe('pine');
        expect(calls).toBe(1);
    });

    it('SC-CMS-73 — a draft by a preview token does not settle in the page state', async () => {
        const client: SitePagesApiService = sitePages({ getWebPage: () => ({ item: ITEM, locales: ['en'] }) }, true);

        await client.page('pine', 'en', 'token');

        expect(TestBed.inject(TransferState).hasKey(makeStateKey('cms-page-en-pine'))).toBe(false);
    });

    it('SC-CMS-73 — a missing page and a silent server both read as no page', async () => {
        expect(await sitePages({ getWebPage: () => ({ locales: [] }) }, true).page('gone', 'en')).toBeNull();
        expect(await sitePages({ getWebPage: refused }, true).page('pine', 'en')).toBeNull();
    });

    it('SC-CMS-73 — the published pages and the tags are read, and a silent server gives empty lists', async () => {
        const client: SitePagesApiService = sitePages(
            {
                listPublishedContentItems: () => ({ items: [ITEM] }),
                listPublicTags: () => ({ tags: [create(TagSchema, { id: 't1', name: 'Pine', parentTagId: '' })] }),
            },
            true
        );

        const pages: readonly ICmsSitePage.State[] = await client.published('blog-articles', 'en');
        const tags: readonly ICmsSitePage.Tag[] = await client.tags();

        expect(pages.map((page: ICmsSitePage.State): string => page.slug)).toEqual(['pine']);
        expect(tags).toEqual([{ id: 't1', name: 'Pine', parentId: '' }]);

        const silent: SitePagesApiService = sitePages({ listPublishedContentItems: refused, listPublicTags: refused }, true);
        expect(await silent.published('blog-articles', 'en')).toEqual([]);
        expect(await silent.tags()).toEqual([]);
    });
});
