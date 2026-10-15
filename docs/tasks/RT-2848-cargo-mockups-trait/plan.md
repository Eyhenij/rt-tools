# Plan

**Task:** RT-2848 · **Branch:** RT-2848-cargo-mockups-trait
**Behaviour:** unchanged — a new optional trait of the package; no application behaviour moves, and trees that do not name the trait get nothing new.

## Task footprint

| What  | Where                                                                                                                                         |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Specs | `docs/specs/agent-kit/rule-gate/` (the design-tool call kind), `docs/specs/agent-kit/layout/` (a declared trait)                              |
| Laws  | a new law `projects/agent-kit/assets/laws/mockups.needs-mockups.md`                                                                           |
| Rules | a new rule `projects/agent-kit/assets/rules/mockups.needs-mockups.md`                                                                         |
| Code  | `projects/agent-kit/assets/traits.json`, `hooks/skill-gate.sh`, `defaults/gate-map.sh`, a pattern `patterns/mockups-measure.needs-mockups.md` |

## What counts as done

- The trait `mockups` is declared, and the law, the rule and the pattern carry the seven records.
- A tree that does not name the trait gets none of the new files; a tree that names it gets all.
- The gate asks for the rule `mockups` on a design-tool call and stays silent where the tree lacks the rule.
- The layout audit, the boundary check and the package suites are clean.

## Stages

### 1. The trait and its texts

- **Steps:**
    1. Declare the trait `mockups` in `traits.json`.
    2. Write the law `mockups` with the two articles.
    3. Write the rule `mockups` with the articles of the kit copy, the spec before the first frame and the agreement against the mockups.
    4. Write the pattern `mockups-measure` with the measurement by node coordinates.
- **Readiness sign:** the four resources stand in the package.
- **Verified by:** `node tools/check-file-size.mjs` — no file longer than the limit.

### 2. The gate

- **Steps:**
    1. Add the design-tool call to the matcher and a `design` branch to `skill-gate.sh`.
    2. Add the `design` kind to `defaults/gate-map.sh`.
    3. Write the scenario and the test.
- **Readiness sign:** the gate refuses a design-tool call until the rule is loaded, and passes it where the rule is absent.
- **Verified by:** `pnpm run agent-kit:hooks` — the new scenario passes.

### 3. Layout and gate

- **Steps:**
    1. Lay the package out into the tree and check the boundary.
    2. Run the checks of the package and the tree.
- **Readiness sign:** the layout audit is clean.
- **Verified by:** `pnpm run agent-kit:check` — exit code 0.

## What this work does not do

- Edits of the overrides of the neighbouring trees: those files are theirs.
- The other records of the epic: tasks RT-2845, RT-2846 and RT-2847.
