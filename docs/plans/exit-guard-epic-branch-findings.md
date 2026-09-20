# The findings of the epic RT-2228

The findings accumulate here while the epic "The exit guard does not know the epic branch and the
end of the epic" goes: the owner reads them at once when the epic is over and says which of them
are right. The file lies next to the plan of the epic, `docs/plans/exit-guard-epic-branch.md`.

## RT-2229 — the exit guard knows the epic branch by the plan

- **The rule `turn-conduct` stands fourteen characters under the length limit.** Two articles were
  extended by cutting their own argument; the next article of any size needs a cold part next to
  the rule. **Address:** rules layer — the incident analyses of the rule leave for `pitfalls.md`.
- **The prose guard reads a laid-out path inside a command text as an edit of that file.** A
  companion line naming a hook was refused by the edit-location guard although the command edited
  the companion alone. **Address:** rules layer — the guard judges the files the command writes,
  not every path in its text.

## RT-2230 — the end of an epic releases the whole turn

- **The epic table cannot read the epic from the epic branch itself.** Called without a number, it
  takes the branch number as a task and looks for the line «Задача эпика» in its body; on the epic
  branch the number is the epic, and the table answers «задача #2228 не объявляет эпика» with a
  non-zero code. So the reading of the end of an epic, shared by three guards, is «unreadable» on
  the one branch where the stop at the end of the epic happens, and the exit guard refused that
  stop on `RT-2228-exit-guard-epic-branch` right after both tasks merged. The release works on the
  task branches of the epic. **Address:** rules layer — `checks/epic-table.github.mjs:epicAsked`
  reads the epic label of the issue: an issue carrying it is the epic itself.
- **The scenario of the closed epic is green on a stub and red on the real table.** The suite
  substitutes the table by a double; nothing in the suite calls the real reading on an epic branch.
  **Address:** rules layer — a scenario of the epic-stop subdomain on the reading from an epic
  branch.

## Left unresolved

- **The epic table on the epic branch** — becomes a task of its own by the owner's word; the plan of
  this epic named the table as not edited.
