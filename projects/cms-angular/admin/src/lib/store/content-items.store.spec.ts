import { TestBed } from '@angular/core/testing';

import { create } from '@bufbuild/protobuf';
import { Code } from '@connectrpc/connect';
import {
    ContentItemStatus,
    ContentItemSummarySchema,
    EContentItemStatus,
    ListContentItemsRequest,
    ListContentItemsResponse,
    ListContentItemsResponseSchema,
    SetContentItemFeaturedRequest,
} from '@rt-tools/cms-contract';
import { CMS_LABELS_EN } from '@rt-tools/cms-angular';

import { ContentItemsApiService } from '../api/content-items-api.service';
import { cmsTestBed, ICmsTestBed, refusal, settled } from '../testing/cms-server.function';
import { ContentItemsStore } from './content-items.store';

const LIST: ListContentItemsResponse = create(ListContentItemsResponseSchema, {
    total: 2,
    items: [
        create(ContentItemSummarySchema, { id: 'a', name: 'Oak', status: ContentItemStatus.PUBLISHED }),
        create(ContentItemSummarySchema, { id: 'b', name: 'Pine', status: ContentItemStatus.DRAFT, isFeatured: true }),
    ],
});

describe('the page list', () => {
    it('SC-CMS-61 — the list loads by its type, status, language, page and search', async () => {
        const asked: ListContentItemsRequest[] = [];
        cmsTestBed(
            {
                listContentItems: (request: ListContentItemsRequest): ListContentItemsResponse => {
                    asked.push(request);
                    return LIST;
                },
            },
            [ContentItemsStore]
        );
        const store: ContentItemsStore = TestBed.inject(ContentItemsStore);

        store.setFilter({ contentTypeId: 'blog', status: EContentItemStatus.Published, locale: 'en' });
        store.setQuery({ pageNumber: 2, pageSize: 10, search: 'oak' });
        store.load();
        expect(store.loading()).toBe(true);
        await settled();

        expect(asked[0]).toMatchObject({
            contentTypeId: 'blog',
            status: ContentItemStatus.PUBLISHED,
            locale: 'en',
            page: 2,
            pageSize: 10,
            search: 'oak',
        });
        expect(store.rows().map((row: { name: string }) => row.name)).toEqual(['Oak', 'Pine']);
        expect(store.total()).toBe(2);
        expect(store.loaded()).toBe(true);
        expect(store.loading()).toBe(false);
        expect(store.filter().contentTypeId).toBe('blog');
        expect(store.query().search).toBe('oak');
    });

    it('SC-CMS-61 — a deleted page leaves the list, and a featured one changes its mark', async () => {
        const featured: SetContentItemFeaturedRequest[] = [];
        cmsTestBed(
            {
                listContentItems: (): ListContentItemsResponse => LIST,
                deleteContentItem: () => ({}),
                setContentItemFeatured: (request: SetContentItemFeaturedRequest) => {
                    featured.push(request);
                    return {};
                },
            },
            [ContentItemsStore]
        );
        const store: ContentItemsStore = TestBed.inject(ContentItemsStore);
        store.load();
        await settled();

        store.toggleFeatured(store.rows()[1]);
        await settled();
        store.remove(store.rows()[0]);
        await settled();

        expect(featured[0]).toMatchObject({ contentItemId: 'b', isFeatured: false });
        expect(store.rows()).toEqual([expect.objectContaining({ id: 'b', isFeatured: false })]);
        expect(store.total()).toBe(1);
    });

    it('SC-CMS-60 — a refused list shows an empty table and names the missing right', async () => {
        const bed: ICmsTestBed = cmsTestBed(
            {
                listContentItems: () => {
                    throw refusal(Code.PermissionDenied);
                },
            },
            [ContentItemsStore]
        );
        const store: ContentItemsStore = TestBed.inject(ContentItemsStore);

        store.load();
        await settled();

        expect(store.rows()).toEqual([]);
        expect(store.loaded()).toBe(true);
        expect(bed.notices[0].payload).toMatchObject({ severity: 'danger', message: CMS_LABELS_EN.errorNoRight });
    });

    it('SC-CMS-60 — a refused deletion or mark keeps the row and says what failed', async () => {
        const bed: ICmsTestBed = cmsTestBed(
            {
                listContentItems: (): ListContentItemsResponse => LIST,
                deleteContentItem: () => {
                    throw refusal(Code.Internal);
                },
                setContentItemFeatured: () => {
                    throw refusal(Code.Internal);
                },
            },
            [ContentItemsStore]
        );
        const store: ContentItemsStore = TestBed.inject(ContentItemsStore);
        store.load();
        await settled();

        store.remove(store.rows()[0]);
        await settled();
        store.toggleFeatured(store.rows()[0]);
        await settled();

        expect(store.rows()).toHaveLength(2);
        expect(bed.notices.map((notice: { payload: { message: string } }) => notice.payload.message)).toEqual([
            CMS_LABELS_EN.itemDeleteFailed,
            CMS_LABELS_EN.itemFeaturedFailed,
        ]);
    });

    it('SC-CMS-62 — the release of a lock is answered without a body', async () => {
        cmsTestBed({ unlockContentItem: () => ({}) });

        const answers: string[] = [];
        TestBed.inject(ContentItemsApiService)
            .unlock('item-1')
            .subscribe(() => answers.push('released'));
        await settled();

        expect(answers).toEqual(['released']);
    });

    it('SC-CMS-61 — the search of connections asks the first page of the type with any status', async () => {
        const asked: ListContentItemsRequest[] = [];
        cmsTestBed({
            listContentItems: (request: ListContentItemsRequest): ListContentItemsResponse => {
                asked.push(request);
                return LIST;
            },
        });

        const found: string[] = [];
        TestBed.inject(ContentItemsApiService)
            .search('blog', 'oak')
            .subscribe((list: { items: readonly { id: string }[] }) => found.push(...list.items.map((row: { id: string }) => row.id)));
        await settled();

        expect(asked[0]).toMatchObject({
            contentTypeId: 'blog',
            search: 'oak',
            page: 1,
            status: ContentItemStatus.UNSPECIFIED,
            locale: '',
        });
        expect(found).toEqual(['a', 'b']);
    });
});
