# Plan

**Task:** RT-2762 · **Branch:** RT-2762-changelog-split-off-by-one
**Behaviour:** unchanged — the owner asked to fix the release tooling; no application code is touched

## Task footprint

| What  | Where                                      |
| ----- | ------------------------------------------ |
| Specs | `docs/specs/agent-kit/checks/scenarios.md` |
| Code  | `tools/changelog-split.mjs`                |
| Tests | `tools/tests/changelog-split.test.sh`      |

## What counts as done

- A journal that becomes longer than the limit only after formatting is split by the release
  commit, and the split parts do not change under the commit hook.

## Stages

### 1. The split counts the formatted journal

- **Steps:**
    1. Format the journal with prettier before counting and write both parts formatted
    2. Cover SC-AK-680 by a test set over a one-off tree
- **Readiness sign:** the new set is green, and it fails on the former script
- **Verified by:** `bash tools/tests/changelog-split.test.sh` — `0 failures`

## What this work does not do

- The release workflows are not edited: they already call the script.
