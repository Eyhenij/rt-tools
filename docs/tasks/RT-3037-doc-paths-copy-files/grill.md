# Grill

## The owner request

> tools/doc-paths-allowlist.json:33/37: две записи под RT-2994 к задаче не относятся.
> Убери их; если путь мёртв из-за общего правила дерева — вынеси отдельной задачей, не
> закрывай чужим номером.

## What the tree already has

- `tools/check-doc-paths.mjs:existsInTree` judges an address under a root directory (`.claude/…`)
  by `existsSync`, and the rest by the list from `git ls-files --cached --others
--exclude-standard`. Both answer by the disk of whoever runs the check: in a named copy
  `.claude/rt-kit/tree-name` exists, in a fresh copy and on the runner it does not.
- `tools/check-doc-paths.mjs:droppedByGit` already asks `git check-ignore --stdin`, but only about
  the documents themselves: a draft covered by `.gitignore` is not judged. The addresses named
  inside the documents are not asked.
- `.gitignore` covers both addresses: line 52 is `.claude/rt-kit/tree-name`, line 83 is
  `.claude/handoff/`.
- The addresses are named by `.claude/skills/task-flow/implementation.md`,
  `.claude/skills/turn-entry/implementation.md`, `.claude/skills/turn-conduct/implementation.md`
  and `.claude/skills/autonomous-work/implementation.md`.
- In the branch of PR #3014 both entries of `tools/doc-paths-allowlist.json` already carry
  `"task": "RT-3037"` with a reason each. That branch is not merged: the owner forbade merging it
  on 31.10.2026. In `main` neither entry stands under this number.

- Measured on 2026-11-02 in a fresh detached copy of `origin/main`, where neither file exists:
  `node tools/check-doc-paths.mjs` gives five divergences — `.claude/rt-kit/assignments.md:6`,
  `.claude/skills/task-flow/implementation.md:151` and `:152`,
  `.claude/skills/turn-conduct/implementation.md:81`, `.claude/skills/turn-entry/implementation.md:8`.
  All five name one of the two addresses; the copy with both files is green.

## What the rules already say

- The rule `testing`: a line is not added to the known list for a red check; every entry carries
  its own reason and the number of the task that added it.
- The issue names two ways out: both lines in the list under this number with a reason, or the
  check telling a working-copy file outside history from a dead address.

## Questions and answers

## Decisions

- **Both addresses stay in the known list under RT-3037, each with its own reason; the check is not
  taught to pass ignored addresses.** The rules hold no answer on the matter, and the question gate
  refused the question to the owner, so the recommended way is taken. Two lines keep the check as
  strict as it is. Rejected: passing every address covered by `.gitignore` — the check would then
  also pass a dead link into build output, which `.gitignore` covers too. The price: a third file of
  a working copy outside history needs a line of its own.
