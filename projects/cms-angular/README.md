# @rt-tools/cms-angular

[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](https://github.com/Eyhenij/rt-tools/blob/main/LICENSE)

The CMS client for Angular over the services of `@rt-tools/cms-contract`. Three entries:

- `@rt-tools/cms-angular` — the page model, the block editor rules, the paste cleaning, the
  configuration tokens and the labels;
- `@rt-tools/cms-angular/admin` — the block editor, the stores and the admin screens of pages,
  content types, tags, redirects and the media library;
- `@rt-tools/cms-angular/site` — the page client with the transfer state, the block body, the page
  head and the redirects of the site server.

The site imports only the `site` entry, so the editor and the admin screens stay out of its bundle.

## Setting up

```ts
import { createConnectTransport } from '@connectrpc/connect-web';
import { provideCms } from '@rt-tools/cms-angular';

bootstrapApplication(AppComponent, {
    providers: [
        provideCms({
            transport: createConnectTransport({ baseUrl: '/api' }),
            siteAddress: { baseUrl: 'https://example.org', sectionRoot: '/blog' },
            locales: ['en', 'de'],
            translator, // optional: Signal<TCmsTranslator>; without it the screens speak English
        }),
    ],
});
```

The first locale is the language of a new page. `translator` turns a label key into the
application's text; a key it leaves blank keeps its English default, and the labels recompute when
the signal changes.

## The admin screens

```ts
export const routes: Routes = [
    {
        path: 'content',
        canActivate: [contentGuard],
        loadChildren: async () => (await import('@rt-tools/cms-angular/admin')).cmsRoutes,
    },
    {
        path: 'media',
        canActivate: [mediaGuard],
        loadChildren: async () => (await import('@rt-tools/cms-angular/admin')).mediaRoutes,
    },
];
```

The routes are mounted by `loadChildren`, not by `children`. The admin entry is packed into one
file, and the screens inside it do not load apart: a static import of `cmsRoutes` puts the whole
entry, the block editor included, into the initial bundle of the application. Loaded by
`loadChildren`, the entry leaves for a chunk of its own and loads on the first visit to the section.

The routes are flat under the mount point: content types, type settings, the pages of a type, the
page edit, tags and redirects. The redirect panel opens in the `ro` side outlet. The menu and the
access guards are the application's.

## The site

```ts
import { SitePagesApiService, SitePageHeadService, provideCmsBlockRenderers } from '@rt-tools/cms-angular/site';

providers: [
    provideCmsBlockRenderers({
        [EBlockType.Quote]: QuoteBlockComponent,
        [EBlockType.Image]: ImageBlockComponent,
    }),
];
```

- `SitePagesApiService` reads the published pages, a page by its address and the tags. The site
  server reads them once and carries them to the browser; a draft by a preview token is never
  carried.
- `<rt-cms-site-blocks [blocks]="page.blocks" />` draws the body by the renderers the application
  gave; a renderer is a component with the `content` input. A kind without a renderer is skipped.
- `SitePageHeadService.apply(page, { url, preview, locales, hreflangsOf })` sets the title, the
  description and the card, closes a draft from indexing and keeps `hreflang` only for the sites
  where the page is published in their language; `clear()` puts the head back.
- `sitemapXmlOf` builds the sitemap of the published pages, `embedSrcOf` the player address of a
  listed video provider.

The site server answers by the CMS redirects before rendering:

```ts
import { cmsSiteRedirects } from '@rt-tools/cms-angular/site';

const redirectOf = cmsSiteRedirects(createConnectTransport({ baseUrl: cmsUrl, httpVersion: '1.1' }));

app.use((req, res, next) => {
    const queryAt = req.originalUrl.indexOf('?');
    redirectOf(req.path, queryAt === -1 ? '' : req.originalUrl.slice(queryAt + 1))
        .then((answer) => (answer === null ? next() : res.redirect(answer.status, answer.location)))
        .catch(next);
});
```

The list is read again at most once a minute; without an answer from the CMS the former list stays.
