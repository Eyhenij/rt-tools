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

## Left unresolved

- **All findings above** — wait for the owner's decision at the end of the epic.
