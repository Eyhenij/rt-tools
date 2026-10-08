import { EContentItemStatus } from '@rt-tools/cms-contract';

import type { IContentItemDraft, IContentItemRecord } from './cms-records.model.js';
import {
    contentItemBySlugOf,
    contentItemOf,
    contentItemPageOf,
    contentSlugTaken,
    createContentItem,
    deleteContentItem,
    type IContentItemDelegate,
    lockContentItem,
    publishDueContentItems,
    publishedContentItemsOf,
    publishedContentLocalesOf,
    setContentItemFeatured,
    type TContentItemRow,
    unlockContentItem,
    updateContentItem,
} from './content-item-store.function.js';
import { ITEM, NOW } from './testing/fixtures.js';

const ROW: TContentItemRow = { ...ITEM, status: 'PUBLISHED' };
const DUE: TContentItemRow = { ...ITEM, id: 'i5', status: 'DRAFT', toBePublishedAt: new Date('2026-10-06T00:00:00Z'), publishedAt: null };

const DRAFT: IContentItemDraft = {
    name: 'Oak',
    status: EContentItemStatus.Draft,
    isFeatured: false,
    toBePublishedAt: null,
    publishedAt: null,
    mainImageId: null,
    link: '',
    locale: 'en',
    slug: 'oak',
    title: 'Oak',
    description: '',
    metaTitle: '',
    metaDescription: '',
    contentBody: '[]',
    tagIds: ['g1'],
    connectedItemIds: ['i2'],
    images: [{ mediaFileId: 'f1', caption: 'c', altText: 'a', labels: ['cover'] }],
};

interface IRecordingDelegate extends IContentItemDelegate {
    readonly calls: [string, unknown][];
}

function delegateOf(rows: TContentItemRow[]): IRecordingDelegate {
    const calls: [string, unknown][] = [];
    const delegate: IRecordingDelegate = {
        calls,
        findMany: async (args: unknown): Promise<TContentItemRow[]> => {
            calls.push(['findMany', args]);
            return rows;
        },
        count: async (args: unknown): Promise<number> => {
            calls.push(['count', args]);
            return rows.length;
        },
        findUnique: async (args: unknown): Promise<TContentItemRow | null> => {
            calls.push(['findUnique', args]);
            return rows[0] ?? null;
        },
        findFirst: async (args: unknown): Promise<TContentItemRow | null> => {
            calls.push(['findFirst', args]);
            return rows[0] ?? null;
        },
        create: async (args: unknown): Promise<TContentItemRow> => {
            calls.push(['create', args]);
            return ROW;
        },
        update: async (args: unknown): Promise<TContentItemRow> => {
            calls.push(['update', args]);
            return ROW;
        },
        delete: async (args: unknown): Promise<unknown> => {
            calls.push(['delete', args]);
            return null;
        },
    };
    return delegate;
}

describe('the pages store', () => {
    it('SC-CMS-30 — the list page and its count share one filter, and a row state reads as the page state', async () => {
        const items: IRecordingDelegate = delegateOf([ROW]);

        expect(
            await contentItemPageOf(items, { contentTypeId: 't1', search: 'oak', status: EContentItemStatus.Draft, locale: 'en' }, 20, 20)
        ).toMatchObject({ total: 1, items: [{ status: EContentItemStatus.Published }] });
        await contentItemPageOf(items, { contentTypeId: 't1', search: null, status: null, locale: null }, 0, 20);
        const where: unknown[] = items.calls.map((call: [string, unknown]) => Reflect.get(call[1] as object, 'where'));
        expect(where[0]).toEqual(where[1]);
        expect(where[0]).toMatchObject({ contentTypeId: 't1', status: EContentItemStatus.Draft, locale: 'en', OR: [{}, {}] });
        expect(where[2]).toEqual({ contentTypeId: 't1' });
    });

    it('SC-CMS-31 — a new page sets its relations, and an edit replaces them in one call with the images in order', async () => {
        const items: IRecordingDelegate = delegateOf([ROW]);

        await createContentItem(items, 't1', DRAFT, 'u1');
        await updateContentItem(items, 'i1', DRAFT, 'u1');
        expect(items.calls[0][1]).toMatchObject({
            data: {
                contentTypeId: 't1',
                slug: 'oak',
                createdById: 'u1',
                tags: { create: [{ tagId: 'g1' }] },
                images: { create: [{ orderIndex: 0 }] },
            },
        });
        expect(items.calls[1][1]).toMatchObject({
            where: { id: 'i1' },
            data: { updatedById: 'u1', tags: { deleteMany: {} }, connections: { create: [{ toId: 'i2' }], deleteMany: {} } },
        });
    });

    it('SC-CMS-32 — the due drafts are published with their scheduled date', async () => {
        const items: IRecordingDelegate = delegateOf([DUE, { ...DUE, id: 'i6', toBePublishedAt: null }]);

        await expect(publishDueContentItems(items, NOW)).resolves.toBe(2);
        expect(items.calls.slice(1).map((call: [string, unknown]) => call[1])).toMatchObject([
            { where: { id: 'i5' }, data: { status: EContentItemStatus.Published, publishedAt: DUE.toBePublishedAt } },
            { where: { id: 'i6' }, data: { publishedAt: NOW } },
        ]);
    });

    it('SC-CMS-31 — a page is read, locked, unlocked, featured and removed by its id, and an absent one reads as none', async () => {
        const items: IRecordingDelegate = delegateOf([ROW]);

        expect((await contentItemOf(items, 'i1'))?.id).toBe('i1');
        expect(await contentItemOf(delegateOf([]), 'x')).toBeNull();
        const changed: IContentItemRecord[] = [
            await lockContentItem(items, 'i1', 'u1', NOW),
            await unlockContentItem(items, 'i1'),
            await setContentItemFeatured(items, 'i1', true),
        ];
        await deleteContentItem(items, 'i1');
        expect(changed).toHaveLength(3);
        expect(items.calls.slice(1).map((call: [string, unknown]) => call[1])).toMatchObject([
            { data: { lockedById: 'u1', lockedAt: NOW } },
            { data: { lockedById: null, lockedAt: null } },
            { data: { isFeatured: true } },
            { where: { id: 'i1' } },
        ]);
    });

    it('SC-CMS-30 — an address is taken by another page of the locale only, and the site reads pages by address, type and locale', async () => {
        const items: IRecordingDelegate = delegateOf([ROW]);

        await expect(contentSlugTaken(items, 'oak', 'en', null)).resolves.toBe(true);
        await expect(contentSlugTaken(delegateOf([]), 'oak', 'en', 'i1')).resolves.toBe(false);
        expect((await contentItemBySlugOf(items, 'pine-stairs', 'en'))?.id).toBe('i1');
        expect(await publishedContentItemsOf(items, 'articles', 'en')).toHaveLength(1);
        await expect(publishedContentLocalesOf(items, 'pine-stairs')).resolves.toEqual(['en']);
        expect(items.calls.map((call: [string, unknown]) => Reflect.get(call[1] as object, 'where'))).toEqual([
            { slug: 'oak', locale: 'en' },
            { slug: 'pine-stairs', locale: 'en' },
            { locale: 'en', contentType: { adminSlug: 'articles' }, status: EContentItemStatus.Published },
            { slug: 'pine-stairs', status: EContentItemStatus.Published },
        ]);
    });
});
