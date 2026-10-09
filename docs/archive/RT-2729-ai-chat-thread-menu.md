# Grill

## The owner request

> In the conversations list, instead of the per-row delete icon button, a consumer can show a vertical three-dots button (`ellipsis-v`, aria-label from a kit label, e.g. "More actions") that opens a context menu (the kit's own `rt-menu`) with two items: "Copy ID" — copies the thread id to the clipboard (Angular CDK `Clipboard`, as `rt-ai-chat-copy` does), item with copy icon; "Delete" — danger tone, trash icon, emits the existing `deleteThread` output with the thread id (the consumer shows its own confirmation, so the menu must NOT add a confirmation). API: new input on `rt-ai-chat`, e.g. `threadMenu: boolean` (default `false` → current delete button unchanged). Labels go through `RT_KIT_LABELS` (English defaults "More actions", "Copy ID", "Delete" — reuse existing keys if present). Keyboard: Enter/Space opens, arrows move, Escape closes and returns focus to the button. The menu button takes the place of the delete button and must not select the row. The time hidden on hover stays as is.

## What the tree already has

- `rt-menu` (`menu` entry): trigger icon input, `ariaLabel`, click stops propagation, arrows by `FocusKeyManager`, Escape returns focus to the trigger.
- `rt-menu-item`: `icon`, `label`, `danger`, `(selected)`; confirmation only when `confirmMessage` is set.
- Labels `uiMoreActions` («More actions») and `uiRemove` («Delete») exist.
- Row actions of `rt-thread-list` stand beside the row button, not inside it: a press there does not select the row.

## Decisions

- **Reuse `uiMoreActions` and `uiRemove`, add `aiCopyThreadId`** — the request says reuse existing keys.
- **Row actions stay visible while the row's menu is open** — focus leaves for the overlay and the pointer may leave the row; without it the trigger fades under the open panel.

## Decisions along the way

- **`rt-menu` takes `triggerSize`** — its trigger was always `md` with an `md` icon; the row action stands at `xs` with a 16px icon like the delete button. Affected stage of the plan: 1.
