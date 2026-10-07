import { create } from '@bufbuild/protobuf';
import { timestampDate, timestampFromDate } from '@bufbuild/protobuf/wkt';
import { Code, ConnectError } from '@connectrpc/connect';
import {
    type ContentItem,
    type ContentItemDraft,
    ContentItemDraftSchema,
    type ContentItemImage,
    ContentItemStatus,
    type ContentItemSummary,
    ContentTypeCategory,
    EContentItemStatus,
    ERedirectType,
    type MediaFile,
    MediaFileSchema,
    RedirectType,
    type Tag,
} from '@rt-tools/cms-contract';

import {
    contractContentTypeOf,
    contractFolderOf,
    contractItemOf,
    contractRedirectOf,
    contractSummaryOf,
    contractTagOf,
    contractTagTreeOf,
    found,
    idOrNull,
    itemDraftOf,
    settingsOf,
    statusFromContract,
} from './cms-contract.function';
import type { IContentItemDraft, IContentTypeRecord } from './cms-records.model';
import { ITEM, NOW } from './testing/fixtures';

const LOCALES: readonly string[] = ['en', 'de'];

function mediaFileOf(fileId: string): Promise<MediaFile | null> {
    return Promise.resolve(fileId === 'f1' ? create(MediaFileSchema, { id: 'f1', url: 'https://cdn/f1.png' }) : null);
}

function refusal(action: () => unknown): Code | undefined {
    try {
        action();
    } catch (error: unknown) {
        return error instanceof ConnectError ? error.code : undefined;
    }
    return undefined;
}

describe('the contract shape of the records', () => {
    it('SC-CMS-20 — the admin gets the preview token, the site does not', async () => {
        const admin: ContentItem = await contractItemOf(ITEM, mediaFileOf, true);
        const site: ContentItem = await contractItemOf(ITEM, mediaFileOf, false);

        expect(admin.mainFields?.previewToken).toBe('secret');
        expect(site.mainFields?.previewToken).toBe('');
    });

    it('SC-CMS-20 — a page carries its main image, images, tags and connections in the contract shape', async () => {
        const item: ContentItem = await contractItemOf(ITEM, mediaFileOf, false);

        expect(item.status).toBe(ContentItemStatus.PUBLISHED);
        expect(item.mainImage?.url).toBe('https://cdn/f1.png');
        expect(item.images.map((image: ContentItemImage) => [image.id, image.file, image.labels])).toEqual([['f2', undefined, ['cover']]]);
        expect(item.tagIds).toEqual(['g1']);
        expect(item.connections[0]).toMatchObject({ contentItemId: 'i2', contentTypeName: 'Articles', contentItemName: 'Oak' });
        expect(item.state?.createdById).toBe('u1');
        expect(item.state?.updatedById).toBe('');
        expect(item.state?.lockedAt).toBeUndefined();
    });

    it('SC-CMS-20 — a page without a main image or dates leaves them empty', async () => {
        const item: ContentItem = await contractItemOf(
            { ...ITEM, mainImageId: null, publishedAt: null, createdById: null, lockedById: 'u2', lockedAt: NOW },
            mediaFileOf,
            true
        );

        expect(item.mainImage).toBeUndefined();
        expect(item.publishedAt).toBeUndefined();
        expect(item.state?.createdById).toBe('');
        expect(item.state?.lockedById).toBe('u2');
        expect(timestampDate(item.state?.lockedAt ?? timestampFromDate(new Date(0)))).toEqual(NOW);
    });

    it('SC-CMS-20 — a gallery image carries its media library file, and the last editor is named', async () => {
        expect(
            await contractItemOf(
                { ...ITEM, updatedById: 'u2', images: [{ mediaFileId: 'f1', caption: '', altText: '', orderIndex: 0, labels: [] }] },
                mediaFileOf,
                true
            )
        ).toMatchObject({ images: [{ file: { url: 'https://cdn/f1.png' } }], state: { updatedById: 'u2' } });
    });

    it('SC-CMS-20 — a missing main image file reads as no image', async () => {
        const item: ContentItem = await contractItemOf({ ...ITEM, mainImageId: 'gone' }, mediaFileOf, true);

        expect(item.mainImage).toBeUndefined();
    });

    it('SC-CMS-20 — the summary of a page names its lock holder and dates', () => {
        const summary: ContentItemSummary = contractSummaryOf({ ...ITEM, toBePublishedAt: NOW, lockedById: 'u2' });
        const unlocked: ContentItemSummary = contractSummaryOf({ ...ITEM, publishedAt: null });

        expect(summary.lockedById).toBe('u2');
        expect(summary.toBePublishedAt).toBeDefined();
        expect(unlocked.lockedById).toBe('');
        expect(unlocked.publishedAt).toBeUndefined();
    });

    it('SC-CMS-20 — a content type keeps its category and its settings as JSON', () => {
        const record: IContentTypeRecord = {
            id: 't1',
            name: 'Articles',
            description: '',
            category: 'CONTENT',
            adminSlug: 'articles',
            layoutType: 'article',
            settings: { media: true },
            createdAt: NOW,
            updatedAt: NOW,
        };

        expect(contractContentTypeOf(record)).toMatchObject({ category: ContentTypeCategory.CONTENT, settings: '{"media":true}' });
        expect(contractContentTypeOf({ ...record, category: 'OTHER', settings: null })).toMatchObject({
            category: ContentTypeCategory.UNSPECIFIED,
            settings: '{}',
        });
    });

    it('SC-CMS-20 — a redirect, a folder and a tag keep their fields, an empty parent reads as none', () => {
        expect(contractRedirectOf({ id: 'r1', from: '/a', to: '/b', type: ERedirectType.Found })).toMatchObject({
            type: RedirectType.FOUND,
        });
        expect(contractFolderOf({ id: 'd1', name: 'Covers', parentId: null }).parentId).toBe('');
        expect(contractFolderOf({ id: 'd2', name: 'Pine', parentId: 'd1' }).parentId).toBe('d1');
        expect(contractTagOf({ id: 'g1', name: 'Wood', isEnabled: true, parentTagId: null }).parentTagId).toBe('');
    });
});

