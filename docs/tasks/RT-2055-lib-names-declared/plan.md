# Plan

**Task:** RT-2055 · **Branch:** RT-2055-lib-names-declared
**Behaviour:** unchanged — the work edits the checks of the rules package; no application code is
touched, and the owner ordered the whole epic as a walk over the intake.

## Task footprint

| What  | Where                                                                                                                                                          |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Specs | `docs/specs/agent-kit/layout/`                                                                                                                                 |
| Rules | `.claude/skills/lib-layers/`                                                                                                                                   |
| Code  | `projects/agent-kit/assets/checks/lib-common.mjs`, `projects/agent-kit/assets/checks/lib-manifests.mjs`, `projects/agent-kit/assets/checks/lib-boundaries.mjs` |
| Tests | `projects/agent-kit/tests/checks-lib-layers.test.sh`                                                                                                           |
| Plan  | `docs/plans/cargo-intake.md` — row 11 of the makeup                                                                                                            |

## What counts as done

- The name, the tag and the import alias of a lib are read from what the tree declared, and the
  formula over the path is used only where the tree declared nothing.
- A lib named otherwise than the formula would name it gives no divergence, and it needs no line in
  the exceptions list.
- A lib that declared no name at all still gets a verdict, and the verdict names what the name must
  become.
- `docs/specs/agent-kit/layout/` names the new behaviour by articles, bindings and a scenario, and
  the scenario has probes with its number in the title.
- The cargo record is marked in the intake with the text of what closed it, and row 11 of the epic
  plan names the state of this work.

## Stages

### 1. The audit reads the declared name, tag and alias

- **What is done:** `lib-common.mjs` gains the reading of the declared name and of the alias that
  points at the lib; the formula stays as the fallback and as the wording of the verdict for a lib
  that declared nothing. `lib-manifests.mjs` and `lib-boundaries.mjs` are moved onto the read
  values.
- **Readiness sign:** a lib whose declared name differs from the formula gives no divergence, and
  one without a declared name is named by the formula.
- **Verified by:** `bash projects/agent-kit/tests/checks-lib-layers.test.sh` — the last line says no
  failures, and the count of probes is higher than the 10 standing there now.

### 2. The spec of the layout names the new behaviour

- **What is done:** the articles about the declared names, their bindings in the companion and the
  scenario in `docs/specs/agent-kit/layout/`; the rule of lib layers gains the article about the
  same, since the tree reads its names from the rule.
- **Readiness sign:** the scenario is counted as covered, and the audit sees no article without a
  binding.
- **Verified by:** `npm run check:specs` — the `layout` area has no divergences and the scenario
  count is higher by one.

### 3. Delivery: layout, checks, the intake and the makeup

- **What is done:** the package is built and laid out, the whole set of checks is run, the cargo
  record is marked, row 11 of the epic plan is corrected, the folder is taken apart into the
  description of the past and the PR opens as a draft.
- **Readiness sign:** the laid-out files match the package and the checks are green.
- **Verified by:** `pnpm run agent-kit:check && npm run check:specs && npm run check:docs && node tools/check-file-size.mjs`
  — every one of the four says no divergences.

## What this work does not do

- It does not touch how a domain's layers are named: the formula for a layer directory is a
  separate matter, and no cargo record speaks of it.
- It does not remove the exceptions list of the lib audit: entries were added there for other
  reasons too, and each is reviewed by the owner.
