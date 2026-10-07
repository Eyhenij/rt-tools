import { create } from '@bufbuild/protobuf';
import { Code, type HandlerContext, type ServiceImpl } from '@connectrpc/connect';
import {
    type CmsService,
    type ContentItemDraft,
    ContentItemDraftSchema,
    ContentItemStatus,
    CreateContentItemRequestSchema,
    DeleteContentItemRequestSchema,
    GetContentItemRequestSchema,
    GetContentTypeRequestSchema,
    ListContentItemsRequestSchema,
    ListContentTypesRequestSchema,
    LockContentItemRequestSchema,
    SetContentItemFeaturedRequestSchema,
    UnlockContentItemRequestSchema,
    UpdateContentItemRequestSchema,
    UpdateContentTypeRequestSchema,
} from '@rt-tools/cms-contract';

import { cmsServiceImpl } from './cms-service';
import { callerOf, contextOf, type IMemorySources, memorySources, refusalOf } from './testing/memory-sources';

type TCmsServiceImpl = ServiceImpl<typeof CmsService>;

const ME: HandlerContext = contextOf(callerOf('u1'));

const DRAFT: ContentItemDraft = create(ContentItemDraftSchema, {
    title: 'Oak stairs',
    slug: 'oak-stairs',
    locale: 'en',
    status: ContentItemStatus.DRAFT,
});

function serviceOf(sources: IMemorySources): TCmsServiceImpl {
    return cmsServiceImpl({ sources, locales: ['en', 'de'] });
}

