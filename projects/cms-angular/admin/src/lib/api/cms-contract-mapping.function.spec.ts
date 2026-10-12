import { create } from '@bufbuild/protobuf';
import { timestampFromDate } from '@bufbuild/protobuf/wkt';
import {
    ContentItem,
    ContentItemSchema,
    ContentItemStatus,
    ContentItemSummarySchema,
    EContentItemStatus,
    ERedirectType,
    RedirectSchema,
    RedirectType,
    TagSchema,
} from '@rt-tools/cms-contract';
import { emptyItemDraft, IContentItem, IEditedContentItem } from '@rt-tools/cms-angular';

import {
    contentItemOf,
    contentItemRowOf,
    contractDraftOf,
    contractStatusOf,
    redirectRowOf,
    tagNodeOf,
    TContractDraft,
} from './cms-contract-mapping.function';

const SAVED_AT: Date = new Date(Date.UTC(2026, 9, 7, 9, 5));

const PAGE: ContentItem = create(ContentItemSchema, {
    id: 'item-1',
    contentTypeId: 'blog',
    name: 'Stair',
    status: ContentItemStatus.PUBLISHED,
    locale: 'en',
    link: '',
    contentBody: '[]',
    tagIds: ['wood'],
    mainFields: { slug: 'stair', title: 'Stair', previewToken: 'token' },
    state: { lockedById: 'user-2', updatedAt: timestampFromDate(SAVED_AT) },
    mainImage: { id: 'file-b' },
    images: [
        { orderIndex: 2, caption: 'Second', altText: '', file: { id: 'file-b', url: '/b.webp' } },
        { orderIndex: 1, caption: 'First', altText: 'alt', file: { id: 'file-a', url: '/a.webp' } },
        { orderIndex: 3, caption: 'Lost', altText: '' },
    ],
    connections: [{ contentTypeId: 'blog', contentItemId: 'item-2', contentTypeName: 'Blog', contentItemName: 'Oak' }],
});

describe('the contract in the CMS notions', () => {
    it('SC-CMS-58 — a saved page reads with its images in order, its lock and its connections', () => {
        const item: IContentItem = contentItemOf(PAGE);

        expect(item).toMatchObject({
            id: 'item-1',
            contentTypeId: 'blog',
            previewToken: 'token',
            lockedById: 'user-2',
            updatedAt: SAVED_AT,
        });
        expect(item.draft.status).toBe(EContentItemStatus.Published);
        expect(item.draft.page).toEqual({ slug: 'stair', title: 'Stair', description: '', metaTitle: '', metaDescription: '' });
        expect(item.draft.images.map((image: { fileId: string }) => image.fileId)).toEqual(['file-a', 'file-b', '']);
        expect(item.draft.mainImageId).toBe('file-b');
        expect(item.draft.connections).toEqual([{ contentTypeId: 'blog', itemId: 'item-2', typeName: 'Blog', itemName: 'Oak' }]);
        expect(item.draft.toBePublishedAt).toBeNull();
    });

    it('SC-CMS-58 — a bare page reads with empty fields rather than a refusal', () => {
        const item: IContentItem = contentItemOf(create(ContentItemSchema, { id: 'bare' }));

        expect(item.draft.page.slug).toBe('');
        expect(item.draft.mainImageId).toBe('');
        expect(item.draft.status).toBe(EContentItemStatus.Draft);
        expect(item.previewToken).toBe('');
        expect(item.lockedById).toBe('');
        expect(item.updatedAt).toBeNull();
    });

    it('SC-CMS-59 — an answer without a page breaks the contract and is thrown, not shown', () => {
        expect(() => contentItemOf(undefined)).toThrow('The server answered without the page');
    });

    it('SC-CMS-58 — a draft goes to the contract with its images, connections and date', () => {
        const draft: IEditedContentItem = {
            ...emptyItemDraft('en'),
            toBePublishedAt: SAVED_AT,
            images: [{ fileId: 'file-a', url: '/a.webp', caption: 'First', altText: 'alt' }],
            connections: [{ contentTypeId: 'blog', itemId: 'item-2', typeName: 'Blog', itemName: 'Oak' }],
        };
        const sent: TContractDraft = contractDraftOf(draft);

        expect(sent.status).toBe(ContentItemStatus.DRAFT);
        expect(sent.connectedItemIds).toEqual(['item-2']);
        expect(sent.images?.[0]).toMatchObject({ mediaFileId: 'file-a', caption: 'First', altText: 'alt' });
        expect(sent.toBePublishedAt).toEqual(timestampFromDate(SAVED_AT));
        expect(contractDraftOf(emptyItemDraft('en')).toBePublishedAt).toBeUndefined();
    });

    it('SC-CMS-58 — a list row, a tag tree, a redirect and a filter status read in the CMS notions', () => {
        expect(
            contentItemRowOf(
                create(ContentItemSummarySchema, { id: 'r', status: ContentItemStatus.ARCHIVED, updatedAt: timestampFromDate(SAVED_AT) })
            )
        ).toMatchObject({
            id: 'r',
            status: EContentItemStatus.Archived,
            updatedAt: SAVED_AT,
        });
        expect(
            tagNodeOf(create(TagSchema, { id: 'wood', name: 'Wood', tags: [{ id: 'pine', name: 'Pine', parentTagId: 'wood' }] }))
        ).toEqual({
            id: 'wood',
            name: 'Wood',
            parentId: '',
            children: [{ id: 'pine', name: 'Pine', parentId: 'wood', children: [] }],
        });
        expect(redirectRowOf(create(RedirectSchema, { id: 'x', from: '/a', to: '/b', type: RedirectType.FOUND }))).toEqual({
            id: 'x',
            from: '/a',
            to: '/b',
            type: ERedirectType.Found,
        });
        expect(contractStatusOf(null)).toBe(ContentItemStatus.UNSPECIFIED);
        expect(contractStatusOf(EContentItemStatus.Published)).toBe(ContentItemStatus.PUBLISHED);
    });
});
