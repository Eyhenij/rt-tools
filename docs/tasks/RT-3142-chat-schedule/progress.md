# Progress

## Where we stand

- **State:** `этапы-кончились`
- **Stage:** 5 of 5 — Delivery
- **Done:** the label, the slot, `draftText`, the showcase and the owner's approval of it.
- **Next step:** review by the roles, the push set, the folder taken apart, the PR into main.
- **Uncommitted:** nothing of this work; the epic plan and its task folders stay outside this branch.
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- `[x]` done · `[>]` going on right now · `[ ]` not begun

- [x] 1.1 Add `dateLabel` and `dateIcon` to the message model
- [x] 1.2 Render them in the bubble footer with specs
- [x] 1.3 Keep the footer inside the bubble at 375
- [x] 2.1 Add the slot above all kinds of the field with specs
- [x] 3.1 Add `draftText` to the chat and its fields with specs
- [x] 3.2 Add the scenarios to the subdomain
- [x] 4.1 Add the stories of the label and the bar
- [x] 4.2 Measure the stories against the frames at three widths
- [x] 4.3 Show the showcase to the owner and record the answer
- [x] 5.1 Add the case to the example application and its suite
- [>] 5.2 Update the kit description and take the folder apart
- [ ] 5.3 Run the push set and open the PR

## Decisions along the way

- **The match is brought to 288 of 288 in this branch.** The kit approval check takes only a full
  match, so the rest of the divergences is closed here instead of after the merge, and RT-3144,
  RT-3145, RT-3146 and RT-3147 close with this work. The set grew from 192 numbers typed by hand to
  288 taken from the showcase by a script. Affected stage of the plan: 4.
- **The bubble limit is a rule, not three numbers.** The frames draw 320, 254 and 278, and all three
  are `min(85%, 320px)` of the feed. The limit moved from the row to the bubble, so the buttons
  beside a message no longer take its width. The feed padding goes to 12 at 480 and the chat
  padding to 12 at 768. Affected stage of the plan: 4.
- **The incoming bubble follows the frames: white with a shadow.** It stood grey, and the 192
  numbers did not hold it. It was found by the pixels of the frame. Affected stage of the plan: 4.
- **The scrollbar is cut out of the measurement of the 436 high frame.** The frame draws none, and
  the operating system draws one in the browser the measurement runs in. Affected stage of the plan: 4.

- **The status icons of a failed and an undelivered message stay under `dateIcon`.** They warn of an
  error, and the brief adds no bubble state. Affected stage of the plan: 1.
- **The footer stays inside the bubble by wrapping.** A long label at 375 goes to two lines, and the
  icon stays inside. The frames draw one line of the sample label, and it fits. Affected stage: 1.
- **The bar takes the column step away from the gap.** The column holds 16 between its children,
  and the frame holds 8 between the bar and the field. Affected stage of the plan: 2.

- **RT-3051 is set aside by the owner's word.** Its branch holds an unpushed commit `51001c05a`. The
  rest is a run of the set and its PR. Affected stage of the plan: none.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/eyhenij/WebstormProjects/rt-tools/.claude/worktrees/rt-3049-push
**Branch:** RT-3142-chat-schedule

### Where we stand at the minute of the compaction

- **State:** `этап-идёт`
- **Stage:** 4 of 5 — The showcase
- **Next step:** take the references, lay them over the frames and show the owner.
- **PR:** not open yet

The progress in full — `docs/tasks/RT-3142-chat-schedule/progress.md`; the plan lies next to it.

### Uncommitted

```
 M apps/auth-example-admin/src/app/records/records.page.html
 M apps/auth-example-admin/src/app/records/records.page.ts
 M apps/auth-example-e2e/src/layout.spec.ts
 M docs/specs/auth/example/scenarios.md
 M docs/specs/ui-kit-v2/chat-draft/implementation.md
 M docs/specs/ui-kit-v2/chat-draft/scenarios.md
 M docs/specs/ui-kit-v2/chat-draft/spec.md
 M docs/tasks/RT-3142-chat-schedule/approvals.md
 M docs/tasks/RT-3142-chat-schedule/progress.md
 M projects/ui-kit-v2/src/rich-editor/lib/components/chat/CONTEXT.md
 M projects/ui-kit-v2/src/rich-editor/lib/components/chat/Overview.mdx
 M projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat.component.html
 M projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat.component.scss
 M projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat.component.spec.ts
 M projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat.component.ts
 M projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat.model.ts
 M projects/ui-kit-v2/src/rich-editor/lib/components/chat/stories/chat-page.stories.ts
 M projects/ui-kit-v2/src/rich-editor/lib/components/chat/stories/component/test-chat-page.component.html
 M projects/ui-kit-v2/src/rich-editor/lib/components/chat/stories/component/test-chat-page.component.ts
 M projects/ui-kit-v2/src/rich-editor/lib/components/message-composer/rt-message-composer.component.ts
```

### Commits over the main branch

```
459c90188 docs(rt:ui-kit-v2): план чата с подписью срока, слотом и чтением черновика
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
