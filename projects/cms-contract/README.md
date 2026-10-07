# @rt-tools/cms-contract

[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](https://github.com/Eyhenij/rt-tools/blob/main/LICENSE)

The block model, the page model and the Connect contract of the CMS — the part the server, the
admin and the site share. No framework: the package depends on `tslib` and `@bufbuild/protobuf`
and ships CommonJS and ESM.

## The body of a page

A page body is a flat array of blocks `{id, type, content}`, stored as one JSON string. A text
block holds HTML; the rest hold the JSON of their own shape as a string.

```ts
import { EBlockType, parseContentBody, serializeContentBody } from '@rt-tools/cms-contract';

const body = serializeContentBody([{ id: 'b1', type: EBlockType.Heading2, content: 'Kinds of stairs' }]);
parseContentBody(body); // the same blocks; a broken string gives [] and an unknown kind is dropped
```

The content of a block is read by its kind with `buttonOfContent`, `listOfContent`,
`imagesOfContent`, `titledOfContent`, `prosConsOfContent` and `itemLinkOfContent`. A broken content
reads as empty instead of failing.

## The site page

```ts
import { cachedSiteRedirects, siteContentsOf, siteHtmlOf, sitePathOf } from '@rt-tools/cms-contract';

sitePathOf('', 'pine-stairs', '/blog'); // '/blog/pine-stairs' — the section root is the application's
siteContentsOf(blocks); // the H2 headings in order, as text
siteHtmlOf('<span style="font-weight: bold">oak</span>'); // '<b>oak</b>'
```

`cachedSiteRedirects(load)` answers a request path from a redirect list it rereads at most once a
minute. When the CMS server does not answer, the previous list stays.

## The Connect contract

The services are generated from `proto/rt/cms/v1` and exported from the package root:

| Service            | For                                                               |
| ------------------ | ----------------------------------------------------------------- |
| `CmsService`       | the admin: content types, pages, tags, redirects, media folders   |
| `CmsPublicService` | the site: a page by address, published pages, redirects, tags     |
| `CmsMediaService`  | the media library: list, upload and delete a file                 |

```ts
import { createClient } from '@connectrpc/connect';
import { CmsPublicService } from '@rt-tools/cms-contract';

const cms = createClient(CmsPublicService, transport);
```

After an edit of a `.proto` file the code is generated again with
`pnpm exec nx run @rt-tools/cms-contract:codegen`. The generated code is kept in the package, so
building it needs no generator.
