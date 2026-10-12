# The contract of the CMS

**Status:** in force · **Revision:** 2026-10-07 · **Scenario prefix:** `SC-CMS`
**Depends on:** none
**Laws:** `entity-models`, `verifiability`
**Procedures:** none

A subdomain of the CMS: the block model, the page model, the site page functions and the Connect
contract. The package `@rt-tools/cms-contract` holds it, and the server and the Angular packages
take it from there.

## Why

The editor writes a body and the site reads it; the server stores a state and the admin shows it.
If each side keeps its own copy of the model, the copies drift apart, and a block the editor wrote
is not drawn on the site. One package holds the model once for every side.

## Terminology

| Term             | What it is                                                                         |
| ---------------- | ---------------------------------------------------------------------------------- |
| The body         | The blocks of a page, stored as one JSON string                                    |
| The content      | The string of one block: HTML for a text block, the JSON of its shape for the rest |
| The section root | The site path under which pages without their own link live, such as `/blog`       |
| The contents     | The list of H2 headings of a page shown beside it                                  |

### What it is called in the interface

Not applicable: the package has no screens.

## Rules

- **A broken body string reads as an empty body, and a block of an unknown kind is dropped.** The
  page draws what it can instead of failing on one block.
- **A broken block content reads as empty, not as a failure.** One bad block does not take the
  page down, in the editor or on the site.
- **The page state and the redirect kind go to the contract by one table, and an unknown contract
  redirect kind reads as permanent.** Two copies of the table drift apart silently.
- **The page contents are the H2 headings of the body in order, as text without markup, and an
  empty heading is left out.** The contents are built from the body, not kept beside it.
- **A page path is its own link, or its address under the section root the application names.**
  The root is not fixed: one application keeps a blog, another keeps news.
- **A redirect answers 301 or 302 and carries the query string into the new address unless that
  address has its own.** The tracking marks of a link survive the move.
- **The redirect list is reread at most once per its time; when the CMS server does not answer, the
  previous list stays, and without one there is no redirect.** A page is never refused because the
  CMS server is down.
- **An editor emphasis reaches the page as an emphasis tag, and the styled span is dropped with all
  its attributes.** The sanitizer of the site drops the style, so the emphasis would be lost.

## What is out of scope

- Cleaning a pasted HTML — the Angular package: it needs a DOM.
- Serving the procedures — the server package.

## Contract

Not applicable: the package serves no procedures. The services it declares, generated from
`projects/cms-contract/proto/rt/cms/v1`, are listed in the package README; the server package
serves them.

### Refusal codes

Not applicable: the functions return a value and throw nothing.

## Data

Not applicable: storage is the application's.

## Screens and states

Not applicable.

## Cross-cutting requirements

### Locales

Not applicable: the package keeps no texts.

### SEO

Not applicable.

### Mobile layout

Not applicable.

### Several objects

Not applicable.

## Decisions

- **The contract is generated from `.proto` inside the package, and the generated code is kept in
  it.** Whoever builds the package needs no generator. Rejected: generating on every build — the
  build would depend on a binary tool.
- **The media file messages live in this contract.** A page carries its main image as a media file.

## Open questions

None.

## History of changes

- 2026-10-07 — the contract, task RT-2592.
