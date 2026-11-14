# Load error and placeholder states of the conversation components

**Status:** proposed · **Revision:** 2026-11-14 · **Scenario prefix:** `SC-UKV`
**Depends on:** `rt-empty-state`, the kit dictionary
**Laws:** `frontend-application`, `mockups`, `verifiability`
**Procedures:** none

## Why

A list of conversations whose load failed shows the same placeholder as an empty list. The reader
takes a broken connection for "no conversations yet" and has no way to repeat the load. The chat
and the details panel have no error view at all, and the consumer that wants its own texts has to
rebuild the whole placeholder by hand and repeat the search and filter condition.

This agreement gives `rt-thread-list`, `rt-chat` and `rt-workspace-details` one contract: an error
input, a retry output, texts by inputs and views by templates. The tables, lists and selectors take
the same contract in the next tasks of the epic.

## Terminology

- **Load error** — the consumer passed a non-null `error`: the data could not be fetched.
- **Load more error** — a load error while rows are already shown: the next page failed.
- **Placeholder** — what stands instead of rows: the error, the empty state or "nothing found".
- **Own view** — a template the consumer declares to replace the default placeholder.

### What it is called in the interface

The person sees «Не удалось загрузить», a hint and a «Повторить» button; for an empty list —
«Пока пусто» or «Ничего не найдено». They never see the words error input or template.

## Rules

- **The error wins over loading and emptiness.** With `error` not null the component draws the
  error, whatever `loading` and the rows say; otherwise loading without rows draws the skeleton;
  otherwise an empty list draws the placeholder.
- **A load more error keeps the rows.** With rows shown and `error` not null, `rt-thread-list` puts
  an error row with the same retry button below the rows and hides none of them.
- **The retry button emits `retry` and nothing else.** The component does not reload by itself:
  the consumer owns the data.
- **The default error view is `rt-empty-state` with the alert icon, a title, a hint and an outlined
  «Повторить» button.** The title is the `error` text when it is not empty, otherwise the label
  `uiLoadError`; the hint is the `errorDescription` input or the label `uiLoadErrorHint`; the button
  label is `uiRetry`.
- **The empty and nothing-found texts of `rt-thread-list` are inputs.** `emptyTitle`,
  `emptyDescription`, `nothingFoundTitle`, `nothingFoundDescription`; without them the kit labels
  stand. Nothing found is shown when search or filters are active, empty otherwise.
- **An own view replaces the default one whole.** `rtThreadListEmpty`, `rtThreadListError`,
  `rtChatEmpty`, `rtChatError` and `rtWorkspaceDetailsError` take the place of the default
  placeholder; the error template gets the error text and a retry function, the thread list empty
  template gets `filtered`.
- **The chat placeholder without a conversation has a title, a hint and an icon.** `emptyTitle`,
  `emptyHint` and `emptyIcon` set them; the hint shows the kit label when the input is empty.
- **The width of the placeholder is set by a variable, not by an own view.** The variable
  `--rt-empty-state-max-width` limits the placeholder; the kit leaves it unlimited, and the chat
  sets 400 as in its approved frame. A consumer stretches the chat placeholder to its column by the
  same variable.
- **The thread list header has no side padding of its own.** Search, filters, the tab switch and
  the rows stand on one edge — the padding of the list.
- **The tab switch stands 8 px from the header line and 8 px from the content.**

## What is out of scope

- Tables, data lists, dynamic lists and bar lists — task RT-3294.
- Selectors, local placeholders and the PDF viewer — task RT-3295.
- The first kit.

## Contract

Not applicable: the components are a client library and call no procedures.

### Refusal codes

Not applicable.

## Data

Inputs and outputs only; the consumer owns the data and the reload.

## Screens and states

The approved frames of the kit Figma file: Thread List 7899:1537, Chat 7900:2099, Workspace
Details 7901:2901. The library set Thread List carries the messenger variants with the spacing.

## Cross-cutting requirements

### Locales

The labels `uiLoadError`, `uiLoadErrorHint`, `uiRetry` and the empty labels live in the kit
dictionary in all its languages.

### SEO

Not applicable.

### Mobile layout

The placeholder keeps its width limit and centres inside a narrow column; the hint wraps.

### Several objects

Not applicable.

## Decisions

- **Texts by inputs, views by templates** — a consumer that needs other words should not rebuild
  the placeholder and repeat the search condition.

## Open questions

None.

## History of changes

- 2026-11-14 — written for RT-3292.
