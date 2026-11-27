---
name: task-flow-handover
kind: rule
law: work-conduct
description: Rule under the work-conduct law — closing a task: the folder taken apart, the PR opened and readied, the merge. Load before a PR opens, leaves draft or merges. Patterns task-flow-close, -archive.
---
<!-- rt-kit v0.42.0 · rules/task-flow-handover.md · 7f7a77240316 · правится надстройкой, не здесь -->

# Work conduct — closing a task

Rule under the law `docs/constitution/work-conduct.md`. Cold part: `pitfalls.md`; every article whole — `pitfalls-2.md` of `task-flow`.

## How the law applies here

- **The task folder is taken apart by the last commit before the PR opens, not after approval.** The grill goes to the archive, findings to the epic plan, the plan away.
- **After opening the PR, the executor tells the owner the number, what it waits for and what comes next.** A draft waits for the run, a ready PR for the owner's hand.
- **A request to merge never comes before the work is checked.** Where the pipeline wakes for the base: pushed → draft → run green → draft lifted → the request, naming the number. Where it does not wake, the green push gate is the check, and opening the PR and asking to merge are one turn.
- **A PR that waits for a run opens as a draft, and one that waits for nothing opens ready.** The bases the pipeline wakes for are read from its file.
- **Closed work is reviewed by the rules in the background, right after the PR, and its findings wait for the owner.** The next task is taken meanwhile.
- **The cheap closing step goes before the costly one, and the run — after the merge.** The merge is the agreement's into the spec: it, then the texts, then the suite, all before the PR; a run before it checks what will not reach main.
- **The agreement merges into the domain spec by one of the last commits of the branch, before the PR opens.**
- **The folder of a closed task is taken apart, not moved whole.** What explains a decision goes to `docs/archive/`; the rest is deleted.
- **Opening the PR and lifting the draft are refused while the branch carries its task folder.**
- **A branch that removed the folder adds a record to the archive.** The grill goes first — the only record of the owner's words.
- **The bypass is the line `Task-folder-skip: <reason>` in the PR or in the command itself.** An empty reason is no bypass; the work queue audit still names the folder.
