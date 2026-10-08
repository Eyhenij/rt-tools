import { EContentItemStatus, ERedirectType } from '@rt-tools/cms-contract';

import type { IContentItemDraft, IContentTypeRecord, IMediaFolderRecord, ITagRecord } from './cms-records.model.js';
import type {
    IContentTypeDelegate,
    IMediaFolderDelegate,
    IRedirectDelegate,
    ITagDelegate,
    TRedirectRow,
} from './cms-dictionary-store.function.js';
import type { ICmsSources } from './cms-sources.model.js';
import { cmsStoreSources } from './cms-store-sources.js';
import type { IContentItemDelegate, TContentItemRow } from './content-item-store.function.js';
import { ITEM, NOW } from './testing/fixtures.js';
import { TYPE } from './testing/memory-sources.js';

const REDIRECT: TRedirectRow = { id: 'r1', from: '/old', to: '/new', type: 'FOUND' };
const TAG: ITagRecord = { id: 'g1', name: 'Wood', isEnabled: true, parentTagId: null };
const DRAFT: IContentItemDraft = {
    ...ITEM,
    status: EContentItemStatus.Draft,
    tagIds: [],
    connectedItemIds: [],
    images: [],
};
const FOLDER: IMediaFolderRecord = { id: 'd1', name: 'Covers', parentId: null };

/** A delegate whose every method records its call and answers with the given value. */
function recording<T>(calls: string[], name: string, answer: unknown): T {
    const handler: ProxyHandler<object> = {
        get: (_target: object, method: string | symbol) => async (args: unknown) => {
            calls.push(`${name}.${String(method)} ${JSON.stringify(args)}`);
            if (method === 'count') {
                return 1;
            }
            return method === 'findMany' ? [answer].filter((row: unknown) => row !== null) : answer;
        },
    };
    return new Proxy({}, handler) as T;
}

function storeOf(calls: string[], found: boolean): ICmsSources {
    return cmsStoreSources({
        contentTypes: recording<IContentTypeDelegate>(calls, 'types', found ? TYPE : null),
        contentItems: recording<IContentItemDelegate>(
            calls,
            'items',
            found ? ({ ...ITEM, status: 'PUBLISHED' } satisfies TContentItemRow) : null
        ),
        tags: recording<ITagDelegate>(calls, 'tags', TAG),
        redirects: recording<IRedirectDelegate>(calls, 'redirects', found ? REDIRECT : null),
        folders: recording<IMediaFolderDelegate>(calls, 'folders', FOLDER),
        now: (): Date => NOW,
        mediaFileOf: async () => null,
    });
}

describe('the storage port over database delegates', () => {
    it('SC-CMS-33 — a redirect row reads with its kind, and the search looks at both addresses', async () => {
        const calls: string[] = [];
        const store: ICmsSources = storeOf(calls, true);

        expect(await store.redirectOf('r1')).toEqual({ ...REDIRECT, type: ERedirectType.Found });
        expect(await storeOf([], false).redirectOf('x')).toBeNull();
        expect(await store.redirectPageOf(0, 20, 'old')).toMatchObject({ total: 1 });
        await store.redirectPageOf(0, 20, null);
        expect(calls[1]).toContain('"OR":[{"from":{"contains":"old"');
        expect(calls[3]).toBe('redirects.findMany {"where":{},"skip":0,"take":20,"orderBy":{"from":"asc"}}');
    });

    it('SC-CMS-33 — an empty id creates a tag, a redirect or a folder, and a filled one edits it', async () => {
        const calls: string[] = [];
        const store: ICmsSources = storeOf(calls, true);

        await store.saveTag(null, { name: 'Pine', isEnabled: true, parentTagId: null });
        await store.saveTag('g1', { name: 'Pine', isEnabled: true, parentTagId: null });
        await store.saveRedirect(null, { from: '/a', to: '/b', type: ERedirectType.Found }, 'u1');
        await store.saveRedirect('r1', { from: '/a', to: '/b', type: ERedirectType.Found }, 'u1');
        await store.saveFolder(null, { name: 'Pine', parentId: null });
        await store.saveFolder('d1', { name: 'Pine', parentId: null });
        expect(calls.map((call: string) => call.split(' ')[0])).toEqual([
            'tags.create',
            'tags.update',
            'redirects.create',
            'redirects.update',
            'folders.create',
            'folders.update',
        ]);
        expect(calls[2]).toContain('"createdById":"u1","updatedById":"u1"');
    });

    it('SC-CMS-33 — a redirect source is taken by another redirect only', async () => {
        const calls: string[] = [];

        await expect(storeOf(calls, true).redirectFromTaken('/old', null)).resolves.toBe(true);
        await expect(storeOf(calls, false).redirectFromTaken('/old', 'r1')).resolves.toBe(false);
        expect(calls).toEqual([
            'redirects.findFirst {"where":{"from":"/old"}}',
            'redirects.findFirst {"where":{"from":"/old","NOT":{"id":"r1"}}}',
        ]);
    });

    it('SC-CMS-33 — every method of the port reaches its delegate', async () => {
        const calls: string[] = [];
        const store: ICmsSources = storeOf(calls, true);

        const types: IContentTypeRecord[] = await store.contentTypes();
        await store.contentTypeOf('t1');
        await store.updateContentType('t1', { name: 'News', description: '', settings: {} }, 'u1');
        await store.itemPageOf({ contentTypeId: 't1', search: null, status: null, locale: null }, 0, 20);
        await store.itemOf('i1');
        await store.slugTaken('oak', 'en', null);
        await store.createItem('t1', DRAFT, 'u1');
        await store.updateItem('i1', DRAFT, 'u1');
        await store.deleteItem('i1');
        await store.setFeatured('i1', true);
        await store.lockItem('i1', 'u1', NOW);
        await store.unlockItem('i1');
        await store.itemBySlugOf('oak', 'en');
        await store.publishedItemsOf('articles', 'en');
        await store.publishedLocalesOf('oak');
        await store.tags();
        await store.tagOf('g1');
        await store.deleteTag('g1');
        await store.allRedirects();
        await store.deleteRedirect('r1');
        await store.folders();
        await store.folderOf('d1');
        await store.deleteFolder('d1');
        await expect(store.mediaFileOf('f1')).resolves.toBeNull();
        expect(store.now()).toBe(NOW);
        expect(types).toEqual([TYPE]);
        expect(calls.map((call: string) => call.split(' ')[0])).toEqual([
            'types.findMany',
            'types.findUnique',
            'types.update',
            'items.findMany',
            'items.count',
            'items.findUnique',
            'items.findFirst',
            'items.create',
            'items.update',
            'items.delete',
            'items.update',
            'items.update',
            'items.update',
            'items.findFirst',
            'items.findMany',
            'items.findMany',
            'tags.findMany',
            'tags.findUnique',
            'tags.delete',
            'redirects.findMany',
            'redirects.delete',
            'folders.findMany',
            'folders.findUnique',
            'folders.delete',
        ]);
    });
});