describe('the admin service — content types and pages', () => {
    it('SC-CMS-22 — a call without the caller the interceptor accepted is refused as unauthenticated', async () => {
        const service: TCmsServiceImpl = serviceOf(memorySources());

        await expect(refusalOf(service.listContentTypes(create(ListContentTypesRequestSchema), contextOf(null)))).resolves.toBe(
            Code.Unauthenticated
        );
    });

    it('SC-CMS-22 — a content type is listed, read and edited by the caller, and a missing one is not found', async () => {
        const sources: IMemorySources = memorySources();
        const service: TCmsServiceImpl = serviceOf(sources);

        expect(await service.listContentTypes(create(ListContentTypesRequestSchema), ME)).toMatchObject({ contentTypes: [{ id: 't1' }] });
        expect(await service.getContentType(create(GetContentTypeRequestSchema, { contentTypeId: 't1' }), ME)).toMatchObject({
            contentType: { adminSlug: 'articles' },
        });
        await expect(refusalOf(service.getContentType(create(GetContentTypeRequestSchema, { contentTypeId: 'x' }), ME))).resolves.toBe(
            Code.NotFound
        );
        expect(
            await service.updateContentType(
                create(UpdateContentTypeRequestSchema, { contentTypeId: 't1', name: 'News', settings: '{"media":false}' }),
                ME
            )
        ).toMatchObject({ contentType: { settings: '{"media":false}' } });
        expect(sources.writes).toEqual(['type t1 by u1']);
    });

    it('SC-CMS-22 — the list of pages takes the filter and the window from the request', async () => {
        const sources: IMemorySources = memorySources();
        const service: TCmsServiceImpl = serviceOf(sources);

        expect(
            await service.listContentItems(
                create(ListContentItemsRequestSchema, { contentTypeId: 't1', search: ' pine ', page: 2, pageSize: 500, locale: 'en' }),
                ME
            )
        ).toMatchObject({ total: 2 });
        await service.listContentItems(create(ListContentItemsRequestSchema, { contentTypeId: 't1' }), ME);
        expect(sources.writes).toEqual([
            'page {"contentTypeId":"t1","search":"pine","status":null,"locale":"en"} 100/100',
            'page {"contentTypeId":"t1","search":null,"status":null,"locale":null} 0/20',
        ]);
    });

    it('SC-CMS-23 — a new page is written by the caller, and a taken address or a missing type is refused', async () => {
        const sources: IMemorySources = memorySources();
        const service: TCmsServiceImpl = serviceOf(sources);

        expect(
            await service.createContentItem(create(CreateContentItemRequestSchema, { contentTypeId: 't1', draft: DRAFT }), ME)
        ).toMatchObject({
            item: { mainFields: { slug: 'oak-stairs' } },
        });
        expect(sources.writes).toEqual(['create oak-stairs by u1']);
        await expect(
            refusalOf(service.createContentItem(create(CreateContentItemRequestSchema, { contentTypeId: 't1', draft: DRAFT }), ME))
        ).resolves.toBe(Code.AlreadyExists);
        await expect(
            refusalOf(service.createContentItem(create(CreateContentItemRequestSchema, { contentTypeId: 'x', draft: DRAFT }), ME))
        ).resolves.toBe(Code.NotFound);
    });

    it('SC-CMS-24 — a page another person holds open is not saved, and an address taken by another page is refused', async () => {
        const sources: IMemorySources = memorySources();
        const service: TCmsServiceImpl = serviceOf(sources);

        await expect(
            refusalOf(service.updateContentItem(create(UpdateContentItemRequestSchema, { contentItemId: 'i3', draft: DRAFT }), ME))
        ).resolves.toBe(Code.FailedPrecondition);
        await expect(
            refusalOf(
                service.updateContentItem(
                    create(UpdateContentItemRequestSchema, { contentItemId: 'i1', draft: { ...DRAFT, slug: 'draft' } }),
                    ME
                )
            )
        ).resolves.toBe(Code.AlreadyExists);
        expect(
            await service.updateContentItem(create(UpdateContentItemRequestSchema, { contentItemId: 'i1', draft: DRAFT }), ME)
        ).toMatchObject({
            item: { mainFields: { slug: 'oak-stairs' } },
        });
        expect(sources.writes).toEqual(['update i1 by u1']);
    });

    it('SC-CMS-24 — a page is read with its preview token, featured and deleted by its id, and a missing one is not found', async () => {
        const sources: IMemorySources = memorySources();
        const service: TCmsServiceImpl = serviceOf(sources);

        expect(await service.getContentItem(create(GetContentItemRequestSchema, { contentItemId: 'i1' }), ME)).toMatchObject({
            item: { mainFields: { previewToken: 'secret' } },
        });
        expect(
            await service.setContentItemFeatured(
                create(SetContentItemFeaturedRequestSchema, { contentItemId: 'i1', isFeatured: false }),
                ME
            )
        ).toMatchObject({ item: { isFeatured: false } });
        await service.deleteContentItem(create(DeleteContentItemRequestSchema, { contentItemId: 'i1' }), ME);
        expect(sources.writes).toEqual(['delete i1']);
        await expect(refusalOf(service.getContentItem(create(GetContentItemRequestSchema, { contentItemId: 'x' }), ME))).resolves.toBe(
            Code.NotFound
        );
    });

    it('SC-CMS-25 — the lock goes to whoever opened the page, and another person’s lock is neither taken over nor lifted', async () => {
        const sources: IMemorySources = memorySources();
        const service: TCmsServiceImpl = serviceOf(sources);

        expect(await service.lockContentItem(create(LockContentItemRequestSchema, { contentItemId: 'i1' }), ME)).toMatchObject({
            lockedByCaller: true,
            state: { lockedById: 'u1' },
        });
        expect(await service.lockContentItem(create(LockContentItemRequestSchema, { contentItemId: 'i3' }), ME)).toMatchObject({
            lockedByCaller: false,
            state: { lockedById: 'u2' },
        });
        await service.unlockContentItem(create(UnlockContentItemRequestSchema, { contentItemId: 'i3' }), ME);
        await service.unlockContentItem(create(UnlockContentItemRequestSchema, { contentItemId: 'i1' }), ME);
        expect(sources.writes).toEqual(['lock i1 by u1', 'unlock i1']);
    });
});
