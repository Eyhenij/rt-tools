# Binding — a conflicting request of one's own

A statement of the spec and the place where it is carried out. The link goes by the text of the
statement: a removed statement is removed together with its line.

- **Taking new work is refused while at least one open request of one's own is marked conflicting.** — `projects/agent-kit/assets/hooks/git-guard-delivery-conflict.sh:rt_delivery_conflict`
- **Four commands count as work: creating a task, creating a branch for a task, moving the column into work and opening a request.** — `projects/agent-kit/assets/hooks/git-guard-delivery-conflict.sh:taking`
- **Fixing a conflict is refused by nothing.** — **Not checked** by a sign of its own. Only the named list of commands is refused; everything else the guard lets through silently.
- **Only a plain "conflicts" is judged.** — `projects/agent-kit/assets/checks/board.github.mjs:conflictingPulls`
- **The requests of the machine record of the tree count as one's own.** — `projects/agent-kit/assets/checks/board.github.mjs:conflictingPulls`
- **The refusal names the number and the branch of every conflicting request.** — `projects/agent-kit/assets/hooks/git-guard-delivery-conflict.sh:listed`
- **A branch without a task number does not count as taking work.** — `projects/agent-kit/assets/hooks/git-guard-delivery-conflict.sh:taking`
- **Moving a column is judged together with the name of the column.** — `projects/agent-kit/assets/hooks/git-guard-delivery-conflict.sh:taking`
- **Silence of the poll refuses no work.** — `projects/agent-kit/assets/defaults/project.sh:rt_conflicting_pulls_default`
