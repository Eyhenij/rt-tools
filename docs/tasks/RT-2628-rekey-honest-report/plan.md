# Plan

**Task:** RT-2628 · **Branch:** RT-2628-rekey-honest-report
**Behaviour:** unchanged — «делай работу»: a tool of the tree, not application code; what it writes to the database stays the same

## Task footprint

| What  | Where                                                                |
| ----- | -------------------------------------------------------------------- |
| Specs | `docs/specs/message-bus/people-transfer/`                            |
| Laws  | `docs/constitution/verifiability.md`                                 |
| Rules | `.claude/skills/testing/`                                            |
| Code  | `tools/bus-people-transfer.lib.mjs`, `tools/bus-people-transfer.mjs` |

## What counts as done

- The rewrite names how many operators got Keycloak keys, read from the `psql` answer.
- Zero changed rows is named as «nothing rewritten», not as success.

## Stages

### 1. Honest report

- **Steps:**
    1. Add the report function to the library and call it from the command
    2. Add the scenario to the spec and its line to the implementation table
    3. Cover the scenario in the transfer test
- **Readiness sign:** the transfer test is green with the new scenario
- **Verified by:** `bash tools/tests/bus-people-transfer.test.sh` — no failed line

### 2. Delivery

- **Steps:**
    1. Run the gate set and open the PR into main
- **Readiness sign:** the PR is open with a reviewer
- **Verified by:** `/opt/homebrew/bin/gh pr view --json number` — the PR number

## What this work does not do

- Reading the production operator table — the owner runs the read; the classifier refuses it to
  the session.
