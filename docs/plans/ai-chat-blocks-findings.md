# Findings of the epic "the answer of rt-ai-chat is built from blocks"

They accumulate here, next to the epic plan `docs/plans/ai-chat-blocks.md`: the task folder dies
with the merge, and the owner reads the findings at once, when the epic is over. A section per
task, a line per finding, each with its address.

## RT-2750 — the chart component rt-chart on d3 modules and its own SVG

- **Four chat stories of the rich editor log a 404 in the story sweep.** The sweep of 17.11 named
  `organisms-chat-page--quick-replies`, `--scheduled`, `--composer-bar` and
  `organisms-chat-reply-kinds--all-kinds`; their frames are not empty, so no snapshot turns red on
  it. What resource is missing is not found out. **Address:** names of this tree — the showcase
  of the rich editor.
- **The pagination and textarea matrix suites fail on a page load timeout in the full snapshot
  run.** The run of 17.11 matched 1117 snapshots and had no divergence in either suite; both fell
  at `page.goto` before the frame. Not reproduced one at a time. **Address:** names of this tree —
  the snapshot harness of the kit showcase.
- **The work queue audit dies on a host error instead of naming it.** On 17.11 `check:board`
  stopped with an uncaught `HTTP 422` from the deploy lag step ("this diff is taking too long to
  generate"), and none of its other lines were printed. **Address:** names of this tree — the
  board audit, the deploy lag step.
- **The push gate cannot catch up with a main branch that moves every half hour.** On 18.11 the
  gate took about 30 minutes, and in that time main took another package PR five times running.
  The PR opening check then refused the green branch for a stale main, and each round cost a full
  gate run. **Address:** rules layer — the order of merging main and opening a PR.
- **The visual gate inside the push gate drops one story file at random.** On 18.11 three runs
  named a different file each time as "references that have no story": stepper, toggle button
  group with data table, page header end. The same step run alone passed 291 of 291 suites.
  **Address:** names of this tree — the snapshot harness under load.
- **The hook test SC-AK-1279 fails in the push gate and passes alone.** On 18.11 it reported "got
  1, expected 0"; run alone it passed 2 of 2. It counts time by the clock. **Address:** names of
  this tree — the hook test suite.
- **The e2e stand takes a database port held by a neighbouring copy.** The local settings of this
  copy name port 55462, and the stand of another copy holds it; the run passed with
  `E2E_DB_PORT=55502`. **Address:** names of this tree — the local settings of a copy.
- **The Docker virtual machine disk filled up twice during the gate.** The schema drift check
  failed with "No space left on device" while the host had 190 GB free; the build cache cleanup
  freed the space. **Address:** names of this tree — the gate's own cleanup after image builds.
- **Main carries tests that refer to scenarios absent from the spec.** After #3383 the tests of
  `ai-chat-protocol` refer to SC-ACP-11…23 and SC-ACP-30…33, and the spec scenarios lack them;
  `check:specs` turns red on every branch that merges main. **Address:** names of this tree — the
  spec of the chat protocol package.
- **The PR opening check asks a task of an epic to merge main, where a fetch is enough.** For a
  PR into the epic branch its first tier compares the branch with the epic branch, as it should.
  The second tier compares the local ref of main with the remote one for every PR, and its refusal
  says "merge origin/main". A fetch lifts that refusal, and the merge it names brings main into the
  task branch past the epic branch. So RT-2750 merged main six times and took in the broken #3383.
  **Address:** rules layer — the text of the second tier in the delivery check.

## RT-3335 — the chart block of the chat answer

- **The chat protocol does not mark the end of a tool call.** The reducer collects the argument
  deltas and handles the end event with nothing, and a tool call holds only its id, name and
  arguments. An application on the protocol package cannot tell when to clear `pending` of a
  chart block, and has to guess by an unparsable string. **Address:** names of this tree — the
  spec of the chat protocol package.
- **No task of the epic says who answers a chart tool call.** If the chart is a browser tool of
  the registry, the run waits for its answer before the model goes on; the chart block only draws.
  Not checked by a run of the controller. **Address:** names of this tree — the epic plan.
- **Main merged a change of the push set without its hook test.** #3387 stopped raising the heavy
  steps for the workflow files, and the probe of SC-AK-569 still expects the whole set for them;
  the hook tests are red on every branch that merges main. **Address:** names of this tree — the
  push set of the tree and its hook test.

## RT-3335 — the chart block of the assistant chat

- **The wrapper sample of the storybook pattern holds an inline template the reuse check
  refuses.** The section «The wrapper component» of `rt-tools-storybook-story` shows `template:`
  inside the class, and `check-reuse` refuses it by the signal `inline-template`. The Playground
  wrapper copied the sample, the push gate turned red, and the move to `.html` cost a second full
  run of about 25 minutes. Proposed: the sample with `templateUrl`, and a frequent miss «a new
  wrapper keeps its template in its own `.html`; older wrappers in `tools/reuse-allowlist.json` are
  no sample». **Address:** names of this tree — the pattern `rt-tools-storybook-story`.
- **A drawing carried over from an earlier task's mockup is a copy of a copy, and it keeps the
  earlier width.** The chart drawing came from the RT-2750 mockup. Its legend gap drifted to 8
  against 12 in code, and only the 22-number match found it; its width of 328 made the owner ask
  for the wide frames. Proposed for the first article of the rule: «A drawing carried over from an
  earlier task's mockup is measured the same way before it goes on the sheet; its parts are
  stretched to the new frame, and a frame is drawn for every width the block meets.»
  **Address:** rules layer — the rule `mockups`.
- **The task key never opens a commit subject here.** `subject-case` of the commitlint preset
  refused a subject that started with `RT-2750`. Proposed for the companion of `git-workflow`,
  after the edit area: «the key `RT-<number>` never opens the subject; the subject starts with a
  lowercase Russian word». The companion stands at 326 of 330 lines. **Address:** names of this
  tree — the companion of `git-workflow`.

## RT-3336 — the data table under the chart block

- **A node that hugs its text is compared by its build, not by its width; one fixed number is
  followed by the whole measurement anew.** The closed toggle came out 169 against 170 with equal
  padding, gap, icon, font and height; `border-box` on a cell fixed the row height and silently
  narrowed the numeric columns. Proposed: two articles after «The 100% is a match of numbers» with
  «Not checked by anything» lines in the companion. **Address:** names of this tree — the rule
  `kit-approval`.
- **The conversation guard counts its own refusal and a rules-gate refusal as a blocker.** After
  a rules-gate refusal, a loaded rule and a look at the showcase, the approval question was refused
  twice. Proposed: `after_refusal` skips «BLOCKED by grill-gate» and «Refused by the rules gate», and
  a scenario for it. **Address:** rules layer — the hook `grill-gate.sh` of the package.
- **The record of loaded rules is removed after the compaction, and a load made right after it is
  lost.** `browser-verification` was demanded twice. Proposed: the rearm hook cuts the record by
  time instead of removing it. Cause not proved. **Address:** rules layer — the hooks
  `skill-gate-rearm.sh` and `skill-loaded.sh`.
- **`overflow-wrap: anywhere` narrows an auto-sized table column to one letter; a cell's height
  excludes its border.** Both defects were seen in the showcase, not by tests. **Address:** rules
  layer — the cold part of `styling-bem`.
- **One foreign PR the host cannot diff (HTTP 422) drops the whole queue audit.** Proposed: a line
  in the rule and a fallback read per PR. **Address:** rules layer — the rule `queue-audit`.

## RT-3337 — the table block of the chat answer

- **An addition to the agreement is carried into everything already written from it.** The block
  schema was written in stage 1; stage 5 added `title` to the agreement, and the schema was not
  reread until product-strategist caught it at the closing. Proposed: a common miss in
  `task-flow-resume` — the decision entry names the artefacts an addition reopens, and they are
  edited in the same stage. **Address:** rules layer — the pattern `task-flow-resume`.
- **Without `--update` the snapshot gate reads no path sample.** A confirm run with a path went
  over the whole showcase. Proposed: a trap in `ui-component-tests-visual`; apart, a task to let a
  plain run read the sample. **Address:** names of this tree — the pattern
  `ui-component-tests-visual` and `tools/visual-gate.mjs`.
- **A Figma frame without a fill exports transparent, and the overlay counts every empty pixel.**
  The first overlay diverged by the transparency, not by the layout. Proposed: a paragraph after
  the `overlay` command; apart, a task to let `overlay` take a background colour. **Address:** names
  of this tree — the rule `kit-approval` and `tools/kit-match.mjs`.
- **A story file that did not load within the timeout and left no difference frame is load, not a
  divergence.** Two files failed so under a busy machine. Proposed: step 6 of «Sorting out a fallen
  run». **Address:** names of this tree — the pattern `ui-component-tests-visual`.
- **The tree has `@playwright/test` only, and a one-off script resolves it by `createRequire` from
  the tree root.** Proposed: a line in the companion. **Address:** names of this tree — the
  companion of `browser-verification`.

## RT-3338 — the KPI block of the chat answer

- **A plan sign named only the story sweep, and the sweep looks for empty showings only.** Both
  roles found it on the plan: the match with the mockup, the columns and the card widths had no
  command behind them. Proposed: a common miss in `task-flow-start` — a layout point of a kit task
  names the play steps and the snapshot run in «Verified by». **Address:** names of this tree — the
  rule `kit-approval`.
- **The task card said «four in full screen», and the plan checked the block at fixed widths
  only.** A full-screen chat with a 40rem reading column gives the block 640, under the threshold.
  Proposed: the plan of a chat block names a chat story in every mode the card names. **Address:**
  names of this tree — the rule `rt-tools-storybook`.
- **Two hypotheses the epic does not check:** a model may confuse a `percent` share (0.78) with a
  `delta` in percent (12.5), and a `kpi` block in a section narrower than 328 must fall to one
  column. Proposed: a model call on «обзор месяца» and a narrow section story in RT-3342.
  **Address:** the epic plan, task RT-3342.
- **The danger colour of a delta reads at 3.2 : 1 on a dark card.** `--rt-color-state-danger` is
  one value in both themes by the kit's decision: rgb(220, 38, 38) on the dark surface rgb(34, 38,
  41), a 14 px bold number, while AA asks 4.5 : 1 for text of that size. The tile had it before this
  task; the KPI block puts more red numbers on a dark card. Proposed: a lighter dark-theme value of
  the status colours, a task of its own. **Address:** the kit's semantic tokens.
- **The KPI card radius 12 and its inner gap 6 are sums of two tokens.** The radius scale has 8,
  10 and 15, and the mockup draws 12, so the block writes `md + sm`; the gap is `space-1 +
  space-0-5`. Under another styling preset the sum gives a number no mockup holds. Proposed: a
  radius step of 12 or the card on step 10, the owner's choice. **Address:** the kit's radius and
  spacing scales.

## Left unresolved

- **All findings above** — wait for the owner's decision at the end of the epic.
