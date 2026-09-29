# Plan

**Task:** RT-2395 · **Branch:** RT-2395-ui-kit-v2-accordion
**Draft:** `docs/specs/ui-kit-v2/proposed/accordion/`
**Behaviour:** changes

After it is written this file is not edited. A stage revision goes to `progress.md` as a decision
along the way.

## Task footprint

| What  | Where                                                                                                                                                 |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/accordion/` — a new subdomain; `docs/specs/ui-kit-v2/spec.md` — the table of subdomains                                         |
| Laws  | `docs/constitution/frontend-application.md`, `docs/constitution/reuse-first.md`, `docs/constitution/verifiability.md`                                 |
| Rules | `.claude/skills/component-structure/`, `.claude/skills/rt-tools-styling/`, `.claude/skills/rt-tools-storybook/`, `.claude/skills/ui-component-tests/` |
| Code  | `projects/ui-kit-v2/src/lib/components/accordion/`, `projects/ui-kit-v2/src/lib/components/index.ts`, `projects/ui-kit-v2/README.md`                  |

## What counts as done

- `rt-accordion` is exported by the package: a consumer imports `RtAccordionComponent` from `@rt-tools/ui-kit-v2`.
- Items open independently; the item named by `openIndex` is open on the first render, the first by default, none with `null`.
- The heading is a button with `aria-expanded` and `aria-controls`, the panel is a region labelled by it; every interactive element carries `qa-dataid`.
- The subdomain spec names the rules, each bound to code, and every scenario is covered by a test.
- The showcase has `Playground` and the state matrices in both presets and both themes, with snapshot references.

## Stages

### 1. The agreement and the component

- **Steps:** 0. Write the agreement in `docs/specs/ui-kit-v2/proposed/accordion/`: `spec.md`, `scenarios.md` from the number `pnpm run spec:next-id UKV` gives, `implementation.md`.
    1. Write the open-state decision as pure functions with a unit test.
    2. Write the component in three files with the BEM block on the host and styles in the kit's components layer.
    3. Write the component spec and export the component from the package barrel.
- **Readiness sign:** the package tests and lint pass with the new files.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=accordion` — every accordion test passed, none failed.

### 2. The subdomain spec

- **Steps:**
    1. Merge the agreement into the subdomain `docs/specs/ui-kit-v2/accordion/` and remove `proposed/accordion/`.
    2. Add the subdomain to the tables of `docs/specs/ui-kit-v2/spec.md` and `scenarios.md`, and the family to `projects/ui-kit-v2/src/lib/components/CONTEXT.md`.
    3. Put the scenario numbers into the test titles.
- **Readiness sign:** the spec check reports no divergences for the subdomain.
- **Verified by:** `pnpm run check:specs` — no line naming `accordion`.

### 3. The showcase

- **Steps:**
    1. Write `CONTEXT.md` and `Overview.mdx`.
    2. Write the `Playground` story and the state matrices with their wrappers.
    3. Shoot the snapshot references for the new stories and read them by eye.
- **Readiness sign:** the stories render and the snapshot suite is green on them.
- **Verified by:** `pnpm run test:visual:v2` — the new stories pass against their references.

### 4. The hand-in

- **Steps:**
    1. Run the push check set.
    2. Take the task folder apart and open the PR.
- **Readiness sign:** the push gate is green and the PR is open with a reviewer.
- **Verified by:** `pnpm run check:all` — exits zero.

## What this work does not do

- Publishing a new version of the package: a separate manual run, decided by the owner after the merge.
- A mode where opening one item closes the others: nobody asked for it.
