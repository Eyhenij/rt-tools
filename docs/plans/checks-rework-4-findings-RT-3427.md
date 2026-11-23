# Findings of RT-3427 — long rules fit into the rules gate delivery

The continuation of `docs/plans/checks-rework-4-findings.md`, which reached the length limit. Here
is what RT-3427 did not close within its approved plan. Each finding waits for the owner's
decision: a task of its own or none.

## RT-3427 — nine long rules fit into the rules gate delivery

- **observability keeps 9 losses of the blind retelling: the gate leaves no room to put them
  back.** The rule stands at 4791 of 4800 characters. Each loss stands whole in its cold part;
  the critic's wording to put back goes with the task's archive record. The room is set by the
  gate: an edit of a receiver service that reads the environment delivers observability with
  `typescript-conventions` and `reuse-first` at 9 947 of 10 000, and putting the losses back
  weighs about 760 characters. The package spec says a cold part holds explanation, not
  requirement, so keeping these losses cold goes against it. **Address:** a decision of the
  owner, one of two. Split observability into two rules and let the gate deliver the half an edit
  needs. Or change the spec of the package so a requirement may stand cold where its rule names
  it. **Metric:** losses of the blind retelling of observability, 9 → 0.
- **No check holds the room the task freed.** The probe lies in the task folder and leaves with
  it. The smallest margins after the task: the kit button with `window.` at 9 988 of 10 000, a
  receiver service reading the environment at 9 947, the epic plan at 9 944. One more sentence in
  `component-structure`, `angular-patterns`, `reuse-first` or a rule the task compressed brings the
  refusal «do not fit together» back unseen. **Address:** tree — the probe and its 43 lines as a
  scenario of `tools/tests`, run when a `SKILL.md` or a package rule changes. **Metric:**
  `gate-deny` records with `why: together` on the 43 lines after the merge, 0.
- **Point B of the epic is not reached by this task.** The plan of the epic waits for 0 lines «too
  long» and «do not fit together» in the report. The edits of a task folder (progress, grill,
  plan), `gh pr create`, `gh pr edit`, `gh issue create` and `task:new --epic` are still refused
  «together»: their sets of rules pass 10 000 characters whatever the size of the rules this task
  compresses. 38 of the 39 such records of 20–22.11 are `task-delivery-loop` on these edits and
  commands. **Address:** a decision of the owner: a task of the epic for the delivery of rules in
  parts in `hooks/skill-gate.sh` or an edit of the gate map, or point B narrowed to the 43 lines
  of the probe with the rest named under what the epic does not do. **Metric:** `gate-deny` with
  `why: together`, 29 over 14–21.11, counted apart by the kind of the edit.
- **The meaning check of the task skipped the table of names.** In
  `docs/tasks/RT-3427-long-rules-fit-2/meaning-check.mjs` the section regex ends at `$` under the
  flag `m` and captures an empty table. A fixed copy found two reworded rows of `mockups`; they
  are restored, and the fixed copy gives 0. The step check runs the file committed with the plan,
  so the fix lives only in the copy. **Address:** a meaning check of a later compression takes the
  end of the text as `(?![\s\S])`. **Metric:** none: the check leaves with the task folder.
