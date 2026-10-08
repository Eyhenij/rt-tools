import { create } from '@bufbuild/protobuf';
import { Code, type HandlerContext, type ServiceImpl } from '@connectrpc/connect';
import type { TAccess } from '@rt-tools/auth-server';
import { connectAccessEntries } from '@rt-tools/auth-server';
import {
    CmsMediaService,
    CmsPublicService,
    CmsService,
    GetWebPageRequestSchema,
    ListPublicRedirectsRequestSchema,
    ListPublicTagsRequestSchema,
    ListPublishedContentItemsRequestSchema,
} from '@rt-tools/cms-contract';

import { CMS_PUBLIC_SERVICE_ACCESS, cmsMediaServiceAccess, cmsServiceAccess, type ICmsRights } from './cms-access.js';
import { cmsPublicServiceImpl } from './cms-public-service.js';
import { contextOf, memorySources, refusalOf } from './testing/memory-sources.js';

type TPublicServiceImpl = ServiceImpl<typeof CmsPublicService>;

const GUEST: HandlerContext = contextOf(null);

const RIGHTS: ICmsRights = {
    contentRead: 'content:read',
    contentManage: 'content:manage',
    tagsRead: 'tags:read',
    tagsManage: 'tags:manage',
    redirectsRead: 'redirects:read',
    redirectsManage: 'redirects:manage',
    mediaRead: 'media:read',
    mediaManage: 'media:manage',
};

describe('the site service', () => {
    it('SC-CMS-28 — a published page opens for a guest without its preview token, with its published locales', async () => {
        const service: TPublicServiceImpl = cmsPublicServiceImpl(memorySources());

        expect(await service.getWebPage(create(GetWebPageRequestSchema, { slug: 'pine-stairs', locale: 'en' }), GUEST)).toMatchObject({
            item: { id: 'i1', mainFields: { previewToken: '' } },
            locales: ['en', 'de'],
        });
    });

    it('SC-CMS-28 — a draft opens only by its own token, and an unknown address is not found', async () => {
        const service: TPublicServiceImpl = cmsPublicServiceImpl(memorySources());

        await expect(refusalOf(service.getWebPage(create(GetWebPageRequestSchema, { slug: 'draft', locale: 'en' }), GUEST))).resolves.toBe(
            Code.NotFound
        );
        expect(
            await service.getWebPage(create(GetWebPageRequestSchema, { slug: 'draft', locale: 'en', previewToken: 'tok' }), GUEST)
        ).toMatchObject({ item: { id: 'i3' } });
        await expect(refusalOf(service.getWebPage(create(GetWebPageRequestSchema, { slug: 'none', locale: 'en' }), GUEST))).resolves.toBe(
            Code.NotFound
        );
    });

    it('SC-CMS-28 — the site lists the published pages without tokens, every redirect and every tag', async () => {
        const service: TPublicServiceImpl = cmsPublicServiceImpl(memorySources());

        expect(
            await service.listPublishedContentItems(
                create(ListPublishedContentItemsRequestSchema, { contentTypeAdminSlug: 'articles', locale: 'en' }),
                GUEST
            )
        ).toMatchObject({ items: [{ id: 'i1', mainFields: { previewToken: '' } }] });
        expect(await service.listPublicRedirects(create(ListPublicRedirectsRequestSchema), GUEST)).toMatchObject({
            redirects: [{ from: '/old' }],
        });
        expect(await service.listPublicTags(create(ListPublicTagsRequestSchema), GUEST)).toMatchObject({ tags: [{ id: 'g1' }] });
    });
});

describe('the access maps', () => {
    it('SC-CMS-29 — every method of the three services declares exactly one access', () => {
        expect(connectAccessEntries(CmsService, cmsServiceAccess(RIGHTS))).toHaveLength(CmsService.methods.length);
        expect(connectAccessEntries(CmsMediaService, cmsMediaServiceAccess(RIGHTS))).toHaveLength(CmsMediaService.methods.length);
        expect(connectAccessEntries(CmsPublicService, CMS_PUBLIC_SERVICE_ACCESS)).toHaveLength(CmsPublicService.methods.length);
    });

    it('SC-CMS-29 — reading and editing an area ask for different rights the application names, and the site asks for none', () => {
        expect(cmsServiceAccess(RIGHTS)).toMatchObject({
            listRedirects: { kind: 'permission', permission: 'redirects:read' },
            saveRedirect: { kind: 'permission', permission: 'redirects:manage' },
        });
        expect(cmsMediaServiceAccess(RIGHTS).uploadFile).toEqual({ kind: 'permission', permission: 'media:manage' });
        expect(Object.values(CMS_PUBLIC_SERVICE_ACCESS).every((access: TAccess) => access.kind === 'public')).toBe(true);
    });
});
