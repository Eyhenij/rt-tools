# The CMS

**Status:** in force · **Revision:** 2026-10-07 · **Scenario prefix:** `SC-CMS`
**Depends on:** none
**Laws:** `entity-models`, `verifiability`
**Procedures:** none

A block editor and a content management system an application takes as packages: the contract
with the model, the server with the procedures, and the Angular package with the editor, the admin
screens and the site page. Each package is a subdomain with its own spec.

## Why

Every application that keeps pages, articles or news writes the same model, the same editor and
the same admin screens anew. The packages hold them once, and an application adds only its own
block kinds and content types.

## Terminology

| Term           | What it is                                                                |
| -------------- | ------------------------------------------------------------------------- |
| A page         | A content item: a body of blocks, SEO fields, a status, tags and media    |
| A block        | One piece of a page body: `{id, type, content}`                           |
| A content type | The kind of page an application keeps, with the settings of its edit form |
| A redirect     | A 301 or 302 answer from one site path to another                         |

### What it is called in the interface

Not applicable: the domain itself has no screens; the Angular subdomain names its own.

## Rules

- **The contract package imports no framework: neither Angular, nor NestJS, nor RxJS.** The server
  and the client read one model, and a framework in the contract would tie one side to the other.

The rest of the rules live in the subdomains: `contract/spec.md` and `server/spec.md`.

## What is out of scope

- Storage: the application keeps its own database and gives it to the server package as a port.
- Signing in and rights: the entry module.

## Contract

Not applicable at the domain level: the contract subdomain declares the services.

### Refusal codes

Not applicable.

## Data

Not applicable.

## Screens and states

Not applicable.

## Cross-cutting requirements

### Locales

A page has a locale, and the same address may be published in several.

### SEO

A page carries its own SEO fields; the site package writes them into the page.

### Mobile layout

Not applicable at the domain level.

### Several objects

The content belongs to the application as a whole, not to an organisation.

## Decisions

- **The packages carry over a working implementation as it is.** Its approaches are not revised.

## Open questions

None.

## History of changes

- 2026-10-07 — the domain and the contract subdomain, task RT-2592.
- 2026-10-07 — the server subdomain, task RT-2593.
