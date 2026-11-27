# Fewer touches of the owner: the findings about the rules layer

They accumulate along the epic RT-3693 (`docs/plans/owner-touches.md`) and are read at once when the
epic is over. The owner says what of this is right; what they name is made into an edit or a proposal
outward. Each finding names its address: **the rules layer** — true for any tree, **the names of the
tree** — true only here.

## RT-3695 — the measurement and the proposal

- **Branch protection is changed after the workflows that push to that branch are read.** On 26.11 the
  ruleset of the main branch lost its bypass without a look at the release workflow, which pushes the
  version straight into main; the release stopped. _The address: the rules layer —
  `git-workflow-hosting`, and a gate entry for an edit of branch protection._
- **A breakage the tree made is its own, even when another session shows it.** A neighbour session
  showed the stopped release as someone else's change. _The address: the rules layer —
  `task-flow-owner`._
- **The identity hook refuses a PR opened by a foreign token.** PR #3704 opened under the owner's
  account; nothing refused it. _The address: the rules layer — the delivery guard on `gh pr create`._
- **The progress with one `[>]` goes into the commit of the plan.** The engine's exit
  `progress.mirrors` asked for it after the plan was already committed. _The address: the rules
  layer — `task-flow-plan`._

## RT-3696 — the command of the measurement

- **The plan is committed once: after the last reading of the roles, before the window of the
  approval.** The step engine and the approval mark read the commit that added it; six later commits of
  the plan reached neither, and the steps they added could not be marked. Nothing warns between the
  second commit of a plan and the push set. _The address: the names of the tree —
  `task-delivery-loop`, «Duties of the steps»; mechanically — the engine's approval or the step guard
  on a write to a committed plan._
- **«Цена» and «Отменено» go into the progress before the push set starts.** `task:archive` refuses
  without them, and a set started without them was stopped and run again. _The address: the names of
  the tree — `task-delivery-loop-run`, section «9, 11–12»._
- **A duty only the handover names goes into the progress before the first move.** The word «Сливай
  задачи RT-3693 сам» was to be written into the epic plan by the first commit of RT-3696; it waited
  in the handover and moved to RT-3701. _The address: the rules layer — `task-flow-resume`, «Entry
  from a session handover»._
- **The host's merge button signs the merge by the merging account's private email.** The merge of
  PR #3708 into the epic branch carried `rt.tools.bot@gmail.com`; the epic branch was rewritten by the
  owner's word. RT-3701 names the form `gh pr merge --author-email`. _The address: the rules layer —
  `git-workflow-hosting`._

## RT-3697 — no repeated windows

Deferred by the owner's word of 27.11 in a window: «отложить RT-3697». The work done so far lies in
the branch `RT-3697-no-repeat-windows`: the line of the menu judge, the honest count of windows (12
instead of 37), the observation line of the kit window.

- **The windows this task lifts are not the ones that stand before the milestone.** Every window of
  the step guard is a replacement of a step check: 9 of the 12 windows of the base and 4 of 4 after
  it. Before none of the four replacements of this session had the owner answered about the step,
  so the window was the first touch, not a repeat. The threshold of 5 hook windows is the
  executor's number and stays out of reach of RT-3697–RT-3700.
- **A consent reader built on a word list errs both ways.** Two review rounds found an unrelated
  «yes» that lifts the window and an ordinary answer with a date, a version or the epic key that
  brings it back. A strict reading — only the pressed option «Да» in a window of an exact form — is
  the owner's decision.
- **The package suites write their lines into the observations of the tree.** `lib.sh` unsets
  `CLAUDE_PROJECT_DIR`, and a run adds `guard-ask` and `guard-deny` lines with `v: dev`; the count
  of windows cuts them by the version, the counts of refusals do not.
- **The model replay of the menu judge waits for the login of the CLI.**

## RT-3698 — the plan approved by the epic word

Deferred by the owner's word of 27.11 in a window: «Отложить RT-3698 (Recommended)». The plan lies
in the branch `RT-3698-plan-by-epic-word`.

- **П1 removes almost no window.** Of about 40 merges into main since 14.11, three carry none of the
  signs that keep the window (`node tools/review-path.mjs --base <m>^1 --head <m>`): RT-3455,
  RT-3388, RT-3376. The measured gain is about one touch in fourteen tasks.
- **The signs of a plan before the code miss the API and the look of package code.** `pathReasons`
  passes the same text as before and after, so a footprint row with a kit component or a store
  service gives no sign. Approving by footprint needs the package code itself as a sign, and a check
  of the diff against the signs after the stages.
- **The answer of 26.11 is no standing word.** The window asked which proposals become tasks; a word
  that skips the plan windows is to come from a window that asks for exactly that.

## RT-3699 — the start of an epic in one window

Deferred by the owner's word of 27.11 in a window: «Отложить RT-3699 (Recommended)».

- **The start of this epic already took one window.** The only epic start the session records still
  hold is RT-3693: the owner's typed request at 11:26 on 26.11 and one window at 11:41. The records
  of earlier starts are gone. A start comes once per epic, and the milestone counts touches per
  task, so the task moves it by almost nothing.

## RT-3700 — the grill without questions

Deferred by the owner's word of 27.11 in a window: «Отложить RT-3700, собрать отчёт (Recommended)».

- **Windows before the plan are few.** Of 26 tasks whose plan was committed since 21.11, 17 had no
  window before the plan commit; the 9 others had 18 together (`record-menu` of the observations
  against the first commit of each `plan.md`).
- **The owner's typed messages are most of the touches.** Since 21.11 the observations hold 220
  typed messages, 112 window answers and 144 hook windows. No task of the epic removes a typed
  message; their kinds are written only since RT-3696, 7 so far, 5 of them «прочее».
