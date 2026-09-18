# The findings of the epic RT-2240

The findings accumulate here while the epic "Sorting out the intake cargo: the records of
September" goes: the owner reads them at once when the epic is over and says which of them are
right. The file lies next to the plan of the epic, `docs/plans/cargo-triage-september.md`.

## RT-2242 — the lib check reads a list of backend families

- **The free scenario number command compares the numbers as strings.** With SC-AK-1130 taken it
  names SC-AK-1000 as the next free one: a four-digit number sorts below a three-digit one by
  characters. The number was taken by a search over every remote branch instead. **Address:** the
  names of this tree — `tools/spec-next-id.mjs` sorts by numeric value.
- **The check run from the package sources answers with a skip, not with the tree's result.** From
  `projects/agent-kit/assets/checks/` the config helper does not find the tree settings and reads
  the package defaults; the readiness sign of a stage is taken from the laid-out copy in `tools/`.
  **Address:** the names of this tree — the plan template names the laid-out copy as the command.
- **The work queue audit reads every `#<number>` in the epic plan as a task of the epic.** The
  line «влита, PR #2247» in the makeup table was named as a task that is not a sub-issue of the
  card; the PR number is written without the hash instead. **Address:** rules layer —
  `checks/board-gh.github.mjs` reads the task numbers from the makeup table, not from the whole
  text of the plan.
- **The work queue audit asks the epic branch for a task folder.** «RT-2240-cargo-triage-september:
  the task folder never travelled into the branch» stands in every run while the epic goes; the
  epic branch carries no folder by the rule. **Address:** rules layer — the audit knows the epic
  branch by the plan line, the same way the exit guard does since 0.29.0.

## RT-2245 — the board field mutation is named in the texts

- **The cold part of the delivery rule for this hosting stands at the length limit.** Its laid-out
  copy holds 329 lines of the 330 allowed: one more pitfall took the push gate down, and the case of
  the board mutation stayed in the tree's companion alone. **Address:** rules layer — the cold part
  `pitfalls/git-workflow.github.md` is split before the next record.

## RT-2246 — the grill closes questions by assumption, the turn does not end on a launch

- **The epic-stop guard refuses the switch to the epic branch for the epic's own request.** With
  every task merged, `git checkout <epic branch>` is read as taking new work, while the rule names
  the request of the epic into the main branch as the mandatory action of that state. The switch went
  through by the bypass line. **Address:** rules layer — the guard lets through a switch to the
  branch of the finished epic and a request opened from it.
- **The guard of the end of a turn is at its length limit, and its tiers land in the file of the
  epic tiers.** Two tiers in a row went to `turn-exit-epic.sh` for want of room, and the file name
  no longer says what lies in it. **Address:** rules layer — the state tiers move to a file of their
  own before the next one.
- **The clean-database step of the pipeline reads the container as ready before the server is.**
  `pg_isready` answers on the temporary server the image starts for its first setup, and the
  schema check then gets a reset connection: `read ECONNRESET` on the request of the epic, green on
  the five task requests minutes before. **Address:** this tree — the step waits for a real query to
  answer, not for the readiness probe.
