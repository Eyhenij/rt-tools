# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 3 of 4 — The measurement and the approvals
- **Done:** the symptom reproduced, the directive fixed, SC-UKV-1082…1084 tested
- **Next step:** ask the owner about the mockup frame of the profile menu on the backdrop
- **Uncommitted:** nothing
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- `[x]` done · `[>]` going on right now · `[ ]` not begun

- [x] 1.1 Raise the second showcase or find the one that answers on its port
- [x] 1.2 Tap the user name of the page header story at 375 under a touch emulation and count the backdrops
- [x] 2.1 Make the hover of a hover popover follow the mouse only
- [x] 2.2 Make a press on the host of a hover popover open the panel
- [x] 2.3 Write the popover tests for SC-UKV-1082 and SC-UKV-1083
- [x] 2.4 Write the page header test for SC-UKV-1084
- [x] 3.1 Repeat the tap of stage 1 on the fixed showcase and count the backdrops
- [>] 3.2 Ask the owner about the mockup frame of the profile menu on the backdrop
- [ ] 3.3 Show the owner the showcase and ask about it
- [ ] 3.4 Write the approval record
- [ ] 4.1 Merge the agreement into the popover backdrop spec
- [ ] 4.2 Run the specs check, the types, the linters and the tests of the kit
- [ ] 4.3 Take the task folder apart into the archive record
- [ ] 4.4 Open the PR

## Decisions along the way

- **The fix goes into the popover directive, not into the page header template.** The double open
  comes from the hover mode of the directive, and the section menu and the "More" item of the
  header get the same events. Affected stage of the plan: 2.
- **The touch test of the page header lives in a file of its own.** The header spec stood at 494
  lines, and the test took it past the limit of 500. Affected stage of the plan: 2.
- **The test "a click in the hover mode toggles nothing" is replaced by SC-UKV-1083.** The press now
  opens the panel in the hover mode: that is the touch's way to open it. Affected stage of the plan: 2.

## Sessions

### 30 October 2026

- Task RT-3000 created outside an epic by the owner's word «Да, вне эпика»; branch from `origin/main`.
- The showcase at 375 under a touch emulation (Playwright, `hasTouch`, `tap()`), the directive of
  `main`: after the tap on the name `{"backdrops":1,"panels":1}` → `{"backdrops":1,"panels":0}` →
  `{"backdrops":0,"panels":0}` — the menu opens and closes at once.
- The same with the fix: after the tap one backdrop and the menu, after the tap on the backdrop
  `{"backdrops":0,"panels":0}`. The mouse at 1440: hover opens the menu, leave closes it.
- Specs: the popover 25 of 25, the page header 77 of 77; on the directive of `main` the three new
  tests fail and the rest pass. Lint and types are green.
