import { Code, ConnectError, type HandlerContext, type ServiceImpl } from '@connectrpc/connect';
import type { ICaller } from '@rt-tools/auth-contract';
import {
    type CmsService,
    type DeleteMediaFolderRequest,
    type DeleteRedirectRequest,
    type DeleteTagRequest,
    type ListRedirectsRequest,
    redirectTypeOfContract,
    type SaveMediaFolderRequest,
    type SaveRedirectRequest,
    type SaveTagRequest,
} from '@rt-tools/cms-contract';

import { contractFolderOf, contractRedirectOf, contractTagOf, contractTagTreeOf, found, idOrNull } from './cms-contract.function';
import type { IMediaFolderRecord, IRedirectPage, TRedirectDraft } from './cms-records.model';
import type { ICmsSources } from './cms-sources.model';
import { isRedirectPath } from './content-item-rules.function';
import { IListWindow, listWindow, searchTerm, signedCallerOf } from './list-window.function';

type TDictionaryMethods =
    | 'listTags'
    | 'saveTag'
    | 'deleteTag'
    | 'listRedirects'
    | 'saveRedirect'
    | 'deleteRedirect'
    | 'listMediaFolders'
    | 'saveMediaFolder'
    | 'deleteMediaFolder';

/** A parent that is the record itself or is gone is refused: the tree would lose a branch. */
async function checkedParent(
    parentId: string | null,
    selfId: string | null,
    exists: (id: string) => Promise<unknown>,
    what: string
): Promise<string | null> {
    if (parentId !== null && (parentId === selfId || (await exists(parentId)) === null)) {
        throw new ConnectError(`the parent of the ${what} is not found or is the ${what} itself`, Code.InvalidArgument);
    }
    return parentId;
}

function nameOf(name: string, what: string): string {
    if (name.trim() === '') {
        throw new ConnectError(`the ${what} name is empty`, Code.InvalidArgument);
    }
    return name.trim();
}

/** The handlers of the dictionary methods of the admin service. */
export type TCmsDictionaryHandlers = Pick<ServiceImpl<typeof CmsService>, TDictionaryMethods>;

/** The tags, the redirects and the media folders of the admin service. An empty id creates, a filled one edits. */
export function cmsDictionaryHandlers(sources: ICmsSources): TCmsDictionaryHandlers {
    const service: TCmsDictionaryHandlers = {
        listTags: async (_request: unknown, context: HandlerContext) => {
            signedCallerOf(context);
            return { tags: contractTagTreeOf(await sources.tags()) };
        },

        saveTag: async (request: SaveTagRequest, context: HandlerContext) => {
            signedCallerOf(context);
            const tagId: string | null = idOrNull(request.id);
            const name: string = nameOf(request.name, 'tag');
            if (tagId !== null) {
                found(await sources.tagOf(tagId), 'tag');
            }
            const parentTagId: string | null = await checkedParent(idOrNull(request.parentTagId), tagId, sources.tagOf, 'tag');
            return { tag: contractTagOf(await sources.saveTag(tagId, { parentTagId, name, isEnabled: request.isEnabled })) };
        },

        /** The children of a removed tag move to the root, and the pages lose the tag. */
        deleteTag: async (request: DeleteTagRequest, context: HandlerContext) => {
            signedCallerOf(context);
            found(await sources.tagOf(request.tagId), 'tag');
            await sources.deleteTag(request.tagId);
            return {};
        },

        /** A page of the redirects by their source; the search looks at both addresses. */
        listRedirects: async (request: ListRedirectsRequest, context: HandlerContext) => {
            signedCallerOf(context);
            const window: IListWindow = listWindow(request.page, request.pageSize);
            const page: IRedirectPage = await sources.redirectPageOf(window.skip, window.take, searchTerm(request.search));
            return { redirects: page.redirects.map(contractRedirectOf), total: page.total };
        },

        /** One source leads to one place: a second redirect with the same source is refused. */
        saveRedirect: async (request: SaveRedirectRequest, context: HandlerContext) => {
            const caller: ICaller = signedCallerOf(context);
            const redirectId: string | null = idOrNull(request.id);
            if (!isRedirectPath(request.from) || request.to.trim() === '') {
                throw new ConnectError('the source is not a path from the root, or the target is empty', Code.InvalidArgument);
            }
            if (redirectId !== null) {
                found(await sources.redirectOf(redirectId), 'redirect');
            }
            if (await sources.redirectFromTaken(request.from, redirectId)) {
                throw new ConnectError('a redirect with this source already exists', Code.AlreadyExists);
            }
            const draft: TRedirectDraft = { from: request.from, to: request.to.trim(), type: redirectTypeOfContract(request.type) };
            return { redirect: contractRedirectOf(await sources.saveRedirect(redirectId, draft, caller.subject)) };
        },

        deleteRedirect: async (request: DeleteRedirectRequest, context: HandlerContext) => {
            signedCallerOf(context);
            found(await sources.redirectOf(request.redirectId), 'redirect');
            await sources.deleteRedirect(request.redirectId);
            return {};
        },

        /** Every media folder: the screen builds the tree. */
        listMediaFolders: async (_request: unknown, context: HandlerContext) => {
            signedCallerOf(context);
            const folders: IMediaFolderRecord[] = await sources.folders();
            return { folders: folders.map(contractFolderOf) };
        },

        saveMediaFolder: async (request: SaveMediaFolderRequest, context: HandlerContext) => {
            signedCallerOf(context);
            const folderId: string | null = idOrNull(request.id);
            const name: string = nameOf(request.name, 'folder');
            if (folderId !== null) {
                found(await sources.folderOf(folderId), 'folder');
            }
            const parentId: string | null = await checkedParent(idOrNull(request.parentId), folderId, sources.folderOf, 'folder');
            return { folder: contractFolderOf(await sources.saveFolder(folderId, { parentId, name })) };
        },

        /** The files and the nested folders of a removed folder move to the root; no file is removed. */
        deleteMediaFolder: async (request: DeleteMediaFolderRequest, context: HandlerContext) => {
            signedCallerOf(context);
            found(await sources.folderOf(request.folderId), 'folder');
            await sources.deleteFolder(request.folderId);
            return {};
        },
    };
    return service;
}
