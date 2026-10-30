# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 3 of 4 — The measurement and the approvals
- **Done:** the symptom reproduced, the directive fixed, SC-UKV-1082…1084 tested
- **Next step:** the owner's answer about the showcase goes into the approval record
- **Uncommitted:** nothing
- **Waiting for the owner:** the answer to «Витрина: Molecules/Navigation/PageHeader, история User Menu Narrow, совпадение с макетом 7 из 7. Одобряете?»
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
- [x] 3.2 Ask the owner about the mockup frame of the profile menu on the backdrop
- [>] 3.3 Show the owner the showcase and ask about it
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
- **The profile menu on a low screen is fixed in this task, SC-UKV-1085.** The owner asked what
  happens where the screen is lower than the menu and told to test it: «что на экранах где высота
  меньше высоты попапа?», «пиздуй смотри свои измеенния и тестируй всё сам». Measured: at 375×360,
  667×375, 844×390 and 1440×400 the menu went 73–76 below the bottom edge, 5–6 of 13 items out of
  reach. The menu now has the fit-viewport mode of the section menus and scrolls inside. The
  defect is older than this task. Affected stage of the plan: 2 and 3.
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
- The match with the frame `7332-17833` after a real tap at 375: 7 of 7 numbers — the menu 14 under
  the name, its right edge on the name's, radius 8, the backdrop `rgba(0,0,0,0.5)` from the left and
  top edges across the full width 375.
- Low screens after the fit: at 375×360, 667×375, 844×390 and 1440×400 the menu ends at the bottom
  edge and scrolls; a touch swipe (CDP `synthesizeScrollGesture`) scrolls it to the end at 667×375
  and 375×360, the last item in view. At 375×667 nothing changes: the menu fits and does not scroll.
- Specs of the components on `p`: 240 of 240; tokens and cascade layer checks clean.
- The showcase snapshots in the image: 56 of 943 diverged. Two were this edit's: the profile menu
  outside a panel took the scroll too — the fit and the scroll now act only inside the popover
  panel — and the profile menu in the list page template, a raster shift of the menu text, its
  reference re-taken. The rest predate the task: tabs, chat, the message composer, the toggle group
  (and the compact header through it), the detail list, the workspace details, the date panel,
  filter control references without a story, and the narrow profile menu of RT-2997 without a
  reference at all. None of those stories opens a popover.
- The scroll gave the menu a horizontal scroll the owner found: the rows reach into the padding,
  and the scroll container added the right padding past them — 267 against 259. The panel menu now
  scrolls along the vertical axis only. Measured in the browser at 320×568, 375×667, 375×480,
  375×360, 667×375, 844×390, 1024×600 with touch and 1440×900, 1440×400 with the mouse: the menu in
  view, a side swipe and a side wheel leave it at 0, a vertical swipe or wheel reaches the last
  item, the language picks «English» and the menu stays, a tap or leave outside closes the menu
  and leaves no backdrop, the page has no horizontal scroll. Snapshots: 54 of 943 diverge, all
  older than the task; the list page reference re-taken and confirmed by a second run.
