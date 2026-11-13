# Grill

## The owner request

> исправляй флоу проверок чтобы не гонять лишнее

> переноси в новый эпик все задачи которые не были сделаны в текущем

The task is the remainder of the first request after RT-3273: the steps the selection still runs on
every change.

## What the tree already has

- The selection by reads: `tools/push-inputs.mjs` and the table `.claude/rt-kit/push-inputs.json`,
  spec `docs/specs/agent-kit/push-gate-ahead/`.
- A step whose reads the record cannot see runs on every change — the rule of that spec. On a branch
  of `docs/plans/*.md` and `.claude/rt-kit/assignments.md` ten steps run for that reason alone:

| Step | Why it runs | Seconds on 13.11 |
| --- | --- | --- |
| `pnpm run agent-kit:check` | starts npm, rimraf | 5 |
| `check-specs` | `git log -- docs/specs` | 5 |
| `check-hooks` | starts bash on a hook file | 11 |
| `check-package-imports` | `npm view`, `npm pack` — the registry | 2–9 |
| `check-kit-approval` | `git diff`, `git log` of the change | 0 |
| `tools/tests/run.sh` | not traceable, selects its own suites | 1 |
| `check-schema-drift` | npx, prisma, the schema engine | 2–3 |
| `check-archive-age` | `git log` — counts days | 1 |
| `check-profile-drift` | `bash -c` sourcing the profile | 0 |
| `check-push-gate` | `bash -c` sourcing the profile | 0 |

## Decisions

- **No hand list of paths per step where the record can see the reads.** The table stays generated;
  a hand line is allowed only where nothing can be traced, and the verify step checks it.
- **`check-archive-age` stays on every change.** It counts days, not files: a record expires
  without a single edit in the tree.
