<!-- rt-kit v0.28.0 · samples/specs/_template/spec.md · d281e58fe4b7 · правится надстройкой, не здесь -->
# <Domain>

**Status:** in force · **Revision:** <date> · **Scenario prefix:** `SC-<PREFIX>`
**Depends on:** <domains without which this one does not work, or "none">
**Laws:** `<law>`, `<law>`
**Procedures:** <libs whose procedures the domain serves, or "none">

The sections below are all mandatory: a missing section is a refusal, and "not applicable" is a
lawful answer. The product agreement written before the code lies in `proposed/<feature>/` of this
same domain and merges here by the last commit of the PR — with the scenario numbers unchanged.

## Why

<What the domain solves and what its absence costs. Not a retelling of the implementation.>

## Terminology

| Term   | What it is |
| ------ | ---------- |
| <term> | <meaning>  |

### What it is called in the interface

| In the agreement | On the screen |
| ---------------- | ------------- |
| <term>           | <label>       |

## Rules

- **<a statement about the product>.** <Reason: what happens if this is not kept.> Every
  statement gets a `file:symbol` binding line in `implementation.md` next to it.

## What is out of scope

- <a neighbouring area and where to go for it>

## Contract

<The domain's procedures as a table: name, what it takes, what it returns. No procedures — "not applicable".>

### Refusal codes

| Code   | When                    |
| ------ | ----------------------- |
| <code> | <what it is thrown on>  |

## Data

<Storage records the domain owns. None of its own — "not applicable".>

## Screens and states

<The domain's screens and the states of each: empty, loading, failure, ready. No screens — "not applicable".>

## Cross-cutting requirements

### Locales

<What is translated and where the keys live.>

### SEO

<Titles, addresses, markup. Not applicable — written just so.>

### Mobile layout

<What changes on a narrow screen.>

### Several objects

<What the domain has of its own for each owned object.>

## Decisions

- **<decision>** — <reason>. Rejected: <alternative and why>.

## Open questions

- `Q-<number>` — <the question and the assumption the work goes with>.

## History of changes

- <date> — <what changed>.
