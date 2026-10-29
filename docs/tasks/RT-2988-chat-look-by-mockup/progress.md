# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 3 of 3 — One-line reply field with a tools row
- **Done:** stages 1–2 and steps 3.1–3.2: `cards`, `messenger`, SC-UKV-1065…1067, 3348 kit tests green
- **Next step:** the showcase story and the package checks
- **Uncommitted:** the task folder
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 Add the `cards` input and the modifier to `rt-workspace`.
- [x] 1.2 Write the styles of the modifier: border, radius, gap, no splitter line.
- [x] 1.3 Write the scenario and the test for the modifier.
- [x] 2.1 Add the `messenger` input to `rt-chat` and the pure function that groups messages by day.
- [x] 2.2 Draw the day label, hide the author, move the time and the status inside the bubble.
- [x] 2.3 Write the scenarios and the tests.
- [x] 3.1 Under `messenger` draw the plain composer with the send button inside the field.
- [x] 3.2 Add the `rtChatComposerTools` slot under the field and move the attach button into it.
- [>] 3.3 Write the scenario, the test and the showcase story; run the package checks.

## Decisions along the way

- **Scenarios go into the existing subdomains, the new spec is not created.** The workspace
  scenario is in `workspace-slots`, the chat ones next to SC-UKV-1064 in
  `thread-tabs-chat-subtitle`: both subjects already live there. Affected stage of the plan: all.
- **The card radius is `--rt-radius-xl` (15).** The scale has no 16; the frame names the same
  step for the chat shape. Affected stage: 1.

- **The messenger reply field is the kit `rt-message-composer`, not the plain form.** The plain
  form would need new branches in the template, and its complexity is at the limit of 25; the kit
  field is already the one-line capsule with the round send button. Affected stage: 3.
- **The author line and the tools row are hidden by styles, not by `@if`.** The same template
  complexity limit. Affected stages: 2, 3.
- **The messenger styles lie in `rt-chat-messenger.scss` next to the chat styles.** The chat styles
  would grow past 500 lines. Affected stages: 2, 3.

## Sessions

### 29.10.2026

- The task, the branch from `main` and the plan.
