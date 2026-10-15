# Plan

**Task:** RT-2847 · **Branch:** RT-2847-cargo-ceiling
**Behaviour:** unchanged — texts of a rule and a pattern of the package; no application behaviour moves.

## Task footprint

| What  | Where                                                           |
| ----- | --------------------------------------------------------------- |
| Specs | none: the texts are the subject of no spec scenario             |
| Laws  | none                                                            |
| Rules | `projects/agent-kit/assets/rules/task-flow.md`                  |
| Code  | pattern `projects/agent-kit/assets/patterns/task-flow-start.md` |

## What counts as done

- Each of the four records has its item in the nearest existing section.
- Neither file crosses the prose limit; the layout audit is clean; no statement of the compressed texts is lost.

## Stages

### 1. Compress the pattern and add its three items

- **Steps:**
    1. Fold history and repeated argument in `task-flow-start.md`.
    2. Add the identifier search item to the exploration step.
    3. Add the menu answer item after the answers code block.
    4. Add the executor decision check to the `разбор-закрыт` section.
- **Readiness sign:** the three items stand and the file is under the limit.
- **Verified by:** `node tools/check-file-size.mjs` — no file longer than the limit.

### 2. Compress the rule and add its item

- **Steps:**
    1. Fold one argument in `task-flow.md`.
    2. Add the item about every agreement rule becoming a step after the stages article.
- **Readiness sign:** the item stands and the file is under both limits.
- **Verified by:** `node tools/check-file-size.mjs` — no file longer than the limit.

### 3. Layout and gate

- **Steps:**
    1. Lay the package out into the tree.
    2. Run the checks of the package and the tree.
- **Readiness sign:** the layout audit is clean.
- **Verified by:** `pnpm run agent-kit:check` — exit code 0.

## What this work does not do

- Other texts of rules and patterns: task RT-2846.
- Design-tool texts: task RT-2848.
