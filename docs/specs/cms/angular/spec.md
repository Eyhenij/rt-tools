# The Angular client of the CMS

**Status:** in force · **Revision:** 2026-10-07 · **Scenario prefix:** `SC-CMS`
**Depends on:** `contract`, `server`
**Laws:** `entity-editing`, `lists`, `frontend-application`, `verifiability`
**Procedures:** none — the package calls the services of the contract subdomain through the transport the application gives

A subdomain of the CMS: the block editor, the admin screens of pages, content types, tags,
redirects and the media library, and the site part — the page data, the block body, the page head
and the redirects. The package `@rt-tools/cms-angular` holds it in three entries: the root one
(the model, the editor rules, the tokens and the labels), `admin` and `site`.

## Why

An application that edits pages writes the editor, the lists, the lock and the preview anew, and
loses one of the rules on the way: a second style nested in the first, a page saved over a
foreign lock, a draft indexed by search. The package holds them once; the application gives it the
transport, the site address, the languages, the labels and the look of the site blocks.

## Terminology

| Term               | What it is                                                                                 |
| ------------------ | ------------------------------------------------------------------------------------------ |
| The block editor   | The editor of a page body as a list of typed blocks                                        |
| The type settings  | The settings of a content type: which form sections and page fields its pages have         |
| The lock           | The mark that a person holds a page open in the edit form                                  |
| The preview token  | The secret by which a draft opens on the site                                              |
| A block renderer   | The application component that draws one kind of block on the site                         |
| The transfer state | What the site server read, carried to the browser inside the page                          |
| The labels         | The texts of the package screens by key; English by default, the application gives its own |

### What it is called in the interface

The screens are named by the application's menu; the package names them in English by its labels,
and the application translates them by `provideCmsLabels`.

## Rules

- **A text style is applied once and removed by pressing it again; a link keeps its settings and an
  empty one reads as not set.** A nested second style or a lost `rel` breaks the markup on the site.
- **Pasted markup is cleaned before it becomes blocks: scripts, images and handlers go, a link from
  outside is external with `nofollow`, and of the styles only bold, italic and the line stay.** A
  pasted page would carry foreign code and foreign looks.
- **A page form follows its type settings: the name and the address are always required, a required
  field is visible, the sections go in a fixed order, and empty settings turn on the page, the
  tags, the media and the editor.** A type without settings still edits its pages.
- **Saving is closed without edits, with an invalid form, under a foreign lock and during a save; an
  opened page is locked for the caller and released on leaving.** One edit would overwrite another.
- **The preview of a draft and of an archived page carries the token, of a published one does
  not.** A published page opens to everyone and needs no secret.
- **A list keeps its page and search in the address, erases the defaults, and goes back to the first
  page on a new size or search.** A link to a list opens the same rows.
- **A refusal names its cause by the code and keeps the screen as it was; a missing right is named
  apart.** A silent refusal reads as success.
- **Every label has an English default, the application labels win, and they recompute when the
  language changes.** A blank label hides a button.
- **The site draws a page from the public output once on the server and carries it to the browser;
  a draft by a preview token is never carried.** The page does not flicker, and a draft does not
  settle in the markup.
- **A block of a kind the application gave no renderer for is skipped, and a video frame takes only
  a listed provider.** An unknown kind or a foreign frame breaks the page.
- **A draft opened by a token is closed from indexing, and `hreflang` names only the sites where the
  page is published in their language; leaving the page brings the head back.** Search would index a
  draft or send a reader to a missing page.
- **The site server answers by a CMS redirect before drawing the page and carries the query over;
  without an answer from the CMS the former list stays.** A redirect lost for a minute is better
  than a site that does not answer.

## What is out of scope

- The look of the site blocks, the page layout, the breadcrumbs and the structured data wording —
  the application's.
- The application menu and the access guards of the screens — the application's.
- The server rules of a page — the server subdomain.

## Contract

Not applicable as procedures: the package calls the admin, site and media library services of the
contract subdomain. The README lists what each entry gives.

### Refusal codes

Not applicable: the package throws no codes. It reads the ones the server subdomain declares and
names a missing right, a taken address or source and a foreign lock or a used file apart.

## Data

Not applicable: the package keeps no storage. The list state lives in the address, the site page in
the transfer state.

## Screens and states

The admin entry gives the screens by `cmsRoutes` and `mediaRoutes`: content types, type settings,
pages of a type, the page edit, tags, redirects with the side panel and the media library. Every
list has the loading, empty, failed and filled states; the page edit has the loading, failed,
locked by another person and saving states.

## Cross-cutting requirements

### Locales

The languages are named by the application through `provideCms`; the screens show their codes.

### SEO

The site part sets the title, the description, the card, `robots` for a draft and `hreflang` by the
published languages; the sitemap is built from the published pages.

### Mobile layout

The screens use the kit layout and its breakpoints; the package adds none.

### Several objects

The content belongs to the application as a whole, not to an organisation.

## Decisions

- **Three entries in one package.** The site part must not drag the editor and the admin screens
  into the site bundle. Rejected: three packages — they would be released together anyway.
- **The look of a site block is the application's; the package gives the registry.** A styled block
  would have to be restyled by every site. Rejected: default styled blocks.
- **The page screen of the site stays in the application.** Its layout and wording are the site's;
  what of it is CMS went into the page client, the body and the head service.
- **The labels are a token with English defaults, not an i18n build.** The package ships one build
  for every application language.

## Open questions

None.

## History of changes

- 2026-10-07 — the Angular client, task RT-2594.
