import { Injector } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { create } from '@bufbuild/protobuf';
import { Code } from '@connectrpc/connect';
import {
    ContentItemSchema,
    ContentTypeSchema,
    CreateContentItemRequest,
    LockContentItemResponse,
    LockContentItemResponseSchema,
    UnlockContentItemRequest,
    UpdateContentItemRequest,
} from '@rt-tools/cms-contract';
import { CMS_LABELS_EN, emptyItemDraft, IContentItem } from '@rt-tools/cms-angular';

import { cmsTestBed, ICmsTestBed, refusal, settled, TCmsServerDouble } from '../testing/cms-server.function';
import { ItemEditorStore } from './item-editor.store';

const TYPE: { contentType: ReturnType<typeof create<typeof ContentTypeSchema>> } = {
    contentType: create(ContentTypeSchema, { id: 'blog', name: 'Blog' }),
};
const PAGE: { item: ReturnType<typeof create<typeof ContentItemSchema>> } = {
    item: create(ContentItemSchema, { id: 'item-1', contentTypeId: 'blog', name: 'Stair' }),
};

function lockOf(lockedByCaller: boolean): LockContentItemResponse {
    return create(LockContentItemResponseSchema, { lockedByCaller, state: { lockedById: lockedByCaller ? 'me' : 'other' } });
}

/** A server that opens the page and locks it for the caller. */
function editorServer(extra: TCmsServerDouble = {}): TCmsServerDouble {
    const server: TCmsServerDouble = {
        getContentType: () => TYPE,
        getContentItem: () => PAGE,
        lockContentItem: () => lockOf(true),
        unlockContentItem: () => ({}),
        ...extra,
    };
    return server;
}

/** The store in its own injector, so the test can destroy it like a screen that is left. */
function screenStore(): { store: ItemEditorStore; leave: () => void } {
    const injector: Injector = Injector.create({ providers: [ItemEditorStore], parent: TestBed.inject(Injector) });
    const store: ItemEditorStore = injector.get(ItemEditorStore);
    return { store, leave: (): void => (injector as unknown as { destroy(): void }).destroy() };
}

describe('the page edit', () => {
    it('SC-CMS-62 — an opened page is locked for the caller, saved, and released on leaving', async () => {
        const updated: UpdateContentItemRequest[] = [];
        const released: UnlockContentItemRequest[] = [];
        cmsTestBed(
            editorServer({
                updateContentItem: (request: UpdateContentItemRequest) => {
                    updated.push(request);
                    return PAGE;
                },
                unlockContentItem: (request: UnlockContentItemRequest) => {
                    released.push(request);
                    return {};
                },
            })
        );
        const { store, leave }: { store: ItemEditorStore; leave: () => void } = screenStore();
        const outcomes: boolean[] = [];
        store.saveOutcome$.subscribe((outcome: boolean) => outcomes.push(outcome));

        store.open({ contentTypeId: 'blog', itemId: 'item-1' });
        await settled();
        expect(store.type()?.name).toBe('Blog');
        expect(store.item()?.id).toBe('item-1');
        expect(store.lockedByOther()).toBe(false);

        store.save({ ...emptyItemDraft('en'), name: 'New name' });
        await settled();
        expect(updated[0]).toMatchObject({ contentItemId: 'item-1', draft: { name: 'New name' } });
        expect(outcomes).toEqual([true]);
        expect(store.saving()).toBe(false);

        leave();
        await settled();
        expect(released).toEqual([expect.objectContaining({ contentItemId: 'item-1' })]);
    });

    it('SC-CMS-62 — a new page is created, then locked like an opened one', async () => {
        const created: CreateContentItemRequest[] = [];
        cmsTestBed(
            editorServer({
                createContentItem: (request: CreateContentItemRequest) => {
                    created.push(request);
                    return PAGE;
                },
                // A lock answer without a state still reads: nobody is named as the holder.
                lockContentItem: () => create(LockContentItemResponseSchema, { lockedByCaller: true }),
                unlockContentItem: () => {
                    throw refusal(Code.Unavailable);
                },
            })
        );
        const { store, leave }: { store: ItemEditorStore; leave: () => void } = screenStore();
        const saved: IContentItem[] = [];
        store.saved$.subscribe((item: IContentItem) => saved.push(item));

        // Before the opening there is no lock to be held by another, and nothing to save.
        expect(store.lockedByOther()).toBe(false);
        store.save(emptyItemDraft('en'));
        store.open({ contentTypeId: 'blog', itemId: '' });
        await settled();
        expect(store.item()).toBeNull();

        store.save(emptyItemDraft('en'));
        await settled();

        expect(created[0].contentTypeId).toBe('blog');
        expect(saved.map((item: IContentItem) => item.id)).toEqual(['item-1']);
        expect(store.lockedByOther()).toBe(false);

        // A refused release is silent, and a second release has no lock left to lift.
        store.release();
        await settled();
        store.release();
        leave();
        await settled();
    });

    it('SC-CMS-62 — a page another person holds is not saved, and the refusal names the lock', async () => {
        const bed: ICmsTestBed = cmsTestBed(
            editorServer({
                lockContentItem: () => lockOf(false),
                updateContentItem: () => {
                    throw refusal(Code.FailedPrecondition);
                },
            })
        );
        const { store, leave }: { store: ItemEditorStore; leave: () => void } = screenStore();
        const outcomes: boolean[] = [];
        store.saveOutcome$.subscribe((outcome: boolean) => outcomes.push(outcome));
        store.open({ contentTypeId: 'blog', itemId: 'item-1' });
        await settled();

        store.save(emptyItemDraft('en'));
        await settled();
        leave();

        expect(store.lockedByOther()).toBe(true);
        expect(outcomes).toEqual([false]);
        expect(bed.notices[0].payload.message).toBe(CMS_LABELS_EN.itemLocked);
    });

    it('SC-CMS-60 — a refused opening marks the screen failed, and a refused save says what failed', async () => {
        const bed: ICmsTestBed = cmsTestBed(
            editorServer({
                getContentItem: () => {
                    throw refusal(Code.NotFound);
                },
                createContentItem: () => {
                    throw refusal(Code.Internal);
                },
            })
        );
        const { store, leave }: { store: ItemEditorStore; leave: () => void } = screenStore();

        store.open({ contentTypeId: 'blog', itemId: 'item-1' });
        await settled();
        expect(store.failed()).toBe(true);
        expect(store.loading()).toBe(false);

        store.open({ contentTypeId: 'blog', itemId: '' });
        await settled();
        store.save(emptyItemDraft('en'));
        await settled();

        expect(bed.notices.map((notice: { payload: { message: string } }) => notice.payload.message)).toEqual([
            CMS_LABELS_EN.itemLoadFailed,
            CMS_LABELS_EN.itemSaveFailed,
        ]);
        leave();
    });
});
