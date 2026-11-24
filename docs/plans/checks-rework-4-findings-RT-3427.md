# Findings of RT-3427 — long rules fit into the rules gate delivery

The continuation of `docs/plans/checks-rework-4-findings.md`, which reached the length limit. Here
is what RT-3427 did not close within its approved plan. Each finding waits for the owner's
decision: a task of its own or none, unless it names one.

## RT-3427 — nine long rules fit into the rules gate delivery

- **observability keeps 9 losses of the blind retelling, platform-access 1: the gate leaves no
  room to put them back.** observability stands at 4793 of 4800 characters; an edit of a receiver
  service that reads the environment delivers it with `typescript-conventions` and `reuse-first`
  at 9 949 of 10 000, and putting its losses back weighs about 760. platform-access is delivered
  on an edit of a kit component at 9 977; its lost sign weighs about 50. Each loss stands whole in
  its cold part; the critic's wording goes with the task's archive record. The package spec says a
  cold part holds explanation, not requirement, so these losses go against it. **Address:** task
  RT-3510 of the epic, by the owner's word of 23.11 «Отдельной задачей эпика»: observability splits
  into two rules, the gate delivers the half an edit needs, the losses go back hot. **Metric:**
  losses of the blind retelling of both rules, 10 → 0.
- **task-delivery-loop keeps its steps in the cold part by the approved plan.** The fifteen steps,
  «After the owner answers» and «What never happens» moved there on purpose: the token of the
  machine account, reviewer and labels in one call, `task:move in-review`, `gh pr ready` on a
  green run, the answer to remarks. By the same spec article these are requirements. **Address:**
  tree — the pattern `task-delivery-loop-run` carries the after-PR steps as ready commands, which
  the gate delivers on a delivery command. **Metric:** PR bodies or remarks handled without the
  steps, counted by the owner's remarks.
- **No check holds the room the task freed.** The probe lies in the task folder and leaves with
  it. The smallest margins after the task: the kit button with `window.` at 9 977 of 10 000, a
  receiver service reading the environment at 9 949, the epic plan at 9 948. One more sentence in
  `component-structure`, `angular-patterns`, `reuse-first` or a rule the task compressed brings the
  refusal «do not fit together» back unseen. **Address:** tree — the probe and its 43 lines as a
  scenario of `tools/tests`, run when a `SKILL.md` or a package rule changes. **Metric:**
  `gate-deny` records with `why: together` on the 43 lines after the merge, 0.
- **Point B of the epic is not reached by this task.** The plan of the epic waits for 0 lines «too
  long» and «do not fit together» in the report. The edits of a task folder (progress, grill,
  plan), `gh pr create`, `gh pr edit`, `gh issue create` and `task:new --epic-of` are still refused
  «together»: their sets of rules pass 10 000 characters whatever the size of the rules this task
  compresses. 38 of the 39 such records of 20–22.11 are `task-delivery-loop` on these edits and
  commands. **Address:** a task of the epic for the delivery of rules in parts in
  `hooks/skill-gate.sh`, or an edit of the gate map. **Metric:** `gate-deny` with
  `why: together`, 29 over 14–21.11, counted apart by the kind of the edit.
- **The meaning check of the task skipped the table of names.** In the task's meaning check script
  the section regex ends at `$` under the flag `m` and captures an empty table. A fixed copy found two reworded rows of `mockups`; they
  are restored, and the fixed copy gives 0. The step check runs the file committed with the plan,
  so the fix lives only in the copy. It reads only the section «What it is called here», so the
  table of `doc-style-human` was compared by reading. **Address:** a meaning check of a later
  compression takes the end of the text as `(?![\s\S])` and reads every table. **Metric:** none:
  the check leaves with the task folder.

## Rules review after RT-3427 — skill-curator, 23.11

Six proposals of the role; each waits for the owner's decision.

- **A new cold part is checked by `rules-review.test.sh` before its first commit.** Three cold
  parts made by one compression lacked `## Pitfalls`; SC-AK-211 turned red only in the push set,
  after ten minutes of `test-hooks`, while the script alone takes three seconds. **Address:**
  tree — the article «A new package resource passes `check:spec-coverage` and `check-descriptions`
  before its first commit.» of `.claude/skills/agent-kit-source/SKILL.md` names the script, its cold
  part gives the reason. **Metric:** SC-AK-211 first seen in the push set, 1 → 0.
- **A script a step check calls is run on a planted failure before the plan commit; a replacement
  keeps every item and pins the failing count.** The meaning check had an empty-table regex, and
  the first replacement of step 3.2 filtered the failing rules out and passed by construction.
  **Address:** package — a tail on the article «Every step of the plan carries a check whose
  expected output is taken from a run while the plan is written.» of
  `projects/agent-kit/assets/rules/task-flow-plan.md`, the reason in the cold part
  `task-flow.2.md`. **Metric:** replacement lines withdrawn by review, 1 → 0.
- **The owner's window on a replacement shows the planned check and the new one side by side.**
  The window said only «is the owner's decision». **Address:** package —
  `projects/agent-kit/assets/checks/flow-guard.mjs:judgeProgress`, the reason of the `ask`.
  **Metric:** replacements allowed in the window and withdrawn by review, 1 → 0.
- **Room first, then the sign; retelling is judged on a fixed list of rows.** The plan promised zero
  losses while the table and statements of observability weighed 4 200 of 4 800; five rounds of
  fresh critics did not converge (queue-audit 0 → 2, platform-access 1 → 1 → 2). **Address:**
  package — two paragraphs in the section «Compressing an article: a live sample» of
  `projects/agent-kit/assets/patterns/spec-driven-rule.md`, and a pointer to the pattern from the
  compression article of `spec-driven`. **Metric:** retelling rounds per rule, 5 → at most 2.
- **A task filed for later is created without `--slug`.** With it `task:new` assembled the RT-3510
  folder inside the RT-3427 branch, removed by hand. **Address:** package —
  `projects/agent-kit/assets/patterns/git-workflow-commit.github.md`, «Common misses», and
  `projects/agent-kit/assets/checks/task-new.github.mjs:adoptDraft` assembles no folder while the
  current branch has a live one. **Metric:** foreign task folders removed by hand, 1 → 0.
- **The ask judge's hold names the way that keeps the check.** A menu that weakened a sign was held
  rightly, but the refusal did not point to «a task of its own for the unreached part».
  **Address:** package — the last bullet of «Hold the question» in
  `projects/agent-kit/assets/hooks/ask-judge.md`. **Metric:** a second hold in the same turn after a
  «weakens a check» hold, 1 → 0.
- **No edit:** the shell edit of a package rule is covered by the cold part of `doc-style` («text
  is edited with the edit tool»); the room of the gate and the split of observability are filed
  above and in RT-3510.
