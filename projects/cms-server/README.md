# @rt-tools/cms-server

[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](https://github.com/Eyhenij/rt-tools/blob/main/LICENSE)

The CMS server: the admin, site and media library services of `@rt-tools/cms-contract` over a
storage port the application implements, the page rules, the scheduled publication and the copies
of the media library pictures. Access goes through the interceptor of `@rt-tools/auth-server`.

## Serving the services

```ts
import { connectNodeAdapter } from '@connectrpc/connect-node';
import { connectAccessEntries, createAuthInterceptor } from '@rt-tools/auth-server';
import { CmsMediaService, CmsPublicService, CmsService } from '@rt-tools/cms-contract';
import {
    CMS_PUBLIC_SERVICE_ACCESS,
    cmsMediaServiceAccess,
    cmsMediaServiceImpl,
    cmsPublicServiceImpl,
    cmsServiceAccess,
    cmsServiceImpl,
    cmsStoreSources,
} from '@rt-tools/cms-server';

const rights = {
    contentRead: 'content:read',
    contentManage: 'content:manage',
    tagsRead: 'tags:read',
    tagsManage: 'tags:manage',
    redirectsRead: 'redirects:read',
    redirectsManage: 'redirects:manage',
    mediaRead: 'media:read',
    mediaManage: 'media:manage',
};
const sources = cmsStoreSources({
    contentTypes: prisma.contentType,
    contentItems: prisma.contentItem,
    tags: prisma.tag,
    redirects: prisma.redirect,
    folders: prisma.mediaFolder,
    now: () => new Date(),
    mediaFileOf,
});

connectNodeAdapter({
    interceptors: [
        createAuthInterceptor(verifier, [
            ...connectAccessEntries(CmsService, cmsServiceAccess(rights)),
            ...connectAccessEntries(CmsPublicService, CMS_PUBLIC_SERVICE_ACCESS),
            ...connectAccessEntries(CmsMediaService, cmsMediaServiceAccess(rights)),
        ]),
    ],
    routes: (router) => {
        router.service(CmsService, cmsServiceImpl({ sources, locales: ['en', 'de'] }));
        router.service(CmsPublicService, cmsPublicServiceImpl(sources));
        router.service(CmsMediaService, cmsMediaServiceImpl(mediaSources));
    },
});
```

The rights and the site locales are the application's. The storage port `ICmsSources` may be
implemented by hand; `cmsStoreSources` assembles it from the delegates of a database client
declared by their shape, and Prisma delegates fit them as they are.

## The media library

`IMediaSources` takes the file store `IMediaBucket` and the resizer `IMediaResizer` as ports: the
package carries neither a cloud SDK nor a native image library. The file store sets
`MEDIA_CACHE_CONTROL` on every file; `contentItemsUseFile` answers whether a page refers to a file.
`backfillMediaCopies` builds the copies of files uploaded before the copies existed.

## The scheduled publication

`runScheduledPublication({ now, publishDue, onPublished, onFailed })` is called by the application
once a minute; `publishDueContentItems` publishes the due drafts over the pages delegate.
