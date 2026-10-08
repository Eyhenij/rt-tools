# The server of the CMS — where the rules are carried out

The first column is the rule verbatim, as it is written in the "Rules" section of the spec.

- **A page address is lower-case Latin letters and digits with single hyphens, and its locale is one the application names.** — `projects/cms-server/src/lib/cms-contract.function.ts:itemDraftOf`
- **A page another person holds open is not saved, and their lock is neither taken over nor lifted.** — `projects/cms-server/src/lib/cms-service.ts:cmsServiceImpl`
- **Two pages of one locale never share an address, and two redirects never share a source.** — `projects/cms-server/src/lib/cms-service.ts:cmsServiceImpl`, `projects/cms-server/src/lib/cms-dictionary.handlers.ts:cmsDictionaryHandlers`
- **A published page keeps its publication time, a first publication gets the moment of the edit, and a draft due by its date is published with that date.** — `projects/cms-server/src/lib/content-item-rules.function.ts:publishedAtAfterSave`, `projects/cms-server/src/lib/content-item-store.function.ts:publishDueContentItems`
- **The site shows a published page to everyone, a draft only by its preview token, and an archived page never; the site never gets the token.** — `projects/cms-server/src/lib/content-item-rules.function.ts:isVisibleOnSite`, `projects/cms-server/src/lib/cms-public-service.ts:cmsPublicServiceImpl`
- **A tag or a folder is never its own parent nor the child of a missing one.** — `projects/cms-server/src/lib/cms-dictionary.handlers.ts:checkedParent`
- **A scheduled publication pass that fails is reported, not thrown.** — `projects/cms-server/src/lib/scheduled-publication.function.ts:runScheduledPublication`
- **Every method of the three services declares one access, and the application names the rights: reading and editing each area apart, the site open to everyone.** — `projects/cms-server/src/lib/cms-access.ts:cmsServiceAccess`, `projects/cms-server/src/lib/cms-access.ts:cmsMediaServiceAccess`, `projects/cms-server/src/lib/cms-access.ts:CMS_PUBLIC_SERVICE_ACCESS`
- **A media library file is a JPEG, PNG, WebP, AVIF or GIF picture up to 10 MB, recognised by its bytes.** — `projects/cms-server/src/lib/image-sniff.function.ts:sniffImage`
- **The copies are built before the store, never wider than the original, and a GIF gets none.** — `projects/cms-server/src/lib/media-copies.function.ts:mediaCopyWidths`
- **An upload puts the file before its record and removes it when the record fails; a removal takes the file out before the record and refuses a file a page uses.** — `projects/cms-server/src/lib/media-service.ts:cmsMediaServiceImpl`
- **The backfill builds copies only for files without them, and a failure of one file is named without stopping the rest.** — `projects/cms-server/src/lib/media-copies-backfill.function.ts:backfillMediaCopies`
