# Plan

**Task:** RT-2793 · **Branch:** RT-2793-v2-index-missing-stories
**Behaviour:** unchanged — only a check tool of the tree changes; the showcase and the kit stay as they are.

After it is written this file is not edited. A stage revision goes to `progress.md` as a decision
along the way.

## Task footprint

| What  | Where                                                                                             |
| ----- | ------------------------------------------------------------------------------------------------- |
| Rules | `.claude/skills/ui-component-tests/`                                                              |
| Code  | `tools/visual-snapshots-v2.mjs`, `tools/showcase-probe.mjs`, `tools/tests/showcase-probe.test.sh` |

## What counts as done

- A reference whose story is missing from the index makes the check of the second kit refuse
  before the run, naming the missing story ids.
- A bounded number of re-reads of the index comes first, so a late index does not refuse.
- The pure part has scenarios in `tools/tests/showcase-probe.test.sh`, and they pass.

## Stages

### 1. Index against references

- **Steps:**
    1. Add the pure matching of references to the story ids of the index
    2. Make the check read the index again before it refuses
    3. Write the scenarios of the pure part
    4. Run the scenarios and the tree set

- **Readiness sign:** an index with a story missing is refused with its id, and a full index passes.
- **Verified by:** `bash tools/tests/showcase-probe.test.sh` — every scenario reports ok.

## What this work does not do

- Finding why the showcase loses stories at all — the index builder is Storybook's.
