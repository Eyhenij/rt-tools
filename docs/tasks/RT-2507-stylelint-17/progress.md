# Progress

## Where we stand

- **State:** `этапы-кончились`
- **Stage:** 1 of 1 — the upgrade
- **Done:** stage 1 — stylelint 17 stands, both style checks are green
- **Next step:** take the folder apart and open the PR
- **Uncommitted:** nothing
- **Waiting for the owner:** no
- **PR:** not open yet; the branch stands on RT-2505-eslint-10

## Steps

- [x] 1.1 Raise `stylelint` to 17.15.0, `stylelint-config-standard` to 40.0.0, `stylelint-scss` to
      7.3.0; rebuild the lock.
- [x] 1.2 Make sure the tree's own rules load and fire; move them to modules only if they do not.
- [x] 1.3 Run both style checks and sort out the new findings by rule name.

## Decisions along the way

- **The branch stands on RT-2505.** Both edit the assignment row. Affected stage of the plan: none.

## Sessions

### 2026-10-03

- The task, the branch and the folder are created.
- Raised the three packages. Both rules of the tree load as CommonJS and fire: `color: #fff` in
  the first kit is refused by `rt-tools/no-hardcoded-design-tokens`, `:host` in the second kit by
  `rt-tools/no-host-selector`. `lint:styles` and `check:tokens-styles` are green, no new findings.
