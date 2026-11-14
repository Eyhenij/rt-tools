# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 1 of 4 — the package and its build are gone
- **Done:** the epic branch with the plan, the task branch, the task folder
- **Next step:** remove `projects/ui-kit` and its build
- **Uncommitted:** no
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- `[x]` done · `[>]` going on right now · `[ ]` not begun

- [>] 1.1 Remove `projects/ui-kit`, `docs/specs/ui-kit` and the first kit's publish workflow
- [ ] 1.2 Remove the first kit from `tsconfig.base.json`, `package.json`, the linters and the version scripts
- [ ] 1.3 Remove the first kit's snapshot step from the pipeline
- [ ] 1.4 Rebuild the lockfile
- [ ] 2.1 Remove the first kit from the tree profile and the checks settings
- [ ] 2.2 Remove the first kit from the tools, their allowlists and signals
- [ ] 2.3 Bring the scenarios of the tools and of the rules package up to date
- [ ] 3.1 Bring the rules of this tree and the overrides up to date
- [ ] 3.2 Bring `README.md`, `CLAUDE.md` and the documents up to date
- [ ] 4.1 Run `pnpm run check:all`
- [ ] 4.2 Run the push set

## Decisions along the way

## Sessions

### 2026-11-14

- The epic branch `RT-3232-remove-ui-kit-v1` is taken from main with the plan and pushed.
