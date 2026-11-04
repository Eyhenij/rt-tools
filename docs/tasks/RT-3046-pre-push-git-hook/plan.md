# Plan

**Task:** RT-3046 · **Branch:** RT-3046-pre-push-git-hook
**Behaviour:** unchanged — an edit of the rules package hooks and texts, no application code;
decided by the owner's epic grill of 03.11.2026.

After it is written this file is not edited. A stage revision goes to `progress.md` as a decision
along the way.

## Task footprint

| What  | Where                                                                                                                                                                                                          |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Specs | `docs/specs/agent-kit/pre-push-hook/` — new subdomain; `docs/specs/agent-kit/push-sign/spec.md` — the out-of-scope line about RT-3046                                                                          |
| Laws  | `docs/constitution/delivery.md` — read, not edited                                                                                                                                                             |
| Rules | none                                                                                                                                                                                                           |
| Code  | `projects/agent-kit/assets/hooks/pre-push.sh` — new; `projects/agent-kit/assets/hooks/git-guard-push-tests.sh` — the mark on green; `projects/agent-kit/tests/pre-push.test.sh` — new; `.husky/pre-push` — new |

## What counts as done

- The installed hook refuses a push on a red set in a scenario of the hooks suite.
- A push whose commit the session guard marked green passes without a second run.
- The layout puts `.claude/hooks/pre-push.sh` into the tree, and `.husky/pre-push` calls it.

## Stages

### 1. The hook and the mark

- **Steps:**
    1. Write the git hook template `pre-push.sh` in the package
    2. Make the session guard write the mark of a green set
    3. Write the scenarios of the hook in a suite of their own
- **Readiness sign:** the new suite is green, the guard suite stays green
- **Verified by:** `bash projects/agent-kit/tests/pre-push.test.sh` — the line with 0 failed

### 2. The spec

- **Steps:**
    1. Write the subdomain `pre-push-hook`: spec, scenarios, binding
    2. Point the out-of-scope line of `push-sign` at the subdomain
    3. Run the spec audit
- **Readiness sign:** the audit names no statement without a binding
- **Verified by:** `pnpm run check:specs` — exit code 0

### 3. Layout and wiring

- **Steps:**
    1. Lay the package out by `pnpm run agent-kit:sync`
    2. Wire the hook by `.husky/pre-push`
    3. Run the whole hooks suite and the gate set
- **Readiness sign:** `.claude/hooks/pre-push.sh` is laid out, the gate set is green
- **Verified by:** `pnpm run agent-kit:check` — the line «разложенное сходится с пакетом»

## What this work does not do

- A refusal of `git push --no-verify` by the session guard: filed as a finding next to the epic
  plan.
- The per-check marks of #3094: the mark here holds one commit and the whole set.
- A hook for trees without husky: the template header names the copy command, as `commit-msg.sh`
  does.
