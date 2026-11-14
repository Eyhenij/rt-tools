# Progress

## Where we stand

- **State:** `задача-взята`
- **Stage:** 0 of 3 — the plan is written and waits for the roles and the owner's approval
- **Done:** task returned to the epic by the owner's word «Верни в эпик», branch from the epic
  branch, board column; the knip findings are sorted: 81 to remove, 15 to declare, 21 public API
- **Next step:** the roles `product-strategist` and `goal-critic` on the plan, then the owner's
  approval
- **Uncommitted:** `plan.md` — it is committed after the owner's approval
- **Waiting for the owner:** the approval of the plan
- **PR:** not open yet

## Steps

- [>] 1.1 Name the entry points of the kit in `knip.json`: `src/public-api.ts`, `src/rich-editor/public-api.ts`, `src/lib/core.ts`, `src/lib/components/*/index.ts`
- [ ] 1.2 Declare the lib barrels, the storage client types, the six used packages, `graphify` and the editor duplicate in `knip.json`
- [ ] 1.3 Name the three kit files the approval check guards in `knip.json` with the reason
- [ ] 1.4 Move the `.storybook` type imports from `playwright` to `@playwright/test`
- [ ] 2.1 Remove `express` and the 14 dev packages from `package.json` and the lockfile
- [ ] 2.2 Rewrite the three rule texts that name `@faker-js/faker`
- [ ] 3.1 Delete `projects/ui-kit-v2/src/lib/components/index.ts`, `hooksSectionByMatcher` and `TTreeCommandKind`
- [ ] 3.2 Drop `export` from the in-file exports and types outside the three guarded kit files

## Decisions along the way

## Sessions

### 2026-11-14

- Task RT-3310 returned to epic RT-3232 by the owner's word; main merged into the epic branch
  (`4421b9389`), the full push set green, the epic branch pushed.
- The findings were sorted by an exploration session against the tree: every file, package and
  export named with the place that uses it or the reason it is safe to drop.
