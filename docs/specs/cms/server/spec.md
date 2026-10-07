# The server of the CMS

**Status:** in force · **Revision:** 2026-10-07 · **Scenario prefix:** `SC-CMS`
**Depends on:** `contract`
**Laws:** `entity-models`, `verifiability`
**Procedures:** none — the package gives Connect service implementations, and the application serves them on its own router

A subdomain of the CMS: the admin, site and media library services over a storage port, the page
rules, the scheduled publication and the copies of the media library pictures. The package
`@rt-tools/cms-server` holds it.

## Why

The rules of a page — who may save it, when it goes out, who sees a draft — live on the server. An
application that keeps them itself writes them anew and loses one of them on the way. The package
holds them once; the application gives it its database, its file store and the names of its rights.

## Terminology

| Term              | What it is                                                                                 |
| ----------------- | ------------------------------------------------------------------------------------------ |
| The storage port  | The object the application implements: every read and write the services need              |
| A delegate        | The part of a database client for one table, declared by its shape; a Prisma delegate fits |
| The lock          | The mark that a person holds a page open in the edit form                                  |
| The preview token | The secret by which a draft opens on the site                                              |
| A copy            | A reduced WebP version of a media library picture of one width                             |
| The backfill      | The pass that builds the copies of files uploaded before the copies existed                |

### What it is called in the interface

Not applicable: the package has no screens.

## Rules

- **A page address is lower-case Latin letters and digits with single hyphens, and its locale is one
  the application names.** A page on another locale has nowhere to be shown.
- **A page another person holds open is not saved, and their lock is neither taken over nor
  lifted.** One edit would overwrite the other.
- **Two pages of one locale never share an address, and two redirects never share a source.** Two
  pages would answer one link.
- **A published page keeps its publication time, a first publication gets the moment of the edit,
  and a draft due by its date is published with that date.** A page that comes back keeps its date.
- **The site shows a published page to everyone, a draft only by its preview token, and an
  archived page never; the site never gets the token.** The token opens a draft to whoever has it.
- **A tag or a folder is never its own parent nor the child of a missing one.** The tree would lose
  a branch.
- **A scheduled publication pass that fails is reported, not thrown.** The server keeps running and
  tries again next time.
- **Every method of the three services declares one access, and the application names the rights:
  reading and editing each area apart, the site open to everyone.** A forgotten method opens
  nothing.
- **A media library file is a JPEG, PNG, WebP, AVIF or GIF picture up to 10 MB, recognised by its
  bytes.** The name and the declared type are never trusted.
- **The copies are built before the store, never wider than the original, and a GIF gets none.** A
  damaged picture is refused whole, and a GIF copy would lose its animation.
- **An upload puts the file before its record and removes it when the record fails; a removal
  takes the file out before the record and refuses a file a page uses.** A record without a file is
  a broken picture.
- **The backfill builds copies only for files without them, and a failure of one file is named
  without stopping the rest.** A second run builds nothing.

## What is out of scope

- The database schema and the migrations — the application's.
- The file store and the picture resizer — the application implements their ports.
- Checking the token — the auth server package.

## Contract

Not applicable as procedures: the package serves the three services of the contract subdomain as
service implementations with their access maps — the admin one by `cmsServiceImpl` and
`cmsServiceAccess`, the site one by `cmsPublicServiceImpl` and `CMS_PUBLIC_SERVICE_ACCESS`, the
media library one by `cmsMediaServiceImpl` and `cmsMediaServiceAccess`. The README lists them.

### Refusal codes

- `Unauthenticated` — an admin method reached without the caller the auth interceptor accepts.
- `InvalidArgument` — a malformed address, a foreign locale, broken settings, an empty name, a
  wrong parent, a file that is not a picture or a damaged picture.
- `NotFound` — a record by its id, a page by its address, a gone folder.
- `AlreadyExists` — a taken page address or redirect source.
- `FailedPrecondition` — a page another person holds open, a used file, a missing file store.

## Data

Not applicable: storage is the application's. The delegates expect the tables `content_types`,
`content_items` with `content_item_tags`, `content_item_connections` and `content_item_images`,
`tags`, `redirects`, `media_folders` and `media_files`; the file use query reads three of them by
name.

## Screens and states

Not applicable.

## Cross-cutting requirements

### Locales

The locales of the site are named by the application; a page is checked against them.

### SEO

Not applicable: the site package writes the fields.

### Mobile layout

Not applicable.

### Several objects

The content belongs to the application as a whole, not to an organisation.

## Decisions

- **The services are Connect service implementations with access maps, not NestJS classes.** The
  application registers them on its own router; the access goes through the auth interceptor.
  Rejected: one class per procedure with a decorator registry — the registry belongs to the
  application.
- **The file store and the resizer stay ports.** The package would otherwise carry a native image
  library and a cloud SDK.

## Open questions

None.

## History of changes

- 2026-10-07 — the server, task RT-2593.
