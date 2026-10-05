# Plan

**Task:** RT-2537 · **Branch:** RT-2537-anchors-js-barrel
**Spec:** `docs/specs/agent-kit/checks/`
**Behaviour:** changes

After it is written this file is not edited. A stage revision goes to `progress.md` as a decision
along the way.

## Task footprint

| What  | Where                                                             |
| ----- | ----------------------------------------------------------------- |
| Specs | `docs/specs/agent-kit/checks/`, `docs/specs/auth/contract/`       |
| Rules | `.claude/skills/spec-driven/`, `.claude/skills/agent-kit-source/` |
| Code  | `projects/agent-kit/assets/checks/spec-anchors.mjs`               |

## What counts as done

- The anchor audit reads a `.js` import of a barrel as its `.ts` source.
- Scenario SC-AK-1187 is named in the suite, and the suite passes.
- The four rules of the contract are bound to their functions again, and the spec audit is green.

## Stages

### 1. Check

- **Steps:**
    1. Fix the published files reading
    2. Add the suite probe of SC-AK-1187
    3. Lay the package out
- **Readiness sign:** the suite passes, and the laid-out check matches the source.
- **Verified by:** `bash projects/agent-kit/tests/checks-specs-roots.test.sh` — no failed line.

### 2. Contract bindings

- **Steps:**
    1. Bind the four rules of the contract to their functions
    2. Run the spec audit
- **Readiness sign:** the spec audit is green.
- **Verified by:** `npm run check:specs` — no divergence.

## What this work does not do

- Other import forms the audit does not follow — none found in the tree.
