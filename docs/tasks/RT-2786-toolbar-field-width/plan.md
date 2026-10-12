# Plan

**Task:** RT-2786 · **Branch:** RT-2786-toolbar-field-width
**Spec:** `docs/specs/ui-kit-v2/spec.md`
**Behaviour:** changes

## Task footprint

| What  | Where                                            |
| ----- | ------------------------------------------------ |
| Specs | `docs/specs/ui-kit-v2/spec.md`                   |
| Rules | `.claude/skills/rt-tools-styling/`               |
| Code  | `projects/ui-kit-v2/src/lib/components/toolbar/` |

## What counts as done

- A field in the left bar of the toolbar is 400px wide on a wide toolbar and never wider than the
  bar.
- The toolbar frames match their references unchanged.

## Stages

### 1. The field width

- **Steps:**
    1. Add the field width property and the left bar field rule to the toolbar styles
    2. Write the article into the toolbar description and the line into the kit spec history
    3. Run the styles linter, the token check and the toolbar tests
- **Readiness sign:** all three end without findings.
- **Verified by:** `pnpm run lint:styles` — no findings; `pnpm run check:tokens-styles` — no new
  findings; `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=src/lib/components/toolbar` — green

### 2. The showcase frames

- **Steps:**
    1. Match the showcase frames against their references
- **Readiness sign:** no frame differs.
- **Verified by:** `node tools/visual-gate.mjs ui-kit-v2` — every frame matches

## What this work does not do

- The center bar keeps its own stretching rule.
