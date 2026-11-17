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

## Left unresolved

- **All three findings above** — wait for the owner's decision at the end of the epic.
