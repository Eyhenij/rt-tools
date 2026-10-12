import { create } from '@bufbuild/protobuf';
import { Code, type HandlerContext } from '@connectrpc/connect';
import {
    DeleteMediaFolderRequestSchema,
    DeleteRedirectRequestSchema,
    DeleteTagRequestSchema,
    ListMediaFoldersRequestSchema,
    ListRedirectsRequestSchema,
    ListTagsRequestSchema,
    RedirectType,
    SaveMediaFolderRequestSchema,
    SaveRedirectRequestSchema,
    SaveTagRequestSchema,
} from '@rt-tools/cms-contract';

import { cmsDictionaryHandlers, type TCmsDictionaryHandlers } from './cms-dictionary.handlers.js';
import { callerOf, contextOf, type IMemorySources, memorySources, refusalOf } from './testing/memory-sources.js';

const ME: HandlerContext = contextOf(callerOf('u1'));

describe('the admin service — tags, redirects and folders', () => {
    it('SC-CMS-26 — a tag is created and edited; an empty name, a missing tag and a parent that is itself or gone are refused', async () => {
        const sources: IMemorySources = memorySources();
        const handlers: TCmsDictionaryHandlers = cmsDictionaryHandlers(sources);

        expect(await handlers.saveTag(create(SaveTagRequestSchema, { name: ' Pine ', parentTagId: 'g1' }), ME)).toMatchObject({
            tag: { id: 'g-new', name: 'Pine', parentTagId: 'g1' },
        });
        expect(await handlers.saveTag(create(SaveTagRequestSchema, { id: 'g1', name: 'Timber' }), ME)).toMatchObject({
            tag: { name: 'Timber' },
        });
        expect(await handlers.listTags(create(ListTagsRequestSchema), ME)).toMatchObject({ tags: [{ id: 'g1', tags: [{ id: 'g-new' }] }] });
        await expect(refusalOf(handlers.saveTag(create(SaveTagRequestSchema, { name: ' ' }), ME))).resolves.toBe(Code.InvalidArgument);
        await expect(refusalOf(handlers.saveTag(create(SaveTagRequestSchema, { id: 'x', name: 'a' }), ME))).resolves.toBe(Code.NotFound);
        await expect(
            refusalOf(handlers.saveTag(create(SaveTagRequestSchema, { id: 'g1', name: 'a', parentTagId: 'g1' }), ME))
        ).resolves.toBe(Code.InvalidArgument);
        await expect(refusalOf(handlers.saveTag(create(SaveTagRequestSchema, { name: 'a', parentTagId: 'gone' }), ME))).resolves.toBe(
            Code.InvalidArgument
        );
        await handlers.deleteTag(create(DeleteTagRequestSchema, { tagId: 'g1' }), ME);
        await expect(refusalOf(handlers.deleteTag(create(DeleteTagRequestSchema, { tagId: 'x' }), ME))).resolves.toBe(Code.NotFound);
        expect(sources.writes).toEqual(['delete tag g1']);
    });

    it('SC-CMS-27 — a redirect from a site path is saved by the caller, and a second redirect with the same source is refused', async () => {
        const sources: IMemorySources = memorySources();
        const handlers: TCmsDictionaryHandlers = cmsDictionaryHandlers(sources);

        expect(
            await handlers.saveRedirect(create(SaveRedirectRequestSchema, { from: '/a', to: ' /b ', type: RedirectType.FOUND }), ME)
        ).toMatchObject({
            redirect: { id: 'r-new', to: '/b', type: RedirectType.FOUND },
        });
        expect(await handlers.saveRedirect(create(SaveRedirectRequestSchema, { id: 'r1', from: '/old', to: '/x' }), ME)).toMatchObject({
            redirect: { to: '/x' },
        });
        await expect(refusalOf(handlers.saveRedirect(create(SaveRedirectRequestSchema, { from: '/old', to: '/y' }), ME))).resolves.toBe(
            Code.AlreadyExists
        );
        await expect(refusalOf(handlers.saveRedirect(create(SaveRedirectRequestSchema, { from: 'a', to: '/y' }), ME))).resolves.toBe(
            Code.InvalidArgument
        );
        await expect(refusalOf(handlers.saveRedirect(create(SaveRedirectRequestSchema, { from: '/c', to: ' ' }), ME))).resolves.toBe(
            Code.InvalidArgument
        );
        await expect(
            refusalOf(handlers.saveRedirect(create(SaveRedirectRequestSchema, { id: 'x', from: '/c', to: '/d' }), ME))
        ).resolves.toBe(Code.NotFound);
        expect(await handlers.listRedirects(create(ListRedirectsRequestSchema, { search: 'old' }), ME)).toMatchObject({ total: 2 });
        await handlers.deleteRedirect(create(DeleteRedirectRequestSchema, { redirectId: 'r1' }), ME);
        await expect(refusalOf(handlers.deleteRedirect(create(DeleteRedirectRequestSchema, { redirectId: 'x' }), ME))).resolves.toBe(
            Code.NotFound
        );
        expect(sources.writes).toEqual(['redirect by u1', 'redirect by u1', 'redirects 0/20 old', 'delete redirect r1']);
    });

    it('SC-CMS-26 — a media folder is created, moved and removed; a parent that is itself or gone is refused', async () => {
        const sources: IMemorySources = memorySources();
        const handlers: TCmsDictionaryHandlers = cmsDictionaryHandlers(sources);

        expect(await handlers.saveMediaFolder(create(SaveMediaFolderRequestSchema, { name: 'Pine', parentId: 'd1' }), ME)).toMatchObject({
            folder: { parentId: 'd1' },
        });
        expect(await handlers.saveMediaFolder(create(SaveMediaFolderRequestSchema, { id: 'd1', name: 'Covers' }), ME)).toMatchObject({
            folder: { id: 'd1' },
        });
        expect(await handlers.listMediaFolders(create(ListMediaFoldersRequestSchema), ME)).toMatchObject({
            folders: [{ id: 'd1' }, { id: 'd-new' }],
        });
        await expect(refusalOf(handlers.saveMediaFolder(create(SaveMediaFolderRequestSchema, { name: '' }), ME))).resolves.toBe(
            Code.InvalidArgument
        );
        await expect(refusalOf(handlers.saveMediaFolder(create(SaveMediaFolderRequestSchema, { id: 'x', name: 'a' }), ME))).resolves.toBe(
            Code.NotFound
        );
        await expect(
            refusalOf(handlers.saveMediaFolder(create(SaveMediaFolderRequestSchema, { id: 'd1', name: 'a', parentId: 'd1' }), ME))
        ).resolves.toBe(Code.InvalidArgument);
        await handlers.deleteMediaFolder(create(DeleteMediaFolderRequestSchema, { folderId: 'd1' }), ME);
        await expect(refusalOf(handlers.deleteMediaFolder(create(DeleteMediaFolderRequestSchema, { folderId: 'x' }), ME))).resolves.toBe(
            Code.NotFound
        );
        expect(sources.writes).toEqual(['delete folder d1']);
    });

    it('SC-CMS-22 — a dictionary call without the caller is refused as unauthenticated', async () => {
        await expect(
            refusalOf(cmsDictionaryHandlers(memorySources()).listTags(create(ListTagsRequestSchema), contextOf(null)))
        ).resolves.toBe(Code.Unauthenticated);
    });
});
