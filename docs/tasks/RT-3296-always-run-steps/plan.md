# Plan

**Task:** RT-3296 · **Branch:** RT-3296-always-run-steps
**Behaviour:** unchanged — the owner's word «исправляй флоу проверок чтобы не гонять лишнее»: only the selection of push steps changes, no application code

## Points

- **A:** on a change of texts alone ten steps of the push set run, about 30 s, because the
  selection cannot see what they read.
- **This task reaches:** a push of texts alone runs none of the ten except `check-archive-age`.
- **Sign:** `rt_push_checks origin/main | rt_push_select origin/main` on this branch — lines «→» for
  the ten steps.
- **Milestone G of the epic:** an epic reaches `main` without repeated questions and false refusals.
- **Metric:** steps run without a reason file on a texts-only push: 10 now, down to 1.

## Task footprint

| What  | Where |
| ----- | ----- |
| Specs | `docs/specs/agent-kit/push-gate-ahead/` |
| Rules | `.claude/skills/agent-kit-source/` |
| Code  | `projects/agent-kit/assets/checks/push-inputs.mjs`, `projects/agent-kit/assets/checks/push-trace.mjs` |
| Table | `.claude/rt-kit/push-inputs.json` |
| Tests | `projects/agent-kit/tests/push-inputs.test.sh` |

## What counts as done

- On this branch the selection runs none of the ten steps except `check-archive-age`, and names
  «counts days» as its reason.
- A change of `docs/specs/**` still runs `check-specs`; a change of `.claude/hooks/*.sh` still runs
  `check-hooks`; a change of `prisma/schema.prisma` still runs `check-schema-drift`.
- The push set on this branch is green.

## Stages

### 1. Children the tracer followed count as traced

- **Steps:**
    1. The tracer writes the parent pid next to its record
    2. A spawn whose child left a record is read through the child, not named untraced
    3. A native binary started by a traced node child counts as reading the files its parent passed
- **Readiness sign:** `agent-kit:check` and `check-schema-drift` lose the line «whose reads are not
  seen»; `check-schema-drift` names `prisma/` as what it reads.
- **Verified by:** `node tools/push-inputs.mjs record` then the selection command above.

### 2. git with a path reads that path

- **Steps:**
    1. `git log` and `git diff` with `-- <path>` read that path as a walk
    2. `git diff --name-only` of the change reads the files of the change the step then opens
- **Readiness sign:** `check-specs` runs only on `docs/specs/**` and the files it walks;
  `check-kit-approval` runs only when the change touches what it filters.
- **Verified by:** the selection command above and `bash projects/agent-kit/tests/push-inputs.test.sh`.

### 3. A shell started on a tree file reads that file

- **Steps:**
    1. `bash <file>` and `bash -c` with `. <file>` read those files and the files they source
    2. `npm view` and `npm pack` read the registry, not the tree
- **Readiness sign:** `check-hooks`, `check-profile-drift`, `check-push-gate` and
  `check-package-imports` do not run on this branch.
- **Verified by:** the selection command above.

### 4. Closing

- **Steps:**
    1. The spec of the push gate names the three new readings, with scenarios and tests
    2. The table is recorded anew on a green tree
    3. The push set runs green on this branch
- **Readiness sign:** the selection on this branch leaves `check-archive-age` alone of the ten.
- **Verified by:** `bash .claude/hooks/git-guard-push-ahead.sh` — «the set is green».

## What this work does not do

- `tools/tests/run.sh` is not traced: it selects its own suites and takes 1 s.
- `check-archive-age` stays on every change: it counts days.
- Snapshots of touched stories only, end-to-end suites by loaded code, limits for the steps without
  one — separate tasks of epic RT-3293.
