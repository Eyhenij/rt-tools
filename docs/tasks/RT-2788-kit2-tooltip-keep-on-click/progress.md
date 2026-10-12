# Progress

## Where we stand

- **State:** `этапы-кончились`
- **Stage:** 2 of 2 — Texts, showcase and checks
- **Done:** spec SC-UKV-850…855, the input `rtTooltipHideOnClick`, the text shown in place, the
  passthrough `tooltipHideOnClick` of the icon button, six tests, texts, the story `KeepOnClick`
  with its reference; typecheck, lint and check:specs green; full frame run 839 of 839 after the
  icon frames were re-taken (commit 6b3028428)
- **Next step:** the owner looks at the story; on «открывай» — take the folder apart, push, PR into
  the epic branch
- **Uncommitted:** nothing
- **Waiting for the owner:** a look at the story `KeepOnClick` on :6007; push and PR wait — «пры не открывай откроеш после моего апрува»
- **PR:** not open yet

## Steps

- [x] 1.1 Write the subdomain spec with scenarios from SC-UKV-850
- [x] 1.2 Add the input, the click handler and the text effect to the directive
- [x] 1.3 Pass the input through rt-icon-button
- [x] 1.4 Write the tests by the scenarios
- [x] 2.1 Update CONTEXT.md and Overview.mdx of the tooltip and the icon button
- [x] 2.2 Add a story of a toggle that keeps its tooltip
- [x] 2.3 Run typecheck, lint and the spec audit
- [x] 2.4 Commit the work

## Decisions along the way

- **The story clicks by a bare `click` event, not by the helper's default gesture.** — The default
  gesture focuses each trigger in turn, and the focus leaving the previous button hides its tooltip
  by `focusout`; a person clicks one button. Affected stage of the plan: 2.
- **The live click through the browser driver was not taken.** — In this tab the driver's click
  reached no page listener at all (no `pointerdown`, no `click`), while its hover did; the click is
  covered by the tests and by the story's `play`. Affected stage of the plan: 2.
- **The four icon frames are re-taken in this branch by a commit of their own.** — Main re-took
  them with `folder` (18a4c60c2), and the merge of main into the epic left the epic's frames
  without it; the full run diverged there, not on the tooltip. Affected stage of the plan: 2.
