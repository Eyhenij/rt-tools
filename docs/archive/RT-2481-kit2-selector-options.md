# Grill

## The owner request

> это запрос из апки по миграции с первого кита на второй, там используется материальный вид

> проанализируй, важно правки не должны сломать второй кит

> делай не так как просят а так как лучше

The consumer's items 40–44: a `removeShown` input of the selector and of `rt-dynamic-input` that
takes the bin off the rows; a `listActionsShown` input (`null` by default) whose `false` takes off
the reset and clear panel; an `extraChanged` input that keeps reset and clear active for edits made
in the row template; a `searchTerm` input of the selector and its popup, the popup's initial query
without a search event; a public `popupOpen` signal and a `popupOpenChange` output.

## What the tree already has

- The list draws the bin on every row; its `actionsShown` input hides the whole bar — the add
  button together with reset and clear. The selector passes `!invitation()` there, the text input
  `!isInvitationShown()`.
- Reset is off while the keys equal the initial ones; clear is off while clearing would change
  nothing. The selector emits `listReset` on reset; the text input emits nothing of its own.
- The popup lives in a template and is created anew on every opening; its query starts empty and
  reaches `searchChange` only through the debounced stream.
- The selector holds the popovers of both add buttons; each popover has a public `isOpen` signal and
  opened and closed outputs.

## Decisions

- **`removeShown` takes the bin off and nothing else.** Rows still move and edit.
- **`listActionsShown: false` takes off reset and clear, not the add button.** The bar stays while it
  holds the add button; `true` shows the bar under the invitation too; `null` keeps today's rule.
- **`extraChanged` keeps reset and clear active, and both then always report.** Reset with unchanged
  keys emits `listReset` without changing the value; clear emits a new `listCleared` output. The text
  input gets `listReset` and `listCleared` as well: without them the edits in its rows could not be
  dropped by the consumer.
- **`searchTerm` is the query the popup starts from on every opening.** It is not emitted as a
  search: the consumer already knows it.
- **`popupOpen` is derived from the popovers' own state, and `popupOpenChange` fires from their
  opened and closed outputs.** No effect, so the first value is not emitted.

## Decisions along the way

- Clear with only row edits keeps the value and still reports by the new `listCleared`: without a
  report the press would do nothing visible.
- `listActionsShown` is a plain boolean, `true` by default, not `boolean | null`: the tree's check
  of boolean inputs takes a third value only by the owner's entry in its accepted list. `false`
  takes off reset and clear; the bar under an invitation, which the request did not ask for, is
  not offered.
