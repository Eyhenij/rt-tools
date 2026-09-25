# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 1 of 2 — Measure and fix
- **Done:** thirteen items of the owner's third list of fourteen are done and committed; the
  second kit's frames are retaken, 642 of 642 on a second pass.
- **Next step:** retake the admin panel frames that show the page strip label, then the answer
  about the text editor's library.
- **Uncommitted:** no.
- **Waiting for the owner:** no.
- **PR:** not open yet.

## Steps

- [x] 1.1 The list takes the width of its column
- [x] 1.2 The header class reaches the cell as in the first kit
- [x] 1.3 The header text colour, font weight and filter row background are own properties
- [x] 1.4 The filter fields take the look of the search by default
- [x] 1.5 The page strip label reads as in the first kit
- [x] 1.6 The row menu item takes a green tone and a Material glyph
- [x] 1.7 The select of the filter row takes the whole cell
- [x] 2.1 Specs and overview pages carry the new inputs and properties
- [>] 2.2 Frames retaken, the second pass whole
- [ ] 2.3 Take the folder apart and open the PR into the epic branch

## Decisions along the way

- **The owner replaced the list of nine with a list of eleven.** Three items are new: the
  application's reset against the kit's layer, the settings panel name of a column without a
  label, and the settings panel footer. They were done inside the steps of stage 1. Affected stage
  of the plan: 1.
- **Two items are not confirmed by the sample.** The header class stands on the text block in both
  kits, and a test now holds it. The select of the filter row takes all the room after the clear
  button: 162 − 2 × 8 − 36 − 8 = 102, the first kit lays the cell out the same way. Affected stage
  of the plan: 1.
- **The filter fields of the list follow its search, by the owner's word.** The first kit's code
  draws them outlined; the owner saw them filled in an application. Affected stage of the plan: 1.
- **The reset is solved by a technique of the application, not by a build without layers.** The
  reset goes into the sublayer `rt-kit.vendor`, and the README says so. Whether a build without
  layers is still wanted is asked of the owner. Affected stage of the plan: 1.
- **The owner's third list adds three items.** The list takes `isToolbarActionsIconsOutlined`, the
  selection directive gives its flag under the first kit's name `isMultiSelectExtendedModEnabled`,
  and the package's built styles find the fonts. The fourth — the text editor's library breaks an
  application's build — is asked of the owner: the fix changes how the editor is imported.
  Affected stage of the plan: 1.
- **The row menu takes any markup already, but not Material's menu item.** It projects its content
  whole; `mat-menu-item` needs Material's own menu above it. The owner's fallback — the success
  tone and a Material glyph on the kit's item — is done. Affected stage of the plan: 1.
- **The browser measurement is not taken.** The pinned browser profile of this machine is not set,
  and the rule stops work through the browser. Affected stage of the plan: 1.

## Sessions

### 2026-09-25

- The task is taken from the owner's list of nine items.
- The owner's second list of eleven items is done in two commits.
- The owner's third list of fourteen: items 12 and 13 and the fonts of item 14 are done.
