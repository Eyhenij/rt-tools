# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 2 of 3 — Messenger bubbles
- **Done:** stage 1: `cards` of `rt-workspace`, SC-UKV-1065, 24 workspace tests green
- **Next step:** the `messenger` input of `rt-chat`
- **Uncommitted:** the task folder
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 Add the `cards` input and the modifier to `rt-workspace`.
- [x] 1.2 Write the styles of the modifier: border, radius, gap, no splitter line.
- [x] 1.3 Write the scenario and the test for the modifier.
- [>] 2.1 Add the `messenger` input to `rt-chat` and the pure function that groups messages by day.
- [ ] 2.2 Draw the day label, hide the author, move the time and the status inside the bubble.
- [ ] 2.3 Write the scenarios and the tests.
- [ ] 3.1 Under `messenger` draw the plain composer with the send button inside the field.
- [ ] 3.2 Add the `rtChatComposerTools` slot under the field and move the attach button into it.
- [ ] 3.3 Write the scenario, the test and the showcase story; run the package checks.

## Decisions along the way

- **Scenarios go into the existing subdomains, the new spec is not created.** The workspace
  scenario is in `workspace-slots`, the chat ones next to SC-UKV-1064 in
  `thread-tabs-chat-subtitle`: both subjects already live there. Affected stage of the plan: all.
- **The card radius is `--rt-radius-xl` (15).** The scale has no 16; the frame names the same
  step for the chat shape. Affected stage: 1.

## Sessions

### 29.10.2026

- The task, the branch from `main` and the plan.
