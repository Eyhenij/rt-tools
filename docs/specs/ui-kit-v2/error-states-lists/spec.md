# Load error and placeholder states of the table and the lists

**Status:** in force · **Revision:** 2026-11-14 · **Scenario prefix:** `SC-UKV`
**Depends on:** `rt-empty-state`, the kit dictionary, the load error helper of `error-states`
**Laws:** `frontend-application`, `mockups`, `verifiability`
**Procedures:** none

## Why

A table or a list whose load failed shows the empty placeholder or nothing at all. The reader takes
a broken connection for "no records" and has no way to repeat the load. Only the table lets the
consumer replace its empty view, and only by a template reference; the three lists do not.

This agreement gives `rt-table`, `rt-data-list`, `rt-dynamic-list` and `rt-bar-list` the contract
the conversation components already hold (`docs/specs/ui-kit-v2/error-states/`): an error input, a
retry output and views by templates.

## Terminology

- **Load error** — the consumer passed a non-null `error`: the data could not be fetched.
- **Placeholder** — what stands instead of rows: the error or the empty state.
- **Own view** — a template the consumer declares to replace the default placeholder.

### What it is called in the interface

The person sees «Не удалось загрузить», a hint and a «Повторить» button. They never see the words
error input or template.

## Rules

- **The error wins over loading and emptiness.** With `error` not null the component draws the
  error instead of its rows, whatever `loading`, `fetching` and the rows say.
- **An error after a page, sort or filter change looks the same as the first one.** The table and
  the data list draw the same error view in place of the rows; they keep their head, toolbar and
  pagination.
- **The retry button emits `retry` and nothing else.** The component does not reload by itself.
- **The default error view is `rt-empty-state` with the alert icon, a title, a hint and an outlined
  «Повторить» button.** The title is the `error` text when it is not empty, otherwise the label
  `uiLoadError`; the hint is the `errorDescription` input or the label `uiLoadErrorHint`.
- **An own view replaces the default one whole.** `rtTableEmptyState`, `rtTableError`,
  `rtDataListEmpty`, `rtDataListError`, `rtDynamicListEmpty`, `rtDynamicListError`,
  `rtBarListEmpty` and `rtBarListError`; the error template gets the error text and a retry
  function.
- **The table keeps its `#rtTableEmpty` reference.** A template declared by that reference still
  replaces the empty view; the directive `rtTableEmptyState` stands next to it and wins when both
  are declared.
- **The table error placeholder is 400 wide in the middle of the row; the data list error takes
  the width of the list.** The dynamic list and the bar list placeholders take their width too.

## What is out of scope

- The conversation components — merged in `docs/specs/ui-kit-v2/error-states/`.
- Selectors, local placeholders and the PDF viewer — task RT-3295.
- A load more error row: none of the four frames draws one.

## Contract

Not applicable: the components are a client library and call no procedures.

### Refusal codes

Not applicable.

## Data

Inputs and outputs only; the consumer owns the data and the reload.

## Screens and states

The approved frames of the kit Figma file: Table 7910:2186, Data List 7911:1755, Dynamic List
7912:1028, Bar List 7912:1214.

## Cross-cutting requirements

### Locales

The labels `uiLoadError`, `uiLoadErrorHint`, `uiRetry` already live in the kit dictionary.

### SEO

Not applicable.

### Mobile layout

The placeholder centres inside the component and its hint wraps.

### Several objects

Not applicable.

## Decisions

- **The table directive is `rtTableEmptyState`, not `rtTableEmpty`** — the reference name
  `#rtTableEmpty` is already read by `contentChild('rtTableEmpty')`, and a directive selector of the
  same word would make both match the same template ambiguously. The approved frame names it so.

## Open questions

None.

## History of changes

- 2026-11-14 — written for RT-3294.
- 2026-11-14 — merged into the kit spec with the bindings to code; the placeholder widths added
  after the match with the approved frames.
