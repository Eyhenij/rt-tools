# Plan

**Task:** RT-2507 · **Branch:** RT-2507-stylelint-17
**Behaviour:** unchanged — a lint tool dependency; the owner's word «обнови npm пакеты»

After it is written this file is not edited. A stage revision goes to `progress.md` as a decision
along the way.

## Task footprint

| What  | Where                                                                             |
| ----- | --------------------------------------------------------------------------------- |
| Code  | `package.json`, `pnpm-lock.yaml`, `stylelint.config.js`, `tools/stylelint-rules/` |
| Rules | `.claude/skills/dependencies/`, `.claude/skills/styling-bem/`                     |

## What counts as done

- stylelint 17 with its companions stands in the manifest, the tree's own rules fire as before, and
  both style checks are green.

## Stages

### 1. The upgrade

- **Steps:**
    1. Raise `stylelint` to 17.15.0, `stylelint-config-standard` to 40.0.0, `stylelint-scss` to
       7.3.0; rebuild the lock.
    2. Make sure the tree's own rules load and fire; move them to modules only if they do not.
    3. Run both style checks and sort out the new findings by rule name.
- **Readiness sign:** both style checks pass, and a known raw value is refused by the tree's rule.
- **Verified by:** `pnpm run lint:styles` and `pnpm run check:tokens-styles` — green; a scratch
  `.scss` with `color: #fff` refused by `rt/no-hardcoded-design-tokens`.

## What this work does not do

- The other majors of RT-2081.
