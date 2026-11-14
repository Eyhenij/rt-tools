# Load error and own placeholders of the selectors, the local lists and the PDF viewer

**Status:** proposed · **Revision:** 2026-11-14 · **Scenario prefix:** `SC-UKV`
**Depends on:** `rt-empty-state`, the kit dictionary, the load error helper of `error-states`
**Laws:** `frontend-application`, `mockups`, `verifiability`
**Procedures:** none

## Why

The selectors and the local lists of the kit draw «ничего не найдено» by their own markup, and the
consumer cannot put their own view there. `rt-dynamic-selector` and `rt-autocomplete` load their
options from a server, yet a failed load looks like an empty result, and the person cannot repeat
it. `rt-pdf-viewer` draws its own error, and the consumer cannot replace it.

This agreement brings the contract of `docs/specs/ui-kit-v2/error-states/` and
`docs/specs/ui-kit-v2/error-states-lists/` to these nine components, as far as each of them needs
it.

## Terminology

- **Load error** — the consumer passed a non-null `error`: the options could not be fetched.
- **Server selector** — `rt-dynamic-selector` and `rt-autocomplete`: their options come from the
  consumer's request.
- **Local list** — `rt-select`, `rt-multiselect`, `rt-tree`, `rt-draggable-tree`,
  `rt-tree-selector`, `rt-side-menu`: their items are already in memory, so they have no load
  error.
- **Own view** — a template the consumer declares to replace the default placeholder.

### What it is called in the interface

The person sees «Не удалось загрузить варианты», a hint and a «Повторить» button in the panel of a
server selector. They never see the words error input or template.

## Rules

- **A server selector draws the load error in its panel instead of the options.** With `error` not
  null the panel shows the error whatever `loading` and the options say; the search window of
  `rt-dynamic-selector` shows the same view.
- **The retry button emits `retry` and nothing else.** The selector does not repeat the request by
  itself.
- **The default error view of a server selector is `rt-empty-state` with the alert icon, the title,
  the hint and an outlined «Повторить» button.** The title is the `error` text when it is not
  empty, otherwise the label of the kit; the hint is the `errorDescription` input or the label of
  the kit.
- **A server selector takes both own views.** `rtDynamicSelectorEmpty`, `rtDynamicSelectorError`,
  `rtAutocompleteEmpty` and `rtAutocompleteError`; the error template gets the error text as
  `$implicit` and a `retry` function.
- **The `emptyTemplate` input of `rt-autocomplete` keeps working.** The directive
  `rtAutocompleteEmpty` wins when both are given.
- **A local list takes an own empty view and has no error.** `rtSelectEmpty`, `rtMultiselectEmpty`,
  `rtTreeEmpty`, `rtDraggableTreeEmpty`, `rtTreeSelectorEmpty` and `rtSideMenuEmpty` replace the
  «ничего не найдено» line; without a template the line stays as it was.
- **The PDF viewer takes an own error view and keeps its error internal.** `rtPdfViewerError`
  replaces the default error; the template gets the error text as `$implicit` and a `download`
  function. The viewer gets neither an `error` input nor a `retry` output, and its default error
  keeps the «Скачать» button.

## What is out of scope

- The conversation components, the table and the lists — merged in
  `docs/specs/ui-kit-v2/error-states/` and `docs/specs/ui-kit-v2/error-states-lists/`.
- A load error of a local list: its items do not come from a request.
- A retry of the PDF viewer: the document is the consumer's file, and the frame draws download only.

## Contract

Not applicable: the components are a client library and call no procedures.

### Refusal codes

Not applicable.

## Data

Inputs and outputs only; the consumer owns the data and the repeated request.

## Screens and states

The approved frames of the kit Figma file: Autocomplete 7916:1591, Dynamic Selector 7916:896,
Select 7917:5371, Multiselect 7917:5407, Tree 7917:5443, Draggable Tree 7917:5456, Tree Selector
7917:5472, Side Menu 7917:5561, PDF Viewer 7917:583.

## Cross-cutting requirements

### Locales

The labels of the error view live in the kit dictionary; the selector title «Не удалось загрузить
варианты» is added in eight languages if the dictionary lacks it.

### SEO

Not applicable.

### Mobile layout

The panel of a server selector opens as the bottom sheet on a narrow screen; the error view stands
in it the same way.

### Several objects

Not applicable.

## Decisions

- **The local lists get no error input** — their items are in memory, and every frame of them says
  so.
- **The PDF viewer keeps download instead of retry** — the approved frame draws it so.

## Open questions

None.

## History of changes

- 2026-11-14 — written for RT-3295 from the approved frames.
