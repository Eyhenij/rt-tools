import type { TPermission } from '@rt-tools/auth-contract';
import type { TAccess, TConnectServiceAccess } from '@rt-tools/auth-server';
import type { CmsMediaService, CmsPublicService, CmsService } from '@rt-tools/cms-contract';

/**
 * The rights the CMS services ask for, named by the application. Each area has a right to read and
 * a right to edit, so a person may see the redirects without being able to change them.
 */
export interface ICmsRights {
    readonly contentRead: TPermission;
    readonly contentManage: TPermission;
    readonly tagsRead: TPermission;
    readonly tagsManage: TPermission;
    readonly redirectsRead: TPermission;
    readonly redirectsManage: TPermission;
    readonly mediaRead: TPermission;
    readonly mediaManage: TPermission;
}

function permitted(permission: TPermission): TAccess {
    return { kind: 'permission', permission };
}

/** The access map of the admin service, one access per method, for the auth server interceptor. */
export function cmsServiceAccess(rights: ICmsRights): TConnectServiceAccess<typeof CmsService> {
    return {
        listContentTypes: permitted(rights.contentRead),
        getContentType: permitted(rights.contentRead),
        updateContentType: permitted(rights.contentManage),
        listContentItems: permitted(rights.contentRead),
        getContentItem: permitted(rights.contentRead),
        createContentItem: permitted(rights.contentManage),
        updateContentItem: permitted(rights.contentManage),
        deleteContentItem: permitted(rights.contentManage),
        setContentItemFeatured: permitted(rights.contentManage),
        lockContentItem: permitted(rights.contentManage),
        unlockContentItem: permitted(rights.contentManage),
        listTags: permitted(rights.tagsRead),
        saveTag: permitted(rights.tagsManage),
        deleteTag: permitted(rights.tagsManage),
        listRedirects: permitted(rights.redirectsRead),
        saveRedirect: permitted(rights.redirectsManage),
        deleteRedirect: permitted(rights.redirectsManage),
        listMediaFolders: permitted(rights.mediaRead),
        saveMediaFolder: permitted(rights.mediaManage),
        deleteMediaFolder: permitted(rights.mediaManage),
    };
}

/** The access map of the media library service. */
export function cmsMediaServiceAccess(rights: ICmsRights): TConnectServiceAccess<typeof CmsMediaService> {
    return {
        listFiles: permitted(rights.mediaRead),
        uploadFile: permitted(rights.mediaManage),
        deleteFile: permitted(rights.mediaManage),
    };
}

/** The access map of the site service: every method is open without a token. */
export const CMS_PUBLIC_SERVICE_ACCESS: TConnectServiceAccess<typeof CmsPublicService> = {
    getWebPage: { kind: 'public' },
    listPublishedContentItems: { kind: 'public' },
    listPublicRedirects: { kind: 'public' },
    listPublicTags: { kind: 'public' },
};
