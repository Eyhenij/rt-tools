# The verdict of the layout about one file

**Status:** in force · **Revision:** 2026-09-10 · **Scenario prefix:** `SC-AK`
**Depends on:** none
**Laws:** `verifiability`
**Procedures:** none

## Why

The layout puts everything or nothing: a refusal by one file writes nothing at all. So the verdict
about a single file is the price of the whole run, and the word of the verdict is what the reader
acts by. "Edited by hand" said about a file whose body matches the package byte for byte sends
them looking for an edit that is not there, and the fix — remove the file and lay it out again —
has to be derived on one's own.

## Terminology

- **The header** — the line `rt-kit v… · <resource> · <digest>` at the top of a laid-out file.
- **The body** — everything under the header.
- **The verdict** — what the layout decides about the file: put, put again, refuse, return the
  right to run, leave alone.

### What it is called in the interface

There is no interface: the verdict is visible as a line of the layout output.

## Rules

- **A file whose body matches the package is never a refusal.** The header alone diverged — the
  file is put again and the divergence of the header is named.
- **A body that differs from the package one is a hand edit and a refusal.** Putting it again
  would lose the edit, and there is nothing to take apart: the tree no longer holds it.
- **A file without a header was put by somebody else and is not touched.**
- **A hook lands with the right to be executed, a check does not.** A hook without the bit does not
  start at all and looks installed.
- **A right removed by hand the layout brings back, and the audit does not stay silent about it.**

## What is out of scope

- What the layout reports about the tree as a whole — the subdomain of the layout report.
- The place where an edit of a laid-out file is lawful — the subdomain of the place of an edit.

## Contract

The surface is the decision function of the layout: the path, the resource, the rendered body and
what lies on disk go in; the verdict and what to write come out. No refusal code — the verdict is
a word.

### Refusal codes

Not applicable: the layout answers with a verdict, not with a code.

## Data

There is no data of its own: the header and the body of the file on disk.

## Screens and states

There are no screens.

## Cross-cutting requirements

### Locales

The words of the verdict are in the language of the tree that carries the package.

### SEO

Not applicable.

### Mobile layout

Not applicable.

### Several objects

The verdict is given per file; the run is refused whole by any refusal among them.

## Decisions

- **The divergence of the header alone got a verdict of its own instead of joining "put again".**
  Silence about it would leave the reader with a file that lay refused a minute ago and now does
  not — with no word about what happened.

## Open questions

None.

## History of changes

- 2026-09-10 — the subdomain was created: the scenario file of the layout outgrew the length limit,
  and the verdict about one file is a subject of its own.
