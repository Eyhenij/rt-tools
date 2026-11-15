# Load error and own placeholders of the selectors, the local lists and the PDF viewer

**Status:** in force · **Revision:** 2026-11-14 · **Scenario prefix:** `SC-UKV`
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

- **A server selector draws the load error instead of the options.** With `error` not null the
  error stands whatever `loading`, `fetching` and the options say, without a spinner; an error on a
  later page replaces the shown options too: the selectors have no load-more error row.
- **In `rt-dynamic-selector` the view stands in its selection window.** With `error` not null the
  field never draws «Выбирать не из чего»: the window opens on the error. «Применить» and «Выбрать
  все» are hidden while the error stands. The standalone `rt-dynamic-selector-popup` takes the same
  `error`, `errorDescription`, `retry` and both templates.
- **In `rt-autocomplete` the panel stays open after «Повторить».** Arrows and Enter choose nothing
  while the error stands, and the error view stands outside the options list role.
- **The retry button emits `retry` and nothing else.** The selector does not repeat the request by
  itself.
- **The default error view of a server selector is `rt-empty-state` with the alert icon, the title,
  the hint and an outlined «Повторить» button.** The title is the `error` text when it is not
  empty, otherwise the label `uiLoadError`; the hint is the `errorDescription` input or the label
  `uiLoadErrorHint`; the button is `uiRetry`.
- **The error view in the `rt-autocomplete` panel is compact.** The approved frame draws a circle
  of 40 with an icon of 20, the title in italics in the placeholder colour and a small «Повторить»
  button of 104 by 32. The hint stands only when `errorDescription` is set: the frame draws the
  case without it, and the panel of 280 has no room for the label `uiLoadErrorHint`.
- **A server selector takes both own views.** `rtDynamicSelectorEmpty`, `rtDynamicSelectorError`,
  `rtAutocompleteEmpty` and `rtAutocompleteError`; the empty template gets the typed text as
  `$implicit`, the error template gets the error text as `$implicit` and a `retry` function.
- **A directive template wins over the present empty inputs.** It wins over `emptyTemplate`,
  `emptyText`, `emptyResultsText` and `emptyIcon`; without a template those inputs work as before.
- **A local list takes an own empty view and has no error.** `rtSelectEmpty`, `rtMultiselectEmpty`,
  `rtTreeEmpty`, `rtDraggableTreeEmpty`, `rtTreeSelectorEmpty` and `rtSideMenuEmpty` stand wherever
  the component draws its empty line today — «Нет вариантов» and «Ничего не найдено» alike; the
  template gets the search text as `$implicit`. `rt-tree-selector` passes its template to the
  inner tree, so it covers zero nodes too. `rt-side-menu` draws it only on a search with no
  results. Without a template the present line stays.
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

The labels `uiLoadError`, `uiLoadErrorHint` and `uiRetry` already live in the kit dictionary. The
text «Не удалось загрузить варианты» on the frames is the sample `error` the consumer passes.

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
- **The PDF viewer gets its template through the opening data.** The dialog service opens it, and
  it has no host markup to project into. The consumer declares `<ng-template rtPdfViewerError>`,
  reads the directive by `viewChild` and passes its `templateRef` as `errorTemplate` of
  `IRtPdfViewer.Data`. The error text in the context is the kit label: the viewer swallows the
  cause, and the cause of a broken file means nothing to the reader.
- **`rt-hybrid-tree` and `rt-hybrid-tree-selector` stay out of this task.** None of the nine
  approved frames draws them; their empty slot needs frames of its own.

## Open questions

None.

## History of changes

- 2026-11-14 — written for RT-3295 from the approved frames.
- 2026-11-14 — merged into the kit spec with the bindings to code; the compact autocomplete error
  added after the match with the approved frame, and the autocomplete keyboard stopped choosing
  hidden options under the error.