describe('the page edit', () => {
    const draft: ContentItemDraft = create(ContentItemDraftSchema, {
        name: '',
        title: 'Pine stairs',
        slug: 'pine-stairs',
        locale: 'en',
        status: ContentItemStatus.PUBLISHED,
        contentBody: '',
        mainImageId: '',
        images: [{ mediaFileId: 'f2', caption: 'c', altText: 'a', labels: ['cover'] }],
        tagIds: ['g1'],
        connectedItemIds: ['i2'],
    });

    it('SC-CMS-17 — an empty edit, a malformed address and a locale the application does not name are refused', () => {
        expect(refusal(() => itemDraftOf(undefined, null, NOW, LOCALES))).toBe(Code.InvalidArgument);
        expect(refusal(() => itemDraftOf({ ...draft, slug: 'Pine Stairs' }, null, NOW, LOCALES))).toBe(Code.InvalidArgument);
        expect(refusal(() => itemDraftOf({ ...draft, locale: 'fr' }, null, NOW, LOCALES))).toBe(Code.InvalidArgument);
    });

    it('SC-CMS-17 — the name falls back to the title, the body to an empty list, the publication time is computed', () => {
        const checked: IContentItemDraft = itemDraftOf(draft, null, NOW, LOCALES);

        expect(checked).toMatchObject({
            name: 'Pine stairs',
            contentBody: '[]',
            mainImageId: null,
            publishedAt: NOW,
            toBePublishedAt: null,
        });
        expect(checked.images).toEqual([{ mediaFileId: 'f2', caption: 'c', altText: 'a', labels: ['cover'] }]);
    });

    it('SC-CMS-17 — an unspecified state reads as a draft, and a scheduled date is kept', () => {
        const checked: IContentItemDraft = itemDraftOf(
            {
                ...draft,
                name: 'Own',
                status: ContentItemStatus.UNSPECIFIED,
                mainImageId: 'f1',
                contentBody: '[1]',
                toBePublishedAt: timestampFromDate(NOW),
            },
            null,
            NOW,
            LOCALES
        );

        expect(checked).toMatchObject({
            name: 'Own',
            status: EContentItemStatus.Draft,
            mainImageId: 'f1',
            contentBody: '[1]',
            toBePublishedAt: NOW,
        });
        expect(statusFromContract(ContentItemStatus.ARCHIVED)).toBe(EContentItemStatus.Archived);
    });
});

describe('the helpers', () => {
    it('SC-CMS-18 — the tags come as a tree, and a tag whose parent is gone stands at the root', () => {
        const tree: Tag[] = contractTagTreeOf([
            { id: 'g1', name: 'Wood', isEnabled: true, parentTagId: null },
            { id: 'g2', name: 'Pine', isEnabled: true, parentTagId: 'g1' },
            { id: 'g3', name: 'Lost', isEnabled: false, parentTagId: 'gone' },
        ]);

        expect(tree.map((tag: Tag) => [tag.id, tag.tags.map((child: Tag) => child.id)])).toEqual([
            ['g1', ['g2']],
            ['g3', []],
        ]);
    });

    it('SC-CMS-19 — content type settings are a JSON object, anything else is refused', () => {
        expect(settingsOf('')).toEqual({});
        expect(settingsOf('{"media":true}')).toEqual({ media: true });
        expect(refusal(() => settingsOf('{'))).toBe(Code.InvalidArgument);
        expect(refusal(() => settingsOf('[]'))).toBe(Code.InvalidArgument);
        expect(refusal(() => settingsOf('null'))).toBe(Code.InvalidArgument);
    });

    it('SC-CMS-21 — a record not found is refused as not found, and an empty id reads as none', () => {
        expect(found('x', 'page')).toBe('x');
        expect(refusal(() => found(null, 'page'))).toBe(Code.NotFound);
        expect(refusal(() => 'no throw')).toBeUndefined();
        expect(idOrNull('')).toBeNull();
        expect(idOrNull('i1')).toBe('i1');
    });
});
