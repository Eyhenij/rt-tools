# Progress

## Where we stand

Rewritten by every session, not appended to.

- **State:** `этап-идёт`
- **Stage:** 2 of 3 — the local lists and the PDF viewer; stage 1 is done
- **Done:** the branch from the RT-3294 branch, the grill of the task and the agreement
  `docs/specs/ui-kit-v2/proposed/error-states-selectors/` read from the nine approved frames.
- **Next step:** step 2.2 — `rtPdfViewerError`; it waits for the consumer session's answer on the
  channel (the viewer is opened by the dialog service and has no host markup). Step 2.1 is done:
  six local lists, their states specs (SC-UKV-1291, 1296) and 338 tests of the six families green. The PDF viewer channel and the hybrid trees wait for the consumer
  session's answer; stage 1 does not depend on them.
- **Uncommitted:** no.
- **Waiting for the owner:** no; the consumer session is asked about the push set limit and about
  sending the epic branch with `main` merged in.
- **PR:** not open yet.

## Steps

- [x] 1.1 Add `error`, `errorDescription`, `retry`, `rtAutocompleteEmpty` and `rtAutocompleteError` to `rt-autocomplete`
- [x] 1.2 Add `error`, `errorDescription`, `retry`, `rtDynamicSelectorEmpty` and `rtDynamicSelectorError` to `rt-dynamic-selector`
- [x] 1.3 Cover SC-UKV-1287…1290 by the specs
- [x] 2.1 Add the empty template directive to `rt-select`, `rt-multiselect`, `rt-tree`, `rt-draggable-tree`, `rt-tree-selector` and `rt-side-menu`
- [>] 2.2 Add `rtPdfViewerError` to `rt-pdf-viewer`
- [ ] 2.3 Cover SC-UKV-1291 and SC-UKV-1292 by the specs
- [ ] 3.1 Add a story of the error and the own views for each of the nine components
- [ ] 3.2 Compare the stories with the frames by measurement and show them to the owner

## Decisions along the way

- **The spec critique is folded in before the first stage** — priority over `fetching`, the
  selection window of the dynamic selector, the label keys, the fate of the present empty inputs,
  the local list empty lines and four scenarios more. The milestone G wording of the epic (the
  local lists and the PDF viewer get part of the contract) goes to the consumer session with the
  PDF question.
- **The dynamic selector keeps the error and its slots in one host directive** — the root and the
  standalone popup both take `error`, `errorDescription`, `retry` and the two templates from
  `RtDynamicSelectorLoadStateDirective`; the root stays under the file length limit, and the popup
  reads the root's state through the parts source.

## Sessions

### 14.11.2026

- The branch `RT-3295-selectors-error-state` from `RT-3294-table-lists-error-state`; the grill
  written from the task body, the epic plan and a survey of the nine components.
- The nine RT-3295 frames read in the kit Figma file: slot names, the default line kept without a
  template, the PDF viewer error with download instead of retry. The agreement written from them.
