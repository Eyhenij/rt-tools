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
