# Findings of the epic Angular Doctor

They accumulate here, next to the epic plan `docs/plans/angular-doctor.md`: the task folder dies
with the merge, and the owner reads the findings when the epic is over. A section per task, a line
per finding, each with its address.

## RT-3477 — the Angular Doctor check with a per-rule threshold

Loaded over the task: `task-delivery-loop`, `task-flow` with its start, close, archive and handoff
patterns, `epic-flow`, `epic-flow-declare`, `git-workflow`, `git-workflow-push`, `git-workflow-pr`,
`git-workflow-pr-body`, `queue-audit`, `doc-style`, `agent-kit-extend`, `testing`,
`ui-component-tests-visual`.

- **Исправлено в RT-3607.** **The delivery guard finds a self review on a PR of an epic task and lets the call through.**
  The guard run on the opening command recorded `pr_create_self_review`, and the decision table
  answered nothing: all 43 of its rows require `task_in_epic: "no"`. The same holds for the bad
  title, the wrong number, the thin body and the draft findings. PR #3494 opened from the owner's
  account with no reviewer. **Address:** rules layer — the decision table of the delivery guard.
- **Исправлено в RT-3607.** **An empty machine token passes as a token.** `GH_TOKEN=$(cat <file>)` of a missing file leaves
  the variable empty, and the host client falls back to the active account. The ready-made call
  and the hint in the tree profile check nothing first. **Address:** names of this tree — the PR
  call of `task-delivery-loop-run` and `RT_PULL_TOKEN_HINT`.
- **Исправлено в RT-3607.** **The rule about the main branch by its remote ref was broken, not missing.** A manual scan ran
  on a local main 442 commits behind, and a wrong base went into the epic card and plan. The owner
  said «всегда обновляй локальный main тоже». The proposal block written for it adds a second
  article on the same matter; rewording the existing one is shorter. **Address:** rules layer —
  the rule `git-workflow`, with its companion line in this tree.
- **Исправлено в RT-3607.** **No text says how a step is dropped from an approved plan.** Step 2.3 was removed from the plan
  by the owner's word, and the engine then refused every step until the approved plan was
  restored. The replacement line was found only by reading the engine. **Address:** rules layer —
  the pattern `task-flow-resume`.
- **Исправлено в RT-3607.** **Step 5 of the delivery loop reads as marking steps by hand.** The flow-step guard refused
  progress writes three times: a state ahead of the measured one, a shell write, marks out of
  order. **Address:** names of this tree — the rule `task-delivery-loop`.
- **Исправлено в RT-3607.** **Role replies for the PR body were kept only in the conversation.** Quoting them word for word
  needed digging in the subagent transcripts. **Address:** names of this tree — the review rounds
  of `task-delivery-loop-run`.
- **Исправлено в RT-3607.** **The snapshot gate fails at random on a port forwarder without a connect timeout.** The
  forwarder in the shot container opens a connection to the machine per browser connection, with
  no timeout and no retry. In a probe of 1400 story loads one connection took 68 s; direct browser
  connections showed none. The push set went red three times of four, and the pipeline fails the
  same step in about 5 of 30 recent runs. **Address:** names of this tree — the shot browser
  script; a code task, not a rule text.

## RT-3492 — knip green

- **Исправлено в RT-3535.** **The plan approval mark points at a menu the approval check then refuses.** `plan-red` takes the
  first menu after the roles with any option that begins with «Одобряю», while the check of the mark
  joins every answer of that menu and tests the start of the join. A menu of three questions whose
  answers came back in another order wrote a mark that never holds; the state stayed at «задача-взята»
  after two approvals, and only a new role call followed by a menu of one question moves it.
  **Address:** rules layer — `checks/flow-plan.mjs` `approvingEntry` against
  `task-flow/source/records.mjs` `approvalFault`.

## Left unresolved

Nothing: the eight findings above are fixed where each of them says. The proposal about the local
main branch went to the intake with the cargo of November 2026; the article it asked for is the
reworded one, fixed in RT-3607.
